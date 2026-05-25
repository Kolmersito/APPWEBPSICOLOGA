import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCalendarClient } from '@/lib/google-calendar/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('google_access_token, google_refresh_token')
      .eq('id', user.id)
      .single()

    if (!profile?.google_access_token) {
      return NextResponse.json({ error: 'Google Calendar no conectado', connected: false })
    }

    const calendar = await getCalendarClient(
      profile.google_access_token,
      profile.google_refresh_token
    )

    const mes = request.nextUrl.searchParams.get('mes') || new Date().getMonth() + 1
    const anio = request.nextUrl.searchParams.get('anio') || new Date().getFullYear()

    const inicio = new Date(Number(anio), Number(mes) - 1, 1).toISOString()
    const fin = new Date(Number(anio), Number(mes), 0).toISOString()

    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: inicio,
      timeMax: fin,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return NextResponse.json({ events: data.items, connected: true })
  } catch (error) {
    console.error('Error obteniendo eventos:', error)
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}