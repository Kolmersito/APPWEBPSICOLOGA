'use client'

import { Brain, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function MobileHeader({ email }: { email: string }) {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{
      background: '#fff', height: 52, display: 'flex', alignItems: 'center',
      padding: '0 16px', borderBottom: '1px solid #F0F0F0',
      boxShadow: '0 1px 4px rgba(0,0,0,.04)', gap: 10,
    }}>
      <div style={{ width: 30, height: 30, background: 'var(--vino)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Brain size={16} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>Aplicación</div>
      </div>
      <button onClick={handleLogout}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 4 }}>
        <LogOut size={18} />
      </button>
    </div>
  )
}
