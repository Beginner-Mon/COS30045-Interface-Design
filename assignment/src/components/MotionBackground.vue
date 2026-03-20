<template>
  <div ref="containerRef" class="viewer"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  motionUrl: {
    type: String,
    default: ''
  }
})

const containerRef = ref(null)

const JOINT_NAMES = [
  'pelvis', 'left_hip', 'right_hip', 'spine1', 'left_knee', 'right_knee',
  'spine2', 'left_ankle', 'right_ankle', 'spine3', 'left_foot', 'right_foot',
  'neck', 'left_collar', 'right_collar', 'head', 'left_shoulder', 'right_shoulder',
  'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'
]

const JOINT_COUNT = 22
const JOINT_PARENTS = [
  -1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 12, 13, 14, 16, 17, 18, 19
]

const JOINT_EDGES = [
  [0, 1], [1, 4], [4, 7], [7, 10],
  [0, 2], [2, 5], [5, 8], [8, 11],
  [0, 3], [3, 6], [6, 9], [9, 12], [12, 15],
  [9, 13], [13, 16], [16, 18], [18, 20],
  [9, 14], [14, 17], [17, 19], [19, 21]
]

const REST_OFFSETS = [
  [0.0, 0.0, 0.0],
  [0.0728987805, -0.0884781865, -0.0144842372],
  [-0.0721949301, -0.0949282586, -0.0158126064],
  [-0.0054604648, 0.102212385, -0.0264612545],
  [0.0263377595, -0.3762241682, -0.0212444883],
  [-0.0302161104, -0.3720584012, -0.0151102361],
  [0.0101709476, 0.1171658301, -0.0102759042],
  [-0.0082758874, -0.3869507621, -0.0205969784],
  [0.0036030885, -0.3783855788, -0.0168925195],
  [-0.0055625578, 0.043824528, 0.0320454439],
  [0.0215478597, -0.0438910259, 0.1073996894],
  [-0.0174033258, -0.0473341285, 0.1011299194],
  [-0.0057622319, 0.1940758628, -0.0399617673],
  [0.0522383762, 0.1142798924, -0.0179783802],
  [-0.0546976913, 0.1102551556, -0.0244768061],
  [0.0088000161, 0.1466001334, 0.0220644338],
  [0.0884786188, 0.0455544781, -0.0276415152],
  [-0.0956034601, 0.0478533729, -0.0207655683],
  [0.2722441962, -0.0558828133, -0.0272787668],
  [-0.2625570783, -0.0507778218, -0.0202993268],
  [0.2274201011, 0.0075422908, 0.0040845571],
  [-0.2281148173, 0.0033539966, -0.0047555211]
]

let scene
let camera
let renderer
let controls
let frameId
let clock
let resizeHandler

let skeletonGroup
let lineGeometry
let linePositions
const jointMeshes = []
let axesHelper

let motionData = null
let currentFrame = 0
let frameDuration = 1 / 30
let accumulatedTime = 0
const APPLY_ROOT_TRANSLATION = true

const tempAxis = new THREE.Vector3()
const tempQuat = new THREE.Quaternion()
const tempVec = new THREE.Vector3()

const axisAngleToQuaternion = (x, y, z, outQuat) => {
  const angle = Math.sqrt((x * x) + (y * y) + (z * z))
  if (angle < 1e-8) {
    outQuat.identity()
    return outQuat
  }
  tempAxis.set(x / angle, y / angle, z / angle)
  outQuat.setFromAxisAngle(tempAxis, angle)
  return outQuat
}

const inflateDeflateRaw = async (compressedBytes) => {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Browser does not support DecompressionStream')
  }
  const stream = new Blob([compressedBytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Response(stream).arrayBuffer()
}

const parseNpyHeader = (buffer) => {
  const bytes = new Uint8Array(buffer)
  const magic = String.fromCharCode(...bytes.subarray(0, 6))
  if (magic !== '\x93NUMPY') throw new Error('Invalid NPY file magic')

  const major = bytes[6]
  const headerLength = major === 1
    ? (bytes[8] | (bytes[9] << 8))
    : (bytes[8] | (bytes[9] << 8) | (bytes[10] << 16) | (bytes[11] << 24))
  const headerOffset = major === 1 ? 10 : 12
  const header = new TextDecoder('latin1').decode(bytes.subarray(headerOffset, headerOffset + headerLength))

  const descrMatch = header.match(/'descr':\s*'([^']+)'/)
  const shapeMatch = header.match(/'shape':\s*\(([^)]*)\)/)
  if (!descrMatch || !shapeMatch) throw new Error('Failed to parse NPY header')

  const descr = descrMatch[1]
  const shape = shapeMatch[1]
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number(value))

  return { descr, shape, dataOffset: headerOffset + headerLength }
}

