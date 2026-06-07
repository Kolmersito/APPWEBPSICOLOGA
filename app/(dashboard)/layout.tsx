import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/servicios'
import { BottomNav } from '@/components/layout/bottom-nav'
import { MobileHeader } from '@/components/layout/mobile-header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
      {/* Sidebar — solo desktop */}
      <div className="hide-mobile">
        <Sidebar user={user} />
      </div>

      {/* Contenido principal */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Header móvil */}
        <div className="show-mobile">
          <MobileHeader email={user.email || ''} />
        </div>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 'env(safe-area-inset-bottom)' }} className="mobile-pb">
          {children}
        </div>
      </main>

      {/* Bottom nav — solo móvil */}
      <div className="show-mobile">
        <BottomNav />
      </div>
    </div>
  )
}