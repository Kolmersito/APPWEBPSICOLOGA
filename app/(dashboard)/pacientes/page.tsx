export const dynamic = 'force-dynamic'
export const revalidate = 0
import { Topbar } from '@/components/layout/topbar'
import { getPatients } from '@/lib/supabase/queries'
import { PacientesClient } from '@/components/pacientes/pacientes-client'

export default async function PacientesPage() {
  const pacientes: any[] = await getPatients()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Pacientes">
        <a href="/pacientes/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
          + Nuevo paciente
        </a>
      </Topbar>
      <PacientesClient initialPacientes={pacientes} />
    </div>
  )
}