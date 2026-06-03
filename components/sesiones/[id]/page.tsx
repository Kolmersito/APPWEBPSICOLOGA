'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { EditorNotas } from '@/components/sesiones/editor-notas'
import { Brain, CheckCircle, Circle, Plus, Sparkles } from 'lucide-react'

export default function SesionPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [session, setSession] = useState<any>(null)
  const [notes, setNotes] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [observacionesJson, setObservacionesJson] = useState<object>({})
  const [sintomas, setSintomas] = useState('')
  const [avances, setAvances] = useState('')
  const [temas, setTemas] = useState('')

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase
        .from('sessions')
        .select('*, patients(nombre, apellido)')
        .eq('id', id)
        .single()
      setSession(s)

      const { data: n } = await supabase
        .from('session_notes')
        .select('*')
        .eq('session_id', id)
        .maybeSingle()

      if (n) {
        setNotes(n)
        setObservaciones(n.observaciones || '')
        setSintomas(n.sintomas || '')
        setAvances(n.avances || '')
        setTemas(n.temas_tratados || '')
      }

      const { data: a } = await supabase
        .from('activities')
        .select('*')
        .eq('session_id', id)
      setActivities(a || [])

      if (n) {
        const { data: sg } = await supabase
          .from('ai_suggestions')
          .select('*')
          .eq('session_note_id', n.id)
          .order('created_at', { ascending: false })
        setSuggestions(sg || [])
      }
    }
    load()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        session_id: id,
        observaciones,
        observaciones_json: observacionesJson,
        sintomas,
        avances,
        temas_tratados: temas,
        updated_at: new Date().toISOString(),
      }

      let result
      if (notes) {
        result = await supabase.from('session_notes').update(payload).eq('id', notes.id)
      } else {
        result = await supabase.from('session_notes').insert(payload).select().single()
        if (result.data) setNotes(result.data)
      }

      if (result.error) {
        console.error('Error guardando sesión:', result.error)
        setSaveMessage(`❌ Error: ${result.error.message}`)
      } else {
        setSaveMessage('✓ Guardado correctamente')
        setTimeout(() => setSaveMessage(null), 2000)
      }
    } catch (error) {
      console.error('Error inesperado:', error)
      setSaveMessage('❌ Error inesperado al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleAnalyzeIA = async () => {
    if (!notes && !observaciones) return
    setAnalyzing(true)

    const res = await fetch('/api/ai/analizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_note_id: notes?.id,
        observaciones,
        sintomas,
        avances,
        temas,
      }),
    })

    const data = await res.json()
    if (data.suggestions) setSuggestions(data.suggestions)
    setAnalyzing(false)
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

  const paciente = session?.patients
  const numSesion = session?.id?.slice(-4) ?? '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title={paciente ? `${paciente.nombre} ${paciente.apellido} — Sesión ${numSesion}` : 'Sesión'}>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#4B5563', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
          Materiales
        </button>
        {saveMessage && (
          <span style={{ fontSize: 12, fontWeight: 500, color: saveMessage.includes('❌') ? '#A32D2D' : '#3B6D11' }}>
            {saveMessage}
          </span>
        )}
        <button onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '16px 24px', background: '#FAFAFA', overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {paciente && (
            <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--vino-pale)', color: 'var(--vino)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500 }}>
                {paciente.nombre[0]}{paciente.apellido[0]}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>{paciente.nombre} {paciente.apellido}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                  {new Date(session?.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {session?.tipo}
                </div>
              </div>
              <span style={{ marginLeft: 'auto', display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: '#EAF3DE', color: '#3B6D11' }}>
                {session?.estado}
              </span>
            </div>
          )}

          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937', marginBottom: 10 }}>Observaciones generales</div>
            <EditorNotas
              contenido={observaciones}
              placeholder="Describe el estado general del paciente, actitud, lenguaje corporal, comentarios relevantes..."
              onChange={(html, json) => { setObservaciones(html); setObservacionesJson(json) }}
              minHeight={140}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937', marginBottom: 10 }}>Síntomas detectados</div>
              <EditorNotas
                contenido={sintomas}
                placeholder="Lista síntomas observados en esta sesión..."
                onChange={(html) => setSintomas(html)}
                minHeight={120}
              />
            </div>
            <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937', marginBottom: 10 }}>Avances observados</div>
              <EditorNotas
                contenido={avances}
                placeholder="Registra avances, logros o mejoras del paciente..."
                onChange={(html) => setAvances(html)}
                minHeight={120}
              />
            </div>
          </div>

          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937', marginBottom: 10 }}>Temas tratados</div>
            <EditorNotas
              contenido={temas}
              placeholder="¿Qué temas, técnicas o ejercicios se trabajaron en esta sesión?"
              onChange={(html) => setTemas(html)}
              minHeight={100}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', border: '0.5px solid var(--vino-border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: 'var(--vino-pale)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--vino-border)' }}>
              <Sparkles size={14} color="var(--vino)" />
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--vino)', flex: 1 }}>Asistencia IA</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: suggestions.length > 0 ? '#3B6D11' : '#9CA3AF' }} />
            </div>

            {suggestions.length === 0 ? (
              <div style={{ padding: 14 }}>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12, lineHeight: 1.5 }}>
                  Guarda las notas y analiza con IA para obtener sugerencias clínicas.
                </p>
                <button onClick={handleAnalyzeIA} disabled={analyzing || !observaciones} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: analyzing ? '#E8E8E8' : 'var(--vino)', color: analyzing ? '#9CA3AF' : '#fff', border: 'none', borderRadius: 6, padding: '8px', fontSize: 12, fontWeight: 500, cursor: analyzing ? 'not-allowed' : 'pointer' }}>
                  <Brain size={14} />
                  {analyzing ? 'Analizando...' : 'Analizar con IA'}
                </button>
              </div>
            ) : (
              <>
                {suggestions.map((s) => {
                  const c = tipColor(s.tipo)
                  return (
                    <div key={s.id} style={{ padding: '10px 14px', borderBottom: '0.5px solid #E8E8E8', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4, background: c.bg, color: c.color, flexShrink: 0, marginTop: 2 }}>{c.label}</span>
                      <span style={{ fontSize: 11, color: '#4B5563', lineHeight: 1.5 }}>{s.sugerencia}</span>
                    </div>
                  )
                })}
                <div style={{ padding: '8px 14px' }}>
                  <button onClick={handleAnalyzeIA} disabled={analyzing} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', color: 'var(--vino)', border: '0.5px solid var(--vino-border)', borderRadius: 6, padding: '6px', fontSize: 11, cursor: 'pointer' }}>
                    Re-analizar
                  </button>
                </div>
              </>
            )}
          </div>

          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937', marginBottom: 10 }}>Actividades asignadas</div>
            {activities.map((act) => (
              <div key={act.id} onClick={() => toggleActividad(act)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid #E8E8E8', cursor: 'pointer' }}>
                {act.estado === 'completada'
                  ? <CheckCircle size={14} color="#3B6D11" />
                  : <Circle size={14} color="#9CA3AF" />}
                <span style={{ fontSize: 12, color: act.estado === 'completada' ? '#9CA3AF' : '#4B5563', textDecoration: act.estado === 'completada' ? 'line-through' : 'none' }}>{act.titulo}</span>
              </div>
            ))}
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', color: '#4B5563', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '6px', fontSize: 11, cursor: 'pointer', marginTop: 8 }}>
              <Plus size={12} /> Nueva actividad
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}