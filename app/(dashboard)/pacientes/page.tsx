'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'

export default function PacientesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setLoading(true)
    const { data } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
    setPacientes(data || [])
    setLoading(false)
  }

  if (loading) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Pacientes">
        <Link href="/pacientes/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          + Nuevo paciente
        </Link>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#F7F8FA', overflow: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '12px 16px', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0', gap: 8 }}>
            {['Nombre', 'Correo', 'Motivo de consulta', 'Estado'].map(h => (
              <span key={h} style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF' }}>{h}</span>
            ))}
          </div>

          {pacientes.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
              No hay pacientes registrados aún
            </div>
          ) : pacientes.map((p, i) => (
            <div key={p.id}
              onClick={() => router.push(`/pacientes/${p.id}`)}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '13px 16px', borderBottom: i < pacientes.length - 1 ? '1px solid #F9FAFB' : 'none', gap: 8, alignItems: 'center', cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{p.nombre} {p.apellido}</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{p.email || '—'}</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{p.motivo_consulta || '—'}</span>
              <span style={{
                display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: p.estado === 'activo' ? '#F0FDF4' : p.estado === 'en_pausa' ? '#FEF3C7' : '#F4F4F4',
                color: p.estado === 'activo' ? '#16A34A' : p.estado === 'en_pausa' ? '#D97706' : '#6B7280'
              }}>
                {p.estado === 'activo' ? 'Activo' : p.estado === 'en_pausa' ? 'En pausa' : 'Alta'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}