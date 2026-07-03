import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesService } from '../../api'
import { Button, Input, Select } from '../ui'
import type { Cliente } from '../../types'

interface Props {
  onClose: () => void
}

export default function ClienteModal({ onClose }: Props) {
  const qc = useQueryClient()

  const [form, setForm] = useState<Partial<Cliente>>({
    tipo_persona: 'MORAL',
    nombre: '',
    rfc: '',
    razon_social: '',
    contacto_nombre: '',
    contacto_email: '',
    contacto_telefono: '',
    calle: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    pais: '',
    estado_cuenta: 'ACTIVO',
    notas: ''
  })

  const mutation = useMutation({
    mutationFn: () => clientesService.crear(form),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] })
      onClose()
    },

    onError: (err: any) => {
      console.error("ERROR CREANDO CLIENTE:", err.response?.data || err)
    }
  })

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg font-semibold mb-4">
          Nuevo Cliente
        </h2>

        <div className="space-y-3">

          {/* Nombre */}
          <Input
            label="Nombre"
            value={form.nombre || ''}
            onChange={e =>
              setForm({ ...form, nombre: e.target.value })
            }
          />

          {/* Tipo persona */}
          <Select
            value={form.tipo_persona}
            onChange={e =>
              setForm({
                ...form,
                tipo_persona: e.target.value as 'MORAL' | 'FISICA'
              })
            }
          >
            <option value="MORAL">Moral</option>
            <option value="FISICA">Física</option>
          </Select>

          {/* RFC */}
          <Input
            label="RFC"
            value={form.rfc || ''}
            onChange={e =>
              setForm({ ...form, rfc: e.target.value })
            }
          />

          {/* Razón social */}
          <Input
            label="Razón Social"
            value={form.razon_social || ''}
            onChange={e =>
              setForm({ ...form, razon_social: e.target.value })
            }
          />

          {/* Contacto */}
          <Input
            label="Contacto"
            value={form.contacto_nombre || ''}
            onChange={e =>
              setForm({ ...form, contacto_nombre: e.target.value })
            }
          />

          {/* Email */}
          <Input
            label="Email"
            value={form.contacto_email || ''}
            onChange={e =>
              setForm({ ...form, contacto_email: e.target.value })
            }
          />

          {/* Teléfono */}
          <Input
            label="Teléfono"
            value={form.contacto_telefono || ''}
            onChange={e =>
              setForm({ ...form, contacto_telefono: e.target.value })
            }
          />

          {/* Calle */}
          <Input
            label="Calle"
            value={form.calle || ''}
            onChange={e =>
              setForm({ ...form, calle: e.target.value })
            }
          />

          {/* Ciudad */}
          <Input
            label="Ciudad"
            value={form.ciudad || ''}
            onChange={e =>
              setForm({ ...form, ciudad: e.target.value })
            }
          />

          {/* Estado */}
          <Input
            label="Estado"
            value={form.estado || ''}
            onChange={e =>
              setForm({ ...form, estado: e.target.value })
            }
          />

          {/* Código postal */}
          <Input
            label="Código Postal"
            value={form.codigo_postal || ''}
            onChange={e =>
              setForm({ ...form, codigo_postal: e.target.value })
            }
          />

          {/* País */}
          <Input
            label="País"
            value={form.pais || ''}
            onChange={e =>
              setForm({ ...form, pais: e.target.value })
            }
          />

          {/* Notas */}
          <Input
            label="Notas"
            value={form.notas || ''}
            onChange={e =>
              setForm({ ...form, notas: e.target.value })
            }
          />

        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-2 mt-6">

          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>

        </div>

      </div>

    </div>
  )
}