<script setup>
const reasons = [
  {
    title: 'Text to Speech',
    description: 'AI-driven text-to-speech with emotional expression.',
    image: '/TTS.jpg',
  },
  {
    title: 'Agentic RAG',
    description: 'Intelligent agents providing accurate, contextual responses.',
    image: '/RAG.jpg',
  },
  {
    title: 'Text to Motion',
    description: 'Transform text into dynamic motion and animation.',
    image: '/t2m.jpg',
  },
]
</script>

<template>
  <section class="min-vh-100 py bg-light d-flex align-items-center">
    <div class="container-fluid px-4 px-md-5">
      <!-- Title only -->
      <div class="mb-5">
        <h1 class="fw-bold">Why Choose Us?</h1>
      </div>

      <div class="row g-3 justify-content-center">
        <div v-for="(item, index) in reasons" :key="index" class="col-12 col-md-6 col-lg-4">
          <div
            class="position-relative child-div d-flex align-items-end overflow-hidden p-4 text-white"
          >
            <!-- Background image -->
            <img
              :src="item.image"
              loading="lazy"
              :alt="item.image"
              class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            />

            <div
              class="position-absolute top-0 start-0 w-100 h-100"
              style="background: linear-gradient(to top, rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.16))"
            ></div>

            <div class="position-relative">
              <h4 class="fw-semibold mb-1">{{ item.title }}</h4>
              <p class="mb-0">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<style scoped>
.py {
  padding-top: 7rem;
  padding-bottom: 7rem;
}
.child-div {
  min-height: 10rem;
}

@media (min-width: 768px) {
  .child-div {
    min-height: 24rem;
  }
}
</style>
