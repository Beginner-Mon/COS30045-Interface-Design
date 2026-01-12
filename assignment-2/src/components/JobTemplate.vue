<template>
  <section class="p-5 my-5">
    <div class="container text-center">
      <!-- Title -->
      <h1 class="job-title mb-4">
        Job Overview
      </h1>

      <!-- Description -->
      <p class="lead mb-3">
        This job opportunity is designed for individuals who are passionate about
        growth, innovation, and continuous learning. You will be working in a
        dynamic environment where collaboration and problem-solving are highly
        valued, allowing you to develop both technical and professional skills.
      </p>

      <p class="lead">
        The role offers exposure to real-world projects, hands-on experience with
        modern tools and technologies, and mentorship from experienced professionals.
        Whether you are starting your career or looking to sharpen your expertise,
        this position provides a solid foundation for long-term success.
      </p>
    </div>
  </section>
</template>

<style scoped>
.job-title {
  display: inline-block;
  position: relative;
  padding-bottom: 0.5rem;
}

.job-title::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 80px;
  height: 4px; /* stronger underline */
  background-color: #000;
  border-radius: 2px;
}
</style>
