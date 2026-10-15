import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import multer from "multer";
import comparisonsRouter from "./routes/comparisons.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
  });
});

app.use("/api/comparisons", comparisonsRouter);

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === "LIMIT_FILE_SIZE";
    response.status(tooLarge ? 413 : 400).json({
      message: tooLarge ? "The PDF must be 10 MB or smaller." : "The upload could not be processed.",
    });
    return;
  }
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error("API request failed.", error);
  response.status(status).json({
    message: status >= 500 ? "The server could not save the comparison request." : error.message,
  });
});

export default app;
