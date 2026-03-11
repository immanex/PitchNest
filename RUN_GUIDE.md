# PitchNest – How to Run

Quick reference for running PitchNest locally or with Docker.

---

## Prerequisites

- **Node.js 20+** (for Frontend)
- **Python 3.11+** (for Backend)
- **PostgreSQL 16** (or use Docker)
- **Gemini API Key** – Get one at [Google AI Studio](https://aistudio.google.com/apikey)

---

## Option 1: Docker (Easiest – One Command)

```bash
cd PitchNest-1
docker-compose up -d
```

| Service   | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost       |
| Backend   | http://localhost:8080  |
| PostgreSQL| localhost:5432         |

**Note:** With Docker, the frontend is built with `VITE_BASE_URL` pointing to the backend. If you run frontend locally against Docker backend, set `VITE_BASE_URL=http://localhost:8080` in `Frontend/.env`.

**Important:** Add your `GEMINI_API_KEY` to `docker-compose.yml` before running (replace the placeholder in the `backend` service `environment` section).

---

## Option 2: Local Development

### 1. PostgreSQL

Create the database (if not using Docker for Postgres):

```bash
createdb pitchnest
# Default user: pitchnest, password: pitchnest123
```

Or run only Postgres via Docker:

```bash
docker run -d --name pitchnest-db -e POSTGRES_USER=pitchnest -e POSTGRES_PASSWORD=pitchnest123 -e POSTGRES_DB=pitchnest -p 5432:5432 postgres:16-alpine
```

### 2. Backend

```bash
cd Backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `Backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://pitchnest:pitchnest123@localhost:5432/pitchnest
SECRET_KEY=your-secret-key-at-least-32-chars
GEMINI_API_KEY=your-google-gemini-api-key
```

Run migrations and start the server:

```bash
alembic upgrade head
uvicorn main:app --reload --port 8000
```

Backend will be at **http://localhost:8000**.

### 3. Frontend

```bash
cd Frontend
npm install   # or pnpm install
npm run dev   # or pnpm dev
```

Frontend will be at **http://localhost:5173**.

Create `Frontend/.env` if the backend is not on the default port:

```env
VITE_BASE_URL=http://localhost:8000
```

### 4. Use the App

1. Open http://localhost:5173
2. Sign up / Log in
3. Complete profile setup (role, startup, preferences)
4. Upload a pitch deck (PDF/PPT/PPTX)
5. Choose mode and investor persona
6. Enter the Live Pitch Room and start pitching (via chat or voice)

---

## Environment Variables

| Variable       | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `DATABASE_URL` | Yes      | PostgreSQL connection string                     |
| `SECRET_KEY`   | Yes      | JWT signing key (long random string)              |
| `GEMINI_API_KEY` | Yes    | Google Gemini API key for AI features            |
| `VITE_BASE_URL` | No     | Backend URL (default: `http://localhost:8000`)   |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "AI is not configured" | Add `GEMINI_API_KEY` to Backend `.env` |
| Slow AI responses | Ensure streaming is enabled (see FEATURE_GAP_ANALYSIS.md) |
| CORS errors | Add your frontend URL to `main.py` CORS `allow_origins` |
| DB connection failed | Check PostgreSQL is running and `DATABASE_URL` is correct |
| WebSocket disconnect | Ensure `VITE_BASE_URL` matches backend (http vs https, port) |

---

## Quick Test

```bash
# Backend health
curl http://localhost:8000/health

# DB check
curl http://localhost:8000/test-db
```
