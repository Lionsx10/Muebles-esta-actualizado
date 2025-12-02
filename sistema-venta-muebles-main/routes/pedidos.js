// Importaciones necesarias para el módulo de gestión de pedidos
const express = require('express');
const Joi = require('joi'); // Para validación de datos de entrada
<<<<<<< HEAD
const { query, transaction, getPaginated } = require('../config/database'); // Funciones para consultas, transacciones y consultas paginadas (Xano)
=======
const { query, transaction } = require('../config/database'); // Funciones para consultas y transacciones de base de datos
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
const { verificarToken, verificarAdmin, verificarPropietarioPedido } = require('../middleware/auth'); // Middleware de autenticación y autorización
const { asyncHandler, ValidationError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler'); // Manejo de errores
const { createLogger } = require('../middleware/logger'); // Sistema de logging

// Inicialización del router de Express y logger específico para pedidos
const router = express.Router();
const logger = createLogger('pedidos');
<<<<<<< HEAD
// Integraciones: servicio Xano y almacenamiento de borradores en memoria
const xanoService = require('../services/xanoService');
const draftStore = require('../services/draftStore');
=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

// Configuración de estados y transiciones de pedidos

// Estados válidos que puede tener un pedido en el sistema
const ESTADOS_VALIDOS = ['nuevo', 'en_cotizacion', 'aprobado', 'en_produccion', 'entregado', 'cancelado'];

// Transiciones de estado permitidas - define qué cambios de estado son válidos
// Esto asegura que los pedidos sigan un flujo lógico de trabajo
const TRANSICIONES_PERMITIDAS = {
  'nuevo': ['en_cotizacion', 'cancelado'],
  'en_cotizacion': ['aprobado', 'cancelado'],
  'aprobado': ['en_produccion', 'cancelado'],
  'en_produccion': ['entregado'],
  'entregado': [], // Estado final - no se puede cambiar
  'cancelado': [] // Estado final - no se puede cambiar
};

// Esquemas de validación con Joi para diferentes operaciones

// Esquema para validar la creación de un nuevo pedido
const crearPedidoSchema = Joi.object({
  detalles: Joi.array().min(1).items(
    Joi.object({
      descripcion: Joi.string().min(10).max(1000).required().messages({
        'string.min': 'La descripción debe tener al menos 10 caracteres',
        'string.max': 'La descripción no puede exceder 1000 caracteres',
        'any.required': 'La descripción es obligatoria'
      }),
      medidas: Joi.string().max(200).optional(),
      material: Joi.string().max(100).optional(),
      color: Joi.string().max(50).optional(),
      cantidad: Joi.number().integer().min(1).default(1),
<<<<<<< HEAD
      observaciones: Joi.string().max(500).optional(),
      imagen_url: Joi.string().max(500).optional(),
      estilo: Joi.string().max(100).optional(),
      precio_unitario: Joi.number().precision(2).min(0).optional()
    })
  ).required(),
  notas_cliente: Joi.string().max(1000).optional(),
  direccion_entrega: Joi.string().max(500).optional(),
  total_estimado: Joi.number().precision(2).min(0).optional()
=======
      observaciones: Joi.string().max(500).optional()
    })
  ).required(),
  notas_cliente: Joi.string().max(1000).optional(),
  direccion_entrega: Joi.string().max(500).optional()
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
});

// Esquema para validar actualización de estado de pedido
const actualizarEstadoSchema = Joi.object({
  estado: Joi.string().valid(...ESTADOS_VALIDOS).required(),
  notas_admin: Joi.string().max(1000).optional(),
  fecha_entrega: Joi.date().optional()
});

// Esquema para validar actualización de cotización
const actualizarCotizacionSchema = Joi.object({
  detalles: Joi.array().min(1).items(
    Joi.object({
      id: Joi.number().integer().required(),
      cotizacion: Joi.number().precision(2).min(0).required()
    })
  ).required(),
  total_estimado: Joi.number().precision(2).min(0).required()
});

<<<<<<< HEAD
// Esquema para agregar un detalle a un pedido existente (borrador)
const agregarDetalleSchema = Joi.object({
  descripcion: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'La descripción debe tener al menos 10 caracteres',
    'string.max': 'La descripción no puede exceder 1000 caracteres',
    'any.required': 'La descripción es obligatoria'
  }),
  medidas: Joi.string().max(200).optional(),
  material: Joi.string().max(100).optional(),
  color: Joi.string().max(50).optional(),
  cantidad: Joi.number().integer().min(1).default(1),
  observaciones: Joi.string().max(500).optional(),
  precio_unitario: Joi.number().precision(2).min(0).optional(),
  imagen_url: Joi.string().max(500).optional(),
  estilo: Joi.string().max(100).optional()
});

