import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json(data || [])
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
