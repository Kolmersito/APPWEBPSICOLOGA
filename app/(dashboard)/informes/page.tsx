import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { FileText, Download, Edit } from 'lucide-react'

export default async function InformesPage() {
  const supabase = await createClient()
  const { data: informes } = await supabase
    .from('reports')
    .select('*, patients(nombre, apellido)')
    .order('created_at', { ascending: false })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Informes clínicos">
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          + Nuevo informe
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto' }}>
        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, overflow: 'hidden' }}>
          {(!informes || informes.length === 0) ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
              No hay informes generados aún
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
                  display: 'inline-flex', padding: '3px 10px', borderRadius: 20,
                  fontSize: 12, fontWeight: 500,
                  background: inf.estado === 'finalizado' ? '#EAF3DE' : '#FAEEDA',
                  color: inf.estado === 'finalizado' ? '#3B6D11' : '#854F0B'
                }}>
                  {inf.estado === 'finalizado' ? 'Finalizado' : 'Borrador'}
                </span>
                <button style={{ background: '#FAFAFA', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#4B5563', display: 'flex', alignItems: 'center' }}>
                  {inf.estado === 'finalizado' ? <Download size={15} /> : <Edit size={15} />}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}