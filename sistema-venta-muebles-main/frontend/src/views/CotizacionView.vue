<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { cubiertas, mueblesMateriales, mueblesColores, postformadoColores, formatCurrency } from '@/data/cotizacion'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/Modal.vue'

const categoria = ref('cuarzo')
const mostrarCubiertas = ref(true)
const mostrarMuebles = ref(true)
const seleccionCubierta = ref(null)
const largoCubiertaCm = ref(0)
const materialMuebleId = ref(mueblesMateriales[0]?.id)
const frenteMueblesCm = ref(0)
const colorMuebleId = ref(mueblesColores[0]?.id)

const listaCubiertas = computed(() => cubiertas[categoria.value] || [])
const categoriaSeleccionadaLabel = computed(() =>
  categoria.value === 'granito' ? 'Granitos' : 'Cuarzos'
)
const materialMueble = computed(() =>
  mueblesMateriales.find(m => m.id === materialMuebleId.value)
)
const colorMueble = computed(() =>
  mueblesColores.find(c => c.id === colorMuebleId.value)
)

const subtotalCubierta = computed(() => {
  const p = seleccionCubierta.value?.precioPor100 || 0
  const l = Number(largoCubiertaCm.value) || 0
  return (l / 100) * p
})

const subtotalMuebles = computed(() => {
  const p = materialMueble.value?.precioPor100 || 0
  const f = Number(frenteMueblesCm.value) || 0
  return (f / 100) * p
})

const totalEstimado = computed(
  () => subtotalCubierta.value + subtotalMuebles.value
)

const seleccionarCategoria = cat => {
  categoria.value = cat
}
const seleccionarCubierta = m => {
  seleccionCubierta.value = m
}

const showPreview = ref(false)
const previewIndex = ref(0)
const previewItem = computed(() => listaCubiertas.value[previewIndex.value])
const openPreview = idx => {
  previewIndex.value = idx
  showPreview.value = true
}
const closePreview = () => {
  showPreview.value = false
}
const prevItem = () => {
  if (previewIndex.value > 0) previewIndex.value--
}
const nextItem = () => {
  if (previewIndex.value < listaCubiertas.value.length - 1) previewIndex.value++
}

const showColorPreview = ref(false)
const colorPreviewIndex = ref(0)
const coloresMaterial = computed(() => {
  const mapa = {
    postformado: postformadoColores,
    melamina: [],
    termolaminado: mueblesColores,
  }
  return mapa[materialMuebleId.value] || []
})
const colorPreviewItem = computed(() => coloresMaterial.value[colorPreviewIndex.value])
const openColorPreview = idx => {
  colorPreviewIndex.value = idx
  showColorPreview.value = true
}
const closeColorPreview = () => {
  showColorPreview.value = false
}
const prevColor = () => {
  if (colorPreviewIndex.value > 0) colorPreviewIndex.value--
}
const nextColor = () => {
  if (colorPreviewIndex.value < coloresMaterial.value.length - 1)
    colorPreviewIndex.value++
}

// Autenticación y router
const authStore = useAuthStore()
const router = useRouter()

