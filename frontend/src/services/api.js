const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function analyzePatient(payload) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to analyze patient data')
  }

  return response.json()
}
