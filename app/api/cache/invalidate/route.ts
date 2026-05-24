import { NextRequest, NextResponse } from 'next/server'
import { invalidatePatientsCache, invalidateMaterialsCache, invalidateReportsCache } from '@/lib/supabase/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key } = body || {}

    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

    switch (key) {
      case 'patients':
        invalidatePatientsCache()
        break
      case 'materials':
        invalidateMaterialsCache()
        break
      case 'reports':
        invalidateReportsCache()
        break
      default:
        return NextResponse.json({ error: 'Unknown key' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error invalidating cache:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
