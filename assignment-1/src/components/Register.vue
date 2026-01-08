<template>
  <section
    class="min-h-50vh d-flex justify-content-center align-items-center p-4 position-relative overflow-hidden"
  >
    <img
      src="@/assets/register.jpg"
      alt="Event background"
      loading="lazy"
      class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
      style="object-position: top"
    />

    <!-- Black Gradient Overlay -->
    <div
      class="position-absolute top-0 start-0 w-100 h-100"
      style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.26))"
    ></div>

    <div class="position-relative text-white text-center px-3 content">
      <h1 class="fw-bold display-6 display-md-5 display-lg-4">Register Now</h1>

      <RouterLink to="/registration" class="btn btn-outline-light mt-3 px-4 py-2">
        Go to Registration Form
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.min-h-50vh {
  min-height: 70vh;
}
.content {
  margin-top: 4rem;
}
</style>
