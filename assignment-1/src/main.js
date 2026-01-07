import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.js'
import '@/assets/base.css'
import '@/assets/main.css'
import App from './App.vue'
import { MotionPlugin } from "@vueuse/motion"
import router from './router'

const app = createApp(App)

app.use(router)
app.use(MotionPlugin)
app.mount('#app')
