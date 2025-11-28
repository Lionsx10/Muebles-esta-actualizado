<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const pedido = ref(null)

const total = computed(() => {
  if (!pedido.value) return 0
  if (typeof pedido.value.total === 'number') return pedido.value.total
  const detalles = pedido.value.detalles || []
  return detalles.reduce(
    (acc, d) => acc + (d.precio_unitario || 0) * (d.cantidad || 1),
    0,
  )
})

const canRequestQuote = computed(() => {
  return (
    ['nuevo', 'borrador'].includes(pedido.value?.estado) &&
    (pedido.value?.detalles?.length || 0) > 0
  )
})

const requestQuote = async () => {
  const id = route.params.id
  const mensaje = prompt('Mensaje para el administrador (opcional):') || ''
  try {
    await api.post(`/pedidos/${id}/solicitar-cotizacion`, { mensaje })
    toast.success('Solicitud de cotización enviada')
    router.push('/pedidos')
  } catch (error) {
    const msg =
      error.response?.data?.message || 'No se pudo solicitar la cotización'
    toast.error(msg)
  }
}

const getEstadoLabel = estado => {
  const labels = {
    nuevo: 'Nuevo',
    en_cotizacion: 'En Cotización',
    aprobado: 'Aprobado',
    en_produccion: 'En Producción',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    listo: 'Listo',
  }
  return labels[estado] || estado
}

const getEstadoBadgeClass = estado => {
  const classes = {
    nuevo: 'badge-secondary',
    en_cotizacion: 'badge-warning',
    aprobado: 'badge-info',
    en_produccion: 'badge-primary',
    entregado: 'badge-success',
    cancelado: 'badge-error',
    pendiente: 'badge-warning',
    confirmado: 'badge-info',
    listo: 'badge-success',
  }
  return classes[estado] || 'badge-secondary'
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

onMounted(async () => {
  const id = route.params.id
  try {
    loading.value = true
    const response = await api.get(`/pedidos/${id}`)
    pedido.value = response.data.pedido
  } catch (error) {
    console.error('Error cargando pedido:', error)
    const msg = error.response?.data?.message || 'No se pudo cargar el pedido'
    toast.error(msg)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container-custom section-padding">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
Detalle del Pedido
</h1>
        <p class="text-gray-600">
          Pedido #{{ pedido?.numero_pedido || pedido?.id }}
        </p>
      </div>
      <div class="flex gap-2">
        <span
          v-if="pedido"
          class="badge"
          :class="getEstadoBadgeClass(pedido.estado)"
        >
          {{ getEstadoLabel(pedido.estado) }}
        </span>
        <button
          v-if="canRequestQuote"
          class="btn-primary"
          @click="requestQuote"
        >
          Solicitar Cotización
        </button>
      </div>
    </div>

    <div v-if="loading" class="card">
      <div class="card-body">
Cargando...
</div>
    </div>

    <div v-else-if="pedido" class="space-y-6">
      <div class="card">
        <div class="card-body">
          <div
            class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700"
          >
            <div>
              <div class="font-medium">
Fecha
</div>
              <div>{{ formatDate(pedido.created_at) }}</div>
            </div>
            <div>
              <div class="font-medium">
Estado
</div>
              <div>{{ getEstadoLabel(pedido.estado) }}</div>
            </div>
            <div>
              <div class="font-medium">
Total
</div>
              <div>${{ formatPrice(total) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h2 class="text-lg font-semibold mb-4">
Productos
</h2>
          <div v-if="pedido.detalles?.length" class="space-y-4">
            <div
              v-for="item in pedido.detalles"
              :key="item.id"
              class="border rounded-lg p-4"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-4 flex-1">
                  <img
                    :src="item.imagen_url || '/placeholder-furniture.jpg'"
                    :alt="item.descripcion"
                    class="w-16 h-16 object-cover rounded"
                  >
                  <div class="font-medium text-gray-900">
                    {{ item.descripcion }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-500">
Precio unitario
</div>
                  <div class="text-base font-semibold">
                    ${{ formatPrice(item.precio_unitario || 0) }}
                  </div>
                </div>
              </div>
              <div class="mt-2 text-sm text-gray-600">
                <div>
                  <span class="font-medium">Cantidad:</span>
                  {{ item.cantidad || 1 }}
                </div>
                <div v-if="item.medidas">
                  <span class="font-medium">Medidas:</span> {{ item.medidas }}
                </div>
                <div v-if="item.material">
                  <span class="font-medium">Material:</span> {{ item.material }}
                </div>
                <div v-if="item.color">
                  <span class="font-medium">Color:</span> {{ item.color }}
                </div>
                <div v-if="item.estilo">
                  <span class="font-medium">Estilo:</span> {{ item.estilo }}
                </div>
              </div>
            </div>
          </div>
          <div v-else
class="text-sm text-gray-600"
>
Sin productos aún.
</div>
        </div>
      </div>

      <!-- Etapas del proceso -->
      <div v-if="pedido.estado !== 'cancelado'" class="card">
        <div class="card-body">
          <div class="text-sm text-gray-600 mb-2">
Proceso del pedido
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
</template>

<style scoped></style>
