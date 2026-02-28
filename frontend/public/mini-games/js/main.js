import { createBaseScene } from './core/scene.js'
import { createUIController } from './core/ui.js'
import { SoftwareEngineeringGame } from './games/softwareEngineering.js'
import { DataAnalyticsGame } from './games/dataAnalytics.js'
import { CybersecurityGame } from './games/cybersecurity.js'
import { ProductManagerGame } from './games/productManager.js'
import { UXDesignerGame } from './games/uxDesigner.js'
import { CloudEngineerGame } from './games/cloudEngineer.js'

const container = document.getElementById('gameCanvas')
const engine = createBaseScene(container)
const ui = createUIController()
const resetProgressBtn = document.getElementById('resetProgressBtn')
const badgesList = document.getElementById('badgesList')
const badgeToast = document.getElementById('badgeToast')
const soundToggleInput = document.getElementById('soundToggleInput')
const SCORE_STORAGE_KEY = 'brightpath-mini-games-score'
const BADGES_STORAGE_KEY = 'brightpath-mini-games-badges'
const SOUND_STORAGE_KEY = 'brightpath-mini-games-badge-sound-enabled'
let badgeToastTimeoutId = null
let soundEnabled = false
let audioContext = null

const progression = [
  { key: 'software', label: 'Software Engineering', unlockAt: 0 },
  { key: 'data', label: 'Data Analytics', unlockAt: 2 },
  { key: 'cyber', label: 'Cybersecurity', unlockAt: 4 },
  { key: 'pm', label: 'Product Manager', unlockAt: 6 },
  { key: 'ux', label: 'UX Designer', unlockAt: 8 },
  { key: 'cloud', label: 'Cloud Engineer', unlockAt: 10 }
]

const badgeMilestones = [
  { key: 'debugger', label: 'Debugger', unlockAt: 2 },
  { key: 'analyst', label: 'Analyst', unlockAt: 4 },
  { key: 'defender', label: 'Defender', unlockAt: 6 },
  { key: 'strategist', label: 'Strategist', unlockAt: 8 },
  { key: 'designer', label: 'Designer', unlockAt: 10 },
  { key: 'cloud-operator', label: 'Cloud Operator', unlockAt: 12 }
]

const games = {
  software: new SoftwareEngineeringGame(engine.scene),
  data: new DataAnalyticsGame(engine.scene),
  cyber: new CybersecurityGame(engine.scene),
  pm: new ProductManagerGame(engine.scene),
  ux: new UXDesignerGame(engine.scene),
  cloud: new CloudEngineerGame(engine.scene)
}

let activeGame = null
const gameButtons = new Map()
const earnedBadges = new Set()

//Update the badgesList element by clearing its content and appending a list item for each badge found in the earnedBadges set.
function renderBadges() {
  if (!badgesList) {
    return
  }

  badgesList.innerHTML = ''

  if (earnedBadges.size === 0) {
    const empty = document.createElement('li')
    empty.textContent = 'No badges yet. Keep playing!'
    badgesList.appendChild(empty)
    return
  }

  badgeMilestones.forEach((badge) => {
    if (!earnedBadges.has(badge.key)) {
      return
    }
    const item = document.createElement('li')
    item.className = 'badge'
    item.textContent = badge.label
    badgesList.appendChild(item)
  })
}

function saveBadges() {
  localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(Array.from(earnedBadges)))
}

function playBadgeSound() {
  if (!soundEnabled) {
    return
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) {
    return
  }

  if (!audioContext) {
    audioContext = new AudioCtx()
  }

  // Create the sound timing and audio nodes by getting the current audio clock
  const now = audioContext.currentTime
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()

  //Set the oscillator to a triangle waveform, start it at 660 Hz
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(660, now)
  oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.14)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.2)
}

//This function safely shows a badge notification message by updating the toast text
function showBadgeToast(message) {
  if (!badgeToast) {
    return
  }
  if (badgeToastTimeoutId) {
    clearTimeout(badgeToastTimeoutId)
  }

  badgeToast.textContent = message
  badgeToast.classList.add('show')

  badgeToastTimeoutId = setTimeout(() => {
    badgeToast.classList.remove('show')
    badgeToastTimeoutId = null
  }, 1800)
}

//check each badge milestone against the current score,
//add newly earned badges, save and re-render if any were unlocked, then return the list of new badge names.
function unlockBadgesForScore(score) {
  const unlockedNow = []

  badgeMilestones.forEach((badge) => {
    if (score >= badge.unlockAt && !earnedBadges.has(badge.key)) {
      earnedBadges.add(badge.key)
      unlockedNow.push(badge.label)
    }
  })

  if (unlockedNow.length > 0) {
    saveBadges()
    renderBadges()
  }

  return unlockedNow
}