// Guardar pedido
const isSaving = ref(false)
const guardarPedido = async (cot) => {
  try {
    if (!authStore.isAuthenticated) {
      alert('Primero inicia sesión para guardar tu cotización')
      return
    }
    isSaving.value = true
    const detalles = []
    if (cot.cubierta) {
      detalles.push({
        descripcion: `Cubierta ${categoriaSeleccionadaLabel.value} - ${cot.cubierta.nombre}`,
        medidas: `${cot.largoCubiertaCm} cm`,
        material: categoriaSeleccionadaLabel.value,
        color: cot.cubierta.nombre,
        cantidad: 1,
        imagen_url: cot.cubierta.imagen,
        precio_unitario: cot.subtotalCubierta,
      })
    }
    if (cot.materialMueble) {
      const detalleMueble = {
        descripcion: `Muebles ${cot.materialMueble.nombre}`,
        medidas: `${cot.frenteMueblesCm} cm frente`,
        material: cot.materialMueble.nombre,
        cantidad: 1,
        precio_unitario: cot.subtotalMuebles,
      }
      if (cot.colorMueble?.nombre) {
        detalleMueble.color = cot.colorMueble.nombre
      }
      if (cot.colorMueble?.imagen) {
        detalleMueble.imagen_url = cot.colorMueble.imagen
      }
      detalles.push(detalleMueble)
    }

    const payload = {
      detalles,
      notas_cliente: 'Cotización creada desde CotizacionView',
      total_estimado: cot.total,
    }
    const resp = await api.post('/pedidos', payload)
    alert(`Cotización guardada. ID: ${resp.data?.pedido?.id} Total: ${formatCurrency(cot.total)}`)
    await cargarMisCotizaciones()
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al guardar la cotización'
    alert(msg)
  } finally {
    isSaving.value = false
  }
}

// Sección Mis Cotizaciones
const misCotizaciones = ref([])
const isLoadingQuotes = ref(false)
const pedidoDetalles = ref({})
const cargarMisCotizaciones = async () => {
  try {
    if (!authStore.isAuthenticated) return
    isLoadingQuotes.value = true
    const userId = authStore.user?.id
    const resp = await api.get(`/pedidos/usuario/${userId}`, { params: { limit: 5 } })
    misCotizaciones.value = resp.data?.pedidos || []
  } catch (e) {
    console.error('Error cargando cotizaciones', e)
  } finally {
    isLoadingQuotes.value = false
  }
}

const loadPedidoDetalles = async (id) => {
  if (pedidoDetalles.value[id]) return
  try {
    const resp = await api.get(`/pedidos/${id}`)
    pedidoDetalles.value[id] = resp.data?.pedido?.detalles || []
  } catch (e) {
    pedidoDetalles.value[id] = []
  }
}

const toggleDetalles = async (c) => {
  await loadPedidoDetalles(c.id)
  c._expanded = !c._expanded
}

const viewPedido = id => router.push(`/pedidos/${id}`)
const verTodasCotizaciones = () => router.push('/pedidos')

// Cargar al montar
;(() => cargarMisCotizaciones())()
watch(materialMuebleId, () => {
  colorPreviewIndex.value = 0
  const first = coloresMaterial.value[0]
  colorMuebleId.value = first ? first.id : null
})

const generarCotizacion = () => {
  const data = {
    categoria: categoria.value,
    cubierta: seleccionCubierta.value,
    largoCubiertaCm: Number(largoCubiertaCm.value) || 0,
    materialMueble: materialMueble.value,
    colorMueble: colorMueble.value,
    frenteMueblesCm: Number(frenteMueblesCm.value) || 0,
    subtotalCubierta: subtotalCubierta.value,
    subtotalMuebles: subtotalMuebles.value,
    total: totalEstimado.value,
  }
  console.log('Cotización generada', data)
  guardarPedido(data)
}

const limpiar = () => {
  seleccionCubierta.value = null
  largoCubiertaCm.value = 0
  materialMuebleId.value = mueblesMateriales[0]?.id
  frenteMueblesCm.value = 0
  colorMuebleId.value = mueblesColores[0]?.id
}
</script>

<template>
  <div class="container-custom section-padding">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
Cotización
</h1>
      <p class="mt-2 text-gray-600">
        Selecciona materiales y calcula el precio por cm.
      </p>
    </div>

    <div class="card mb-8">
      <div class="card-header flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">
          Cubierta: {{ categoriaSeleccionadaLabel }}
        </h2>
        <button
          class="text-sm text-gray-600 hover:text-gray-800"
          @click="mostrarCubiertas = !mostrarCubiertas"
        >
          {{ mostrarCubiertas ? 'Ocultar' : 'Mostrar' }}
        </button>
      </div>
      <div
