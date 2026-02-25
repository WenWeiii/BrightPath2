// BrightPath frontend logic: validation, preferences, toasts, and dashboard rendering

function qs(id){ return document.getElementById(id) }

const TOAST_AUTO_FOCUS_KEY = 'brightpath_toast_auto_focus'
const BRIGHTPATH_SESSION_KEY = 'brightpath_session_id'
const FIREBASE_FALLBACK_TOAST_KEY = 'brightpath_firebase_fallback_toast_shown'

let firebaseDb = null
let firebaseInitAttempted = false

function getFirebaseConfig(){
  const config = window.BRIGHTPATH_FIREBASE_CONFIG
  if(!config || typeof config !== 'object') return null

  const required = ['apiKey', 'authDomain', 'projectId', 'appId']
  const hasRequiredFields = required.every((key)=> Boolean(config[key]))
  return hasRequiredFields ? config : null
}

function initFirebase(){
  if(firebaseInitAttempted) return firebaseDb
  firebaseInitAttempted = true

  try{
    const config = getFirebaseConfig()
    if(!config){
      console.warn('Firebase config is missing. Running in local-only mode.')
      return null
    }

    if(!window.firebase || !window.firebase.firestore){
      console.warn('Firebase SDK is unavailable. Running in local-only mode.')
      return null
    }

    if(!window.firebase.apps.length){
      window.firebase.initializeApp(config)
    }

    firebaseDb = window.firebase.firestore()
    return firebaseDb
  } catch(err){
    console.warn('Firebase initialization failed. Running in local-only mode.', err)
    firebaseDb = null
    return null
  }
}

function getSessionId(createIfMissing = true){
  const existing = localStorage.getItem(BRIGHTPATH_SESSION_KEY)
  if(existing) return existing
  if(!createIfMissing) return null

  const generated = (window.crypto && window.crypto.randomUUID)
    ? window.crypto.randomUUID()
    : `session_${Date.now()}_${Math.random().toString(16).slice(2)}`

  localStorage.setItem(BRIGHTPATH_SESSION_KEY, generated)
  return generated
}

// Example Firestore write: stores the student's current profile under a stable session id.
async function saveStudentProfile(profile){
  const db = initFirebase()
  if(!db) return { ok: false, reason: 'firebase-unavailable' }

  try{
    const sessionId = getSessionId(true)
    await db.collection('studentProfiles').doc(sessionId).set({
      sessionId,
      profile,
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      clientUpdatedAt: new Date().toISOString()
    }, { merge: true })
    return { ok: true, sessionId }
  } catch(err){
    console.warn('Profile save to Firestore failed. Continuing without cloud storage.', err)
    return { ok: false, reason: 'write-failed' }
  }
}

// Example Firestore write: stores recommendation response for dashboard recovery.
async function saveCareerRecommendations(result, profile){
  const db = initFirebase()
  if(!db) return { ok: false, reason: 'firebase-unavailable' }

  try{
    const sessionId = getSessionId(true)
    await db.collection('careerRecommendations').doc(sessionId).set({
      sessionId,
      profile,
      result,
      recommendationCount: (result.recommendations || []).length,
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      clientUpdatedAt: new Date().toISOString()
    }, { merge: true })
    return { ok: true, sessionId }
  } catch(err){
    console.warn('Recommendation save to Firestore failed. Continuing with local data.', err)
    return { ok: false, reason: 'write-failed' }
  }
}

// Example Firestore read: retrieves the latest recommendation payload for this browser session.
async function loadCareerRecommendations(){
  const db = initFirebase()
  const sessionId = getSessionId(false)
  if(!db || !sessionId) return null

  try{
    const snapshot = await db.collection('careerRecommendations').doc(sessionId).get()
    if(!snapshot.exists) return null
    const data = snapshot.data() || {}
    return data.result || null
  } catch(err){
    console.warn('Recommendation read from Firestore failed. Falling back to local data.', err)
    return null
  }
}

function systemPrefersReducedMotion(){
  return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
}

