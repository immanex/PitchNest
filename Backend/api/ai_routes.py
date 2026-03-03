from fastapi import APIRouter
from ai.judge import evaluate_pitch

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/evaluate")
def evaluate(transcript: str):
    return evaluate_pitch(transcript)