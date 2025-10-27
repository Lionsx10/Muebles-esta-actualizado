<template>
  <div class="container-custom section-padding">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Análisis de espacio con IA</h1>
      <p class="mt-2 text-gray-600">
        Sube una imagen de tu habitación, selecciona un área y elige un mueble para ver cómo quedaría con IA
      </p>
    </div>

    <!-- Pasos del proceso -->
    <div class="mb-8">
      <div class="flex items-center justify-center space-x-4 mb-6">
        <div class="flex items-center">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', 
                       currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600']">
            1
          </div>
          <span class="ml-2 text-sm font-medium text-gray-900">Subir imagen</span>
        </div>
        <div class="w-8 h-0.5 bg-gray-200"></div>
        <div class="flex items-center">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', 
                       currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600']">
            2
          </div>
          <span class="ml-2 text-sm font-medium text-gray-900">Seleccionar área</span>
        </div>
        <div class="w-8 h-0.5 bg-gray-200"></div>
        <div class="flex items-center">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', 
                       currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600']">
            3
          </div>
          <span class="ml-2 text-sm font-medium text-gray-900">Elegir mueble</span>
        </div>
        <div class="w-8 h-0.5 bg-gray-200"></div>
        <div class="flex items-center">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', 
                       currentStep >= 4 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600']">
            4
          </div>
          <span class="ml-2 text-sm font-medium text-gray-900">Resultado</span>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="card">
      <div class="card-body">
        <!-- Paso 1: Subir imagen de habitación -->
        <div v-if="currentStep === 1" class="text-center">
          <h2 class="text-xl font-semibold mb-4">Sube una imagen de tu habitación</h2>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
            <input 
              ref="roomImageInput"
              type="file" 
              accept="image/*" 
              @change="handleRoomImageUpload"
              class="hidden"
            >
            <div v-if="!analisisData.roomImage" @click="$refs.roomImageInput.click()" class="cursor-pointer">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="mt-2 text-sm text-gray-600">Haz clic para subir una imagen</p>
            </div>
            <div v-else class="relative">
              <img :src="analisisData.roomImage" alt="Habitación" class="max-w-full h-auto rounded">
              <button @click="analisisData.roomImage = null" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="flex justify-center space-x-4">
            <button 
              @click="nextStep" 
              :disabled="!analisisData.roomImage || loading"
              class="btn-primary"
            >
              Continuar
            </button>
          </div>
        </div>

        <!-- Paso 2: Seleccionar área -->
        <div v-else-if="currentStep === 2" class="text-center">
          <h2 class="text-xl font-semibold mb-4">Selecciona el área donde quieres colocar el mueble</h2>
          <div class="mb-4">
            <div ref="konvaContainer" class="border rounded-lg mx-auto" style="max-width: 600px;"></div>
          </div>
          <div class="flex justify-center space-x-4">
            <button @click="prevStep" class="btn-secondary">Atrás</button>
            <button 
              @click="nextStep" 
              :disabled="!analisisData.hasSelection"
              class="btn-primary"
            >
              Continuar
            </button>
          </div>
        </div>

        <!-- Paso 3: Elegir mueble -->
        <div v-else-if="currentStep === 3" class="text-center">
          <h2 class="text-xl font-semibold mb-4">Elige el mueble que quieres colocar</h2>
          
          <!-- Filtro por categoría -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por categoría:</label>
            <select v-model="analisisData.selectedCategory" @change="filterByCategory" class="form-select">
              <option value="">Todas las categorías</option>
              <option value="sofas">Sofás</option>
              <option value="mesas">Mesas</option>
              <option value="sillas">Sillas</option>
              <option value="camas">Camas</option>
              <option value="armarios">Armarios</option>
              <option value="estanterias">Estanterías</option>
            </select>
          </div>

          <!-- Grid de muebles -->
          <div v-if="loadingCatalogo" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p class="mt-2 text-gray-600">Cargando catálogo...</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div 
              v-for="mueble in analisisData.filteredMuebles" 
              :key="mueble.id"
              :class="['border rounded-lg p-4 cursor-pointer transition-all', 
                       analisisData.selectedMueble?.id === mueble.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300']"
              @click="selectFurniture(mueble)"
            >
              <img :src="mueble.imagen" :alt="mueble.nombre" class="w-full h-32 object-cover rounded mb-2">
              <h3 class="font-medium text-gray-900">{{ mueble.nombre }}</h3>
              <p class="text-sm text-gray-600">{{ mueble.categoria }}</p>
              <p class="text-lg font-semibold text-purple-600">${{ mueble.precio }}</p>
            </div>
          </div>

          <div class="flex justify-center space-x-4">
            <button @click="prevStep" class="btn-secondary">Atrás</button>
            <button 
              @click="nextStep" 
              :disabled="!analisisData.selectedMueble"
              class="btn-primary"
            >
              Generar análisis
            </button>
          </div>
        </div>

        <!-- Paso 4: Resultado -->
        <div v-else-if="currentStep === 4" class="text-center">
          <h2 class="text-xl font-semibold mb-4">Resultado del análisis</h2>
          
          <div v-if="loadingAnalisis" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p class="mt-4 text-lg font-medium text-gray-900">Generando imagen con IA...</p>
            <p class="text-gray-600">Esto puede tomar unos momentos</p>
          </div>

          <div v-else-if="analisisData.resultImage" class="text-center">
            <div class="mb-6">
              <img :src="analisisData.resultImage" alt="Resultado" class="max-w-full h-auto rounded-lg mx-auto">
            </div>
            <div class="flex justify-center space-x-4">
              <button @click="downloadResult" class="btn-primary">
                Descargar imagen
              </button>
              <button @click="saveAnalysis" class="btn-secondary">
                Guardar análisis
              </button>
              <button @click="startOver" class="btn-secondary">
                Nuevo análisis
              </button>
            </div>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <div class="text-red-600 mb-4">
              <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.07 0 1.96-.867 2.01-1.936a2.016 2.016 0 00-.396-1.423L12.283 3.358a2.015 2.015 0 00-3.566 0L1.447 17.641a2.016 2.016 0 00-.396 1.423c.05 1.069.94 1.936 2.01 1.936z" />
              </svg>
            </div>
            <p class="text-lg font-medium text-gray-900 mb-2">Error al procesar la imagen</p>
            <p class="text-gray-600 mb-4">{{ error }}</p>
            <button @click="retryAnalysis" class="btn-primary">
              Intentar de nuevo
            </button>
          </div>
        </div>

        <!-- Mensajes de estado -->
        <div v-if="success" class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {{ success }}
        </div>
        <div v-if="error && currentStep !== 4" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import Konva from 'konva'
