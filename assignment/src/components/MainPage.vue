<template>
  <section
    class="min-vh-100 pt-5 d-flex justify-content-center align-items-center position-relative overflow-hidden"
  >
    <!-- Background Image -->
    <img
      src="@/assets/bg.jpg"
      alt="Event background"
      loading="lazy"
      class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
      style="object-position: center"
    />

    <!-- Black Gradient Overlay -->
    <!-- <div
      class="position-absolute top-0 start-0 w-100 h-100"
      style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.25))"
    ></div> -->

    <!-- Content -->
    <div
      v-motion
      :initial="{ y: 40, opacity: 0 }"
      :enter="{ y: 0, opacity: 1 }"
      :transition="{ duration: 3, ease: 'easeInOut' }"
      class="position-relative text-center text-white px-3"
    >
      <h1 class="display-5 fw-bold mb-3">Welcome to ECA</h1>

      <p class="lead mb-4">
        Experience the power of ECA - Chat with AI, create stunning 3D models, and build interactive experiences all in one platform.
      </p>

      <RouterLink to="/dashboard" class="btn btn-outline-light btn-lg"> Get Started </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
