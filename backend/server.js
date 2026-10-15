import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/errorHandler.js";
import comparisonsRouter from "./routes/comparisons.js";
import { connectDatabase } from "./config/database.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "32kb" }));
app.use(async (_request, _response, next) => {
  try {
    await connectDatabase(app);
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
  });
});

app.use("/api/comparisons", comparisonsRouter);
app.use(errorHandler);

export default app;
