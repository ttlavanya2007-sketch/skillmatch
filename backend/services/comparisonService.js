import { Readable } from "node:stream";
import mongoose from "mongoose";
import ComparisonRequest from "../models/ComparisonRequest.js";
import { createHttpError, getResumeFilename } from "../utils.js";

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
  try {
    resumeFileId = await storeResume(bucket, file, resumeFilename);
    return await ComparisonRequest.create({
      resumeFileId,
      resumeFilename,
      jobDescription,
      status: "pending_ai",
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
}
