<script setup>
import { ref, watch } from 'vue'
// State for welcome message
const firstName = ref('')
const lastName = ref('')
const welcomeMessage = ref('Welcome')

// Update welcome message
const updateWelcome = () => {
  if (firstName.value && lastName.value) {
    welcomeMessage.value = `Welcome, ${firstName.value} ${lastName.value}`
  }
}
const selectedImage = ref('mountain')
const imageSrc = ref('../src/assets/mountain.jpg') // Replace with actual image URLs

// Watch for changes in selectedImage
watch(selectedImage, (newVal) => {
  if (newVal === 'mountain') {
    imageSrc.value = '../src/assets/mountain.jpg' // Actual mountain image URL
  } else if (newVal === 'ocean') {
    imageSrc.value = '../src/assets/ocean.jpg' // Actual ocean image URL
  }
})
</script>

<template>
  <section class="position-relative overflow-hidden">

  <!-- Background Image -->
  <img
    :src="imageSrc"
    alt="Selected Landscape"
    class="bg-image"
  />

  <!-- Black Overlay (NON CLICKABLE) -->
  <div class="overlay"></div>

  <!-- Content Wrapper -->
  <div class="content-wrapper position-relative">

    <!-- Section Two -->
    <div class="section-two py-5 d-flex align-items-center justify-content-center">
      <div class="container text-center">
        <h1 class="text-white mb-4">
          <span
            v-for="(char, index) in welcomeMessage.split('')"
            :key="index"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: index * 50 } }"
          >
            {{ char }}
          </span>
        </h1>

        <div class="row justify-content-center">
          <div class="col-md-6 d-flex flex-column flex-md-row gap-3">
            <input
              v-model="firstName"
              type="text"
              class="form-control"
              placeholder="First Name"
            />
            <input
              v-model="lastName"
              type="text"
              class="form-control"
              placeholder="Last Name"
            />
            <button @click="updateWelcome" class="btn btn-primary">
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Three -->
<div class="section-three text-white p-4 d-flex flex-column justify-content-center gap-3">
  
  <!-- Mountain -->
  <div>
    <input
      type="radio"
      id="mountain"
      name="landscape"
      value="mountain"
      v-model="selectedImage"
      class="d-none"
    />
    <label for="mountain" class="icon-label">
      <img src="@/assets/mountain.svg" alt="Mountain" />
    </label>
  </div>

  <!-- Ocean -->
  <div>
    <input
      type="radio"
      id="ocean"
      name="landscape"
      value="ocean"
      v-model="selectedImage"
      class="d-none"
    />
    <label for="ocean" class="icon-label">
      <img src="@/assets/ocean.svg" alt="Ocean" />
    </label>
  </div>

</div>

  </div>
</section>
</template>
<style scoped>
/* Background image with lazy loading - using CSS background for better control */
.image-wrapper {
  /* Ensures the wrapper takes full height of its parent col */
  height: 100%;
}
section {
  height: 100vh;
}

/* Background image */
.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Dark overlay */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2;

  /* THIS FIXES CLICK BLOCKING */
  pointer-events: none;
}

/* Content above everything */
.content-wrapper {
  position: relative;
  z-index: 3;
  height: 100%;
  background: transparent;
}

.section-two {
  height: 100%;
}

.section-three {
  position: absolute;
  top: 50px;
  right: 0;
  z-index: 4;
}
.icon-label {
  cursor: pointer;
  color: white;
  transition: transform 0.2s ease;
}

.icon-label img {
  width: 36px;
  height: 36px;
}

.icon-label:hover {
  transform: scale(1.1);
}

/* Highlight selected icon */
input[type="radio"]:checked + .icon-label {
  filter: drop-shadow(0 0 8px white);
}
</style>
