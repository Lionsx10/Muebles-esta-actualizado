<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const toast = useToast()

// Estado
const isLoading = ref(true)
const pedidos = ref([])
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

// Filtros
const filters = reactive({
  search: '',
  estado: '',
  fecha: '',
})

// Computed
const hasActiveFilters = computed(() => {
  return filters.search || filters.estado || filters.fecha
})

// Debounce para búsqueda
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

// Cargar pedidos
const authStore = useAuthStore()
const loadPedidos = async (page = 1) => {
  try {
    isLoading.value = true

    const params = {
      page,
      limit: pagination.per_page,
      estado: filters.estado || '',
    }

    // Limpiar parámetros vacíos
    Object.keys(params).forEach(key => {
      if (
        params[key] === '' ||
        params[key] === null ||
        params[key] === undefined
      ) {
        delete params[key]
      }
    })

    const userId = authStore.user?.id
    const response = await api.get(`/pedidos/usuario/${userId}`, { params })

    pedidos.value = response.data.pedidos || []

    // Actualizar paginación
    if (response.data.pagination) {
      Object.assign(pagination, {
        current_page: response.data.pagination.page,
        last_page: response.data.pagination.pages,
        per_page: response.data.pagination.limit,
        total: response.data.pagination.total,
      })
    }
  } catch (error) {
    console.error('Error cargando pedidos:', error)
    toast.error('Error al cargar los pedidos')
  } finally {
    isLoading.value = false
  }
}

// Aplicar filtros
const applyFilters = () => {
  pagination.current_page = 1
  loadPedidos(1)
}

// Limpiar filtro específico
const clearFilter = filterName => {
  filters[filterName] = ''
  applyFilters()
}

// Limpiar todos los filtros
const clearAllFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  applyFilters()
}

// Cambiar página
const changePage = page => {
  if (page >= 1 && page <= pagination.last_page) {
    pagination.current_page = page
    loadPedidos(page)
  }
}

// Obtener páginas visibles para paginación
const getVisiblePages = () => {
  const current = pagination.current_page
  const last = pagination.last_page
  const pages = []

  if (last <= 7) {
    for (let i = 1; i <= last; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(last)
    } else if (current >= last - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = last - 4; i <= last; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(last)
    }
  }

  return pages
}

// Navegación
const goToPedido = id => {
  router.push(`/pedidos/${id}`)
}

const viewPedido = id => {
  router.push(`/pedidos/${id}`)
}

// Acciones de pedido
const cancelPedido = async id => {
  if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
    return
  }

  try {
    await api.patch(`/pedidos/${id}/cancelar`)
    toast.success('Pedido cancelado exitosamente')
    loadPedidos(pagination.current_page)
  } catch (error) {
    console.error('Error cancelando pedido:', error)
    toast.error('Error al cancelar el pedido')
  }
}

const reorderPedido = async id => {
  try {
    const response = await api.post(`/pedidos/${id}/reordenar`)
    toast.success('Productos agregados al carrito')
    router.push('/carrito')
  } catch (error) {
    console.error('Error reordenando pedido:', error)
    toast.error('Error al reordenar el pedido')
  }
}

// Solicitar cotización del pedido (cambia a estado en_cotizacion)
const canRequestQuote = (estado, productosCount) => {
  const hasItems = (productosCount || 0) > 0
  return hasItems && (estado === 'borrador' || estado === 'nuevo')
}

const requestQuote = async id => {
  const mensaje = prompt('Mensaje para el administrador (opcional):') || ''
  try {
    await api.post(`/pedidos/${id}/solicitar-cotizacion`, { mensaje })
    toast.success('Solicitud de cotización enviada')
    loadPedidos(pagination.current_page)
  } catch (error) {
    console.error('Error solicitando cotización:', error)
    const msg =
      error.response?.data?.message || 'No se pudo solicitar la cotización'
    toast.error(msg)
  }
}

// Utilidades
const canCancelPedido = estado => {
  return ['pendiente', 'confirmado'].includes(estado)
}

const canReorderPedido = estado => {
  return ['entregado', 'cancelado'].includes(estado)
}

const getEstadoLabel = estado => {
  const labels = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    en_produccion: 'En Producción',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    nuevo: 'Nuevo',
    en_cotizacion: 'En Cotización',
    aprobado: 'Aprobado',
    borrador: 'Borrador',
  }
  return labels[estado] || estado
}

const getEstadoBadgeClass = estado => {
  const classes = {
    pendiente: 'badge-warning',
    confirmado: 'badge-info',
    en_produccion: 'badge-primary',
    listo: 'badge-success',
    entregado: 'badge-success',
    cancelado: 'badge-error',
    nuevo: 'badge-secondary',
    en_cotizacion: 'badge-warning',
    aprobado: 'badge-info',
    borrador: 'badge-secondary',
  }
  return classes[estado] || 'badge-secondary'
}

