// ─── EQUIPOS ──────────────────────────────────────────────────────────────────

export interface Toner {
  id: number
  canal: 'K' | 'C' | 'M' | 'Y'
  canal_display: string
  capacidad_paginas: number
  paginas_restantes: number
  umbral_alerta_pct: number
  porcentaje_restante: number
  requiere_cambio: boolean
  nivel: 'OK' | 'BAJO' | 'CRITICO'
  actualizado_en: string
}

export interface LecturaContador {
  id: number
  equipo: number
  fecha: string
  contador: number
  ciclos_desde_anterior: number | null
  excede_cuota: boolean
  notas: string
  registrado_por: string
  creado_en: string
}

export interface Equipo {
  id: number
  nombre: string
  marca: string
  modelo: string
  numero_serie: string
  tipo: 'MONO' | 'COLOR'
  tipo_display: string
  estado: 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO'
  estado_display: string
  cliente_id: number | null
  contrato_id: number | null
  ubicacion: string
  cuota_mensual: number
  contador_inicial: number
  fecha_instalacion: string | null
  toners: Toner[]
  ultima_lectura: LecturaContador | null
  ciclos_ultimo_mes: number | null
  alertas_toner: { canal: string; canal_display: string; nivel: string; porcentaje_restante: number }[]
  creado_en: string
  actualizado_en: string
}

export interface ResumenEquipos {
  total_equipos: number
  equipos_activos: number
  alertas_toner: number
  alertas_criticas: number
  equipos_con_cuota_excedida: number
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

export interface Contacto {
  id: number
  nombre: string
  cargo: string
  email: string
  telefono: string
}

export interface Cliente {
  id: number
  tipo_persona: 'FISICA' | 'MORAL'
  tipo_persona_display: string
  nombre: string
  rfc: string | null
  razon_social: string
  contacto_nombre: string
  contacto_email: string
  contacto_telefono: string
  calle: string
  ciudad: string
  estado: string
  codigo_postal: string
  pais: string
  estado_cuenta: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
  estado_cuenta_display: string
  contratos_activos: number
  total_equipos: number
  contactos: Contacto[]
  notas: string
  creado_en: string
  actualizado_en: string
}

export interface Arrendamiento {
  id: number
  contrato: number
  equipo_id: number
  equipo_nombre: string
  equipo_serial: string
  estado: 'ACTIVO' | 'DEVUELTO' | 'SUSPENDIDO'
  estado_display: string
  fecha_entrega: string | null
  fecha_devolucion: string | null
  cuota_mensual_ciclos: number
  ubicacion: string
  notas: string
  creado_en: string
  actualizado_en: string
}

export interface Contrato {
  id: number
  numero_contrato: string
  cliente: number
  cliente_nombre: string
  cliente_rfc: string
  fecha_inicio: string
  fecha_fin: string
  estado: 'ACTIVO' | 'VENCIDO' | 'CANCELADO' | 'RENOVACION'
  estado_display: string
  esta_vigente: boolean
  periodo_facturacion: 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL'
  periodo_facturacion_display: string
  precio_base: string
  precio_copia_excedente: string
  incluye_mantenimiento: boolean
  incluye_toner: boolean
  total_equipos: number
  arrendamientos: Arrendamiento[]
  referencia_documento: string
  notas: string
  creado_en: string
  actualizado_en: string
}

export interface ResumenClientes {
  total_clientes: number
  clientes_activos: number
  total_contratos: number
  contratos_activos: number
  contratos_por_vencer: number
  total_equipos_arrendados: number
}

// ─── ALERTAS ──────────────────────────────────────────────────────────────────

export type TipoAlerta =
  | 'TONER_BAJO'
  | 'TONER_CRITICO'
  | 'CUOTA_EXCEDIDA'
  | 'CONTRATO_POR_VENCER'
  | 'CONTRATO_VENCIDO'

export type NivelAlerta = 'INFO' | 'WARNING' | 'CRITICAL'
export type EstadoAlerta = 'ACTIVA' | 'RESUELTA' | 'IGNORADA'

export interface Alerta {
  id: number
  tipo: TipoAlerta
  tipo_display: string
  nivel: NivelAlerta
  nivel_display: string
  estado: EstadoAlerta
  estado_display: string
  equipo_id: number | null
  equipo_nombre: string
  equipo_serial: string
  cliente_id: number | null
  cliente_nombre: string
  contrato_id: number | null
  contrato_numero: string
  mensaje: string
  datos_extra: Record<string, unknown>
  resuelta_en: string | null
  resuelta_por: string
  nota_resolucion: string
  creado_en: string
  actualizado_en: string
}

export interface ResumenAlertas {
  total_activas: number
  criticas: number
  advertencias: number
  toner_bajo: number
  toner_critico: number
  cuota_excedida: number
  contrato_por_vencer: number
  resueltas_hoy: number
}

// ─── MANTENIMIENTO ────────────────────────────────────────────────────────────

export interface Tecnico {
  id: number
  nombre: string
  tipo: 'INTERNO' | 'EXTERNO'
  tipo_display: string
  empresa: string
  telefono: string
  email: string
  especialidad: string
  activo: boolean
  creado_en: string
}

export interface PiezaReemplazada {
  id: number
  orden: number
  nombre_pieza: string
  numero_parte: string
  marca_pieza: string
  cantidad: number
  costo_unitario: string
  costo_total: string
  notas: string
}

export interface OrdenTrabajo {
  id: number
  numero_orden: string
  tipo: 'PREVENTIVO' | 'CORRECTIVO' | 'INSTALACION' | 'RETIRO' | 'REVISION'
  tipo_display: string
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA' | 'REPROGRAMADA'
  estado_display: string
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  prioridad_display: string
  equipo_id: number
  equipo_nombre: string
  equipo_serial: string
  cliente_id: number | null
  cliente_nombre: string
  ubicacion: string
  tecnico: number | null
  tecnico_nombre: string
  descripcion: string
  diagnostico: string
  solucion_aplicada: string
  fecha_programada: string
  fecha_inicio: string | null
  fecha_fin: string | null
  contador_al_servicio: number | null
  duracion_minutos: number | null
  costo: string
  piezas: PiezaReemplazada[]
  notas_internas: string
  creado_por: string
  creado_en: string
  actualizado_en: string
}

export interface MantenimientoProgramado {
  id: number
  equipo_id: number
  equipo_nombre: string
  equipo_serial: string
  cliente_id: number | null
  cliente_nombre: string
  nombre: string
  descripcion: string
  frecuencia_meses: number
  tecnico: number | null
  tecnico_nombre: string
  estado: 'ACTIVO' | 'PAUSADO' | 'COMPLETADO' | 'CANCELADO'
  estado_display: string
  fecha_inicio_programa: string
  fecha_ultimo_mantenimiento: string | null
  fecha_proximo_mantenimiento: string | null
  dias_anticipacion: number
  dias_para_proximo: number | null
  requiere_atencion: boolean
  notas: string
  creado_en: string
  actualizado_en: string
}

export interface ResumenMantenimiento {
  ordenes_pendientes: number
  ordenes_en_proceso: number
  ordenes_completadas_mes: number
  programados_proximos: number
  programados_vencidos: number
  tecnicos_activos: number
}

// ─── PAGINACIÓN ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
