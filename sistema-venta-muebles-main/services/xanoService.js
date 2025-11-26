const { get, post, put, del, patch, getPaginated, authGet, authPost } = require('../config/database');
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
      // Variantes alternativas en singular (algunos workspaces de Xano usan nombres de tabla)
      pedidoAlt: {
        list: '/pedido',
        create: '/pedido',
        getById: (id) => `/pedido/${id}`,
        update: (id) => `/pedido/${id}`,
        delete: (id) => `/pedido/${id}`,
        updateStatus: (id) => `/pedido/${id}/status`,
        updateQuote: (id) => `/pedido/${id}/quote`,
        byUser: (userId) => `/pedido/user/${userId}`
      },

      // Endpoints de detalles de pedido (compatibles con dos convenciones)
      detallesPedido: {
        create: '/detalle_pedido',
        createAlt: '/detalles_pedido',
        getById: (id) => `/detalle_pedido/${id}`,
        getByIdAlt: (id) => `/detalles_pedido/${id}`,
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
  }

  // Métodos de autenticación
  async login(credentials) {
    try {
      const loginResponse = await authPost(this.endpoints.auth.login, credentials);
      logger.info('Usuario autenticado exitosamente', { 
        email: credentials.email 
      });
      
      // Obtener información completa del usuario usando el token
      const userInfo = await this.me(loginResponse.authToken);
      
      // Combinar la respuesta del login con la información del usuario
      const completeResponse = {
        authToken: loginResponse.authToken,
        user: userInfo
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

  async register(userData) {
    try {
      // Mapear los campos al formato que espera Xano
      const xanoData = {
        name: userData.nombre,
        email: userData.email,
        password: userData.password
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
          nombre: userInfo.name,
          email: userInfo.email,
          telefono: userData.telefono || null,
          rol: 'cliente',
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
      const isNotFound = (error.response?.status === 404) || /Unable to locate request/i.test(error.message || '');
      if (isNotFound) {
        try {
          const altResponse = await getPaginated(this.endpoints.pedidoAlt.list,
            params.page || 1,
            params.limit || 10,
            params,
            token
          );
          return altResponse;
        } catch (altErr) {
          // Devolver vacío si tampoco existe la variante singular
          const page = params.page || 1;
          const limit = params.limit || 10;
          const notFound = (altErr.response?.status === 404) || /Unable to locate request|Endpoint/i.test(altErr.message || '');
          if (notFound) {
            logger.warn('Endpoints de pedidos no disponibles en Xano; devolviendo vacío');
            return {
              data: [],
              pagination: {
                page,
                per_page: limit,
                total: 0,
                pages: 0
              }
            };
          }
          logger.error('Error en fallback al obtener pedidos', { error: altErr.message });
          throw altErr;
        }
      }
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
      // Si el endpoint plural no existe, intentar la variante singular.
      const status = error?.response?.status;
      if (status === 404) {
        try {
          const responseAlt = await post(this.endpoints.pedidoAlt.create, orderData, token);
          logger.info('Pedido creado exitosamente (endpoint alternativo)', { 
            orderId: responseAlt.id,
            userId: orderData.usuario_id 
          });
          return responseAlt;
        } catch (errorAlt) {
          // Intentar en el grupo de AUTH por si los endpoints viven allí
          try {
            const responseAuthAlt = await authPost(this.endpoints.pedidoAlt.create, orderData, token);
            logger.info('Pedido creado exitosamente (grupo auth, endpoint singular)', { 
              orderId: responseAuthAlt.id,
              userId: orderData.usuario_id 
            });
            return responseAuthAlt;
          } catch (errorAuthAlt) {
            try {
              const responseAuthPlural = await authPost(this.endpoints.pedidos.create, orderData, token);
              logger.info('Pedido creado exitosamente (grupo auth, endpoint plural)', { 
                orderId: responseAuthPlural.id,
                userId: orderData.usuario_id 
              });
              return responseAuthPlural;
            } catch (errorAuthPlural) {
              logger.error('Error al crear pedido (todas las variantes)', { 
                errorPluralMain: error?.message, 
                errorSingularMain: errorAlt?.message, 
                errorSingularAuth: errorAuthAlt?.message,
                errorPluralAuth: errorAuthPlural?.message
              });
              throw errorAuthPlural;
            }
          }
        }
      }
      logger.error('Error al crear pedido', { error: error.message });
      throw error;
    }
  }

  // Crear detalle del pedido (cotización por ítem)
  async createOrderDetail(detailData, token) {
    try {
      // Intento principal
      const created = await post(this.endpoints.detallesPedido.create, detailData, token);
      logger.info('Detalle de pedido creado', { detalleId: created.id, pedidoId: detailData.pedido_id });
      return created;
    } catch (error) {
      // Si el endpoint principal no existe en Xano, probar alternativa en plural
      const status = error?.response?.status;
      if (status === 404) {
        try {
          const createdAlt = await post(this.endpoints.detallesPedido.createAlt, detailData, token);
          logger.info('Detalle de pedido creado (endpoint alternativo)', { detalleId: createdAlt.id, pedidoId: detailData.pedido_id });
          return createdAlt;
        } catch (errorAlt) {
          // Probar en grupo auth
          try {
            const createdAuth = await authPost(this.endpoints.detallesPedido.create, detailData, token);
            logger.info('Detalle de pedido creado (grupo auth, singular)', { detalleId: createdAuth.id, pedidoId: detailData.pedido_id });
            return createdAuth;
          } catch (errorAuthSingular) {
            try {
              const createdAuthAlt = await authPost(this.endpoints.detallesPedido.createAlt, detailData, token);
              logger.info('Detalle de pedido creado (grupo auth, plural)', { detalleId: createdAuthAlt.id, pedidoId: detailData.pedido_id });
              return createdAuthAlt;
            } catch (errorAuthPlural) {
              logger.error('Error al crear detalle (todas las variantes)', { 
                errorSingularMain: error?.message, 
                errorPluralMain: errorAlt?.message,
                errorSingularAuth: errorAuthSingular?.message,
                errorPluralAuth: errorAuthPlural?.message
              });
              throw errorAuthPlural;
            }
          }
        }
      }
      logger.error('Error al crear detalle', { error: error.message });
      throw error;
    }
  }

  async getOrderById(id, token) {
    try {
      // Intento principal: endpoint plural
      const response = await get(this.endpoints.pedidos.getById(id), {}, token);
      return response;
    } catch (error) {
      const isNotFound = (error.response?.status === 404) || /Unable to locate request/i.test(error.message || '');
      if (isNotFound) {
        try {
          // Fallback: endpoint singular
          const altResponse = await get(this.endpoints.pedidoAlt.getById(id), {}, token);
          return altResponse;
        } catch (altErr) {
          logger.error('Error en fallback de obtener pedido (singular)', { id, error: altErr.message });
          throw altErr;
        }
      }
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
      // Intento principal: endpoint plural
      const response = await getPaginated(this.endpoints.pedidos.byUser(userId),
        params.page || 1,
        params.limit || 10,
        params,
        token
      );
      return response;
    } catch (error) {
      // Fallbacks si el workspace usa convenciones distintas en Xano
      const isNotFound = (error.response?.status === 404) || /Unable to locate request/i.test(error.message || '');
      if (isNotFound) {
        try {
          // Intento alternativo: endpoint singular
          const altResponse = await getPaginated(this.endpoints.pedidoAlt.byUser(userId),
            params.page || 1,
            params.limit || 10,
            params,
            token
          );
          return altResponse;
        } catch (altErr) {
          // Último fallback: listar y filtrar por usuario_id
          try {
            const finalParams = { ...params, usuario_id: userId };
            const listResponse = await getPaginated(this.endpoints.pedidos.list,
              finalParams.page || 1,
              finalParams.limit || 10,
              finalParams,
              token
            );
            return listResponse;
          } catch (listErr) {
            // Si ningún endpoint existe, devolvemos lista vacía para no romper la UX
            const page = params.page || 1;
            const limit = params.limit || 10;
            const notFound = (listErr.response?.status === 404) || /Unable to locate request|Endpoint/i.test(listErr.message || '');
            if (notFound) {
              logger.warn('Endpoints de pedidos por usuario no disponibles en Xano; devolviendo vacío', { userId });
              return {
                data: [],
                pagination: {
                  page,
                  per_page: limit,
                  total: 0,
                  pages: 0
                }
              };
            }
            logger.error('Fallaron los fallbacks al obtener pedidos del usuario', { 
              userId, 
              error: listErr.message 
            });
            throw listErr;
          }
        }
      }
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