# 3-Minute Video Script (Ready to Read)

## 0:00-0:30 Problem
Clinics in low-resource settings often face limited specialist access, intermittent internet, and strict privacy constraints. MedAssist addresses this with an offline-ready clinical triage decision-support system. This is not a diagnostic tool. It is designed to help clinicians structure reasoning, identify red flags, and prioritize next steps safely.

## 0:30-1:30 Product Demo
This is the MedAssist web application. On the left is structured patient intake: age, complaint, symptoms, duration, vitals, history, and medications. I will submit a high-risk chest pain case. On the right, MedAssist returns structured output sections: triage summary, top-3 differential hypotheses, urgency level, red flags, and recommended next steps. The interface always includes limitations and a mandatory safety disclaimer stating this does not replace professional medical judgment.

## 1:30-2:15 MedGemma Evidence
Now I show the Colab MedGemma execution proof on T4 GPU. The notebook loads `google/medgemma-4b-it`, runs one test case, and then evaluates 10 simulated clinical cases. In this run, urgency correctness is 3 out of 10, red-flag detection is 5 out of 5, direct JSON compliance is 0 out of 10, fallback parse-rescue is 10 out of 10, and average inference time is 64.452 seconds.

## 2:15-2:45 Architecture
Architecture is: User to React frontend to FastAPI backend to MedGemma runtime to structured response and UI rendering. The system includes safety hardening: schema validation, deterministic red-flag reinforcement, and fallback parsing for operational continuity in low-resource deployments.

## 2:45-3:00 Impact
If deployed, MedAssist can improve triage consistency, accelerate escalation visibility for critical cases, and support privacy-focused workflows with local-first operation paths. This demonstrates practical, human-centered use of HAI-DEF MedGemma in realistic healthcare constraints.
