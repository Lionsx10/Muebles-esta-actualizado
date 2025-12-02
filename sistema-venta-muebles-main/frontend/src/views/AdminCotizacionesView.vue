<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api, { ordersAPI } from '@/services/api'

const toast = useToast()

const isLoading = ref(false)
const pedidos = ref([])
const pagination = reactive({ page: 1, limit: 10, total: 0, pages: 0 })
const filters = reactive({ estado: 'en_cotizacion' })

const showQuoteModal = ref(false)
const loadingDetalles = ref(false)
const savingQuote = ref(false)
const pedidoSeleccionado = ref(null)
const detallesEdit = ref([])

const totalEstimado = computed(() => {
  return (detallesEdit.value || []).reduce(
    (acc, d) => acc + (Number(d.cotizacion) || 0),
    0
  )
})

const formatPrice = price =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(price || 0)
const formatDate = iso => new Date(iso).toLocaleString('es-CL')
const estadoLabel = e =>
  ({
    nuevo: 'Nuevo',
    en_cotizacion: 'En cotización',
    aprobado: 'Aprobado',
    en_produccion: 'En producción',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  })[e] || e
const estadoClass = e =>
  ({
    nuevo: 'bg-gray-100 text-gray-800',
    en_cotizacion: 'bg-yellow-100 text-yellow-800',
    aprobado: 'bg-green-100 text-green-800',
    en_produccion: 'bg-blue-100 text-blue-800',
    entregado: 'bg-indigo-100 text-indigo-800',
    cancelado: 'bg-red-100 text-red-800',
  })[e] || 'bg-gray-100 text-gray-800'

const loadOrders = async () => {
  try {
    isLoading.value = true
    const { data } = await ordersAPI.getOrders({
      page: pagination.page,
      limit: pagination.limit,
      estado: filters.estado,
    })
    pedidos.value = data.pedidos || []
    const pg = data.pagination || {}
    pagination.page = pg.page || 1
    pagination.limit = pg.limit || 10
    pagination.total = pg.total || pedidos.value.length
    pagination.pages = pg.pages || 1
  } catch (err) {
    console.error('Error cargando pedidos:', err)
    toast.error('No se pudieron cargar los pedidos')
  } finally {
    isLoading.value = false
  }
}

const changePage = p => {
  pagination.page = p
  loadOrders()
}

const verDetalles = async id => {
  try {
    loadingDetalles.value = true
    const { data } = await ordersAPI.getOrderById(id)
    pedidoSeleccionado.value = data.pedido
    detallesEdit.value = (data.pedido?.detalles || []).map(d => ({
      id: d.id,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      material: d.material,
      color: d.color,
      cotizacion: d.cotizacion || 0,
    }))
    showQuoteModal.value = true
  } catch (err) {
    console.error('Error obteniendo detalles:', err)
    toast.error('No se pudieron cargar los detalles del pedido')
  } finally {
    loadingDetalles.value = false
  }
}

const abrirCotizacion = id => {
  verDetalles(id)
}

const guardarCotizacion = async () => {
  try {
    savingQuote.value = true
    const payload = {
      detalles: detallesEdit.value.map(d => ({
        id: d.id,
        cotizacion: Number(d.cotizacion) || 0,
      })),
      total_estimado: Number(totalEstimado.value) || 0,
    }
    await api.put(`/pedidos/${pedidoSeleccionado.value.id}/cotizacion`, payload)
    toast.success('Cotización guardada correctamente')
    showQuoteModal.value = false
    loadOrders()
  } catch (err) {
    console.error('Error guardando cotización:', err)
    const msg =
      err.response?.data?.message || 'No se pudo guardar la cotización'
    toast.error(msg)
  } finally {
    savingQuote.value = false
  }
}

const closeQuoteModal = () => {
  showQuoteModal.value = false
}

onMounted(() => {
  loadOrders()
})
</script>

<template>
  <div class="container-custom section-padding">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
Panel de Cotizaciones
</h1>
        <p class="mt-2 text-gray-600">
          Gestiona las cotizaciones de pedidos de clientes
        </p>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="filters.estado"