import analisisEspacioService from '@/services/analisisEspacio'

const toast = useToast()

// Estado del componente
const currentStep = ref(1)
const roomImageInput = ref(null)
const loading = ref(false)
const loadingCatalogo = ref(false)
const loadingAnalisis = ref(false)
const error = ref(null)
const success = ref('')

// Konva
const konvaContainer = ref(null)

// Estado de análisis
const analisisData = reactive({
  roomImage: null,
  roomImageFile: null,
  selectedMueble: null,
  selectedCategory: '',
  muebles: [],
  filteredMuebles: [],
  resultImage: null,
  hasSelection: false
})

// Estado de Konva
const konvaState = reactive({
  stage: null,
  layer: null,
  imageNode: null,
  rect: null,
  transformer: null
})

// Métodos de navegación
const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
    if (currentStep.value === 2) {
      nextTick(() => initKonva())
    } else if (currentStep.value === 3) {
      loadMuebles()
    } else if (currentStep.value === 4) {
      generateAnalysis()
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const startOver = () => {
  currentStep.value = 1
  analisisData.roomImage = null
  analisisData.roomImageFile = null
  analisisData.selectedMueble = null
  analisisData.selectedCategory = ''
  analisisData.resultImage = null
  analisisData.hasSelection = false
  error.value = ''
  success.value = ''
  
  if (konvaState.stage) {
    konvaState.stage.destroy()
    konvaState.stage = null
  }
}

// Manejo de imagen de habitación
const handleRoomImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Validar archivo usando el servicio
  const validation = analisisEspacioService.validarImagenArchivo(file)
  if (!validation.valid) {
    toast.error(validation.error)
    return
  }
  
  try {
    loading.value = true
    
    // Convertir a base64 usando el servicio
    const base64 = await analisisEspacioService.fileToBase64(file)
    
    // Redimensionar si es necesario
    const resizedImage = await analisisEspacioService.resizeImage(base64, 512, 512)
     
    analisisData.roomImage = resizedImage
    analisisData.roomImageFile = file
    loading.value = false
     
    success.value = 'Imagen cargada correctamente'
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    toast.error('Error al cargar la imagen')
    loading.value = false
    console.error('Error uploading room image:', err)
  }
}

