import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'

export default async function PacientesPage() {
  const supabase = await createClient()
  const { data: pacientes } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Pacientes">
        <Link href="/pacientes/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>
          + Nuevo paciente
        </Link>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto' }}>
        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 80px', padding: '10px 14px', background: '#FAFAFA', borderBottom: '1px solid #E8E8E8', gap: 8 }}>
            {['Nombre', 'Correo', 'Motivo de consulta', 'Estado', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{h}</span>
            ))}
          </div>

          {!pacientes || pacientes.length === 0 ? (
            <div style={{ padding: '40px 14px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
              No hay pacientes registrados aún
            </div>
          ) : pacientes.map((p) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 80px', padding: '11px 14px', borderBottom: '0.5px solid #E8E8E8', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>{p.nombre} {p.apellido}</span>
              <span style={{ fontSize: 12, color: '#4B5563' }}>{p.email || '—'}</span>
              <span style={{ fontSize: 12, color: '#4B5563' }}>{p.motivo_consulta || '—'}</span>
              <span>
                <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: p.estado === 'activo' ? '#EAF3DE' : p.estado === 'en_pausa' ? '#FAEEDA' : '#F4F4F4', color: p.estado === 'activo' ? '#3B6D11' : p.estado === 'en_pausa' ? '#854F0B' : '#4B5563' }}>
                  {p.estado === 'activo' ? 'Activo' : p.estado === 'en_pausa' ? 'En pausa' : 'Alta'}
                </span>
              </span>
              <Link href={`/pacientes/${p.id}`} style={{ fontSize: 12, color: 'var(--vino)', textDecoration: 'none', fontWeight: 500 }}>Ver →</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}