const getFechaLabel = fecha => {
  const labels = {
    ultima_semana: 'Última semana',
    ultimo_mes: 'Último mes',
    ultimos_3_meses: 'Últimos 3 meses',
    ultimo_ano: 'Último año',
  }
  return labels[fecha] || fecha
}

// Etapas del proceso: enviada -> en proceso -> finalizada
const getProcesoSteps = estado => {
  const etapaIndex = (() => {
    if (['borrador', 'nuevo', 'pendiente'].includes(estado)) return 0
    if (
      [
        'en_cotizacion',
        'confirmado',
        'aprobado',
        'en_produccion',
        'listo',
      ].includes(estado)
    )
      return 1
    if (['entregado'].includes(estado)) return 2
    return -1
  })()

  return [
    { key: 'enviada', active: etapaIndex >= 0 },
    { key: 'en_proceso', active: etapaIndex >= 1 },
    { key: 'finalizada', active: etapaIndex >= 2 },
  ]
}

const formatPrice = price => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = dateString => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Cargar datos al montar
onMounted(() => {
  loadPedidos()
})

// Watchers para filtros
watch(() => filters.estado, applyFilters)
watch(() => filters.fecha, applyFilters)
</script>

<template>
  <div class="container-custom section-padding">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
Mis Pedidos
</h1>
        <p class="mt-2 text-gray-600">
          Gestiona y da seguimiento a todos tus pedidos
        </p>
      </div>

      <div class="mt-4 sm:mt-0">
        <RouterLink to="/pedidos/nuevo" class="btn-primary">
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Nuevo Pedido
        </RouterLink>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="card mb-8">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Búsqueda -->
          <div class="md:col-span-2">
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Buscar por número de pedido, producto..."
                class="input-field pl-10"
                @input="debouncedSearch"
              >
            </div>
          </div>

          <!-- Estado -->
          <div>
            <select
              v-model="filters.estado"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">
Todos los estados
</option>
              <option value="pendiente">
Pendiente
</option>
              <option value="confirmado">
Confirmado
</option>
              <option value="en_produccion">
En Producción
</option>
              <option value="listo">
Listo
</option>
              <option value="entregado">
Entregado
</option>
              <option value="cancelado">
Cancelado
</option>
            </select>
          </div>

          <!-- Fecha -->
          <div>
            <select
              v-model="filters.fecha"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">
Todas las fechas
</option>
              <option value="ultima_semana">
Última semana
</option>
              <option value="ultimo_mes">
Último mes
</option>
              <option value="ultimos_3_meses">
Últimos 3 meses
</option>
              <option value="ultimo_ano">
Último año
</option>
            </select>
          </div>
        </div>

        <!-- Filtros activos -->
        <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
          <span class="text-sm text-gray-600">Filtros activos:</span>

          <span v-if="filters.search" class="badge-secondary">
            Búsqueda: "{{ filters.search }}"
            <button
              class="ml-1 text-gray-500 hover:text-gray-700"
              @click="clearFilter('search')"
            >
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>

          <span v-if="filters.estado" class="badge-secondary">
            Estado: {{ getEstadoLabel(filters.estado) }}
            <button
              class="ml-1 text-gray-500 hover:text-gray-700"
              @click="clearFilter('estado')"
            >
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>

          <span v-if="filters.fecha" class="badge-secondary">
            Fecha: {{ getFechaLabel(filters.fecha) }}
            <button
              class="ml-1 text-gray-500 hover:text-gray-700"
              @click="clearFilter('fecha')"
            >
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>

          <button
            class="text-sm text-primary-600 hover:text-primary-800"
            @click="clearAllFilters"
          >
            Limpiar todos
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de pedidos -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="card animate-pulse">
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="space-y-2 flex-1">
              <div class="h-4 bg-gray-200 rounded w-1/4" />
              <div class="h-4 bg-gray-200 rounded w-1/2" />
              <div class="h-4 bg-gray-200 rounded w-1/3" />
            </div>
            <div class="h-6 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="pedidos.length === 0" class="card">
      <div class="card-body text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">
