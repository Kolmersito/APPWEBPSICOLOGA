import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { FileText, Image, Video } from 'lucide-react'

export default async function MaterialesPage() {
  const supabase = await createClient()
  const { data: materiales } = await supabase
    .from('support_materials')
    .select('*')
    .order('created_at', { ascending: false })

  const porCategoria: Record<string, typeof materiales> = {}
  materiales?.forEach(m => {
    const cat = m.categoria || 'General'
    if (!porCategoria[cat]) porCategoria[cat] = []
    porCategoria[cat]!.push(m)
  })

  const iconoTipo = (tipo: string) => {
    if (tipo === 'pdf') return <FileText size={18} />
    if (tipo === 'imagen') return <Image size={18} />
    return <Video size={18} />
  }

  const colorTipo = (tipo: string) => {
    if (tipo === 'pdf') return { bg: '#FCEBEB', color: '#A32D2D' }
    if (tipo === 'imagen') return { bg: '#F5E8EA', color: '#6B1F2A' }
    return { bg: '#FAEEDA', color: '#854F0B' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Materiales de apoyo">
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
          + Subir material
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto' }}>
        {(!materiales || materiales.length === 0) ? (
          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No hay materiales subidos aún
          </div>
        ) : Object.entries(porCategoria).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>{cat}</span>
              <div style={{ flex: 1, height: '0.5px', background: '#E8E8E8' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {items?.map(m => {
                const c = colorTipo(m.tipo)
                return (
                  <div key={m.id} style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 8, padding: 14, cursor: 'pointer' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      {iconoTipo(m.tipo)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937', lineHeight: 1.3, marginBottom: 2 }}>{m.titulo}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{m.tipo.toUpperCase()} · {m.categoria}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}