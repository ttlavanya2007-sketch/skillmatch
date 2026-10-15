import { Readable } from "node:stream";
import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import ComparisonRequest from "../models/ComparisonRequest.js";

const router = Router();
const maxResumeBytes = 10 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxResumeBytes, files: 1, fields: 1 },
  fileFilter(_request, file, callback) {
    const hasPdfExtension = /\.pdf$/i.test(file.originalname);
    const hasPdfMimeType = ["application/pdf", "application/octet-stream"].includes(file.mimetype);
    if (!hasPdfExtension || !hasPdfMimeType) {
      callback(Object.assign(new Error("Upload a PDF resume."), { status: 400 }));
      return;
    }
    callback(null, true);
  },
});

function getResumeFilename(originalName) {
  const filename = originalName.split(/[\\/]/).pop().replace(/[\u0000-\u001f]/g, "").slice(0, 180);
  return filename || "resume.pdf";
}

function storeResume(bucket, file) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(getResumeFilename(file.originalname), {
      metadata: { contentType: "application/pdf" },
    });
    uploadStream.once("error", reject);
    uploadStream.once("finish", () => resolve(uploadStream.id));
    Readable.from([file.buffer]).pipe(uploadStream);
  });
}

router.post("/", upload.single("resume"), async (request, response) => {
  const jobDescription = typeof request.body.jobDescription === "string"
    ? request.body.jobDescription.trim()
    : "";
  if (!jobDescription) {
    response.status(400).json({ message: "A job description is required." });
    return;
  }
  if (jobDescription.length > 20000) {
    response.status(400).json({ message: "The job description must be 20,000 characters or fewer." });
    return;
  }
  if (!request.file) {
    response.status(400).json({ message: "A PDF resume is required." });
    return;
  }
  if (request.file.buffer.length < 5 || request.file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    response.status(400).json({ message: "The uploaded file does not appear to be a valid PDF." });
    return;
  }

  const bucket = request.app.locals.resumeBucket;
  if (!bucket) {
    response.status(503).json({ message: "Resume storage is not available." });
    return;
  }

  let resumeFileId;
  try {
    resumeFileId = await storeResume(bucket, request.file);
    const comparison = await ComparisonRequest.create({
      resumeFileId,
      resumeFilename: getResumeFilename(request.file.originalname),
      jobDescription,
      status: "pending_ai",
    });

    response.status(201).json({
      comparison: {
        id: comparison.id,
        status: comparison.status,
        resumeFilename: comparison.resumeFilename,
        createdAt: comparison.createdAt,
      },
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
});

export default router;
