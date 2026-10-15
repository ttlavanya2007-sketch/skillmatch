import mongoose from "mongoose";

const comparisonRequestSchema = new mongoose.Schema(
  {
    resumeFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    resumeFilename: {
      type: String,
      required: true,
      maxlength: 180,
    },
    jobDescription: {
      type: String,
      required: true,
      maxlength: 20000,
    },
    status: {
      type: String,
      enum: ["pending_ai", "processing", "completed", "failed"],
      default: "pending_ai",
      required: true,
    },
    analysis: {
      score: { type: Number, min: 0, max: 100 },
      summary: { type: String, maxlength: 1000 },
      matchedSkills: [{ type: String, maxlength: 120 }],
      missingSkills: [{ type: String, maxlength: 120 }],
      recommendations: [{ type: String, maxlength: 300 }],
    },
  },
  { timestamps: true },
);

export default mongoose.model("ComparisonRequest", comparisonRequestSchema);
