<script setup>
import { ref, computed } from 'vue'
import events from '@/assets/events.json'

const searchEventID = ref('')
const searchEventName = ref('')
const searchDuration = ref('')
const selectedCategory = ref('None')

// Combined filter
const filteredEvents = computed(() => {
  return events.filter((e) => {
    const matchesID = e.eventid.toLowerCase().includes(searchEventID.value.toLowerCase())
    const matchesName = e.eventname.toLowerCase().includes(searchEventName.value.toLowerCase())
    const matchesDuration = searchDuration.value
      ? e.durationhour.toString().includes(searchDuration.value)
      : true
    const matchesCategory =
      selectedCategory.value === 'None'
        ? true
        : e.category.toLowerCase() === selectedCategory.value.toLowerCase()

    return matchesID && matchesName && matchesDuration && matchesCategory
  })
})
</script>

<template>
  <section class="min-vh-100 d-flex flex-column flex-md-row py">
    <!-- Filters -->
    <div
      class="col-12 col-md-3 p-4 mb-4 mb-md-0 me-md-4 position-md-sticky"
      :class="['vh-md-100 overflow-auto', 'sticky-md-top']"
    >
      <h3>Filters Option</h3>
      <div class="mb-3">
        <label class="form-label">Event ID</label>
        <input
          v-model="searchEventID"
          type="text"
          class="form-control"
          placeholder="Search by ID"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Event Name</label>
        <input
          v-model="searchEventName"
          type="text"
          class="form-control"
          placeholder="Search by Name"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Duration Hours</label>
        <input
          v-model="searchDuration"
          type="text"
          class="form-control"
          placeholder="Search by Duration"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Category</label>
        <div
          class="form-check"
          v-for="cat in ['None', 'Technology', 'Business', 'Marketing', 'Finance']"
          :key="cat"
        >
          <input
            class="form-check-input"
            type="radio"
            name="category"
            :value="cat"
            v-model="selectedCategory"
            :id="'cat-' + cat"
          />
          <label class="form-check-label" :for="'cat-' + cat">{{ cat }}</label>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="col-12 col-md-9 overflow-auto">
      <table class="table table-striped table-hover">
        <thead class="table-dark sticky-top">
          <tr>
            <th>Event ID</th>
            <th>Event Name</th>
            <th>Category</th>
            <th>Duration Hours</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in filteredEvents" :key="event.eventid">
            <td>{{ event.eventid }}</td>
            <td>{{ event.eventname }}</td>
            <td>{{ event.category }}</td>
            <td>{{ event.durationhour }}</td>
          </tr>
          <tr v-if="filteredEvents.length === 0">
            <td colspan="4" class="text-center">No events found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
/* Sticky sidebar only on md and above */
.sticky-md-top {
  top: 4rem;
  z-index: 1;
}

/* Sticky header for table */
.sticky-top {
  z-index: 2;
  background-color: #212529; /* match table-dark */
}

/* Make vh-100 work only on md+ */
.vh-md-100 {
  height: auto;
}
.py {
  padding-bottom: 3rem;
}
@media (min-width: 768px) {
  .vh-md-100 {
    height: 100vh;
  }
  .py {
    padding-bottom: 7rem;
    padding-top: 7rem;
  }
}
</style>
