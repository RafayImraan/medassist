import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.medgemma_service import medgemma_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    try:
        logger.info("Analyze request received for age=%s complaint=%s", payload.age, payload.chief_complaint)
        result = medgemma_service.analyze(payload)
        logger.info("Analyze completed urgency=%s time=%.3fs", result.urgency_level, result.inference_time_seconds)
        return result
    except Exception as exc:
        logger.exception("Analyze failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to analyze patient data") from exc
