import { equiposApi, clientesApi, alertasApi, mantenimientoApi } from './client'
import type {
  Equipo, ResumenEquipos, LecturaContador, Toner,
  Cliente, Contrato, Arrendamiento, ResumenClientes,
  Alerta, ResumenAlertas,
  Tecnico, OrdenTrabajo, MantenimientoProgramado, ResumenMantenimiento,
  PaginatedResponse,
} from '../types'

// ─── EQUIPOS ──────────────────────────────────────────────────────────────────
export const equiposService = {
  listar: () => equiposApi.get<PaginatedResponse<Equipo>>('/equipos/').then(r => r.data),
  obtener: (id: number) => equiposApi.get<Equipo>(`/equipos/${id}/`).then(r => r.data),
  crear: (data: Partial<Equipo>) => equiposApi.post<Equipo>('/equipos/', data).then(r => r.data),
  actualizar: (id: number, data: Partial<Equipo>) => equiposApi.patch<Equipo>(`/equipos/${id}/`, data).then(r => r.data),
  eliminar: (id: number) => equiposApi.delete(`/equipos/${id}/`),
  resumen: () => equiposApi.get<ResumenEquipos>('/equipos/resumen/').then(r => r.data),
  alertasToner: () => equiposApi.get('/equipos/alertas-toner/').then(r => r.data),
  historialLecturas: (id: number) => equiposApi.get<LecturaContador[]>(`/equipos/${id}/historial-lecturas/`).then(r => r.data),
  registrarLectura: (id: number, data: {
    fecha: string
    contador: number
    notas?: string
    registrado_por?: string
    toners?: { canal: string; paginas_restantes: number }[]
  }) => equiposApi.post<LecturaContador>(`/equipos/${id}/lecturas/`, data).then(r => r.data),
  toners: (id: number) => equiposApi.get<Toner[]>(`/equipos/${id}/toners/`).then(r => r.data),
  cambiarToner: (tonerId: number, data: { fecha: string; notas?: string; realizado_por?: string }) =>
    equiposApi.post<Toner>(`/toners/${tonerId}/cambiar/`, data).then(r => r.data),
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
export const clientesService = {
  listar: () => clientesApi.get<PaginatedResponse<Cliente>>('/clientes/').then(r => r.data),
  obtener: (id: number) => clientesApi.get<Cliente>(`/clientes/${id}/`).then(r => r.data),
  crear: (data: Partial<Cliente>) => clientesApi.post<Cliente>('/clientes/', data).then(r => r.data),
  actualizar: (id: number, data: Partial<Cliente>) => clientesApi.patch<Cliente>(`/clientes/${id}/`, data).then(r => r.data),
  eliminar: (id: number) => clientesApi.delete(`/clientes/${id}/`),
}

// ─── CONTRATOS ────────────────────────────────────────────────────────────────
export const contratosService = {
  listar: () => clientesApi.get<PaginatedResponse<Contrato>>('/contratos/').then(r => r.data),
  obtener: (id: number) => clientesApi.get<Contrato>(`/contratos/${id}/`).then(r => r.data),
  crear: (data: Partial<Contrato>) => clientesApi.post<Contrato>('/contratos/', data).then(r => r.data),
  actualizar: (id: number, data: Partial<Contrato>) => clientesApi.patch<Contrato>(`/contratos/${id}/`, data).then(r => r.data),
  eliminar: (id: number) => clientesApi.delete(`/contratos/${id}/`),
  resumen: () => clientesApi.get<ResumenClientes>('/contratos/resumen/').then(r => r.data),
  porVencer: () => clientesApi.get<Contrato[]>('/contratos/por-vencer/').then(r => r.data),
  porCliente: (clienteId: number) => clientesApi.get<Contrato[]>(`/contratos/cliente/${clienteId}/`).then(r => r.data),
}

// ─── ALERTAS ──────────────────────────────────────────────────────────────────
export const alertasService = {
  listar: () => alertasApi.get<PaginatedResponse<Alerta>>('/alertas/').then(r => r.data),
  activas: () => alertasApi.get<Alerta[]>('/alertas/activas/').then(r => r.data),
  resumen: () => alertasApi.get<ResumenAlertas>('/alertas/resumen/').then(r => r.data),
  resolver: (id: number, data: { nota_resolucion?: string; resuelta_por?: string }) =>
    alertasApi.post<Alerta>(`/alertas/${id}/resolver/`, data).then(r => r.data),
  ignorar: (id: number) => alertasApi.post<Alerta>(`/alertas/${id}/ignorar/`).then(r => r.data),
  ejecutarMotor: () => alertasApi.post('/alertas/ejecutar-motor/').then(r => r.data),
}

// ─── MANTENIMIENTO ────────────────────────────────────────────────────────────
export const tecnicosService = {
  listar: () => mantenimientoApi.get<TecnicoPaginado>('/tecnicos/').then(r => r.data),
  crear: (data: Partial<Tecnico>) => mantenimientoApi.post<Tecnico>('/tecnicos/', data).then(r => r.data),
}

type TecnicoPaginado = PaginatedResponse<Tecnico>

export const ordenesService = {
  listar: () => mantenimientoApi.get<PaginatedResponse<OrdenTrabajo>>('/ordenes/').then(r => r.data),
  obtener: (id: number) => mantenimientoApi.get<OrdenTrabajo>(`/ordenes/${id}/`).then(r => r.data),
  crear: (data: Partial<OrdenTrabajo>) => mantenimientoApi.post<OrdenTrabajo>('/ordenes/', data).then(r => r.data),
  actualizar: (id: number, data: Partial<OrdenTrabajo>) => mantenimientoApi.patch<OrdenTrabajo>(`/ordenes/${id}/`, data).then(r => r.data),
  iniciar: (id: number) => mantenimientoApi.post<OrdenTrabajo>(`/ordenes/${id}/iniciar/`).then(r => r.data),
  completar: (id: number, data: { solucion_aplicada?: string; contador_al_servicio?: number; costo?: number }) =>
    mantenimientoApi.post<OrdenTrabajo>(`/ordenes/${id}/completar/`, data).then(r => r.data),
  porEquipo: (equipoId: number) => mantenimientoApi.get<OrdenTrabajo[]>(`/ordenes/equipo/${equipoId}/`).then(r => r.data),
  resumen: () => mantenimientoApi.get<ResumenMantenimiento>('/ordenes/resumen/').then(r => r.data),
}

export const programadosService = {
  listar: () => mantenimientoApi.get<PaginatedResponse<MantenimientoProgramado>>('/programados/').then(r => r.data),
  crear: (data: Partial<MantenimientoProgramado>) => mantenimientoApi.post<MantenimientoProgramado>('/programados/', data).then(r => r.data),
  proximos: () => mantenimientoApi.get<MantenimientoProgramado[]>('/programados/proximos/').then(r => r.data),
  generarOrden: (id: number) => mantenimientoApi.post<OrdenTrabajo>(`/programados/${id}/generar-orden/`).then(r => r.data),
}
