<script setup>
import { ref, computed } from 'vue';
import events from '@/assets/events.json';

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const category = ref('Business'); // Default category
const selectedEvent = ref('');

// Filter events based on selected category
const eventsList = computed(() =>
  events.filter(event => event.category === category.value)
);

// Password match check
const passwordsMatch = computed(() => password.value === confirmPassword.value);

// Summary message
const summaryMessage = computed(() => {
  if (username.value && category.value && selectedEvent.value) {
    const event = events.find(e => e.eventname === selectedEvent.value);
    return `User "${username.value}" registered for "${event.eventname}" (ID: ${event.eventid}, Duration: ${event.durationhour}h) under category "${category.value}".`;
  }
  return '';
});
</script>

<template>
  <section class="container my-5">
    <h2 class="mb-4 text-center">Event Registration</h2>
    <form class="row g-3">
      <!-- Username -->
      <div class="col-md-6">
        <label for="username" class="form-label">Username</label>
        <input
          type="text"
          id="username"
          class="form-control"
          v-model="username"
          placeholder="Enter your username"
        />
      </div>

      <!-- Password -->
      <div class="col-md-6">
        <label for="password" class="form-label">Password</label>
        <input
          type="password"
          id="password"
          class="form-control"
          v-model="password"
          placeholder="Enter your password"
        />
      </div>

      <!-- Confirm Password -->
      <div class="col-md-6">
        <label for="confirmPassword" class="form-label">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          class="form-control"
          v-model="confirmPassword"
          placeholder="Confirm your password"
        />
        <div class="text-danger mt-1" v-if="confirmPassword && !passwordsMatch">
          Passwords do not match.
        </div>
      </div>

      <!-- Event Category -->
      <div class="col-md-6">
        <label class="form-label">Event Category</label>
        <div class="d-flex gap-3 flex-wrap">
          <div v-for="cat of ['Technology','Business','Marketing','Finance']" :key="cat" class="form-check">
            <input
              class="form-check-input"
              type="radio"
              :id="cat"
              :value="cat"
              v-model="category"
            />
            <label class="form-check-label" :for="cat">{{ cat }}</label>
          </div>
        </div>
      </div>

      <!-- Event Name Dropdown -->
      <div class="col-md-6">
        <label for="eventName" class="form-label">Event Name</label>
        <select
          id="eventName"
          class="form-select"
          v-model="selectedEvent"
          :disabled="!eventsList.length"
        >
          <option value="" disabled>Select an event</option>
          <option v-for="event in eventsList" :key="event.eventid" :value="event.eventname">
            {{ event.eventname }}
          </option>
        </select>
      </div>

      <!-- Summary Message -->
      <div class="col-12 mt-3" v-if="summaryMessage">
        <div class="alert alert-success">
          {{ summaryMessage }}
        </div>
      </div>
    </form>
  </section>
</template>

<style scoped>
/* Optional: better display on small screens */
@media (max-width: 576px) {
  .form-check {
    flex: 1 1 100%;
  }
}
</style>
