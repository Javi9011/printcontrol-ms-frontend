import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCircle, EyeOff, RefreshCw, AlertTriangle, Info } from 'lucide-react'
import { alertasService } from '../api'
import { Card, Loading, Empty, Button, Badge, SectionHeader, MetricCard } from '../components/ui'
import type { Alerta } from '../types'
import dayjs from 'dayjs'

function AlertaCard({ alerta, onResolver, onIgnorar }: {
  alerta: Alerta
  onResolver: (id: number) => void
  onIgnorar: (id: number) => void
}) {
  const bgColor = alerta.nivel === 'CRITICAL' ? 'border-l-red-500 bg-red-50'
    : alerta.nivel === 'WARNING' ? 'border-l-yellow-500 bg-yellow-50'
    : 'border-l-blue-500 bg-blue-50'

  const icon = alerta.nivel === 'CRITICAL' ? <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
    : alerta.nivel === 'WARNING' ? <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
    : <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />

  return (
    <div className={`border-l-4 rounded-lg p-3 ${bgColor}`}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm text-gray-800">{alerta.mensaje}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {alerta.equipo_nombre && <span className="text-xs text-gray-500">{alerta.equipo_nombre}</span>}
                {alerta.cliente_nombre && <span className="text-xs text-gray-400">· {alerta.cliente_nombre}</span>}
                <span className="text-xs text-gray-400">{dayjs(alerta.creado_en).format('DD/MM/YYYY HH:mm')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={alerta.nivel === 'CRITICAL' ? 'danger' : alerta.nivel === 'WARNING' ? 'warning' : 'info'}>
                {alerta.tipo_display}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" variant="ghost" onClick={() => onResolver(alerta.id)} title="Resolver">
            <CheckCircle size={13} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onIgnorar(alerta.id)} title="Ignorar">
            <EyeOff size={13} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Alertas() {
  const qc = useQueryClient()

  const { data: resumen } = useQuery({ queryKey: ['alertas-resumen'], queryFn: alertasService.resumen })
  const { data: alertas, isLoading } = useQuery({ queryKey: ['alertas-activas'], queryFn: alertasService.activas, refetchInterval: 60_000 })

  const resolver = useMutation({
    mutationFn: (id: number) => alertasService.resolver(id, { resuelta_por: 'Usuario', nota_resolucion: 'Resuelta manualmente' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alertas'] }),
  })

  const ignorar = useMutation({
    mutationFn: (id: number) => alertasService.ignorar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alertas'] }),
  })

  const ejecutarMotor = useMutation({
    mutationFn: alertasService.ejecutarMotor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alertas'] }),
  })

  const criticas = alertas?.filter(a => a.nivel === 'CRITICAL') ?? []
  const advertencias = alertas?.filter(a => a.nivel === 'WARNING') ?? []
  const info = alertas?.filter(a => a.nivel === 'INFO') ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <SectionHeader
        title="Centro de alertas"
        action={
          <Button variant="secondary" onClick={() => ejecutarMotor.mutate()} disabled={ejecutarMotor.isPending}>
            <RefreshCw size={13} className={ejecutarMotor.isPending ? 'animate-spin' : ''} />
            Ejecutar motor
          </Button>
        }
      />

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Total activas" value={resumen?.total_activas ?? '—'} variant={resumen?.total_activas ? 'danger' : 'default'} icon={Bell} />
        <MetricCard label="Críticas" value={resumen?.criticas ?? '—'} variant={resumen?.criticas ? 'danger' : 'default'} icon={AlertTriangle} />
        <MetricCard label="Advertencias" value={resumen?.advertencias ?? '—'} variant={resumen?.advertencias ? 'warning' : 'default'} icon={AlertTriangle} />
        <MetricCard label="Resueltas hoy" value={resumen?.resueltas_hoy ?? '—'} variant="success" icon={CheckCircle} />
      </div>

      {isLoading ? <Loading /> : (alertas?.length ?? 0) === 0
        ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle size={40} className="text-green-400 mb-3" />
            <p className="text-sm font-medium text-gray-600">Sin alertas activas</p>
            <p className="text-xs text-gray-400 mt-1">Todos los sistemas operando normalmente</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {criticas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Críticas ({criticas.length})</p>
                <div className="flex flex-col gap-2">
                  {criticas.map(a => <AlertaCard key={a.id} alerta={a} onResolver={id => resolver.mutate(id)} onIgnorar={id => ignorar.mutate(id)} />)}
                </div>
              </div>
            )}
            {advertencias.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-2">Advertencias ({advertencias.length})</p>
                <div className="flex flex-col gap-2">
                  {advertencias.map(a => <AlertaCard key={a.id} alerta={a} onResolver={id => resolver.mutate(id)} onIgnorar={id => ignorar.mutate(id)} />)}
                </div>
              </div>
            )}
            {info.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Informativas ({info.length})</p>
                <div className="flex flex-col gap-2">
                  {info.map(a => <AlertaCard key={a.id} alerta={a} onResolver={id => resolver.mutate(id)} onIgnorar={id => ignorar.mutate(id)} />)}
                </div>
              </div>
            )}
          </div>
        )
      }
    </div>
  )
}
