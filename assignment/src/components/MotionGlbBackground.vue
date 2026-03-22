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

const findPelvisNode = (root) => {
  const pelvisKeywords = ['pelvis', 'hips', 'hip', 'root', 'mixamorighips']

  let matchedNode = null
  root.traverse((node) => {
    if (matchedNode || !node?.name) return
    const name = node.name.toLowerCase()
    if (pelvisKeywords.some((keyword) => name.includes(keyword))) {
      matchedNode = node
    }
  })

  return matchedNode
}

const anchorToPelvis = (root) => {
  const pelvisNode = findPelvisNode(root)
  if (!pelvisNode) {
    console.warn('Pelvis node not found in GLB. Keeping original root anchor.')
    return
  }

  root.updateWorldMatrix(true, true)
  const pelvisWorldPosition = new THREE.Vector3()
  pelvisNode.getWorldPosition(pelvisWorldPosition)
  const pelvisLocalPosition = root.worldToLocal(pelvisWorldPosition)
  root.position.sub(pelvisLocalPosition)
}

const applyAutoUpright = (root) => {
  root.rotation.set(0, 0, 0)
  root.updateWorldMatrix(true, true)

  tempBox.setFromObject(root)
  tempBox.getSize(tempSize)

  const widthX = Math.abs(tempSize.x)
  const depthY = Math.abs(tempSize.y)
  const heightZ = Math.abs(tempSize.z)

  if (heightZ >= depthY && heightZ >= widthX) {
    return
  }

  if (depthY >= widthX && depthY >= heightZ) {
    root.rotation.x = -Math.PI / 2
    return
  }

  root.rotation.y = Math.PI / 2
}

const applyFacingTowardViewer = (root) => {
  root.rotateOnWorldAxis(WORLD_Z_AXIS, Math.PI)
}

const fitCameraToObject = (object) => {
  if (!camera || !controls || !object) return

  tempBox.setFromObject(object)
  if (tempBox.isEmpty()) return

  tempBox.getCenter(tempCenter)
  tempBox.getSize(tempSize)

  const maxSize = Math.max(tempSize.x, tempSize.y, tempSize.z)
  if (!Number.isFinite(maxSize) || maxSize <= 0) return

  const fitDistance = (maxSize * 0.68) / Math.tan((Math.PI * camera.fov) / 360)
  const distance = Math.max(1.2, fitDistance)

  controls.target.set(tempCenter.x, tempCenter.y, tempCenter.z)
  camera.position.set(tempCenter.x + distance, tempCenter.y - distance, tempCenter.z + (distance * 0.7))
  camera.up.set(0, 0, 1)
  camera.lookAt(controls.target)
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

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(2.6, -2.4, 1.6)
  camera.up.set(0, 0, 1)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0.9)
  controls.enableDamping = true
  controls.update()

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.05)
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xdbe8ff, 0.8)

  keyLight = new THREE.DirectionalLight(0xffffff, 1.35)
  scene.add(keyLight)
  scene.add(keyLight.target)

  fillBackLight = new THREE.DirectionalLight(0xffffff, 0.45)
  fillBackLight.position.set(0, 3.2, 1.6)

  topLight = new THREE.DirectionalLight(0xffffff, 0.55)
  topLight.position.set(0, 0, 4)

  scene.add(ambientLight, hemisphereLight, fillBackLight, topLight)

  axesHelper = new THREE.AxesHelper(1.0)
  axesHelper.rotation.x = Math.PI / 2
  scene.add(axesHelper)

  const xLabel = createAxisLabelSprite('X', '#d64545')
  const yLabel = createAxisLabelSprite('Y', '#2d9b41')
  const zLabel = createAxisLabelSprite('Z', '#275ecb')
  if (xLabel && yLabel && zLabel) {
    xLabel.position.set(1.12, 0, 0)
    yLabel.position.set(0, 0, 1.12)
    zLabel.position.set(0, -1.12, 0)
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

  motionGroup = new THREE.Group()
  motionGroup.add(glbRoot)
  applyAutoUpright(glbRoot)
  applyFacingTowardViewer(glbRoot)
  anchorToPelvis(glbRoot)
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

  if (keyLight && controls && camera) {
    keyLight.position.copy(camera.position)
    keyLight.target.position.copy(controls.target)
    keyLight.target.updateMatrixWorld()
  }

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
