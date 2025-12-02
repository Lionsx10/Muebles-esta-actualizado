<<<<<<< HEAD
=======
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
          <h2 class="text-xl font-semibold mb-4">Pinta el área donde quieres colocar el mueble</h2>
          
          <!-- Controles del pincel -->
          <div class="mb-4 flex justify-center items-center space-x-4">
            <!-- Herramientas -->
            <div class="flex space-x-2 mr-4">
              <button 
                @click="konvaState.tool = 'brush'"
                :class="[
                  'px-3 py-1 rounded text-sm',
                  konvaState.tool === 'brush' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
              >
                Pincel
              </button>
              <button 
                @click="konvaState.tool = 'eraser'"
                :class="[
                  'px-3 py-1 rounded text-sm',
                  konvaState.tool === 'eraser' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
              >
                Borrador
              </button>
            </div>
            <label class="text-sm font-medium text-gray-700">Tamaño:</label>
            <input 
              type="range" 
              v-model="konvaState.brushSize" 
              min="5" 
              max="50" 
              class="w-32"
            />
            <span class="text-sm text-gray-600">{{ konvaState.brushSize }}px</span>
            <button 
              @click="clearMask"
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Limpiar
            </button>
          </div>

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
          
          <!-- Opción para subir imagen propia -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 class="text-lg font-medium text-blue-800 mb-3">¿Tienes tu propia imagen de mueble?</h3>
            <div class="flex flex-col items-center space-y-3">
              <input
                type="file"
                ref="customFurnitureInput"
                @change="handleCustomFurnitureUpload"
                accept="image/*"
                class="hidden"
              />
              <button
                @click="$refs.customFurnitureInput.click()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📁 Subir mi propia imagen de mueble
              </button>
              <p class="text-sm text-blue-600">Sube una imagen de tu mueble personalizado</p>
              
              <!-- Vista previa de imagen personalizada -->
              <div v-if="analisisData.customFurnitureImage" class="mt-3">
                <img 
                  :src="analisisData.customFurnitureImage" 
                  alt="Mueble personalizado" 
                  class="w-32 h-32 object-cover rounded-lg border-2 border-blue-300"
                />
                <p class="text-sm text-green-600 mt-1">✅ Imagen personalizada cargada</p>
                <button
                  @click="clearCustomFurniture"
                  class="text-red-600 hover:text-red-800 text-sm mt-1"
                >
                  ❌ Eliminar imagen personalizada
                </button>
              </div>
            </div>
          </div>
          
          <!-- Filtro por categoría -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">O elige del catálogo - Filtrar por categoría:</label>
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
              :disabled="!analisisData.selectedMueble && !analisisData.customFurnitureImage"
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
              <img :src="analisisData.resultImage" alt="Resultado del análisis" class="max-w-full h-auto rounded-lg shadow-lg mx-auto" />
            </div>
            
            <div class="flex justify-center space-x-4">
              <button @click="downloadResult" class="btn-primary">
                Descargar resultado
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

>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
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
  hasSelection: false,
  customFurnitureImage: null,
<<<<<<< HEAD
  customFurnitureFile: null,
=======
  customFurnitureFile: null
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
})

