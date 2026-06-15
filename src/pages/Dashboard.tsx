import { useQuery } from '@tanstack/react-query'
import { Printer, Users, Bell, Wrench, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { equiposService, contratosService, alertasService, ordenesService } from '../api'
import { MetricCard, Card, Loading, Badge, Button } from '../components/ui'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: resEquipos } = useQuery({ queryKey: ['equipos-resumen'], queryFn: equiposService.resumen })
  const { data: resClientes } = useQuery({ queryKey: ['clientes-resumen'], queryFn: contratosService.resumen })
  const { data: resAlertas } = useQuery({ queryKey: ['alertas-resumen'], queryFn: alertasService.resumen, refetchInterval: 60_000 })
  const { data: resMant } = useQuery({ queryKey: ['mantenimiento-resumen'], queryFn: ordenesService.resumen })
  const { data: alertasActivas, isLoading: loadingAlertas } = useQuery({ queryKey: ['alertas-activas'], queryFn: alertasService.activas, refetchInterval: 60_000 })
  const { data: proximos } = useQuery({ queryKey: ['programados-proximos'], queryFn: () => import('../api').then(m => m.programadosService.proximos()) })

  const nivelBadge = (nivel: string) => {
    if (nivel === 'CRITICAL') return <Badge variant="danger">Crítico</Badge>
    if (nivel === 'WARNING') return <Badge variant="warning">Advertencia</Badge>
    return <Badge variant="info">Info</Badge>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Panel general</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen de todos los microservicios</p>
      </div>

      {/* Métricas de equipos */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Printer size={13} /> Equipos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total equipos" value={resEquipos?.total_equipos ?? '—'} icon={Printer} />
          <MetricCard label="Equipos activos" value={resEquipos?.equipos_activos ?? '—'} variant="success" icon={CheckCircle} />
          <MetricCard label="Alertas tóner" value={resEquipos?.alertas_toner ?? '—'} variant={resEquipos?.alertas_toner ? 'warning' : 'default'} icon={AlertTriangle} />
          <MetricCard label="Cuota excedida" value={resEquipos?.equipos_con_cuota_excedida ?? '—'} variant={resEquipos?.equipos_con_cuota_excedida ? 'danger' : 'default'} icon={TrendingUp} />
        </div>
      </section>

      {/* Métricas de clientes */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users size={13} /> Clientes y contratos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Clientes activos" value={resClientes?.clientes_activos ?? '—'} icon={Users} />
          <MetricCard label="Contratos activos" value={resClientes?.contratos_activos ?? '—'} variant="success" icon={CheckCircle} />
          <MetricCard label="Por vencer (30d)" value={resClientes?.contratos_por_vencer ?? '—'} variant={resClientes?.contratos_por_vencer ? 'warning' : 'default'} icon={Clock} />
          <MetricCard label="Equipos arrendados" value={resClientes?.total_equipos_arrendados ?? '—'} icon={Printer} />
        </div>
      </section>

      {/* Métricas de mantenimiento */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Wrench size={13} /> Mantenimiento
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Órdenes pendientes" value={resMant?.ordenes_pendientes ?? '—'} variant={resMant?.ordenes_pendientes ? 'warning' : 'default'} icon={Clock} />
          <MetricCard label="En proceso" value={resMant?.ordenes_en_proceso ?? '—'} variant="info" icon={Wrench} />
          <MetricCard label="Completadas este mes" value={resMant?.ordenes_completadas_mes ?? '—'} variant="success" icon={CheckCircle} />
          <MetricCard label="Programados próximos" value={resMant?.programados_proximos ?? '—'} variant={resMant?.programados_proximos ? 'warning' : 'default'} icon={Clock} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alertas activas */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Bell size={15} className="text-red-500" />
              Alertas activas
              {(resAlertas?.total_activas ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {resAlertas!.total_activas}
                </span>
              )}
            </h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/alertas')}>Ver todas</Button>
          </div>
          {loadingAlertas ? <Loading /> : (
            <div className="flex flex-col gap-2">
              {alertasActivas?.slice(0, 5).map(a => (
                <div key={a.id} className={`flex items-start gap-3 p-2.5 rounded-lg text-sm
                  ${a.nivel === 'CRITICAL' ? 'bg-red-50' : a.nivel === 'WARNING' ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2">{a.mensaje}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.equipo_nombre || a.cliente_nombre}</p>
                  </div>
                  {nivelBadge(a.nivel)}
                </div>
              ))}
              {!alertasActivas?.length && (
                <div className="flex items-center gap-2 py-6 justify-center text-green-600">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Sin alertas activas</span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Mantenimientos próximos */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Wrench size={15} className="text-blue-500" />
              Mantenimientos próximos
            </h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/mantenimiento')}>Ver todos</Button>
          </div>
          <div className="flex flex-col gap-2">
            {proximos?.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{p.equipo_nombre}</p>
                  <p className="text-xs text-gray-400">{p.nombre}</p>
                </div>
                <Badge variant={(p.dias_para_proximo ?? 0) <= 3 ? 'danger' : 'warning'}>
                  {p.dias_para_proximo === 0 ? 'Hoy' : `${p.dias_para_proximo}d`}
                </Badge>
              </div>
            ))}
            {!proximos?.length && (
              <div className="flex items-center gap-2 py-6 justify-center text-green-600">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">Sin mantenimientos próximos</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
