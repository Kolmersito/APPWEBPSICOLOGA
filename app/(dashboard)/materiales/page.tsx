export const dynamic = 'force-dynamic'
import MaterialesClient from '@/components/materiales/MaterialesClient'
import { getMaterials } from '@/lib/supabase/queries'

export default async function MaterialesPage() {
  const materiales = await getMaterials()
  return <MaterialesClient initialMaterials={materiales || []} />
}