// Estado de Konva
const konvaState = reactive({
  stage: null,
  layer: null,
  imageNode: null,
  rect: null,
  transformer: null,
  // Propiedades para el pincel
  brushMode: true,
  brushSize: 20,
  tool: 'brush', // 'brush' | 'eraser' - como en el código de ejemplo
  maskLayer: null,
  maskCanvas: null,
  maskContext: null,
  isDrawing: false,
<<<<<<< HEAD
  lastPointerPosition: null,
=======
  lastPointerPosition: null
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
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
  analisisData.customFurnitureImage = null
  analisisData.customFurnitureFile = null
  error.value = ''
  success.value = ''
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  if (konvaState.stage) {
    konvaState.stage.destroy()
    konvaState.stage = null
  }
}

// Manejo de imagen de habitación
<<<<<<< HEAD
const handleRoomImageUpload = async event => {
  const file = event.target.files[0]
  if (!file) return

=======
const handleRoomImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Validar archivo usando el servicio
  const validation = analisisEspacioService.validarImagenArchivo(file)
  if (!validation.valid) {
    toast.error(validation.error)
    return
  }
<<<<<<< HEAD

  try {
    loading.value = true

    // Convertir a base64 usando el servicio
    const base64 = await analisisEspacioService.fileToBase64(file)

    // Redimensionar si es necesario
    const resizedImage = await analisisEspacioService.resizeImage(
      base64,
      512,
      512,
    )

    analisisData.roomImage = resizedImage
    analisisData.roomImageFile = file
    loading.value = false

    success.value = 'Imagen cargada correctamente'
    setTimeout(() => (success.value = ''), 3000)
=======
  
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
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  } catch (err) {
    toast.error('Error al cargar la imagen')
    loading.value = false
    console.error('Error uploading room image:', err)
  }
}

// Manejo de imagen personalizada de mueble
<<<<<<< HEAD
const handleCustomFurnitureUpload = async event => {
  const file = event.target.files[0]
  if (!file) return

=======
const handleCustomFurnitureUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Validar archivo usando el servicio
  const validation = analisisEspacioService.validarImagenArchivo(file)
  if (!validation.valid) {
    toast.error(validation.error)
    return
  }
<<<<<<< HEAD

  try {
    loading.value = true

    // Convertir a base64 usando el servicio
    const base64 = await analisisEspacioService.fileToBase64(file)

    // Redimensionar si es necesario
    const resizedImage = await analisisEspacioService.resizeImage(
      base64,
      512,
      512,
    )

    analisisData.customFurnitureImage = resizedImage
    analisisData.customFurnitureFile = file

    // Limpiar selección del catálogo si había una
    analisisData.selectedMueble = null

    loading.value = false
    success.value = 'Imagen de mueble personalizada cargada correctamente'
    setTimeout(() => (success.value = ''), 3000)
=======
  
  try {
    loading.value = true
    
    // Convertir a base64 usando el servicio
    const base64 = await analisisEspacioService.fileToBase64(file)
    
    // Redimensionar si es necesario
    const resizedImage = await analisisEspacioService.resizeImage(base64, 512, 512)
     
    analisisData.customFurnitureImage = resizedImage
    analisisData.customFurnitureFile = file
    
    // Limpiar selección del catálogo si había una
    analisisData.selectedMueble = null
    
    loading.value = false
    success.value = 'Imagen de mueble personalizada cargada correctamente'
    setTimeout(() => success.value = '', 3000)
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  } catch (err) {
    toast.error('Error al cargar la imagen del mueble')
    loading.value = false
    console.error('Error uploading custom furniture image:', err)
  }
}

const clearCustomFurniture = () => {
  analisisData.customFurnitureImage = null
  analisisData.customFurnitureFile = null
  success.value = 'Imagen personalizada eliminada'
<<<<<<< HEAD
  setTimeout(() => (success.value = ''), 3000)
=======
  setTimeout(() => success.value = '', 3000)
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
}

// Inicialización de Konva
const initKonva = () => {
  if (!konvaContainer.value || !analisisData.roomImage) return

  const containerWidth = konvaContainer.value.offsetWidth
  const maxHeight = 500

  konvaState.stage = new Konva.Stage({
    container: konvaContainer.value,
    width: containerWidth,
<<<<<<< HEAD
    height: maxHeight,
=======
    height: maxHeight
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  })

  konvaState.layer = new Konva.Layer()
  konvaState.stage.add(konvaState.layer)

  const imageObj = new Image()
  imageObj.onload = () => {
<<<<<<< HEAD
    const scale = Math.min(
      containerWidth / imageObj.width,
      maxHeight / imageObj.height,
    )
=======
    const scale = Math.min(containerWidth / imageObj.width, maxHeight / imageObj.height)
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    const width = imageObj.width * scale
    const height = imageObj.height * scale

    konvaState.stage.width(width)
    konvaState.stage.height(height)

    konvaState.imageNode = new Konva.Image({
      x: 0,
      y: 0,
      image: imageObj,
<<<<<<< HEAD
      width,
      height,
=======
      width: width,
      height: height
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    })

    konvaState.layer.add(konvaState.imageNode)
    konvaState.layer.draw()

    // Inicializar modo pincel directamente
    initBrushMode()
  }
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  imageObj.src = analisisData.roomImage
}

const clearSelection = () => {
  clearMask()
}

// Funciones del pincel

const initBrushMode = () => {
  if (!konvaState.stage) return
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Crear canvas para la máscara
  konvaState.maskCanvas = document.createElement('canvas')
  konvaState.maskCanvas.width = konvaState.stage.width()
  konvaState.maskCanvas.height = konvaState.stage.height()
  konvaState.maskContext = konvaState.maskCanvas.getContext('2d')
<<<<<<< HEAD

  // Fondo TRANSPARENTE (no pintar nada) - según código de ejemplo
  // NO llenar con negro, dejar transparente para que funcione correctamente con Gradio
  konvaState.maskContext.lineCap = 'round'
  konvaState.maskContext.lineJoin = 'round'

=======
  
  // Fondo TRANSPARENTE (no pintar nada) - según código de ejemplo
  // NO llenar con negro, dejar transparente para que funcione correctamente con Gradio
  konvaState.maskContext.lineCap = "round"
  konvaState.maskContext.lineJoin = "round"
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Crear layer para la máscara visual
  if (konvaState.maskLayer) {
    konvaState.maskLayer.destroy()
  }
<<<<<<< HEAD

  konvaState.maskLayer = new Konva.Layer()
  konvaState.stage.add(konvaState.maskLayer)

=======
  
  konvaState.maskLayer = new Konva.Layer()
  konvaState.stage.add(konvaState.maskLayer)
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Eventos del mouse/touch
  konvaState.stage.on('mousedown touchstart', startDrawing)
  konvaState.stage.on('mousemove touchmove', draw)
  konvaState.stage.on('mouseup touchend', stopDrawing)
}

<<<<<<< HEAD
const startDrawing = e => {
  if (!konvaState.brushMode) return

  konvaState.isDrawing = true
  const pos = konvaState.stage.getPointerPosition()
  konvaState.lastPointerPosition = pos

=======
const startDrawing = (e) => {
  if (!konvaState.brushMode) return
  
  konvaState.isDrawing = true
  const pos = konvaState.stage.getPointerPosition()
  konvaState.lastPointerPosition = pos
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Dibujar punto inicial
  drawBrushStroke(pos, pos)
}

<<<<<<< HEAD
const draw = e => {
  if (!konvaState.brushMode || !konvaState.isDrawing) return

  const pos = konvaState.stage.getPointerPosition()

  if (konvaState.lastPointerPosition) {
    drawBrushStroke(konvaState.lastPointerPosition, pos)
  }

=======
const draw = (e) => {
  if (!konvaState.brushMode || !konvaState.isDrawing) return
  
  const pos = konvaState.stage.getPointerPosition()
  
  if (konvaState.lastPointerPosition) {
    drawBrushStroke(konvaState.lastPointerPosition, pos)
  }
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  konvaState.lastPointerPosition = pos
}

const stopDrawing = () => {
  if (!konvaState.brushMode) return
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  konvaState.isDrawing = false
  konvaState.lastPointerPosition = null
  analisisData.hasSelection = true
}

const drawBrushStroke = (from, to) => {
  // Dibujar en el canvas de máscara según código de ejemplo
  // Modo de composición según herramienta (como en el código de ejemplo)
<<<<<<< HEAD
  konvaState.maskContext.globalCompositeOperation =
    konvaState.tool === 'eraser' ? 'destination-out' : 'source-over'

  konvaState.maskContext.strokeStyle = 'rgba(255,255,255,1)' // color da igual, importa ALPHA
  konvaState.maskContext.lineWidth = konvaState.brushSize

  // Configurar estilo de línea como en el código de ejemplo
  konvaState.maskContext.lineCap = 'round'
  konvaState.maskContext.lineJoin = 'round'

=======
  konvaState.maskContext.globalCompositeOperation = (konvaState.tool === 'eraser')
    ? 'destination-out'
    : 'source-over'
  
  konvaState.maskContext.strokeStyle = 'rgba(255,255,255,1)' // color da igual, importa ALPHA
  konvaState.maskContext.lineWidth = konvaState.brushSize
  
  // Configurar estilo de línea como en el código de ejemplo
  konvaState.maskContext.lineCap = 'round'
  konvaState.maskContext.lineJoin = 'round'
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  konvaState.maskContext.beginPath()
  konvaState.maskContext.moveTo(from.x, from.y)
  konvaState.maskContext.lineTo(to.x, to.y)
  konvaState.maskContext.stroke()
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Dibujar visualización en Konva
  const line = new Konva.Line({
    points: [from.x, from.y, to.x, to.y],
    stroke: 'rgba(124, 58, 237, 0.6)',
    strokeWidth: konvaState.brushSize,
    lineCap: 'round',
<<<<<<< HEAD
    lineJoin: 'round',
  })

  konvaState.maskLayer.add(line)
  konvaState.maskLayer.draw()

=======
    lineJoin: 'round'
  })
  
  konvaState.maskLayer.add(line)
  konvaState.maskLayer.draw()
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Actualizar estado de selección
  analisisData.hasSelection = true
}

const clearMask = () => {
  if (konvaState.maskLayer) {
    konvaState.maskLayer.destroy()
    konvaState.maskLayer = null
  }
<<<<<<< HEAD

  if (konvaState.maskCanvas && konvaState.maskContext) {
    // Limpiar canvas completamente (fondo transparente) según código de ejemplo
    konvaState.maskContext.clearRect(
      0,
      0,
      konvaState.maskCanvas.width,
      konvaState.maskCanvas.height,
    )
  }

=======
  
  if (konvaState.maskCanvas && konvaState.maskContext) {
    // Limpiar canvas completamente (fondo transparente) según código de ejemplo
    konvaState.maskContext.clearRect(0, 0, konvaState.maskCanvas.width, konvaState.maskCanvas.height)
  }
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  analisisData.hasSelection = false
}

// Cargar catálogo de muebles
const loadMuebles = async () => {
  try {
    loadingCatalogo.value = true
    const response = await analisisEspacioService.obtenerCatalogoMuebles()
<<<<<<< HEAD

=======
    
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
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

// Generación del análisis con IA usando el nuevo endpoint
const generateAnalysis = async () => {
<<<<<<< HEAD
  if (
    !analisisData.roomImage ||
    (!analisisData.selectedMueble && !analisisData.customFurnitureImage) ||
    !konvaState.maskCanvas
  ) {
    error.value =
      'Faltan datos para generar el análisis. Asegúrate de subir una imagen de habitación, seleccionar un mueble y pintar el área donde quieres colocarlo.'
=======
  if (!analisisData.roomImage || (!analisisData.selectedMueble && !analisisData.customFurnitureImage) || !konvaState.maskCanvas) {
    error.value = 'Faltan datos para generar el análisis. Asegúrate de subir una imagen de habitación, seleccionar un mueble y pintar el área donde quieres colocarlo.'
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    return
  }

  loadingAnalisis.value = true
  error.value = null

  try {
    // Crear máscara usando toBlob() como en el código de ejemplo
    const maskBlob = await createMaskBlob()
<<<<<<< HEAD

=======
    
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    // Debug: Verificar contenido de la máscara
    console.log('🔍 Debug - Máscara generada:', {
      canvasWidth: konvaState.maskCanvas.width,
      canvasHeight: konvaState.maskCanvas.height,
      blobSize: maskBlob.size,
<<<<<<< HEAD
      blobType: maskBlob.type,
=======
      blobType: maskBlob.type
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    })

    // Convertir imágenes base64 a archivos
    const roomFile = await base64ToFile(analisisData.roomImage, 'room.png')
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' })
<<<<<<< HEAD

    // Debug: Verificar archivos creados
    console.log('🔍 Debug - Archivos creados:', {
      roomFile: {
        name: roomFile.name,
        size: roomFile.size,
        type: roomFile.type,
      },
      maskFile: {
        name: maskFile.name,
        size: maskFile.size,
        type: maskFile.type,
      },
    })

=======
    
    // Debug: Verificar archivos creados
    console.log('🔍 Debug - Archivos creados:', {
      roomFile: { name: roomFile.name, size: roomFile.size, type: roomFile.type },
      maskFile: { name: maskFile.name, size: maskFile.size, type: maskFile.type }
    })
    
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    // Obtener imagen del mueble y convertirla a archivo
    let furnitureFile
    if (analisisData.customFurnitureImage) {
      // Usar imagen personalizada si está disponible
      furnitureFile = analisisData.customFurnitureFile
    } else if (analisisData.selectedMueble.imagen.startsWith('data:')) {
<<<<<<< HEAD
      furnitureFile = await base64ToFile(
        analisisData.selectedMueble.imagen,
        'furniture.png',
      )
    } else {
      // Si es una URL, cargar la imagen y convertirla
      furnitureFile = await urlToFile(
        analisisData.selectedMueble.imagen,
        'furniture.png',
      )
=======
      furnitureFile = await base64ToFile(analisisData.selectedMueble.imagen, 'furniture.png')
    } else {
      // Si es una URL, cargar la imagen y convertirla
      furnitureFile = await urlToFile(analisisData.selectedMueble.imagen, 'furniture.png')
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    }

    // Debug: Verificar archivo de mueble
    console.log('🔍 Debug - Archivo de mueble:', {
<<<<<<< HEAD
      furnitureFile: {
        name: furnitureFile.name,
        size: furnitureFile.size,
        type: furnitureFile.type,
      },
=======
      furnitureFile: { name: furnitureFile.name, size: furnitureFile.size, type: furnitureFile.type }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    })

    // Crear FormData para el nuevo endpoint
    const formData = new FormData()
    formData.append('room', roomFile)
    formData.append('furniture', furnitureFile)
    formData.append('mask', maskFile)
    formData.append('prompt', '')
    formData.append('seed', '0')
    formData.append('num_inference_steps', '20')
    formData.append('max_dimension', '512')
    formData.append('margin', '64')
    formData.append('crop', 'true')
    formData.append('num_images_per_prompt', '1')
    formData.append('model_type', 'dev')

    // Debug: Verificar FormData
    console.log('🔍 Debug - FormData creado:', {
      entries: Array.from(formData.entries()).map(([key, value]) => [
<<<<<<< HEAD
        key,
        value instanceof File
          ? `File(${value.name}, ${value.size}b, ${value.type})`
          : value,
      ]),
=======
        key, 
        value instanceof File ? `File(${value.name}, ${value.size}b, ${value.type})` : value
      ])
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    })

    // Llamar al nuevo endpoint
    const response = await analisisEspacioService.generateWithFiles(formData)

    if (response.success) {
      analisisData.resultImage = response.image
      toast.success('¡Análisis completado exitosamente!')
    } else {
      throw new Error(response.error || 'Error al generar la imagen')
    }
<<<<<<< HEAD
=======

>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  } catch (err) {
    error.value = err.message
    toast.error('Error al generar el análisis')
    console.error(err)
  } finally {
    loadingAnalisis.value = false
  }
}

// Crear máscara RGBA con fondo transparente y trazos opacos en alpha (como en código de ejemplo)
const createMaskBlob = () => {
<<<<<<< HEAD
  return new Promise(resolve => {
    // Crear un canvas temporal para asegurar el formato correcto
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = konvaState.maskCanvas.width
    tempCanvas.height = konvaState.maskCanvas.height
    const tempCtx = tempCanvas.getContext('2d')

    // Asegurar que el canvas tenga fondo completamente transparente
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)

    // Copiar la máscara original
    tempCtx.drawImage(konvaState.maskCanvas, 0, 0)

    // Convertir a blob con calidad máxima
    tempCanvas.toBlob(blob => resolve(blob), 'image/png', 1.0)
  })
}
=======
  return new Promise((resolve) => {
    // Crear un canvas temporal para asegurar el formato correcto
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = konvaState.maskCanvas.width;
    tempCanvas.height = konvaState.maskCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Asegurar que el canvas tenga fondo completamente transparente
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Copiar la máscara original
    tempCtx.drawImage(konvaState.maskCanvas, 0, 0);
    
    // Convertir a blob con calidad máxima
    tempCanvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
  });
};
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

// Función auxiliar para convertir base64 a File
const base64ToFile = async (base64String, filename) => {
  const response = await fetch(base64String)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type })
}