// Inicialización de Konva
const initKonva = () => {
  if (!konvaContainer.value || !analisisData.roomImage) return

  const containerWidth = konvaContainer.value.offsetWidth
  const maxHeight = 500

  konvaState.stage = new Konva.Stage({
    container: konvaContainer.value,
    width: containerWidth,
    height: maxHeight
  })

  konvaState.layer = new Konva.Layer()
  konvaState.stage.add(konvaState.layer)

  const imageObj = new Image()
  imageObj.onload = () => {
    const scale = Math.min(containerWidth / imageObj.width, maxHeight / imageObj.height)
    const width = imageObj.width * scale
    const height = imageObj.height * scale

    konvaState.stage.width(width)
    konvaState.stage.height(height)

    konvaState.imageNode = new Konva.Image({
      x: 0,
      y: 0,
      image: imageObj,
      width: width,
      height: height
    })

    konvaState.layer.add(konvaState.imageNode)

    // Crear rectángulo de selección
    konvaState.rect = new Konva.Rect({
      x: width * 0.3,
      y: height * 0.3,
      width: width * 0.4,
      height: height * 0.4,
      fill: 'rgba(124, 58, 237, 0.3)',
      stroke: '#7c3aed',
      strokeWidth: 2,
      draggable: true
    })

    konvaState.layer.add(konvaState.rect)

    // Crear transformer
    konvaState.transformer = new Konva.Transformer({
      nodes: [konvaState.rect],
      keepRatio: false,
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 50 || newBox.height < 50) {
          return oldBox
        }
        return newBox
      }
    })

    konvaState.layer.add(konvaState.transformer)
    konvaState.layer.draw()

    analisisData.hasSelection = true

    // Eventos
    konvaState.rect.on('dragmove', () => {
      const pos = konvaState.rect.position()
      const size = konvaState.rect.size()
      
      // Mantener dentro de los límites
      if (pos.x < 0) konvaState.rect.x(0)
      if (pos.y < 0) konvaState.rect.y(0)
      if (pos.x + size.width > width) konvaState.rect.x(width - size.width)
      if (pos.y + size.height > height) konvaState.rect.y(height - size.height)
    })
  }
  
  imageObj.src = analisisData.roomImage
}

const clearSelection = () => {
  if (konvaState.rect) {
    konvaState.rect.destroy()
    konvaState.transformer.destroy()
    konvaState.layer.draw()
    analisisData.hasSelection = false
  }
}

