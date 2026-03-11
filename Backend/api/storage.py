from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from google.cloud import storage
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from core.security import get_current_user
from db.models import User
import uuid

router = APIRouter()

BUCKET_NAME = "pitchnest-media"

@router.post("/upload/pitch-deck")
async def upload_pitch_deck(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files allowed")
    
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    
    file_id = str(uuid.uuid4())
    blob_name = f"pitch-decks/{current_user.id}/{file_id}.pdf"
    blob = bucket.blob(blob_name)
    
    blob.upload_from_file(file.file, content_type="application/pdf")
    
    return {
        "url": f"gs://{BUCKET_NAME}/{blob_name}",
        "public_url": blob.public_url
    }

@router.post("/upload/audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    allowed = ['.mp3', '.wav', '.m4a', '.webm']
    if not any(file.filename.endswith(ext) for ext in allowed):
        raise HTTPException(400, "Invalid audio format")
    
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1]
    blob_name = f"audio/{current_user.id}/{file_id}.{ext}"
    blob = bucket.blob(blob_name)
    
    blob.upload_from_file(file.file, content_type=f"audio/{ext}")
    
    return {
        "url": f"gs://{BUCKET_NAME}/{blob_name}",
        "public_url": blob.public_url
    }

@router.post("/upload/transcript")
async def upload_transcript(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.txt'):
        raise HTTPException(400, "Only TXT files allowed")
    
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    
    file_id = str(uuid.uuid4())
    blob_name = f"transcripts/{current_user.id}/{file_id}.txt"
    blob = bucket.blob(blob_name)
    
    blob.upload_from_file(file.file, content_type="text/plain")
    
    return {
        "url": f"gs://{BUCKET_NAME}/{blob_name}",
        "public_url": blob.public_url
    }
