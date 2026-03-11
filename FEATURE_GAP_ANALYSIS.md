# PitchNest – Feature Gap Analysis

Requested features vs current implementation. Use this to prioritize development.

---

## A. Interruption-Aware Live AI (Top Priority)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Respond in real time | ⚠️ Partial | **Streaming added** – tokens stream to client; full response still waits for Gemini |
| Be interruptible | ❌ No | User cannot interrupt AI mid-response |
| Pause when user speaks | ❌ No | No voice activity detection |
| Resume intelligently | ❌ No | No context-aware resume |
| Adjust question flow dynamically | ✅ Yes | Last 10 messages passed to Gemini for context |

**To fully implement:** Use [Gemini Live API](https://ai.google.dev/gemini-api/docs/multimodal-live) (WebSocket) for native voice, barge-in, and real-time interaction. Current flow is text chat with streaming.

---

## B. Real-Time Voice Intelligence

| Requirement | Status | Notes |
|-------------|--------|-------|
| Speaking speed detection | ❌ No | Not implemented |
| Tone/confidence analysis | ❌ No | Not implemented |
| Hesitation detection | ❌ No | Not implemented |
| Filler word detection | ❌ No | UI shows placeholder data only |
| Live coaching nudges | ❌ No | No real-time feedback overlay |

**To implement:** Requires real-time STT (e.g., Web Speech API, Whisper streaming) + analysis pipeline. Gemini Live API can provide some of this via audio input.

---

## C. Visual Slide Intelligence (Multimodal Vision)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Analyze uploaded pitch deck visually | ❌ No | Slides rendered as PDF only |
| Detect clutter | ❌ No | No AI vision |
| Flag missing financial slides | ❌ No | No AI vision |
| Evaluate readability | ❌ No | No AI vision |
| Comment on design clarity | ❌ No | No AI vision |

**To implement:** Use Gemini multimodal (image input). Send slide images to `generate_content` with vision prompt. Add endpoint like `POST /api/ai/analyze-slides` that accepts slide images.

---

## D. Live Scoring Overlay

| Requirement | Status | Notes |
|-------------|--------|-------|
| Communication Score | ⚠️ UI only | Hardcoded (94); backend never sends `SCORE_UPDATE` |
| Clarity Score | ⚠️ UI only | Hardcoded (94) |
| Market Fit Score | ⚠️ UI only | Hardcoded (76) |
| Confidence Meter | ⚠️ UI only | Hardcoded (88) |
| Dynamic updates | ❌ No | Scores are static placeholders |

**To implement:** Backend should emit `SCORE_UPDATE` over WebSocket during the session. Options: (1) Periodic Gemini evaluation on transcript chunks, (2) Lightweight heuristics (word count, question count), (3) Gemini Live API affective/confidence signals.

---

## E. Investor Personality Engine

| Requirement | Status | Notes |
|-------------|--------|-------|
| Aggressive VC | ✅ Yes | In `INVESTOR_PERSONAS` |
| Friendly Angel | ✅ Yes | In `INVESTOR_PERSONAS` |
| Analytical Corporate Investor | ✅ Yes | In `INVESTOR_PERSONAS` |
| Technical Expert | ✅ Yes | In `INVESTOR_PERSONAS` |
| Skeptic | ✅ Yes | In `INVESTOR_PERSONAS` |
| Distinct tone & questioning style | ✅ Yes | Persona prompts passed to Gemini |

**Status:** Implemented. Personas differ in tone and focus.

---

## F. Real-Time Objection Handling Support

| Requirement | Status | Notes |
|-------------|--------|-------|
| Suggest structured response | ❌ No | Only static recommendations on Dashboard |
| Suggest metrics to include | ❌ No | No live coaching |
| Provide answer frameworks | ❌ No | No live coaching |
| Live coaching + simulation | ❌ No | AI asks questions but does not coach during objections |

**To implement:** Extend Gemini system prompt to output structured coaching hints when it challenges the founder. Add WebSocket event `COACHING_HINT` with `{ type, suggestion, metrics }`.

---

## G. Body Language Detection (Optional)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Eye contact tracking | ❌ No | Not implemented |
| Posture detection | ❌ No | Not implemented |
| Confidence cues | ❌ No | Not implemented |
| Facial engagement feedback | ❌ No | Not implemented |

**To implement:** Requires video analysis (e.g., MediaPipe, Gemini vision on video frames). High effort; best as post-MVP.

---

## H. Self-Aware, Fact-Enabled AI Panel (Advanced)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Track all participants (user + AI panelists) | ⚠️ Partial | Single "AI Judge"; no multi-panelist |
| Reference previous statements in real-time | ✅ Yes | Last 10 messages in context |
| Pull live factual data from APIs | ❌ No | No external data integration |
| Integrate facts into discussion | ❌ No | No external data |
| Rolling memory buffer | ⚠️ Partial | Last 10 messages only |
| Multi-agent panel | ❌ No | Single AI responds |

**To implement:** (1) Add multiple AI "panelist" personas that respond in sequence. (2) Add tool/function calling for web search or APIs. (3) Increase context window or use summarization for long sessions.

---

## Summary: Implemented vs Missing

| Category | Implemented | Missing |
|----------|-------------|---------|
| **Voice** | None | Voice agent, TTS, STT, Gemini Live |
| **Speed** | Streaming (added) | Full real-time, interruption |
| **Scoring** | Post-session only | Live scoring overlay |
| **Slides** | Display only | AI vision analysis |
| **Personas** | 5 investor types | — |
| **Objection** | Static tips | Live coaching |
| **Body** | — | All |
| **Panel** | Single AI | Multi-agent, facts |

---

## Recommended Implementation Order

1. **Streaming** (done) – Faster perceived response
2. **Voice agent** – TTS + STT for basic voice interaction
3. **Live scoring** – Emit `SCORE_UPDATE` from backend
4. **Slide analysis** – Gemini vision on uploaded slides
5. **Gemini Live API** – Full interruption-aware, real-time voice
6. **Objection coaching** – Structured hints in AI response
7. **Multi-agent panel** – Multiple AI panelists
8. **Body language** – If time allows
