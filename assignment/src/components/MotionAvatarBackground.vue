<template>
  <div class="motion-bg-root">
    <div ref="containerRef" class="motion-bg"></div>
    <button class="motion-toggle-btn" type="button" @click="toggleMotion">
      {{ isPlaying ? 'Stop Motion' : 'Play Motion' }}
    </button>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { Text } from 'troika-three-text'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const containerRef = ref(null)

let renderer
let scene
let camera
let clock
let frameId
let resizeHandler
let controls
let isInteracting = true
let jointLabels = []
let motionData = null
let currentFrameIndex = 0
let frameDuration = 1 / 30
let accumulatedTime = 0
const isPlaying = ref(true)

let skeletonGroup = null
let jointMeshes = []
// ── Add name labels for each joint ───────────────────────────────
const labelMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
let lineGeometry = null
let linePositions = null
let avatarRoot = null
let avatarBasePosition = new THREE.Vector3()
let avatarMotionScale = 1
let avatarBones = []
let avatarBindLocalRotations = []

const SHOW_DEBUG_SKELETON = true
const AVATAR_SIDE_OFFSET = new THREE.Vector3(1.2, 0, 0)

const JOINT_TO_HUMANOID_BONE = [
  'hips',           // 0 pelvis
  'leftUpperLeg',   // 1
  'rightUpperLeg',  // 2
  'spine',          // 3
  'leftLowerLeg',   // 4
  'rightLowerLeg',  // 5
  'chest',          // 6
  'leftFoot',       // 7
  'rightFoot',      // 8
  'upperChest',     // 9
  'leftToes',       // 10
  'rightToes',      // 11
  'neck',           // 12
  'leftShoulder',   // 13
  'rightShoulder',  // 14
  'head',           // 15
  'leftUpperArm',   // 16
  'rightUpperArm',  // 17
  'leftLowerArm',   // 18
  'rightLowerArm',  // 19
  'leftHand',       // 20
  'rightHand'       // 21
]

const initialCameraPosition = new THREE.Vector3(3, 0, 1.2)
const initialTargetPosition = new THREE.Vector3(0, 0, 0.8)
const followOffset = new THREE.Vector3(0, 0.8, 0)
const tempAxis = new THREE.Vector3()
const tempQuat = new THREE.Quaternion()
const tempVec = new THREE.Vector3()
const tempTarget = new THREE.Vector3()
const tempBox = new THREE.Box3()
const tempBox2 = new THREE.Box3()

// SMPL body skeleton subset (22 joints)
const JOINT_COUNT = 22
const JOINT_PARENTS = [
  -1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 12, 13, 14, 16, 17, 18, 19
]
avatarBones = Array.from({ length: JOINT_COUNT }, () => null)
avatarBindLocalRotations = Array.from({ length: JOINT_COUNT }, () => null)

const JOINT_EDGES = [
  [0, 1], [1, 4], [4, 7], [7, 10],
  [0, 2], [2, 5], [5, 8], [8, 11],
  [0, 3], [3, 6], [6, 9], [9, 12], [12, 15],
  [9, 13], [13, 16], [16, 18], [18, 20],
  [9, 14], [14, 17], [17, 19], [19, 21]
]

// Approximate SMPL rest offsets in local parent space.
const REST_OFFSETS = [
[0.0,0.0,0.0],
[0.0728987805,-0.0884781865,-0.0144842372],
[-0.0721949301,-0.0949282586,-0.0158126064],
[-0.0054604648,0.102212385,-0.0264612545],
[0.0263377595,-0.3762241682,-0.0212444883],
[-0.0302161104,-0.3720584012,-0.0151102361],
[0.0101709476,0.1171658301,-0.0102759042],
[-0.0082758874,-0.3869507621,-0.0205969784],
[0.0036030885,-0.3783855788,-0.0168925195],
[-0.0055625578,0.043824528,0.0320454439],
[0.0215478597,-0.0438910259,0.1073996894],
[-0.0174033258,-0.0473341285,0.1011299194],
[-0.0057622319,0.1940758628,-0.0399617673],
[0.0522383762,0.1142798924,-0.0179783802],
[-0.0546976913,0.1102551556,-0.0244768061],
[0.0088000161,0.1466001334,0.0220644338],
[0.0884786188,0.0455544781,-0.0276415152],
[-0.0956034601,0.0478533729,-0.0207655683],
[0.2722441962,-0.0558828133,-0.0272787668],
[-0.2625570783,-0.0507778218,-0.0202993268],
[0.2274201011,0.0075422908,0.0040845571],
[-0.2281148173,0.0033539966,-0.0047555211]
]
const smplQuatToThree = (q) => {
  // convert SMPL axis orientation to Three.js
  return new THREE.Quaternion(
    -q.x,
     q.z,
     q.y,
     q.w
  )
}
const logCameraDebug = (label = 'Camera debug') => {
  if (!camera || !controls) return
  console.log(`${label}:`, {
    position: {
      x: Number(camera.position.x.toFixed(3)),
      y: Number(camera.position.y.toFixed(3)),
      z: Number(camera.position.z.toFixed(3))
    },
    target: {
      x: Number(controls.target.x.toFixed(3)),
      y: Number(controls.target.y.toFixed(3)),
      z: Number(controls.target.z.toFixed(3))
    }
  })
}

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
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => Number(v))
  return { descr, shape, dataOffset: headerOffset + headerLength }
}

