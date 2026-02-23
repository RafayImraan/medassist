const urgencyClass = {
  LOW: 'bg-green-100 text-green-800 border-green-300',
  MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  EMERGENCY: 'bg-red-100 text-red-800 border-red-300 animate-[pulse-soft_1.8s_ease-in-out_infinite]',
}

const urgencyTone = {
  LOW: 'Routine',
  MODERATE: 'Observe',
  HIGH: 'Escalate',
  EMERGENCY: 'Immediate Action',
}

function SectionTitle({ icon, text }) {
  return (
    <h3 className="mb-1 flex items-center gap-2 text-xl font-semibold text-slate-900">
      <span aria-hidden="true" className="text-base">{icon}</span>
      {text}
    </h3>
  )
}

function SkeletonResult() {
  return (
    <div className="lux-panel" style={{ animationDelay: '0.16s' }}>
      <div className="space-y-3">
        <div className="skeleton-line h-6 w-1/2" />
        <div className="grid grid-cols-3 gap-2">
          <div className="skeleton-line h-16" />
          <div className="skeleton-line h-16" />
          <div className="skeleton-line h-16" />
        </div>
        <div className="skeleton-line h-20" />
        <div className="skeleton-line h-20" />
        <div className="skeleton-line h-20" />
      </div>
    </div>
  )
}

export default function ResultPanel({ result, loading }) {
  if (loading && !result) {
    return <SkeletonResult />
  }

  if (!result) {
    return (
      <div className="lux-panel border-dashed bg-[color:var(--surface-soft)] text-sm text-slate-500" style={{ animationDelay: '0.16s' }}>
        Submit patient details to generate triage decision support output.
      </div>
    )
  }

  return (
    <div className="lux-panel glass-sheen space-y-5" style={{ animationDelay: '0.16s' }}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold text-slate-900">Clinical Triage Output</h2>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold tracking-[0.08em] ${urgencyClass[result.urgency_level]}`}>
          {result.urgency_level}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-3">
          <p className="lux-label">Urgency Tone</p>
          <p className="text-sm font-semibold text-slate-700">{urgencyTone[result.urgency_level]}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-3">
          <p className="lux-label">Inference Time</p>
          <p className="text-sm font-semibold text-slate-700">{result.inference_time_seconds}s</p>
        </div>
        <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-3">
          <p className="lux-label">Runtime Mode</p>
          <p className="text-sm font-semibold text-slate-700">{result.triage_summary.toLowerCase().includes('fallback') ? 'Fallback' : 'Model'}</p>
        </div>
      </div>

      <section>
        <SectionTitle icon="✦" text="Triage Summary" />
        <p className="text-sm leading-relaxed text-slate-600">{result.triage_summary}</p>
      </section>

      <section>
        <SectionTitle icon="🩺" text="Differential Diagnosis (Top 3)" />
        <ul className="space-y-2 text-sm text-slate-600">
          {result.differential_diagnosis.map((item, i) => (
            <li key={`${item.condition}-${i}`} className="rounded-xl border border-[color:var(--line)] bg-white p-3 transition hover:-translate-y-[1px] hover:shadow-md">
              <p className="font-semibold text-slate-800">{i + 1}. {item.condition}</p>
              <p>{item.rationale}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">Confidence: {item.confidence}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle icon="⚠" text="Red Flags" />
        <ul className="list-disc pl-5 text-sm text-slate-600">
          {result.red_flags.map((flag, i) => <li key={`${flag}-${i}`}>{flag}</li>)}
        </ul>
      </section>

      <section>
        <SectionTitle icon="➜" text="Recommended Next Steps" />
        <ul className="timeline-list space-y-2 text-sm text-slate-600">
          {result.recommended_next_steps.map((step, i) => <li key={`${step}-${i}`}>{step}</li>)}
        </ul>
      </section>

      {result.patient_friendly_explanation && result.patient_friendly_explanation !== 'Not requested.' && (
        <section>
          <SectionTitle icon="🙂" text="Patient-Friendly Explanation" />
          <p className="rounded-xl border border-[#d6e3f4] bg-[#f4f8ff] p-3 text-sm leading-relaxed text-slate-700">
            {result.patient_friendly_explanation}
          </p>
        </section>
      )}

      <section>
        <SectionTitle icon="ℹ" text="Limitations" />
        <p className="text-sm text-slate-600">{result.limitations}</p>
      </section>

      <p className="rounded-xl border border-[#e8dfcf] bg-[color:var(--gold-soft)]/45 p-3 text-xs text-[#5f502f]">{result.disclaimer}</p>
    </div>
  )
}
