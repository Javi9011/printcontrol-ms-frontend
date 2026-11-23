import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Printer, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { equiposService, clientesService, contratosService } from '../api'
import { Card, Badge, Button, Loading, Empty, Input, Select, SectionHeader } from '../components/ui'
import type { Equipo } from '../types'
import dayjs from 'dayjs'

function EstadoBadge({ estado }: { estado: string }) {
  if (estado === 'ACTIVO') return <Badge variant="success">Activo</Badge>
  if (estado === 'INACTIVO') return <Badge variant="gray">Inactivo</Badge>
  return <Badge variant="warning">Mantenimiento</Badge>
}

function EquipoCard({ eq, onLectura }: { eq: Equipo; onLectura: (eq: Equipo) => void }) {
  const [expanded, setExpanded] = useState(false)
 
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
          <Printer size={18} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-medium text-sm text-gray-900">{eq.nombre}</p>
              <p className="text-xs text-gray-500">{eq.numero_serie} · {eq.ubicacion || 'Sin ubicación'}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <EstadoBadge estado={eq.estado} />
              <Badge variant={eq.tipo === 'COLOR' ? 'info' : 'gray'}>{eq.tipo_display}</Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
            <div>
              <p className="text-gray-400">Último contador</p>
              <p className="font-semibold text-gray-800">{eq.ultima_lectura ? eq.ultima_lectura.contador.toLocaleString() : '—'}</p>
            </div>
            <div>
              <p className="text-gray-400">Ciclos este mes</p>
              <p className={`font-semibold ${eq.ciclos_ultimo_mes && eq.ciclos_ultimo_mes > eq.cuota_mensual ? 'text-red-600' : 'text-gray-800'}`}>
                {eq.ciclos_ultimo_mes?.toLocaleString() ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Cuota mensual</p>
              <p className="font-semibold text-gray-800">{eq.cuota_mensual.toLocaleString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" variant="primary" onClick={() => onLectura(eq)}>
              <Plus size={12} /> Registrar lectura
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setExpanded(v => !v)}>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Historial
            </Button>
          </div>

          {/* Historial expandido */}
          {expanded && <HistorialLecturas equipoId={eq.id} />}
        </div>
      </div>
    </Card>
  )
}


