<template>
  <div ref="containerRef" class="viewer"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const props = defineProps({
  motionUrl: {
    type: String,
    default: ''
  }
})

const containerRef = ref(null)

let scene
let camera
let renderer
let controls
let timer
let frameId
let resizeHandler
let resizeObserver
let axesHelper
let keyLight
let fillBackLight
let topLight
const axesLabels = []
const tempBox = new THREE.Box3()
const tempSize = new THREE.Vector3()
const tempCenter = new THREE.Vector3()
const WORLD_Z_AXIS = new THREE.Vector3(0, 0, 1)

let loader
let motionGroup = null
let glbRoot = null
let frameNodes = []
let currentVisibleFrameNode = null

let mixer = null
let activeClip = null

let frameRate = 30
let frameDuration = 1 / 30
let currentFrame = 0
let totalFrames = 0
let accumulatedTime = 0
const isPlaying = ref(true)

const toFinitePositive = (value, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

const createAxisLabelSprite = (label, color) => {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (!context) return null

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.font = 'bold 72px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = color
  context.fillText(label, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.18, 0.18, 1)
  return sprite
}

// Removed applyAutoUpright and related positioning logic

const fitCameraToObject = (object) => {
  if (!camera || !controls || !object || !containerRef.value) return

  const el = containerRef.value
  const viewportAspect = el.clientWidth / Math.max(el.clientHeight, 1)

  tempBox.setFromObject(object)
  if (tempBox.isEmpty()) return

  tempBox.getSize(tempSize)
  tempBox.getCenter(tempCenter)

  const maxDim = Math.max(tempSize.x, tempSize.y, tempSize.z, 0.1)
  const fov = camera.fov * (Math.PI / 180)
  const fitHeightDistance = maxDim / (2 * Math.tan(fov / 2))
  const fitWidthDistance = fitHeightDistance / Math.max(viewportAspect, 0.5)
  const distance = 1.25 * Math.max(fitHeightDistance, fitWidthDistance)

  camera.position.set(tempCenter.x, tempCenter.y + maxDim * 0.25, tempCenter.z + distance)
  camera.near = Math.max(distance / 100, 0.01)
  camera.far = Math.max(distance * 20, 100)
  camera.up.set(0, 1, 0)
  camera.updateProjectionMatrix()

  controls.target.copy(tempCenter)
  controls.update()
}

const estimateClipFps = (clip) => {
  if (!clip || !Array.isArray(clip.tracks) || clip.tracks.length === 0) return 30

  let minDelta = Infinity
  for (const track of clip.tracks) {
    const times = track?.times
    if (!times || times.length < 2) continue

    for (let index = 1; index < times.length; index += 1) {
      const delta = times[index] - times[index - 1]
      if (delta > 0 && delta < minDelta) {
        minDelta = delta
      }
    }
  }

  if (!Number.isFinite(minDelta) || minDelta <= 0) return 30
  const fps = Math.round(1 / minDelta)
  return toFinitePositive(fps, 30)
}

const frameIndexFromName = (name, fallbackIndex) => {
  if (!name) return fallbackIndex
  const match = name.match(/(\d+)(?!.*\d)/)
  return match ? Number(match[1]) : fallbackIndex
}

const collectFrameNodes = (root) => {
  const nodes = []
  root.traverse((node) => {
    if (node.type !== 'Object3D' && node.type !== 'Mesh' && node.type !== 'Group') return
    if (/frame/i.test(node.name)) {
      nodes.push(node)
    }
  })

  nodes.sort((a, b) => frameIndexFromName(a.name, 0) - frameIndexFromName(b.name, 0))
  return nodes
}

const clearSceneObject = (object) => {
  if (!object) return
  object.traverse((node) => {
    if (node.geometry) {
      node.geometry.dispose()
    }

    if (node.material) {
      if (Array.isArray(node.material)) {
        node.material.forEach((material) => material.dispose())
      } else {
        node.material.dispose()
      }
    }
  })

  if (object.parent) {
    object.parent.remove(object)
  }
}

const resetMotionState = () => {
  mixer = null
  activeClip = null
  frameNodes = []
  currentVisibleFrameNode = null
  currentFrame = 0
  totalFrames = 0
  frameRate = 30
  frameDuration = 1 / frameRate
  accumulatedTime = 0
}

const clearMotion = () => {
  clearSceneObject(motionGroup)
  motionGroup = null
  glbRoot = null
  resetMotionState()
}

const clearAxesLabels = () => {
  while (axesLabels.length > 0) {
    const label = axesLabels.pop()
    if (!label) continue
    if (label.parent) {
      label.parent.remove(label)
    }
    if (label.material?.map) {
      label.material.map.dispose()
    }
    label.material?.dispose()
  }
}

const setVisibleFrameNode = (node) => {
  if (currentVisibleFrameNode && currentVisibleFrameNode !== node) {
    currentVisibleFrameNode.visible = false
  }
  if (node) {
    node.visible = true
  }
  currentVisibleFrameNode = node
}

const stepToFrame = (frameIndex) => {
  if (totalFrames <= 0) return

  currentFrame = ((frameIndex % totalFrames) + totalFrames) % totalFrames

  if (mixer && activeClip) {
    const clipDuration = toFinitePositive(activeClip.duration, 1 / frameRate)
    const time = (currentFrame / frameRate) % clipDuration
    mixer.setTime(time)
    return
  }

  if (frameNodes.length > 0) {
    const nextNode = frameNodes[currentFrame]
    setVisibleFrameNode(nextNode)
  }
}

const advanceFrame = () => {
  if (totalFrames <= 0) return
  stepToFrame(currentFrame + 1)
}

const setupScene = () => {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf3f7ff)

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 100)
  camera.position.set(0, 1.2, 3.2)
  camera.up.set(0, 1, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0.9, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 1
  controls.maxDistance = 8
  controls.update()

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.05)
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xdbe8ff, 0.8)

  keyLight = new THREE.DirectionalLight(0xffffff, 1.35)
  keyLight.position.set(3, 6, 4)
  scene.add(keyLight)

  fillBackLight = new THREE.DirectionalLight(0xffffff, 0.45)
  fillBackLight.position.set(-4, 2, -3)

  topLight = new THREE.DirectionalLight(0xffffff, 0.55)
  topLight.position.set(0, 4, 0)

  scene.add(ambientLight, hemisphereLight, fillBackLight, topLight)

  axesHelper = new THREE.AxesHelper(1.0)
  // No X-rotation necessary for Y-up
  scene.add(axesHelper)
  
  const gridHelper = new THREE.GridHelper(4, 16, 0x333344, 0x222233)
  gridHelper.position.y = -0.01
  scene.add(gridHelper)

  const xLabel = createAxisLabelSprite('X', '#d64545')
  const yLabel = createAxisLabelSprite('Y', '#2d9b41')
  const zLabel = createAxisLabelSprite('Z', '#275ecb')
  if (xLabel && yLabel && zLabel) {
    xLabel.position.set(1.12, 0, 0)
    yLabel.position.set(0, 1.12, 0)
    zLabel.position.set(0, 0, 1.12)
    axesLabels.push(xLabel, yLabel, zLabel)
    scene.add(xLabel, yLabel, zLabel)
  }

  timer = new THREE.Timer()
  if (typeof document !== 'undefined') {
    timer.connect(document)
  }
  loader = new GLTFLoader()

  const syncRendererSize = () => {
    if (!container || !camera || !renderer) return
    const width = container.clientWidth
    const height = container.clientHeight
    if (width <= 0 || height <= 0) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  resizeHandler = () => {
    requestAnimationFrame(syncRendererSize)
  }

  window.addEventListener('resize', resizeHandler)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      syncRendererSize()
    })
    resizeObserver.observe(container)
  }

  syncRendererSize()
  requestAnimationFrame(syncRendererSize)
}

