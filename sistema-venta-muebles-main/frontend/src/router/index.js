// IMPORTS - Importación de Vue Router y store de autenticación
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// IMPORTAR VISTAS - Importación de todos los componentes de vista
import Home from '@/views/HomeView.vue'
import Login from '@/views/auth/LoginView.vue'
import Register from '@/views/auth/RegisterView.vue'
import ForgotPassword from '@/views/auth/ForgotPasswordView.vue'
import ResetPassword from '@/views/auth/ResetPasswordView.vue'

// Vistas del catálogo
import Catalog from '@/views/CatalogoView.vue'

// Vistas de pedidos
import Orders from '@/views/PedidosView.vue'
<<<<<<< HEAD
import OrderDetail from '@/views/PedidoDetalleView.vue'
=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

// Vistas de recomendaciones
import Recommendations from '@/views/RecomendacionesView.vue'

// Vistas de análisis de espacio con IA
import AnalisisEspacio from '@/views/AnalisisEspacioView.vue'
<<<<<<< HEAD
import Cotizacion from '@/views/CotizacionView.vue'
=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

// Vistas de diagnóstico de IA
import DiagnosticoIA from '@/views/DiagnosticoIAView.vue'

// Vistas del perfil
import Profile from '@/views/PerfilView.vue'

// Vistas de administración
import AdminDashboard from '@/views/DashboardView.vue'
<<<<<<< HEAD
import AdminCotizaciones from '@/views/AdminCotizacionesView.vue'
=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

