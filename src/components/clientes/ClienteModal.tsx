import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesService } from '../../api'
import { Button, Input, Select } from '../ui'
import type { Cliente } from '../../types'

interface Props {
  onClose: () => void
}

function obtenerMensajeError(error: any): string {
  const data = error?.response?.data

  if (!data) {
    return 'No fue posible guardar el cliente. Intenta nuevamente.'
  }

  if (typeof data === 'string') return data

  return Object.entries(data)
    .map(([campo, mensajes]) => {
      const texto = Array.isArray(mensajes)
        ? mensajes.join(', ')
        : String(mensajes)

      return `${campo}: ${texto}`
    })
    .join(' | ')
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
    pais: 'Colombia',
    estado_cuenta: 'ACTIVO',
    notas: ''
  })

  const [errorMensaje, setErrorMensaje] = useState('')
  const [validacion, setValidacion] = useState('')

  const actualizarCampo = (campo: string, valor: string) => {
    setForm(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        rfc: form.rfc?.trim() || null,
        razon_social: form.tipo_persona === 'MORAL'
          ? form.razon_social?.trim() || ''
          : '',
        nombre: form.nombre?.trim(),
        contacto_nombre: form.contacto_nombre?.trim(),
        contacto_email: form.contacto_email?.trim(),
      }

      return clientesService.crear(payload)
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] })
      onClose()
    },

    onError: (err: any) => {
      setErrorMensaje(obtenerMensajeError(err))
    }
  })

  const guardarCliente = () => {
    setErrorMensaje('')
    setValidacion('')

    if (!form.nombre?.trim()) {
      setValidacion('El nombre del cliente es obligatorio.')
      return
    }

    if (!form.contacto_nombre?.trim()) {
      setValidacion('El nombre del contacto principal es obligatorio.')
      return
    }

    if (!form.contacto_email?.trim()) {
      setValidacion('El correo electrónico es obligatorio.')
      return
    }

    const email = form.contacto_email.trim()
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!emailValido) {
      setValidacion('Ingresa un correo electrónico válido.')
      return
    }

    if (form.rfc?.trim().length === 0) {
      setForm(prev => ({ ...prev, rfc: '' }))
    }

    mutation.mutate()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg font-semibold mb-5">
          Nuevo Cliente
        </h2>

        <div className="space-y-6">

          {/* INFORMACIÓN DEL CLIENTE */}
          <section className="space-y-3">
            <h3 className="font-semibold text-gray-700">
              Información del cliente
            </h3>

            <Select
              value={form.tipo_persona}
              onChange={e => {
                actualizarCampo(
                  'tipo_persona',
                  e.target.value
                )
              }}
            >
              <option value="MORAL">Persona Moral / Empresa</option>
              <option value="FISICA">Persona Física</option>
            </Select>

            <Input
              label="Nombre *"
              value={form.nombre || ''}
              onChange={e => actualizarCampo('nombre', e.target.value)}
            />

            <Input
              label="RFC (opcional)"
              value={form.rfc || ''}
              onChange={e => actualizarCampo('rfc', e.target.value.toUpperCase())}
            />

            {form.tipo_persona === 'MORAL' && (
              <Input
                label="Razón Social"
                value={form.razon_social || ''}
                onChange={e => actualizarCampo('razon_social', e.target.value)}
              />
            )}
          </section>

          {/* CONTACTO PRINCIPAL */}
          <section className="space-y-3">
            <h3 className="font-semibold text-gray-700">
              Contacto principal
            </h3>

            <Input
              label="Nombre del contacto *"
              value={form.contacto_nombre || ''}
              onChange={e => actualizarCampo('contacto_nombre', e.target.value)}
            />

            <Input
              label="Correo electrónico *"
              value={form.contacto_email || ''}
              onChange={e => actualizarCampo('contacto_email', e.target.value)}
            />

            <Input
              label="Teléfono"
              value={form.contacto_telefono || ''}
              onChange={e => actualizarCampo('contacto_telefono', e.target.value)}
            />
          </section>

          {/* DIRECCIÓN */}
          <section className="space-y-3">
            <h3 className="font-semibold text-gray-700">
              Dirección
            </h3>

            <Input
              label="Calle"
              value={form.calle || ''}
              onChange={e => actualizarCampo('calle', e.target.value)}
            />

            <Input
              label="Ciudad"
              value={form.ciudad || ''}
              onChange={e => actualizarCampo('ciudad', e.target.value)}
            />

            <Input
              label="Estado / Provincia"
              value={form.estado || ''}
              onChange={e => actualizarCampo('estado', e.target.value)}
            />

            <Input
              label="Código Postal"
              value={form.codigo_postal || ''}
              onChange={e => actualizarCampo('codigo_postal', e.target.value)}
            />

            <Input
              label="País"
              value={form.pais || ''}
              onChange={e => actualizarCampo('pais', e.target.value)}
            />
          </section>

          {/* ADMINISTRACIÓN */}
          <section className="space-y-3">
            <h3 className="font-semibold text-gray-700">
              Administración
            </h3>

            <Select
              value={form.estado_cuenta}
              onChange={e => actualizarCampo('estado_cuenta', e.target.value)}
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
              <option value="SUSPENDIDO">Suspendido</option>
            </Select>

            <Input
              label="Notas"
              value={form.notas || ''}
              onChange={e => actualizarCampo('notas', e.target.value)}
            />
          </section>

        </div>

        {/* MENSAJES */}
        {validacion && (
          <p className="text-sm text-red-600 mt-4">
            {validacion}
          </p>
        )}

        {errorMensaje && (
          <p className="text-sm text-red-600 mt-4">
            Error: {errorMensaje}
          </p>
        )}

        {/* BOTONES */}
        <div className="flex justify-end gap-2 mt-6">

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={guardarCliente}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>

        </div>

      </div>
    </div>
  )
}
