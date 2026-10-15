import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGODB_URI is required. Copy backend/.env.example to backend/.env and configure it.");
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(mongoUri);
    if (!mongoose.connection.db) throw new Error("MongoDB connected without an initialized database.");

    app.locals.resumeBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "resumes",
    });
    app.listen(port, () => {
      console.log(`Resume comparison API listening on port ${port}.`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB or start the API.", error);
    await mongoose.disconnect();
    process.exitCode = 1;
  }
}
