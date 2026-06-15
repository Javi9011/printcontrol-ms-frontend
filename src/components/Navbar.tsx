import { NavLink } from 'react-router-dom'
import { Printer, LayoutDashboard, Users, Bell, Wrench, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { alertasService } from '../api'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/equipos', label: 'Equipos', icon: Printer },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/contratos', label: 'Contratos', icon: FileText },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/mantenimiento', label: 'Mantenimiento', icon: Wrench },
]

export default function Navbar() {
  const { data: resumen } = useQuery({
    queryKey: ['alertas-resumen'],
    queryFn: alertasService.resumen,
    refetchInterval: 60_000,
  })

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Printer size={16} />
        </div>
        <span className="font-semibold text-sm">PrintControl</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {links.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative
              ${isActive
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            {label}
            {label === 'Alertas' && (resumen?.total_activas ?? 0) > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {resumen!.total_activas}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-700 text-xs text-gray-500">
        v1.0.0 — 4 servicios
      </div>
    </aside>
  )
}
