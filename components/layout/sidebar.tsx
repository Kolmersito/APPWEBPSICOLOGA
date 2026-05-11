'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, Calendar,
  BookOpen, FileText, Brain, LogOut,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/pacientes',   label: 'Pacientes',  icon: Users },
  { href: '/calendario',  label: 'Calendario', icon: Calendar },
  { href: '/materiales',  label: 'Materiales', icon: BookOpen },
  { href: '/informes',    label: 'Informes',   icon: FileText },
]

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'PS'

  return (
    <aside style={{ width: 210, background: 'var(--vino)', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
      <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.12)' }}>
        <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={16} color="#fff" />
        </div>
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>PsicoApp</span>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                background: active ? 'rgba(255,255,255,.15)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,.65)',
                fontWeight: active ? 500 : 400,
              }}>
                <Icon size={16} />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
            {initials}
          </div>
          <span style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.5)', display: 'flex', padding: 4 }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}