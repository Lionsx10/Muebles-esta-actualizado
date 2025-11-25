const { get, post, put, del, patch, getPaginated, authGet, authPost, authAdminGet, authAdminPost } = require('../config/database');
const { createLogger } = require('../middleware/logger');

const logger = createLogger('xanoService');

class XanoService {
  constructor() {
    this.endpoints = {
      // Endpoints de autenticación
      auth: {
        login: '/auth/login',
        register: '/auth/signup',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
        verify: '/auth/verify',
        me: '/auth/me'
      },
      
      // Endpoints de usuarios
      usuarios: {
        list: '/usuarios',
        create: '/usuarios',
        getById: (id) => `/usuarios/${id}`,
        update: (id) => `/usuarios/${id}`,
        delete: (id) => `/usuarios/${id}`,
        profile: '/usuarios/profile',
        changePassword: '/usuarios/change-password',
        getByEmail: '/usuarios/by-email',
        saveResetToken: '/usuarios/save-reset-token',
        verifyResetToken: '/usuarios/verify-reset-token',
        updatePassword: '/usuarios/update-password',
        deleteResetToken: '/usuarios/delete-reset-token'
      },
      
      // Endpoints de pedidos
      pedidos: {
        list: '/pedidos',
        create: '/pedidos',
        getById: (id) => `/pedidos/${id}`,
        update: (id) => `/pedidos/${id}`,
        delete: (id) => `/pedidos/${id}`,
        updateStatus: (id) => `/pedidos/${id}/status`,
        updateQuote: (id) => `/pedidos/${id}/quote`,
        byUser: (userId) => `/pedidos/user/${userId}`
      },
      
      // Endpoints del catálogo
      catalogo: {
        list: '/catalogo',
        create: '/catalogo',
        getById: (id) => `/catalogo/${id}`,
        update: (id) => `/catalogo/${id}`,
        delete: (id) => `/catalogo/${id}`,
        activate: (id) => `/catalogo/${id}/activate`,
        filters: '/catalogo/filters',
        stats: '/catalogo/stats'
      },
      
      // Endpoints de recomendaciones IA
      recomendaciones: {
        list: '/recomendaciones',
        create: '/recomendaciones',
        getById: (id) => `/recomendaciones/${id}`,
        update: (id) => `/recomendaciones/${id}`,
        byUser: (userId) => `/recomendaciones/user/${userId}`,
        byOrder: (orderId) => `/recomendaciones/order/${orderId}`,
        generate: '/recomendaciones/generate'
      },
      
      // Endpoints de notificaciones
      notificaciones: {
        list: '/notificaciones',
        create: '/notificaciones',
        getById: (id) => `/notificaciones/${id}`,
        update: (id) => `/notificaciones/${id}`,
        markRead: '/notificaciones/mark-read',
        markAllRead: '/notificaciones/mark-all-read',
        byUser: (userId) => `/notificaciones/user/${userId}`,
        preferences: '/notificaciones/preferences',
        send: '/notificaciones/send'
      }
    };
    // Permitir configurar endpoint de login explícito si difiere del estándar
    this.customLoginEndpoint = process.env.XANO_LOGIN_ENDPOINT || null;
  }

