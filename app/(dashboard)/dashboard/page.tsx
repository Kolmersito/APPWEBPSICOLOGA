import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { Users, Calendar, FileText, Brain } from 'lucide-react'

const statCards = [
  { label: 'Pacientes activos',   value: '—', sub: 'sin datos aún',    icon: Users },
  { label: 'Sesiones este mes',   value: '—', sub: 'sin datos aún',    icon: Calendar },
  { label: 'Informes generados',  value: '—', sub: 'sin datos aún',    icon: FileText },
  { label: 'Sugerencias IA',      value: '—', sub: 'sin datos aún',    icon: Brain },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Dashboard">
        <a href="/pacientes/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, textDecoration: 'none', cursor: 'pointer' }}>
          + Nueva sesión
        </a>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto' }}>
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 13, color: '#6B7280' }}>Bienvenida, {user?.email}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {statCards.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--vino)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{label}</span>
                <Icon size={14} color="#9CA3AF" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 500, color: '#1F2937' }}>{value}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 3, height: 14, background: 'var(--vino)', borderRadius: 2 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>Pacientes recientes</span>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px', padding: '10px 14px', background: '#FAFAFA', borderBottom: '1px solid #E8E8E8', gap: 8 }}>
            {['Nombre', 'Motivo', 'Estado', 'Última sesión'].map(h => (
              <span key={h} style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{h}</span>
            ))}
          </div>
          <div style={{ padding: '32px 14px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            Aún no hay pacientes registrados
          </div>
        </div>
      </div>
    </div>
  )
}