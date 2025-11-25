// IMPORTS - Importación de dependencias para JWT y Xano
const jwt = require('jsonwebtoken');
const xanoService = require('../services/xanoService');

// MIDDLEWARE PRINCIPAL DE AUTENTICACIÓN - Verificar token con Xano
const verificarToken = async (req, res, next) => {
  try {
    // EXTRAER HEADER DE AUTORIZACIÓN
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debes incluir el header Authorization con el token'
      });
    }

    // EXTRAER TOKEN del formato "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Token malformado',
        message: 'El formato debe ser: Bearer <token>'
      });
    }

    // VERIFICAR TOKEN CON XANO
    try {
      const userInfo = await xanoService.me(token);
      
      // AGREGAR INFORMACIÓN DEL USUARIO al objeto request para uso posterior
      req.usuario = {
        id: userInfo.id,
        nombre: userInfo.nombre || userInfo.name || 'Usuario',
        correo: userInfo.email || userInfo.correo,
        rol: userInfo.rol || userInfo.role || 'cliente'
      };

      next(); // Continuar con el siguiente middleware
    } catch (xanoError) {
      // Si falla la verificación con Xano, intentar con JWT local como fallback
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Crear usuario básico desde el token JWT
        req.usuario = {
          id: decoded.userId,
          nombre: decoded.nombre || 'Usuario',
          correo: decoded.email || decoded.correo,
          rol: decoded.rol || 'cliente'
        };

        next();
      } catch (jwtError) {
        return res.status(401).json({
          error: 'Token inválido',
          message: 'El token proporcionado no es válido'
        });
      }
    }

  } catch (error) {
    // ERROR INTERNO DEL SERVIDOR
    console.error('Error en verificación de token:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al verificar el token de autenticación'
    });
  }
};

// MIDDLEWARE DE VERIFICACIÓN DE ADMINISTRADOR - Verificar permisos de admin
const verificarAdmin = (req, res, next) => {
  // VERIFICAR QUE EL USUARIO ESTÉ AUTENTICADO
  if (!req.usuario) {
    return res.status(401).json({
      error: 'No autenticado',
      message: 'Debes estar autenticado para acceder a este recurso'
    });
  }

  // VERIFICAR ROL DE ADMINISTRADOR
  if (req.usuario.rol !== 'administrador') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo los administradores pueden acceder a este recurso'
    });
  }

  next(); // Continuar si es administrador
};

// MIDDLEWARE DE VERIFICACIÓN DE PROPIETARIO - Verificar acceso a recursos propios
const verificarPropietarioOAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    // VERIFICAR AUTENTICACIÓN
    if (!req.usuario) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    // EXTRAER IDs para comparación
    const recursoId = req.params[paramName];
    const usuarioId = req.usuario.id;
    const esAdmin = req.usuario.rol === 'administrador';

    // PERMITIR ACCESO A ADMINISTRADORES sin restricciones
    if (esAdmin) {
      return next();
    }

    // VERIFICAR QUE EL USUARIO ACCEDA SOLO A SUS RECURSOS
    if (parseInt(recursoId) !== usuarioId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes acceder a tus propios recursos'
      });
    }

    next(); // Permitir acceso al propietario
  };
};

// MIDDLEWARE ESPECÍFICO PARA PEDIDOS - Verificar propietario de pedido
const verificarPropietarioPedido = async (req, res, next) => {
  try {
    // VERIFICAR AUTENTICACIÓN
    if (!req.usuario) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    // EXTRAER DATOS para verificación
    const pedidoId = req.params.id;
    const usuarioId = req.usuario.id;
    const esAdmin = req.usuario.rol === 'administrador';

    // PERMITIR ACCESO COMPLETO A ADMINISTRADORES
    if (esAdmin) {
      return next();
    }

    // Permitir acceso si es borrador del mismo usuario
    if (typeof pedidoId === 'string' && pedidoId.startsWith('draft-')) {
      const expectedId = `draft-${parseInt(usuarioId, 10)}`;
      if (pedidoId === expectedId) return next();
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes acceder a tu propio borrador'
      });
    }

    // Para pedidos reales, verificar con Xano
    const token = (req.headers.authorization || '').split(' ')[1] || null;
    try {
      const pedido = await xanoService.getOrderById(parseInt(pedidoId, 10), token);
      if (!pedido) {
        return res.status(404).json({
          error: 'Pedido no encontrado',
          message: 'El pedido especificado no existe'
        });
      }
      if ((pedido.usuario_id || pedido.user_id) !== usuarioId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo puedes acceder a tus propios pedidos'
        });
      }
      next();
    } catch (err) {
      console.error('Error verificando pedido con Xano:', err);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No fue posible verificar el propietario del pedido'
      });
    }
  } catch (error) {
    console.error('Error en verificación de propietario de pedido:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al verificar permisos del pedido'
    });
  }
};

// MIDDLEWARE OPCIONAL - Para rutas que pueden ser públicas o privadas
const tokenOpcional = async (req, res, next) => {
  try {
    // INTENTAR EXTRAER TOKEN si está presente
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(); // Continuar sin usuario autenticado
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(); // Continuar sin usuario autenticado
    }

    // INTENTAR VERIFICAR TOKEN CON XANO sin fallar si es inválido
    try {
      const userInfo = await xanoService.me(token);
      
      // AGREGAR USUARIO AL REQUEST si está autenticado
      req.usuario = {
        id: userInfo.id,
        nombre: userInfo.nombre || userInfo.name || 'Usuario',
        correo: userInfo.email || userInfo.correo,
        rol: userInfo.rol || userInfo.role || 'cliente'
      };
    } catch (xanoError) {
      // Si falla Xano, intentar con JWT local como fallback
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.usuario = {
          id: decoded.userId,
          nombre: decoded.nombre || 'Usuario',
          correo: decoded.email || decoded.correo,
          rol: decoded.rol || 'cliente'
        };
      } catch (jwtError) {
        // Continuar sin usuario si ambos fallan
      }
    }

    next(); // Continuar con o sin usuario
  } catch (error) {
    // CONTINUAR SIN USUARIO si hay error en el token
    next();
  }
};

// EXPORTAR TODOS LOS MIDDLEWARE
module.exports = {
  verificarToken,
  verificarAdmin,
  verificarPropietarioOAdmin,
  verificarPropietarioPedido,
  tokenOpcional
};