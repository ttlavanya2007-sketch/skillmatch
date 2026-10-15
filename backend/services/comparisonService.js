import { Readable } from "node:stream";
import mongoose from "mongoose";
import ComparisonRequest from "../models/ComparisonRequest.js";
import { createHttpError, getResumeFilename } from "../utils.js";
import { analyzeResume } from "./geminiService.js";

function storeResume(bucket, file, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType: "application/pdf" },
    });
    uploadStream.once("error", reject);
    uploadStream.once("finish", () => resolve(uploadStream.id));
    Readable.from([file.buffer]).pipe(uploadStream);
  });
}

export async function createComparisonRequest(bucket, file, jobDescription) {
  if (!bucket) {
    throw createHttpError(503, "Resume storage is not available.");
  }

  const resumeFilename = getResumeFilename(file.originalname);
  let resumeFileId;
  let comparison;
  try {
    resumeFileId = await storeResume(bucket, file, resumeFilename);
    comparison = await ComparisonRequest.create({
      resumeFileId,
      resumeFilename,
      jobDescription,
      status: "processing",
    });
  } catch (error) {
    if (resumeFileId) {
      try {
        await bucket.delete(new mongoose.Types.ObjectId(resumeFileId));
      } catch (cleanupError) {
        console.error("Failed to remove an orphaned resume from GridFS.", cleanupError);
      }
    }
    throw error;
  }

  try {
    comparison.analysis = await analyzeResume({ file, jobDescription });
    comparison.status = "completed";
    await comparison.save();
    return comparison;
  } catch (error) {
    comparison.status = "failed";
    try {
      await comparison.save();
    } catch (saveError) {
      console.error("Failed to persist the resume analysis failure status.", saveError);
    }
    throw error.status ? error : createHttpError(502, "Resume analysis failed. Try again later.", { cause: error });
  }
}
