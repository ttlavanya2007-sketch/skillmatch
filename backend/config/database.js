import mongoose from "mongoose";

let connectionPromise;

export async function connectDatabase(app) {
  if (mongoose.connection.readyState === 1 && app.locals.resumeBucket) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required. Set it in backend/.env or the deployment environment variables.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri)
      .then(() => {
        if (!mongoose.connection.db) {
          throw new Error("MongoDB connected without an initialized database.");
        }
        app.locals.resumeBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: "resumes",
        });
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  await connectionPromise;
}
