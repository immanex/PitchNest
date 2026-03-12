## Frontend (PitchNest)

### Requirements

- Node.js 20+
- npm (or pnpm)

### Run locally

```bash
cd Frontend
npm install
npm run dev
```

By default the frontend runs at `http://localhost:5173`.

### Configure API base URL

Set `VITE_BASE_URL` (used for REST + WebSocket):

```bash
# example
export VITE_BASE_URL="http://localhost:8000"
```

### AI Voice (Google free voice)

The Live Pitch Room supports AI voice playback via the browser Web Speech API.

- Click the **Voice** toggle to enable/disable AI speech.
- On Chrome, the app will prefer **Google voices** when available.
- Speech is intentionally **short** (trimmed) and starts **during streaming** to reduce waiting.
  