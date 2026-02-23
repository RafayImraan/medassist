# MedAssist - Offline AI Clinical Triage Assistant

MedAssist is a competition-ready, offline-capable clinical triage and decision support demo built with React + Tailwind (frontend), FastAPI (backend), and MedGemma via Hugging Face local inference.

Important disclaimer: **This tool is for decision support only and does not replace professional medical judgment.**

## Features
- Structured patient intake form covering demographics, symptoms, duration, and vitals.
- `/analyze` REST endpoint with validated clinical payload.
- MedGemma local inference with optional 4-bit quantization.
- Strict structured output sections:
  - Triage Summary
  - Differential Diagnosis (Top 3)
  - Urgency Level
  - Red Flags
  - Recommended Next Steps
  - Limitations
- Safety constraints in prompt and UI (no medication dosage, no definitive diagnosis).
- Evaluation harness with 10 simulated clinical test cases.
- Dockerized local deployment.

## Current Local Execution Status (This Laptop)
- Frontend + FastAPI + full triage workflow run successfully offline.
- This machine currently runs in fallback mode due CPU/runtime limits with MedGemma checkpoint loading.
- MedGemma integration paths are implemented in code (`transformers` and `llama_cpp` runtime options), but local hardware/runtime compatibility prevented stable MedGemma inference on this device.

## Project Structure
```text
medassist/
  backend/
    app/
      api/routes.py
      core/config.py
      core/logging.py
      models/schemas.py
      services/prompts.py
      services/medgemma_service.py
      main.py
    requirements.txt
    .env.example
    Dockerfile
  frontend/
    src/
      components/PatientForm.jsx
      components/ResultPanel.jsx
      services/api.js
      App.jsx
      main.jsx
      index.css
    package.json
    .env.example
    Dockerfile
  evaluation/
    test_cases.json
    run_evaluation.py
    requirements.txt
  docs/
    TECHNICAL_DOCUMENTATION.md
    VIDEO_DEMO_PLAN.md
  docker-compose.yml
  .gitignore
```

## Quick Start (Local)
### 1) Backend
```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2) Frontend
```bash
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

App URLs:
- Frontend: `http://localhost:5174`
- Backend health: `http://localhost:8000/health`

## Docker Setup
```bash
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
docker compose up --build
```

## Running MedGemma Locally
### Option A - Hugging Face transformers (GPU recommended)
1. Set `MODEL_RUNTIME=transformers` in `backend/.env`.
2. Set `MODEL_ID` to MedGemma checkpoint (example: `google/medgemma-4b-it`).
3. Keep `MODEL_USE_4BIT=true` for constrained GPUs.

### Option B - CPU quantized runtime with GGUF (no GPU)
1. Install optional dependency:
```bash
cd backend
pip install -r requirements-cpu-gguf.txt
```
2. Set in `backend/.env`:
```env
MODEL_RUNTIME=llama_cpp
MODEL_GGUF_PATH=C:\path\to\medgemma-quantized.gguf
MODEL_THREADS=6
MODEL_CTX_SIZE=4096
MODEL_GPU_LAYERS=0
MODEL_OFFLINE_MODE=false
```
3. Start backend and verify log contains `Loaded MedGemma GGUF with llama.cpp`.

### Option C - Rule-based fallback demo mode
Set `MODEL_OFFLINE_MODE=true` (uses deterministic fallback logic).

Recommended for this CPU-only laptop:
```env
MODEL_OFFLINE_MODE=true
```

## Colab GPU Path (Recommended for MedGemma Proof)
Use the ready notebook in `colab/MedAssist_MedGemma_Colab_Ordered.ipynb` (or your run-output notebook `colab/colab.ipynb`).

Steps:
1. Open notebook in Google Colab and enable T4 GPU.
2. Run install and Hugging Face login cells.
3. Run single-case inference and 10-case evaluation cells.
4. Optional: launch built-in Gradio demo.

Supporting files:
- `colab/README.md`
- `colab/test_cases.json`

### Latest Colab Run Summary (T4 GPU, raw generation snapshot)
- Total cases: `10`
- Urgency correctness: `3/10 (30.00%)`
- Red-flag detection hit-rate: `5/5 (100.00%)`
- Parsed directly as JSON: `0/10 (0.00%)`
- Fallback parse-rescue: `10/10 (100.00%)`
- Average inference time: `64.452s`

### Current Backend Summary (production output path)
- Total cases: `10`
- Urgency correctness: `7/10 (70.00%)`
- Red-flag detection hit-rate: `5/5 (100.00%)`
- Average inference time (offline fallback path): `~0.0s`

Interpretation:
- MedGemma inference executed on GPU end-to-end for competition proof.
- Strict JSON adherence was poor in this run, which surfaced a realistic deployment risk for clinical LLM outputs.
- The system's fallback parsing + deterministic red-flag safety layer maintained schema integrity, strong red-flag recall, stable UI rendering, and safety disclaimers under failure conditions.
- This validates the engineering objective of **safe degradation** in low-resource environments.

## API Contract
`POST /analyze`

Request body:
```json
{
  "age": 45,
  "gender": "Male",
  "chief_complaint": "Chest pain",
  "symptoms": "Chest pain with sweating",
  "duration": "45 minutes",
  "vitals": {
    "temperature": 37.0,
    "heart_rate": 118,
    "blood_pressure": "160/90",
    "respiratory_rate": 24,
    "oxygen_saturation": 93
  },
  "medical_history": "Hypertension",
  "medications": "Amlodipine"
}
```

## Evaluation
```bash
cd evaluation
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_evaluation.py
```

Metrics collected:
- Inference time
- Urgency correctness (manual expected labels)
- Red flag detection coverage

## Architecture Diagram
See `docs/TECHNICAL_DOCUMENTATION.md` for full architecture and technical details.

## Submission Package
- Competition write-up source: `docs/COMPETITION_WRITEUP.md`
- Technical documentation: `docs/TECHNICAL_DOCUMENTATION.md`
- Video plan: `docs/VIDEO_DEMO_PLAN.md`
- Video voiceover script: `docs/VIDEO_SCRIPT.md`
- Final checklist: `docs/SUBMISSION_CHECKLIST.md`

Before final submit, convert `docs/COMPETITION_WRITEUP.md` to PDF (max 3 pages) and replace placeholder links in that file.
