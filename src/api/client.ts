import axios from 'axios'

const BASE_URLS = {
  equipos: import.meta.env.VITE_EQUIPOS_URL,
  clientes: import.meta.env.VITE_CLIENTES_URL,
  alertas: import.meta.env.VITE_ALERTAS_URL,
  mantenimiento: import.meta.env.VITE_MANTENIMIENTO_URL,
}

export const equiposApi = axios.create({ baseURL: BASE_URLS.equipos })
export const clientesApi = axios.create({ baseURL: BASE_URLS.clientes })
export const alertasApi = axios.create({ baseURL: BASE_URLS.alertas })
export const mantenimientoApi = axios.create({ baseURL: BASE_URLS.mantenimiento })

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
