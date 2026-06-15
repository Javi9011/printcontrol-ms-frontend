import axios from 'axios'

const BASE_URLS = {
  equipos: 'http://localhost:8001/api/v1',
  clientes: 'http://localhost:8002/api/v1',
  alertas: 'http://localhost:8003/api/v1',
  mantenimiento: 'http://localhost:8004/api/v1',
}

export const equiposApi = axios.create({ baseURL: BASE_URLS.equipos })
export const clientesApi = axios.create({ baseURL: BASE_URLS.clientes })
export const alertasApi = axios.create({ baseURL: BASE_URLS.alertas })
export const mantenimientoApi = axios.create({ baseURL: BASE_URLS.mantenimiento })

// Interceptor de errores global
const addErrorInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error('API Error:', err.response?.data || err.message)
      return Promise.reject(err)
    }
  )
}

addErrorInterceptor(equiposApi)
addErrorInterceptor(clientesApi)
addErrorInterceptor(alertasApi)
addErrorInterceptor(mantenimientoApi)
