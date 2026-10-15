# 0 to shipped

Resume and job-description comparison starter with a React frontend and Express API. The API validates uploads, saves PDF files to MongoDB GridFS, and stores comparison requests in MongoDB. AI scoring and skill matching are not implemented yet; new requests remain `pending_ai`.

The backend is organized into `routes/`, `controllers/`, `services/`, `config/`, and `middleware/`, with the Express entry point in `backend/server.js` and shared helpers in `backend/utils.js`.

## Requirements

- Node.js 20 or newer
- MongoDB running locally or a MongoDB connection string

## Configure MongoDB

Create `backend\.env` and add your MongoDB connection string:

```powershell
MONGODB_URI=mongodb://127.0.0.1:27017/zero_to_shipped
```

For MongoDB Atlas, use your Atlas connection string instead. Keep `backend\.env` private; it is ignored by Git.

## Run locally

Open two terminals from the project root.

Terminal 1 — API:

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

Terminal 2 — frontend:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the Vite URL printed in the frontend terminal (usually `http://localhost:5173`). Vite proxies `/api` requests to the API on port 3001. Check `http://localhost:3001/api/health` to confirm the API and MongoDB connection.

For a separately hosted frontend, set `VITE_API_URL` to the API origin at build time and configure `FRONTEND_ORIGIN` in the backend environment.

## Deploy as two Vercel projects

Create two Vercel projects from the same Git repository:

1. **Frontend project:** set the Root Directory to `frontend`. Its `vercel.json` builds the Vite app into `dist`.
2. **Backend project:** set the Root Directory to `backend`. Vercel detects the exported Express app in `server.js`. The app connects to MongoDB on incoming requests.

In the backend Vercel project's environment variables, set `MONGODB_URI` and `FRONTEND_ORIGIN` to the deployed frontend's origin (for example, `https://your-frontend.vercel.app`). In the frontend Vercel project's environment variables, set `VITE_API_URL` to the deployed backend's origin (for example, `https://your-backend.vercel.app`). Redeploy the frontend after setting `VITE_API_URL`.

## Comparison request

The frontend sends `POST /api/comparisons` as `multipart/form-data` with:

- `resume`: a PDF file up to 10 MB
- `jobDescription`: non-empty text up to 20,000 characters

Valid PDFs are stored in GridFS (`resumes` bucket); a `ComparisonRequest` document stores the GridFS file ID, filename, job description, timestamps, and `pending_ai` status. The endpoint responds with the new comparison ID and status. It does not extract PDF text, score resumes, or call an AI service yet.
