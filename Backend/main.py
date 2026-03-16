from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine
from db.models import Base
import os
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="PitchNest Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pitchnest-frontend-10489410829.us-central1.run.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Import routes after app is created to avoid circular imports
try:
    from api import auth, onboarding, dashboard, socket, ai_routes

    app.include_router(auth.router, prefix="/api")
    app.include_router(onboarding.router, prefix="/api")
    app.include_router(dashboard.router, prefix="/api")
    app.include_router(socket.router, prefix="/api")
    app.include_router(ai_routes.router, prefix="/api")
    print("✅ All routes loaded successfully")
except Exception as e:
    print(f"❌ ERROR loading routes: {e}")
    import traceback

    traceback.print_exc()


@app.get("/")
async def read_root():
    return {"message": "Welcome to PitchNest API!"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/test-db")
async def test_db():
    try:
        from sqlalchemy import text
        from db.database import engine

        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            return {"db_status": "connected", "result": result.scalar()}
    except Exception as e:
        return {"db_status": "failed", "error": str(e)}


@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
