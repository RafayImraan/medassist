# MedAssist Colab Runner (GPU)

Use this folder when local CPU cannot run MedGemma reliably.

## Files
- `MedAssist_MedGemma_Colab.ipynb`: complete Colab notebook.
- `MedAssist_MedGemma_Colab_Ordered.ipynb`: ordered/recovery-safe notebook.
- `colab.ipynb`: downloaded run-output notebook from Colab (if present).
- `test_cases.json`: 10 simulated test cases.

## Steps
1. Open Colab and upload/open `MedAssist_MedGemma_Colab.ipynb`.
2. In Colab: `Runtime -> Change runtime type -> T4 GPU`.
3. Run all cells.
4. Login to Hugging Face when prompted (token input).
5. Run single-case inference and evaluation cells.
6. Optional: launch Gradio demo cell and use public share link for presentation.

## Output Artifacts to Capture
- Startup log showing MedGemma loaded.
- One inference JSON output with non-zero latency.
- Evaluation summary over 10 test cases.
- Gradio demo screenshot (optional).

## Submission Tip: Final Metrics Block
After running the evaluation cell, copy the final printed summary and update:
- `docs/COMPETITION_WRITEUP.md`
- `docs/TECHNICAL_DOCUMENTATION.md`
- `README.md`

Use this format:
1. Total cases: `x/10`
2. Urgency correctness: `x/10 (xx.xx%)`
3. Red-flag detection hit-rate: `x/5 (xx.xx%)`
4. Parsed directly as JSON: `x/10 (xx.xx%)`
5. Fallback parse-rescue: `x/10 (xx.xx%)`
6. Average inference time: `xx.xxxs`
