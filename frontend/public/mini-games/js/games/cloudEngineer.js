import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js'

export class CloudEngineerGame {
  constructor(scene) {
    this.scene = scene
    this.objects = []
  }

  get mission() {
    return 'Cloud Engineer: click the healthy service path (all green nodes).'
  }

  start() {
    this.dispose()

    const paths = [
      {
        nodes: [0x6fe08f, 0x6fe08f, 0x6fe08f],
        x: -4,
        correct: true,
        name: 'Healthy'
      },
      {
        nodes: [0x6fe08f, 0xff5959, 0x6fe08f],
        x: 0,
        correct: false,
        name: 'Unstable'
      },
      {
        nodes: [0xff5959, 0x6fe08f, 0xff5959],
        x: 4,
        correct: false,
        name: 'Failing'
      }
    ]

    paths.forEach((path) => {
      for (let index = 0; index < path.nodes.length; index += 1) {
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 18, 18),
          new THREE.MeshStandardMaterial({ color: path.nodes[index] })
        )
        node.position.set(path.x, 0.8 + index * 1.1, 0)
        node.userData = { role: 'cloudPath', correct: path.correct, name: path.name }
        this.scene.add(node)
        this.objects.push(node)

        if (index > 0) {
          const previous = new THREE.Vector3(path.x, 0.8 + (index - 1) * 1.1, 0)
          const current = new THREE.Vector3(path.x, 0.8 + index * 1.1, 0)
          const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([previous, current]),
            new THREE.LineBasicMaterial({ color: 0x5b7099 })
          )
          line.userData = node.userData
          this.scene.add(line)
          this.objects.push(line)
        }
      }

      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.25, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x263149 })
      )
      plate.position.set(path.x, 0.1, 0)
      plate.userData = { role: 'cloudPath', correct: path.correct, name: path.name }
      this.scene.add(plate)
      this.objects.push(plate)
    })
  }

  handleClick(intersection, ui) {
    const target = intersection.object
    if (target.userData.role !== 'cloudPath') {
      return
    }

    if (target.userData.correct) {
      ui.setFeedback('Correct! You selected the healthy, reliable deployment path.')
      ui.addScore(2)
      this.start()
    } else {
      ui.setFeedback(`${target.userData.name} path has unhealthy services. Try again.`)
    }
  }

  update(elapsedTime) {
    this.objects.forEach((object, index) => {
      if (object.type === 'Mesh' && object.userData.role === 'cloudPath') {
        object.position.z = Math.sin(elapsedTime * 1.5 + index * 0.3) * 0.08
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
