import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Printer, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { equiposService } from '../api'
import { Card, Badge, Button, Loading, Empty, TonerBar, Input, Select, SectionHeader } from '../components/ui'
import type { Equipo } from '../types'
import dayjs from 'dayjs'

function EstadoBadge({ estado }: { estado: string }) {
  if (estado === 'ACTIVO') return <Badge variant="success">Activo</Badge>
  if (estado === 'INACTIVO') return <Badge variant="gray">Inactivo</Badge>
  return <Badge variant="warning">Mantenimiento</Badge>
}

function EquipoCard({ eq, onLectura }: { eq: Equipo; onLectura: (eq: Equipo) => void }) {
  const [expanded, setExpanded] = useState(false)
  const worstToner = eq.toners.some(t => t.nivel === 'CRITICO') ? 'danger'
    : eq.toners.some(t => t.nivel === 'BAJO') ? 'warning' : 'success'
  const tonerLabel = worstToner === 'danger' ? 'Cambiar tóner' : worstToner === 'warning' ? 'Tóner bajo' : 'Tóner OK'

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
              <Badge variant={worstToner}>{tonerLabel}</Badge>
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

          {/* Toner bars */}
          {eq.toners.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              {eq.toners.map(t => (
                <TonerBar key={t.canal} {...t} />
              ))}
            </div>
          )}

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
  if (isLoading) return <Loading text="Cargando historial..." />
  return (
    <div className="mt-3 border-t pt-3">
      <p className="text-xs font-medium text-gray-500 mb-2">Historial de lecturas</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="text-left pb-1">Fecha</th>
              <th className="text-right pb-1">Contador</th>
              <th className="text-right pb-1">Ciclos mes</th>
              <th className="text-left pb-1 pl-3">Nota</th>
            </tr>
          </thead>
          <tbody>
            {data?.map(l => (
              <tr key={l.id} className="border-b border-gray-50">
                <td className="py-1 text-gray-600">{dayjs(l.fecha).format('DD/MM/YYYY')}</td>
                <td className="py-1 text-right font-medium">{l.contador.toLocaleString()}</td>
                <td className={`py-1 text-right ${l.excede_cuota ? 'text-red-600 font-medium' : 'text-green-600'}`}>
                  {l.ciclos_desde_anterior !== null ? `+${l.ciclos_desde_anterior.toLocaleString()}` : '—'}
                </td>
                <td className="py-1 pl-3 text-gray-400">{l.notas || '—'}</td>
              </tr>
            ))}
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
    contador: equipo.ultima_lectura?.contador ?? 0,
    notas: '',
    registrado_por: '',
  })
  const [toners, setToners] = useState(
    equipo.toners.map(t => ({ canal: t.canal, paginas_restantes: t.paginas_restantes }))
  )

  const mutation = useMutation({
    mutationFn: () => equiposService.registrarLectura(equipo.id, { ...form, toners }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['equipos'] })
      qc.invalidateQueries({ queryKey: ['historial-lecturas', equipo.id] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Registrar lectura — {equipo.nombre}</h3>
        <div className="flex flex-col gap-3">
          <Input label="Fecha" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
          <Input label="Contador (ciclos de motor)" type="number" value={form.contador} onChange={e => setForm(f => ({ ...f, contador: Number(e.target.value) }))} />
          {toners.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Páginas restantes por tóner</p>
              <div className="flex flex-col gap-2">
                {toners.map((t, i) => (
                  <Input
                    key={t.canal}
                    label={`Tóner ${t.canal === 'K' ? 'Negro' : t.canal === 'C' ? 'Cian' : t.canal === 'M' ? 'Magenta' : 'Amarillo'}`}
                    type="number"
                    value={t.paginas_restantes}
                    onChange={e => setToners(prev => prev.map((x, j) => j === i ? { ...x, paginas_restantes: Number(e.target.value) } : x))}
                  />
                ))}
              </div>
            </div>
          )}
          <Input label="Registrado por" value={form.registrado_por} onChange={e => setForm(f => ({ ...f, registrado_por: e.target.value }))} />
          <Input label="Notas (opcional)" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Guardar lectura'}
          </Button>
        </div>
        {mutation.isError && <p className="text-xs text-red-500 mt-2">Error al guardar. Verifica los datos.</p>}
      </div>
    </div>
  )
}

export default function Equipos() {
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [equipoLectura, setEquipoLectura] = useState<Equipo | null>(null)

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
          <Button variant="primary">
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
    </div>
  )
}
