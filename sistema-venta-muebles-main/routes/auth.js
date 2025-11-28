// Importaciones necesarias para el módulo de autenticación
const express = require('express');
const bcrypt = require('bcryptjs'); // Para cifrado de contraseñas
const jwt = require('jsonwebtoken'); // Para manejo de tokens JWT
const crypto = require('crypto'); // Para generar tokens de recuperación
const Joi = require('joi'); // Para validación de datos de entrada
const xanoService = require('../services/xanoService'); // Servicio de Xano para autenticación
const emailService = require('../services/emailService'); // Servicio de email
const { asyncHandler, ValidationError, UnauthorizedError, ConflictError } = require('../middleware/errorHandler'); // Manejo de errores
const { createLogger } = require('../middleware/logger'); // Sistema de logging

// Inicialización del router de Express y logger específico para autenticación
const router = express.Router();
const logger = createLogger('auth');

// ESQUEMAS DE VALIDACIÓN - Definición de reglas de validación usando Joi

// Esquema para validar datos de registro de usuario
const registroSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es obligatorio'
  }),
  email: Joi.string().email().max(150).required().messages({
    'string.email': 'Debe ser un correo electrónico válido',
    'string.max': 'El correo no puede exceder 150 caracteres',
    'any.required': 'El correo es obligatorio'
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'string.max': 'La contraseña no puede exceder 100 caracteres',
    'any.required': 'La contraseña es obligatoria'
  }),
  password_confirmation: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Las contraseñas no coinciden',
    'any.required': 'La confirmación de contraseña es obligatoria'
  }),
  telefono: Joi.string().max(20).optional()
});

<<<<<<< HEAD
// Esquema para validar datos de inicio de sesión (soporta email/correo y password/contraseña)
const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  correo: Joi.string().email().optional(),
  password: Joi.string().optional(),
  contrasena: Joi.string().optional()
}).custom((value, helpers) => {
  const email = value.email || value.correo;
  const password = value.password || value.contrasena;
  if (!email) {
    return helpers.error('any.required', { message: 'El correo es obligatorio' });
  }
  if (!password) {
    return helpers.error('any.required', { message: 'La contraseña es obligatoria' });
  }
  return { email, password };
=======
// Esquema para validar datos de inicio de sesión
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ser un correo electrónico válido',
    'any.required': 'El correo es obligatorio'
  }),
  password: Joi.string().required().messages({
    'any.required': 'La contraseña es obligatoria'
  })
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
});

// Esquema para validar solicitud de recuperación de contraseña
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ser un correo electrónico válido',
    'any.required': 'El correo es obligatorio'
  })
});

// Esquema para validar restablecimiento de contraseña
const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'El token es obligatorio'
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'string.max': 'La contraseña no puede exceder 100 caracteres',
    'any.required': 'La contraseña es obligatoria'
  }),
  password_confirmation: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Las contraseñas no coinciden',
    'any.required': 'La confirmación de contraseña es obligatoria'
  })
});

/**
 * Función para generar tokens JWT con información del usuario
 * @param {Object} usuario - Objeto con datos del usuario (id, correo, rol)
 * @returns {string} Token JWT firmado
 */
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      userId: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol
    },
    process.env.JWT_SECRET, // Clave secreta para firmar el token
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Tiempo de expiración
      issuer: 'sistema-muebles', // Emisor del token
      audience: 'sistema-muebles-users' // Audiencia del token
    }
  );
};

/**
 * POST /usuarios/registrar - Endpoint para registrar un nuevo usuario
 * Valida los datos, verifica que el email no esté en uso usando Xano,
 * y crea el usuario en la base de datos de Xano
 */
