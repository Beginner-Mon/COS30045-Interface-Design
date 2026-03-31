import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.js'
import '@/assets/base.css'
import '@/assets/main.css'
import App from './App.vue'
import { MotionPlugin } from '@vueuse/motion'
import { createPinia } from 'pinia'
import router from './router'
import { useUserStore } from '@/stores/userStore'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(MotionPlugin)

// Custom directive: v-autofocus
// Automatically focuses an input element when it is mounted into the DOM
app.directive('autofocus', {
  mounted(el) {
    // If the element itself is focusable, focus it; otherwise find the first input inside
    const target = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el : el.querySelector('input, textarea')
    if (target) {
      target.focus()
    }
  }
})

// Initialize authentication
const userStore = useUserStore()
userStore.initializeAuth(router)

app.mount('#app')
