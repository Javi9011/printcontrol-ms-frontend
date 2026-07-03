import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Search, Building2, User, Mail, Phone } from 'lucide-react'
import { clientesService } from '../api'
import { Card, Badge, Loading, Empty, SectionHeader, Button } from '../components/ui'
import ClienteModal from '../components/clientes/ClienteModal'

export default function Clientes() {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['clientes'], queryFn: clientesService.listar })

  const clientes = (data?.results ?? []).filter(c =>
    !search || c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.rfc ?? '').toLowerCase().includes(search.toLowerCase()) ||
    c.contacto_email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <SectionHeader title="Clientes" action={<Button variant="primary"onClick={() => setShowCreate(true)}><Users size={14} /> Nuevo cliente</Button>} />

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar por nombre, RFC o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? <Loading /> : clientes.length === 0
        ? <Empty icon={Users} title="No hay clientes registrados" />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {clientes.map(c => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                    {c.tipo_persona === 'MORAL' ? <Building2 size={18} className="text-purple-600" /> : <User size={18} className="text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{c.nombre}</p>
                        {c.rfc && <p className="text-xs text-gray-400">RFC: {c.rfc}</p>}
                      </div>
                      <Badge variant={c.estado_cuenta === 'ACTIVO' ? 'success' : c.estado_cuenta === 'SUSPENDIDO' ? 'danger' : 'gray'}>
                        {c.estado_cuenta_display}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <User size={11} />
                        {c.contacto_nombre}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={11} />
                        {c.contacto_email}
                      </div>
                      {c.contacto_telefono && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone size={11} />
                          {c.contacto_telefono}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-3 pt-3 border-t text-xs text-gray-500">
                      <span><strong className="text-gray-700">{c.contratos_activos}</strong> contratos</span>
                      <span><strong className="text-gray-700">{c.total_equipos}</strong> equipos</span>
                      {c.ciudad && <span>{c.ciudad}, {c.estado}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      }
      {showCreate && (
                <ClienteModal
                  onClose={() => setShowCreate(false)}
                 />
      )}
    </div>
  )
}
