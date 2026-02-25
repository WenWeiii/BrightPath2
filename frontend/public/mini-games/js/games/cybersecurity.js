import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js'

export class CybersecurityGame {
  constructor(scene) {
    this.scene = scene
    this.nodes = []
    this.lines = []
    this.suspiciousNodeId = -1
  }

  get mission() {
    return 'Cybersecurity: click the suspicious red network node.'
  }

  start() {
    this.dispose()

    const positions = [
      new THREE.Vector3(-4, 1.4, -1),
      new THREE.Vector3(-1.5, 2.2, 0),
      new THREE.Vector3(1.2, 1.6, 1.3),
      new THREE.Vector3(3.8, 2.0, -0.8),
      new THREE.Vector3(0.4, 3.1, -1.7),
      new THREE.Vector3(-2.7, 3.4, 1.2)
    ]

    this.suspiciousNodeId = Math.floor(Math.random() * positions.length)

    positions.forEach((position, index) => {
      const isSuspicious = index === this.suspiciousNodeId
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 20, 20),
        new THREE.MeshStandardMaterial({
          color: isSuspicious ? 0xff3a3a : 0x5cb8ff,
          emissive: isSuspicious ? 0x330000 : 0x001422
        })
      )
      node.position.copy(position)
      node.userData = { role: 'node', suspicious: isSuspicious }
      this.scene.add(node)
      this.nodes.push(node)
    })

    for (let index = 0; index < this.nodes.length - 1; index += 1) {
      const a = this.nodes[index].position
      const b = this.nodes[index + 1].position
      const geometry = new THREE.BufferGeometry().setFromPoints([a, b])
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0x3d567d })
      )
      this.scene.add(line)
      this.lines.push(line)
    }
  }

  handleClick(intersection, ui) {
    const target = intersection.object
    if (target.userData.role !== 'node') {
      return
    }

    if (target.userData.suspicious) {
      ui.setFeedback('Threat detected! You isolated the compromised node.')
      ui.addScore(3)
      this.start()
    } else {
      ui.setFeedback('Safe node. Keep scanning for the suspicious one.')
    }
  }

  update(elapsedTime) {
    this.nodes.forEach((node, index) => {
      const baseY = [1.4, 2.2, 1.6, 2.0, 3.1, 3.4][index]
      node.position.y = baseY + Math.sin(elapsedTime * 2 + index) * 0.08

      if (node.userData.suspicious) {
        const pulse = (Math.sin(elapsedTime * 5) + 1) / 2
        node.scale.setScalar(1 + pulse * 0.25)
      }
    })
  }

  dispose() {
    for (const node of this.nodes) {
      this.scene.remove(node)
      if (node.geometry) {
        node.geometry.dispose()
      }
      if (node.material) {
        node.material.dispose()
      }
    }
    for (const line of this.lines) {
      this.scene.remove(line)
      line.geometry.dispose()
      line.material.dispose()
    }
    this.nodes = []
    this.lines = []
    this.suspiciousNodeId = -1
  }
}