// Esquema opcional para que el usuario agregue un mensaje al solicitar cotización
const solicitarCotizacionSchema = Joi.object({
  mensaje: Joi.string().max(1000).optional()
});

=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
/**
 * POST /pedidos - Crear nuevo pedido
 * Permite a los usuarios autenticados crear un nuevo pedido con múltiples detalles
 */
router.post('/', verificarToken, asyncHandler(async (req, res) => {
  // Validar datos de entrada usando el esquema de Joi
  const { error, value } = crearPedidoSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

<<<<<<< HEAD
  const { detalles, notas_cliente, direccion_entrega, total_estimado } = value;
=======
  const { detalles, notas_cliente, direccion_entrega } = value;
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

  // Usar transacción para asegurar consistencia de datos
  const resultado = await transaction(async (client) => {
    // Crear el pedido principal con estado inicial 'nuevo'
    const pedidoResult = await client.query(`
<<<<<<< HEAD
      INSERT INTO pedidos (usuario_id, estado, notas_cliente, direccion_entrega, total_estimado)
      VALUES ($1, 'nuevo', $2, $3, $4)
      RETURNING id, estado, fecha_creacion, total_estimado
    `, [req.usuario.id, notas_cliente, direccion_entrega, total_estimado || null]);
=======
      INSERT INTO pedidos (usuario_id, estado, notas_cliente, direccion_entrega)
      VALUES ($1, 'nuevo', $2, $3)
      RETURNING id, estado, fecha_creacion
    `, [req.usuario.id, notas_cliente, direccion_entrega]);
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

    const pedido = pedidoResult.rows[0];

    // Insertar cada detalle del pedido en la tabla de detalles
    const detallesInsertados = [];
    for (const detalle of detalles) {
      const detalleResult = await client.query(`
        INSERT INTO detalles_pedido 
<<<<<<< HEAD
        (pedido_id, descripcion, medidas, material, color, cantidad, observaciones, imagen_url, estilo, precio_unitario)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
=======
        (pedido_id, descripcion, medidas, material, color, cantidad, observaciones)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
        RETURNING *
      `, [
        pedido.id,
        detalle.descripcion,
        detalle.medidas,
        detalle.material,
        detalle.color,
        detalle.cantidad || 1,
<<<<<<< HEAD
        detalle.observaciones,
        detalle.imagen_url || null,
        detalle.estilo || null,
        detalle.precio_unitario || null
=======
        detalle.observaciones
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
      ]);
      detallesInsertados.push(detalleResult.rows[0]);
    }

    return { pedido, detalles: detallesInsertados };
  });

  // Crear notificación automática para informar al usuario sobre el nuevo pedido
  await query(`
    INSERT INTO notificaciones (usuario_id, mensaje, tipo, asunto, datos_adicionales)
    VALUES ($1, $2, 'sistema', $3, $4)
  `, [
    req.usuario.id,
    'Tu pedido ha sido creado exitosamente y está siendo revisado por nuestro equipo.',
    'Nuevo pedido creado',
    JSON.stringify({ pedido_id: resultado.pedido.id })
  ]);

  // Registrar la creación del pedido en los logs
  logger.info('Nuevo pedido creado', {
    pedidoId: resultado.pedido.id,
    usuarioId: req.usuario.id,
    cantidadDetalles: resultado.detalles.length
  });

<<<<<<< HEAD
  // Intentar replicar en Xano (opcional) usando el token del usuario
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1] || null;
  let xanoOrder = null;
  try {
    xanoOrder = await xanoService.createOrder({
      usuario_id: req.usuario.id,
      estado: 'en_cotizacion',
      total_estimado: value.total_estimado || null
    }, token);
  } catch (xErr) {
    logger.warn('No se pudo crear pedido en Xano, se mantiene solo en BD local', { message: xErr.message, status: xErr.response?.status });
  }

=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  res.status(201).json({
    message: 'Pedido creado exitosamente',
    pedido: {
      id: resultado.pedido.id,
      estado: resultado.pedido.estado,
      fechaCreacion: resultado.pedido.fecha_creacion,
<<<<<<< HEAD
      total_estimado: resultado.pedido.total_estimado || value.total_estimado || null,
      detalles: resultado.detalles,
      xanoId: xanoOrder?.id || null
=======
      detalles: resultado.detalles
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    }
  });
}));

/**
 * GET /pedidos/:id - Obtener detalles completos de un pedido específico
 * Permite ver información detallada de un pedido (solo propietario o administrador)
 */
router.get('/:id', verificarToken, verificarPropietarioPedido, asyncHandler(async (req, res) => {
  const { id } = req.params;

<<<<<<< HEAD
  // Si es un borrador en memoria, responder desde draftStore sin tocar la BD
  if (typeof id === 'string' && id.startsWith('draft-')) {
    const draft = draftStore.getDraftByUser(req.usuario.id);
    if (!draft || draft.id !== id) {
      throw new NotFoundError('Pedido borrador no encontrado');
    }

    const resumen = draftStore.toSummary(draft);
    const historial = [];

    return res.json({
      message: 'Pedido borrador obtenido exitosamente',
      pedido: {
        id: draft.id,
        usuario_id: draft.usuario_id,
        estado: draft.estado,
        created_at: resumen.created_at,
        numero_pedido: resumen.numero_pedido,
        total: resumen.total,
        productos: resumen.productos,
        detalles: draft.detalles,
        historial
      }
    });
  }

  // Intentar obtener el pedido y sus detalles desde Xano primero
  try {
    const token = (req.headers.authorization || '').split(' ')[1] || null;
    const pedidoX = await xanoService.getOrderById(parseInt(id, 10), token);

    // Consultar detalles en Xano usando la tabla 'detalle_pedido' (fallback: 'detalles_pedido')
    let detallesX = [];
    try {
      const data1 = await getPaginated('/detalle_pedido', 1, 100, { pedido_id: parseInt(id, 10) }, token);
      detallesX = Array.isArray(data1) ? data1 : (data1?.items || []);
    } catch (e1) {
      logger.warn('Fallo en /detalle_pedido, probando /detalles_pedido', { status: e1.response?.status, message: e1.message });
      const data2 = await getPaginated('/detalles_pedido', 1, 100, { pedido_id: parseInt(id, 10) }, token);
      detallesX = Array.isArray(data2) ? data2 : (data2?.items || []);
    }

    // Normalizar campos a los esperados por el frontend
    const detallesNormalizados = (detallesX || []).map(d => ({
      id: d.id,
      descripcion: d.descripcion,
      medidas: d.medidas,
      material: d.material,
      color: d.color,
      cantidad: d.cantidad || 1,
      observaciones: d.observaciones || null,
      precio_unitario: typeof d.cotizacion === 'number' ? d.cotizacion : null,
      imagen_url: d.imagen_referencia_url || d.imagen_url || null,
      estilo: d.estilo || null
    }));

    return res.json({
      message: 'Pedido obtenido exitosamente (Xano)',
      pedido: {
        ...pedidoX,
        detalles: detallesNormalizados,
        historial: []
      }
    });
  } catch (xErr) {
    logger.warn('Fallo al obtener pedido desde Xano, usando BD local', { id, message: xErr.message, status: xErr.response?.status });
  }

=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Obtener información principal del pedido junto con datos del usuario
  const pedidoResult = await query(`
    SELECT 
      p.*,
      u.nombre as nombre_usuario,
      u.correo as correo_usuario
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.id = $1
  `, [id]);

  if (pedidoResult.rows.length === 0) {
    throw new NotFoundError('Pedido no encontrado');
  }

  const pedido = pedidoResult.rows[0];

  // Obtener todos los detalles del pedido ordenados por ID
  const detallesResult = await query(`
    SELECT * FROM detalles_pedido WHERE pedido_id = $1 ORDER BY id
  `, [id]);

  // Obtener historial completo de cambios de estado del pedido
  const historialResult = await query(`
    SELECT 
      h.*,
      u.nombre as usuario_cambio_nombre
    FROM historial_estados h
    LEFT JOIN usuarios u ON h.usuario_cambio_id = u.id
    WHERE h.pedido_id = $1
    ORDER BY h.fecha_cambio DESC
  `, [id]);

  res.json({
    message: 'Pedido obtenido exitosamente',
    pedido: {
      ...pedido,
      detalles: detallesResult.rows,
      historial: historialResult.rows
    }
  });
}));

/**
 * GET /pedidos/usuario/:id - Listar pedidos de un usuario específico
 * Permite ver los pedidos de un usuario con filtros y paginación
 */
router.get('/usuario/:id', verificarToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, estado = '' } = req.query;

<<<<<<< HEAD
=======
  // Verificar permisos: solo el propio usuario o administrador pueden ver los pedidos
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  if (req.usuario.rol !== 'administrador' && parseInt(id) !== req.usuario.id) {
    throw new ForbiddenError('Solo puedes ver tus propios pedidos');
  }

<<<<<<< HEAD
  const token = (req.headers.authorization || '').split(' ')[1] || null;
  let pedidos = [];
  try {
    const data = await xanoService.getOrdersByUser(parseInt(id, 10), { estado, page, limit }, token);
    pedidos = Array.isArray(data) ? data : (data?.items || []);
  } catch (err) {
    logger.warn('Fallo al obtener pedidos desde Xano, devolviendo lista vacía', { message: err.message });
    pedidos = [];
  }

  const draft = draftStore.getDraftByUser(parseInt(id, 10));
  if (draft) {
    pedidos = [draftStore.toSummary(draft), ...pedidos];
  }

  const total = pedidos.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const end = start + parseInt(limit);
  const paged = pedidos.slice(start, end);

  res.json({
    message: 'Pedidos obtenidos exitosamente',
    pedidos: paged,
=======
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Construir filtros dinámicamente
  let whereClause = 'WHERE p.usuario_id = $1';
  const valores = [id];
  let contador = 2;

  // Filtro opcional por estado
  if (estado) {
    whereClause += ` AND p.estado = $${contador}`;
    valores.push(estado);
    contador++;
  }

  // Obtener el total de registros que coinciden con los filtros
  const totalResult = await query(`
    SELECT COUNT(*) as total FROM pedidos p ${whereClause}
  `, valores);
  
  const total = parseInt(totalResult.rows[0].total);

  // Obtener pedidos paginados con información resumida
  valores.push(parseInt(limit), offset);
  const resultado = await query(`
    SELECT 
      p.id, p.estado, p.fecha_creacion, p.fecha_entrega, p.total_estimado,
      COUNT(dp.id) as cantidad_items
    FROM pedidos p
    LEFT JOIN detalles_pedido dp ON p.id = dp.pedido_id
    ${whereClause}
    GROUP BY p.id, p.estado, p.fecha_creacion, p.fecha_entrega, p.total_estimado
    ORDER BY p.fecha_creacion DESC
    LIMIT $${contador} OFFSET $${contador + 1}
  `, valores);

  res.json({
    message: 'Pedidos obtenidos exitosamente',
    pedidos: resultado.rows,
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

/**
 * GET /pedidos - Listar todos los pedidos con filtros (solo administradores)
 * Permite a los administradores ver todos los pedidos del sistema con opciones de filtrado
 */
router.get('/', verificarToken, verificarAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, estado = '', usuario_id = '' } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Construir filtros dinámicamente basados en los parámetros de consulta
  let whereClause = 'WHERE 1=1';
  const valores = [];
  let contador = 1;

  // Filtro por estado específico
  if (estado) {
    whereClause += ` AND p.estado = $${contador}`;
    valores.push(estado);
    contador++;
  }

  // Filtro por usuario específico
  if (usuario_id) {
    whereClause += ` AND p.usuario_id = $${contador}`;
    valores.push(usuario_id);
    contador++;
  }

  // Obtener el total de registros que coinciden con los filtros
  const totalResult = await query(`
    SELECT COUNT(*) as total FROM pedidos p ${whereClause}
  `, valores);
  
  const total = parseInt(totalResult.rows[0].total);

  // Obtener pedidos paginados con información del usuario y resumen
  valores.push(parseInt(limit), offset);
  const resultado = await query(`
    SELECT 
      p.id, p.estado, p.fecha_creacion, p.fecha_entrega, p.total_estimado,
      u.nombre as nombre_usuario, u.correo as correo_usuario,
      COUNT(dp.id) as cantidad_items
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN detalles_pedido dp ON p.id = dp.pedido_id
    ${whereClause}
    GROUP BY p.id, p.estado, p.fecha_creacion, p.fecha_entrega, p.total_estimado, u.nombre, u.correo
    ORDER BY p.fecha_creacion DESC
    LIMIT $${contador} OFFSET $${contador + 1}
  `, valores);

  res.json({
    message: 'Pedidos obtenidos exitosamente',
    pedidos: resultado.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

/**
 * PATCH /pedidos/:id/estado - Actualizar estado del pedido (solo administradores)
 * Permite cambiar el estado de un pedido siguiendo las transiciones válidas
 */
router.patch('/:id/estado', verificarToken, verificarAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = actualizarEstadoSchema.validate(req.body);
  
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { estado, notas_admin, fecha_entrega } = value;

  // Obtener el estado actual del pedido y el ID del usuario propietario
  const pedidoActual = await query(
    'SELECT estado, usuario_id FROM pedidos WHERE id = $1',
    [id]
  );

  if (pedidoActual.rows.length === 0) {
    throw new NotFoundError('Pedido no encontrado');
  }

  const estadoActual = pedidoActual.rows[0].estado;
  const usuarioId = pedidoActual.rows[0].usuario_id;

  // Verificar que la transición de estado es válida según las reglas de negocio
  if (!TRANSICIONES_PERMITIDAS[estadoActual].includes(estado)) {
    throw new ValidationError(
      `No se puede cambiar el estado de '${estadoActual}' a '${estado}'. ` +
      `Estados permitidos: ${TRANSICIONES_PERMITIDAS[estadoActual].join(', ')}`
    );
  }

  // Construir query dinámicamente para actualizar solo los campos proporcionados
  const campos = ['estado = $2'];
  const valores = [id, estado];
  let contador = 3;

  if (notas_admin !== undefined) {
    campos.push(`notas_admin = $${contador}`);
    valores.push(notas_admin);
    contador++;
  }

  if (fecha_entrega !== undefined) {
    campos.push(`fecha_entrega = $${contador}`);
    valores.push(fecha_entrega);
    contador++;
  }

  // Actualizar el pedido en la base de datos
  const resultado = await query(`
    UPDATE pedidos 
    SET ${campos.join(', ')}
    WHERE id = $1
    RETURNING *
  `, valores);

  const pedidoActualizado = resultado.rows[0];

  // Actualizar el historial de estados con información del administrador que hizo el cambio
  // (el trigger de la base de datos crea automáticamente el registro de historial)
  await query(`
    UPDATE historial_estados 
    SET usuario_cambio_id = $1, comentario = $2
    WHERE pedido_id = $3 AND estado_nuevo = $4 AND usuario_cambio_id IS NULL
  `, [req.usuario.id, notas_admin, id, estado]);

  // Crear notificación automática para informar al usuario sobre el cambio de estado
  const mensajesEstado = {
    'en_cotizacion': 'Tu pedido está siendo cotizado por nuestro equipo.',
    'aprobado': 'Tu pedido ha sido aprobado y pronto comenzará la producción.',
    'en_produccion': 'Tu pedido está en producción.',
    'entregado': 'Tu pedido ha sido entregado exitosamente.',
    'cancelado': 'Tu pedido ha sido cancelado.'
  };

  await query(`
    INSERT INTO notificaciones (usuario_id, mensaje, tipo, asunto, datos_adicionales)
    VALUES ($1, $2, 'sistema', $3, $4)
  `, [
    usuarioId,
    mensajesEstado[estado] || `El estado de tu pedido ha cambiado a: ${estado}`,
    `Pedido ${estado}`,
    JSON.stringify({ pedido_id: id, estado_anterior: estadoActual, estado_nuevo: estado })
  ]);

  // Registrar el cambio de estado en los logs para auditoría
  logger.info('Estado de pedido actualizado', {
    pedidoId: id,
    estadoAnterior: estadoActual,
    estadoNuevo: estado,
    adminId: req.usuario.id,
    usuarioId: usuarioId
  });

  res.json({
    message: 'Estado del pedido actualizado exitosamente',
    pedido: pedidoActualizado
  });
}));

/**
 * PUT /pedidos/:id/cotizacion - Actualizar cotización del pedido (solo administradores)
 * Permite establecer precios para los detalles del pedido y el total estimado
 */
router.put('/:id/cotizacion', verificarToken, verificarAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = actualizarCotizacionSchema.validate(req.body);
  
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { detalles, total_estimado } = value;

  // Usar transacción para asegurar consistencia al actualizar múltiples registros
  const resultado = await transaction(async (client) => {
    // Verificar que el pedido existe antes de proceder
    const pedidoResult = await client.query(
      'SELECT id, estado FROM pedidos WHERE id = $1',
      [id]
    );

    if (pedidoResult.rows.length === 0) {
      throw new NotFoundError('Pedido no encontrado');
    }

    // Actualizar la cotización de cada detalle del pedido
    for (const detalle of detalles) {
      await client.query(
        'UPDATE detalles_pedido SET cotizacion = $1 WHERE id = $2 AND pedido_id = $3',
        [detalle.cotizacion, detalle.id, id]
      );
    }

    // Actualizar el total estimado del pedido principal
    const pedidoActualizado = await client.query(
      'UPDATE pedidos SET total_estimado = $1 WHERE id = $2 RETURNING *',
      [total_estimado, id]
    );

    return pedidoActualizado.rows[0];
  });

  // Registrar la actualización de cotización en los logs
  logger.info('Cotización de pedido actualizada', {
    pedidoId: id,
    totalEstimado: total_estimado,
    adminId: req.usuario.id
  });

  res.json({
    message: 'Cotización actualizada exitosamente',
    pedido: resultado
  });
}));

/**
<<<<<<< HEAD
 * POST /pedidos/draft/detalles - Agregar detalle al pedido borrador del usuario
 * Si no existe un pedido en estado 'nuevo' para el usuario, se crea y se añade el detalle
 */
router.post('/draft/detalles', verificarToken, asyncHandler(async (req, res) => {
  const { error, value } = agregarDetalleSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { draft, detalle } = draftStore.addDetail(req.usuario.id, value);

  logger.info('Detalle agregado a borrador en memoria', {
    pedidoId: draft.id,
    usuarioId: req.usuario.id,
    detalleId: detalle.id
  });

  res.status(201).json({
    message: 'Detalle agregado al pedido borrador',
    pedido: { id: draft.id, estado: draft.estado },
    detalle
  });
}));

/**
 * POST /pedidos/:id/solicitar-cotizacion - Solicitar cotización (usuario propietario)
 * Permite al usuario propietario de un pedido pasar el estado a 'en_cotizacion' y notifica a administradores
 */
router.post('/:id/solicitar-cotizacion', verificarToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = solicitarCotizacionSchema.validate(req.body || {});
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  const { mensaje = '' } = value;

  // Si es un borrador en memoria, crear pedido en Xano directamente
  if (typeof id === 'string' && id.startsWith('draft-')) {
    const draft = draftStore.getDraftByUser(req.usuario.id);
    if (!draft || draft.id !== id) {
      throw new NotFoundError('Borrador no encontrado');
    }

    const token = (req.headers.authorization || '').split(' ')[1] || null;
    let created;
    try {
      created = await xanoService.createOrder({
        usuario_id: req.usuario.id,
        estado: 'en_cotizacion',
        notas_cliente: mensaje || undefined,
        detalles: draft.detalles,
      }, token);
    } catch (err) {
      logger.error('Error creando pedido en Xano desde borrador', { message: err.message });
      throw new Error('No fue posible crear el pedido en el servidor');
    }

    // Asegurar estado en_cotizacion
    try {
      if (created?.estado !== 'en_cotizacion' && created?.id) {
        await xanoService.updateOrderStatus(created.id, { estado: 'en_cotizacion' }, token);
      }
    } catch (err) {
      logger.warn('No se pudo actualizar estado del pedido en Xano', { message: err.message });
    }

    draftStore.clearDraft(req.usuario.id);
    logger.info('Solicitud de cotización enviada, borrador convertido a pedido', { usuarioId: req.usuario.id, pedidoId: created?.id });
    return res.status(200).json({
      message: 'Solicitud de cotización enviada correctamente',
      pedido: created,
    });
  }

  // Para IDs reales (persistidos), delegar a Xano
  const token = (req.headers.authorization || '').split(' ')[1] || null;
  let pedido;
  try {
    pedido = await xanoService.getOrderById(parseInt(id, 10), token);
  } catch (err) {
    throw new NotFoundError('Pedido no encontrado');
  }
  if (pedido?.estado !== 'nuevo') {
    throw new ForbiddenError('Solo puedes solicitar cotización para pedidos en estado "nuevo"');
  }
  let actualizado = pedido;
  try {
    actualizado = await xanoService.updateOrderStatus(parseInt(id, 10), { estado: 'en_cotizacion' }, token);
  } catch (err) {
    logger.error('Error actualizando estado en Xano', { message: err.message });
    throw new Error('No fue posible actualizar el estado del pedido');
  }

  logger.info('Solicitud de cotización enviada por usuario', {
    pedidoId: parseInt(id, 10),
    usuarioId: req.usuario.id,
  });
  res.status(200).json({ message: 'Solicitud de cotización enviada correctamente', pedido: actualizado });
}));

/**
 * POST /pedidos/:id/seed-detalles - Poblar detalles de un pedido en Xano
 * Crea algunos registros de prueba en la tabla 'detalle_pedido' (fallback a 'detalles_pedido')
 * Requiere que el usuario sea propietario del pedido o admin.
 */
router.post('/:id/seed-detalles', verificarToken, verificarPropietarioPedido, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orderId = parseInt(id, 10);
  const token = (req.headers.authorization || '').split(' ')[1] || null;

  // Verificar que el pedido exista en Xano
  let pedido;
  try {
    pedido = await xanoService.getOrderById(orderId, token);
  } catch (err) {
    throw new NotFoundError('Pedido no encontrado en Xano');
  }

  const muestras = [
    {
      pedido_id: orderId,
      descripcion: 'Mueble bajo para sala con puertas y estantes',
      medidas: '120x45x60 cm',
      material: 'MDF laminado',
      color: 'Blanco',
      imagen_referencia_url: 'https://via.placeholder.com/800x600?text=Mueble+Sala',
      cotizacion: 250.00
    },
    {
      pedido_id: orderId,
      descripcion: 'Mesa de comedor rectangular con acabado natural',
      medidas: '160x90x75 cm',
      material: 'Madera de pino',
      color: 'Natural',
      imagen_referencia_url: 'https://via.placeholder.com/800x600?text=Mesa+Comedor',
      cotizacion: 480.00
    },
    {
      pedido_id: orderId,
      descripcion: 'Estantería modular de tres niveles',
      medidas: '90x35x180 cm',
      material: 'Melamina',
      color: 'Roble',
      imagen_referencia_url: 'https://via.placeholder.com/800x600?text=Estanteria',
      cotizacion: 320.00
    }
  ];

  const creados = [];
  for (const det of muestras) {
    try {
      const creado = await xanoService.createOrderDetail(det, token);
      creados.push(creado);
    } catch (err) {
      logger.error('Error creando detalle de pedido de prueba', { message: err.message });
    }
  }

  logger.info('Detalles de pedido de prueba creados', { pedidoId: orderId, cantidad: creados.length, usuarioId: req.usuario.id });
  res.status(201).json({ message: 'Detalles creados', cantidad: creados.length, detalles: creados });
}));

/**
=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
 * GET /pedidos/estadisticas/resumen - Obtener estadísticas de pedidos (solo administradores)
 * Proporciona un resumen estadístico de todos los pedidos para análisis de negocio
 */
router.get('/estadisticas/resumen', verificarToken, verificarAdmin, asyncHandler(async (req, res) => {
  // Obtener estadísticas agrupadas por estado de pedido
  const estadisticas = await query(`
    SELECT 
      estado,
      COUNT(*) as cantidad,
      SUM(total_estimado) as valor_total
    FROM pedidos 
    GROUP BY estado
    ORDER BY 
      CASE estado
        WHEN 'nuevo' THEN 1
        WHEN 'en_cotizacion' THEN 2
        WHEN 'aprobado' THEN 3
        WHEN 'en_produccion' THEN 4
        WHEN 'entregado' THEN 5
        WHEN 'cancelado' THEN 6
      END
  `);

  // Obtener resumen mensual de pedidos de los últimos 12 meses
  const resumenMensual = await query(`
    SELECT 
      DATE_TRUNC('month', fecha_creacion) as mes,
      COUNT(*) as pedidos_creados,
      SUM(total_estimado) as valor_total
    FROM pedidos 
    WHERE fecha_creacion >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', fecha_creacion)
    ORDER BY mes DESC
  `);

  res.json({
    message: 'Estadísticas obtenidas exitosamente',
    estadisticas: {
      por_estado: estadisticas.rows,
      resumen_mensual: resumenMensual.rows
    }
  });
}));

// Exportar el router para uso en el servidor principal
<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
