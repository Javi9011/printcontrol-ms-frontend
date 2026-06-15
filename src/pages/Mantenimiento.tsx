import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wrench, Plus, Play, CheckCircle, Calendar, Clock } from 'lucide-react'
import { ordenesService, programadosService, tecnicosService } from '../api'
import { Card, Badge, Loading, Empty, SectionHeader, Button, MetricCard, Input, Select, Textarea } from '../components/ui'
import type { OrdenTrabajo, MantenimientoProgramado } from '../types'
import dayjs from 'dayjs'

function PrioridadBadge({ prioridad }: { prioridad: string }) {
  const map: Record<string, 'danger' | 'warning' | 'info' | 'gray'> = {
    URGENTE: 'danger', ALTA: 'warning', MEDIA: 'info', BAJA: 'gray',
  }
  const labels: Record<string, string> = { URGENTE: 'Urgente', ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' }
  return <Badge variant={map[prioridad] ?? 'gray'}>{labels[prioridad] ?? prioridad}</Badge>
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, 'warning' | 'info' | 'success' | 'gray'> = {
    PENDIENTE: 'warning', EN_PROCESO: 'info', COMPLETADA: 'success', CANCELADA: 'gray', REPROGRAMADA: 'gray',
  }
  return <Badge variant={map[estado] ?? 'gray'}>{estado.replace('_', ' ')}</Badge>
}

function OrdenCard({ orden }: { orden: OrdenTrabajo }) {
  const qc = useQueryClient()
  const iniciar = useMutation({
    mutationFn: () => ordenesService.iniciar(orden.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  })
  const completar = useMutation({
    mutationFn: () => ordenesService.completar(orden.id, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  })

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-gray-500">{orden.numero_orden}</span>
            <EstadoBadge estado={orden.estado} />
            <PrioridadBadge prioridad={orden.prioridad} />
            <Badge variant="gray">{orden.tipo_display}</Badge>
          </div>
          <p className="font-medium text-sm text-gray-900 mt-1">{orden.equipo_nombre}</p>
          <p className="text-xs text-gray-500">{orden.equipo_serial} {orden.cliente_nombre ? `· ${orden.cliente_nombre}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {orden.estado === 'PENDIENTE' && (
            <Button size="sm" variant="primary" onClick={() => iniciar.mutate()} disabled={iniciar.isPending}>
              <Play size={12} /> Iniciar
            </Button>
          )}
          {orden.estado === 'EN_PROCESO' && (
            <Button size="sm" variant="secondary" onClick={() => completar.mutate()} disabled={completar.isPending}>
              <CheckCircle size={12} /> Completar
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2">{orden.descripcion}</p>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Calendar size={11} /> {dayjs(orden.fecha_programada).format('DD/MM/YYYY')}</span>
        {orden.tecnico_nombre && <span className="flex items-center gap-1"><Wrench size={11} /> {orden.tecnico_nombre}</span>}
        {orden.duracion_minutos && <span className="flex items-center gap-1"><Clock size={11} /> {Math.floor(orden.duracion_minutos / 60)}h {orden.duracion_minutos % 60}m</span>}
      </div>

      {orden.piezas.length > 0 && (
        <div className="mt-2 pt-2 border-t flex flex-wrap gap-1">
          {orden.piezas.map(p => (
            <span key={p.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {p.nombre_pieza} x{p.cantidad}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

function ProgramadoCard({ prog }: { prog: MantenimientoProgramado }) {
  const qc = useQueryClient()
  const generar = useMutation({
    mutationFn: () => programadosService.generarOrden(prog.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ordenes'] })
      qc.invalidateQueries({ queryKey: ['programados'] })
    },
  })

  const diasColor = (prog.dias_para_proximo ?? 0) < 0 ? 'danger'
    : (prog.dias_para_proximo ?? 0) <= 7 ? 'danger'
    : (prog.dias_para_proximo ?? 0) <= 30 ? 'warning' : 'success'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900">{prog.nombre}</p>
          <p className="text-xs text-gray-500 mt-0.5">{prog.equipo_nombre} · {prog.equipo_serial}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>Cada {prog.frecuencia_meses} mes(es)</span>
            {prog.tecnico_nombre && <span>· {prog.tecnico_nombre}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={diasColor}>
            {(prog.dias_para_proximo ?? 0) < 0
              ? `Vencido hace ${Math.abs(prog.dias_para_proximo ?? 0)}d`
              : prog.dias_para_proximo === 0 ? 'Hoy'
              : `En ${prog.dias_para_proximo}d`}
          </Badge>
          {prog.requiere_atencion && (
            <Button size="sm" variant="primary" onClick={() => generar.mutate()} disabled={generar.isPending}>
              <Plus size={12} /> Generar OT
            </Button>
          )}
        </div>
      </div>
      {prog.fecha_proximo_mantenimiento && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <Calendar size={11} /> Próximo: {dayjs(prog.fecha_proximo_mantenimiento).format('DD/MM/YYYY')}
        </p>
      )}
    </Card>
  )
}

function NuevaOrdenModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { data: tecnicos } = useQuery({ queryKey: ['tecnicos'], queryFn: tecnicosService.listar })
  const [form, setForm] = useState({
    tipo: 'CORRECTIVO', prioridad: 'MEDIA',
    equipo_id: '', equipo_nombre: '', equipo_serial: '',
    descripcion: '', fecha_programada: dayjs().format('YYYY-MM-DD'),
    tecnico: '', creado_por: '',
  })

  const mutation = useMutation({
    mutationFn: () => ordenesService.crear({
      ...form,
      equipo_id: Number(form.equipo_id),
      tecnico: form.tecnico ? Number(form.tecnico) : undefined,
    } as any),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); onClose() },
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-4">Nueva orden de trabajo</h3>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tipo" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            <option value="PREVENTIVO">Preventivo</option>
            <option value="CORRECTIVO">Correctivo</option>
            <option value="INSTALACION">Instalación</option>
            <option value="RETIRO">Retiro</option>
            <option value="REVISION">Revisión</option>
          </Select>
          <Select label="Prioridad" value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </Select>
          <Input label="ID del equipo (ms-equipos)" type="number" value={form.equipo_id} onChange={e => set('equipo_id', e.target.value)} />
          <Input label="Nombre del equipo" value={form.equipo_nombre} onChange={e => set('equipo_nombre', e.target.value)} />
          <Input label="Número de serie" value={form.equipo_serial} onChange={e => set('equipo_serial', e.target.value)} />
          <Input label="Fecha programada" type="date" value={form.fecha_programada} onChange={e => set('fecha_programada', e.target.value)} />
          <Select label="Técnico" value={form.tecnico} onChange={e => set('tecnico', e.target.value)} className="col-span-2">
            <option value="">Sin asignar</option>
            {(tecnicos?.results ?? []).map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.tipo_display})</option>)}
          </Select>
          <div className="col-span-2">
            <Textarea label="Descripción del trabajo" rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
          </div>
          <div className="col-span-2">
            <Input label="Creado por" value={form.creado_por} onChange={e => set('creado_por', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Crear orden'}
          </Button>
        </div>
        {mutation.isError && <p className="text-xs text-red-500 mt-2">Error al crear la orden.</p>}
      </div>
    </div>
  )
}

export default function Mantenimiento() {
  const [tab, setTab] = useState<'ordenes' | 'programados'>('ordenes')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data: ordenes, isLoading: loadingOrdenes } = useQuery({ queryKey: ['ordenes'], queryFn: ordenesService.listar })
  const { data: programados, isLoading: loadingProg } = useQuery({ queryKey: ['programados'], queryFn: programadosService.listar })
  const { data: resumen } = useQuery({ queryKey: ['mantenimiento-resumen'], queryFn: ordenesService.resumen })

  const ordenesFiltradas = (ordenes?.results ?? []).filter(o => !filtroEstado || o.estado === filtroEstado)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionHeader
        title="Mantenimiento"
        action={<Button variant="primary" onClick={() => setShowModal(true)}><Plus size={14} /> Nueva orden</Button>}
      />

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Pendientes" value={resumen?.ordenes_pendientes ?? '—'} variant={resumen?.ordenes_pendientes ? 'warning' : 'default'} icon={Clock} />
        <MetricCard label="En proceso" value={resumen?.ordenes_en_proceso ?? '—'} variant="info" icon={Wrench} />
        <MetricCard label="Completadas (mes)" value={resumen?.ordenes_completadas_mes ?? '—'} variant="success" icon={CheckCircle} />
        <MetricCard label="Técnicos activos" value={resumen?.tecnicos_activos ?? '—'} icon={Wrench} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-4">
        {(['ordenes', 'programados'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'ordenes' ? 'Órdenes de trabajo' : 'Programados'}
          </button>
        ))}
      </div>

      {tab === 'ordenes' && (
        <>
          <div className="mb-3">
            <select
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none bg-white"
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          {loadingOrdenes ? <Loading /> : ordenesFiltradas.length === 0
            ? <Empty icon={Wrench} title="No hay órdenes de trabajo" sub="Crea la primera con el botón de arriba" />
            : <div className="flex flex-col gap-3">{ordenesFiltradas.map(o => <OrdenCard key={o.id} orden={o} />)}</div>
          }
        </>
      )}

      {tab === 'programados' && (
        <>
          {loadingProg ? <Loading /> : (programados?.results ?? []).length === 0
            ? <Empty icon={Calendar} title="No hay mantenimientos programados" />
            : <div className="flex flex-col gap-3">{programados!.results.map(p => <ProgramadoCard key={p.id} prog={p} />)}</div>
          }
        </>
      )}

      {showModal && <NuevaOrdenModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
