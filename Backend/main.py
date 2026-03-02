from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, onboarding, dashboard
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(onboarding.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/")
async def read_root():
    return {"message": "Welcome to PitchNest API!"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
