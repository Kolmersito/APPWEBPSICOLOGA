import { NextRequest, NextResponse } from 'next/server'
import { createOAuthClient } from '@/lib/google-calendar/client'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)

  try {
    const oauth = createOAuthClient()
    const { tokens } = await oauth.getToken(code)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)

    await supabase.from('profiles').update({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token,
      google_token_expiry: tokens.expiry_date,
    }).eq('id', user.id)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?calendar=connected`)
  } catch (error) {
    console.error('Error en callback de Google:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?calendar=error`)
  }
}