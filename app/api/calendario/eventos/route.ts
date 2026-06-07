import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOAuthClient } from '@/lib/google-calendar/client'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('google_access_token, google_refresh_token, google_token_expiry')
      .eq('id', user.id)
      .single()

    if (!profile?.google_refresh_token) {
      return NextResponse.json({ connected: false })
    }

    const oauth = createOAuthClient()
    oauth.setCredentials({
      access_token: profile.google_access_token,
      refresh_token: profile.google_refresh_token,
      expiry_date: profile.google_token_expiry,
    })

    // Renovar token si está por expirar o ya expiró
    const ahora = Date.now()
    const expira = profile.google_token_expiry || 0
    if (ahora >= expira - 60000) {
      const { credentials } = await oauth.refreshAccessToken()
      oauth.setCredentials(credentials)

      // Guardar nuevo token en BD
      await supabase.from('profiles').update({
        google_access_token: credentials.access_token,
        google_token_expiry: credentials.expiry_date,
      }).eq('id', user.id)
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth })

    const mes = request.nextUrl.searchParams.get('mes') || String(new Date().getMonth() + 1)
    const anio = request.nextUrl.searchParams.get('anio') || String(new Date().getFullYear())

    const inicio = new Date(Number(anio), Number(mes) - 1, 1).toISOString()
    const fin = new Date(Number(anio), Number(mes), 0, 23, 59, 59).toISOString()

    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: inicio,
      timeMax: fin,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100,
    })

    return NextResponse.json({ events: data.items || [], connected: true })

  } catch (error: any) {
    console.error('Error Google Calendar:', error)

    // Si el token es inválido, desconectar
    if (error?.code === 401 || error?.status === 401) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expiry: null,
        }).eq('id', user.id)
      }
      return NextResponse.json({ connected: false, error: 'Token inválido' })
    }

    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}