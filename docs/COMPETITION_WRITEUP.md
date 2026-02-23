### Project name
MedAssist - Offline AI Clinical Triage Assistant

### Your team
1. [Your Name] - Full-stack AI Engineer - System architecture, backend integration, prompt engineering, evaluation.
2. [Member 2 Name] - Frontend Engineer - React/Tailwind UI, triage UX, visualization.
3. [Member 3 Name] - ML Engineer - MedGemma Colab runtime, inference troubleshooting, model evaluation.
4. [Member 4 Name] - Product/Clinical Research - Problem framing, safety constraints, write-up and video narrative.

### Problem statement
Low-resource clinics often triage patients with limited specialist access, unstable internet, and high clinical workload. Cloud-only models are not always feasible because of connectivity, privacy, and infrastructure limits. This creates an unmet need for a local-first clinical decision-support tool that helps structure intake, surface urgent risk signals, and standardize escalation decisions.

Target users are frontline clinicians and healthcare workers performing first-contact triage. The goal is not diagnosis; it is safer and faster decision support. If successful, this can improve triage consistency, increase early detection of high-risk presentations, and support faster referral decisions.

Expected impact:
1. Better triage consistency across staff and shifts.
2. Earlier visibility of critical red flags for escalation.
3. More reliable communication through structured outputs and patient-friendly explanations.
4. Practical deployment path for privacy-sensitive, low-connectivity environments.

### Overall solution
MedAssist is a human-centered triage application that uses Google HAI-DEF MedGemma as the clinical reasoning engine and wraps it in a safety-first production pipeline.

HAI-DEF model usage:
1. MedGemma (`google/medgemma-4b-it`) is used to generate triage summary, differential hypotheses, urgency reasoning, and next-step recommendations.
2. MedGemma execution is demonstrated on Colab T4 GPU for reproducible proof.
3. Output hardening is applied to ensure schema-safe UI rendering under real-world model variability.

Why this is an effective use of HAI-DEF:
1. The model is used for domain-specific reasoning where generic non-health models are less suitable.
2. The product demonstrates practical end-to-end integration, not only notebook inference.
3. The system emphasizes clinical workflow support, safety constraints, and deployment realism.

### Technical details
Architecture:
`User -> React Frontend -> FastAPI Backend -> MedGemma Runtime -> Structured Response -> UI Rendering`

Stack:
1. Frontend: React (Vite), TailwindCSS, urgency badges, structured triage panels.
2. Backend: FastAPI, Pydantic validation, structured logging, `.env` runtime configuration.
3. Runtime paths:
- MedGemma transformers path (GPU proof in Colab).
- Local fallback path for constrained CPU-only environments.
4. Deployment: local Docker support + reproducible setup docs.

Safety implementation:
1. Mandatory disclaimer in UI and API output.
2. No definitive diagnosis output.
3. No medication dosage recommendations.
4. Required limitations section in every response.
5. Deterministic red-flag reinforcement for robust safety behavior.

Evaluation setup:
1. 10 simulated triage cases (mild fever, severe chest pain, stroke-like symptoms, abdominal pain, headache, dehydration, shortness of breath, pediatric fever, elderly confusion, trauma).
2. Metrics: urgency correctness, red-flag detection hit-rate, direct JSON compliance, fallback parse-rescue, inference time.

Colab MedGemma run (T4 GPU):
1. Total cases: 10
2. Urgency correctness: 3/10 (30.00%)
3. Red-flag detection hit-rate: 5/5 (100.00%)
4. Parsed directly as JSON: 0/10 (0.00%)
5. Fallback parse-rescue: 10/10 (100.00%)
6. Average inference time: 64.452s

Local backend production-path snapshot:
1. Total cases: 10
2. Urgency correctness: 7/10 (70.00%)
3. Red-flag detection hit-rate: 5/5 (100.00%)
4. Average inference time (fallback path): ~0.0s

Feasibility notes:
1. The solution is runnable end-to-end as a product demo.
2. MedGemma usage is demonstrated in reproducible Colab GPU workflow.
3. The system is designed for graceful degradation when strict JSON generation fails.
4. This tradeoff is practical for low-resource deployment contexts.

Links (replace with final URLs):
1. Repository: `https://github.com/RafayImraan/medassist.git`
2. Colab notebook: `https://colab.research.google.com/drive/1wGww4_SMsTDXAiZIXc33kYEkYIuZIXJi?usp=sharing`
3. Video demo: `[YouTube or Drive link]`
4. Evaluation artifacts: `[Drive folder link]`
