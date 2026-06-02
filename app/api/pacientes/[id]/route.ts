import { createClient } from '@/lib/supabase/server'
import { invalidatePatientsCache } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()
    
    // Eliminar el paciente
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id)

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    // Invalidar el caché
    invalidatePatientsCache()
    
    // Revalidar la ruta
    revalidatePath('/pacientes')

    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
