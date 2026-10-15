import "dotenv/config";
import app from "./server.js";
import { connectDatabase } from "./config/database.js";

const port = Number(process.env.PORT ?? 3001);

try {
  await connectDatabase(app);
  app.listen(port, () => {
    console.log(`Resume comparison API listening on port ${port}.`);
  });
} catch (error) {
  console.error("Could not connect to MongoDB or start the API.", error);
  process.exitCode = 1;
}
