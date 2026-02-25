import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js'

export class UXDesignerGame {
  constructor(scene) {
    this.scene = scene
    this.objects = []
  }

  get mission() {
    return 'UX Designer: click the layout with the clearest visual hierarchy.'
  }

  start() {
    this.dispose()

    const layouts = [
      { type: 'cluttered', color: 0xff8d8d, correct: false },
      { type: 'balanced', color: 0x70d9ff, correct: true },
      { type: 'misaligned', color: 0xffcf7a, correct: false }
    ]

    layouts.forEach((layout, index) => {
      const panel = new THREE.Group()
      panel.position.set(-4 + index * 4, 1.4, 0)

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 2.1, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x223148 })
      )
      base.userData = { role: 'uxLayout', type: layout.type, correct: layout.correct }
      panel.add(base)

      if (layout.type === 'balanced') {
        this.makeBlock(panel, 0, 0.5, 1.8, 0.35, layout.color, base.userData)
        this.makeBlock(panel, -0.6, -0.15, 0.7, 0.25, layout.color, base.userData)
        this.makeBlock(panel, 0.45, -0.15, 0.95, 0.25, layout.color, base.userData)
      } else if (layout.type === 'cluttered') {
        this.makeBlock(panel, -0.4, 0.55, 1.7, 0.25, layout.color, base.userData)
        this.makeBlock(panel, 0.5, 0.05, 1.6, 0.65, layout.color, base.userData)
        this.makeBlock(panel, -0.6, -0.65, 1.9, 0.45, layout.color, base.userData)
      } else {
        this.makeBlock(panel, -0.75, 0.45, 1.0, 0.3, layout.color, base.userData)
        this.makeBlock(panel, 0.35, 0.0, 1.4, 0.3, layout.color, base.userData)
        this.makeBlock(panel, -0.15, -0.6, 0.8, 0.3, layout.color, base.userData)
      }

      panel.children.forEach((child) => {
        child.position.z = 0.08
        this.scene.add(child)
        this.objects.push(child)
      })
    })
  }

  makeBlock(group, x, y, w, h, color, userData) {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.08),
      new THREE.MeshStandardMaterial({ color })
    )
    block.position.set(x, y, 0)
    block.userData = userData
    group.add(block)
  }

  handleClick(intersection, ui) {
    const target = intersection.object
    if (target.userData.role !== 'uxLayout') {
      return
    }

    if (target.userData.correct) {
      ui.setFeedback('Correct! Balanced spacing and hierarchy improve usability.')
      ui.addScore(2)
      this.start()
    } else {
      ui.setFeedback(`This ${target.userData.type} layout hurts readability.`)
    }
  }

  update(elapsedTime) {
    this.objects.forEach((object, index) => {
      if (object.userData.role === 'uxLayout') {
        object.position.y += Math.sin(elapsedTime * 1.3 + index * 0.2) * 0.0008
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
