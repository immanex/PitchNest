"""
AI module using Google Gemini for PitchNest.
- gemini-1.5-flash: Real-time live chat (fast, low latency)
- gemini-1.5-pro: Pitch evaluation, summary, structured feedback (better reasoning)
"""
import json
import re
from typing import Any

from core.config import settings

_gemini_chat = _gemini_pro = None
try:
    import google.generativeai as genai
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_chat = genai.GenerativeModel("gemini-3-flash-preview")
        _gemini_pro = genai.GenerativeModel("gemini-3-flash-preview")
except Exception:
    pass


INVESTOR_PERSONAS = {
    "aggressive": (
        "You are an aggressive VC. You interrupt often, challenge aggressively, "
        "ask tough questions about burn rate, runway, and competition. Be direct and skeptical. "
        "Push hard on weak points. Tone: confrontational but professional."
    ),
    "friendly": (
        "You are a friendly angel investor. Supportive, encouraging, ask clarifying questions. "
        "Focus on team, vision, and potential. Gentle nudges on gaps. Tone: warm and constructive."
    ),
    "analytical": (
        "You are an analytical corporate investor. Focus on data, metrics, market size, unit economics. "
        "Ask structured questions. Methodical and data-driven. Tone: neutral, precise."
    ),
    "technical": (
        "You are a technical expert investor. Deep dive into product, tech stack, scalability. "
        "Challenge technical assumptions. Ask about architecture and differentiation. Tone: technical, rigorous."
    ),
    "skeptic": (
        "You are the skeptic. Question market size, competitive moat, traction. "
        "Raise concerns about risks. Play devil's advocate. Tone: probing, cautious."
    ),
}


def _get_persona_prompt(investor_archetype: str | None) -> str:
    key = (investor_archetype or "friendly").lower()
    return INVESTOR_PERSONAS.get(key, INVESTOR_PERSONAS["friendly"])


def generate_gemini_response(
    text: str,
    investor_archetype: str | None = None,
    conversation_history: list[dict[str, str]] | None = None,
) -> str:
    """
    Generate VC-style AI response for live pitch chat.
    Uses gemini-1.5-flash for fast real-time responses.
    Dynamic questioning: uses conversation_history for contextual follow-ups.
    """
    persona = _get_persona_prompt(investor_archetype)
    system = (
        "You are an experienced venture capitalist judging startup pitches. "
        f"{persona} "
        "Respond concisely (2-4 sentences). Ask one focused question or give one pointed feedback. "
        "Adapt your questions based on what the founder has already shared (dynamic questioning)."
    )

    if _gemini_chat:
        history = []
        if conversation_history:
            for msg in conversation_history[-10:]:  # Last 10 exchanges for context
                role = "user" if msg.get("speaker") != "AI Judge" else "model"
                history.append({"role": role, "parts": [msg.get("content", "")]})
        chat = _gemini_chat.start_chat(history=history)
        resp = chat.send_message(f"{system}\n\nUser message: {text}")
        return (resp.text or "").strip()

    return "AI is not configured. Add GEMINI_API_KEY to .env"


def evaluate_pitch_with_gemini(transcript: str) -> dict[str, Any]:
    """
    Full pitch evaluation using gemini-1.5-pro.
    Returns: overall_score, clarity, communication, market_fit, verdict,
             feedback_summary, strengths, weaknesses, suggestions
    """
    prompt = f"""You are an expert VC panel evaluating a startup pitch. Analyze this transcript and respond with a JSON object only (no markdown, no extra text).

Transcript:
---
{transcript[:12000]}
---

Respond with exactly this JSON structure:
{{
  "overall_score": <0-100 float>,
  "clarity": <0-100 float>,
  "communication": <0-100 float>,
  "market_fit": <0-100 float>,
  "verdict": "<one sentence: Pass / Consider / Needs Work>",
  "feedback_summary": "<2-3 sentence AI written feedback>",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}}"""

    if _gemini_pro:
        model = _gemini_pro
        resp = model.generate_content(prompt)
        raw = (resp.text or "").strip()
    else:
        # Fallback: simple heuristic if no Gemini
        wc = len(transcript.split())
        return {
            "overall_score": min(round(wc / 15, 1), 100),
            "clarity": 70,
            "communication": 65,
            "market_fit": 70,
            "verdict": "Consider – improve clarity and business explanation.",
            "feedback_summary": "Strong idea but improve clarity and business explanation.",
            "strengths": ["Clear problem statement", "Engaging delivery"],
            "weaknesses": ["Revenue model unclear", "Target users could be clearer"],
            "suggestions": [
                "Clarify target users",
                "Explain revenue model",
                "Add stronger closing statement",
            ],
        }

    # Parse JSON from response (handle markdown code blocks)
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```\s*$", "", raw)
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {
            "overall_score": 70,
            "clarity": 70,
            "communication": 70,
            "market_fit": 70,
            "verdict": "Consider",
            "feedback_summary": "Unable to parse AI feedback. Review transcript manually.",
            "strengths": [],
            "weaknesses": [],
            "suggestions": [],
        }

    return {
        "overall_score": float(data.get("overall_score", 70)),
        "clarity": float(data.get("clarity", 70)),
        "communication": float(data.get("communication", 70)),
        "market_fit": float(data.get("market_fit", 70)),
        "verdict": str(data.get("verdict", "Consider")),
        "feedback_summary": str(data.get("feedback_summary", "")),
        "strengths": list(data.get("strengths", [])),
        "weaknesses": list(data.get("weaknesses", [])),
        "suggestions": list(data.get("suggestions", [])),
    }