function HistorialLecturas({ equipoId }: { equipoId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['historial-lecturas', equipoId],
    queryFn: () => equiposService.historialLecturas(equipoId),
  })

  const { data: equipo } = useQuery({
    queryKey: ['equipo', equipoId],
    queryFn: () => equiposService.obtener(equipoId),
  })

  if (isLoading) return <Loading text="Cargando historial..." />

  const esColor = equipo?.tipo === 'COLOR'

  return (
    <div className="mt-3 border-t pt-3">
      <p className="text-xs font-medium text-gray-500 mb-2">
        Historial de lecturas
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="text-left pb-2 pr-3">Fecha</th>
              <th className="text-right pb-2 px-2">Contador general</th>
              <th className="text-right pb-2 px-2">Ciclos mes</th>

              {esColor && (
                <>
                  <th className="text-right pb-2 px-2">Negro K</th>
                  <th className="text-right pb-2 px-2">Color</th>
                </>
              )}

              <th className="text-left pb-2 pl-3">Nota</th>
            </tr>
          </thead>


          <tbody>
            {data?.map(l => (
              <tr key={l.id} className="border-b border-gray-50">
                <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">
                  {dayjs(l.fecha).format('DD/MM/YYYY')}
                </td>

                <td className="py-2 px-2 text-right font-medium">
                  {l.contador.toLocaleString()}
                </td>

                <td className={`py-2 px-2 text-right ${
                  l.excede_cuota ? 'text-red-600 font-medium' : 'text-green-600'
                }`}>
                  {l.ciclos_desde_anterior !== null
                    ? `+${l.ciclos_desde_anterior.toLocaleString()}`
                    : '—'}
                </td>

                {esColor && (
  <>
                    <td className="py-2 px-2 text-right font-medium">
                      {l.contador_k !== null
                        ? l.contador_k.toLocaleString()
                        : '—'}
                    </td>
                  </>
                )}

                {esColor && (
                  <>
                    <td className="py-2 px-2 text-right font-medium">
                      {l.contador_color !== null ? l.contador_color.toLocaleString() : '—'}
                    </td>
                  </>
                )}

                <td className="py-2 pl-3 text-gray-400">
                  {l.notas || '—'}
                </td>
              </tr>
            ))}

            {(!data || data.length === 0) && (
              <tr>
                <td
                  colSpan={esColor ? 8 : 4}
                  className="py-4 text-center text-gray-400"
                >
                  No hay lecturas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}



function LecturaModal({ equipo, onClose }: { equipo: Equipo; onClose: () => void }) {
  const qc = useQueryClient()

  const [form, setForm] = useState({
    fecha: dayjs().format('YYYY-MM-DD'),
    contador: String(equipo.ultima_lectura?.contador ?? ''),
    contador_k: String(equipo.ultima_lectura?.contador_k ?? ''),
    contador_color: String(equipo.ultima_lectura?.contador_color ?? ''),
    notas: '',
    registrado_por: '',
  })

  const [errorValidacion, setErrorValidacion] = useState('')

  const mutation = useMutation({
    mutationFn: () => equiposService.registrarLectura(equipo.id, {
      fecha: form.fecha,
      contador: Number(form.contador),
      ...(equipo.tipo === 'COLOR' ? {
        contador_k: Number(form.contador_k),
        contador_color: Number(form.contador_color),
      } : {}),
      notas: form.notas,
      registrado_por: form.registrado_por,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipos'] })
      qc.invalidateQueries({ queryKey: ['historial-lecturas', equipo.id] })
      onClose()
    },
  })

  const guardarLectura = () => {
    setErrorValidacion('')

    if (form.contador.trim() === '') {
      setErrorValidacion('Debes ingresar el contador general de ciclos de motor.')
      return
    }

    if (equipo.tipo === 'COLOR' && form.contador_k.trim() === '') {
      setErrorValidacion('Debes ingresar el contador negro (K).')
      return
    }

    if (equipo.tipo === 'COLOR' && form.contador_color.trim() === '') {
      setErrorValidacion('Debes ingresar el contador de color.')
      return
    }

    if (
      Number(form.contador) < 0 ||
      (
        equipo.tipo === 'COLOR' &&
        (
          Number(form.contador_k) < 0 ||
          Number(form.contador_color) < 0
        )
      )
    ) {
      setErrorValidacion('Los contadores no pueden ser negativos.')
      return
    }

    mutation.mutate()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5">
        <h3 className="font-semibold text-gray-800 mb-1">
          Registrar lectura — {equipo.nombre}
        </h3>

        <p className="text-xs text-gray-500 mb-4">
          Tipo de impresora: {equipo.tipo === 'COLOR' ? 'Color' : 'Monocromática'}
        </p>

        <div className="flex flex-col gap-3">
          <Input
            label="Fecha"
            type="date"
            value={form.fecha}
            onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
          />

          <Input
            label="Contador general (ciclos de motor)"
            type="number"
            value={form.contador}
            onChange={e => setForm(f => ({ ...f, contador: e.target.value }))}
          />

          {equipo.tipo === 'COLOR' && (
            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Contadores acumulados de impresión
              </p>

              <div className="flex flex-col gap-3">
                <Input
                  label="Negro (K)"
                  type="number"
                  value={form.contador_k}
                  onChange={e => setForm(f => ({ ...f, contador_k: e.target.value }))}
                />

                <Input
                  label="Color"
                  type="number"
                  value={form.contador_color}
                  onChange={e => setForm(f => ({ ...f, contador_color: e.target.value }))}
                />
              </div>
            </div>
          )}

          <Input
            label="Registrado por"
            value={form.registrado_por}
            onChange={e => setForm(f => ({ ...f, registrado_por: e.target.value }))}
          />

          <Input
            label="Notas (opcional)"
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
          />
        </div>

        {errorValidacion && (
          <p className="text-xs text-red-500 mt-3">{errorValidacion}</p>
        )}

        {mutation.isError && (
          <p className="text-xs text-red-500 mt-2">
            Error al guardar. Verifica los datos y que los contadores no sean menores a la lectura anterior.
          </p>
        )}

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={guardarLectura}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar lectura'}
          </Button>
        </div>
      </div>
    </div>
  )
}



type CrearEquipoPayload = {
  nombre: string
  marca: string
  modelo: string
  numero_serie: string
  tipo: 'MONO' | 'COLOR'
  estado: 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO'
  cliente_id: number | null
  contrato_id: number | null
  ubicacion: string
  cuota_mensual: number
  contador_inicial: number
  fecha_instalacion: string | null
  notas: string
}

function obtenerMensajeError(error: unknown): string {
  const err = error as {
    response?: { data?: unknown }
    message?: string
  }

  const data = err.response?.data

  if (typeof data === 'string') return data

  if (data && typeof data === 'object') {
    return Object.entries(data as Record<string, unknown>)
      .map(([campo, mensaje]) => {
        const detalle = Array.isArray(mensaje)
          ? mensaje.join(', ')
          : String(mensaje)

        return `${campo}: ${detalle}`
      })
      .join(' · ')
  }

  return err.message || 'No se pudo crear el equipo.'
}

function CrearEquipoModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()

  const [form, setForm] = useState({
    nombre: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    tipo: 'MONO' as 'MONO' | 'COLOR',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO',
    cliente_id: '',
    contrato_id: '',
    ubicacion: '',
    cuota_mensual: 5000,
    contador_inicial: 0,
    fecha_instalacion: '',
    notas: '',
  })

  const [formError, setFormError] = useState('')

  // Cargar clientes
  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.listar,
  })

  // Cargar contratos
  const contratosQuery = useQuery({
    queryKey: ['contratos'],
    queryFn: contratosService.listar,
  })

  // Mostrar solamente los contratos del cliente seleccionado
  const contratosFiltrados = (contratosQuery.data?.results ?? [])
    .filter(contrato => contrato.cliente === Number(form.cliente_id))

  const mutation = useMutation({
    mutationFn: (payload: CrearEquipoPayload) =>
      equiposService.crear(payload),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipos'] })
      onClose()
    },
  })

  const handleSubmit = () => {
    setFormError('')

    if (
      !form.nombre.trim() ||
      !form.marca.trim() ||
      !form.modelo.trim() ||
      !form.numero_serie.trim()
    ) {
      setFormError('Completa el nombre, marca, modelo y número de serie.')
      return
    }

    if (form.cuota_mensual < 1) {
      setFormError('La cuota mensual debe ser como mínimo 1.')
      return
    }

    if (form.contador_inicial < 0) {
      setFormError('El contador inicial no puede ser negativo.')
      return
    }

    const payload: CrearEquipoPayload = {
      nombre: form.nombre.trim(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      numero_serie: form.numero_serie.trim(),
      tipo: form.tipo,
      estado: form.estado,
      cliente_id: form.cliente_id ? Number(form.cliente_id) : null,
      contrato_id: form.contrato_id ? Number(form.contrato_id) : null,
      ubicacion: form.ubicacion.trim(),
      cuota_mensual: form.cuota_mensual,
      contador_inicial: form.contador_inicial,
      fecha_instalacion: form.fecha_instalacion || null,
      notas: form.notas.trim(),
    }

    mutation.mutate(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5">

        <h3 className="font-semibold text-gray-800 text-lg mb-5">
          Nuevo equipo
        </h3>

        <div className="flex flex-col gap-5">

          {/* INFORMACIÓN DEL EQUIPO */}
          <section>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Información del equipo
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Nombre *"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              />

              <Input
                label="Número de serie *"
                value={form.numero_serie}
                onChange={e => setForm(f => ({ ...f, numero_serie: e.target.value }))}
              />

              <Input
                label="Marca *"
                value={form.marca}
                onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}
              />

              <Input
                label="Modelo *"
                value={form.modelo}
                onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
              />

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tipo de equipo
                </label>
                <Select
                  value={form.tipo}
                  onChange={e => setForm(f => ({
                    ...f,
                    tipo: e.target.value as 'MONO' | 'COLOR',
                  }))}
                >
                  <option value="MONO">Monocromático</option>
                  <option value="COLOR">Color</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Estado
                </label>
                <Select
                  value={form.estado}
                  onChange={e => setForm(f => ({
                    ...f,
                    estado: e.target.value as 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO',
                  }))}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="MANTENIMIENTO">En mantenimiento</option>
                </Select>
              </div>
            </div>
          </section>

          {/* ASIGNACIÓN */}
          <section className="border-t pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Asignación
            </h4>

            <div className="flex flex-col gap-3">

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cliente
                </label>

                <Select
                  value={form.cliente_id}
                  onChange={e => setForm(f => ({
                    ...f,
                    cliente_id: e.target.value,
                    contrato_id: '',
                  }))}
                >
                  <option value="">Sin cliente asignado</option>

                  {(clientesQuery.data?.results ?? []).map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                      {cliente.razon_social &&
                        cliente.razon_social !== cliente.nombre
                        ? ` — ${cliente.razon_social}`
                        : ''}
                    </option>
                  ))}
                </Select>

                {clientesQuery.isLoading && (
                  <p className="text-xs text-gray-400 mt-1">
                    Cargando clientes...
                  </p>
                )}

                {clientesQuery.isError && (
                  <p className="text-xs text-red-500 mt-1">
                    No se pudieron cargar los clientes.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Contrato
                </label>

                <Select
                  value={form.contrato_id}
                  disabled={!form.cliente_id || contratosQuery.isLoading}
                  onChange={e => setForm(f => ({
                    ...f,
                    contrato_id: e.target.value,
                  }))}
                >
                  <option value="">Sin contrato asignado</option>

                  {contratosFiltrados.map(contrato => (
                    <option key={contrato.id} value={contrato.id}>
                      {contrato.numero_contrato} — {contrato.estado_display}
                    </option>
                  ))}
                </Select>

                {contratosQuery.isLoading && (
                  <p className="text-xs text-gray-400 mt-1">
                    Cargando contratos...
                  </p>
                )}

                {contratosQuery.isError && (
                  <p className="text-xs text-red-500 mt-1">
                    No se pudieron cargar los contratos.
                  </p>
                )}

                {form.cliente_id &&
                  !contratosQuery.isLoading &&
                  !contratosQuery.isError &&
                  contratosFiltrados.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Este cliente no tiene contratos registrados.
                    </p>
                  )}
              </div>

              <Input
                label="Ubicación"
                value={form.ubicacion}
                onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
              />
            </div>
          </section>

          {/* CONFIGURACIÓN */}
          <section className="border-t pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Configuración del servicio
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Cuota mensual (ciclos)"
                type="number"
                value={form.cuota_mensual}
                onChange={e => setForm(f => ({
                  ...f,
                  cuota_mensual: Number(e.target.value),
                }))}
              />

              <Input
                label="Contador inicial"
                type="number"
                value={form.contador_inicial}
                onChange={e => setForm(f => ({
                  ...f,
                  contador_inicial: Number(e.target.value),
                }))}
              />

              <Input
                label="Fecha de instalación"
                type="date"
                value={form.fecha_instalacion}
                onChange={e => setForm(f => ({
                  ...f,
                  fecha_instalacion: e.target.value,
                }))}
              />
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notas
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={form.notas}
                onChange={e => setForm(f => ({
                  ...f,
                  notas: e.target.value,
                }))}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </section>
        </div>

        {/* ERRORES */}
        {(formError || mutation.isError) && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs">
            {formError || obtenerMensajeError(mutation.error)}
          </div>
        )}

        {/* BOTONES */}
        <div className="flex justify-end gap-2 mt-5 border-t pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Guardando...' : 'Crear equipo'}
          </Button>
        </div>

      </div>
    </div>
  )
}

