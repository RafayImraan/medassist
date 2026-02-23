from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.core.logging import setup_logging

setup_logging(settings.log_level)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Offline-ready AI clinical triage assistant powered by MedGemma.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}
