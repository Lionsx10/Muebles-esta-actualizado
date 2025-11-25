<template>
  <footer class="bg-gray-900 text-white">
    <div class="container-custom py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Información de la empresa -->
        <div class="space-y-4">
          <div>
            <!-- Logo completo de COMERCIAL HG -->
            <img 
              src="@/assets/logo-comercial-hg.svg" 
              alt="Comercial HG - Muebles De Baño y Cocina A Medidas" 
              class="h-16 w-auto mx-auto"
            />
          </div>
          <p class="text-gray-300 text-sm leading-relaxed">
            Creamos muebles únicos y personalizados con la mejor calidad y diseño. 
            Nuestra IA te ayuda a encontrar el mueble perfecto para tu espacio.
          </p>
          <div class="flex space-x-4">
            <a href="https://www.instagram.com/comercial.hg?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition-colors" title="Síguenos en Instagram">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Enlaces rápidos -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Enlaces Rápidos</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/catalogo" class="footer-link">
                Catálogo
              </router-link>
            </li>
            <li>
              <router-link to="/recomendaciones" class="footer-link">
                Recomendaciones IA
              </router-link>
            </li>
            <li>
              <router-link to="/sobre-nosotros" class="footer-link">
                Sobre Nosotros
              </router-link>
            </li>
            <li>
              <router-link to="/como-funciona" class="footer-link">
                Cómo Funciona
              </router-link>
            </li>
            <li>
              <router-link to="/testimonios" class="footer-link">
                Testimonios
              </router-link>
            </li>
            <li>
              <router-link to="/blog" class="footer-link">
                Blog
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Categorías -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Categorías</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/catalogo?categoria=bano" class="footer-link">
                Muebles de Baño
              </router-link>
            </li>
            <li>
              <router-link to="/catalogo?categoria=cocina" class="footer-link">
                Muebles de Cocina
              </router-link>
            </li>
            <li>
              <router-link to="/catalogo?categoria=closets" class="footer-link">
                Closets
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contacto y soporte -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Contacto</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-gray-300 text-sm">
                Franklin 565, Santiago centro, Santiago, Chile
              </span>
            </div>
            
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-gray-300 text-sm">
                +56998163536
              </span>
            </div>
            
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-gray-300 text-sm">
                contacto@comercialhg.com
              </span>
            </div>
            
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-gray-300 text-sm">
                Lun - Vie: 9:00 AM - 6:00 PM
              </span>
            </div>
          </div>

          <div class="pt-4">
            <h4 class="text-sm font-semibold mb-2">Soporte</h4>
            <ul class="space-y-1">
              <li>
                <router-link to="/ayuda" class="footer-link text-sm">
                  Centro de Ayuda
                </router-link>
              </li>
              <li>
                <router-link to="/contacto" class="footer-link text-sm">
                  Contactar Soporte
                </router-link>
              </li>
              <li>
                <router-link to="/faq" class="footer-link text-sm">
                  Preguntas Frecuentes
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Newsletter -->
      <div class="mt-12 pt-8 border-t border-gray-800">
        <div class="max-w-md mx-auto text-center">
          <h3 class="text-lg font-semibold mb-2">Mantente Actualizado</h3>
          <p class="text-gray-300 text-sm mb-4">
            Recibe las últimas novedades, ofertas especiales y consejos de decoración.
          </p>
          <form @submit.prevent="subscribeNewsletter" class="flex space-x-2">
            <input
              v-model="newsletterEmail"
              type="email"
              placeholder="Tu email"
              class="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              :disabled="isSubscribing"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
            >
              <span v-if="!isSubscribing">Suscribirse</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suscribiendo...
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Línea inferior -->
    <div class="border-t border-gray-800">
      <div class="container-custom py-6">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div class="text-gray-400 text-sm">
            © {{ currentYear }} Comercial HG. Todos los derechos reservados.
          </div>
          
          <div class="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
            <router-link to="/privacidad" class="footer-link">
              Política de Privacidad
            </router-link>
            <router-link to="/terminos" class="footer-link">
              Términos de Servicio
            </router-link>
            <router-link to="/cookies" class="footer-link">
              Política de Cookies
            </router-link>
            <router-link to="/sitemap" class="footer-link">
              Mapa del Sitio
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'

const toast = useToast()

// Estado
const newsletterEmail = ref('')
const isSubscribing = ref(false)

// Computed
const currentYear = computed(() => new Date().getFullYear())

// Suscribirse al newsletter
const subscribeNewsletter = async () => {
  if (!newsletterEmail.value) return

  isSubscribing.value = true

  try {
    await api.post('/newsletter/suscribir', {
      email: newsletterEmail.value
    })

    toast.success('¡Te has suscrito exitosamente al newsletter!')
    newsletterEmail.value = ''
  } catch (error) {
    console.error('Error suscribiendo al newsletter:', error)
    
    if (error.response?.status === 409) {
      toast.warning('Este email ya está suscrito al newsletter')
    } else {
      toast.error('Error al suscribirse al newsletter')
    }
  } finally {
    isSubscribing.value = false
  }
}
</script>

<style scoped>
.footer-link {
  @apply text-gray-300 hover:text-white transition-colors;
}
</style>