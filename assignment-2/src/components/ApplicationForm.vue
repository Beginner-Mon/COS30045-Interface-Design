<template>
  <form
    method="post"
    action="http://mercury.swin.edu.au/it000000/formtest.php"
    novalidate
    @submit.prevent="handleSubmit"
    class="bg-white p-4 rounded shadow-sm"
  >
    <!-- ================= PERSONAL INFORMATION ================= -->
    <fieldset class="mb-4">
      <legend class="fw-bold mb-3">Personal Information</legend>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">First Name *</label>
          <input name="firstName" v-model="form.firstName" class="form-control" />
          <small class="text-danger">{{ errors.firstName }}</small>
        </div>

        <div class="col-md-6">
          <label class="form-label">Last Name *</label>
          <input name="lastName" v-model="form.lastName" class="form-control" />
          <small class="text-danger">{{ errors.lastName }}</small>
        </div>

        <div class="col-md-6">
          <label class="form-label">Date of Birth *</label>
          <input name="dob" v-model="form.dob" type="date" class="form-control" />
          <small class="text-danger">{{ errors.dob }}</small>
        </div>
      </div>
    </fieldset>

    <!-- ================= ACCOUNT DETAILS ================= -->
    <fieldset class="mb-4">
      <legend class="fw-bold mb-3">Account Details</legend>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Username *</label>
          <input name="username" v-model="form.username" class="form-control" />
          <small class="text-danger">{{ errors.username }}</small>
        </div>

        <div class="col-md-6">
          <label class="form-label">Email *</label>
          <input name="email" v-model="form.email" type="email" class="form-control" />
          <small class="text-danger">{{ errors.email }}</small>
        </div>

        <div class="col-md-6">
          <label class="form-label">Password *</label>
          <input name="password" v-model="form.password" type="password" class="form-control" />
          <small class="text-danger">{{ errors.password }}</small>
        </div>

        <div class="col-md-6">
          <label class="form-label">Confirm Password *</label>
          <input
            name="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-control"
          />
          <small class="text-danger">{{ errors.confirmPassword }}</small>
        </div>
      </div>
    </fieldset>

    <!-- ================= ADDRESS ================= -->
    <fieldset class="mb-4">
      <legend class="fw-bold mb-3">Address</legend>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Street Address</label>
          <input name="street" v-model="form.street" class="form-control" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Suburb</label>
          <input name="suburb" v-model="form.suburb" class="form-control" />
        </div>

        <div class="col-md-4">
          <label class="form-label">Postcode *</label>
          <input name="postcode" v-model="form.postcode" class="form-control" />
          <small class="text-danger">{{ errors.postcode }}</small>
        </div>

        <div class="col-md-4">
          <label class="form-label">Mobile *</label>
          <input name="mobile" v-model="form.mobile" class="form-control" />
          <small class="text-danger">{{ errors.mobile }}</small>
        </div>
      </div>
    </fieldset>

    <!-- ================= JOB CATEGORY (NO FIELDSET) ================= -->
    <div class="mb-4">
      <label class="form-label fw-bold">Preferred Job Category</label>
      <select name="category" v-model="form.category" class="form-select">
        <option value="">-- No preference --</option>
        <option>AI</option>
        <option>Data Science</option>
        <option>Web Development</option>
        <option>Cybersecurity</option>
      </select>
      <small class="text-danger">{{ errors.category }}</small>
    </div>

    <!-- ================= TERMS ================= -->
    <div class="mb-3">
      <button type="button" class="btn btn-outline-secondary btn-sm" @click="toggleTerms">
        Terms & Conditions
      </button>

      <p v-if="showTerms" class="mt-2 small text-muted">
        By submitting this application, you confirm that the information provided is accurate and
        complete to the best of your knowledge.
      </p>
    </div>

    <!-- ================= SUBMIT ================= -->
    <button type="submit" class="btn btn-primary w-100">Submit Application</button>
  </form>
</template>


<script setup>
import { reactive, ref, onMounted } from 'vue'

const props = defineProps({
  initialCategory: {
    type: String,
    default: '',
  },
})

const form = reactive({
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  street: '',
  suburb: '',
  postcode: '',
  mobile: '',
  dob: '',
  category: '',
})

const errors = reactive({})
const showTerms = ref(false)

onMounted(() => {
  form.category = props.initialCategory || ''
})

const toggleTerms = () => {
  showTerms.value = !showTerms.value
}

const handleSubmit = (e) => {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!/^[A-Za-z]+$/.test(form.firstName)) errors.firstName = 'Letters only'
  if (!/^[A-Za-z]+$/.test(form.lastName)) errors.lastName = 'Letters only'
  if (form.username.length < 3) errors.username = 'Min 3 characters'
  if (!/^(?=.*[$%^&*]).{8,}$/.test(form.password)) errors.password = 'Min 8 chars & 1 special char'
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords must match'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Invalid email'
  if (!/^\d{4}$/.test(form.postcode)) errors.postcode = 'Exactly 4 digits'
  if (!/^04\d{8}$/.test(form.mobile)) errors.mobile = 'Must start with 04'

  const age = (new Date() - new Date(form.dob)) / (1000 * 60 * 60 * 24 * 365.25)
  if (!form.dob || age < 16) errors.dob = 'Must be at least 16'

  if (Object.keys(errors).length === 0) {
    e.target.submit()
  }
}
</script>