class="input-field w-52">
          <option value="">
Todos los estados
</option>
          <option value="nuevo">
Nuevo
</option>
          <option value="en_cotizacion">
En cotización
</option>
          <option value="aprobado">
Aprobado
</option>
          <option value="en_produccion">
En producción
</option>
          <option value="entregado">
Entregado
</option>
          <option value="cancelado">
Cancelado
</option>
        </select>
        <button
          class="btn btn-primary"
          :disabled="isLoading"
          @click="loadOrders"
        >
          <span v-if="!isLoading">Actualizar</span>
          <span v-else
class="animate-pulse">Cargando...</span>
        </button>
      </div>
    </div>

    <div class="card">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">
                ID
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Cliente
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Correo
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Estado
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Fecha
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Items
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Total estimado
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="p in pedidos"
:key="p.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm text-gray-900">
                {{ p.id }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">
                {{ p.nombre_usuario }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ p.correo_usuario }}
              </td>
              <td class="px-4 py-3">
                <span
                  :class="estadoClass(p.estado)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ estadoLabel(p.estado) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ formatDate(p.fecha_creacion) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">
                {{ p.cantidad_items }}
              </td>
              <td class="px-4 py-3 text-sm font-semibold">
                {{ formatPrice(p.total_estimado || 0) }}
              </td>
              <td class="px-4 py-3 text-sm">
                <div class="flex gap-2">
                  <button class="btn btn-secondary"
@click="verDetalles(p.id)">
                    Ver
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="abrirCotizacion(p.id)"
                  >
                    Cotizar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="pagination.pages > 1"
        class="mt-4 flex items-center justify-between"
      >
        <p class="text-sm text-gray-600">
          Página {{ pagination.page }} de {{ pagination.pages }}
        </p>
        <div class="flex gap-2">
          <button
            class="btn"
            :disabled="pagination.page <= 1 || isLoading"
            @click="changePage(pagination.page - 1)"
          >
            Anterior
          </button>
          <button
            class="btn"
            :disabled="pagination.page >= pagination.pages || isLoading"
            @click="changePage(pagination.page + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de cotización -->
    <div
      v-if="showQuoteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeQuoteModal"
    >
      <div
        class="relative top-10 mx-auto w-full max-w-2xl p-6 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <h3 class="text-xl font-semibold text-gray-900 mb-4">
          Cotizar Pedido #{{ pedidoSeleccionado?.id }}
        </h3>
        <div v-if="loadingDetalles"
class="py-8 text-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
          />
          <p class="mt-2 text-gray-600">
Cargando detalles...
</p>
        </div>
        <div v-else>
          <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
            <div
              v-for="d in detallesEdit"
              :key="d.id"
              class="border rounded-md p-3"
            >
              <p class="text-sm text-gray-700">
                <span class="font-medium">Descripción:</span>
                {{ d.descripcion }}
              </p>
              <p class="text-xs text-gray-500">
                Cant: {{ d.cantidad }} | Material: {{ d.material || '-' }} |
                Color: {{ d.color || '-' }}
              </p>
              <div class="mt-2 flex items-center gap-3">
                <label class="text-sm text-gray-600">Cotización</label>
                <input
                  v-model.number="d.cotizacion"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-field w-40"
                />
              </div>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">
Total estimado
</p>
              <p class="text-2xl font-bold">
                {{ formatPrice(totalEstimado) }}
              </p>
            </div>
            <div class="flex gap-2">
              <button class="btn"
@click="closeQuoteModal"
>
Cancelar
</button>
              <button
                class="btn btn-primary"
                :disabled="savingQuote"
                @click="guardarCotizacion"
              >
                Guardar Cotización
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  @apply px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50;
}
.btn-primary {
  @apply bg-primary-600 text-white border-primary-600 hover:bg-primary-700;
}
.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}
.input-field {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500;
}
.card {
  @apply bg-white shadow-sm rounded-lg p-4;
}
.container-custom {
  @apply max-w-7xl mx-auto px-4;
}
.section-padding {
  @apply py-6;
}
</style>
