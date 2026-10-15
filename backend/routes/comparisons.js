import { Router } from "express";
import { createComparison } from "../controllers/comparisonController.js";
import { resumeUpload } from "../config/upload.js";

const router = Router();

router.post("/", resumeUpload.single("resume"), createComparison);

export default router;