// Función auxiliar para convertir URL a File
const urlToFile = async (url, filename) => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type })
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

<<<<<<< HEAD
=======


>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
const saveAnalysis = async () => {
  try {
    // Aquí guardaríamos el análisis en la base de datos
    success.value = 'Análisis guardado exitosamente'
<<<<<<< HEAD
    setTimeout(() => (success.value = ''), 3000)
=======
    setTimeout(() => success.value = '', 3000)
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  } catch (err) {
    error.value = 'Error al guardar el análisis'
    console.error('Error saving analysis:', err)
  }
}

// Función para seleccionar mueble
<<<<<<< HEAD
const selectFurniture = mueble => {
=======
const selectFurniture = (mueble) => {
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  analisisData.selectedMueble = mueble
  // Limpiar imagen personalizada si había una
  analisisData.customFurnitureImage = null
  analisisData.customFurnitureFile = null
  success.value = `Mueble "${mueble.nombre}" seleccionado`
<<<<<<< HEAD
  setTimeout(() => (success.value = ''), 3000)
=======
  setTimeout(() => success.value = '', 3000)
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
}

// Función para filtrar muebles por categoría
const filterByCategory = () => {
<<<<<<< HEAD
  analisisData.filteredMuebles = analisisData.selectedCategory
    ? analisisData.muebles.filter(
        m => m.categoria === analisisData.selectedCategory,
      )
=======
  analisisData.filteredMuebles = analisisData.selectedCategory 
    ? analisisData.muebles.filter(m => m.categoria === analisisData.selectedCategory)
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    : analisisData.muebles
}

// Cargar muebles al montar el componente
onMounted(() => {
  loadMuebles()
})

// Cleanup
onUnmounted(() => {
  if (konvaState.stage) {
    // Limpiar eventos del pincel
    konvaState.stage.off('mousedown touchstart')
    konvaState.stage.off('mousemove touchmove')
    konvaState.stage.off('mouseup touchend')
<<<<<<< HEAD

    // Destruir stage
    konvaState.stage.destroy()
  }

=======
    
    // Destruir stage
    konvaState.stage.destroy()
  }
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Limpiar canvas de máscara
  if (konvaState.maskCanvas) {
    konvaState.maskCanvas = null
    konvaState.maskContext = null
  }
})
</script>