function getToastAutoFocusPreference(){
  const raw = localStorage.getItem(TOAST_AUTO_FOCUS_KEY)
  if(raw === null){
    return !systemPrefersReducedMotion()
  }
  return raw === 'true'
}

function setToastAutoFocusPreference(value){
  localStorage.setItem(TOAST_AUTO_FOCUS_KEY, String(Boolean(value)))
}

function parseCSV(value){
  return (value || '').split(',').map(s=>s.trim()).filter(Boolean)
}

function isSmallViewport(maxWidth = 768){
  return Boolean(window.matchMedia && window.matchMedia(`(max-width: ${maxWidth}px)`).matches)
}

function setFieldError(fieldId, message){
  const field = qs(fieldId)
  const error = qs(fieldId + 'Error')
  if(!field || !error) return
  error.textContent = message || ''
  field.classList.toggle('input-error', Boolean(message))
  field.setAttribute('aria-invalid', message ? 'true' : 'false')
}

function setFieldHint(fieldId, message, ok=false){
  const hint = qs(fieldId + 'Hint')
  if(!hint) return
  hint.textContent = message || ''
  hint.classList.toggle('ok', Boolean(ok))
}

function setFieldCount(fieldId, count, limit){
  const counter = qs(fieldId + 'Count')
  if(!counter) return
  counter.textContent = `${count} / ${limit}`
  counter.classList.toggle('warn', count >= Math.ceil(limit * 0.8) && count <= limit)
  counter.classList.toggle('error', count > limit)
}

function clearFormError(){
  const box = qs('formError')
  if(!box) return
  box.style.display = 'none'
  box.textContent = ''
}

function setFormError(message){
  const box = qs('formError')
  if(!box) return
  box.textContent = message
  box.style.display = 'block'
}

function validateProfileForm(){
  const skills = parseCSV(qs('skills')?.value)
  const interests = parseCSV(qs('interests')?.value)
  const education = qs('education')?.value || ''
  let valid = true

  clearFormError()

  if(skills.length === 0){
    setFieldError('skills', 'Enter at least one skill.')
    setFieldHint('skills', '')
    valid = false
  } else if(skills.length > 20){
    setFieldError('skills', 'Please limit to 20 skills for better matching.')
    setFieldHint('skills', '')
    valid = false
  } else {
    setFieldError('skills', '')
    setFieldHint('skills', 'Looks good.', true)
  }
  setFieldCount('skills', skills.length, 20)

  if(interests.length > 15){
    setFieldError('interests', 'Please limit to 15 interests.')
    setFieldHint('interests', '')
    valid = false
  } else {
    setFieldError('interests', '')
    if(interests.length > 0) setFieldHint('interests', 'Great, interests added.', true)
    else setFieldHint('interests', '')
  }
  setFieldCount('interests', interests.length, 15)

  if(!education){
    setFieldError('education', 'Select your education level.')
    valid = false
  } else {
    setFieldError('education', '')
  }

  if(!valid){
    setFormError('Please fix the highlighted fields before continuing.')
  }

  return { valid, payload: { skills, interests, education } }
}

function setBusy(button, busy){
  if(!button) return
  if(busy){
    button.disabled = true
    button._orig = button.innerHTML
    button.innerHTML = `<span class="spinner" aria-hidden="true"></span> Processing...`
  } else {
    button.disabled = false
    if(button._orig) button.innerHTML = button._orig
  }
}

function ensureToastStack(){
  let stack = qs('toastStack')
  if(stack) return stack
  stack = document.createElement('div')
  stack.id = 'toastStack'
  stack.className = 'toast-stack'
  document.body.appendChild(stack)
  return stack
}

function getToastDuration(type='info'){
  if(type === 'success') return getRedirectDelay()
  return 3200
}

function isMobileViewport(){
  return isSmallViewport(768)
}

function removeToast(item){
  if(!item) return
  item.style.opacity = '0'
  item.style.transform = 'translateY(6px)'
  window.setTimeout(()=> item.remove(), 200)
}

