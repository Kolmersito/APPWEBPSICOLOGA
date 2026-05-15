'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [hoy] = useState(new Date())
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [sesiones, setSesiones] = useState<any[]>([])
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(hoy.getDate())

  useEffect(() => {
    async function load() {
      const inicio = new Date(anio, mes, 1).toISOString().split('T')[0]
      const fin = new Date(anio, mes + 1, 0).toISOString().split('T')[0]
      const { data: s } = await supabase
        .from('sessions')
        .select('*, patients(nombre, apellido, motivo_consulta)')
        .gte('fecha', inicio)
        .lte('fecha', fin)
        .order('fecha', { ascending: true })
      setSesiones(s || [])
    }
    load()
  }, [mes, anio])

  const primerDia = new Date(anio, mes, 1).getDay()
  const offset = primerDia === 0 ? 6 : primerDia - 1
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const sesionesPorDia = (dia: number) => {
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return sesiones.filter(s => s.fecha === fecha)
  }

  const esHoy = (dia: number) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()

  const handleDia = (dia: number) => {
    setDiaSeleccionado(dia)
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    const citas = sesionesPorDia(dia)
    if (citas.length === 0) {
      router.push(`/consulta/nueva?fecha=${fecha}`)
    } else if (citas.length === 1) {
      router.push(`/consulta/nueva?fecha=${fecha}&sesion=${citas[0].id}`)
    }
  }

  const citasDelDia = diaSeleccionado ? sesionesPorDia(diaSeleccionado) : []
  const fechaLabel = diaSeleccionado
    ? `${diaSeleccionado} de ${MESES[mes]}`
    : `Hoy, ${hoy.getDate()} de ${MESES[hoy.getMonth()]}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Inicio">
        <a href="/consulta/nueva" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
          + Nueva sesión
        </a>
      </Topbar>

      <div style={{ flex: 1, padding: '16px 20px', background: '#FAFAFA', overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>

        {/* CALENDARIO */}
        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={() => { if (mes === 0) { setMes(11); setAnio(a => a - 1) } else setMes(m => m - 1) }}
              style={{ background: 'none', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex' }}>
              <ChevronLeft size={16} color="#4B5563" />
            </button>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>{MESES[mes]} {anio}</span>
            <button onClick={() => { if (mes === 11) { setMes(0); setAnio(a => a + 1) } else setMes(m => m + 1) }}
              style={{ background: 'none', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex' }}>
              <ChevronRight size={16} color="#4B5563" />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DIAS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, color: '#9CA3AF', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, flex: 1 }}>
            {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => {
              const citas = sesionesPorDia(dia)
              const tiene = citas.length > 0
              const today = esHoy(dia)
              const seleccionado = diaSeleccionado === dia

              return (
                <div key={dia} onClick={() => handleDia(dia)}
                  style={{
                    minHeight: 52, borderRadius: 8, padding: '6px 4px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    cursor: 'pointer',
                    background: today ? 'var(--vino)' : seleccionado ? 'var(--vino-pale)' : tiene ? '#FAFAFA' : 'transparent',
                    border: seleccionado && !today ? '0.5px solid var(--vino-border)' : tiene && !today ? '0.5px solid #E8E8E8' : today ? 'none' : '0.5px solid transparent',
                    transition: 'all .15s',
                  }}>
                  <span style={{ fontSize: 13, fontWeight: today ? 600 : 400, color: today ? '#fff' : '#1F2937' }}>{dia}</span>
                  {citas.slice(0, 2).map((c, i) => (
                    <div key={i} style={{ width: '90%', marginTop: 3, background: today ? 'rgba(255,255,255,.25)' : 'var(--vino-pale)', borderLeft: `2px solid ${today ? '#fff' : 'var(--vino)'}`, borderRadius: '0 3px 3px 0', padding: '1px 4px' }}>
                      <span style={{ fontSize: 10, color: today ? '#fff' : 'var(--vino)', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block', textOverflow: 'ellipsis' }}>
                        {c.patients?.nombre}
                      </span>
                    </div>
                  ))}
                  {citas.length > 2 && <span style={{ fontSize: 10, color: today ? 'rgba(255,255,255,.7)' : '#9CA3AF', marginTop: 2 }}>+{citas.length - 2}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* PANEL DERECHO — PACIENTES DEL DÍA */}
        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #E8E8E8', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={14} color="var(--vino)" />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>{fechaLabel}</span>
          </div>

          <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {citasDelDia.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FAFAFA', border: '0.5px solid #E8E8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <User size={20} color="#9CA3AF" />
                </div>
                <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.5 }}>Sin sesiones este día</p>
                <a href="/consulta/nueva" style={{ marginTop: 12, fontSize: 12, color: 'var(--vino)', textDecoration: 'none', fontWeight: 500 }}>
                  + Agregar sesión
                </a>
              </div>
            ) : citasDelDia.map(c => (
              <div key={c.id}
                onClick={() => router.push(`/consulta/nueva?sesion=${c.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '0.5px solid #E8E8E8', cursor: 'pointer', background: '#FAFAFA' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--vino-pale)', color: 'var(--vino)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                  {c.patients?.nombre?.[0]}{c.patients?.apellido?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>{c.patients?.nombre} {c.patients?.apellido}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.patients?.motivo_consulta || c.tipo}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--vino)', fontWeight: 500 }}>→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}