import { useEffect, useMemo, useRef, useState } from 'react'
import PatientForm from './components/PatientForm'
import ResultPanel from './components/ResultPanel'
import { analyzePatient } from './services/api'

const NAV_ITEMS = [
  { id: 'triage', label: 'Triage Console' },
  { id: 'queue', label: 'Live Queue' },
  { id: 'alerts', label: 'Critical Alerts' },
  { id: 'audit', label: 'Audit Trail' },
]

const HISTORY_KEY = 'medassist_case_history_v1'

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDateTime(ts) {
  return new Date(ts).toLocaleString()
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [lastPayload, setLastPayload] = useState(null)
  const [initialFormData, setInitialFormData] = useState(null)
  const [history, setHistory] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('triage')

  const triageRef = useRef(null)
  const queueRef = useRef(null)
  const alertsRef = useRef(null)
  const auditRef = useRef(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        setHistory(JSON.parse(raw))
      }
    } catch (e) {
      console.error('history load failed', e)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  const mode = useMemo(() => {
    if (!result) return 'Awaiting Analysis'
    return result.triage_summary?.toLowerCase().includes('fallback') ? 'Fallback Runtime' : 'Model Runtime'
  }, [result])

  const addAudit = (event, detail) => {
    setAuditLog((prev) => [{ time: Date.now(), event, detail }, ...prev].slice(0, 25))
  }

  const onSubmit = async (payload) => {
    setLoading(true)
    setError('')
    setLastPayload(payload)
    addAudit('Case Submitted', `${payload.age}y ${payload.gender} | ${payload.chief_complaint}`)

    try {
      const data = await analyzePatient(payload)
      setResult(data)
      addAudit('Analysis Complete', `${data.urgency_level} | ${data.inference_time_seconds}s`)
      if (data.urgency_level === 'HIGH' || data.urgency_level === 'EMERGENCY') {
        addAudit('Urgency Escalated', `Priority ${data.urgency_level} case detected`)
      }

      const entry = {
        id: Date.now(),
        timestamp: Date.now(),
        payload,
        result: data,
      }
      setHistory((prev) => [entry, ...prev].slice(0, 10))
    } catch (err) {
      const message = err.message || 'Something went wrong'
      setError(message)
      addAudit('Analysis Failed', message)
    } finally {
      setLoading(false)
    }
  }

  const loadHistoryCase = (entry) => {
    setInitialFormData(entry.payload)
    setResult(entry.result)
    setLastPayload(entry.payload)
    setHistoryOpen(false)
    addAudit('Case Restored', `${entry.payload.chief_complaint}`)
  }

  const onPrintReport = () => {
    if (!result || !lastPayload) return

    const reportHtml = `
      <html>
        <head>
          <title>MedAssist Triage Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; margin: 24px; }
            h1 { margin: 0 0 10px; }
            h2 { margin: 18px 0 8px; }
            .meta { color: #555; font-size: 12px; margin-bottom: 16px; }
            .box { border: 1px solid #ddd; border-radius: 8px; padding: 10px; margin-bottom: 10px; }
            ul { margin: 6px 0 0 18px; }
          </style>
        </head>
        <body>
          <h1>MedAssist Clinical Triage Report</h1>
          <div class="meta">Generated: ${formatDateTime(Date.now())}</div>
          <div class="box"><strong>Patient:</strong> ${lastPayload.age}y ${lastPayload.gender} | <strong>Chief Complaint:</strong> ${lastPayload.chief_complaint}</div>
          <div class="box"><strong>Urgency:</strong> ${result.urgency_level} | <strong>Inference Time:</strong> ${result.inference_time_seconds}s</div>
          <h2>Triage Summary</h2>
          <div class="box">${result.triage_summary}</div>
          <h2>Differential Diagnosis</h2>
          <ul>
            ${result.differential_diagnosis.map((d) => `<li><strong>${d.condition}</strong> - ${d.rationale} (confidence: ${d.confidence})</li>`).join('')}
          </ul>
          <h2>Red Flags</h2>
          <ul>${result.red_flags.map((f) => `<li>${f}</li>`).join('')}</ul>
          <h2>Recommended Next Steps</h2>
          <ul>${result.recommended_next_steps.map((s) => `<li>${s}</li>`).join('')}</ul>
          ${
            result.patient_friendly_explanation && result.patient_friendly_explanation !== 'Not requested.'
              ? `<h2>Patient-Friendly Explanation</h2><div class="box">${result.patient_friendly_explanation}</div>`
              : ''
          }
          <h2>Limitations</h2>
          <div class="box">${result.limitations}</div>
          <div class="meta">${result.disclaimer}</div>
        </body>
      </html>
    `

    const popup = window.open('', '_blank', 'width=920,height=740')
    if (!popup) return
    popup.document.write(reportHtml)
    popup.document.close()
    popup.focus()
    popup.print()
    addAudit('Report Generated', 'Printable triage report exported')
  }

  const redFlagCount = result?.red_flags?.length || 0
  const statusTone = result?.urgency_level || 'N/A'
  const criticalItems = history.filter((entry) => entry.result?.urgency_level === 'HIGH' || entry.result?.urgency_level === 'EMERGENCY')

  const navTargetMap = {
    triage: triageRef,
    queue: queueRef,
    alerts: alertsRef,
    audit: auditRef,
  }

  const scrollToSection = (id) => {
    setActiveNav(id)
    const target = navTargetMap[id]?.current
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <main className="relative mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
      <div className="lux-shell p-4 md:p-6">
        <div className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full bg-[#dbbd80]/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[#4b84b4]/25 blur-3xl" />

        <div className="grid gap-5 xl:grid-cols-[240px_1fr]">
          <aside className="enterprise-rail">
            <p className="lux-label text-[#8f6d2f]">Operations</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Control Rail</h2>
            <nav className="mt-4 grid gap-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={`rail-item ${activeNav === item.id ? 'ring-2 ring-[#d5be8a]/60 bg-white/15' : ''}`}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-5 grid gap-2">
              <button type="button" className="rail-action" onClick={() => setHistoryOpen((v) => !v)}>
                {historyOpen ? 'Hide Case History' : 'Open Case History'}
              </button>
              <button type="button" className="rail-action" onClick={onPrintReport} disabled={!result || !lastPayload}>
                Generate PDF Summary
              </button>
            </div>
          </aside>

          <div>
            <header className="glass-sheen animate-[fade-up_.45s_ease] relative mb-5 rounded-2xl border border-white/30 bg-white/90 p-5 shadow-lg md:p-6">
              <p className="lux-label text-[#8f6d2f]">MedAssist</p>
              <h1 className="mt-2 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">Offline AI Clinical Triage Assistant</h1>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-[color:var(--muted)] md:text-base">
                This tool is for decision support only and does not replace professional medical judgment.
              </p>
            </header>

            <section ref={triageRef} className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="kpi-card">
                <p className="lux-label">Current Urgency</p>
                <p className="text-lg font-bold text-slate-800">{statusTone}</p>
              </div>
              <div className="kpi-card">
                <p className="lux-label">Red Flag Count</p>
                <p className="text-lg font-bold text-slate-800">{redFlagCount}</p>
              </div>
              <div className="kpi-card">
                <p className="lux-label">Response Time</p>
                <p className="text-lg font-bold text-slate-800">{result ? `${result.inference_time_seconds}s` : 'N/A'}</p>
              </div>
              <div className="kpi-card">
                <p className="lux-label">Runtime Mode</p>
                <p className="text-lg font-bold text-slate-800">{mode}</p>
              </div>
            </section>

            <section className="status-banner mb-5">
              <span className="status-dot" />
              <p>
                Backend Connected | Operational Mode: <strong>{mode}</strong> | Last Event: <strong>{auditLog[0]?.event || 'System Ready'}</strong>
              </p>
            </section>

            {historyOpen && (
              <section ref={queueRef} className="lux-panel mb-5" style={{ animationDelay: '0.04s' }}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-900">Live Queue (Case History)</h2>
                  <span className="metric-chip">Local Session Store</span>
                </div>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">No saved cases yet.</p>
                ) : (
                  <div className="grid gap-2">
                    {history.map((entry) => (
                      <button key={entry.id} type="button" onClick={() => loadHistoryCase(entry)} className="history-item">
                        <span className="font-semibold text-slate-800">{entry.payload.chief_complaint}</span>
                        <span className="text-xs text-slate-500">{formatDateTime(entry.timestamp)} | {entry.result.urgency_level}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section ref={alertsRef} className="lux-panel mb-5" style={{ animationDelay: '0.12s' }}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Critical Alerts</h2>
                <span className="metric-chip">{criticalItems.length} High Priority</span>
              </div>
              {criticalItems.length === 0 ? (
                <p className="text-sm text-slate-500">No high-priority cases logged yet.</p>
              ) : (
                <div className="grid gap-2">
                  {criticalItems.map((entry) => (
                    <button key={`critical-${entry.id}`} type="button" className="history-item" onClick={() => loadHistoryCase(entry)}>
                      <span className="font-semibold text-slate-800">{entry.payload.chief_complaint}</span>
                      <span className="text-xs font-semibold text-red-700">{entry.result.urgency_level} | {formatDateTime(entry.timestamp)}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="lux-panel glass-sheen" style={{ animationDelay: '0.08s' }}>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-3xl font-semibold text-slate-900">Patient Intake</h2>
                  <span className="metric-chip">Structured Input</span>
                </div>

                <PatientForm onSubmit={onSubmit} loading={loading} initialFormData={initialFormData} />
                {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
              </div>

              <ResultPanel result={result} loading={loading} />
            </section>

            <section ref={auditRef} className="lux-panel mt-6" style={{ animationDelay: '0.2s' }}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Audit Log</h2>
                <span className="metric-chip">Governance Trail</span>
              </div>
              {auditLog.length === 0 ? (
                <p className="text-sm text-slate-500">No events yet. Submit a case to populate logs.</p>
              ) : (
                <div className="grid gap-2">
                  {auditLog.map((log, idx) => (
                    <div key={`${log.time}-${idx}`} className="audit-item">
                      <span className="text-xs font-semibold text-[#8f6d2f]">{formatTime(log.time)}</span>
                      <span className="text-sm font-semibold text-slate-800">{log.event}</span>
                      <span className="text-sm text-slate-600">{log.detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {!historyOpen && <section ref={queueRef} className="hidden" aria-hidden="true" />}
          </div>
        </div>
      </div>
    </main>
  )
}