const parseNpy = (buffer) => {
  const { descr, shape, dataOffset } = parseNpyHeader(buffer)
  const totalCount = shape.length === 0 ? 1 : shape.reduce((acc, value) => acc * value, 1)

  if (descr === '<f4') {
    return { shape, value: new Float32Array(buffer, dataOffset, totalCount) }
  }
  if (descr === '<i8') {
    return { shape, value: Number(new DataView(buffer, dataOffset).getBigInt64(0, true)) }
  }
  throw new Error(`Unsupported NPY dtype: ${descr}`)
}

const parseNpz = async (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer)
  const required = new Set(['poses.npy', 'trans.npy', 'mocap_framerate.npy'])
  const out = {}
  let offset = 0

  while (offset + 30 <= bytes.length) {
    const signature = (
      bytes[offset]
      | (bytes[offset + 1] << 8)
      | (bytes[offset + 2] << 16)
      | (bytes[offset + 3] << 24)
    ) >>> 0
    if (signature !== 0x04034b50) break

    const method = bytes[offset + 8] | (bytes[offset + 9] << 8)
    const compressedSize = (
      bytes[offset + 18]
      | (bytes[offset + 19] << 8)
      | (bytes[offset + 20] << 16)
      | (bytes[offset + 21] << 24)
    ) >>> 0
    const fileNameLength = bytes[offset + 26] | (bytes[offset + 27] << 8)
    const extraLength = bytes[offset + 28] | (bytes[offset + 29] << 8)
    const fileNameStart = offset + 30
    const fileNameEnd = fileNameStart + fileNameLength
    const name = new TextDecoder().decode(bytes.subarray(fileNameStart, fileNameEnd))
    const fileDataStart = fileNameEnd + extraLength
    const fileDataEnd = fileDataStart + compressedSize
    const compressed = bytes.subarray(fileDataStart, fileDataEnd)

    if (required.has(name)) {
      let npyBuffer
      if (method === 0) {
        npyBuffer = compressed.buffer.slice(compressed.byteOffset, compressed.byteOffset + compressed.byteLength)
      } else if (method === 8) {
        npyBuffer = await inflateDeflateRaw(compressed)
      } else {
        throw new Error(`Unsupported ZIP compression method: ${method}`)
      }
      out[name] = parseNpy(npyBuffer)
    }

    offset = fileDataEnd
  }

  return out
}

const buildSkeletonVisual = () => {
  skeletonGroup = new THREE.Group()

  const sphereGeometry = new THREE.SphereGeometry(0.025, 12, 12)
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x7cc9ff })

  for (let index = 0; index < JOINT_COUNT; index += 1) {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.name = JOINT_NAMES[index] || `joint_${index}`
    skeletonGroup.add(sphere)
    jointMeshes.push(sphere)
  }

  lineGeometry = new THREE.BufferGeometry()
  linePositions = new Float32Array(JOINT_EDGES.length * 2 * 3)
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
  skeletonGroup.add(lines)

  scene.add(skeletonGroup)
}

const applyRestPose = () => {
  const globalPos = Array.from({ length: JOINT_COUNT }, () => new THREE.Vector3())
  const renderPos = Array.from({ length: JOINT_COUNT }, () => new THREE.Vector3())

  globalPos[0].set(0, 0, 0)
  for (let j = 1; j < JOINT_COUNT; j += 1) {
    const parent = JOINT_PARENTS[j]
    tempVec.fromArray(REST_OFFSETS[j])
    globalPos[j].copy(globalPos[parent]).add(tempVec)
  }

  for (let j = 0; j < JOINT_COUNT; j += 1) {
    renderPos[j].set(globalPos[j].x, globalPos[j].z, globalPos[j].y)
  }

  for (let j = 0; j < JOINT_COUNT; j += 1) {
    jointMeshes[j].position.copy(renderPos[j])
  }

  for (let edge = 0; edge < JOINT_EDGES.length; edge += 1) {
    const [a, b] = JOINT_EDGES[edge]
    const base = edge * 6
    linePositions[base] = renderPos[a].x
    linePositions[base + 1] = renderPos[a].y
    linePositions[base + 2] = renderPos[a].z
    linePositions[base + 3] = renderPos[b].x
    linePositions[base + 4] = renderPos[b].y
    linePositions[base + 5] = renderPos[b].z
  }

  lineGeometry.attributes.position.needsUpdate = true
}

