import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js'

function makeBar(scene, x, z, height, color) {
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, height, 0.6),
    new THREE.MeshStandardMaterial({ color })
  )
  bar.position.set(x, height / 2, z)
  scene.add(bar)
  return bar
}

export class DataAnalyticsGame {
  constructor(scene) {
    this.scene = scene
    this.objects = []
    this.chartRoots = []
  }

  get mission() {
    return 'Data Analytics: click the chart that shows an upward trend.'
  }

  start() {
    this.dispose()

    const chartDefinitions = [
      { trend: 'up', bars: [1, 1.8, 2.6], color: 0x65b0ff, correct: true },
      { trend: 'down', bars: [2.7, 1.8, 1.1], color: 0xff9f6b, correct: false },
      { trend: 'flat', bars: [1.8, 1.9, 1.8], color: 0xcf7dff, correct: false }
    ]

    chartDefinitions.forEach((chart, chartIndex) => {
      const root = new THREE.Group()
      root.position.set(-4 + chartIndex * 4, 0, 0)
      root.userData = { role: 'chart', correct: chart.correct, trend: chart.trend }

      chart.bars.forEach((value, barIndex) => {
        const bar = makeBar(this.scene, root.position.x - 0.9 + barIndex * 0.9, 0, value, chart.color)
        bar.userData = root.userData
        this.objects.push(bar)
      })

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.2, 1),
        new THREE.MeshStandardMaterial({ color: 0x2a2f3f })
      )
      base.position.set(root.position.x, 0.1, 0)
      base.userData = root.userData
      this.scene.add(base)
      this.objects.push(base)

      this.chartRoots.push(root)
    })
  }

  handleClick(intersection, ui) {
    const { role, correct, trend } = intersection.object.userData
    if (role !== 'chart') {
      return
    }

    if (correct) {
      ui.setFeedback(`Correct! You identified the ${trend} trend.`)
      ui.addScore(2)
      this.start()
    } else {
      ui.setFeedback(`That chart is ${trend}. Look for a clear upward pattern.`)
    }
  }

  update(elapsedTime) {
    this.objects.forEach((object, index) => {
      object.position.z = Math.sin(elapsedTime + index * 0.2) * 0.05
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
    this.chartRoots = []
  }
}