function dismissLatestToast(){
  const stack = qs('toastStack')
  if(!stack) return
  const latest = stack.lastElementChild
  if(latest) removeToast(latest)
}

let keyboardNavigationMode = false
if(!window.__brightpathInputModeBound){
  window.addEventListener('keydown', (event)=>{
    if(event.key === 'Tab') keyboardNavigationMode = true
  })
  window.addEventListener('mousedown', ()=>{ keyboardNavigationMode = false })
  window.addEventListener('touchstart', ()=>{ keyboardNavigationMode = false }, { passive: true })
  window.__brightpathInputModeBound = true
}

if(!window.__brightpathEscToastBound){
  window.addEventListener('keydown', (event)=>{
    if(event.key === 'Escape'){
      dismissLatestToast()
    }
  })
  window.__brightpathEscToastBound = true
}

function toast(msg, type='info', duration){
  const stack = ensureToastStack()
  const item = document.createElement('div')
  item.className = `toast ${type}`
  item.setAttribute('role', 'status')
  item.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite')

  const text = document.createElement('span')
  text.textContent = msg
  item.appendChild(text)

  const closeBtn = document.createElement('button')
  closeBtn.className = 'toast-close'
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', 'Dismiss notification')
  closeBtn.title = 'Dismiss notification'
  closeBtn.textContent = '×'
  closeBtn.addEventListener('click', ()=> removeToast(item))
  item.appendChild(closeBtn)

  stack.appendChild(item)

  const ttl = typeof duration === 'number' ? duration : getToastDuration(type)
  const persistentMobileError = type === 'error' && isMobileViewport()

  // Keyboard accessibility: focus dismiss control for keyboard users on important toasts.
  if(getToastAutoFocusPreference() && keyboardNavigationMode && (type === 'error' || type === 'success')){
    window.setTimeout(()=> closeBtn.focus({ preventScroll: true }), 0)
  }

  if(!persistentMobileError){
    let remaining = ttl
    let timerId = null
    let startedAt = 0
    let dismissed = false

    const scheduleDismiss = () => {
      if(dismissed) return
      startedAt = Date.now()
      timerId = window.setTimeout(()=>{
        dismissed = true
        removeToast(item)
      }, remaining)
    }

    const pauseDismiss = () => {
      if(!timerId || dismissed) return
      window.clearTimeout(timerId)
      timerId = null
      remaining = Math.max(0, remaining - (Date.now() - startedAt))
    }

    const resumeDismiss = () => {
      if(dismissed || timerId || remaining <= 0) return
      scheduleDismiss()
    }

    // Desktop accessibility: pause auto-dismiss while hovering/focused.
    if(!isMobileViewport()){
      item.addEventListener('mouseenter', pauseDismiss)
      item.addEventListener('mouseleave', resumeDismiss)
      item.addEventListener('focusin', pauseDismiss)
      item.addEventListener('focusout', (event)=>{
        if(!item.contains(event.relatedTarget)) resumeDismiss()
      })
    }

    closeBtn.addEventListener('click', ()=>{
      dismissed = true
      if(timerId) window.clearTimeout(timerId)
    })

    scheduleDismiss()
  }
}

function getRedirectDelay(){
  const isMobile = isSmallViewport(768)
  return isMobile ? 1200 : 700
}

// Handle profile submission
document.addEventListener('submit', async (e)=>{
  if(e.target && e.target.id === 'profileForm'){
    e.preventDefault()
    const submit = e.target.querySelector('button[type=submit]')
    const { valid, payload } = validateProfileForm()
    if(!valid){
      const firstInvalid = document.querySelector('.input-error')
      if(firstInvalid) firstInvalid.focus()
      return
    }

    setBusy(submit, true)
    try{
      await saveStudentProfile(payload)

      const res = await fetch('/api/proxy?path=backend/recommend', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
      })
      if(!res.ok) throw new Error('Server error')
      const data = await res.json()
      localStorage.setItem('brightpath_result', JSON.stringify(data))

      // Fire-and-forget cloud persistence to keep UX responsive.
      saveCareerRecommendations(data, payload)

      toast('Recommendations ready! Redirecting to dashboard…', 'success')
      window.setTimeout(()=>{
        window.location.href = 'dashboard.html'
      }, getRedirectDelay())
    }catch(err){
      console.error(err)
      setFormError('Could not reach the server. Please try again.')
      toast('Could not reach the server. Please try again.', 'error')
    } finally { setBusy(submit, false) }
  }
})