const applyPoseFrame = (frameIndex) => {
  if (!motionData) return

  const frame = frameIndex % motionData.frameCount
  const jointCount = Math.min(JOINT_COUNT, motionData.jointCount)
  const poseOffset = frame * motionData.jointCount * 3

  const localRot = Array.from({ length: JOINT_COUNT }, () => new THREE.Quaternion())
  const globalRot = Array.from({ length: JOINT_COUNT }, () => new THREE.Quaternion())
  const globalPos = Array.from({ length: JOINT_COUNT }, () => new THREE.Vector3())

  if (APPLY_ROOT_TRANSLATION) {
    const tx = motionData.trans[frame * 3] - motionData.trans[0]
    const ty = motionData.trans[(frame * 3) + 1] - motionData.trans[1]
    const tz = motionData.trans[(frame * 3) + 2] - motionData.trans[2]
    globalPos[0].set(tx, ty, tz)
  } else {
    globalPos[0].set(0, 0, 0)
  }

  for (let j = 0; j < jointCount; j += 1) {
    const idx = poseOffset + (j * 3)
    axisAngleToQuaternion(
      motionData.poses[idx],
      motionData.poses[idx + 1],
      motionData.poses[idx + 2],
      tempQuat
    )
    localRot[j].copy(tempQuat)

    const parent = JOINT_PARENTS[j]
    if (parent < 0) {
      globalRot[j].copy(localRot[j])
      continue
    }

    globalRot[j].copy(globalRot[parent]).multiply(localRot[j])
    tempVec.fromArray(REST_OFFSETS[j]).applyQuaternion(globalRot[parent])
    globalPos[j].copy(globalPos[parent]).add(tempVec)
  }

  for (let j = 0; j < JOINT_COUNT; j += 1) {
    jointMeshes[j].position.copy(globalPos[j])
  }

  for (let edge = 0; edge < JOINT_EDGES.length; edge += 1) {
    const [a, b] = JOINT_EDGES[edge]
    const base = edge * 6
    linePositions[base] = globalPos[a].x
    linePositions[base + 1] = globalPos[a].y
    linePositions[base + 2] = globalPos[a].z
    linePositions[base + 3] = globalPos[b].x
    linePositions[base + 4] = globalPos[b].y
    linePositions[base + 5] = globalPos[b].z
  }

  lineGeometry.attributes.position.needsUpdate = true
}

const setupScene = () => {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05090f)

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.up.set(0, 0, 1)
  camera.position.set(2.4, -2.0, 1.5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0.9)
  controls.enableDamping = true
  controls.update()

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(2, 3, 4)
  scene.add(ambientLight, directionalLight)

  axesHelper = new THREE.AxesHelper(1.2)
  scene.add(axesHelper)

  buildSkeletonVisual()
  applyRestPose()

  clock = new THREE.Clock()

  resizeHandler = () => {
    if (!container || !camera || !renderer) return
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }
  window.addEventListener('resize', resizeHandler)
}

const loadMotion = async (url) => {
  if (!url) return
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch NPZ: ${response.status} ${response.statusText}`)
  }

  const npz = await parseNpz(await response.arrayBuffer())
  const poses = npz['poses.npy']?.value
  const trans = npz['trans.npy']?.value
  const fps = npz['mocap_framerate.npy']?.value

  if (!poses || !trans) {
    throw new Error('NPZ missing poses.npy or trans.npy')
  }

  motionData = {
    poses,
    trans,
    fps: Number(fps || 30),
    frameCount: trans.length / 3,
    jointCount: poses.length / ((trans.length / 3) * 3)
  }
  frameDuration = 1 / Math.max(motionData.fps, 1)
  currentFrame = 0
  accumulatedTime = 0
  applyPoseFrame(0)
}

const animate = () => {
  frameId = requestAnimationFrame(animate)
  const delta = clock.getDelta()

  if (motionData?.frameCount) {
    accumulatedTime += delta
    if (accumulatedTime >= frameDuration) {
      currentFrame = (currentFrame + 1) % motionData.frameCount
      applyPoseFrame(currentFrame)
      accumulatedTime = 0
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
      await loadMotion(props.motionUrl)
    }
  } catch (error) {
    console.error('Failed to initialize motion background:', error)
  }
})

watch(() => props.motionUrl, async (newUrl) => {
  if (!newUrl) return
  try {
    motionData = null
    currentFrame = 0
    accumulatedTime = 0
    await loadMotion(newUrl)
  } catch (error) {
    console.error('Failed to reload motion from URL:', error)
  }
})

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)

  if (controls) controls.dispose()
  if (lineGeometry) lineGeometry.dispose()

  if (skeletonGroup) {
    skeletonGroup.traverse((object) => {
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }

  if (renderer) {
    renderer.dispose()
    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }

  if (axesHelper && scene) scene.remove(axesHelper)
})
</script>

<style>
.viewer {
  width: 100%;
  height: 100%;
}
</style>