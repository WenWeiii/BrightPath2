import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js'

export class SoftwareEngineeringGame {
  constructor(scene) {
    this.scene = scene
    this.objects = []
  }

  get mission() {
    return 'Software Engineering: click the green panel that fixes the bug.'
  }

  start() {
    this.dispose()

    const panelGeometry = new THREE.BoxGeometry(2.2, 1.2, 0.2)
    const options = [
      { color: 0xff5b5b, correct: false },
      { color: 0x59e37d, correct: true },
      { color: 0xffd15c, correct: false },
      { color: 0x6ea8ff, correct: false }
    ]

    options.forEach((option, index) => {
      const material = new THREE.MeshStandardMaterial({ color: option.color })
      const panel = new THREE.Mesh(panelGeometry, material)
      panel.position.set(-4 + index * 2.7, 1.2, 0)
      panel.userData = { role: 'codePanel', correct: option.correct }
      this.scene.add(panel)
      this.objects.push(panel)
    })

    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.4, 1),
      new THREE.MeshStandardMaterial({ color: 0x26334f })
    )
    rack.position.set(0, 0.2, 0)
    this.scene.add(rack)
    this.objects.push(rack)
  }

  handleClick(intersection, ui) {
    const target = intersection.object
    if (target.userData.role !== 'codePanel') {
      return
    }

    if (target.userData.correct) {
      target.material.color.setHex(0x26ff7a)
      ui.setFeedback('Correct! Bug fixed and deployment passed.')
      ui.addScore(2)
      this.start()
    } else {
      target.material.color.setHex(0x8b1c1c)
      ui.setFeedback('Not quite. That patch introduced a new issue.')
    }
  }

  update(elapsedTime) {
    this.objects.forEach((object, index) => {
      if (object.userData.role === 'codePanel') {
        object.position.y = 1.2 + Math.sin(elapsedTime * 1.5 + index) * 0.15
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
