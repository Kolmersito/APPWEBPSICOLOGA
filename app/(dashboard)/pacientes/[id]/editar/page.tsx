'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 8, padding: '9px 12px', fontSize: 14, color: '#1F2937', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 5, display: 'block',
}

const card = {
  background: '#fff', borderRadius: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
  padding: 22,
}

export default function EditarPacientePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    fecha_nacimiento: '', ocupacion: '', motivo_consulta: '', estado: 'activo', edad: '',
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('patients').select('*').eq('id', id).maybeSingle()
      if (data) {
        const edad = data.fecha_nacimiento
          ? new Date().getFullYear() - new Date(data.fecha_nacimiento).getFullYear()
          : ''
        setForm({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          fecha_nacimiento: data.fecha_nacimiento || '',
          ocupacion: data.ocupacion || '',
          motivo_consulta: data.motivo_consulta || '',
          estado: data.estado || 'activo',
          edad: edad ? edad.toString() : '',
        })
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await supabase.from('patients').update({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email || null,
      telefono: form.telefono || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      ocupacion: form.ocupacion || null,
      motivo_consulta: form.motivo_consulta || null,
      estado: form.estado,
    }).eq('id', id)

    window.location.href = `/pacientes/${id}`
  }

  if (loading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Editar paciente">
        <button type="button" onClick={() => router.back()}
          style={{ background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
          Cancelar
        </button>
        <button type="submit" form="form-editar" disabled={saving}
          style={{ background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? .7 : 1 }}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '24px', background: '#F7F8FA', overflow: 'auto' }}>
        <form id="form-editar" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 860 }}>

            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 4, height: 18, background: 'var(--vino)', borderRadius: 2 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>Datos personales</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nombre *</label>
                    <input required style={inputStyle} value={form.nombre} onChange={e => set('nombre', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido *</label>
                    <input required style={inputStyle} value={form.apellido} onChange={e => set('apellido', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Correo electrónico</label>
                  <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input style={inputStyle} value={form.telefono} onChange={e => set('telefono', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Fecha de nacimiento</label>
                  <input type="date" style={inputStyle} value={form.fecha_nacimiento} onChange={e => set('fecha_nacimiento', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Edad</label>
                  <input type="number" min="0" max="120" style={inputStyle} value={form.edad} onChange={e => {
                    const edad = parseInt(e.target.value) || 0
                    const fechaNacimiento = new Date()
                    fechaNacimiento.setFullYear(new Date().getFullYear() - edad)
                    set('edad', e.target.value)
                    set('fecha_nacimiento', fechaNacimiento.toISOString().split('T')[0])
                  }} />
                </div>
                <div>
                  <label style={labelStyle}>Ocupación</label>
                  <input style={inputStyle} value={form.ocupacion} onChange={e => set('ocupacion', e.target.value)} />
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}