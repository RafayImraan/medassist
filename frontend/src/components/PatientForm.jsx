import { useEffect, useState } from 'react'

const defaultForm = {
  age: 35,
  gender: 'Female',
  chief_complaint: '',
  symptoms: '',
  duration: '',
  vitals: {
    temperature: 37,
    heart_rate: 78,
    blood_pressure: '120/80',
    respiratory_rate: 16,
    oxygen_saturation: 98,
  },
  medical_history: '',
  medications: '',
  patient_friendly_mode: false,
}

export default function PatientForm({ onSubmit, loading, initialFormData }) {
  const [form, setForm] = useState(initialFormData || defaultForm)

  useEffect(() => {
    if (initialFormData) {
      setForm(initialFormData)
    }
  }, [initialFormData])

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const updateVitals = (field, value) =>
    setForm((prev) => ({
      ...prev,
      vitals: { ...prev.vitals, [field]: value },
    }))

  const submit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      age: Number(form.age),
      vitals: {
        temperature: Number(form.vitals.temperature),
        heart_rate: Number(form.vitals.heart_rate),
        blood_pressure: form.vitals.blood_pressure,
        respiratory_rate: Number(form.vitals.respiratory_rate),
        oxygen_saturation: Number(form.vitals.oxygen_saturation),
      },
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-600">
          Age
          <input className="lux-input" type="number" min="0" max="120" value={form.age} onChange={(e) => updateField('age', e.target.value)} required />
        </label>
        <label className="text-sm font-semibold text-slate-600">
          Gender
          <input className="lux-input" value={form.gender} onChange={(e) => updateField('gender', e.target.value)} required />
        </label>
      </div>

      <label className="text-sm font-semibold text-slate-600">
        Chief Complaint
        <input className="lux-input" value={form.chief_complaint} onChange={(e) => updateField('chief_complaint', e.target.value)} required />
      </label>

      <label className="text-sm font-semibold text-slate-600">
        Symptoms
        <textarea className="lux-input" rows="3" value={form.symptoms} onChange={(e) => updateField('symptoms', e.target.value)} required />
      </label>

      <label className="text-sm font-semibold text-slate-600">
        Duration
        <input className="lux-input" value={form.duration} onChange={(e) => updateField('duration', e.target.value)} required />
      </label>

      <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] p-4">
        <p className="lux-label mb-3 text-[#8f6d2f]">Vitals</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-semibold text-slate-600">
            Temperature (C)
            <input className="lux-input" type="number" step="0.1" value={form.vitals.temperature} onChange={(e) => updateVitals('temperature', e.target.value)} required />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Heart Rate
            <input className="lux-input" type="number" value={form.vitals.heart_rate} onChange={(e) => updateVitals('heart_rate', e.target.value)} required />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Blood Pressure
            <input className="lux-input" value={form.vitals.blood_pressure} onChange={(e) => updateVitals('blood_pressure', e.target.value)} required />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Respiratory Rate
            <input className="lux-input" type="number" value={form.vitals.respiratory_rate} onChange={(e) => updateVitals('respiratory_rate', e.target.value)} required />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Oxygen Saturation (%)
            <input className="lux-input" type="number" value={form.vitals.oxygen_saturation} onChange={(e) => updateVitals('oxygen_saturation', e.target.value)} required />
          </label>
        </div>
      </div>

      <label className="text-sm font-semibold text-slate-600">
        Medical History
        <textarea className="lux-input" rows="2" value={form.medical_history} onChange={(e) => updateField('medical_history', e.target.value)} />
      </label>

      <label className="text-sm font-semibold text-slate-600">
        Current Medications
        <textarea className="lux-input" rows="2" value={form.medications} onChange={(e) => updateField('medications', e.target.value)} />
      </label>

      <label className="flex items-center gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-soft)] px-3 py-2 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(form.patient_friendly_mode)}
          onChange={(e) => updateField('patient_friendly_mode', e.target.checked)}
        />
        Patient-Friendly Explanation Mode (simple language, no jargon)
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-[#8f6d2f] via-[#b58a3d] to-[#d0ab68] px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  )
}
