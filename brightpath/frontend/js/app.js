// Minimal frontend JS to call backend endpoints and render results.
async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

function parseList(str) {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean)
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profile-form')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const skills = parseList(document.getElementById('skills').value)
    const interests = parseList(document.getElementById('interests').value)
    const education = document.getElementById('education').value

    const resultsEl = document.getElementById('results')
    resultsEl.innerHTML = '<p>Loading recommendations...</p>'

    try {
      const payload = { skills, interests, education }
      const data = await postJson('/recommend', payload)
      renderResults(data, resultsEl)
    } catch (err) {
      resultsEl.textContent = 'Failed to fetch recommendations.'
    }
  })
})

function renderResults(data, container) {
  if (!data || !data.recommendations) {
    container.innerHTML = '<p>No recommendations found.</p>'
    return
  }
  const list = data.recommendations.map(r => {
    const missing = (r.missing_skills || []).join(', ') || 'None'
    return `<div class="results-card"><h3>${r.career} <small>(${(r.score*100).toFixed(0)}%)</small></h3><p>${r.description || ''}</p><p><strong>Missing:</strong> ${missing}</p></div>`
  }).join('\n')
  container.innerHTML = list
}
