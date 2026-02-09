<template>
  <section class="w-100 min-vh-100 d-flex flex-wrap position-relative">
    <!-- Image side -->
    <div class="col-12 col-md-6 position-relative overflow-hidden">
      <img
        src="@/assets/temp.jpg"
        alt="Job Image"
        class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
      />
    </div>

    <!-- Content side -->
    <div class="col-12 col-md-6 p-4 d-flex align-items-center">
      <div>
        <h2 class="job-title mb-3">Job Overview</h2>
        <p class="text-muted">
          This role focuses on delivering high-quality solutions while working closely with
          cross-functional teams. You will be responsible for designing, implementing, and
          maintaining scalable systems that meet business requirements.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.job-title {
  position: relative;
  display: inline-block;
}

.job-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 80%;
  height: 4px;
  background-color: #0d6efd; /* Bootstrap primary blue */
}
</style>
