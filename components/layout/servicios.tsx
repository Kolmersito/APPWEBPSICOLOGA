'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, BookOpen, FileText, Brain, LogOut, Layers } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/dashboard',  label: 'Inicio',     icon: LayoutDashboard },
  { href: '/pacientes',  label: 'Pacientes',  icon: Users },
  { href: '/materiales', label: 'Materiales', icon: BookOpen },
  { href: '/informes',   label: 'Informes',   icon: FileText },
  { href: '/servicios',  label: 'Servicios',  icon: Layers },
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
    <aside style={{
      width: 220, background: '#fff', display: 'flex', flexDirection: 'column',
      height: '100%', flexShrink: 0, borderRight: '1px solid #F0F0F0',
      boxShadow: '2px 0 8px rgba(0,0,0,.04)'
    }}>
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F5F5F5' }}>
        <div style={{ width: 34, height: 34, background: 'var(--vino)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={18} color="#fff" />
        </div>
        <div>
          <div style={{ color: '#1F2937', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>Aplicación</div>
          <div style={{ color: '#9CA3AF', fontSize: 11, lineHeight: 1.2 }}>Prueba</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }} className="nav-link">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                background: active ? 'var(--vino-pale)' : 'transparent',
                color: active ? 'var(--vino)' : '#6B7280',
                fontWeight: active ? 600 : 400,
                transition: 'all .15s',
              }}>
                <Icon size={16} />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid #F5F5F5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: '#F9FAFB' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--vino)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
            {initials}
          </div>
          <span style={{ color: '#4B5563', fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.email}
          </span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 2 }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}