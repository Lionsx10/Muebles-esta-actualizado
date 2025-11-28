// Importaciones necesarias para la configuración de Vite
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Configuración de Vite para el proyecto Vue.js
// https://vitejs.dev/config/
export default defineConfig({
  // Plugins utilizados en el proyecto
  plugins: [vue()], // Plugin oficial de Vue.js para Vite
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Configuración de resolución de módulos
  resolve: {
    alias: {
      // Alias '@' apunta a la carpeta src para imports más limpios
<<<<<<< HEAD
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

=======
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Configuración del servidor de desarrollo
  server: {
    port: 8080, // Puerto donde se ejecuta el servidor de desarrollo
    proxy: {
      // Proxy para redirigir llamadas API al backend
      '/api': {
<<<<<<< HEAD
        target: 'http://localhost:3000', // URL del servidor backend
        changeOrigin: true, // Cambia el origen de la petición
        secure: false, // Permite conexiones no seguras (desarrollo)
      },
    },
  },

  // Configuración de build para producción
  build: {
    outDir: 'dist', // Directorio de salida para archivos compilados
    sourcemap: true, // Genera sourcemaps para debugging en producción
  },
})
=======
        target: 'http://localhost:3001',  // URL del servidor backend
        changeOrigin: true,               // Cambia el origen de la petición
        secure: false                     // Permite conexiones no seguras (desarrollo)
      }
    }
  },
  
  // Configuración de build para producción
  build: {
    outDir: 'dist',    // Directorio de salida para archivos compilados
    sourcemap: true    // Genera sourcemaps para debugging en producción
  }
})
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
