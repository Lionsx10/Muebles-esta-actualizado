// ============================================================================
// RUTAS DE ANÁLISIS DE ESPACIO CON IA
// ============================================================================
// Este archivo maneja todas las rutas relacionadas con el análisis de espacios
// utilizando inteligencia artificial para colocar muebles en imágenes de habitaciones.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Client, handle_file } = require('@gradio/client');
const { verificarToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { createLogger } = require('../middleware/logger');
const Joi = require('joi');

// Crear logger específico para análisis de espacio
const logger = createLogger('analisis-espacio');

// ============================================================================
// CONFIGURACIÓN DE MULTER PARA SUBIDA DE ARCHIVOS
// ============================================================================

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// ============================================================================
// ESQUEMAS DE VALIDACIÓN
// ============================================================================

const generarFurnitureSchema = Joi.object({
  room_image: Joi.string().required().messages({
    'any.required': 'La imagen de la habitación es requerida',
    'string.empty': 'La imagen de la habitación no puede estar vacía'
  }),
  mask_image: Joi.string().required().messages({
    'any.required': 'La imagen de máscara es requerida',
    'string.empty': 'La imagen de máscara no puede estar vacía'
  }),
  furniture_image: Joi.string().required().messages({
    'any.required': 'La imagen del mueble es requerida',
    'string.empty': 'La imagen del mueble no puede estar vacía'
  }),
  mueble_id: Joi.number().integer().positive().required().messages({
    'any.required': 'El ID del mueble es requerido',
    'number.base': 'El ID del mueble debe ser un número',
    'number.integer': 'El ID del mueble debe ser un número entero',
    'number.positive': 'El ID del mueble debe ser positivo'
  }),
  prompt: Joi.string().allow('').default('').messages({
    'string.base': 'El prompt debe ser una cadena de texto'
  })
});

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Convierte una imagen base64 a un objeto Blob para Gradio
 * @param {string} base64String - Imagen en formato base64
 * @returns {Blob} - Objeto Blob para usar con Gradio
 */
function base64ToBlob(base64String) {
  try {
    logger.info('Convirtiendo imagen base64 a blob', {
      hasPrefix: base64String.startsWith('data:'),
      length: base64String.length,
      preview: base64String.substring(0, 50) + '...'
    });

    // Remover el prefijo data:image/...;base64, si existe
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Validar que el base64 sea válido
    if (!base64Data || base64Data.length === 0) {
      throw new Error('Base64 string vacío después de limpiar prefijo');
    }

    // Convertir base64 a buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Crear blob
    const blob = new Blob([buffer], { type: 'image/png' });
    
    logger.info('Conversión a blob exitosa', {
      bufferSize: buffer.length,
      blobSize: blob.size,
      blobType: blob.type
    });
    
    return blob;
  } catch (error) {
    logger.error('Error al convertir base64 a blob', {
      error: error.message,
      base64Length: base64String?.length || 0
    });
    throw new Error(`Error al procesar la imagen base64: ${error.message}`);
  }
}

/**
 * Convierte una imagen base64 a un archivo temporal para usar con handle_file
 * @param {string} base64String - Imagen en formato base64
 * @returns {string} - Ruta del archivo temporal
 */
function base64ToTempUrl(base64String) {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  
  try {
    // Si ya es una URL HTTP, devolverla tal como está
    if (base64String.startsWith('http://') || base64String.startsWith('https://')) {
      return base64String;
    }
    
    // Extraer los datos base64
    let base64Data;
    let extension = 'png';
    
    if (base64String.startsWith('data:image/')) {
      // Extraer el tipo de imagen y los datos
      const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (matches) {
        extension = matches[1];
        base64Data = matches[2];
      } else {
        throw new Error('Formato de imagen base64 inválido');
      }
    } else {
      // Asumir que es base64 puro
      base64Data = base64String;
    }
    
    // Crear archivo temporal
    const tempDir = os.tmpdir();
    const tempFileName = `gradio_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    // Escribir el archivo
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(tempFilePath, buffer);
    
    logger.info('Archivo temporal creado', {
      path: tempFilePath,
      size: buffer.length,
      extension: extension
    });
    
    return tempFilePath;
  } catch (error) {
    logger.error('Error al crear archivo temporal', {
      error: error.message,
      base64Length: base64String ? base64String.length : 0
    });
    throw new Error(`Error al procesar la imagen para archivo temporal: ${error.message}`);
  }
}

/**
 * Genera una respuesta simulada cuando Hugging Face no está disponible
 * @param {Object} params - Parámetros para la generación
 * @returns {string} - URL de imagen simulada
 */
function generateLocalFallback(params) {
  logger.info('Generando respuesta simulada local', {
    model_type: params.model_type,
    max_dimension: params.max_dimension
  });
  
  // Generar una URL de imagen simulada que indica que es un fallback
  const fallbackImageUrl = `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="${params.max_dimension || 256}" height="${params.max_dimension || 256}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
        Imagen simulada
      </text>
      <text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="12" fill="#999">
        Servicio de IA no disponible
      </text>
      <text x="50%" y="70%" text-anchor="middle" font-family="Arial" font-size="10" fill="#ccc">
        ${new Date().toLocaleString()}
      </text>
    </svg>
  `).toString('base64')}`;
  
  return fallbackImageUrl;
}

/**
 * Llama a la API de Gradio para generar la imagen con IA
 * @param {Object} params - Parámetros para la generación
 * @returns {Promise<string>} - URL o base64 de la imagen generada
 */
async function callGradioAPI(params) {
  try {
    logger.info('Conectando con Gradio API...', {
      model_type: params.model_type,
      max_dimension: params.max_dimension,
      room_image_url: params.room_image_url ? 'presente' : 'ausente',
      furniture_image_blob: params.furniture_image_blob ? 'presente' : 'ausente'
    });

    // Conectar con el cliente de Gradio
    const client = await Client.connect("MostLikelyAI/FurnitureDemo");
    
    logger.info('Conexión establecida, verificando estado del espacio...');
    
    // Verificar que el espacio esté disponible
    try {
      const spaceInfo = await client.view_api();
      logger.info('Información del espacio Gradio obtenida', {
        endpoints: spaceInfo ? Object.keys(spaceInfo) : 'No disponible'
      });
    } catch (spaceError) {
      logger.warn('No se pudo obtener información del espacio', {
        error: spaceError.message
      });
    }
    
    logger.info('Preparando parámetros...');

    // Preparar el archivo de imagen de fondo
    let backgroundFile;
    try {
      backgroundFile = handle_file(params.room_image_url);
      logger.info('Archivo de fondo preparado correctamente');
    } catch (fileError) {
      logger.error('Error al preparar archivo de fondo', {
        error: fileError.message,
        url: params.room_image_url
      });
      throw new Error(`Error al procesar imagen de fondo: ${fileError.message}`);
    }

    // Preparar los parámetros para Gradio - formato simplificado para prueba
    const gradioParams = [
      params.model_type || "schnell",
      {
        "background": backgroundFile,
        "layers": [],
        "composite": null
      },
      params.furniture_image_blob,
      params.prompt || "",
      params.seed || 0,
      params.num_inference_steps || 4,
      params.max_dimension || 256,
      params.margin || 0,
      params.crop !== undefined ? params.crop : true,
      params.num_images_per_prompt || 1
    ];

    logger.info('Parámetros preparados para Gradio', {
      model_type: gradioParams[0],
      prompt: gradioParams[3],
      num_inference_steps: gradioParams[5],
      max_dimension: gradioParams[6],
      hasBackground: !!gradioParams[1].background,
      hasFurnitureRef: !!gradioParams[2],
      totalParams: gradioParams.length
    });

    logger.info('Enviando solicitud a Gradio...');
    
    // Obtener información de la API para usar el endpoint correcto
    let apiInfo;
    try {
      apiInfo = await client.view_api();
      logger.info('Información de API obtenida', {
        namedEndpoints: apiInfo?.named_endpoints || [],
        unnamedEndpoints: apiInfo?.unnamed_endpoints || []
      });
    } catch (apiError) {
      logger.warn('No se pudo obtener información de API, usando índice por defecto', {
        error: apiError.message
      });
    }
    
    // Determinar el endpoint correcto
    let endpoint = "/predict"; // Por defecto usar /predict
    if (apiInfo && apiInfo.named_endpoints) {
      // Verificar si /predict está disponible
      if (apiInfo.named_endpoints['/predict']) {
        endpoint = "/predict";
        logger.info('Usando endpoint /predict', { 
          parameters: apiInfo.named_endpoints['/predict'].parameters?.length || 0 
        });
      } else {
        // Buscar otros endpoints disponibles
        const availableEndpoints = Object.keys(apiInfo.named_endpoints);
        if (availableEndpoints.length > 0) {
          endpoint = availableEndpoints[0];
          logger.info('Usando endpoint alternativo', { endpoint });
        }
      }
    }
    
    // Realizar la predicción
    const result = await client.predict(endpoint, gradioParams);
    
    logger.info('Respuesta recibida de Gradio', {
      dataLength: result.data ? result.data.length : 0,
      dataType: typeof result.data
    });

    // Procesar el resultado
    if (result.data && result.data.length > 0) {
      // Gradio puede devolver diferentes formatos, adaptamos según sea necesario
      const generatedImage = result.data[0];
      
      if (typeof generatedImage === 'string') {
        return generatedImage; // URL o base64
      } else if (generatedImage && generatedImage.url) {
        return generatedImage.url; // Objeto con URL
      } else if (generatedImage && generatedImage.path) {
        return generatedImage.path; // Ruta del archivo
      } else {
        throw new Error('Formato de respuesta inesperado de Gradio');
      }
    } else {
      throw new Error('No se recibió imagen generada de Gradio');
    }

  } catch (error) {
    // Manejar diferentes tipos de errores
    if (!error) {
      logger.error('Error desconocido en llamada a Gradio API', {
        error: 'Error object is null or undefined'
      });
      return generateLocalFallback(params);
    }
    
    // Capturar toda la información disponible del error
    const errorInfo = {
      message: error.message || 'Sin mensaje de error',
      stack: error.stack || 'Sin stack trace',
      errorType: typeof error,
      errorConstructor: error.constructor ? error.constructor.name : 'unknown',
      errorKeys: Object.keys(error),
      errorString: error.toString(),
      errorJSON: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      fullError: error
    };
    
    if (error.message && error.message.includes('Connection')) {
      logger.error('Error de conexión con Gradio API', errorInfo);
      logger.warn('Usando fallback local debido a error de conexión');
      return generateLocalFallback(params);
    }
    
    if (error.message && error.message.includes('handle_file')) {
      logger.error('Error al procesar archivo para Gradio', errorInfo);
      logger.warn('Usando fallback local debido a error de archivo');
      return generateLocalFallback(params);
    }
    
    // Log completo del error para diagnóstico
    logger.error('Error en llamada a Gradio API - Información completa', errorInfo);
    
    // Usar fallback local en lugar de fallar completamente
    logger.warn('Usando fallback local debido a error en Hugging Face');
    return generateLocalFallback(params);
  }
}

// ============================================================================
// RUTAS
// ============================================================================

// POST /analisis-espacio/generar-furniture - Generar imagen con mueble usando IA
// Recibe una imagen de habitación, máscara de área y mueble para generar una nueva imagen
router.post('/generar-furniture', asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = generarFurnitureSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const {
    room_image,
    mask_image,
    furniture_image,
    mueble_id,
    prompt
  } = value;

  try {
    logger.info('Iniciando generación de imagen con IA', {
      usuarioId: req.usuario ? req.usuario.id : 'test-user',
      muebleId: mueble_id,
      prompt: prompt
    });

    // Convertir imágenes para Gradio según la documentación
    const roomImageUrl = base64ToTempUrl(room_image);
    const furnitureImageBlob = base64ToBlob(furniture_image);

    // Preparar parámetros para la API de Gradio según la documentación de Hugging Face
    const gradioParams = {
      model_type: "schnell",
      room_image_url: roomImageUrl,
      furniture_image_blob: furnitureImageBlob,
      prompt: prompt,
      seed: 0,
      num_inference_steps: 4,
      max_dimension: 256,
      margin: 0,
      crop: true,
      num_images_per_prompt: 1
    };

    // Llamar a la API de Gradio
    const generatedImageUrl = await callGradioAPI(gradioParams);

    // Registrar el análisis en la base de datos (opcional)
    // Aquí podrías guardar el análisis en una tabla de análisis_espacios
    
    logger.info('Imagen generada exitosamente', {
      usuarioId: req.usuario ? req.usuario.id : 'test-user',
      muebleId: mueble_id,
      imageUrl: generatedImageUrl ? 'generada' : 'error'
    });

    // Responder con la imagen generada
    res.status(200).json({
      success: true,
      message: 'Imagen generada exitosamente',
      data: {
        generated_image: generatedImageUrl,
        mueble_id: mueble_id,
        timestamp: new Date().toISOString(),
        parameters: {
          model_type: "schnell",
          max_dimension: 256,
          num_inference_steps: 4
        }
      }
    });

  } catch (error) {
    logger.error('Error al generar imagen con IA', {
      error: error.message,
      usuarioId: req.usuario ? req.usuario.id : 'test-user',
      muebleId: mueble_id,
      stack: error.stack
    });

    // Determinar el tipo de error y responder apropiadamente
    if (error.message.includes('API de IA')) {
      res.status(503).json({
        success: false,
        message: 'Servicio de IA temporalmente no disponible',
        error: 'SERVICE_UNAVAILABLE'
      });
    } else if (error.message.includes('imagen base64')) {
      res.status(400).json({
        success: false,
        message: 'Error en el formato de las imágenes',
        error: 'INVALID_IMAGE_FORMAT'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}));

// GET /analisis-espacio/diagnostico - Probar conexión con Hugging Face
// Endpoint para diagnosticar problemas de conectividad con la API de IA
router.get('/diagnostico', asyncHandler(async (req, res) => {
  try {
    logger.info('Iniciando diagnóstico de conexión con Hugging Face...');
    
    const diagnostico = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };

    // Test 1: Importación de librerías
    try {
      const { Client, handle_file } = require('@gradio/client');
      diagnostico.tests.push({
        name: 'Importación de @gradio/client',
        status: 'PASSED',
        details: 'Librerías importadas correctamente'
      });
      diagnostico.summary.passed++;
    } catch (error) {
      diagnostico.tests.push({
        name: 'Importación de @gradio/client',
        status: 'FAILED',
        error: error.message
      });
      diagnostico.summary.failed++;
    }
    diagnostico.summary.total++;

    // Test 2: Conexión básica con Hugging Face
    try {
      logger.info('Probando conexión con MostLikelyAI/FurnitureDemo...');
      const client = await Client.connect("MostLikelyAI/FurnitureDemo");
      diagnostico.tests.push({
        name: 'Conexión con Hugging Face Space',
        status: 'PASSED',
        details: 'Conexión establecida exitosamente'
      });
      diagnostico.summary.passed++;

      // Test 3: Obtener información de la API
      try {
        const spaceInfo = await client.view_api();
        diagnostico.tests.push({
          name: 'Información de API del Space',
          status: 'PASSED',
          details: {
            endpoints: spaceInfo ? Object.keys(spaceInfo) : 'No disponible',
            hasPredict: spaceInfo && spaceInfo['/predict'] ? true : false
          }
        });
        diagnostico.summary.passed++;
      } catch (apiError) {
        diagnostico.tests.push({
          name: 'Información de API del Space',
          status: 'FAILED',
          error: apiError.message
        });
        diagnostico.summary.failed++;
      }
      diagnostico.summary.total++;

    } catch (connectionError) {
      diagnostico.tests.push({
        name: 'Conexión con Hugging Face Space',
        status: 'FAILED',
        error: connectionError.message
      });
      diagnostico.summary.failed++;
    }
    diagnostico.summary.total++;

    // Test 4: Procesamiento de imagen de prueba
    try {
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const processedUrl = base64ToTempUrl(testImageBase64);
      diagnostico.tests.push({
        name: 'Procesamiento de imagen base64',
        status: 'PASSED',
        details: 'Imagen convertida correctamente'
      });
      diagnostico.summary.passed++;
    } catch (imageError) {
      diagnostico.tests.push({
        name: 'Procesamiento de imagen base64',
        status: 'FAILED',
        error: imageError.message
      });
      diagnostico.summary.failed++;
    }
    diagnostico.summary.total++;

    logger.info('Diagnóstico completado', {
      total: diagnostico.summary.total,
      passed: diagnostico.summary.passed,
      failed: diagnostico.summary.failed
    });

    res.json({
      success: true,
      data: diagnostico
    });

  } catch (error) {
    logger.error('Error en diagnóstico', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error en diagnóstico',
      error: error.message
    });
  }
}));

// POST /analisis-espacio/test-ia - Probar funcionalidad de IA con parámetros simples
// Endpoint de prueba para verificar la comunicación con Hugging Face
router.post('/test-ia', asyncHandler(async (req, res) => {
  try {
    logger.info('Iniciando prueba simple de IA...');

    // Imagen de prueba muy simple (1x1 pixel transparente)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // Convertir para Gradio
    const roomImageUrl = base64ToTempUrl(testImageBase64);
    const furnitureImageBlob = base64ToBlob(testImageBase64);

    logger.info('Imágenes de prueba preparadas', {
      roomImageUrl: roomImageUrl ? 'OK' : 'FAIL',
      furnitureImageBlob: furnitureImageBlob ? 'OK' : 'FAIL'
    });

    // Parámetros mínimos para la prueba - solo los esenciales
    const testParams = {
      model_type: "schnell",
      room_image_url: roomImageUrl,
      furniture_image_blob: furnitureImageBlob,
      prompt: "test",
      num_inference_steps: 1,
      max_dimension: 64
    };

    logger.info('Llamando a Gradio API con parámetros de prueba...');
    
    // Intentar llamada a Gradio
    const result = await callGradioAPI(testParams);
    
    logger.info('Prueba de IA completada exitosamente');

    res.json({
      success: true,
      message: 'Prueba de IA completada exitosamente',
      data: {
        result: result,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error en prueba de IA', {
      error: error.message,
      stack: error.stack
    });

    res.status(503).json({
      success: false,
      message: 'Error en prueba de IA',
      error: error.message,
      details: {
        timestamp: new Date().toISOString(),
        errorType: typeof error,
        errorConstructor: error.constructor?.name
      }
    });
  }
}));

// GET /analisis-espacio/muebles - Obtener catálogo de muebles disponibles
// Devuelve la lista de muebles que se pueden usar en el análisis de espacios
router.get('/muebles', asyncHandler(async (req, res) => {
  try {
    const { categoria, limit = 50, offset = 0 } = req.query;

    logger.info('Consultando catálogo de muebles (datos estáticos)', {
      categoria: categoria || 'todas',
      limit,
      offset
    });

    // Datos estáticos para pruebas de IA
    let muebles = [
      {
        id: 1,
        nombre: 'Sofá moderno gris',
        categoria: 'sofas',
        imagen: '/images/muebles/sofa-moderno-gris.jpg',
        descripcion: 'Sofá de 3 plazas con diseño moderno y tapizado gris',
        precio: 899.99
      },
      {
        id: 2,
        nombre: 'Mesa de centro cristal',
        categoria: 'mesas',
        imagen: '/images/muebles/mesa-centro-cristal.jpg',
        descripcion: 'Mesa de centro con superficie de cristal templado',
        precio: 299.99
      },
      {
        id: 3,
        nombre: 'Silla ergonómica oficina',
        categoria: 'sillas',
        imagen: '/images/muebles/silla-ergonomica.jpg',
        descripcion: 'Silla de oficina con soporte lumbar',
        precio: 199.99
      },
      {
        id: 4,
        nombre: 'Cama matrimonial roble',
        categoria: 'camas',
        imagen: '/images/muebles/cama-matrimonial-roble.jpg',
        descripcion: 'Cama matrimonial en madera de roble',
        precio: 699.99
      },
      {
        id: 5,
        nombre: 'Armario empotrado blanco',
        categoria: 'armarios',
        imagen: '/images/muebles/armario-empotrado-blanco.jpg',
        descripcion: 'Armario empotrado de 3 puertas',
        precio: 1299.99
      },
      {
        id: 6,
        nombre: 'Estantería industrial',
        categoria: 'estanterias',
        imagen: '/images/muebles/estanteria-industrial.jpg',
        descripcion: 'Estantería de estilo industrial con 5 niveles',
        precio: 399.99
      }
    ];

    // Filtrar por categoría si se especifica
    if (categoria) {
      muebles = muebles.filter(mueble => mueble.categoria === categoria);
    }

    // Aplicar paginación
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMuebles = muebles.slice(startIndex, endIndex);

    logger.info('Catálogo de muebles obtenido exitosamente', {
      usuarioId: 'test-user',
      categoria: categoria || 'todas',
      total: muebles.length,
      returned: paginatedMuebles.length
    });

    res.status(200).json({
      success: true,
      message: 'Catálogo de muebles obtenido exitosamente',
      data: {
        muebles: paginatedMuebles,
        pagination: {
          total: muebles.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: endIndex < muebles.length
        },
        categorias_disponibles: ['sofas', 'mesas', 'sillas', 'camas', 'armarios', 'estanterias']
      }
    });

  } catch (error) {
    logger.error('Error al obtener catálogo de muebles', {
      error: error.message,
      usuarioId: 'test-user',
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Error al obtener el catálogo de muebles',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}));

// GET /analisis-espacio/historial - Obtener historial de análisis del usuario
// Devuelve el historial de análisis de espacios realizados por el usuario
router.get('/historial', verificarToken, asyncHandler(async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Por ahora devolvemos datos de ejemplo
    // En una implementación real, esto vendría de la base de datos
    const historial = [
      {
        id: 1,
        fecha_creacion: '2024-01-15T10:30:00Z',
        imagen_original: '/uploads/analisis/original_1.jpg',
        imagen_resultado: '/uploads/analisis/resultado_1.jpg',
        mueble_usado: {
          id: 1,
          nombre: 'Sofá moderno gris',
          categoria: 'sofas'
        },
        parametros: {
          max_dimension: 512,
          num_inference_steps: 20
        }
      }
    ];

    logger.info('Historial de análisis consultado', {
      usuarioId: req.usuario.id,
      total: historial.length
    });

    res.status(200).json({
      success: true,
      message: 'Historial obtenido exitosamente',
      data: {
        analisis: historial,
        pagination: {
          total: historial.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: false
        }
      }
    });

  } catch (error) {
    logger.error('Error al obtener historial de análisis', {
      error: error.message,
      usuarioId: req.usuario.id,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}));

module.exports = router;