v-if="mostrarCubiertas" class="card-body"
>
        <div class="flex space-x-2 mb-4">
          <button
            class="px-3 py-2 rounded-lg text-sm"
            :class="[
              categoria === 'cuarzo'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700',
            ]"
            @click="seleccionarCategoria('cuarzo')"
          >
            Cuarzos
          </button>
          <button
            class="px-3 py-2 rounded-lg text-sm"
            :class="[
              categoria === 'granito'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700',
            ]"
            @click="seleccionarCategoria('granito')"
          >
            Granitos
          </button>
        </div>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          <button
            v-for="(m, idx) in listaCubiertas"
            :key="m.id"
            class="p-3 border rounded-lg text-left relative"
            :class="[
              seleccionCubierta?.id === m.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300',
            ]"
            @click="seleccionarCubierta(m)"
          >
            <div class="flex items-center space-x-3">
              <div class="relative">
                <img
                  :src="m.imagen"
                  :alt="m.nombre"
                  class="w-12 h-12 rounded object-cover"
                >
                <button
                  class="absolute -right-1 -bottom-1 bg-white/90 border border-gray-200 rounded-md p-1 shadow-sm hover:bg-white"
                  title="Ver imagen"
                  @click.stop="openPreview(idx)"
                >
                  <svg
                    class="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 10l4.553-4.553a2 2 0 10-2.828-2.828L12 7.172M7 7h.01M4 21h16a1 1 0 001-1v-6a1 1 0 00-1-1H4a1 1 0 00-1 1v6a1 1 0 001 1z"
                    />
                  </svg>
                </button>
              </div>
              <div>
                <div class="font-medium text-gray-900">
                  {{ m.nombre }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ formatCurrency(m.precioPor100) }}/100 cm
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="card mb-8">
      <div class="card-header">
        <h2 class="text-lg font-medium text-gray-900">
          Valor de la cubierta
          <span v-if="seleccionCubierta"
            >( {{ categoriaSeleccionadaLabel }} —
            {{ seleccionCubierta.nombre }} )</span
          >
        </h2>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="label">Largo de cubierta (cm)</label>
            <input
              v-model.number="largoCubiertaCm"
              type="number"
              min="0"
              class="input"
            >
          </div>
          <div>
            <label class="label">Precio por 100 cm (auto)</label>
            <input
              type="number"
              class="input bg-gray-50"
              :value="seleccionCubierta?.precioPor100 || 0"
              readonly
            >
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-600">
Subtotal cubierta:
</div>
            <div class="text-lg font-semibold">
              {{ formatCurrency(subtotalCubierta) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-8">
      <div class="card-header flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">
          Muebles: {{ materialMueble?.nombre || 'Selecciona material' }}
        </h2>
        <button
          class="text-sm text-gray-600 hover:text-gray-800"
          @click="mostrarMuebles = !mostrarMuebles"
        >
          {{ mostrarMuebles ? 'Ocultar' : 'Mostrar' }}
        </button>
      </div>
      <div v-if="mostrarMuebles" class="card-body">
        <div class="flex space-x-2 mb-4">
          <button
            class="px-3 py-2 rounded-lg text-sm"
            :class="[
              materialMuebleId === 'postformado'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700',
            ]"
            @click="materialMuebleId = 'postformado'"
          >
            Postformado
          </button>
          <button
            class="px-3 py-2 rounded-lg text-sm"
            :class="[
              materialMuebleId === 'melamina'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700',
            ]"
            @click="materialMuebleId = 'melamina'"
          >
            Melamina
          </button>
          <button
            class="px-3 py-2 rounded-lg text-sm"
            :class="[
              materialMuebleId === 'termolaminado'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700',
            ]"
            @click="materialMuebleId = 'termolaminado'"
          >
            Termolaminado
          </button>
        </div>
        <div class="mt-6">
          <label class="label">Color/terminación</label>
          <div class="text-sm text-gray-600 mb-2">
            Colores de {{ materialMueble?.nombre || 'Muebles' }}
          </div>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          >
            <div v-if="coloresMaterial.length === 0" class="col-span-full p-3 text-gray-500">
              Este material no tiene colores disponibles aún.
            </div>
            <button
              v-for="(c, idx) in coloresMaterial"
              :key="c.id"
              class="p-3 border rounded-lg text-left relative"
              :class="[
                colorMuebleId === c.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
              @click="colorMuebleId = c.id"
            >
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <img
                    :src="c.imagen"
                    :alt="c.nombre"
                    class="w-12 h-12 rounded object-cover"
                  >
                  <button
                    class="absolute -right-1 -bottom-1 bg-white/90 border border-gray-200 rounded-md p-1 shadow-sm hover:bg-white"
                    title="Ver imagen"
                    @click.stop="openColorPreview(idx)"
                  >
                    <svg
                      class="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 10l4.553-4.553a2 2 0 10-2.828-2.828L12 7.172M7 7h.01M4 21h16a1 1 0 001-1v-6a1 1 0 00-1-1H4a1 1 0 00-1 1v6a1 1 0 001 1z"
                      />
                    </svg>
                  </button>
                </div>
                <div>
                  <div class="font-medium text-gray-900 text-sm">
                    {{ c.nombre }}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card mb-8">
      <div class="card-header">
        <h2 class="text-lg font-medium text-gray-900">
          Valor de los muebles
          <span v-if="materialMueble">
            ( {{ materialMueble.nombre }} )
          </span>
        </h2>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="label">Frente de muebles (cm)</label>
            <input
              v-model.number="frenteMueblesCm"
              type="number"
              min="0"
              class="input"
            >
          </div>
          <div>
            <label class="label">Precio por 100 cm (auto)</label>
            <input
              type="number"
              class="input bg-gray-50"
              :value="materialMueble?.precioPor100 || 0"
              readonly
            >
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-600">Subtotal muebles:</div>
            <div class="text-lg font-semibold">
              {{ formatCurrency(subtotalMuebles) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="text-lg font-medium text-gray-900">
Resumen
</h2>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div class="p-4 border border-gray-200 rounded-lg">
            <div class="text-sm text-gray-600">
              Cubierta
              <span v-if="seleccionCubierta"
                >( {{ seleccionCubierta.nombre }} )</span
              >
            </div>
            <div class="text-xl font-semibold">
              {{ formatCurrency(subtotalCubierta) }}
            </div>
          </div>
          <div class="p-4 border border-gray-200 rounded-lg">
            <div class="text-sm text-gray-600">
              Muebles <span>( {{ materialMueble?.nombre }} )</span>
            </div>
            <div class="text-xl font-semibold">
              {{ formatCurrency(subtotalMuebles) }}
            </div>
            <div
v-if="colorMueble" class="mt-1 text-xs text-gray-500"
>
              Color: {{ colorMueble.nombre }}
            </div>
          </div>
          <div class="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div class="text-sm text-gray-600">
Total estimado
</div>
            <div class="text-2xl font-bold text-primary-700">
              {{ formatCurrency(totalEstimado) }}
            </div>
          </div>
        </div>
        <div class="mt-6 flex space-x-3">
          <button
            class="btn-primary"
            :disabled="totalEstimado <= 0"
            @click="generarCotizacion"
          >
            Generar cotización
          </button>
          <button class="btn-secondary"
@click="limpiar"
>
Limpiar
</button>
        </div>
      </div>
    </div>

    <div class="card mt-8">
      <div class="card-header flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Mis cotizaciones</h2>
        <button class="btn-secondary" @click="verTodasCotizaciones">Ver todas</button>
      </div>
      <div class="card-body">
        <div v-if="isLoadingQuotes" class="text-gray-600">Cargando...</div>
        <div v-else>
          <div v-if="(misCotizaciones || []).length === 0" class="text-gray-500">Aún no tienes cotizaciones guardadas.</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="c in misCotizaciones"
              :key="c.id"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">ID: {{ c.id }}</div>
                <div class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{{ c.estado || 'nuevo' }}</div>
              </div>
              <div class="mt-2 text-xl font-semibold">{{ formatCurrency(c.total_estimado || 0) }}</div>
              <div class="mt-2 text-sm text-gray-600">{{ new Date(c.fecha_creacion || c.created_at || Date.now()).toLocaleString('es-CL') }}</div>
              <div class="mt-3 flex gap-2">
                <button class="btn-secondary" @click="toggleDetalles(c)">{{ c._expanded ? 'Ocultar detalles' : 'Ver detalles' }}</button>
                <button class="btn-primary" @click="viewPedido(c.id)">Ver pedido</button>
              </div>
              <div v-if="c._expanded" class="mt-3 border-t pt-3">
                <div v-if="(pedidoDetalles[c.id] || []).length === 0" class="text-gray-500 text-sm">
                  No hay detalles disponibles.
                </div>
                <div v-else class="space-y-2">
                  <div v-for="d in pedidoDetalles[c.id]" :key="d.id" class="flex items-center gap-3">
                    <img v-if="d.imagen_url" :src="d.imagen_url" :alt="d.descripcion" class="w-12 h-12 object-cover rounded border" />
                    <div>
                      <p class="text-sm text-gray-700">{{ d.descripcion }}</p>
                      <p class="text-xs text-gray-500">Cant: {{ d.cantidad }} | Material: {{ d.material || '-' }} | Color: {{ d.color || '-' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal
    v-model="showPreview"
    :show-footer="false"
    :show-header="true"
    :title="previewItem?.nombre"
    icon="info"
    modal-size="xl"
  >
    <div class="flex flex-col items-center">
      <img
        :src="previewItem?.imagen"
        :alt="previewItem?.nombre"
        class="max-h-[60vh] w-auto rounded-lg border border-gray-200 object-contain"
      >
      <div class="mt-4 flex items-center justify-between w-full max-w-xl">
        <button
          class="btn-secondary"
          :disabled="previewIndex === 0"
          @click="prevItem"
        >
          Anterior
        </button>
        <div class="text-sm text-gray-600">
          {{ formatCurrency(previewItem?.precioPor100) }} / 100 cm
        </div>
        <button
          class="btn-secondary"
          :disabled="previewIndex >= listaCubiertas.length - 1"
          @click="nextItem"
        >
          Siguiente
        </button>
      </div>
      <div class="mt-4">
        <button class="btn-primary"
@click="closePreview"
>
Cerrar
</button>
      </div>
    </div>
  </Modal>

  <Modal
    v-model="showColorPreview"
    :show-footer="false"
    :show-header="true"
    :title="colorPreviewItem?.nombre"
    icon="info"
    modal-size="xl"
  >
    <div class="flex flex-col items-center">
      <img
        :src="colorPreviewItem?.imagen"
        :alt="colorPreviewItem?.nombre"
        class="max-h-[60vh] w-auto rounded-lg border border-gray-200 object-contain"
      >
      <div class="mt-4 flex items-center justify-between w-full max-w-xl">
        <button
          class="btn-secondary"
          :disabled="colorPreviewIndex === 0"
          @click="prevColor"
        >
          Anterior
        </button>
        <div class="text-sm text-gray-600">
          {{ colorPreviewItem?.nombre }}
        </div>
        <button
          class="btn-secondary"
          :disabled="colorPreviewIndex >= mueblesColores.length - 1"
          @click="nextColor"
        >
          Siguiente
        </button>
      </div>
      <div class="mt-4">
        <button class="btn-primary"
@click="closeColorPreview"
>
Cerrar
</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.section-padding {
  padding-top: 1rem;
  padding-bottom: 2rem;
}
.label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
}
.input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
}
.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}
.card-body {
  padding: 1rem 1.25rem;
}
.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
</style>