export default function Equipos() {
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [equipoLectura, setEquipoLectura] = useState<Equipo | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['equipos'],
    queryFn: equiposService.listar,
  })

  const equipos = (data?.results ?? []).filter(eq => {
    const matchSearch = !search || eq.nombre.toLowerCase().includes(search.toLowerCase()) || eq.numero_serie.toLowerCase().includes(search.toLowerCase())
    const matchEstado = !filtroEstado || eq.estado === filtroEstado
    return matchSearch && matchEstado
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionHeader
        title="Equipos de impresión"
        action={
          <Button variant="primary"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={14} /> Agregar equipo
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por nombre o serie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="MANTENIMIENTO">Mantenimiento</option>
        </Select>
      </div>

      {isLoading ? <Loading /> : equipos.length === 0
        ? <Empty icon={Printer} title="No hay equipos" sub="Agrega el primer equipo con el botón de arriba" />
        : (
          <div className="flex flex-col gap-3">
            {equipos.map(eq => (
              <EquipoCard key={eq.id} eq={eq} onLectura={setEquipoLectura} />
            ))}
          </div>
        )
      }

      {equipoLectura && (
        <LecturaModal equipo={equipoLectura} onClose={() => setEquipoLectura(null)} />
      )}
      {showCreate && (
        <CrearEquipoModal onClose={() => setShowCreate(false)} />
)}
    </div>
  )
}
