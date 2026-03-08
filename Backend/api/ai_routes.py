import asyncio
from fastapi import APIRouter
from pydantic import BaseModel

from ai.gemini import evaluate_pitch_with_gemini

router = APIRouter(prefix="/ai", tags=["AI"])


class EvaluateRequest(BaseModel):
    transcript: str


@router.post("/evaluate")
async def evaluate(body: EvaluateRequest):
    result = await asyncio.to_thread(evaluate_pitch_with_gemini, body.transcript)
    return result