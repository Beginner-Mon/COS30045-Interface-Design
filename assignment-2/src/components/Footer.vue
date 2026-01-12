<template>
  <footer class="bg-light p-5">
    <!-- Title -->
    <h1 class="mb-4">Insight Hire</h1>

    <!-- Content -->
    <div class="row g-4 mb-4 align-items-stretch">
      
      <!-- LEFT: Location (9/12) -->
      <div class="col-12 col-md-9 d-flex flex-column">
        <h4 class="section-title mb-3">Our Location</h4>

        <div class="flex-grow-1 rounded overflow-hidden">
          <iframe
            class="w-100 h-100 border-0"
            loading="lazy"
            src="https://www.google.com/maps?q=Hanoi,Vietnam&output=embed"
          ></iframe>
        </div>

        <p class="text-muted mt-3">
          Based in Hanoi, Vietnam — we collaborate globally to build efficient
          hiring solutions powered by modern technology.
        </p>
      </div>

      <!-- RIGHT: Contact (3/12) -->
      <div class="col-12 col-md-3">
        <h4 class="section-title mb-3">Contact Us</h4>

        <div class="d-flex gap-4 align-items-center fs-4">
          <a href="#" class="text-dark icon-hover">
            <i class="bi bi-facebook"></i>
          </a>

          <a href="tel:+123456789" class="text-dark icon-hover">
            <i class="bi bi-telephone-fill"></i>
          </a>

          <a href="mailto:contact@insighthire.com" class="text-dark icon-hover">
            <i class="bi bi-envelope-fill"></i>
          </a>
        </div>
      </div>

    </div>

    <!-- Bottom -->
    <div class=" border-top text-center text-muted">
      © 2026 Insight Hire. All rights reserved.
    </div>
  </footer>
</template>

<style scoped>
.section-title {
  position: relative;
  padding-bottom: 0.4rem;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 45px;
  height: 3px;
  background-color: #000;
}

.icon-hover {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.icon-hover:hover {
  transform: scale(1.15);
  opacity: 0.8;
}
</style>