<<<<<<< HEAD
<template>
  <div class="container-custom section-padding">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        Análisis de espacio con IA
      </h1>
      <p class="mt-2 text-gray-600">
        Sube una imagen de tu habitación, selecciona un área y elige un mueble
        para ver cómo quedaría con IA
      </p>
    </div>

    <!-- Pasos del proceso -->
    <div class="mb-8">
      <div class="flex items-center justify-center space-x-4 mb-6">
        <div class="flex items-center">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            :class="[
              currentStep >= 1
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-600',
            ]"
          >
            1
          </div>
          <span class="ml-2 text-sm font-medium text-gray-900">Subir imagen</span>
        </div>
        <div class="w-8 h-0.5 bg-gray-200" />
        <div class="flex items-center">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            :class="[
              currentStep >= 2
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-600',
            ]"
          >
            2
          </div>
          <span class="ml-2 text-sm font-medium text-gray-900">Seleccionar área</span>
        </div>
        <div class="w-8 h-0.5 bg-gray-200" />
        <div class="flex items-center">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            :class="[
              currentStep >= 3
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-600',
            ]"
          >
            3
          </div>
          <span class="ml-2 text-sm font-medium text-gray-900">Elegir mueble</span>
        </div>
        <div class="w-8 h-0.5 bg-gray-200" />
        <div class="flex items-center">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            :class="[
              currentStep >= 4
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-600',
            ]"
          >
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
          <h2 class="text-xl font-semibold mb-4">
            Sube una imagen de tu habitación
          </h2>
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4"
          >
            <input
              ref="roomImageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleRoomImageUpload"
            >
            <div
              v-if="!analisisData.roomImage"
              class="cursor-pointer"
              @click="$refs.roomImageInput.click()"
            >
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <p class="mt-2 text-sm text-gray-600">
                Haz clic para subir una imagen
              </p>
            </div>
            <div v-else class="relative">
              <img
                :src="analisisData.roomImage"
                alt="Habitación"
                class="max-w-full h-auto rounded"
              >
              <button
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                @click="analisisData.roomImage = null"
              >
                <svg
                  class="w-4 h-4"
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
            </div>
          </div>
          <div class="flex justify-center space-x-4">
            <button
              :disabled="!analisisData.roomImage || loading"
              class="btn-primary"
              @click="nextStep"
            >
              Continuar
            </button>
          </div>
        </div>

        <!-- Paso 2: Seleccionar área -->
        <div v-else-if="currentStep === 2" class="text-center">
          <h2 class="text-xl font-semibold mb-4">
            Pinta el área donde quieres colocar el mueble
          </h2>

          <!-- Controles del pincel -->
          <div class="mb-4 flex justify-center items-center space-x-4">
            <!-- Herramientas -->
            <div class="flex space-x-2 mr-4">
              <button
                class="px-3 py-1 rounded text-sm"
                :class="[
                  konvaState.tool === 'brush'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                ]"
                @click="konvaState.tool = 'brush'"
              >
                Pincel
              </button>
              <button
                class="px-3 py-1 rounded text-sm"
                :class="[
                  konvaState.tool === 'eraser'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                ]"
                @click="konvaState.tool = 'eraser'"
              >
                Borrador
              </button>
            </div>
            <label class="text-sm font-medium text-gray-700">Tamaño:</label>
            <input
              v-model="konvaState.brushSize"
              type="range"
              min="5"
              max="50"
              class="w-32"
            >
            <span class="text-sm text-gray-600">{{ konvaState.brushSize }}px</span>
            <button
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              @click="clearMask"
            >
              Limpiar
            </button>
          </div>

          <div class="mb-4">
            <div
              ref="konvaContainer"
              class="border rounded-lg mx-auto"
              style="max-width: 600px"
            />
          </div>
          <div class="flex justify-center space-x-4">
            <button class="btn-secondary"
