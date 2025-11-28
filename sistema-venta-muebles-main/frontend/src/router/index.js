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
import OrderDetail from '@/views/PedidoDetalleView.vue'

// Vistas de recomendaciones
import Recommendations from '@/views/RecomendacionesView.vue'

// Vistas de análisis de espacio con IA
import AnalisisEspacio from '@/views/AnalisisEspacioView.vue'
import Cotizacion from '@/views/CotizacionView.vue'

// Vistas de diagnóstico de IA
import DiagnosticoIA from '@/views/DiagnosticoIAView.vue'

// Vistas del perfil
import Profile from '@/views/PerfilView.vue'

// Vistas de administración
import AdminDashboard from '@/views/DashboardView.vue'
import AdminCotizaciones from '@/views/AdminCotizacionesView.vue'

// CONFIGURACIÓN DE RUTAS - Definición de todas las rutas de la aplicación
const routes = [
  // RUTAS PÚBLICAS - Accesibles sin autenticación
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Inicio',
      requiresAuth: false, // No requiere autenticación
    },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'Iniciar Sesión',
      requiresAuth: false,
      hideForAuth: true, // Se oculta para usuarios ya autenticados
    },
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      title: 'Registrarse',
      requiresAuth: false,
      hideForAuth: true, // Se oculta para usuarios ya autenticados
    },
  },
  {
    path: '/auth/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: {
      title: 'Recuperar Contraseña',
      requiresAuth: false,
      hideForAuth: true, // Se oculta para usuarios ya autenticados
    },
  },
  {
    path: '/auth/reset-password/:token',
    name: 'reset-password',
    component: ResetPassword,
    meta: {
      title: 'Restablecer Contraseña',
      requiresAuth: false,
      hideForAuth: true, // Se oculta para usuarios ya autenticados
    },
  },

  // RUTAS DEL CATÁLOGO - Visualización de productos
  {
    path: '/catalogo',
    name: 'catalog',
    component: Catalog,
    meta: {
      title: 'Catálogo',
      requiresAuth: false, // Accesible para todos los usuarios
    },
  },

  // RUTAS DE PEDIDOS - Gestión de pedidos del usuario
  {
    path: '/pedidos',
    name: 'orders',
    component: Orders,
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
  },

  // RUTAS DE RECOMENDACIONES - Sistema de IA para recomendaciones
  {
    path: '/recomendaciones',
    name: 'recommendations',
    component: Recommendations,
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
  },

  // RUTAS DE ANÁLISIS DE ESPACIO - Sistema de IA para análisis de espacios
  {
    path: '/analisis-espacio',
    name: 'analisis-espacio',
    component: AnalisisEspacio,
    meta: {
      title: 'Análisis de espacio con IA',
      requiresAuth: true, // Requiere autenticación
    },
  },

  // RUTAS DE DIAGNÓSTICO DE IA - Herramientas de diagnóstico para IA
  {
    path: '/diagnostico-ia',
    name: 'diagnostico-ia',
    component: DiagnosticoIA,
    meta: {
      title: 'Diagnóstico de IA',
      requiresAuth: true, // Requiere autenticación
    },
  },

  // RUTAS DEL PERFIL - Gestión del perfil de usuario
  {
    path: '/perfil',
    name: 'profile',
    component: Profile,
    meta: {
      title: 'Mi Perfil',
      requiresAuth: true, // Requiere autenticación
    },
  },

  // RUTAS DE DASHBOARD - Panel de usuario
  {
    path: '/dashboard',
    name: 'dashboard',
    component: AdminDashboard,
    meta: {
      title: 'Mi Área Personal',
      requiresAuth: true, // Requiere autenticación
    },
  },

  // RUTAS DE ADMINISTRACIÓN - Panel administrativo
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
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
  },
})

// GUARDS DE NAVEGACIÓN - Middleware para controlar el acceso a rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Actualizar el título de la página dinámicamente
  document.title = to.meta.title
    ? `${to.meta.title} - Sistema de Muebles`
    : 'Sistema de Muebles'

  // Verificar si hay un token pero no hay datos de usuario (página recargada)
  if (authStore.token && !authStore.user) {
    try {
      await authStore.verifyToken() // Verificar validez del token y obtener datos del usuario
    } catch (error) {
      console.warn('Token inválido al navegar:', error)
      // Solo hacer logout si estamos intentando acceder a una ruta protegida
      if (to.meta.requiresAuth) {
        authStore.logout()
        next({
          name: 'login',
          query: { redirect: to.fullPath },
        })
        return
      }
    }
  }

  // Redirigir usuarios autenticados lejos de páginas de auth (login/register)
  if (to.meta.hideForAuth && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // Verificar autenticación requerida para rutas protegidas
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath }, // Guardar ruta de destino para redirección post-login
    })
    return
  }

  // Verificar permisos de administrador para rutas administrativas
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'unauthorized' })
    return
  }

  next() // Permitir navegación
})

export default router
