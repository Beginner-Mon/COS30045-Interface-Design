<template>
  <!-- First Section -->
  <section class="section-one min-vh-100 d-flex flex-column">
    <div
      class="hero position-relative d-flex p-5 align-items-center text-center text-white"
      style="height: 60vh"
    >
      <image
        src="/src/assets/temp.jpg"
        class="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
      ></image>
      <div
        class="position-absolute top-0 start-0 w-100 h-100"
        style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.25))"
      ></div>
      <h1 class="fw-bold position-relative" style="font-size: 3.5rem">About Page</h1>
    </div>
    <div class="description d-flex" style="height: 35vh">
      <p class="p-5" style="font-size: 1.4em">
        This web application explores the integration of chatbots in physical therapy. It provides
        tools and resources for therapists and patients to utilize AI-driven conversational agents
        to enhance rehabilitation processes, track progress, and offer personalized exercise
        recommendations.
      </p>
    </div>
  </section>
  <!-- Second Section -->
  <section class="section-two py-5" style="min-height: 50vh; background-color: #111111">
    <div class="container">
      <h1 class="text-white text-center mb-4">
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
            aria-label="First Name"
          />
          <input
            v-model="lastName"
            type="text"
            class="form-control"
            placeholder="Last Name"
            aria-label="Last Name"
          />
          <button @click="updateWelcome" class="btn btn-primary">Enter</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Third Section -->

  <section class="section-three min-vh-100 d-flex align-items-center">
    <div class="container h-100">
      <div class="row h-100 align-items-center">
        <div class="col-md-4 d-flex flex-column gap-3 text-white">
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              id="mountain"
              value="mountain"
              v-model="selectedImage"
            />
            <label class="form-check-label" for="mountain">Mountain</label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              id="ocean"
              value="ocean"
              v-model="selectedImage"
            />
            <label class="form-check-label" for="ocean">Ocean</label>
          </div>
        </div>

        <div class="col-md-8 h-100">
          <div class="image-wrapper h-100 w-100 overflow-hidden">
            <img
              :src="imageSrc"
              alt="Selected landscape"
              class="w-100 h-100 object-fit-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

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

// State for image selection
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

// For animations, since we use v-motion directive from @vueuse/motion, it's already set in template
</script>

<style scoped>
/* Background image with lazy loading - using CSS background */

/* Responsive adjustments */
@media (max-width: 768px) {
  .section-one {
    flex-direction: column;
  }
  .hero,
  .description {
    height: auto !important;
    min-height: 50vh;
  }
  .description {
    padding: 2rem !important;
  }
  .section-three .row {
    flex-direction: column;
  }
  .section-three img {
    height: auto !important;
  }
}

@media (max-width: 576px) {
  .section-two .d-flex {
    flex-direction: column !important;
  }
}
.image-wrapper {
  /* Ensures the wrapper takes full height of its parent col */
  height: 100%;
}
</style>
