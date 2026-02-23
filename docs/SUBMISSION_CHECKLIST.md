# Final Submission Checklist

## Package Requirements
1. 3-page write-up PDF is finalized from `docs/COMPETITION_WRITEUP.md`.
2. 3-minute-or-less video is exported.
3. Source code repository is public or judge-accessible.
4. Colab notebook link is shared and opens without permission issues.

## Link Checklist (Must Replace Placeholders)
1. Repository link updated in `docs/COMPETITION_WRITEUP.md`.
2. Colab notebook link updated in `docs/COMPETITION_WRITEUP.md`.
3. Video link updated in `docs/COMPETITION_WRITEUP.md`.
4. Evaluation artifacts link updated in `docs/COMPETITION_WRITEUP.md`.

## Metrics Consistency Checklist
Use the same values in all three files:
1. `README.md`
2. `docs/TECHNICAL_DOCUMENTATION.md`
3. `docs/COMPETITION_WRITEUP.md`

Current aligned values:
1. Colab urgency correctness: 3/10 (30.00%)
2. Colab red-flag detection: 5/5 (100.00%)
3. Parsed direct JSON: 0/10 (0.00%)
4. Fallback parse-rescue: 10/10 (100.00%)
5. Avg inference time: 64.452s
6. Local backend red-flag detection: 5/5 (100.00%)

## Video Content Checklist
1. Problem statement (30s).
2. Website walkthrough (90s).
3. Colab MedGemma proof + evaluation summary (45s).
4. Architecture + impact summary (15s).
5. Safety disclaimer spoken clearly.

## Safety and Compliance Checklist
1. No definitive diagnosis claims.
2. No medication dosage recommendations.
3. Limitation section shown in UI/demo.
4. Disclaimer shown in UI/demo.

## Final Pre-Submit QA
1. Run frontend: `npm run dev` in `frontend`.
2. Run backend: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000` in `backend`.
3. Verify `http://localhost:8000/health` returns OK.
4. Capture one UI screenshot and one Colab metrics screenshot for appendix/evidence.
