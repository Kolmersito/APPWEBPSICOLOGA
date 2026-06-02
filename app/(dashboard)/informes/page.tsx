export const dynamic = 'force-dynamic'
import InformesClient from '@/components/informes/InformesClient'
import { getReports, getPatients } from '@/lib/supabase/queries'

export default async function InformesPage() {
  const informes = await getReports()
  const pacientes = await getPatients()

  return <InformesClient initialInformes={informes || []} initialPacientes={pacientes || []} />
}