<script setup lang="ts">
const reasons = [
  {
    title: 'Trusted Experience',
    description: 'Years of experience delivering reliable and scalable solutions.'
  },
  {
    title: 'Modern Technology',
    description: 'We use the latest tools and frameworks to build fast applications.'
  },
  {
    title: 'Customer Focused',
    description: 'Your needs come first in every design and development decision.'
  },
  {
    title: 'Secure by Design',
    description: 'Security is integrated at every layer of our systems.'
  },
  {
    title: 'Scalable Solutions',
    description: 'Built to grow with your business and traffic.'
  },
  {
    title: 'Dedicated Support',
    description: 'We provide continuous support and maintenance.'
  }
]
</script>

<template>
  <section class="h-section my ">
      <div class="row w-100 h-100">
            <!-- LEFT IMAGE -->
        <div class="left-div position-sticky d-flex align-items-end overflow-hidden col-lg-6  p-5">
            
          <img
            src="@/assets/temp.jpg"
            alt="Why choose us"
            loading="lazy"
            class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
          />

          <!-- Gradient Overlay -->
          <div
            class="position-absolute top-0 start-0 w-100 h-100"
            style="
              background: linear-gradient(
                to top,
                rgba(0, 0, 0, 0.15),
                rgba(0, 0, 0, 0.12)
              );
            "
          ></div>
          <h1 class="z-2 p-4 text-white fw-bold">Why Choose Us ?</h1>
        </div>
          
    

        <!-- RIGHT CONTENT -->
        <div class="col-lg-6 right-div">
          <div
            v-for="(reason, index) in reasons"
            :key="index"
            class="mb-4 p-5 bg-white border border-solid-1px position-sticky children"
          
          >
            <h5 class="fw-bold mb-2">{{ reason.title }}</h5>
            <p class="mb-0 text-muted">{{ reason.description }}</p>
          </div>
        </div>

      </div>
 
  </section>
</template>
<style scoped>
    .h-section {
        height: 196vh;
    }
    .left-div {
        height: 100vh;
        top: 0;
    }
    .my {
        margin-top: 8rem;
        margin-bottom: 8rem;
    }
    .right-div {
        padding: 6rem;
       
    }
    .children {
        top: 8rem;
    }
</style>