router.post('/usuarios/registrar', asyncHandler(async (req, res) => {
  // Validar datos de entrada usando el esquema definido
  const { error, value } = registroSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { nombre, email, password, password_confirmation, telefono } = value;

  try {
    // Registrar usuario usando el servicio de Xano
    const response = await xanoService.register({
      nombre,
      email,
      password,
      telefono: telefono || null
    });

    // Extraer datos de la respuesta de Xano (ahora incluye información completa del usuario)
    const { authToken, user } = response;

    // Registrar el evento de registro exitoso
    logger.info('Usuario registrado exitosamente', {
      userId: user.id,
      email: user.email,
      ip: req.ip
    });

    // Responder con los datos del usuario y el token
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token: authToken,
      refreshToken: authToken, // Xano maneja tokens de forma diferente
      usuario: user
    });

  } catch (error) {
    // Manejar errores específicos de Xano
    if (error.response?.status === 409 || error.message.includes('duplicate') || error.message.includes('already exists')) {
      throw new ConflictError('El correo electrónico ya está registrado');
    }
    
    if (error.response?.status === 400) {
      throw new ValidationError(error.response.data.message || 'Datos de registro inválidos');
    }

    // Registrar error para debugging
    logger.error('Error en registro de usuario', {
      email,
      error: error.message,
      ip: req.ip
    });

    throw new Error('Error interno del servidor durante el registro');
  }
}));

/**
 * POST /login - Endpoint para iniciar sesión
 * Valida las credenciales del usuario usando Xano y genera un token JWT si son correctas
 */
router.post('/login', asyncHandler(async (req, res) => {
  // Validar datos de entrada usando el esquema definido
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

<<<<<<< HEAD
  // Normalizar campos a email/password independientemente de cómo vengan
=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  const { email, password } = value;

  try {
    // Autenticar usuario usando el servicio de Xano
<<<<<<< HEAD
    const response = await xanoService.login({ email, password });
=======
    const response = await xanoService.login({
      email,
      password
    });
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

    // Log detallado para debug - ver estructura de respuesta
    console.log('🔍 Respuesta completa de Xano:', JSON.stringify(response, null, 2));

    // Manejar la estructura de respuesta de Xano
    let authToken, user;
    
    if (response.authToken && response.user) {
      // Estructura esperada: { authToken, user }
      authToken = response.authToken;
      user = response.user;
      console.log('📋 Usuario desde response.user:', JSON.stringify(user, null, 2));
    } else {
      // Fallback para otras estructuras
      authToken = response.authToken || response.token || response.access_token || 'temp_token';
      user = response.user || response;
      console.log('📋 Usuario desde fallback:', JSON.stringify(user, null, 2));
    }

    // Asegurar que tenemos los datos mínimos del usuario
    const userData = {
      id: user?.id || user?.user_id || Date.now(), // Fallback temporal
      nombre: user?.nombre || user?.name || user?.full_name || user?.first_name || 'Usuario',
      nombre_completo: user?.nombre_completo || user?.full_name || user?.name || user?.nombre || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Usuario',
      email: user?.email || email, // Usar el email del request como fallback
      telefono: user?.telefono || user?.phone || '',
      rol: user?.rol || user?.role || 'cliente'
    };

<<<<<<< HEAD
    if (!authToken || authToken === 'temp_token') {
      const jwtUsuario = {
        id: userData.id,
        correo: userData.email || email,
        rol: (userData.rol || 'cliente').toString().toLowerCase()
      };
      authToken = generarToken(jwtUsuario);
    }

=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    console.log('👤 UserData final enviado al frontend:', JSON.stringify(userData, null, 2));

    // Registrar el evento de inicio de sesión exitoso
    logger.info('Usuario inició sesión', {
      userId: userData.id,
      email: userData.email,
      ip: req.ip
    });

    // Responder con los datos del usuario y el token
    res.json({
      message: 'Inicio de sesión exitoso',
      token: authToken,
      refreshToken: authToken, // Xano maneja tokens de forma diferente
      usuario: userData
    });

  } catch (error) {
    // Manejar errores específicos de Xano
<<<<<<< HEAD
    if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404 || error.response?.status === 400) {
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        const devUser = {
          id: Date.now(),
          nombre: 'Usuario',
          nombre_completo: 'Usuario',
          email,
          telefono: '',
          rol: 'cliente'
        };
        const devToken = generarToken({ id: devUser.id, correo: email, rol: 'cliente' });
        logger.warn('Inicio de sesión en modo desarrollo', { email, ip: req.ip });
        return res.json({
          message: 'Inicio de sesión exitoso',
          token: devToken,
          refreshToken: devToken,
          usuario: devUser
        });
      }
      throw new UnauthorizedError('Credenciales inválidas. Verifica tu email y contraseña');
    }
=======
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new UnauthorizedError('Credenciales inválidas. Verifica tu email y contraseña');
    }
    
    if (error.response?.status === 404) {
      throw new UnauthorizedError('Usuario no encontrado. Verifica tu email o regístrate');
    }

    if (error.response?.status === 400) {
      throw new ValidationError('Datos de inicio de sesión inválidos');
    }
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

    // Registrar error para debugging
    logger.error('Error en inicio de sesión', {
      email,
      error: error.message,
      ip: req.ip
    });

<<<<<<< HEAD
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      const devUser = {
        id: Date.now(),
        nombre: 'Usuario',
        nombre_completo: 'Usuario',
        email,
        telefono: '',
        rol: 'cliente'
      };
      const devToken = generarToken({ id: devUser.id, correo: email, rol: 'cliente' });
      logger.warn('Inicio de sesión en modo desarrollo (fallback)', { email, ip: req.ip });
      return res.json({
        message: 'Inicio de sesión exitoso',
        token: devToken,
        refreshToken: devToken,
        usuario: devUser
      });
    }
