# 0 to shipped

Resume and job-description comparison app with a React frontend and Express API. The API sends uploaded PDFs and job descriptions to OpenAI's Responses API for an evidence-based match score and skill breakdown, and stores the resume in MongoDB GridFS with the analysis record.

The backend is organized into `routes/`, `controllers/`, `services/`, `config/`, and `middleware/`, with the Express entry point in `backend/server.js` and shared helpers in `backend/utils.js`.

## Requirements

- Node.js 20 or newer
- MongoDB running locally or a MongoDB connection string

## Configure MongoDB

Create `backend\.env` with your MongoDB URI and OpenAI API key:

```powershell
MONGODB_URI=mongodb://127.0.0.1:27017/zero_to_shipped
OPENAI_API_KEY=your_rotated_openai_api_key
OPENAI_MODEL=gpt-6-astra
```

For MongoDB Atlas, use your Atlas connection string instead. You can copy `backend\.env.example` and edit its values. Keep `backend\.env` private; it is ignored by Git. Since a key was previously shared in chat, revoke it and configure a newly rotated key locally or in Vercel; do not put it in frontend code.

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

## Deploy as a Vercel project with services

Import the repository as one Vercel project with the repository root as its Root Directory. The root `vercel.json` defines two services:

- `backend` builds from `backend/` using the Express framework.
- `frontend` builds from `frontend/` using Vite.

The public `/api/*` rewrite sends requests to the backend, and the catch-all rewrite sends other public paths to the frontend. The browser calls the same-domain `/api/comparisons` path, so no service binding is needed. Configure `MONGODB_URI` in the Vercel project's environment variables.

## Comparison request

The frontend sends `POST /api/comparisons` as `multipart/form-data` with:

- `resume`: a PDF file up to 4 MB (kept below Vercel's request payload limit)
- `jobDescription`: non-empty text up to 20,000 characters

The backend sends the PDF directly to OpenAI as a Responses API `input_file` and requests schema-constrained JSON containing an estimated 0-100 role-alignment score, matched skills, missing job skills, a summary, and recommendations. OpenAI extracts/analyzes the PDF; no PDF parser runs in the browser. The API key stays server-side in `OPENAI_API_KEY`; `OPENAI_MODEL` defaults to `gpt-6-astra`. Responses are not stored by OpenAI (`store: false`). The resume PDF is stored in MongoDB GridFS; the comparison record stores the file ID, job description, analysis, status, and timestamps. Failed OpenAI calls are marked `failed`. The score is an estimate, not a hiring decision.

On Vercel, configure `MONGODB_URI` and `OPENAI_API_KEY` in the backend service's environment variables. Set `OPENAI_MODEL` there only if you want a different model.
