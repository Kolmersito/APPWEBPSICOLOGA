'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { EditorNotas } from '@/components/sesiones/editor-notas'
import { exportarInformePDF } from '@/lib/export-pdf'
import { Download, ArrowLeft, Check } from 'lucide-react'

export default function InformeDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [informe, setInforme] = useState<any>(null)
  const [paciente, setPaciente] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [contenido, setContenido] = useState('')
  const [titulo, setTitulo] = useState('')
  const [estado, setEstado] = useState('borrador')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reports')
        .select('*, patients(nombre, apellido)')
        .eq('id', id)
        .maybeSingle()

      if (data) {
        setInforme(data)
        setPaciente(data.patients)
        setTitulo(data.titulo || '')
        setEstado(data.estado || 'borrador')
        setContenido(data.contenido_json?.texto || '')
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleSave = async (nuevoEstado?: string) => {
    setSaving(true)
    const estadoFinal = nuevoEstado || estado

    await supabase.from('reports').update({
      titulo,
      estado: estadoFinal,
      contenido_json: { ...informe?.contenido_json, texto: contenido },
    }).eq('id', id)

    setEstado(estadoFinal)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return null

  if (!informe) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Informe no encontrado" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FA' }}>
        <span style={{ color: '#9CA3AF', fontSize: 13 }}>No se encontró el informe</span>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title={titulo || 'Informe'}>
        <button onClick={() => router.push('/informes')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
          <ArrowLeft size={14} /> Volver
        </button>
        <button onClick={() => exportarInformePDF(informe, paciente)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F9FAFB', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
          <Download size={14} /> Exportar PDF
        </button>
        {estado === 'borrador' && (
          <button onClick={() => handleSave('finalizado')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            <Check size={14} /> Marcar finalizado
          </button>
        )}
        <button onClick={() => handleSave()} disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: saved ? '#F0FDF4' : 'var(--vino)', color: saved ? '#16A34A' : '#fff', border: saved ? '1px solid #BBF7D0' : 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>
          {saved ? <><Check size={14} /> Guardado</> : saving ? 'Guardando...' : 'Guardar'}
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '24px', background: '#F7F8FA', overflow: 'auto' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ENCABEZADO DEL INFORME */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)', padding: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF', marginBottom: 6 }}>Título del informe</div>
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  style={{ width: '100%', fontSize: 20, fontWeight: 700, color: '#1F2937', border: 'none', outline: 'none', background: 'transparent', padding: 0 }}
                  placeholder="Título del informe..."
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <span style={{
                  display: 'inline-flex', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: estado === 'finalizado' ? '#F0FDF4' : '#FEF3C7',
                  color: estado === 'finalizado' ? '#16A34A' : '#D97706'
                }}>
                  {estado === 'finalizado' ? '✓ Finalizado' : '⏳ Borrador'}
                </span>
                {paciente && (
                  <span style={{ fontSize: 13, color: '#6B7280' }}>
                    {paciente.nombre} {paciente.apellido}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* EDITOR */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 4, height: 18, background: 'var(--vino)', borderRadius: 2 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>Contenido del informe</span>
            </div>
            <EditorNotas
              contenido={contenido}
              placeholder="El contenido del informe aparecerá aquí. Puedes editarlo directamente..."
              onChange={(html) => setContenido(html)}
              minHeight={500}
            />
          </div>

        </div>
      </div>
    </div>
  )
}