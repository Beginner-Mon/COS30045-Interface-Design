<script setup>
import { ref, computed } from 'vue'
import events from '@/assets/events.json'
import bgImage from '@/assets/registration-bg.jpg'
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const category = ref('Business')
const selectedEvent = ref('')

// Filter events based on category
const eventsList = computed(() =>
  events.filter(event => event.category === category.value)
)

// Passwords match check
const passwordsMatch = computed(
  () => password.value === confirmPassword.value
)

// Get selected event data
const selectedEventData = computed(() =>
  events.find(e => e.eventname === selectedEvent.value)
)
</script>

<template>
  <section class="registration-section position-relative" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="section-overlay"></div>
    <div class="container">
      <h1 class="mb-5 text-center text-white">Registration</h1>

      <!-- Personal & Event Info Row -->
      <div class="row g-4 d-flex align-items-stretch">

        <!-- Personal Information -->
        <div class="col-lg-6 col-12 d-flex">
          <fieldset class="flex-fill">
            <legend class="fieldset-title">Account Information</legend>

            <div class="mb-3">
              <label class="form-label">Username</label>
              <input type="text" class="form-control" v-model="username" />
            </div>

            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" v-model="password" />
            </div>

            <div class="mb-3">
              <label class="form-label">Confirm Password</label>
              <input type="password" class="form-control" v-model="confirmPassword" />
              <small class="text-danger" v-if="confirmPassword && !passwordsMatch">
                Passwords do not match
              </small>
            </div>
          </fieldset>
        </div>

        <!-- Event Information -->
        <div class="col-lg-6 col-12 d-flex">
          <fieldset class="flex-fill">
            <legend class="fieldset-title">Event Selection</legend>

            <div class="mb-3">
              <label class="form-label">Category</label>
              <div class="d-flex gap-3 flex-wrap">
                <div v-for="cat in ['Technology','Business','Marketing','Finance']" :key="cat" class="form-check">
                  <input class="form-check-input" type="radio" :value="cat" v-model="category" />
                  <label class="form-check-label">{{ cat }}</label>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Event Name</label>
              <select class="form-select" v-model="selectedEvent" :disabled="!eventsList.length">
                <option value="" disabled>Select an event</option>
                <option v-for="event in eventsList" :key="event.eventid" :value="event.eventname">
                  {{ event.eventname }}
                </option>
              </select>
            </div>
          </fieldset>
        </div>

      </div>

      <!-- Summary Row -->
      <div class="row mt-4">
        <div class="col-12 d-flex">
          <div class="summary-box flex-fill">
            <h4 class="mb-4">Summary</h4>

            <div v-if="username && selectedEventData">

              <!-- Personal Information -->
              <div class="summary-section mb-3">
                <h6 class="summary-title">Personal Information</h6>
                <p class="mb-0"><strong>Username:</strong> {{ username }}</p>
              </div>

              <!-- Event Information -->
              <div class="summary-section">
                <h6 class="summary-title">Selected Event</h6>
                <p class="mb-1"><strong>Category:</strong> {{ category }}</p>
                <p class="mb-1"><strong>Event:</strong> {{ selectedEventData.eventname }}</p>
                <p class="mb-0">
                  <strong>ID:</strong> {{ selectedEventData.eventid }} |
                  <strong>Duration:</strong> {{ selectedEventData.durationhour }}h
                </p>
              </div>

            </div>

            <p v-else class="text-white-50">Complete the form to see your summary.</p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.registration-section {
  min-height: 100vh;
  padding: 6rem 0;
  position:relative;
  background-color: #f8f9fa;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.section-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0));
  z-index: 0; /* behind content */
}
.container {
    position: relative;
  z-index: 1;
}
/* Glassmorphism Fieldsets & Summary */
fieldset,
.summary-box {
  
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #fff;
}

.fieldset-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Summary sections */
.summary-section {
  background: rgba(255, 255, 255, 0.18);
  padding: 1rem;
  border-radius: 14px;
}

.summary-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

@media (max-width: 991px) {
  .summary-box {
    position: static;
  }
}
</style>
