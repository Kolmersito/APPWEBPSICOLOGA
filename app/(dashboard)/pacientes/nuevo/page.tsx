'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
    {children}
  </div>
)

const inputStyle = {
  width: '100%', background: '#FAFAFA', border: '0.5px solid #E8E8E8',
  borderRadius: 6, padding: '8px 10px', fontSize: 13, color: '#1F2937',
  outline: 'none',
}

export default function NuevoPacientePage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    fecha_nacimiento: '', ocupacion: '', motivo_consulta: '', estado: 'activo',
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('patients').insert({
      ...form,
      psicologa_id: user.id,
      fecha_nacimiento: form.fecha_nacimiento || null,
    }).select().single()

    if (!error && data) {
      router.push(`/pacientes/${data.id}`)
    } else {
      console.error(error)
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Nuevo paciente">
        <button
          type="button"
          onClick={() => router.back()}
          style={{ background: '#fff', color: '#4B5563', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="form-paciente"
          disabled={saving}
          style={{ background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
        >
          {saving ? 'Guardando...' : 'Guardar paciente'}
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '24px', background: '#FAFAFA', overflow: 'auto' }}>
        <form id="form-paciente" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 780 }}>

            <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 3, height: 14, background: 'var(--vino)', borderRadius: 2 }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>Datos personales</span>
              </div>
              <Field label="Nombre *">
                <input required style={inputStyle} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ana" />
              </Field>
              <Field label="Apellido *">
                <input required style={inputStyle} value={form.apellido} onChange={e => set('apellido', e.target.value)} placeholder="García" />
              </Field>
              <Field label="Correo electrónico">
                <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="ana@correo.com" />
              </Field>
              <Field label="Teléfono">
                <input style={inputStyle} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+52 55 0000 0000" />
              </Field>
              <Field label="Fecha de nacimiento">
                <input type="date" style={inputStyle} value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} />
              </Field>
              <Field label="Ocupación">
                <input style={inputStyle} value={form.ocupacion} onChange={e => set('ocupacion', e.target.value)} placeholder="Diseñadora, estudiante, etc." />
              </Field>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 3, height: 14, background: 'var(--vino)', borderRadius: 2 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>Información clínica</span>
                </div>
                <Field label="Motivo de consulta">
                  <textarea
                    style={{ ...inputStyle, resize: 'none' }}
                    rows={4}
                    value={form.motivo_consulta}
                    onChange={e => set('motivo_consulta', e.target.value)}
                    placeholder="¿Por qué busca atención psicológica?"
                  />
                </Field>
                <Field label="Estado">
                  <select style={inputStyle} value={form.estado} onChange={e => set('estado', e.target.value)}>
                    <option value="activo">Activo</option>
                    <option value="en_pausa">En pausa</option>
                    <option value="alta">Alta</option>
                  </select>
                </Field>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}