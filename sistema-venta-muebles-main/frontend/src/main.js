import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// Estilos
import './assets/css/main.css'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

// Configuración de Pinia (store)
app.use(createPinia())

// Configuración del router
app.use(router)

// Inicializar el store de autenticación
const authStore = useAuthStore()
authStore.initialize()

// Configuración de vue-toastification
app.use(Toast, {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
<<<<<<< HEAD
  rtl: false,
})

app.mount('#app')
=======
  rtl: false
})

app.mount('#app')
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
