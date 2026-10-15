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
  },
  { timestamps: true },
);

export default mongoose.model("ComparisonRequest", comparisonRequestSchema);