  // Métodos de autenticación
  async login(credentials) {
    try {
      // Compatibilidad con tablas y campos personalizados en Xano (usuario vs user)
      // Enviamos ambos nombres de campos para maximizar compatibilidad
      const payload = {
        email: credentials.email,
        password: credentials.password,
        correo: credentials.email,
        contrasena: credentials.password
      };

      // Lista de endpoints a intentar para login
      const endpointsToTry = [
        this.customLoginEndpoint,
        this.endpoints.auth.login,
        '/usuarios/login',
        '/usuario/login'
      ].filter(Boolean);

      let loginResponse;
      let lastError;
      for (const ep of endpointsToTry) {
        try {
          logger.info('Intentando login en Xano', { endpoint: ep });
          loginResponse = await authPost(ep, payload);
          break; // éxito
        } catch (err) {
          lastError = err;
          logger.warn('Fallo intento de login en endpoint', { endpoint: ep, status: err.response?.status, message: err.message });
        }
      }
      if (!loginResponse) {
        const attempted = endpointsToTry.join(', ');
        logger.error('Todos los endpoints de login fallaron', { attempted });
        throw lastError || new Error('No se pudo autenticar en Xano');
      }
      // Extraer token de forma robusta antes de llamar a /auth/me
      const token = loginResponse.authToken || loginResponse.token || loginResponse.access_token || loginResponse?.data?.token;
      if (!token) {
        logger.error('Login en Xano no devolvió token esperado', { raw: loginResponse });
        throw new Error('Respuesta de autenticación inválida: faltó token');
      }
      logger.info('Usuario autenticado exitosamente', { 
        email: credentials.email 
      });
      
      // Obtener información completa del usuario usando el token
      const userInfo = await this.me(token);
      
      // Combinar la respuesta del login con la información del usuario
      const completeResponse = {
        authToken: token,
        // Normalizar campos del usuario
        user: {
          ...userInfo,
          nombre: userInfo.nombre || userInfo.name || userInfo.full_name || userInfo.first_name || 'Usuario',
          email: userInfo.email || userInfo.correo || credentials.email,
          rol: (userInfo.rol || userInfo.role || '').toString().toLowerCase() || 'cliente'
        }
      };
      
      return completeResponse;
    } catch (error) {
      logger.error('Error en login', { 
        email: credentials.email, 
        error: error.message 
      });
      throw error;
    }
  }

  // Login para administradores usando tabla 'usuario'
  async adminLogin(credentials) {
    try {
      const payload = {
        email: credentials.email,
        password: credentials.password,
        correo: credentials.email,
        correo_electronico: credentials.email,
        contrasena: credentials.password
      };

      const adminEndpoints = [
        process.env.XANO_LOGIN_ENDPOINT_ADMIN,
        '/usuario/login',
        '/usuarios/login',
        '/auth/usuario/login',
        '/admin/login',
        '/auth/login'
      ].filter(Boolean);

      let loginResponse;
      let lastError;
      for (const ep of adminEndpoints) {
        try {
          logger.info('Intentando login ADMIN en Xano', { endpoint: ep });
          loginResponse = await authAdminPost(ep, payload);
          break;
        } catch (err) {
          lastError = err;
          logger.warn('Fallo login ADMIN en endpoint', { endpoint: ep, status: err.response?.status, message: err.message });
          // Continuar probando con el siguiente endpoint en errores comunes
          const st = err.response?.status;
          if (st === 404 || st === 401 || st === 400 || st === 403) {
            continue;
          }
          // Si el error no es manejable, salir inmediatamente
          throw err;
        }
      }
      if (!loginResponse) {
        throw lastError || new Error('No se pudo autenticar administrador en Xano');
      }

      const token = loginResponse.authToken || loginResponse.token || loginResponse.access_token || loginResponse?.data?.token;
      if (!token) {
        logger.error('Login ADMIN en Xano no devolvió token esperado', { raw: loginResponse });
        throw new Error('Respuesta de autenticación inválida: faltó token');
      }

      // Obtener información del usuario con el token usando admin base
      let userInfo;
      // Intentar múltiples endpoints de perfil para la tabla 'usuario'
      const meEndpointsAdmin = [
        '/usuario/me',
        '/usuarios/me',
        this.endpoints.auth.me,
        '/me'
      ];
      for (const meEp of meEndpointsAdmin) {
        try {
          logger.info('Intentando obtener perfil ADMIN', { endpoint: meEp });
          userInfo = await authAdminGet(meEp, {}, token);
          if (userInfo) break;
        } catch (err) {
          logger.warn('Fallo obtener perfil ADMIN', { endpoint: meEp, status: err.response?.status, message: err.message });
          continue;
        }
      }
      // Fallback final: intentar en base normal
      if (!userInfo) {
        try {
          userInfo = await this.me(token);
        } catch (err) {
          logger.error('No fue posible obtener perfil del administrador');
          throw err;
        }
      }

      const completeResponse = {
        authToken: token,
        user: {
          ...userInfo,
          nombre: userInfo.nombre || userInfo.name || 'Usuario',
          email: userInfo.email || userInfo.correo || credentials.email,
          rol: (userInfo.rol || userInfo.role || '').toString().toLowerCase() || 'administrador'
        }
      };

      return completeResponse;
    } catch (error) {
      logger.error('Error en login ADMIN', { email: credentials.email, error: error.message });
      throw error;
    }
  }

