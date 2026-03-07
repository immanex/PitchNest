from db.models import Base
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, onboarding, dashboard, socket, ai_routes
from core.config import settings
from db.database import engine

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
app.include_router(socket.router, prefix="/api")
app.include_router(ai_routes.router, prefix="/api")


@app.get("/")
async def read_root():
    return {"message": "Welcome to PitchNest API!"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