@click="prevStep"
>
Atrás
</button>
            <button
              :disabled="!analisisData.hasSelection"
              class="btn-primary"
              @click="nextStep"
            >
              Continuar
            </button>
          </div>
        </div>

        <!-- Paso 3: Elegir mueble -->
        <div v-else-if="currentStep === 3" class="text-center">
          <h2 class="text-xl font-semibold mb-4">
            Elige el mueble que quieres colocar
          </h2>

          <!-- Opción para subir imagen propia -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 class="text-lg font-medium text-blue-800 mb-3">
              ¿Tienes tu propia imagen de mueble?
            </h3>
            <div class="flex flex-col items-center space-y-3">
              <input
                ref="customFurnitureInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleCustomFurnitureUpload"
              >
              <button
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                @click="$refs.customFurnitureInput.click()"
              >
                📁 Subir mi propia imagen de mueble
              </button>
              <p class="text-sm text-blue-600">
                Sube una imagen de tu mueble personalizado
              </p>

              <!-- Vista previa de imagen personalizada -->
              <div v-if="analisisData.customFurnitureImage" class="mt-3">
                <img
                  :src="analisisData.customFurnitureImage"
                  alt="Mueble personalizado"
                  class="w-32 h-32 object-cover rounded-lg border-2 border-blue-300"
                >
                <p class="text-sm text-green-600 mt-1">
                  ✅ Imagen personalizada cargada
                </p>
                <button
                  class="text-red-600 hover:text-red-800 text-sm mt-1"
                  @click="clearCustomFurniture"
                >
                  ❌ Eliminar imagen personalizada
                </button>
              </div>
            </div>
          </div>

          <!-- Filtro por categoría -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">O elige del catálogo - Filtrar por categoría:</label>
            <select
              v-model="analisisData.selectedCategory"
              class="form-select"
              @change="filterByCategory"
            >
              <option value="">
