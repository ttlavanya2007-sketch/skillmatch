import { createComparisonRequest } from "../services/comparisonService.js";
import { createHttpError, isPdfFile } from "../utils.js";

export async function createComparison(request, response) {
  const jobDescription = typeof request.body.jobDescription === "string"
    ? request.body.jobDescription.trim()
    : "";

  if (!jobDescription) {
    throw createHttpError(400, "A job description is required.");
  }
  if (jobDescription.length > 20000) {
    throw createHttpError(400, "The job description must be 20,000 characters or fewer.");
  }
  if (!request.file) {
    throw createHttpError(400, "A PDF resume is required.");
  }
  if (!isPdfFile(request.file.buffer)) {
    throw createHttpError(400, "The uploaded file does not appear to be a valid PDF.");
  }

  const comparison = await createComparisonRequest(
    request.app.locals.resumeBucket,
    request.file,
    jobDescription,
  );

  response.status(201).json({
    comparison: {
      id: comparison.id,
      status: comparison.status,
      resumeFilename: comparison.resumeFilename,
      createdAt: comparison.createdAt,
    },
  });
}
