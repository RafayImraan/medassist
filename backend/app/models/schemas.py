from typing import List, Literal

from pydantic import BaseModel, Field

UrgencyLevel = Literal["LOW", "MODERATE", "HIGH", "EMERGENCY"]


class Vitals(BaseModel):
    temperature: float = Field(..., description="Celsius")
    heart_rate: int
    blood_pressure: str
    respiratory_rate: int
    oxygen_saturation: int


class AnalyzeRequest(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: str
    chief_complaint: str
    symptoms: str
    duration: str
    vitals: Vitals
    medical_history: str = ""
    medications: str = ""
    patient_friendly_mode: bool = False


class DifferentialItem(BaseModel):
    condition: str
    rationale: str
    confidence: str


class AnalyzeResponse(BaseModel):
    triage_summary: str
    differential_diagnosis: List[DifferentialItem] = Field(min_length=3, max_length=3)
    urgency_level: UrgencyLevel
    red_flags: List[str]
    recommended_next_steps: List[str]
    patient_friendly_explanation: str = ""
    limitations: str
    disclaimer: str
    inference_time_seconds: float
