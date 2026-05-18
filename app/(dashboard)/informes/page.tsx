'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { FileText, Download, Edit, Plus, X, Sparkles } from 'lucide-react'

export default function InformesPage() {
  const supabase = createClient()
  const [informes, setInformes] = useState<any[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [form, setForm] = useState({ patient_id: '', titulo: '', tipo: 'evolucion' })
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data: i } = await supabase
      .from('reports')
      .select('*, patients(nombre, apellido)')
      .order('created_at', { ascending: false })
    setInformes(i || [])

    const { data: p } = await supabase
      .from('patients')
      .select('id, nombre, apellido')
      .eq('estado', 'activo')
    setPacientes(p || [])
  }

  async function handleGenerar() {
    if (!form.patient_id || !form.titulo) return
    setGenerando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: sesiones } = await supabase
      .from('sessions')
      .select('*, session_notes(observaciones, sintomas, avances, temas_tratados)')
      .eq('patient_id', form.patient_id)
      .eq('estado', 'completada')
      .order('fecha', { ascending: true })

    const paciente = pacientes.find(p => p.id === form.patient_id)

    const contenidoSesiones = sesiones?.map((s, i) => {
      const n = s.session_notes?.[0]
      if (!n) return ''
      return `Sesión ${i + 1} (${s.fecha}):
Observaciones: ${n.observaciones?.replace(/<[^>]*>/g, '') || '—'}
Síntomas: ${n.sintomas?.replace(/<[^>]*>/g, '') || '—'}
Avances: ${n.avances?.replace(/<[^>]*>/g, '') || '—'}
Temas: ${n.temas_tratados?.replace(/<[^>]*>/g, '') || '—'}`
    }).filter(Boolean).join('\n\n')

    const prompt = `Eres una psicóloga clínica redactando un informe profesional. Basándote en las siguientes notas de sesión, redacta un informe de ${form.tipo === 'evolucion' ? 'evolución terapéutica' : form.tipo === 'inicial' ? 'evaluación inicial' : 'alta'} para el paciente ${paciente?.nombre} ${paciente?.apellido}.

NOTAS DE SESIONES:
${contenidoSesiones || 'Sin notas disponibles'}

El informe debe incluir: resumen clínico, evolución observada, áreas trabajadas, logros alcanzados y recomendaciones. Usa un tono profesional y clínico. Responde en español.`

    const res = await fetch('/api/ai/analizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_override: prompt }),
    })

    const aiData = await res.json()
    const contenido = aiData.texto || 'No se pudo generar el informe.'

    await supabase.from('reports').insert({
      patient_id: form.patient_id,
      psicologa_id: user.id,
      titulo: form.titulo,
      contenido_json: { texto: contenido, tipo: form.tipo },
      estado: 'borrador',
    })

    setGenerando(false)
    setModalAbierto(false)
    setForm({ patient_id: '', titulo: '', tipo: 'evolucion' })
    cargar()
  }

  const inputStyle = {
    width: '100%', background: '#FAFAFA', border: '0.5px solid #E8E8E8',
    borderRadius: 6, padding: '8px 10px', fontSize: 13, color: '#1F2937', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Informes clínicos">
        <button
          onClick={() => setModalAbierto(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <Plus size={14} /> Nuevo informe
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto' }}>
        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, overflow: 'hidden' }}>
          {informes.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FAFAFA', border: '0.5px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <FileText size={20} color="#9CA3AF" />
              </div>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12 }}>No hay informes generados aún</p>
              <button onClick={() => setModalAbierto(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <Plus size={14} /> Crear primer informe
              </button>
            </div>
          ) : informes.map((inf, i) => {
            const paciente = (inf as any).patients
            return (
              <div key={inf.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < informes.length - 1 ? '0.5px solid #E8E8E8' : 'none' }}>
                <div style={{ width: 38, height: 38, background: 'var(--vino-pale)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vino)', flexShrink: 0 }}>
                  <FileText size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1F2937' }}>{inf.titulo}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    {paciente ? `${paciente.nombre} ${paciente.apellido}` : '—'} · {new Date(inf.created_at).toLocaleDateString('es-MX')}
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: inf.estado === 'finalizado' ? '#EAF3DE' : '#FAEEDA',
                  color: inf.estado === 'finalizado' ? '#3B6D11' : '#854F0B'
                }}>
                  {inf.estado === 'finalizado' ? 'Finalizado' : 'Borrador'}
                </span>
                <button
                  onClick={() => {
                    const texto = inf.contenido_json?.texto || ''
                    const blob = new Blob([texto], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${inf.titulo}.txt`
                    a.click()
                  }}
                  style={{ background: '#FAFAFA', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#4B5563', display: 'flex', alignItems: 'center' }}>
                  <Download size={15} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {modalAbierto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>Nuevo informe</span>
              <button onClick={() => setModalAbierto(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Paciente *</div>
              <select style={inputStyle} value={form.patient_id} onChange={e => set('patient_id', e.target.value)}>
                <option value="">Seleccionar paciente</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Título del informe *</div>
              <input style={inputStyle} value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ej: Informe de evolución — Mayo 2026" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Tipo de informe</div>
              <select style={inputStyle} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                <option value="evolucion">Evolución terapéutica</option>
                <option value="inicial">Evaluación inicial</option>
                <option value="alta">Informe de alta</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setModalAbierto(false)}
                style={{ flex: 1, background: '#fff', color: '#4B5563', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '9px', fontSize: 13, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleGenerar} disabled={generando || !form.patient_id || !form.titulo}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: generando ? '#E8E8E8' : 'var(--vino)', color: generando ? '#9CA3AF' : '#fff', border: 'none', borderRadius: 6, padding: '9px', fontSize: 13, fontWeight: 500, cursor: generando ? 'not-allowed' : 'pointer' }}>
                <Sparkles size={13} />
                {generando ? 'Generando...' : 'Generar con IA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}