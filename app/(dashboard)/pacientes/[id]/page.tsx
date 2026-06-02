'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Plus, Calendar, FileText, Edit, ArrowLeft, Trash2 } from 'lucide-react'

export default function PacienteDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [paciente, setPaciente] = useState<any>(null)
  const [sesiones, setSesiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      setPaciente(p)

      const { data: s } = await supabase
        .from('sessions')
        .select('*, session_notes(id, observaciones, updated_at)')
        .eq('patient_id', id)
        .order('fecha', { ascending: false })
      setSesiones(s || [])
      setLoading(false)
    }
    load()
  }, [id])

  const nuevaSesion = async () => {
    const { data } = await supabase.from('sessions').insert({
      patient_id: id,
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'presencial',
      estado: 'pendiente',
    }).select().single()

    if (data) router.push(`/consulta/nueva?sesion=${data.id}`)
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Cargando..." />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>Cargando datos del paciente...</span>
      </div>
    </div>
  )

  if (!paciente) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Paciente no encontrado" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>No se encontró el paciente</span>
      </div>
    </div>
  )

  const edad = paciente.fecha_nacimiento
    ? new Date().getFullYear() - new Date(paciente.fecha_nacimiento).getFullYear()
    : null

  const estadoColor = (estado: string) => {
    if (estado === 'activo') return { bg: '#EAF3DE', color: '#3B6D11' }
    if (estado === 'en_pausa') return { bg: '#FAEEDA', color: '#854F0B' }
    return { bg: '#F4F4F4', color: '#6B7280' }
  }

  const sesionEstadoColor = (estado: string) => {
    if (estado === 'completada') return { bg: '#EAF3DE', color: '#3B6D11' }
    if (estado === 'cancelada') return { bg: '#FCEBEB', color: '#A32D2D' }
    return { bg: '#EEF2FF', color: '#4338CA' }
  }

  const ec = estadoColor(paciente.estado)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title={`${paciente.nombre} ${paciente.apellido}`}>
        <button onClick={() => router.back()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#4B5563', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '7px 12px', fontSize: 13, cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Volver
        </button>
        <button onClick={nuevaSesion}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <Plus size={14} /> Nueva sesión
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

        {/* DATOS DEL PACIENTE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ height: 4, background: 'var(--vino)' }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--vino-pale)', color: 'var(--vino)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500 }}>
                  {paciente.nombre[0]}{paciente.apellido[0]}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{paciente.nombre} {paciente.apellido}</div>
                  {edad && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{edad} años</div>}
                </div>
              </div>

              <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: ec.bg, color: ec.color, marginBottom: 16 }}>
                {paciente.estado === 'activo' ? 'Activo' : paciente.estado === 'en_pausa' ? 'En pausa' : 'Alta'}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {paciente.email && (
                  <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Correo</div>
                    <div style={{ fontSize: 13, color: '#1F2937' }}>{paciente.email}</div>
                  </div>
                )}
                {paciente.telefono && (
                  <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Teléfono</div>
                    <div style={{ fontSize: 13, color: '#1F2937' }}>{paciente.telefono}</div>
                  </div>
                )}
                {paciente.ocupacion && (
                  <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Ocupación</div>
                    <div style={{ fontSize: 13, color: '#1F2937' }}>{paciente.ocupacion}</div>
                  </div>
                )}
                {paciente.motivo_consulta && (
                  <div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>Motivo de consulta</div>
                    <div style={{ fontSize: 13, color: '#1F2937', lineHeight: 1.5 }}>{paciente.motivo_consulta}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push(`/pacientes/${id}/editar`)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', color: 'var(--vino)', border: '0.5px solid var(--vino-border)', borderRadius: 6, padding: '8px', fontSize: 13, cursor: 'pointer', marginTop: 16 }}>
                <Edit size={13} /> Editar datos
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`¿Eliminar a ${paciente.nombre} ${paciente.apellido}? Esta acción eliminará también todas sus sesiones e informes.`)) return
                  const res = await fetch(`/api/pacientes/${id}`, { method: 'DELETE' })
                  if (res.ok) {
                    router.push('/pacientes')
                  } else {
                    alert('Error al eliminar paciente')
                  }
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', justifyContent: 'center', marginTop: 8 }}>
                <Trash2 size={14} /> Eliminar paciente
              </button>
            </div>
          </div>

          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', marginBottom: 12 }}>Resumen</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#1F2937' }}>{sesiones.length}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>Sesiones</div>
              </div>
              <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#1F2937' }}>
                  {sesiones.filter(s => s.estado === 'completada').length}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>Completadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* HISTORIAL DE SESIONES */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 3, height: 15, background: 'var(--vino)', borderRadius: 2 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1F2937' }}>Historial de sesiones</span>
          </div>

          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 12, overflow: 'hidden' }}>
            {sesiones.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FAFAFA', border: '0.5px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Calendar size={20} color="#9CA3AF" />
                </div>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12 }}>Sin sesiones registradas</p>
                <button onClick={nuevaSesion}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  <Plus size={14} /> Iniciar primera sesión
                </button>
              </div>
            ) : sesiones.map((s, i) => {
              const sc = sesionEstadoColor(s.estado)
              const tieneNotas = s.session_notes?.length > 0
              return (
                <div key={s.id}
                  onClick={() => router.push(`/consulta/nueva?sesion=${s.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < sesiones.length - 1 ? '0.5px solid #E8E8E8' : 'none', cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--vino-pale)', color: 'var(--vino)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={17} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1F2937', marginBottom: 2 }}>
                      Sesión {sesiones.length - i} — {new Date(s.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {s.tipo === 'presencial' ? 'Presencial' : 'Virtual'} · {tieneNotas ? 'Con notas' : 'Sin notas'}
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: sc.bg, color: sc.color }}>
                    {s.estado === 'completada' ? 'Completada' : s.estado === 'cancelada' ? 'Cancelada' : 'Pendiente'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {tieneNotas && <FileText size={14} color="#9CA3AF" />}
                    <span style={{ fontSize: 13, color: 'var(--vino)', fontWeight: 500 }}>→</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}