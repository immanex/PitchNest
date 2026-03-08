<div align="center">
  <img src="logo.png" alt="PitchNest Logo" width="120" height="120" />
</div>

# PitchNest

**AI-Powered Pitch Simulation Platform for Founders**

PitchNest is a platform that helps founders, students, and coaches practice their pitch in real-time with AI-powered investor personas. Get instant feedback, improve your delivery, and build confidence before facing real investors.

---

## Features

- **Live AI Pitch Room** – Practice pitching with AI investors who respond like real VCs and angels
- **5 Investor Personas** – Aggressive VC, Friendly Angel, Analytical, Technical, Skeptic
- **Real-Time Voice Output** – AI responses spoken via browser SpeechSynthesis (toggle on/off)
- **AI Pitch Evaluation** – Scores for clarity, communication, and market fit + panel verdict
- **Post-Pitch Analytics** – Strengths, weaknesses, improvement suggestions
- **User Auth** – Sign up, login, email verification, password reset
- **Profile Setup** – Founder/startup profiles, AI preferences
- **WebSocket Chat** – Real-time conversation with AI in the live room

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | React, Vite, Tailwind CSS, Radix UI, Motion, Socket.io-client |
| **Backend** | FastAPI, SQLAlchemy, asyncpg (PostgreSQL) |
| **AI** | Google Gemini (1.5-flash for chat, 1.5-pro for evaluation) |
| **Database** | PostgreSQL |
| **Deploy** | Docker, Docker Compose, Nginx |

---

## Requirements

### Backend (Python)

- Python 3.11+
- [See Backend requirements.txt](Backend/requirements.txt) for full list

### Frontend

- Node.js 20+
- npm or pnpm

### Infrastructure

- PostgreSQL 16 (or use Docker)
- Docker & Docker Compose (optional, for one-command run)

---

## How to Use

### Option 1: Docker (Easiest)

1. Clone the repo:

```bash
git clone <your-repo-url>
cd PitchNest-3
```

2. Start all services:

```bash
docker-compose up -d
```

3. Open the app:

- **Frontend:** http://localhost (port 80)
- **Backend API:** http://localhost:8000
- **PostgreSQL:** localhost:5432

### Option 2: Local Development

**1. Set up PostgreSQL** (if not using Docker):

```bash
# Create DB and user
createdb pitchnest
# User: pitchnest, Password: pitchnest123 (or your own)
```

**2. Backend**

```bash
cd Backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` in `Backend/`:

```env
DATABASE_URL=postgresql+asyncpg://pitchnest:pitchnest123@localhost:5432/pitchnest
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-google-gemini-api-key   # Get at https://aistudio.google.com/apikey
```

Run migrations and start the server:

```bash
alembic upgrade head
uvicorn main:app --reload --port 8000
```

**3. Frontend**

```bash
cd Frontend
npm install   # or pnpm install
npm run dev   # or pnpm dev
```

Frontend runs at http://localhost:5173. Configure the API base URL if needed (e.g. `http://localhost:8000`).

**4. Use the app**

- Go to the landing page → Sign up / Log in
- Complete profile setup (role, startup, preferences)
- Choose mode and investor persona
- Enter the Live Pitch Room and start pitching

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql+asyncpg://user:pass@host:port/db`) |
| `SECRET_KEY` | Yes | JWT signing key (long random string) |
| `GEMINI_API_KEY` | Yes (for AI) | Google Gemini API key from [AI Studio](https://aistudio.google.com/apikey) |

---

## Project Structure

```
PitchNest-3/
├── Backend/
│   ├── api/           # Auth, onboarding, dashboard, socket, AI routes
│   ├── ai/            # Gemini integration, judge logic
│   ├── core/          # Config, security
│   ├── db/            # Models, database
│   ├── schemas/       # Pydantic schemas
│   ├── utils/         # Email, tokens
│   ├── main.py
│   └── requirements.txt
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── pages/
│   │   │   └── routes.ts
│   │   └── styles/
│   └── package.json
├── docker-compose.yml
├── logo.png
└── README.md
```

---

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | User registration |
| `POST /api/auth/login` | User login |
| `POST /api/ai/evaluate` | Evaluate pitch transcript (returns scores, verdict, feedback) |
| WebSocket | Live room chat with AI panel |

---

## License

© 2026 PitchNest. All rights reserved.
