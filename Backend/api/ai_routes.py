from fastapi import APIRouter
from pydantic import BaseModel

from ai.judge import evaluate_pitch

router = APIRouter(prefix="/ai", tags=["AI"])


class EvaluateRequest(BaseModel):
    transcript: str


@router.post("/evaluate")
def evaluate(body: EvaluateRequest):
    return evaluate_pitch(body.transcript)