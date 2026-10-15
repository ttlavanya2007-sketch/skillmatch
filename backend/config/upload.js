import multer from "multer";
import { createHttpError } from "../utils.js";

export const maxResumeBytes = 4 * 1024 * 1024;

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxResumeBytes, files: 1, fields: 1 },
  fileFilter(_request, file, callback) {
    const hasPdfExtension = /\.pdf$/i.test(file.originalname);
    const hasPdfMimeType = ["application/pdf", "application/octet-stream"].includes(file.mimetype);
    if (!hasPdfExtension || !hasPdfMimeType) {
      callback(createHttpError(400, "Upload a PDF resume."));
      return;
    }
    callback(null, true);
  },
});