// CONFIGURACIÓN DE RUTAS - Definición de todas las rutas de la aplicación
const routes = [
  // RUTAS PÚBLICAS - Accesibles sin autenticación
  {
    path: '/',
    name: 'home',
    component: Home,
<<<<<<< HEAD
    meta: {
      title: 'Inicio',
      requiresAuth: false, // No requiere autenticación
    },
=======
    meta: { 
      title: 'Inicio',
      requiresAuth: false // No requiere autenticación
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
<<<<<<< HEAD
    meta: {
      title: 'Iniciar Sesión',
      requiresAuth: false,
      hideForAuth: true, // Se oculta para usuarios ya autenticados
    },
=======
    meta: { 
      title: 'Iniciar Sesión',
      requiresAuth: false,
      hideForAuth: true // Se oculta para usuarios ya autenticados
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
<<<<<<< HEAD
    meta: {
      title: 'Registrarse',
      requiresAuth: false,
      hideForAuth: true, // Se oculta para usuarios ya autenticados
    },
=======
    meta: { 
      title: 'Registrarse',
      requiresAuth: false,
      hideForAuth: true // Se oculta para usuarios ya autenticados
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },
  {
    path: '/auth/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
<<<<<<< HEAD
    meta: {
      title: 'Recuperar Contraseña',
      requiresAuth: false,
      hideForAuth: true, // Se oculta para usuarios ya autenticados
    },
=======
    meta: { 
      title: 'Recuperar Contraseña',
      requiresAuth: false,
      hideForAuth: true // Se oculta para usuarios ya autenticados
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },
  {
    path: '/auth/reset-password/:token',
    name: 'reset-password',
    component: ResetPassword,
<<<<<<< HEAD
    meta: {
      title: 'Restablecer Contraseña',
      requiresAuth: false,
      hideForAuth: true, // Se oculta para usuarios ya autenticados
    },
=======
    meta: { 
      title: 'Restablecer Contraseña',
      requiresAuth: false,
      hideForAuth: true // Se oculta para usuarios ya autenticados
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },

  // RUTAS DEL CATÁLOGO - Visualización de productos
  {
    path: '/catalogo',
    name: 'catalog',
    component: Catalog,
<<<<<<< HEAD
    meta: {
      title: 'Catálogo',
      requiresAuth: false, // Accesible para todos los usuarios
    },
=======
    meta: { 
      title: 'Catálogo',
      requiresAuth: false // Accesible para todos los usuarios
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },

  // RUTAS DE PEDIDOS - Gestión de pedidos del usuario
  {
    path: '/pedidos',
    name: 'orders',
    component: Orders,
<<<<<<< HEAD
    meta: {
      title: 'Mis Pedidos',
      requiresAuth: true, // Requiere autenticación
    },
  },
  {
    path: '/pedidos/:id',
    name: 'order-detail',
    component: OrderDetail,
    meta: {
      title: 'Detalle de Pedido',
      requiresAuth: true,
    },
=======
    meta: { 
      title: 'Mis Pedidos',
      requiresAuth: true // Requiere autenticación
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },

  // RUTAS DE RECOMENDACIONES - Sistema de IA para recomendaciones
  {
    path: '/recomendaciones',
    name: 'recommendations',
    component: Recommendations,
<<<<<<< HEAD
    meta: {
      title: 'Recomendaciones IA',
      requiresAuth: true, // Requiere autenticación
    },
  },

  {
    path: '/cotizacion',
    name: 'cotizacion',
    component: Cotizacion,
    meta: {
      title: 'Cotización',
      requiresAuth: true,
    },
=======
    meta: { 
      title: 'Recomendaciones IA',
      requiresAuth: true // Requiere autenticación
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },

  // RUTAS DE ANÁLISIS DE ESPACIO - Sistema de IA para análisis de espacios
  {
    path: '/analisis-espacio',
    name: 'analisis-espacio',
    component: AnalisisEspacio,
<<<<<<< HEAD
    meta: {
      title: 'Análisis de espacio con IA',
      requiresAuth: true, // Requiere autenticación
    },
=======
    meta: { 
      title: 'Análisis de espacio con IA',
      requiresAuth: true // Requiere autenticación
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },

  // RUTAS DE DIAGNÓSTICO DE IA - Herramientas de diagnóstico para IA
  {
    path: '/diagnostico-ia',
    name: 'diagnostico-ia',
    component: DiagnosticoIA,
<<<<<<< HEAD
    meta: {
      title: 'Diagnóstico de IA',
      requiresAuth: true, // Requiere autenticación
    },
=======
    meta: { 
      title: 'Diagnóstico de IA',
      requiresAuth: true // Requiere autenticación
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },

  // RUTAS DEL PERFIL - Gestión del perfil de usuario
  {
    path: '/perfil',
    name: 'profile',
    component: Profile,
<<<<<<< HEAD
    meta: {
      title: 'Mi Perfil',
      requiresAuth: true, // Requiere autenticación
    },
=======
    meta: { 
      title: 'Mi Perfil',
      requiresAuth: true // Requiere autenticación
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },

  // RUTAS DE DASHBOARD - Panel de usuario
  {
    path: '/dashboard',
    name: 'dashboard',
    component: AdminDashboard,
<<<<<<< HEAD
    meta: {
      title: 'Mi Área Personal',
      requiresAuth: true, // Requiere autenticación
    },
=======
    meta: { 
      title: 'Mi Área Personal',
      requiresAuth: true // Requiere autenticación
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  },

  // RUTAS DE ADMINISTRACIÓN - Panel administrativo
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
<<<<<<< HEAD
    meta: {
      title: 'Panel de Administración',
      requiresAuth: true,
      requiresAdmin: true, // Requiere permisos de administrador
    },
  },
  {
    path: '/admin/cotizaciones',
    name: 'admin-cotizaciones',
    component: AdminCotizaciones,
    meta: {
      title: 'Cotizaciones',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
=======
    meta: { 
      title: 'Panel de Administración',
      requiresAuth: true,
      requiresAdmin: true // Requiere permisos de administrador
    }
  }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
]

// CREACIÓN DEL ROUTER - Configuración del router con historial web
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Comportamiento de scroll al navegar entre rutas
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition // Restaurar posición guardada (botón atrás)
    } else {
      return { top: 0 } // Ir al inicio de la página
    }
<<<<<<< HEAD
  },
=======
  }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
})

// GUARDS DE NAVEGACIÓN - Middleware para controlar el acceso a rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
<<<<<<< HEAD

  // Actualizar el título de la página dinámicamente
  document.title = to.meta.title
    ? `${to.meta.title} - Sistema de Muebles`
    : 'Sistema de Muebles'

=======
  
  // Actualizar el título de la página dinámicamente
  document.title = to.meta.title ? `${to.meta.title} - Sistema de Muebles` : 'Sistema de Muebles'
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Verificar si hay un token pero no hay datos de usuario (página recargada)
  if (authStore.token && !authStore.user) {
    try {
      await authStore.verifyToken() // Verificar validez del token y obtener datos del usuario
    } catch (error) {
      console.warn('Token inválido al navegar:', error)
      // Solo hacer logout si estamos intentando acceder a una ruta protegida
      if (to.meta.requiresAuth) {
        authStore.logout()
<<<<<<< HEAD
        next({
          name: 'login',
          query: { redirect: to.fullPath },
=======
        next({ 
          name: 'login', 
          query: { redirect: to.fullPath }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
        })
        return
      }
    }
  }
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Redirigir usuarios autenticados lejos de páginas de auth (login/register)
  if (to.meta.hideForAuth && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }
<<<<<<< HEAD

  // Verificar autenticación requerida para rutas protegidas
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath }, // Guardar ruta de destino para redirección post-login
    })
    return
  }

=======
  
  // Verificar autenticación requerida para rutas protegidas
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ 
      name: 'login', 
      query: { redirect: to.fullPath } // Guardar ruta de destino para redirección post-login
    })
    return
  }
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Verificar permisos de administrador para rutas administrativas
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'unauthorized' })
    return
  }
<<<<<<< HEAD

  next() // Permitir navegación
})

export default router
=======
  
  next() // Permitir navegación
})

export default router
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
