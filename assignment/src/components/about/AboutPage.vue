<template>
  <!-- First Section -->
  <section class="min-vh-100 d-flex flex-column">
    <div
      class="position-relative d-flex p-5 align-items-center text-center text-white"
      style="height: 60vh"
    >
      <image
        src="/src/assets/bg.jpg"
        class="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
      ></image>
      <div
        class="position-absolute top-0 start-0 w-100 h-100"
        style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.25))"
      ></div>
      <h1 class="fw-bold position-relative" style="font-size: 3.5rem">About Page</h1>
    </div>
    <div class="d-flex" style="height: 35vh">
      <p class="p-4 p-md-5 fs-5 fs-md-4">
        This web application explores the integration of chatbots in physical therapy. It provides
        tools and resources for therapists and patients to utilize AI-driven conversational agents
        to enhance rehabilitation processes, track progress, and offer personalized exercise
        recommendations.
      </p>
    </div>
  </section>
</template>

<style scoped>
@media (max-width: 768px) {
  p {
    font-size: 1rem !important;
  }
}
</style>