document.addEventListener('DOMContentLoaded', ()=>{
  const profileForm = qs('profileForm')
  if(profileForm){
    const skills = qs('skills')
    const interests = qs('interests')
    const education = qs('education')

    if(skills){
      skills.addEventListener('input', ()=>{
        const list = parseCSV(skills.value)
        setFieldCount('skills', list.length, 20)
        if(list.length > 0 && list.length <= 20){
          setFieldError('skills', '')
          setFieldHint('skills', 'Looks good.', true)
        } else if(list.length === 0){
          setFieldHint('skills', '')
        }
      })
      skills.addEventListener('blur', ()=> validateProfileForm())
    }

    if(interests){
      interests.addEventListener('input', ()=>{
        const list = parseCSV(interests.value)
        setFieldCount('interests', list.length, 15)
        if(list.length <= 15){
          setFieldError('interests', '')
          setFieldHint('interests', list.length ? 'Great, interests added.' : '', list.length > 0)
        }
      })
      interests.addEventListener('blur', ()=> validateProfileForm())
    }

    if(education){
      education.addEventListener('change', ()=> setFieldError('education', ''))
    }

    const toastToggle = qs('toastAutoFocusToggle')
    if(toastToggle){
      toastToggle.checked = getToastAutoFocusPreference()
      toastToggle.addEventListener('change', ()=>{
        setToastAutoFocusPreference(toastToggle.checked)
        toast('Settings saved.', 'success', 1500)
      })
    }

    // initialize counters on page load
    setFieldCount('skills', parseCSV(skills?.value || '').length, 20)
    setFieldCount('interests', parseCSV(interests?.value || '').length, 15)
  }
})

