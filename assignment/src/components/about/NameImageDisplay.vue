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
const imageSrc = ref('../src/assets/mountain.jpg')

// Watch for changes in selectedImage
watch(selectedImage, (newVal) => {
  if (newVal === 'mountain') {
    imageSrc.value = '../src/assets/mountain.jpg'
  } else if (newVal === 'ocean') {
    imageSrc.value = '../src/assets/ocean.jpg'
  }
})
</script>

<template>
  <section class="position-relative overflow-hidden vh-100">

  <!-- Background Image -->
  <img
    :src="imageSrc"
    alt="Selected Landscape"
    class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
    style="z-index: 1"
  />

  <!-- Black Overlay (NON CLICKABLE) -->
  <div class="position-absolute top-0 start-0 w-100 h-100" style="z-index: 2; background: rgba(0, 0, 0, 0.5); pointer-events: none"></div>

  <!-- Content Wrapper -->
  <div class="position-relative h-100" style="z-index: 3; background: transparent">

    <!-- Section Two -->
    <div class="h-100 py-5 d-flex align-items-center justify-content-center">
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
    <div class="position-absolute d-flex flex-column justify-content-center gap-3 p-4 text-white" style="top: 50px; right: 0; z-index: 4">
  
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
.icon-label {
  cursor: pointer;
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
