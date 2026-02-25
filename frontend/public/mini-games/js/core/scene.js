import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js'

export function createBaseScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x070b14)

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 6, 14)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight.position.set(5, 10, 7)
  scene.add(directionalLight)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x111a2f })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -2
  scene.add(floor)

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  window.addEventListener('resize', onResize)

  return {
    THREE,
    scene,
    camera,
    renderer,
    raycaster,
    pointer,
    onResize,
    dispose() {
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }
}

export function clearSceneExceptLightsAndFloor(scene) {
  const keep = []
  for (const child of scene.children) {
    const isLight = child.type.includes('Light')
    const isFloor = child.geometry?.type === 'PlaneGeometry'
    if (isLight || isFloor) {
      keep.push(child)
      continue
    }
    if (child.geometry) {
      child.geometry.dispose()
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose())
      } else {
        child.material.dispose()
      }
    }
  }
  scene.children = keep
}
