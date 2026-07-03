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
    nombre: '',
    tipo_persona: 'MORAL',
    rfc: '',
    contacto_nombre: '',
    contacto_email: '',
    contacto_telefono: '',
    ciudad: '',
    estado: '',
    estado_cuenta: 'ACTIVO',
  })

  const mutation = useMutation({
    mutationFn: () => clientesService.crear(form),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['clientes']
      })

      onClose()
    },

    onError: (err) => {
      console.error(err)
    }
  })

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl p-6 w-full max-w-lg">

        <h2 className="text-lg font-semibold mb-4">
          Nuevo Cliente
        </h2>

        <div className="space-y-3">

          <Input
            label="Nombre"
            value={form.nombre || ''}
            onChange={e =>
              setForm({
                ...form,
                nombre: e.target.value
              })
            }
          />

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

          <Input
            label="RFC"
            value={form.rfc || ''}
            onChange={e =>
              setForm({
                ...form,
                rfc: e.target.value
              })
            }
          />

          <Input
            label="Contacto"
            value={form.contacto_nombre || ''}
            onChange={e =>
              setForm({
                ...form,
                contacto_nombre: e.target.value
              })
            }
          />

          <Input
            label="Email"
            value={form.contacto_email || ''}
            onChange={e =>
              setForm({
                ...form,
                contacto_email: e.target.value
              })
            }
          />

          <Input
            label="Teléfono"
            value={form.contacto_telefono || ''}
            onChange={e =>
              setForm({
                ...form,
                contacto_telefono: e.target.value
              })
            }
          />

          <Input
            label="Ciudad"
            value={form.ciudad || ''}
            onChange={e =>
              setForm({
                ...form,
                ciudad: e.target.value
              })
            }
          />

          <Input
            label="Estado"
            value={form.estado || ''}
            onChange={e =>
              setForm({
                ...form,
                estado: e.target.value
              })
            }
          />

        </div>

        <div className="flex justify-end gap-2 mt-6">

          <Button
            variant="secondary"
            onClick={onClose}
          >
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