const parseNpy = (buffer) => {
  const { descr, shape, dataOffset } = parseNpyHeader(buffer)
  const totalCount = shape.length === 0 ? 1 : shape.reduce((acc, n) => acc * n, 1)

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

const JOINT_FALLBACK_ALIASES = [
  ['hips', 'hip', '下半身', '腰'],
  ['leftupperleg', 'leftleg', '左足'],
  ['rightupperleg', 'rightleg', '右足'],
  ['spine', '上半身'],
  ['leftlowerleg', 'leftknee', '左ひざ'],
  ['rightlowerleg', 'rightknee', '右ひざ'],
  ['chest', '上半身2'],
  ['leftfoot', 'leftankle', '左足首'],
  ['rightfoot', 'rightankle', '右足首'],
  ['upperchest', '胸'],
  ['lefttoes', '左つま先', '左足先'],
  ['righttoes', '右つま先', '右足先'],
  ['neck', '首'],
  ['leftshoulder', '左肩'],
  ['rightshoulder', '右肩'],
  ['head', '頭'],
  ['leftupperarm', 'leftarm', '左腕'],
  ['rightupperarm', 'rightarm', '右腕'],
  ['leftlowerarm', 'leftelbow', '左ひじ'],
  ['rightlowerarm', 'rightelbow', '右ひじ'],
  ['lefthand', '左手首'],
  ['righthand', '右手首']
]

const getHumanoidNodeMap = (json) => {
  const out = {}
  const ext = json?.extensions || {}

  const vrm0 = ext.VRM?.humanoid?.humanBones
  if (Array.isArray(vrm0)) {
    vrm0.forEach((bone) => {
      if (typeof bone?.bone === 'string' && typeof bone?.node === 'number') {
        out[bone.bone] = bone.node
      }
    })
  }

  const vrm1 = ext.VRMC_vrm?.humanoid?.humanBones
  if (vrm1 && typeof vrm1 === 'object') {
    Object.entries(vrm1).forEach(([boneName, value]) => {
      if (typeof value?.node === 'number') out[boneName] = value.node
    })
  }

  return out
}

const findNodeByAliases = (root, aliases) => {
  let match = null
  root.traverse((obj) => {
    if (match || !obj?.name) return
    const lower = obj.name.toLowerCase()
    if (aliases.some((alias) => lower.includes(alias.toLowerCase()))) {
      match = obj
    }
  })
  return match
}

const setupAvatarRig = async (gltf) => {
  avatarBones = Array.from({ length: JOINT_COUNT }, () => null)
  avatarBindLocalRotations = Array.from({ length: JOINT_COUNT }, () => null)

  const humanoidMap = getHumanoidNodeMap(gltf.parser?.json)

  for (let j = 0; j < JOINT_COUNT; j += 1) {
    const humanoidBone = JOINT_TO_HUMANOID_BONE[j]
    let node = null

    const nodeIndex = humanoidMap[humanoidBone]
    if (typeof nodeIndex === 'number') {
      node = await gltf.parser.getDependency('node', nodeIndex)
    } else {
      node = findNodeByAliases(gltf.scene, JOINT_FALLBACK_ALIASES[j])
    }

    if (node) {
      avatarBones[j] = node
      avatarBindLocalRotations[j] = node.quaternion.clone()
    }
  }
  // Put this at the end of setupAvatarRig() or in loadAvatar() after await setupAvatarRig(gltf)
console.table(
  JOINT_TO_HUMANOID_BONE.map((name, i) => ({
    index: i,
    name: name,
    found: !!avatarBones[i],
    nodeName: avatarBones[i]?.name || '(not found)',
    bindRot: avatarBindLocalRotations[i] ? 'yes' : 'no'
  }))
)
}

const loadAvatar = async () => {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(new URL('../assets/seele.vrm', import.meta.url).href)

  avatarRoot = gltf.scene


  tempBox.setFromObject(avatarRoot)
  if (!tempBox.isEmpty()) {
    tempBox.getSize(tempVec)
    const height = Math.max(tempVec.z, 1e-4)
    const targetHeight = 1.7
    const scale = targetHeight / height
    avatarRoot.scale.setScalar(scale)
    avatarMotionScale = scale
  }

  avatarBasePosition.copy(avatarRoot.position)
  scene.add(avatarRoot)
  await setupAvatarRig(gltf)
}

const applyAvatarPoseFrame = (globalPos, localRot) => {
  if (!avatarRoot) return

  tempVec
  .copy(globalPos[0])
  .set(-globalPos[0].x, globalPos[0].z, globalPos[0].y)
  .multiplyScalar(avatarMotionScale)
  .add(AVATAR_SIDE_OFFSET)
  
  avatarRoot.position.copy(avatarBasePosition).add(tempVec)

  for (let j = 0; j < JOINT_COUNT; j += 1) {
    const bone = avatarBones[j]
    if (!bone) continue

    const bindQuat = avatarBindLocalRotations[j]
  bone.quaternion.multiply(correction)

    if (bindQuat) {
      const converted = smplQuatToThree(localRot[j])

      bone.quaternion
        .copy(bindQuat)
        .multiply(converted)
    } else {
      bone.quaternion.copy(localRot[j])
    }
  }
}

const buildSkeletonVisual = () => {
  skeletonGroup = new THREE.Group()

  const jointGeo = new THREE.SphereGeometry(0.03, 12, 10)
  const jointMat = new THREE.MeshStandardMaterial({ 
    color: 0x12b7ff, 
    roughness: 0.35, 
    metalness: 0.05 
  })

  jointMeshes = Array.from({ length: JOINT_COUNT }, () => {
    const mesh = new THREE.Mesh(jointGeo, jointMat)
    skeletonGroup.add(mesh)
    return mesh
  })

  // ── NOW create the labels ───────────────────────────────────────
  jointLabels = []  // clear if rebuilt

  JOINT_TO_HUMANOID_BONE.forEach((boneName, index) => {
    if (!boneName) return

    const label = new Text()
    label.text = boneName
    label.fontSize = 0.085
    label.color = 0x88ffee
    label.outlineColor = 0x000000
    label.outlineWidth = '0.008'
    label.outlineOpacity = 0.9
    label.anchorX = 'center'
    label.anchorY = 'bottom'
    label.position.set(0, 0.07, 0)         // slightly above sphere
    label.material = labelMaterial

    // Important: sync label visibility with skeleton
    label.visible = SHOW_DEBUG_SKELETON

    jointMeshes[index].add(label)
    jointLabels.push(label)
  })

  // ── lines ────────────────────────────────────────────────────────
  lineGeometry = new THREE.BufferGeometry()
  linePositions = new Float32Array(JOINT_EDGES.length * 2 * 3)
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
  const lineMat = new THREE.LineBasicMaterial({ color: 0x0b1f33 })
  const lines = new THREE.LineSegments(lineGeometry, lineMat)
  skeletonGroup.add(lines)

  skeletonGroup.visible = SHOW_DEBUG_SKELETON

  scene.add(skeletonGroup)
}

const applyPoseFrame = (frameIndex) => {
  if (!motionData) return

  const frame = frameIndex % motionData.frameCount
  const jointCount = Math.min(JOINT_COUNT, motionData.jointCount)
  const poseOffset = frame * motionData.jointCount * 3

  const localRot = Array.from({ length: JOINT_COUNT }, () => new THREE.Quaternion())
  const globalRot = Array.from({ length: JOINT_COUNT }, () => new THREE.Quaternion())
  const globalPos = Array.from({ length: JOINT_COUNT }, () => new THREE.Vector3())

  const tx = motionData.trans[frame * 3] - motionData.trans[0]
  const ty = motionData.trans[(frame * 3) + 1] - motionData.trans[1]
  const tz = motionData.trans[(frame * 3) + 2] - motionData.trans[2]
  globalPos[0].set(tx, ty, tz)

  for (let j = 0; j < jointCount; j += 1) {
    const idx = poseOffset + (j * 3)
    axisAngleToQuaternion(
      motionData.poses[idx],
      motionData.poses[idx + 1],
      motionData.poses[idx + 2],
      tempQuat
    )
    localRot[j].copy(tempQuat)

    const p = JOINT_PARENTS[j]
    if (p < 0) {
      globalRot[j].copy(tempQuat)
      continue
    }

    globalRot[j].copy(globalRot[p]).multiply(tempQuat)
    tempVec.fromArray(REST_OFFSETS[j]).applyQuaternion(globalRot[p])
    globalPos[j].copy(globalPos[p]).add(tempVec)
  }

  for (let j = 0; j < JOINT_COUNT; j += 1) {
    jointMeshes[j].position.copy(globalPos[j])
  }

  for (let e = 0; e < JOINT_EDGES.length; e += 1) {
    const a = JOINT_EDGES[e][0]
    const b = JOINT_EDGES[e][1]
    const base = e * 6
    linePositions[base] = globalPos[a].x
    linePositions[base + 1] = globalPos[a].y
    linePositions[base + 2] = globalPos[a].z
    linePositions[base + 3] = globalPos[b].x
    linePositions[base + 4] = globalPos[b].y
    linePositions[base + 5] = globalPos[b].z
  }
  lineGeometry.attributes.position.needsUpdate = true
  
  applyAvatarPoseFrame(globalPos, localRot)
}

const setupScene = () => {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  clock = new THREE.Clock()

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.up.set(0, 0, 1)
  camera.position.copy(initialCameraPosition)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enableZoom = true
  controls.target.copy(initialTargetPosition)
  controls.minPolarAngle = Math.PI / 4
  controls.maxPolarAngle = Math.PI - (Math.PI / 4)
  controls.screenSpacePanning = true
  controls.update()
  controls.addEventListener('start', () => {
    isInteracting = true
  })
  controls.addEventListener('end', () => {
    isInteracting = false
    logCameraDebug('Camera debug (after orbit)')
  })

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(2, 4, 5)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
  fillLight.position.set(-2, 2, -3)
  scene.add(ambientLight, directionalLight, fillLight, new THREE.AxesHelper(5))

  buildSkeletonVisual()
  loadAvatar().catch((error) => {
    console.error('Failed to load VRM avatar:', error)
  })

  fetch(new URL('../assets/motion_1eb24914-4d6.npz', import.meta.url).href)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch NPZ: ${res.status} ${res.statusText}`)
      return res.arrayBuffer()
    })
    .then(parseNpz)
    .then((npz) => {
      const poses = npz['poses.npy']?.value
      const trans = npz['trans.npy']?.value
      const fps = npz['mocap_framerate.npy']?.value
      if (!poses || !trans) throw new Error('NPZ missing poses.npy or trans.npy')

      motionData = {
        poses,
        trans,
        fps: Number(fps || 30),
        frameCount: trans.length / 3,
        jointCount: poses.length / ((trans.length / 3) * 3)
      }
      frameDuration = 1 / Math.max(motionData.fps, 1)

      console.log(
        `MotionBackground: loaded NPZ (${motionData.frameCount} frames @ ${motionData.fps} fps, ${motionData.jointCount} joints)`
      )
      applyPoseFrame(0)
      logCameraDebug('Camera debug (initial after load)')
    })
    .catch((error) => {
      console.error('Failed to load joint motion background:', error)
    })

  const animate = () => {
    frameId = requestAnimationFrame(animate)

    const delta = clock.getDelta()
    if (isPlaying.value && motionData?.frameCount) {
      accumulatedTime += delta
      if (accumulatedTime >= frameDuration) {
        currentFrameIndex = (currentFrameIndex + 1) % motionData.frameCount
        applyPoseFrame(currentFrameIndex)
        accumulatedTime = 0
      }
    }

    if (!isInteracting && (avatarRoot || skeletonGroup)) {
      tempBox.makeEmpty()
      if (skeletonGroup) tempBox.expandByObject(skeletonGroup)
      if (avatarRoot) {
        tempBox2.setFromObject(avatarRoot)
        tempBox.union(tempBox2)
      }
      if (!tempBox.isEmpty()) {
        tempBox.getCenter(tempTarget)
        tempTarget.add(followOffset)
        controls.target.lerp(tempTarget, 0.08)
      }
    }

    controls.update()
    renderer.render(scene, camera)
  }

  animate()

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

onMounted(() => {
  setupScene()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  cancelAnimationFrame(frameId)

  if (controls) controls.dispose()

  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }
})

const zoomIn = () => {
  if (!camera || !controls) return
  const direction = new THREE.Vector3()
  camera.getWorldDirection(direction)
  camera.position.addScaledVector(direction, 0.35)
  controls.update()
}

const zoomOut = () => {
  if (!camera || !controls) return
  const direction = new THREE.Vector3()
  camera.getWorldDirection(direction)
  camera.position.addScaledVector(direction, -0.35)
  controls.update()
}

const resetView = () => {
  if (!camera || !controls) return
  camera.position.copy(initialCameraPosition)
  controls.target.copy(initialTargetPosition)
  controls.update()
  logCameraDebug('Camera debug (reset)')
}

const toggleMotion = () => {
  isPlaying.value = !isPlaying.value
}

defineExpose({
  zoomIn,
  zoomOut,
  resetView,
  toggleMotion
})
</script>

<style scoped>
.motion-bg-root {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.motion-bg {
  position: absolute;
  inset: 0;
  pointer-events: auto;
}

.motion-toggle-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(9, 18, 27, 0.75);
  color: #e8f4ff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  pointer-events: auto;
}
</style>
