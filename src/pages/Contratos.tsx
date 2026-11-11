import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Search, Calendar, Printer } from 'lucide-react'
import { contratosService, clientesService } from '../api'
import { Card, Badge, Loading, Empty, SectionHeader, Button } from '../components/ui'
import dayjs from 'dayjs'

export default function Contratos() {
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['contratos'],
    queryFn: contratosService.listar,
  })

  const { data: clientesData, isLoading: cargandoClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.listar,
  })

  const clientes = clientesData?.results ?? []

  const contratos = (data?.results ?? []).filter(c =>
    (!search || c.numero_contrato.toLowerCase().includes(search.toLowerCase()) || c.cliente_nombre.toLowerCase().includes(search.toLowerCase())) &&
    (!filtroEstado || c.estado === filtroEstado)
  )

  const estadoBadge = (estado: string, vigente: boolean) => {
    if (estado === 'ACTIVO' && vigente) return <Badge variant="success">Vigente</Badge>
    if (estado === 'ACTIVO' && !vigente) return <Badge variant="danger">Vencido</Badge>
    if (estado === 'VENCIDO') return <Badge variant="danger">Vencido</Badge>
    if (estado === 'CANCELADO') return <Badge variant="gray">Cancelado</Badge>
    return <Badge variant="warning">Renovación</Badge>
  }

  const diasRestantes = (fechaFin: string) => {
    const dias = dayjs(fechaFin).diff(dayjs(), 'day')
    if (dias < 0) return <span className="text-red-500 text-xs font-medium">Vencido hace {Math.abs(dias)}d</span>
    if (dias <= 30) return <span className="text-yellow-600 text-xs font-medium">Vence en {dias}d</span>
    return <span className="text-green-600 text-xs">Vence en {dias}d</span>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionHeader
  title="Contratos"
  action={
    <Button variant="primary" onClick={() => setMostrarModal(true)}>
      <FileText size={14} /> Nuevo contrato
    </Button>
  }
/>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por número o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none bg-white"
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="VENCIDO">Vencido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {isLoading ? <Loading /> : contratos.length === 0
        ? <Empty icon={FileText} title="No hay contratos registrados" />
        : (
          <div className="flex flex-col gap-3">
            {contratos.map(c => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-900">{c.numero_contrato}</p>
                      {estadoBadge(c.estado, c.esta_vigente)}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{c.cliente_nombre}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">${Number(c.precio_base).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{c.periodo_facturacion_display}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar size={11} />
                    Inicio: {dayjs(c.fecha_inicio).format('DD/MM/YYYY')}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar size={11} />
                    Fin: {dayjs(c.fecha_fin).format('DD/MM/YYYY')}
                  </div>
                  <div>{diasRestantes(c.fecha_fin)}</div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Printer size={11} />
                    {c.total_equipos} equipo(s)
                  </div>
                </div>

                <div className="flex gap-2 mt-2 flex-wrap">
                  {c.incluye_mantenimiento && <Badge variant="info">Incluye mantenimiento</Badge>}
                  {c.incluye_toner && <Badge variant="info">Incluye tóner</Badge>}
                </div>

                {c.arrendamientos.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-gray-500 mb-2">Equipos arrendados</p>
                    <div className="flex flex-col gap-1">
                      {c.arrendamientos.map(a => (
                        <div key={a.id} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          <span>{a.equipo_nombre} — {a.equipo_serial}</span>
                          <span className="text-gray-400">{a.cuota_mensual_ciclos.toLocaleString()} ciclos/mes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      }
    </div>
  )
}