Todas las categorías
</option>
              <option value="sofas">
Sofás
</option>
              <option value="mesas">
Mesas
</option>
              <option value="sillas">
Sillas
</option>
              <option value="camas">
Camas
</option>
              <option value="armarios">
Armarios
</option>
              <option value="estanterias">
Estanterías
</option>
            </select>
          </div>

          <!-- Grid de muebles -->
          <div v-if="loadingCatalogo" class="text-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"
            />
            <p class="mt-2 text-gray-600">
Cargando catálogo...
</p>
          </div>

          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
          >
            <div
              v-for="mueble in analisisData.filteredMuebles"
              :key="mueble.id"
              class="border rounded-lg p-4 cursor-pointer transition-all"
              :class="[
                analisisData.selectedMueble?.id === mueble.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
              @click="selectFurniture(mueble)"
            >
              <img
                :src="mueble.imagen"
                :alt="mueble.nombre"
                class="w-full h-32 object-cover rounded mb-2"
              >
              <h3 class="font-medium text-gray-900">
                {{ mueble.nombre }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ mueble.categoria }}
              </p>
              <p class="text-lg font-semibold text-purple-600">
                ${{ mueble.precio }}
              </p>
            </div>
          </div>

          <div class="flex justify-center space-x-4">
            <button class="btn-secondary"