  async register(userData) {
    try {
      // Mapear los campos al formato que espera Xano (tabla usuario con campos en español)
      const xanoData = {
        // Campos estándar
        name: userData.nombre,
        email: userData.email,
        password: userData.password,
        // Alias usados en español
        nombre: userData.nombre,
        correo: userData.email,
        contrasena: userData.password
      };
      
      // Agregar teléfono si está presente
      if (userData.telefono) {
        xanoData.telefono = userData.telefono;
      }
      
      const signupResponse = await authPost(this.endpoints.auth.register, xanoData);
      
      // Obtener información completa del usuario usando el token
      const userInfo = await this.me(signupResponse.authToken);
      
      // Combinar la respuesta del signup con la información del usuario
      const completeResponse = {
        authToken: signupResponse.authToken,
        user: {
          id: userInfo.id,
          nombre: userInfo.nombre || userInfo.name,
          email: userInfo.email || userInfo.correo,
          telefono: userData.telefono || null,
          rol: (userInfo.rol || 'cliente'),
          fecha_registro: new Date(userInfo.created_at).toISOString()
        }
      };
      
      logger.info('Usuario registrado exitosamente', { 
        userId: userInfo.id,
        email: userData.email,
        nombre: userData.nombre 
      });
      
      return completeResponse;
    } catch (error) {
      logger.error('Error en registro', { 
        email: userData.email, 
        error: error.message 
      });
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await authPost(this.endpoints.auth.refresh, { refresh_token: refreshToken });
      return response;
    } catch (error) {
      logger.error('Error al refrescar token', { error: error.message });
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const response = await authGet(this.endpoints.auth.verify, {}, token);
      return response;
    } catch (error) {
      logger.error('Error al verificar token', { error: error.message });
      throw error;
    }
  }

  async me(token) {
    try {
      const response = await authGet(this.endpoints.auth.me, {}, token);
      logger.info('Información de usuario obtenida', { 
        userId: response.id,
        email: response.email 
      });
      return response;
    } catch (error) {
      logger.error('Error al obtener información del usuario', { error: error.message });
      throw error;
    }
  }

  // Métodos de usuarios
  async getUsers(params = {}, token) {
    try {
      const response = await getPaginated(this.endpoints.usuarios.list, 
        params.page || 1, 
        params.limit || 10, 
        params, 
        token
      );
      return response;
    } catch (error) {
      logger.error('Error al obtener usuarios', { error: error.message });
      throw error;
    }
  }

  async getUserById(id, token) {
    try {
      const response = await get(this.endpoints.usuarios.getById(id), {}, token);
      return response;
    } catch (error) {
      logger.error('Error al obtener usuario', { id, error: error.message });
      throw error;
    }
  }

  async updateUser(id, userData, token) {
    try {
      const response = await put(this.endpoints.usuarios.update(id), userData, token);
      logger.info('Usuario actualizado', { id, campos: Object.keys(userData) });
      return response;
    } catch (error) {
      logger.error('Error al actualizar usuario', { id, error: error.message });
      throw error;
    }
  }

  async changePassword(passwordData, token) {
    try {
      const response = await post(this.endpoints.usuarios.changePassword, passwordData, token);
      logger.info('Contraseña cambiada exitosamente');
      return response;
    } catch (error) {
      logger.error('Error al cambiar contraseña', { error: error.message });
      throw error;
    }
  }

  // Métodos de pedidos
  async getOrders(params = {}, token) {
    try {
      const response = await getPaginated(this.endpoints.pedidos.list, 
        params.page || 1, 
        params.limit || 10, 
        params, 
        token
      );
      return response;
    } catch (error) {
      logger.error('Error al obtener pedidos', { error: error.message });
      throw error;
    }
  }

