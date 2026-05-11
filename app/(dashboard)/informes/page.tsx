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
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
          + Nuevo informe
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, overflow: 'hidden' }}>
          {(!informes || informes.length === 0) ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
              No hay informes generados aún
            </div>
          ) : informes.map((inf, i) => {
            const paciente = (inf as any).patients
            return (
              <div key={inf.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < informes.length - 1 ? '0.5px solid #E8E8E8' : 'none' }}>
                <div style={{ width: 36, height: 36, background: 'var(--vino-pale)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vino)', flexShrink: 0 }}>
                  <FileText size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>{inf.titulo}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {paciente ? `${paciente.nombre} ${paciente.apellido}` : '—'} · {new Date(inf.created_at).toLocaleDateString('es-MX')}
                  </div>
                </div>
                <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: inf.estado === 'finalizado' ? '#EAF3DE' : '#FAEEDA', color: inf.estado === 'finalizado' ? '#3B6D11' : '#854F0B' }}>
                  {inf.estado === 'finalizado' ? 'Finalizado' : 'Borrador'}
                </span>
                <button style={{ background: '#FAFAFA', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#4B5563', display: 'flex' }}>
                  {inf.estado === 'finalizado' ? <Download size={14} /> : <Edit size={14} />}
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, borderTop: '3px solid var(--vino)', padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937', marginBottom: 14 }}>Generar informe con IA</div>
          {[
            { label: 'Paciente', placeholder: 'Seleccionar paciente' },
            { label: 'Período', placeholder: 'Ej. Enero — Mayo 2026' },
            { label: 'Tipo de informe', placeholder: 'Evolución terapéutica' },
          ].map(({ label, placeholder }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
              <div style={{ background: '#FAFAFA', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#9CA3AF' }}>{placeholder}</div>
            </div>
          ))}
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px', fontSize: 12, fontWeight: 500, cursor: 'pointer', marginTop: 4 }}>
            ✦ Generar con IA
          </button>
        </div>
      </div>
    </div>
  )
}