//This function checks whether a game should be available to play
function isUnlocked(gameName) {
  const step = progression.find((item) => item.key === gameName)
  if (!step) {
    return false
  }
  return ui.getScore() >= step.unlockAt
}

//This function loops through all game buttons and makes only the selected game’s button look active by toggling the active CSS class
function setActiveButton(name) {
  gameButtons.forEach((button, gameName) => {
    button.classList.toggle('active', gameName === name)
  })
}

//This function refreshes progression UI by checking the current score, enabling/disabling each game button based on unlock status,
//and showing either the next unlock target or an “all unlocked” message.
function updateProgressionUI() {
  const currentScore = ui.getScore()
  gameButtons.forEach((button, gameName) => {
    button.disabled = !isUnlocked(gameName)
  })

  const nextLocked = progression.find((step) => currentScore < step.unlockAt)
  if (nextLocked) {
    ui.setProgress(
      `Next unlock: ${nextLocked.label} at ${nextLocked.unlockAt} points (current ${currentScore}).`
    )
  } else {
    ui.setProgress('All careers unlocked. Great job exploring every role!')
  }
}

//This function switches to a selected game only if it’s unlocked, cleans up the current game if one is running, starts the new game, 
//highlights its button, updates the mission text, and shows a ready-to-play message.
function switchGame(name) {
  if (!isUnlocked(name)) {
    ui.setFeedback('This role is locked. Earn more points to unlock it.')
    return
  }

  if (activeGame) {
    activeGame.dispose()
  }

  activeGame = games[name]
  activeGame.start()
  setActiveButton(name)
  ui.setMission(activeGame.mission)
  ui.setFeedback('Game loaded. Click interactive objects to play.')
}

document.querySelectorAll('[data-game]').forEach((button) => {
  gameButtons.set(button.dataset.game, button)
  button.addEventListener('click', () => {
    switchGame(button.dataset.game)
  })
})

ui.onScoreChange(() => {
  const currentScore = ui.getScore()
  localStorage.setItem(SCORE_STORAGE_KEY, String(currentScore))
  const unlockedNow = unlockBadgesForScore(currentScore)
  updateProgressionUI()
  if (unlockedNow.length > 0) {
    showBadgeToast(`Badge unlocked: ${unlockedNow.join(', ')}`)
    playBadgeSound()
    ui.setFeedback('New badge earned! Check the Badges section.')
  }
})

if (soundToggleInput) {
  soundToggleInput.addEventListener('change', () => {
    soundEnabled = soundToggleInput.checked
    localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? '1' : '0')
  })
}

if (resetProgressBtn) {
  resetProgressBtn.addEventListener('click', () => {
    ui.resetScore()
    localStorage.setItem(SCORE_STORAGE_KEY, '0')
    earnedBadges.clear()
    saveBadges()
    renderBadges()
    switchGame('software')
    ui.setFeedback('Progress reset. Start unlocking careers again.')
  })
}

engine.renderer.domElement.addEventListener('pointerdown', (event) => {
  const rect = engine.renderer.domElement.getBoundingClientRect()
  engine.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  engine.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  engine.raycaster.setFromCamera(engine.pointer, engine.camera)
  const intersections = engine.raycaster.intersectObjects(engine.scene.children, true)

  if (intersections.length > 0 && activeGame) {
    activeGame.handleClick(intersections[0], ui)
  }
})


//This animate function is the game loop that converts frame time to seconds, updates the active mini-game each frame, 
//renders the Three.js scene, and schedules itself again for smooth continuous animation.
function animate(time) {
  const seconds = time * 0.001
  if (activeGame) {
    activeGame.update(seconds)
  }
  engine.renderer.render(engine.scene, engine.camera)
  requestAnimationFrame(animate)
}

const storedScore = Number(localStorage.getItem(SCORE_STORAGE_KEY) || '0')
const storedBadges = JSON.parse(localStorage.getItem(BADGES_STORAGE_KEY) || '[]')
soundEnabled = localStorage.getItem(SOUND_STORAGE_KEY) === '1'

if (soundToggleInput) {
  soundToggleInput.checked = soundEnabled
}

if (Array.isArray(storedBadges)) {
  storedBadges.forEach((badgeKey) => {
    earnedBadges.add(String(badgeKey))
  })
}

renderBadges()
ui.setScore(storedScore)         //sets the app’s current score to the value loaded from storage
switchGame('Banana Milkshake Game')           // Start with the first game unlocked by default
requestAnimationFrame(animate)