  async createOrder(orderData, token) {
    try {
      const response = await post(this.endpoints.pedidos.create, orderData, token);
      logger.info('Pedido creado exitosamente', { 
        orderId: response.id,
        userId: orderData.usuario_id 
      });
      return response;
    } catch (error) {
      logger.error('Error al crear pedido', { error: error.message });
      throw error;
    }
  }

  async getOrderById(id, token) {
    try {
      const response = await get(this.endpoints.pedidos.getById(id), {}, token);
      return response;
    } catch (error) {
      logger.error('Error al obtener pedido', { id, error: error.message });
      throw error;
    }
  }

  async updateOrderStatus(id, statusData, token) {
    try {
      const response = await patch(this.endpoints.pedidos.updateStatus(id), statusData, token);
      logger.info('Estado de pedido actualizado', { 
        id, 
        nuevoEstado: statusData.estado 
      });
      return response;
    } catch (error) {
      logger.error('Error al actualizar estado de pedido', { id, error: error.message });
      throw error;
    }
  }

  async updateOrderQuote(id, quoteData, token) {
    try {
      const response = await patch(this.endpoints.pedidos.updateQuote(id), quoteData, token);
      logger.info('Cotización de pedido actualizada', { id });
      return response;
    } catch (error) {
      logger.error('Error al actualizar cotización', { id, error: error.message });
      throw error;
    }
  }

  async getOrdersByUser(userId, params = {}, token) {
    try {
      const response = await getPaginated(this.endpoints.pedidos.byUser(userId), 
        params.page || 1, 
        params.limit || 10, 
        params, 
        token
      );
      return response;
    } catch (error) {
      logger.error('Error al obtener pedidos del usuario', { userId, error: error.message });
      throw error;
    }
  }

  // Métodos del catálogo
  async getCatalog(params = {}, token = null) {
    try {
      const response = await getPaginated(this.endpoints.catalogo.list, 
        params.page || 1, 
        params.limit || 12, 
        params, 
        token
      );
      return response;
    } catch (error) {
      logger.error('Error al obtener catálogo', { error: error.message });
      throw error;
    }
  }

  async createProduct(productData, token) {
    try {
      const response = await post(this.endpoints.catalogo.create, productData, token);
      logger.info('Producto creado en catálogo', { 
        productId: response.id,
        nombre: productData.nombre 
      });
      return response;
    } catch (error) {
      logger.error('Error al crear producto', { error: error.message });
      throw error;
    }
  }

  async getProductById(id, token = null) {
    try {
      const response = await get(this.endpoints.catalogo.getById(id), {}, token);
      return response;
    } catch (error) {
      logger.error('Error al obtener producto', { id, error: error.message });
      throw error;
    }
  }

  async updateProduct(id, productData, token) {
    try {
      const response = await put(this.endpoints.catalogo.update(id), productData, token);
      logger.info('Producto actualizado', { id, campos: Object.keys(productData) });
      return response;
    } catch (error) {
      logger.error('Error al actualizar producto', { id, error: error.message });
      throw error;
    }
  }

  async deleteProduct(id, token) {
    try {
      const response = await del(this.endpoints.catalogo.delete(id), token);
      logger.info('Producto eliminado', { id });
      return response;
    } catch (error) {
      logger.error('Error al eliminar producto', { id, error: error.message });
      throw error;
    }
  }

  async getCatalogFilters(token = null) {
    try {
      const response = await get(this.endpoints.catalogo.filters, {}, token);
      return response;
    } catch (error) {
      logger.error('Error al obtener filtros del catálogo', { error: error.message });
      throw error;
    }
  }

  // Métodos de recomendaciones
  async generateRecommendation(recommendationData, token) {
    try {
      const response = await post(this.endpoints.recomendaciones.generate, recommendationData, token);
      logger.info('Recomendación generada', { 
        recommendationId: response.id,
        userId: recommendationData.usuario_id 
      });
      return response;
    } catch (error) {
      logger.error('Error al generar recomendación', { error: error.message });
      throw error;
    }
  }

