'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { FileText, Image, Video, BookOpen, Upload, X } from 'lucide-react'

export default function MaterialesClient({ initialMaterials }: { initialMaterials: any[] }) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [materiales, setMateriales] = useState<any[]>(initialMaterials || [])
  const [subiendo, setSubiendo] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState({ titulo: '', categoria: '', tipo: 'pdf' })
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  async function cargarMateriales() {
    const { data } = await supabase
      .from('support_materials')
      .select('*')
      .order('created_at', { ascending: false })
    setMateriales(data || [])
  }

  async function handleSubir() {
    if (!archivoSeleccionado || !form.titulo) return
    setSubiendo(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext = archivoSeleccionado.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('materiales')
      .upload(path, archivoSeleccionado)

    if (uploadError) {
      console.error(uploadError)
      setSubiendo(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('materiales')
      .getPublicUrl(path)

    await supabase.from('support_materials').insert({
      psicologa_id: user.id,
      titulo: form.titulo,
      tipo: form.tipo,
      categoria: form.categoria || null,
      url_archivo: urlData.publicUrl,
    })

    // invalidate server cache so server pages pick up the new material
    try {
      await fetch('/api/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'materials' }),
      })
    } catch (e) {
      console.warn('Cache invalidation failed', e)
    }

    setSubiendo(false)
    setModalAbierto(false)
    setForm({ titulo: '', categoria: '', tipo: 'pdf' })
    setArchivoSeleccionado(null)
    cargarMateriales()
  }

  useEffect(() => {
    setLoading(false)
  }, [])

  const porCategoria: Record<string, any[]> = {}
  materiales.forEach(m => {
    const cat = m.categoria || 'General'
    if (!porCategoria[cat]) porCategoria[cat] = []
    porCategoria[cat].push(m)
  })

  const iconoTipo = (tipo: string) => {
    if (tipo === 'pdf') return <FileText size={18} />
    if (tipo === 'imagen') return <Image size={18} />
    if (tipo === 'video') return <Video size={18} />
    return <BookOpen size={18} />
  }

  const colorTipo = (tipo: string) => {
    if (tipo === 'pdf') return { bg: '#FCEBEB', color: '#A32D2D' }
    if (tipo === 'imagen') return { bg: '#F5E8EA', color: '#6B1F2A' }
    if (tipo === 'video') return { bg: '#FAEEDA', color: '#854F0B' }
    return { bg: '#EAF3DE', color: '#3B6D11' }
  }

  const inputStyle = {
    width: '100%', background: '#FAFAFA', border: '0.5px solid #E8E8E8',
    borderRadius: 6, padding: '8px 10px', fontSize: 13, color: '#1F2937', outline: 'none',
  }

  if (loading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Materiales de apoyo">
        <button
          onClick={() => setModalAbierto(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          <Upload size={14} /> Subir material
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto' }}>
        {materiales.length === 0 ? (
          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: '48px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FAFAFA', border: '0.5px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <BookOpen size={20} color="#9CA3AF" />
            </div>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12 }}>No hay materiales subidos aún</p>
            <button onClick={() => setModalAbierto(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Upload size={14} /> Subir primer material
            </button>
          </div>
        ) : Object.entries(porCategoria).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{cat}</span>
              <div style={{ flex: 1, height: '0.5px', background: '#E8E8E8' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {items.map(m => {
                const c = colorTipo(m.tipo)
                return (
                  <a key={m.id} href={m.url_archivo} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 8, padding: 14, cursor: 'pointer', textDecoration: 'none', display: 'block' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      {iconoTipo(m.tipo)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', lineHeight: 1.3, marginBottom: 2 }}>{m.titulo}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{m.tipo.toUpperCase()} · {m.categoria || 'General'}</div>
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>Subir material</span>
              <button onClick={() => setModalAbierto(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Título *</div>
              <input style={inputStyle} value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Nombre del material" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Categoría</div>
              <input style={inputStyle} value={form.categoria} onChange={e => set('categoria', e.target.value)} placeholder="Ej: Ansiedad, TCC, Evaluación..." />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Tipo</div>
              <select style={inputStyle} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="imagen">Imagen</option>
                <option value="video">Video</option>
                <option value="enlace">Enlace</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Archivo *</div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '1px dashed #E8E8E8', borderRadius: 8, padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
                {archivoSeleccionado ? (
                  <span style={{ fontSize: 13, color: '#1F2937' }}>{archivoSeleccionado.name}</span>
                ) : (
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>Clic para seleccionar archivo</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={e => setArchivoSeleccionado(e.target.files?.[0] || null)}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setModalAbierto(false)}
                style={{ flex: 1, background: '#fff', color: '#4B5563', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '9px', fontSize: 13, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleSubir} disabled={subiendo || !form.titulo || !archivoSeleccionado}
                style={{ flex: 1, background: subiendo ? '#E8E8E8' : 'var(--vino)', color: subiendo ? '#9CA3AF' : '#fff', border: 'none', borderRadius: 6, padding: '9px', fontSize: 13, fontWeight: 500, cursor: subiendo ? 'not-allowed' : 'pointer' }}>
                {subiendo ? 'Subiendo...' : 'Subir material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
