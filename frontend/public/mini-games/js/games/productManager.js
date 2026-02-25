import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js'

export class ProductManagerGame {
  constructor(scene) {
    this.scene = scene
    this.objects = []
  }

  get mission() {
    return 'Product Manager: click the task with highest user impact.'
  }

  start() {
    this.dispose()

    const tasks = [
      { label: 'Button Color', score: 1, color: 0x7da8ff, correct: false },
      { label: 'Crash Fix', score: 5, color: 0x6de08f, correct: true },
      { label: 'Logo Size', score: 2, color: 0xffc26d, correct: false },
      { label: 'New Sticker', score: 1, color: 0xcf8aff, correct: false }
    ]

    tasks.forEach((task, index) => {
      const card = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 1.1, 0.2),
        new THREE.MeshStandardMaterial({ color: task.color })
      )
      card.position.set(-3.8 + index * 2.6, 1.4, 0)
      card.userData = {
        role: 'pmTask',
        label: task.label,
        score: task.score,
        correct: task.correct
      }
      this.scene.add(card)
      this.objects.push(card)
    })

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 0.3, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x27314a })
    )
    board.position.set(0, 0.25, 0)
    this.scene.add(board)
    this.objects.push(board)
  }

  handleClick(intersection, ui) {
    const target = intersection.object
    if (target.userData.role !== 'pmTask') {
      return
    }

    if (target.userData.correct) {
      target.material.color.setHex(0x22ff7e)
      ui.setFeedback(`Correct! ${target.userData.label} gives the biggest impact.`)
      ui.addScore(2)
      this.start()
    } else {
      ui.setFeedback(`${target.userData.label} helps, but impact is lower than crash fixes.`)
    }
  }

  update(elapsedTime) {
    this.objects.forEach((object, index) => {
      if (object.userData.role === 'pmTask') {
        object.rotation.y = Math.sin(elapsedTime + index) * 0.08
      }
    })
  }

  dispose() {
    for (const object of this.objects) {
      this.scene.remove(object)
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        object.material.dispose()
      }
    }
    this.objects = []
  }
}
