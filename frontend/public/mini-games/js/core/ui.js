export function createUIController() {
  const missionText = document.getElementById('missionText')
  const feedbackText = document.getElementById('feedbackText')
  const scoreText = document.getElementById('scoreText')
  const progressText = document.getElementById('progressText')

  let score = 0
  const listeners = []

  function notifyScoreChange() {
    listeners.forEach((listener) => listener(score))
  }

  return {
    setMission(text) {
      missionText.textContent = text
    },
    setFeedback(text) {
      feedbackText.textContent = text
    },
    setProgress(text) {
      progressText.textContent = text
    },
    resetScore() {
      score = 0
      scoreText.textContent = String(score)
      notifyScoreChange()
    },
    addScore(points = 1) {
      score += points
      scoreText.textContent = String(score)
      notifyScoreChange()
    },
    setScore(value = 0) {
      score = Math.max(0, Number(value) || 0)
      scoreText.textContent = String(score)
      notifyScoreChange()
    },
    getScore() {
      return score
    },
    onScoreChange(listener) {
      listeners.push(listener)
    }
  }
}
