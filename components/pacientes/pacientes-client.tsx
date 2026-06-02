'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function PacientesClient({ initialPacientes }: { initialPacientes: any[] }) {
  const [pacientes, setPacientes] = useState(initialPacientes)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  // Recargar pacientes cuando la página gana el foco
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const res = await fetch('/api/pacientes')
        const data = await res.json()
        setPacientes(data)
        setDeletedIds(new Set())
      } catch (err) {
        console.error('Error cargando pacientes:', err)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleDeleteClick = (id: string, nombre: string, apellido: string) => {
    if (!confirm(`¿Eliminar a ${nombre} ${apellido}? Esta acción eliminará también todas sus sesiones e informes.`)) return
    
    // Ocultar visualmente al instante
    setDeletedIds(new Set([...deletedIds, id]))
    
    // Enviar eliminación al servidor
    fetch(`/api/pacientes/${id}`, { method: 'DELETE' })
      .catch(err => {
        console.error('Error eliminando paciente:', err)
        // Si falla, revertir la ocultación
        setDeletedIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      })
  }

  const pacientesVisibles = pacientes.filter(p => !deletedIds.has(p.id))

  return (
    <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto' }}>
      <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '10px 16px', background: '#FAFAFA', borderBottom: '1px solid #E8E8E8', gap: 8 }}>
          {['Nombre', 'Correo', 'Motivo de consulta', 'Estado'].map((h) => (
            <span key={h} style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{h}</span>
          ))}
        </div>

        {pacientesVisibles.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No hay pacientes registrados aún
          </div>
        ) : pacientesVisibles.map((p, i) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '12px 16px', borderBottom: i < pacientesVisibles.length - 1 ? '0.5px solid #E8E8E8' : 'none', gap: 8, alignItems: 'center' }}>
            <Link href={`/pacientes/${p.id}`} style={{ fontSize: 14, fontWeight: 500, color: '#1F2937', textDecoration: 'none' }}>
              {p.nombre} {p.apellido}
            </Link>
            <span style={{ fontSize: 13, color: '#4B5563' }}>{p.email || '—'}</span>
            <span style={{ fontSize: 13, color: '#4B5563' }}>{p.motivo_consulta || '—'}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: p.estado === 'activo' ? '#EAF3DE' : p.estado === 'en_pausa' ? '#FAEEDA' : '#F4F4F4',
                color: p.estado === 'activo' ? '#3B6D11' : p.estado === 'en_pausa' ? '#854F0B' : '#4B5563'
              }}>
                {p.estado === 'activo' ? 'Activo' : p.estado === 'en_pausa' ? 'En pausa' : 'Alta'}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteClick(p.id, p.nombre, p.apellido)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A32D2D',
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: '2px 6px',
                  borderRadius: 4,
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
