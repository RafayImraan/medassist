import json
import logging
import time
from typing import Any, Dict

from app.core.config import settings
from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.prompts import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)


class MedGemmaService:
    def __init__(self) -> None:
        self.generator = None
        self.llm = None
        self.runtime = settings.model_runtime.lower().strip()
        self._model_loaded = False
        self._load_model()

    def _load_model(self) -> None:
        if settings.model_offline_mode:
            logger.info("MODEL_OFFLINE_MODE=true; using rule-based fallback.")
            return

        if self.runtime == "llama_cpp":
            self._load_llama_cpp()
            return

        # Default runtime
        self.runtime = "transformers"
        self._load_transformers()

    def _load_transformers(self) -> None:
        try:
            from transformers import pipeline
            import torch

            model_kwargs: Dict[str, Any] = {}
            if settings.model_use_4bit:
                model_kwargs["load_in_4bit"] = True

            self.generator = pipeline(
                "text-generation",
                model=settings.model_id,
                device_map=settings.model_device,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                model_kwargs=model_kwargs,
            )
            self._model_loaded = True
            logger.info("Loaded MedGemma with transformers: %s", settings.model_id)
        except Exception as exc:
            self._model_loaded = False
            logger.warning("Transformers model load failed. Falling back. Error: %s", exc)

    def _load_llama_cpp(self) -> None:
        if not settings.model_gguf_path:
            logger.warning("MODEL_RUNTIME=llama_cpp but MODEL_GGUF_PATH is empty. Falling back.")
            return
        try:
            from llama_cpp import Llama

            self.llm = Llama(
                model_path=settings.model_gguf_path,
                n_ctx=settings.model_ctx_size,
                n_threads=settings.model_threads,
                n_gpu_layers=settings.model_gpu_layers,
                verbose=False,
            )
            self._model_loaded = True
            logger.info("Loaded MedGemma GGUF with llama.cpp: %s", settings.model_gguf_path)
        except Exception as exc:
            self._model_loaded = False
            logger.warning("llama.cpp model load failed. Falling back. Error: %s", exc)

    def _extract_json(self, raw_text: str) -> Dict[str, Any]:
        # Parse the last valid JSON object in the output to avoid prompt-template braces.
        candidates = []
        stack = []
        start = None
        for i, ch in enumerate(raw_text):
            if ch == "{":
                if not stack:
                    start = i
                stack.append(ch)
            elif ch == "}" and stack:
                stack.pop()
                if not stack and start is not None:
                    candidates.append(raw_text[start : i + 1])
                    start = None

        for candidate in reversed(candidates):
            try:
                parsed = json.loads(candidate)
                if isinstance(parsed, dict) and "triage_summary" in parsed:
                    return parsed
            except json.JSONDecodeError:
                continue
        raise ValueError("No valid triage JSON object found in model output")

    def _build_prompt(self, payload: AnalyzeRequest) -> str:
        return (
            f"{SYSTEM_PROMPT}\n\n"
            f"{build_user_prompt(payload)}\n\n"
            "Return strict JSON only."
        )

    def _infer_with_transformers(self, payload: AnalyzeRequest) -> Dict[str, Any]:
        if self.generator is None:
            raise RuntimeError("Transformers runtime not initialized")
        prompt = f"<system>\n{SYSTEM_PROMPT}\n</system>\n<user>\n{build_user_prompt(payload)}\n</user>\n<assistant>"
        outputs = self.generator(
            prompt,
            max_new_tokens=settings.model_max_new_tokens,
            do_sample=True,
            temperature=settings.model_temperature,
        )
        raw = outputs[0]["generated_text"]
        return self._extract_json(raw)

    def _infer_with_llama_cpp(self, payload: AnalyzeRequest) -> Dict[str, Any]:
        if self.llm is None:
            raise RuntimeError("llama.cpp runtime not initialized")
        completion = self.llm.create_completion(
            prompt=self._build_prompt(payload),
            temperature=settings.model_temperature,
            max_tokens=settings.model_max_new_tokens,
        )
        raw = completion["choices"][0]["text"]
        return self._extract_json(raw)

    def _rule_based_fallback(self, payload: AnalyzeRequest) -> Dict[str, Any]:
        hr = payload.vitals.heart_rate
        rr = payload.vitals.respiratory_rate
        spo2 = payload.vitals.oxygen_saturation
        temp = payload.vitals.temperature
        chief = payload.chief_complaint.lower()
        symptoms = payload.symptoms.lower()

        urgency = "MODERATE"
        red_flags = self._deterministic_red_flags(payload)

        if spo2 < 90 or "chest pain" in chief or "stroke" in symptoms or "weakness one side" in symptoms:
            urgency = "EMERGENCY"
        elif spo2 < 94 or rr > 30 or hr > 130 or temp >= 39.5:
            urgency = "HIGH"
        elif temp >= 38.0 or hr > 110 or rr > 22:
            urgency = "MODERATE"
        else:
            urgency = "LOW"

        if payload.patient_friendly_mode:
            patient_friendly_explanation = (
                f"You came in with {payload.chief_complaint.lower()}. "
                f"Based on your symptoms and vital signs, your urgency level is {urgency}. "
                "Please follow the recommended next steps and seek immediate care if symptoms worsen."
            )
        else:
            patient_friendly_explanation = "Not requested."

        return {
            "triage_summary": "Preliminary triage generated via fallback logic because model inference is unavailable.",
            "differential_diagnosis": [
                {
                    "condition": "Acute infectious process",
                    "rationale": "Symptoms and vitals may be consistent with an infection.",
                    "confidence": "medium",
                },
                {
                    "condition": "Cardiopulmonary cause",
                    "rationale": "Heart rate, breathing, and oxygen values require cardiopulmonary assessment.",
                    "confidence": "low",
                },
                {
                    "condition": "Condition related to primary complaint",
                    "rationale": "Chief complaint and symptom pattern suggest targeted further evaluation.",
                    "confidence": "low",
                },
            ],
            "urgency_level": urgency,
            "red_flags": red_flags,
            "recommended_next_steps": [
                "Repeat full set of vitals and focused clinical examination.",
                "Escalate care if red flags worsen or persist.",
                "Arrange referral or emergency transfer when clinically indicated.",
            ],
            "patient_friendly_explanation": patient_friendly_explanation,
            "limitations": "Fallback logic is simplistic and less nuanced than MedGemma reasoning.",
            "disclaimer": "This tool is for decision support only and does not replace professional medical judgment.",
        }

    def _normalize_patient_explanation(self, parsed: Dict[str, Any], payload: AnalyzeRequest) -> None:
        if payload.patient_friendly_mode:
            if not parsed.get("patient_friendly_explanation"):
                parsed["patient_friendly_explanation"] = (
                    "This summary means your care team has identified a possible concern and given next steps. "
                    "Please follow those steps and seek urgent help if symptoms get worse."
                )
        else:
            parsed["patient_friendly_explanation"] = "Not requested."

    def _parse_systolic(self, blood_pressure: str) -> int:
        try:
            return int(str(blood_pressure).split("/")[0].strip())
        except Exception:
            return -1

    def _deterministic_red_flags(self, payload: AnalyzeRequest) -> list[str]:
        chief = payload.chief_complaint.lower()
        symptoms = payload.symptoms.lower()
        spo2 = payload.vitals.oxygen_saturation
        rr = payload.vitals.respiratory_rate
        hr = payload.vitals.heart_rate
        temp = payload.vitals.temperature
        systolic = self._parse_systolic(payload.vitals.blood_pressure)

        flags: list[str] = []

        if "chest pain" in chief or "chest pain" in symptoms:
            flags.append("Possible cardiac ischemia (chest pain pattern)")
        if spo2 < 94:
            flags.append("Low oxygen saturation")
        if "slurred speech" in symptoms or "facial droop" in symptoms or "weakness" in symptoms:
            flags.append("Possible acute stroke signs")
        if rr >= 30 or ("shortness of breath" in symptoms and spo2 < 94):
            flags.append("Marked respiratory distress")
        if "confusion" in symptoms:
            flags.append("Acute confusion in high-risk patient")
        if "trauma" in chief or "injury" in chief or "road traffic" in chief:
            flags.append("Recent trauma mechanism")
        if systolic != -1 and systolic <= 90:
            flags.append("Hypotension")
        if hr >= 130:
            flags.append("Severe tachycardia")
        if temp >= 39.5:
            flags.append("High fever with potential systemic illness")

        if not flags:
            flags.append("No immediate critical red flags identified from provided data")

        return flags

    def _normalize_red_flags(self, parsed: Dict[str, Any], payload: AnalyzeRequest) -> None:
        model_flags = parsed.get("red_flags") or []
        if not isinstance(model_flags, list):
            model_flags = []
        deterministic = self._deterministic_red_flags(payload)

        merged: list[str] = []
        seen = set()
        for item in model_flags + deterministic:
            text = str(item).strip()
            key = text.lower()
            if text and key not in seen:
                seen.add(key)
                merged.append(text)
        parsed["red_flags"] = merged

    def _safe_infer(self, payload: AnalyzeRequest) -> Dict[str, Any]:
        if settings.model_offline_mode or not self._model_loaded:
            return self._rule_based_fallback(payload)
        try:
            if self.runtime == "llama_cpp":
                return self._infer_with_llama_cpp(payload)
            return self._infer_with_transformers(payload)
        except Exception as exc:
            logger.warning("Inference failed with runtime=%s. Using fallback. Error: %s", self.runtime, exc)
            return self._rule_based_fallback(payload)

    def analyze(self, payload: AnalyzeRequest) -> AnalyzeResponse:
        start = time.perf_counter()
        parsed = self._safe_infer(payload)
        self._normalize_patient_explanation(parsed, payload)
        self._normalize_red_flags(parsed, payload)
        elapsed = round(time.perf_counter() - start, 3)
        parsed["inference_time_seconds"] = elapsed
        return AnalyzeResponse.model_validate(parsed)


medgemma_service = MedGemmaService()