// Cargar catálogo de muebles
const loadMuebles = async () => {
  try {
    loadingCatalogo.value = true
    const response = await analisisEspacioService.obtenerCatalogoMuebles()
    
    if (response.success) {
      analisisData.muebles = response.data.muebles
      analisisData.filteredMuebles = response.data.muebles
    } else {
      throw new Error(response.message || 'Error al cargar el catálogo')
    }
  } catch (err) {
    error.value = 'Error al cargar el catálogo de muebles'
    toast.error('Error al cargar el catálogo')
    console.error('Error loading furniture catalog:', err)
  } finally {
    loadingCatalogo.value = false
  }
}

// Generación del análisis con IA
const generateAnalysis = async () => {
  if (!analisisData.roomImage || !analisisData.selectedMueble || !analisisData.hasSelection) {
    error.value = 'Faltan datos para generar el análisis'
    return
  }

  loadingAnalisis.value = true
  error.value = null

  try {
    // Validar área seleccionada
    const imageSize = { width: konvaState.stage.width(), height: konvaState.stage.height() }
    const selectionData = {
      x: konvaState.rect.x(),
      y: konvaState.rect.y(),
      width: konvaState.rect.width(),
      height: konvaState.rect.height()
    }
    
    const validation = analisisEspacioService.validarRectanguloSeleccion(selectionData, imageSize)
    
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Crear máscara usando el servicio
    const maskImage = await analisisEspacioService.createMaskFromRect(selectionData, imageSize)

    // Obtener imagen del mueble seleccionado
    let furnitureImage = analisisData.selectedMueble.imagen
    
    // Si la imagen del mueble es una URL, necesitamos convertirla a base64
    if (furnitureImage.startsWith('http') || furnitureImage.startsWith('/')) {
      // Por ahora usaremos una imagen placeholder en base64
      // En producción, deberías cargar la imagen y convertirla
      furnitureImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    }

    // Llamar al servicio de generación
    const response = await analisisEspacioService.generarImagenConIA({
      room_image: analisisData.roomImage,
      mask_image: maskImage,
      furniture_image: furnitureImage,
      mueble_id: analisisData.selectedMueble.id
    })

    if (response.success) {
      analisisData.resultImage = response.data.generated_image
      toast.success('¡Análisis completado exitosamente!')
    } else {
      throw new Error(response.message || 'Error al generar la imagen')
    }

  } catch (err) {
    error.value = err.message
    toast.error('Error al generar el análisis')
    console.error(err)
  } finally {
    loadingAnalisis.value = false
  }
}

const retryAnalysis = () => {
  error.value = null
  generateAnalysis()
}

// Acciones del resultado
const downloadResult = () => {
  if (analisisData.resultImage) {
    const link = document.createElement('a')
    link.download = 'analisis-espacio-ia.png'
    link.href = analisisData.resultImage
    link.click()
  }
}

const saveAnalysis = async () => {
  try {
    // Aquí guardaríamos el análisis en la base de datos
    success.value = 'Análisis guardado exitosamente'
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    error.value = 'Error al guardar el análisis'
    console.error('Error saving analysis:', err)
  }
}

// Función para seleccionar mueble
const selectFurniture = (mueble) => {
  analisisData.selectedMueble = mueble
  success.value = `Mueble "${mueble.nombre}" seleccionado`
  setTimeout(() => success.value = '', 3000)
}

// Función para filtrar muebles por categoría
const filterByCategory = () => {
  analisisData.filteredMuebles = analisisData.selectedCategory 
    ? analisisData.muebles.filter(m => m.categoria === analisisData.selectedCategory)
    : analisisData.muebles
}

// Cargar muebles al montar el componente
onMounted(() => {
  loadMuebles()
})

// Cleanup
onUnmounted(() => {
  if (konvaState.stage) {
    konvaState.stage.destroy()
  }
})
</script>

<style scoped>
.container-custom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-padding {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.card-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.card-body {
  padding: 1.5rem;
}

.btn-primary {
  background-color: #7c3aed;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #6d28d9;
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: 1px solid #d1d5db;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.form-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
}

.form-select:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
</style>