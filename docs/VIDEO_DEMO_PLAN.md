# 3-Minute Video Demo Plan

## Segment 1 (0:00-0:30) - Problem + User
1. State the user: frontline clinicians in low-resource clinics.
2. State constraints: limited connectivity, privacy constraints, specialist scarcity.
3. Position MedAssist: offline-ready triage decision support, not diagnosis.

## Segment 2 (0:30-1:30) - Website Demo (Primary Product Flow)
1. Show MedAssist web app intake form.
2. Enter one high-risk case (severe chest pain).
3. Click Analyze and highlight:
- Urgency badge
- Red flags
- Recommended next steps
- Limitations section
- Mandatory disclaimer
4. Mention patient-friendly explanation mode briefly.

## Segment 3 (1:30-2:15) - MedGemma Proof (Colab)
1. Show Colab notebook with MedGemma loaded.
2. Show completed 10-case evaluation summary output.
3. Read metrics on-screen:
- Urgency correctness: 3/10 (30.00%)
- Red-flag detection: 5/5 (100.00%)
- Parsed direct JSON: 0/10
- Fallback parse-rescue: 10/10
- Avg inference: 64.452s

## Segment 4 (2:15-2:45) - Architecture + Feasibility
1. Show architecture slide:
`User -> React -> FastAPI -> MedGemma -> Structured Response -> UI`
2. Explain dual-path design:
- GPU MedGemma proof path (Colab)
- Local resilient fallback path for constrained devices
3. Emphasize safety-first output hardening.

## Segment 5 (2:45-3:00) - Impact + Close
1. Faster triage consistency.
2. Better red-flag surfacing for escalation.
3. Practical deployment pathway in low-resource settings.

## Presenter Notes
1. Repeat exactly: "This tool is for decision support only and does not replace professional medical judgment."
2. Do not claim diagnosis certainty.
3. Do not mention medication dosages.
4. Avoid recording long loading screens; use pre-run outputs for Colab evidence.