  async getRecommendationsByUser(userId, params = {}, token) {
    try {
      const response = await getPaginated(this.endpoints.recomendaciones.byUser(userId), 
        params.page || 1, 
        params.limit || 10, 
        params, 
        token
      );
      return response;
    } catch (error) {
      logger.error('Error al obtener recomendaciones del usuario', { userId, error: error.message });
      throw error;
    }
  }

  async updateRecommendation(id, updateData, token) {
    try {
      const response = await put(this.endpoints.recomendaciones.update(id), updateData, token);
      logger.info('Recomendación actualizada', { id });
      return response;
    } catch (error) {
      logger.error('Error al actualizar recomendación', { id, error: error.message });
      throw error;
    }
  }

  // Métodos de notificaciones
  async getNotificationsByUser(userId, params = {}, token) {
    try {
      const response = await getPaginated(this.endpoints.notificaciones.byUser(userId), 
        params.page || 1, 
        params.limit || 20, 
        params, 
        token
      );
      return response;
    } catch (error) {
      logger.error('Error al obtener notificaciones del usuario', { userId, error: error.message });
      throw error;
    }
  }

  async markNotificationsAsRead(notificationIds, token) {
    try {
      const response = await post(this.endpoints.notificaciones.markRead, 
        { notification_ids: notificationIds }, 
        token
      );
      logger.info('Notificaciones marcadas como leídas', { 
        cantidad: notificationIds.length 
      });
      return response;
    } catch (error) {
      logger.error('Error al marcar notificaciones como leídas', { error: error.message });
      throw error;
    }
  }

  async sendNotification(notificationData, token) {
    try {
      const response = await post(this.endpoints.notificaciones.send, notificationData, token);
      logger.info('Notificación enviada', { 
        userId: notificationData.usuario_id,
        tipo: notificationData.tipo 
      });
      return response;
    } catch (error) {
      logger.error('Error al enviar notificación', { error: error.message });
      throw error;
    }
  }

  async getNotificationPreferences(token) {
    try {
      const response = await get(this.endpoints.notificaciones.preferences, {}, token);
      return response;
    } catch (error) {
      logger.error('Error al obtener preferencias de notificaciones', { error: error.message });
      throw error;
    }
  }

  async updateNotificationPreferences(preferences, token) {
    try {
      const response = await put(this.endpoints.notificaciones.preferences, preferences, token);
      logger.info('Preferencias de notificaciones actualizadas');
      return response;
    } catch (error) {
      logger.error('Error al actualizar preferencias de notificaciones', { error: error.message });
      throw error;
    }
  }

  // Métodos para recuperación de contraseña
  async getUserByEmail(email) {
    try {
      const response = await post(this.endpoints.usuarios.getByEmail, { email });
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Usuario no encontrado
      }
      logger.error('Error al buscar usuario por email', { email, error: error.message });
      throw error;
    }
  }

  async savePasswordResetToken(userId, token, expiresAt) {
    try {
      const response = await post(this.endpoints.usuarios.saveResetToken, {
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString()
      });
      logger.info('Token de recuperación guardado', { userId });
      return response;
    } catch (error) {
      logger.error('Error al guardar token de recuperación', { userId, error: error.message });
      throw error;
    }
  }

  async verifyPasswordResetToken(token) {
    try {
      const response = await post(this.endpoints.usuarios.verifyResetToken, { token });
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Token no encontrado o expirado
      }
      logger.error('Error al verificar token de recuperación', { token, error: error.message });
      throw error;
    }
  }

  async updatePassword(userId, newPassword) {
    try {
      const response = await post(this.endpoints.usuarios.updatePassword, {
        user_id: userId,
        password: newPassword
      });
      logger.info('Contraseña actualizada exitosamente', { userId });
      return response;
    } catch (error) {
      logger.error('Error al actualizar contraseña', { userId, error: error.message });
      throw error;
    }
  }

  async deletePasswordResetToken(token) {
    try {
      const response = await post(this.endpoints.usuarios.deleteResetToken, { token });
      logger.info('Token de recuperación eliminado');
      return response;
    } catch (error) {
      logger.error('Error al eliminar token de recuperación', { token, error: error.message });
      throw error;
    }
  }
}

module.exports = new XanoService();