=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    throw new UnauthorizedError('Error durante el inicio de sesión. Intenta nuevamente');
  }
}));

/**
<<<<<<< HEAD
 * POST /admin/login - Endpoint para iniciar sesión de administradores
 * Usa la tabla 'usuario' y requiere que el rol sea administrador
 */
router.post('/admin/login', asyncHandler(async (req, res) => {
  // Validación soportando email/correo y password/contrasena
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { email, password } = value;

  try {
    const response = await xanoService.adminLogin({ email, password });
    console.log('🔍 Respuesta ADMIN de Xano:', JSON.stringify(response, null, 2));

    let authToken = response.authToken || response.token || response.access_token;
    let user = response.user || response;

    const userData = {
      id: user?.id || user?.user_id || Date.now(),
      nombre: user?.nombre || user?.name || 'Usuario',
      email: user?.email || email,
      telefono: user?.telefono || user?.phone || '',
      rol: (user?.rol || user?.role || '').toString().toLowerCase() || 'administrador',
      is_admin: true
    };

    // Validar que realmente es administrador (configurable por entorno)
    const roleField = (process.env.ADMIN_ROLE_FIELD || 'rol');
    const roleValue = (process.env.ADMIN_ROLE_VALUE || 'admin').toString().toLowerCase();
    const flagField = (process.env.ADMIN_FLAG_FIELD || 'is_admin');
    const userRoleNorm = (user?.[roleField] || userData.rol || '').toString().toLowerCase();
    const adminFlag = Boolean(user?.[flagField] || userData.is_admin || user?.admin);
    const isAdmin = adminFlag === true || userRoleNorm === roleValue || userRoleNorm === 'administrador';
    if (!isAdmin) {
      throw new UnauthorizedError('Cuenta sin permisos de administrador');
    }

    logger.info('Administrador inició sesión', { userId: userData.id, email: userData.email, ip: req.ip });

    res.json({
      message: 'Inicio de sesión de administrador exitoso',
      token: authToken,
      refreshToken: authToken,
      usuario: userData
    });
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new UnauthorizedError('Credenciales inválidas para administrador');
    }
    logger.error('Error en inicio de sesión ADMIN', { email, error: error.message, ip: req.ip });
    throw new UnauthorizedError('Error durante el inicio de sesión de administrador');
  }
}));

/**
=======
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
 * POST /logout - Endpoint para cerrar sesión
 * Actualmente solo registra el evento, pero podría implementar invalidación de tokens
 */