@click="prevStep"
>
Atrás
</button>
            <button
              :disabled="
                !analisisData.selectedMueble &&
                  !analisisData.customFurnitureImage
              "
              class="btn-primary"
              @click="nextStep"
            >
              Generar análisis
            </button>
          </div>
        </div>

        <!-- Paso 4: Resultado -->
        <div v-else-if="currentStep === 4" class="text-center">
          <h2 class="text-xl font-semibold mb-4">
Resultado del análisis
</h2>

          <div v-if="loadingAnalisis" class="text-center py-12">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"
            />
            <p class="mt-4 text-lg font-medium text-gray-900">
              Generando imagen con IA...
            </p>
            <p class="text-gray-600">
Esto puede tomar unos momentos
</p>
          </div>

          <div v-else-if="analisisData.resultImage" class="text-center">
            <div class="mb-6">
              <img
                :src="analisisData.resultImage"
                alt="Resultado del análisis"
                class="max-w-full h-auto rounded-lg shadow-lg mx-auto"
              >
            </div>

            <div class="flex justify-center space-x-4">
              <button class="btn-primary" @click="downloadResult">
                Descargar resultado
              </button>
              <button class="btn-secondary" @click="saveAnalysis">
                Guardar análisis
              </button>
              <button class="btn-secondary" @click="startOver">
                Nuevo análisis
              </button>
            </div>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <div class="text-red-600 mb-4">
              <svg
                class="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.876c1.07 0 1.96-.867 2.01-1.936a2.016 2.016 0 00-.396-1.423L12.283 3.358a2.015 2.015 0 00-3.566 0L1.447 17.641a2.016 2.016 0 00-.396 1.423c.05 1.069.94 1.936 2.01 1.936z"
                />
              </svg>
            </div>
            <p class="text-lg font-medium text-gray-900 mb-2">
              Error al procesar la imagen
            </p>
            <p class="text-gray-600 mb-4">
              {{ error }}
            </p>
            <button class="btn-primary" @click="retryAnalysis">
              Intentar de nuevo
            </button>
          </div>
        </div>

        <!-- Mensajes de estado -->
        <div
          v-if="success"
          class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded"
        >
          {{ success }}
        </div>
        <div
          v-if="error && currentStep !== 4"
          class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
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
<<<<<<< HEAD
</style>
=======
</style>
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
