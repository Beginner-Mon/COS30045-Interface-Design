<template>
  <footer class=" p-5">
    <!-- Title -->
    <h1 class="mb-4">Embodied Conversational Agent</h1>

    <!-- Content -->
    <div class="row g-4 mb-4 align-items-stretch">
      <!-- LEFT: Location (9/12) -->
      <div class="col-12 col-md-9 d-flex flex-column">
        <h4 class="section-title mb-3">Our Location</h4>

        <div class="flex-grow-1 rounded overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.936029531612!2d106.66643217451772!3d10.816207558459821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ff6c51d5ebd%3A0x4403e126c229b92b!2sSwinburne%20Vietnam%20Alliance%20Program%20-%20HCMC%20location!5e0!3m2!1svi!2s!4v1768185494985!5m2!1svi!2s"
            class="w-100 h-100 border"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          >
          </iframe>
        </div>

        <p class="text-muted mt-3">
          Based in Hanoi, Vietnam — we collaborate globally to build efficient hiring solutions
          powered by modern technology.
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
    <div class="border-top text-center text-muted">© 2026 Insight Hire. All rights reserved.</div>
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
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.icon-hover:hover {
  transform: scale(1.15);
  opacity: 0.8;
}
</style>
