"""
Pitch evaluation - uses Gemini for full AI-powered feedback.
Falls back to simple heuristic when Gemini is not configured.
"""
from ai.gemini import evaluate_pitch_with_gemini


def evaluate_pitch(transcript: str) -> dict:
    """Evaluate pitch transcript and return scores, verdict, feedback, suggestions."""
    result = evaluate_pitch_with_gemini(transcript)
    return {
        "overall_score": result["overall_score"],
        "clarity": result["clarity"],
        "communication": result["communication"],
        "market_fit": result["market_fit"],
        "verdict": result["verdict"],
        "feedback_summary": result["feedback_summary"],
        "strengths": result["strengths"],
        "weaknesses": result["weaknesses"],
        "suggestions": result["suggestions"],
    }