router.post('/logout', asyncHandler(async (req, res) => {
  // En una implementación más avanzada, aquí se podría agregar el token
  // a una lista negra en Redis o base de datos para invalidarlo

  // Registrar el evento de cierre de sesión
  logger.info('Usuario cerró sesión', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({
    message: 'Sesión cerrada exitosamente'
  });
}));

/**
 * POST /refresh-token - Endpoint para renovar un token JWT
 * Permite obtener un nuevo token válido usando un token existente (incluso expirado)
 */
router.post('/refresh-token', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ValidationError('Token requerido para renovación');
  }

  try {
    // Verificar token actual (permitiendo tokens expirados para renovación)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Verificar que el usuario aún existe y está activo en la base de datos
    const resultado = await query(
      'SELECT id, nombre, correo, rol, activo FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

    if (resultado.rows.length === 0 || !resultado.rows[0].activo) {
      throw new UnauthorizedError('Usuario no válido para renovación de token');
    }

    const usuario = resultado.rows[0];
    
    // Generar un nuevo token JWT
    const nuevoToken = generarToken(usuario);

    // Registrar el evento de renovación de token
    logger.info('Token renovado', {
      userId: usuario.id,
      correo: usuario.correo,
      ip: req.ip
    });

    res.json({
      message: 'Token renovado exitosamente',
      token: nuevoToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

  } catch (error) {
    // Manejar errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Token inválido para renovación');
    }
    throw error;
  }
}));

/**
 * GET /verify-token - Endpoint para verificar la validez de un token JWT
 * Comprueba si el token es válido y si el usuario asociado aún existe y está activo
 */
router.get('/verify-token', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  
  // Verificar que se proporcione el header de autorización
  if (!authHeader) {
    return res.status(401).json({
      valid: false,
      message: 'Token no proporcionado'
    });
  }

  // Extraer el token del header Authorization (formato: "Bearer <token>")
  const token = authHeader.split(' ')[1];
  
  try {
    // Verificar y decodificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe y está activo en la base de datos
    const resultado = await query(
      'SELECT id, activo FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

    if (resultado.rows.length === 0 || !resultado.rows[0].activo) {
      return res.status(401).json({
        valid: false,
        message: 'Usuario no válido'
      });
    }

    // Responder con información de validez del token
    res.json({
      valid: true,
      message: 'Token válido',
      expiresAt: new Date(decoded.exp * 1000) // Convertir timestamp a fecha
    });

  } catch (error) {
    // Manejar diferentes tipos de errores de JWT
    res.status(401).json({
      valid: false,
      message: error.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    });
  }
}));

/**
 * POST /forgot-password - Endpoint para solicitar recuperación de contraseña
 * Genera un token de recuperación y envía un email al usuario
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = forgotPasswordSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { email } = value;

  try {
    // Verificar si el usuario existe en Xano
    const usuario = await xanoService.getUserByEmail(email);
    
    if (!usuario) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        message: 'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación'
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Guardar el token en Xano (necesitaremos agregar este método)
    await xanoService.savePasswordResetToken(usuario.id, resetToken, resetTokenExpiry);

    // Crear enlace de recuperación
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password/${resetToken}`;

    // Enviar email de recuperación
    await emailService.enviarCorreo({
      destinatario: email,
      asunto: 'Recuperación de contraseña - Comercial HG',
      contenido: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de contraseña</h2>
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Restablecer contraseña
          </a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Saludos,<br>Equipo de Comercial HG</p>
        </div>
      `,
      esHTML: true
    });

    logger.info('Solicitud de recuperación de contraseña enviada', {
      email,
      ip: req.ip
    });

    res.json({
      message: 'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación'
    });

  } catch (error) {
    logger.error('Error en solicitud de recuperación de contraseña', {
      email,
      error: error.message,
      ip: req.ip
    });

    res.json({
      message: 'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación'
    });
  }
}));

/**
 * POST /reset-password - Endpoint para restablecer la contraseña
 * Valida el token y actualiza la contraseña del usuario
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  // Validar datos de entrada
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  const { token, password } = value;

  try {
    // Verificar el token en Xano
    const tokenData = await xanoService.verifyPasswordResetToken(token);
    
    if (!tokenData || new Date() > new Date(tokenData.expires_at)) {
      throw new UnauthorizedError('Token inválido o expirado');
    }

    // Actualizar la contraseña del usuario
    await xanoService.updatePassword(tokenData.user_id, password);

    // Eliminar el token usado
    await xanoService.deletePasswordResetToken(token);

    logger.info('Contraseña restablecida exitosamente', {
      userId: tokenData.user_id,
      ip: req.ip
    });

    res.json({
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    logger.error('Error al restablecer contraseña', {
      token,
      error: error.message,
      ip: req.ip
    });

    throw new Error('Error interno del servidor al restablecer la contraseña');
  }
}));

// Exportar el router para uso en el servidor principal
<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
