'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, FileText, Layers } from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Inicio',     icon: LayoutDashboard },
  { href: '/pacientes',  label: 'Pacientes',  icon: Users },
  { href: '/materiales', label: 'Materiales', icon: BookOpen },
  { href: '/informes',   label: 'Informes',   icon: FileText },
  { href: '/servicios',  label: 'Servicios',  icon: Layers },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #F0F0F0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '8px 0 12px', zIndex: 50,
      boxShadow: '0 -2px 12px rgba(0,0,0,.08)',
    }}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link key={href} href={href} style={{ textDecoration: 'none', flex: 1 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '4px 0', cursor: 'pointer',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: active ? 'var(--vino-pale)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
              }}>
                <Icon size={20} color={active ? 'var(--vino)' : '#9CA3AF'} />
              </div>
              <span style={{ fontSize: 10, color: active ? 'var(--vino)' : '#9CA3AF', fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
