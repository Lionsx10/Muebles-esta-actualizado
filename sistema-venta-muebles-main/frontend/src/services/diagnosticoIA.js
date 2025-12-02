// ============================================================================
// SERVICIO DE DIAGNÓSTICO DE IA
// ============================================================================
// Este archivo contiene funciones para diagnosticar problemas con la API de IA

<<<<<<< HEAD
import api from './api'
=======
import api from './api';
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

/**
 * Ejecuta diagnóstico completo de la conexión con Hugging Face
 * @returns {Promise<Object>} - Resultado del diagnóstico
 */
export const ejecutarDiagnostico = async () => {
  try {
<<<<<<< HEAD
    console.log('Ejecutando diagnóstico de IA...')

    const response = await api.get('/analisis-espacio/diagnostico')

    console.log('Diagnóstico completado:', response.data)

    return response.data
  } catch (error) {
    console.error('Error en diagnóstico:', error)
    throw error
  }
}
=======
    console.log('Ejecutando diagnóstico de IA...');
    
    const response = await api.get('/analisis-espacio/diagnostico');
    
    console.log('Diagnóstico completado:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error en diagnóstico:', error);
    throw error;
  }
};
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

/**
 * Ejecuta prueba simple de IA
 * @returns {Promise<Object>} - Resultado de la prueba
 */
export const probarIA = async () => {
  try {
<<<<<<< HEAD
    console.log('Ejecutando prueba simple de IA...')

    const response = await api.post('/analisis-espacio/test-ia', {})

    console.log('Prueba de IA completada:', response.data)

    return response.data
  } catch (error) {
    console.error('Error en prueba de IA:', error)
    throw error
  }
}
=======
    console.log('Ejecutando prueba simple de IA...');
    
    const response = await api.post('/analisis-espacio/test-ia', {});
    
    console.log('Prueba de IA completada:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error en prueba de IA:', error);
    throw error;
  }
};
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

/**
 * Formatea los resultados del diagnóstico para mostrar
 * @param {Object} diagnostico - Resultado del diagnóstico
 * @returns {Object} - Diagnóstico formateado
 */
<<<<<<< HEAD
export const formatearDiagnostico = diagnostico => {
=======
export const formatearDiagnostico = (diagnostico) => {
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  if (!diagnostico || !diagnostico.data) {
    return {
      estado: 'ERROR',
      mensaje: 'No se pudo obtener información de diagnóstico',
<<<<<<< HEAD
      tests: [],
    }
  }

  const { tests, summary } = diagnostico.data

=======
      tests: []
    };
  }

  const { tests, summary } = diagnostico.data;
  
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
  return {
    estado: summary.failed === 0 ? 'EXITOSO' : 'CON_ERRORES',
    mensaje: `${summary.passed}/${summary.total} pruebas exitosas`,
    timestamp: diagnostico.data.timestamp,
    tests: tests.map(test => ({
      nombre: test.name,
      estado: test.status,
      detalles: test.details || test.error || 'Sin detalles',
<<<<<<< HEAD
      esError: test.status === 'FAILED',
    })),
  }
}
=======
      esError: test.status === 'FAILED'
    }))
  };
};
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7

export default {
  ejecutarDiagnostico,
  probarIA,
<<<<<<< HEAD
  formatearDiagnostico,
}
=======
  formatearDiagnostico
};
>>>>>>> 508193cb28cf58f1a9fb6186e192976b60efe9a7
