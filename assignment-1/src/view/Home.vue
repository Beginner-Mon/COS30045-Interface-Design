<template>
  <div class="home container py-5 min-vh-100">
    <h1>Welcome to My Vue App!</h1>
    <p>This is the home page for your production-ready Vue project.</p>
    <button @click="clickMe" class="btn btn-primary">Click Me</button>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    clickMe() {
      alert('Hello from Home.vue!')
    },
  },
}
</script>

<style scoped>
.home {
  text-align: center;
}
</style>
