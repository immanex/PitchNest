# PitchNest AI Features

## Gemini Models Used

| Use Case | Model | Reason |
|----------|-------|--------|
| Live chat / AI Judge | **gemini-1.5-flash** | Fast, low latency for real-time Q&A |
| Pitch evaluation / summary | **gemini-1.5-pro** | Better reasoning for structured feedback |

## Setup

Add to `.env`:

```
GEMINI_API_KEY=your_google_gemini_api_key
```

Optional fallback if `GEMINI_API_KEY` is not set:

```
GROQ_API_KEY=your_groq_api_key
```

Get a Gemini API key: https://aistudio.google.com/apikey

## Features Implemented

### 1. Investor Personality Engine
- **Aggressive VC** – Interrupts often, challenges burn rate, competition
- **Friendly Angel** – Supportive, clarifying questions
- **Analytical** – Data, metrics, unit economics
- **Technical** – Product, tech stack, scalability
- **Skeptic** – Market size, moat, traction concerns

Pass `investor_archetype` when creating a room to select the persona.

### 2. AI Pitch Evaluation (on session end)
- Overall score, clarity, communication, market fit
- Panel verdict
- AI-written feedback
- Strengths, weaknesses, improvement suggestions

### 3. Pitch Summary Screen (PostPitchAnalytics)
- Overall score
- Panel verdict
- Strengths, weaknesses, AI feedback
- Improvement suggestions
- Pitch Again button

### 4. API

- `POST /api/ai/evaluate` – Body: `{"transcript": "..."}` – Returns full evaluation