No hay pedidos
</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{
            hasActiveFilters
              ? 'No se encontraron pedidos con los filtros aplicados.'
              : 'Aún no has realizado ningún pedido.'
          }}
        </p>
        <div class="mt-6">
          <RouterLink to="/pedidos/nuevo" class="btn-primary">
            Crear tu primer pedido
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="pedido in pedidos"
        :key="pedido.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="goToPedido(pedido.id)"
      >
        <div class="card-body">
          <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <!-- Información principal -->
            <div class="flex-1">
              <div class="flex items-center space-x-4 mb-2">
                <h3 class="text-lg font-semibold text-gray-900">
                  Pedido #{{ pedido.numero_pedido }}
                </h3>
                <span class="badge" :class="getEstadoBadgeClass(pedido.estado)">
                  {{ getEstadoLabel(pedido.estado) }}
                </span>
              </div>

              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600"
              >
                <div>
                  <span class="font-medium">Fecha:</span>
                  {{ formatDate(pedido.created_at) }}
                </div>

                <div v-if="pedido.fecha_entrega_estimada">
                  <span class="font-medium">Entrega estimada:</span>
                  {{ formatDate(pedido.fecha_entrega_estimada) }}
                </div>

                <div>
                  <span class="font-medium">Total:</span>
                  ${{ formatPrice(pedido.total) }}
                </div>

                <div v-if="pedido.productos_count">
                  <span class="font-medium">Productos:</span>
                  {{ pedido.productos_count }}
                  {{ pedido.productos_count === 1 ? 'producto' : 'productos' }}
                </div>
              </div>

              <!-- Productos (preview) -->
              <div
                v-if="pedido.productos && pedido.productos.length > 0"
                class="mt-4"
              >
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="producto in pedido.productos.slice(0, 3)"
                    :key="producto.id"
                    class="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1"
                  >
                    <img
                      :src="producto.imagen_url || '/placeholder-furniture.jpg'"
                      :alt="producto.nombre"
                      class="w-6 h-6 object-cover rounded"
                    >
                    <span class="text-sm text-gray-700">{{
                      producto.nombre
                    }}</span>
                    <span
                      v-if="producto.cantidad > 1"
                      class="text-xs text-gray-500"
                    >
                      x{{ producto.cantidad }}
                    </span>
                  </div>

                  <div
                    v-if="pedido.productos.length > 3"
                    class="flex items-center px-3 py-1 text-sm text-gray-500"
                  >
                    +{{ pedido.productos.length - 3 }} más
                  </div>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div
              class="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col gap-2"
            >
              <button
                class="btn-secondary text-sm"
                @click.stop="viewPedido(pedido.id)"
              >
                Ver Detalles
              </button>

              <button
                v-if="canRequestQuote(pedido.estado, pedido.productos_count)"
                class="btn-primary text-sm"
                @click.stop="requestQuote(pedido.id)"
              >
                Solicitar Cotización
              </button>

              <button
                v-if="canCancelPedido(pedido.estado)"
                class="btn-danger text-sm"
                @click.stop="cancelPedido(pedido.id)"
              >
                Cancelar
              </button>

              <button
                v-if="canReorderPedido(pedido.estado)"
                class="btn-success text-sm"
                @click.stop="reorderPedido(pedido.id)"
              >
                Reordenar
              </button>
            </div>
          </div>

          <!-- Proceso del pedido (etapas) -->
          <div v-if="pedido.estado !== 'cancelado'" class="mt-6">
            <div
              class="flex items-center justify-between text-sm text-gray-600 mb-2"
            >
              <span>Proceso del pedido</span>
            </div>
            <div class="flex items-center space-x-2">
              <div
                v-for="(step, idx) in getProcesoSteps(pedido.estado)"
                :key="step.key"
                class="flex-1 flex items-center"
              >
                <div
                  class="h-2 w-full rounded-full"
                  :class="[step.active ? 'bg-primary-600' : 'bg-gray-200']"
                />
              </div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-gray-600">
              <span>Borrador</span>
              <span>En proceso</span>
              <span>Finalizada</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div
      v-if="pagination.total > pagination.per_page"
      class="mt-8 flex justify-center"
    >
      <nav class="flex items-center space-x-2">
        <button
          :disabled="pagination.current_page <= 1"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="changePage(pagination.current_page - 1)"
        >
          Anterior
        </button>

        <template v-for="page in getVisiblePages()" :key="page">
          <button
            v-if="page !== '...'"
            class="px-3 py-2 text-sm font-medium rounded-md"
            :class="[
              page === pagination.current_page
                ? 'text-white bg-primary-600 border border-primary-600'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50',
            ]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <span v-else
class="px-3 py-2 text-sm font-medium text-gray-500"
          >...</span>
        </template>

        <button
          :disabled="pagination.current_page >= pagination.last_page"
          class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="changePage(pagination.current_page + 1)"
        >
          Siguiente
        </button>
      </nav>
    </div>
  </div>
</template>
