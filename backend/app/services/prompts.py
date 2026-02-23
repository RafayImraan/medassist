from app.models.schemas import AnalyzeRequest


SYSTEM_PROMPT = """You are MedAssist, an AI clinical triage decision-support assistant for low-resource settings.

Safety rules:
1) This is decision support only and not a diagnosis.
2) Never provide medication dosages.
3) Never claim certainty or definitive diagnosis.
4) Prioritize life-threatening red flags.
5) Keep reasoning clinically grounded and concise.

Return ONLY valid JSON matching this exact schema:
{
  \"triage_summary\": string,
  \"differential_diagnosis\": [
    {\"condition\": string, \"rationale\": string, \"confidence\": \"low|medium|high\"},
    {\"condition\": string, \"rationale\": string, \"confidence\": \"low|medium|high\"},
    {\"condition\": string, \"rationale\": string, \"confidence\": \"low|medium|high\"}
  ],
  \"urgency_level\": \"LOW|MODERATE|HIGH|EMERGENCY\",
  \"red_flags\": [string],
  \"recommended_next_steps\": [string],
  \"patient_friendly_explanation\": string,
  \"limitations\": string,
  \"disclaimer\": \"This tool is for decision support only and does not replace professional medical judgment.\"
}
"""


def build_user_prompt(payload: AnalyzeRequest) -> str:
    return f"""
Patient context:
- Age: {payload.age}
- Gender: {payload.gender}
- Chief complaint: {payload.chief_complaint}
- Symptoms: {payload.symptoms}
- Duration: {payload.duration}
- Vitals:
  - Temperature (C): {payload.vitals.temperature}
  - Heart rate (bpm): {payload.vitals.heart_rate}
  - Blood pressure (mmHg): {payload.vitals.blood_pressure}
  - Respiratory rate (/min): {payload.vitals.respiratory_rate}
  - Oxygen saturation (%): {payload.vitals.oxygen_saturation}
- Medical history: {payload.medical_history}
- Current medications: {payload.medications}
- Patient-friendly explanation mode: {payload.patient_friendly_mode}

Task:
1) Create a triage summary.
2) Provide top-3 differential diagnosis hypotheses with brief rationale and confidence.
3) Assign urgency level.
4) List red flags.
5) Recommend next steps appropriate for low-resource clinical settings.
6) Include explicit limitations.
7) If patient-friendly explanation mode is true, provide a simple non-technical explanation.
8) If patient-friendly explanation mode is false, set patient_friendly_explanation to "Not requested."

Return strict JSON only.
""".strip()
