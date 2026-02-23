import json
from pathlib import Path

import requests

BASE_URL = "http://localhost:8000"
CASES_PATH = Path(__file__).with_name("test_cases.json")


def contains_any(texts, keywords):
    corpus = " ".join(texts).lower()
    return any(k.lower() in corpus for k in keywords)


def run():
    cases = json.loads(CASES_PATH.read_text(encoding="utf-8"))

    urgency_correct = 0
    red_flag_hits = 0
    red_flag_total = 0
    timing = []

    print("Running MedAssist evaluation...\n")

    for case in cases:
        resp = requests.post(f"{BASE_URL}/analyze", json=case["input"], timeout=180)
        resp.raise_for_status()
        out = resp.json()

        predicted_urgency = out["urgency_level"]
        expected_urgency = case["expected_urgency"]
        urgency_ok = predicted_urgency == expected_urgency
        urgency_correct += int(urgency_ok)

        expected_flags = case["expected_red_flags"]
        if expected_flags:
            red_flag_total += 1
            red_flag_hit = contains_any(out["red_flags"], expected_flags)
            red_flag_hits += int(red_flag_hit)
        else:
            red_flag_hit = True

        timing.append(out.get("inference_time_seconds", 0.0))

        print(
            f"{case['id']} | {case['name']} | urgency: {predicted_urgency} (expected {expected_urgency})"
            f" | urgency_ok={urgency_ok} | red_flag_ok={red_flag_hit} | t={out.get('inference_time_seconds', 0)}s"
        )

    total = len(cases)
    avg_time = sum(timing) / max(len(timing), 1)
    urgency_acc = urgency_correct / total
    red_flag_rate = red_flag_hits / max(red_flag_total, 1)

    print("\nSummary")
    print(f"Total cases: {total}")
    print(f"Urgency correctness: {urgency_correct}/{total} ({urgency_acc:.2%})")
    print(f"Red flag detection (cases with expected red flags): {red_flag_hits}/{red_flag_total} ({red_flag_rate:.2%})")
    print(f"Average inference time: {avg_time:.3f}s")


if __name__ == "__main__":
    run()
