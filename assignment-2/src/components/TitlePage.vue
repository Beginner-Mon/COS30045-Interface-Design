<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section
    class="hero-section pt-5 d-flex justify-content-center align-items-center position-relative overflow-hidden mb-5"
  >
    <!-- Background Image -->
    <img
      :src="image"
      alt="Background"
      loading="lazy"
      class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
    />

    <!-- Black Gradient Overlay -->
    <div class="overlay position-absolute top-0 start-0 w-100 h-100"></div>

    <!-- Title -->
    <h1 class="position-relative text-white text-center fw-bold">
      {{ title }}
    </h1>
  </section>
</template>

<style scoped>
img {
  object-position: top;
}
.hero-section {
  min-height: 75vh;
}

/* Black gradient overlay */
.overlay {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.2));
}
</style>
