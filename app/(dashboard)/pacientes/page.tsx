import Link from 'next/link'
import { Topbar } from '@/components/layout/topbar'
import { getPatients } from '@/lib/supabase/queries'

export default async function PacientesPage() {
  const pacientes: any[] = await getPatients()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Pacientes">
        <Link href="/pacientes/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
          + Nuevo paciente
        </Link>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto' }}>
        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '10px 16px', background: '#FAFAFA', borderBottom: '1px solid #E8E8E8', gap: 8 }}>
            {['Nombre', 'Correo', 'Motivo de consulta', 'Estado'].map((h) => (
              <span key={h} style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{h}</span>
            ))}
          </div>

          {!pacientes || pacientes.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
              No hay pacientes registrados aún
            </div>
          ) : pacientes.map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '12px 16px', borderBottom: i < pacientes.length - 1 ? '0.5px solid #E8E8E8' : 'none', gap: 8, alignItems: 'center' }}>
              <Link href={`/pacientes/${p.id}`} style={{ fontSize: 14, fontWeight: 500, color: '#1F2937', textDecoration: 'none' }}>
                {p.nombre} {p.apellido}
              </Link>
              <span style={{ fontSize: 13, color: '#4B5563' }}>{p.email || '—'}</span>
              <span style={{ fontSize: 13, color: '#4B5563' }}>{p.motivo_consulta || '—'}</span>
              <span style={{
                display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: p.estado === 'activo' ? '#EAF3DE' : p.estado === 'en_pausa' ? '#FAEEDA' : '#F4F4F4',
                color: p.estado === 'activo' ? '#3B6D11' : p.estado === 'en_pausa' ? '#854F0B' : '#4B5563'
              }}>
                {p.estado === 'activo' ? 'Activo' : p.estado === 'en_pausa' ? 'En pausa' : 'Alta'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}