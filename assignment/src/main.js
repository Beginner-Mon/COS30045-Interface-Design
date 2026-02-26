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
import { initializeAuthListener } from '@/services/authService'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(MotionPlugin)

// Initialize global auth listener AT APP STARTUP
initializeAuthListener()

// Initialize authentication state in store
const userStore = useUserStore()
userStore.initializeAuth()

app.mount('#app')
