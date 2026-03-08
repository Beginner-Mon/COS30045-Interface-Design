<template>
  <div ref="container" class="viewer"></div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import * as THREE from "three"
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js"

const container = ref(null)

const jointNames = [
"pelvis","left_hip","right_hip","spine1","left_knee","right_knee",
"spine2","left_ankle","right_ankle","spine3","left_foot","right_foot",
"neck","left_collar","right_collar","head","left_shoulder","right_shoulder",
"left_elbow","right_elbow","left_wrist","right_wrist"
]

onMounted(async () => {

const res = await fetch("/joints.json")
const frames = await res.json()

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
75,
container.value.clientWidth/container.value.clientHeight,
0.1,
1000
)

camera.position.set(2,2,2)

const renderer = new THREE.WebGLRenderer({antialias:true})
renderer.setSize(container.value.clientWidth,container.value.clientHeight)

container.value.appendChild(renderer.domElement)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(container.value.clientWidth,container.value.clientHeight)
labelRenderer.domElement.style.position = "absolute"
labelRenderer.domElement.style.top = "0px"

container.value.appendChild(labelRenderer.domElement)

const sphereGeo = new THREE.SphereGeometry(0.02)

const nodes = []

for(let i=0;i<55;i++){

const mat = new THREE.MeshBasicMaterial()
const sphere = new THREE.Mesh(sphereGeo,mat)

scene.add(sphere)

const div = document.createElement("div")
div.className="label"
div.textContent = jointNames[i] || `joint_${i}`

const label = new CSS2DObject(div)
sphere.add(label)

nodes.push(sphere)
}

let frame = 0

function animate(){

requestAnimationFrame(animate)

const joints = frames[frame]

for(let i=0;i<nodes.length;i++){

const j = joints[i]

nodes[i].position.set(j[0], j[1], j[2])
}

frame = (frame + 1) % frames.length

renderer.render(scene,camera)
labelRenderer.render(scene,camera)
}

animate()

})
</script>

<style>
.viewer{
width:100%;
height:600px;
}

.label{
color:white;
font-size:12px;
background:rgba(0,0,0,0.5);
padding:2px 4px;
}
</style>