'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { EditorNotas } from '@/components/sesiones/editor-notas'
import { Sparkles, Brain, FileText, Image, Video, BookOpen, Plus, CheckCircle, Circle } from 'lucide-react'

const consejos = [
  'Recuerda validar las emociones antes de ofrecer soluciones.',
  'El silencio terapéutico puede ser más poderoso que cualquier intervención.',
  'Verifica si el paciente logró las actividades de la semana pasada.',
  'Considera explorar el contexto familiar si hay resistencia al cambio.',
  'Una pregunta abierta al inicio activa mejor la sesión que una directiva.',
]

const inputStyle = {
  width: '100%', background: '#FAFAFA', border: '0.5px solid #E8E8E8',
  borderRadius: 6, padding: '9px 12px', fontSize: 14, color: '#1F2937', outline: 'none',
}

export default function NuevaConsultaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const fecha = searchParams.get('fecha') || new Date().toISOString().split('T')[0]
  const sesionId = searchParams.get('sesion')

  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [consejo] = useState(consejos[Math.floor(Math.random() * consejos.length)])
  const [materiales, setMateriales] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [nuevaActividad, setNuevaActividad] = useState('')
  const [notes, setNotes] = useState<any>(null)

  const [form, setForm] = useState({
    nombre: '', apellido: '', edad: '', telefono: '', email: '',
  })
  const [observaciones, setObservaciones] = useState('')
  const [observacionesJson, setObservacionesJson] = useState<object>({})
  const [sintomas, setSintomas] = useState('')
  const [avances, setAvances] = useState('')
  const [temas, setTemas] = useState('')

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  useEffect(() => {
    async function load() {
      const { data: m } = await supabase.from('support_materials').select('*').limit(5)
      setMateriales(m || [])

      if (sesionId) {
        const { data: s } = await supabase
          .from('sessions')
          .select('*, patients(nombre, apellido, telefono, email, fecha_nacimiento)')
          .eq('id', sesionId).single()
        if (s?.patients) {
          const p = s.patients
          const edad = p.fecha_nacimiento
            ? String(new Date().getFullYear() - new Date(p.fecha_nacimiento).getFullYear())
            : ''
          setForm({ nombre: p.nombre || '', apellido: p.apellido || '', edad, telefono: p.telefono || '', email: p.email || '' })
        }

        const { data: n } = await supabase.from('session_notes').select('*').eq('session_id', sesionId).maybeSingle()
        if (n) {
          setNotes(n)
          setObservaciones(n.observaciones || '')
          setSintomas(n.sintomas || '')
          setAvances(n.avances || '')
          setTemas(n.temas_tratados || '')
        }

        const { data: a } = await supabase.from('activities').select('*').eq('session_id', sesionId)
        setActivities(a || [])

        if (n) {
          const { data: sg } = await supabase.from('ai_suggestions').select('*').eq('session_note_id', n.id)
          setSuggestions(sg || [])
        }
      }
    }
    load()
  }, [sesionId])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let patientId: string
    let sessionId: string = sesionId || ''

    if (!sesionId) {
      const { data: p } = await supabase.from('patients').insert({
        psicologa_id: user.id,
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        email: form.email,
        estado: 'activo',
      }).select().single()
      patientId = p!.id

      const { data: s } = await supabase.from('sessions').insert({
        patient_id: patientId,
        fecha,
        tipo: 'presencial',
        estado: 'completada',
      }).select().single()
      sessionId = s!.id
    }

    const payload = {
      session_id: sessionId,
      observaciones, observaciones_json: observacionesJson,
      sintomas, avances, temas_tratados: temas,
      updated_at: new Date().toISOString(),
    }

    if (notes) {
      await supabase.from('session_notes').update(payload).eq('id', notes.id)
    } else {
      const { data } = await supabase.from('session_notes').insert(payload).select().single()
      setNotes(data)
    }

    setSaving(false)
    router.push('/dashboard')
  }

  const handleAnalyzeIA = async () => {
    if (!observaciones) return
    setAnalyzing(true)
    const res = await fetch('/api/ai/analizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_note_id: notes?.id, observaciones, sintomas, avances, temas }),
    })
    const data = await res.json()
    if (data.suggestions) setSuggestions(data.suggestions)
    setAnalyzing(false)
  }

  const agregarActividad = async () => {
    if (!nuevaActividad.trim() || !sesionId) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('activities').insert({
      session_id: sesionId, titulo: nuevaActividad, estado: 'pendiente',
      patient_id: (await supabase.from('sessions').select('patient_id').eq('id', sesionId).single()).data?.patient_id,
    }).select().single()
    if (data) setActivities(prev => [...prev, data])
    setNuevaActividad('')
  }

  const toggleActividad = async (act: any) => {
    const nuevo = act.estado === 'completada' ? 'pendiente' : 'completada'
    await supabase.from('activities').update({ estado: nuevo }).eq('id', act.id)
    setActivities(prev => prev.map(a => a.id === act.id ? { ...a, estado: nuevo } : a))
  }

  const tipColor = (tipo: string) => {
    if (tipo === 'alerta') return { bg: '#FCEBEB', color: '#A32D2D', label: 'alerta' }
    if (tipo === 'punto_omitido') return { bg: '#FAEEDA', color: '#854F0B', label: 'no registrado' }
    return { bg: '#F5E8EA', color: '#6B1F2A', label: 'sugerencia' }
  }

  const iconoMaterial = (tipo: string) => {
    if (tipo === 'pdf') return <FileText size={14} />
    if (tipo === 'imagen') return <Image size={14} />
    if (tipo === 'video') return <Video size={14} />
    return <BookOpen size={14} />
  }

  const colorMaterial = (tipo: string) => {
    if (tipo === 'pdf') return { bg: '#FCEBEB', color: '#A32D2D' }
    if (tipo === 'imagen') return { bg: '#F5E8EA', color: '#6B1F2A' }
    return { bg: '#FAEEDA', color: '#854F0B' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title={sesionId ? `${form.nombre} ${form.apellido} — Sesión` : 'Nueva consulta'}>
        <button onClick={() => router.back()} style={{ background: '#fff', color: '#4B5563', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving} style={{ background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          {saving ? 'Guardando...' : 'Guardar sesión'}
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '16px 20px', background: '#FAFAFA', overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

        {/* FORMULARIO PRINCIPAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* DATOS DEL PACIENTE */}
          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 3, height: 15, background: 'var(--vino)', borderRadius: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1F2937' }}>Datos del paciente</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Nombre</div>
                <input style={inputStyle} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ana" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Apellido</div>
                <input style={inputStyle} value={form.apellido} onChange={e => set('apellido', e.target.value)} placeholder="García" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Edad</div>
                <input style={inputStyle} type="number" value={form.edad} onChange={e => set('edad', e.target.value)} placeholder="29" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Teléfono</div>
                <input style={inputStyle} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+52 55 0000 0000" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Correo electrónico</div>
                <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ana@correo.com" />
              </div>
            </div>
          </div>

          {/* NOTAS */}
          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 3, height: 15, background: 'var(--vino)', borderRadius: 2 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1F2937' }}>Observaciones generales</span>
            </div>
            <EditorNotas
              contenido={observaciones}
              placeholder="Describe el estado general del paciente, actitud, lenguaje corporal, comentarios relevantes..."
              onChange={(html, json) => { setObservaciones(html); setObservacionesJson(json) }}
              minHeight={150}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', marginBottom: 12 }}>Síntomas detectados</div>
              <EditorNotas contenido={sintomas} placeholder="Lista síntomas observados..." onChange={(html) => setSintomas(html)} minHeight={110} />
            </div>
            <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', marginBottom: 12 }}>Avances observados</div>
              <EditorNotas contenido={avances} placeholder="Registra avances o mejoras..." onChange={(html) => setAvances(html)} minHeight={110} />
            </div>
          </div>

          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', marginBottom: 12 }}>Temas tratados</div>
            <EditorNotas contenido={temas} placeholder="¿Qué temas o técnicas se trabajaron?" onChange={(html) => setTemas(html)} minHeight={90} />
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* IA */}
          <div style={{ background: '#fff', border: '0.5px solid var(--vino-border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: 'var(--vino-pale)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--vino-border)' }}>
              <Sparkles size={14} color="var(--vino)" />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--vino)', flex: 1 }}>Asistencia IA</span>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: suggestions.length > 0 ? '#3B6D11' : '#9CA3AF' }} />
            </div>

            {suggestions.length === 0 ? (
              <div style={{ padding: 14 }}>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10, lineHeight: 1.5, fontStyle: 'italic' }}>"{consejo}"</p>
                <button onClick={handleAnalyzeIA} disabled={analyzing || !observaciones}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: analyzing ? '#E8E8E8' : 'var(--vino)', color: analyzing ? '#9CA3AF' : '#fff', border: 'none', borderRadius: 6, padding: '8px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                  <Brain size={13} />
                  {analyzing ? 'Analizando...' : 'Analizar con IA'}
                </button>
              </div>
            ) : (
              <>
                {suggestions.map((s) => {
                  const c = tipColor(s.tipo)
                  return (
                    <div key={s.id} style={{ padding: '10px 14px', borderBottom: '0.5px solid #E8E8E8', display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4, background: c.bg, color: c.color, flexShrink: 0, marginTop: 2 }}>{c.label}</span>
                      <span style={{ fontSize: 11, color: '#4B5563', lineHeight: 1.5 }}>{s.sugerencia}</span>
                    </div>
                  )
                })}
                <div style={{ padding: 10 }}>
                  <button onClick={handleAnalyzeIA} disabled={analyzing}
                    style={{ width: '100%', background: 'transparent', color: 'var(--vino)', border: '0.5px solid var(--vino-border)', borderRadius: 6, padding: '6px', fontSize: 11, cursor: 'pointer' }}>
                    Re-analizar
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ACTIVIDADES */}
          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', marginBottom: 10 }}>Actividades asignadas</div>
            {activities.map(act => (
              <div key={act.id} onClick={() => toggleActividad(act)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid #E8E8E8', cursor: 'pointer' }}>
                {act.estado === 'completada' ? <CheckCircle size={14} color="#3B6D11" /> : <Circle size={14} color="#9CA3AF" />}
                <span style={{ fontSize: 12, color: act.estado === 'completada' ? '#9CA3AF' : '#4B5563', textDecoration: act.estado === 'completada' ? 'line-through' : 'none' }}>{act.titulo}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input value={nuevaActividad} onChange={e => setNuevaActividad(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && agregarActividad()}
                placeholder="Nueva actividad..."
                style={{ flex: 1, background: '#FAFAFA', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '6px 8px', fontSize: 12, outline: 'none' }} />
              <button onClick={agregarActividad}
                style={{ background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* MATERIALES */}
          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '0.5px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>Material de apoyo</span>
              <Link href="/materiales" style={{ fontSize: 12, color: 'var(--vino)', textDecoration: 'none' }}>Ver todo →</Link>
            </div>
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {materiales.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>Sin materiales aún</div>
              ) : materiales.map(m => {
                const c = colorMaterial(m.tipo)
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 6, border: '0.5px solid #E8E8E8', cursor: 'pointer' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {iconoMaterial(m.tipo)}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titulo}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{m.tipo}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}