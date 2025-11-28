import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  // Estado
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const loadingCount = ref(0)
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  // Acciones
  const startLoading = (message = 'Cargando...') => {
    loadingCount.value++
    loadingMessage.value = message
    isLoading.value = true
  }
<<<<<<< HEAD

  const stopLoading = () => {
    loadingCount.value = Math.max(0, loadingCount.value - 1)

=======
  
  const stopLoading = () => {
    loadingCount.value = Math.max(0, loadingCount.value - 1)
    
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
    if (loadingCount.value === 0) {
      isLoading.value = false
      loadingMessage.value = ''
    }
  }
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  const forceStopLoading = () => {
    loadingCount.value = 0
    isLoading.value = false
    loadingMessage.value = ''
  }
<<<<<<< HEAD

=======
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  return {
    // Estado
    isLoading,
    loadingMessage,
    loadingCount,
<<<<<<< HEAD

    // Acciones
    startLoading,
    stopLoading,
    forceStopLoading,
  }
})
=======
    
    // Acciones
    startLoading,
    stopLoading,
    forceStopLoading
  }
})
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