// Render dashboard
document.addEventListener('DOMContentLoaded', async ()=>{
  const resultsEl = qs('results')
  if(!resultsEl) return
  const DASHBOARD_VIEW_KEY = 'brightpath_dashboard_view'
  const firebaseConnected = Boolean(initFirebase())
  const firebaseBadgeClass = firebaseConnected ? 'online' : 'offline'
  const firebaseBadgeLabel = firebaseConnected ? 'Firebase connected' : 'Local-only mode'

  const getViewMode = () => {
    const mode = localStorage.getItem(DASHBOARD_VIEW_KEY)
    if(mode === 'compact' || mode === 'detailed') return mode
    const isSmallScreen = isSmallViewport(900)
    return isSmallScreen ? 'compact' : 'detailed'
  }

  const setViewMode = (mode) => {
    localStorage.setItem(DASHBOARD_VIEW_KEY, mode)
    resultsEl.classList.toggle('dashboard-compact', mode === 'compact')
    const compactBtn = document.getElementById('viewCompact')
    const detailedBtn = document.getElementById('viewDetailed')
    if(compactBtn) compactBtn.classList.toggle('is-active', mode === 'compact')
    if(detailedBtn) detailedBtn.classList.toggle('is-active', mode === 'detailed')
  }

  if(!firebaseConnected && !localStorage.getItem(FIREBASE_FALLBACK_TOAST_KEY)){
    toast('Cloud save is unavailable. Running in local-only mode.', 'info', 3800)
    localStorage.setItem(FIREBASE_FALLBACK_TOAST_KEY, 'true')
  }

  const remoteData = await loadCareerRecommendations()
  if(remoteData){
    localStorage.setItem('brightpath_result', JSON.stringify(remoteData))
  }

  const raw = localStorage.getItem('brightpath_result')
  if(!raw){ resultsEl.innerHTML = '<div class="result"><p class="muted">No results found. Please complete your profile first.</p></div>'; return }
  const data = JSON.parse(raw)

  const recommendations = (data.recommendations || []).slice(0, 6)
  const avgMatch = recommendations.length
    ? Math.round(recommendations.reduce((sum, rec) => sum + Math.round((rec.score || 0) * 100), 0) / recommendations.length)
    : 0

  const controls = `<div class="dashboard-actions"><button class="btn" onclick="window.location.href='profile.html'">&larr; Edit Profile</button><button class="btn secondary" onclick="localStorage.removeItem('brightpath_result');location.reload()">Clear</button><span class="firebase-status ${firebaseBadgeClass}" aria-live="polite">${firebaseBadgeLabel}</span><div class="view-toggle"><button id="viewCompact" type="button" class="toggle-btn">Compact</button><button id="viewDetailed" type="button" class="toggle-btn is-active">Detailed</button></div></div>`

  const topSummary = `
    <div class="summary-card">
      <div class="label">Overview</div>
      <h3 class="summary-title">${recommendations.length} Career Matches</h3>
      <p class="small summary-subtitle">Average compatibility score: <strong>${avgMatch}%</strong></p>
    </div>
  `

  const cards = recommendations.map((r, idx) => {
    const pct = Math.round((r.score || 0) * 100)
    const missing = (r.missing && r.missing.length) ? r.missing : []
    const chips = missing.length
      ? missing.map(item => `<span class="skill-chip">${item}</span>`).join('')
      : `<span class="skill-chip ok">No immediate gaps</span>`
    const resources = (r.resources || []).map(rs => `<a class="resource" href="#" onclick="window.open('${encodeURI(rs)}','_blank')">${rs}</a>`).join('')
    const icons = ['🧭','💡','📈','🛠️','🔬','🎯']
    const icon = icons[idx % icons.length]

    return `
      <article class="rec-card">
        <div class="rec-head">
          <div class="rec-title"><span class="rec-icon" aria-hidden="true">${icon}</span><span>${r.title}</span></div>
          <span class="score-pill">${pct}% match</span>
        </div>

        <div class="label">Compatibility</div>
        <div class="progress" aria-label="${pct}% match"><i style="width:${pct}%"></i></div>
        <div class="meta-row"><span class="small">Strong fit signals based on your profile</span></div>

        <div class="resources-title label">Skill Gaps</div>
        <div class="skill-list">${chips}</div>

        <div class="learn-section">
          <div class="resources-title label">Suggested Learning</div>
          <div class="resources">${resources || '<span class="small">No resources provided.</span>'}</div>
        </div>
      </article>
    `
  }).join('')

  const globalGaps = (data.skill_gaps && data.skill_gaps.length)
    ? data.skill_gaps.map(g => `<span class="skill-chip">${g}</span>`).join('')
    : '<span class="skill-chip ok">No major skill gaps detected</span>'

  const allResources = (data.suggested_resources || []).map(s => `<a class="resource" href="#" onclick="window.open('${encodeURI(s)}','_blank')">${s}</a>`).join('')

  const panels = `
    <div class="summary-panels">
      <section class="summary-card">
        <div class="label">Global Skill Gaps</div>
        <div class="skill-list summary-list">${globalGaps}</div>
      </section>
      <section class="summary-card">
        <div class="label">Recommended Resources</div>
        <div class="resources summary-list">${allResources || '<span class="small">No resources available.</span>'}</div>
      </section>
    </div>
  `

  resultsEl.innerHTML = `${controls}${topSummary}<section class="dashboard-grid">${cards}</section>${panels}`

  const compactBtn = document.getElementById('viewCompact')
  const detailedBtn = document.getElementById('viewDetailed')
  if(compactBtn) compactBtn.addEventListener('click', ()=> setViewMode('compact'))
  if(detailedBtn) detailedBtn.addEventListener('click', ()=> setViewMode('detailed'))
  setViewMode(getViewMode())
})
