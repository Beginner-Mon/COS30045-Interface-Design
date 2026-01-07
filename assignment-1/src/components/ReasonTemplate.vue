<script setup>
import tempImage from '@/assets/temp.jpg'

const reasons = [
  {
    title: 'Professional Team',
    description: 'Our experienced team delivers high-quality solutions with attention to detail.',
    image: tempImage,
  },
  {
    title: 'Modern Technology',
    description: 'We use the latest tools and frameworks to ensure performance and scalability.',
    image: tempImage,
  },
  {
    title: 'Reliable Support',
    description: '24/7 support to help you whenever you need assistance.',
    image: tempImage,
  },
  {
    title: 'Secure Systems',
    description: 'Security is our top priority to keep your data safe.',
    image: tempImage,
  },
  {
    title: 'Fast Delivery',
    description: 'We value your time and ensure timely project completion.',
    image: tempImage,
  },
  {
    title: 'Customer Satisfaction',
    description: 'We focus on long-term relationships and client satisfaction.',
    image: tempImage,
  },
]
</script>

<template>
  <section class="min-vh-100 py bg-light d-flex align-items-center">
    <div class="container">
      <!-- Title only -->
      <div class="mb-5">
        <h1 class="fw-bold">Why Choose Us?</h1>
      </div>

      <div class="row g-3 justify-content-center">
        <div v-for="(item, index) in reasons" :key="index" class="col-12 col-md-6 col-lg-4">
          <div
            class="position-relative d-flex align-items-end overflow-hidden p-4 text-white"
            style="min-height: 16rem"
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
              style="background: linear-gradient(to top, rgba(0, 0, 0, 0.22), rgba(0, 0, 0, 0.1))"
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
</style>