const loadGlbMotion = async (url) => {
  console.log('[DEBUG MotionGlbBackground] loadGlbMotion called with URL:', url)

  if (!url) {
    clearMotion()
    return
  }

  if (!/\.glb(\?|#|$)/i.test(url)) {
    console.warn('Skipping non-GLB motion URL:', url)
    clearMotion()
    return
  }

  if (!loader || !scene) return

  clearMotion()

  const gltf = await loader.loadAsync(url)
  glbRoot = gltf.scene || null

  if (!glbRoot) {
    throw new Error('GLB scene is empty.')
  }

  // Auto-center & scale
  tempBox.setFromObject(glbRoot)
  tempBox.getSize(tempSize)
  const maxDim = Math.max(tempSize.x, tempSize.y, tempSize.z, 0.1)
  const scale = 2.0 / maxDim
  glbRoot.scale.setScalar(scale)

  // SMPL-X is Z-up; rotate to Y-up so the figure stands upright
  glbRoot.rotation.x = -Math.PI / 2

  // Recalculate box after rotation + scale for correct floor placement
  tempBox.setFromObject(glbRoot)
  tempBox.getCenter(tempCenter)
  glbRoot.position.x = -tempCenter.x
  glbRoot.position.z = -tempCenter.z
  glbRoot.position.y = -tempBox.min.y + 0.01

  motionGroup = new THREE.Group()
  motionGroup.add(glbRoot)
  scene.add(motionGroup)
  fitCameraToObject(motionGroup)

  const clips = Array.isArray(gltf.animations) ? gltf.animations : []
  if (clips.length > 0) {
    activeClip = clips[0]
    mixer = new THREE.AnimationMixer(glbRoot)
    const action = mixer.clipAction(activeClip)
    action.play()
    action.paused = true

    frameRate = estimateClipFps(activeClip)
    frameDuration = 1 / frameRate
    totalFrames = Math.max(1, Math.round(toFinitePositive(activeClip.duration, 0) * frameRate))
    stepToFrame(0)
    return
  }

  frameNodes = collectFrameNodes(glbRoot)

  if (frameNodes.length > 0) {
    frameRate = 30
    frameDuration = 1 / frameRate
    totalFrames = frameNodes.length
    frameNodes.forEach((node) => {
      node.visible = false
    })
    stepToFrame(0)
    return
  }

  totalFrames = 1
  frameRate = 30
  frameDuration = 1 / frameRate
  currentFrame = 0
}

const animate = (timestamp) => {
  frameId = requestAnimationFrame(animate)

  timer.update(timestamp)
  const delta = timer.getDelta()
  if (isPlaying.value && totalFrames > 0) {
    accumulatedTime += delta
    while (accumulatedTime >= frameDuration) {
      accumulatedTime -= frameDuration
      advanceFrame()
    }
  }

  controls.update()
  renderer.render(scene, camera)
}

onMounted(async () => {
  console.log('[DEBUG MotionGlbBackground] onMounted, initial motionUrl is:', props.motionUrl)
  try {
    setupScene()
    animate()
    if (props.motionUrl) {
      await loadGlbMotion(props.motionUrl)
    }
  } catch (error) {
    console.error('Failed to initialize GLB motion background:', error)
  }
})

watch(() => props.motionUrl, async (newUrl) => {
  console.log('[DEBUG MotionGlbBackground] watch motionUrl changed to:', newUrl)
  try {
    await loadGlbMotion(newUrl)
  } catch (error) {
    console.error('Failed to load GLB motion URL:', error)
    clearMotion()
  }
})

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  clearMotion()
  clearAxesLabels()

  if (axesHelper && scene) {
    scene.remove(axesHelper)
    axesHelper = null
  }

  if (controls) controls.dispose()

  if (timer) {
    timer.dispose()
    timer = null
  }

  if (renderer) {
    renderer.dispose()
    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
})
</script>

<style>
.viewer {
  width: 100%;
  height: 100%;
}
</style>
