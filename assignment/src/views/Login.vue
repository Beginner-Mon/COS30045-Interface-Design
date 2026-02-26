<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="mb-2">Welcome Back</h1>
        <p class="text-muted">Sign in to your account</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ errorMessage }}
        <button type="button" class="btn-close" @click="errorMessage = ''"></button>
      </div>

      <!-- Email Login Form -->
      <form @submit.prevent="handleEmailLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-control"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- Divider -->
      <div class="divider mb-3">
        <span>OR</span>
      </div>

      <!-- Google Sign In -->
      <button @click="handleGoogleLogin" class="btn btn-outline-primary w-100 mb-3" :disabled="isLoading">
        <svg width="20" height="20" class="me-2" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {{ isLoading ? 'Signing in...' : 'Sign in with Google' }}
      </button>

      <!-- Sign Up Link -->
      <div class="text-center mt-4">
        <p class="text-muted mb-0">
          Don't have an account?
          <router-link to="/signup" class="text-decoration-none fw-bold">Sign Up</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const email = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const isLoading = ref(false)

    const handleEmailLogin = async () => {
      errorMessage.value = ''
      isLoading.value = true

      try {
        await userStore.login(email.value, password.value)
        router.push('/dashboard')
      } catch (error) {
        errorMessage.value = error.message || 'Failed to sign in. Please check your credentials.'
      } finally {
        isLoading.value = false
      }
    }

    const handleGoogleLogin = async () => {
      errorMessage.value = ''
      isLoading.value = true

      try {
        await userStore.loginWithGoogle()
        router.push('/dashboard')
      } catch (error) {
        errorMessage.value = error.message || 'Failed to sign in with Google.'
      } finally {
        isLoading.value = false
      }
    }

    return {
      email,
      password,
      errorMessage,
      isLoading,
      handleEmailLogin,
      handleGoogleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #212529;
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #adb5bd;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e9ecef;
}

.divider span {
  font-weight: 500;
  font-size: 0.875rem;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 576px) {
  .login-card {
    padding: 1.5rem;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>
