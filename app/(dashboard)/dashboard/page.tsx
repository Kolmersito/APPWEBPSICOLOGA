'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { ChevronLeft, ChevronRight, Clock, User, Users, Calendar, FileText, Brain } from 'lucide-react'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const card = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
  border: 'none',
}

export default function DashboardPage () {
  const router = useRouter()
  const supabase = createClient()
  const [hoy] = useState(new Date())
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [sesiones, setSesiones] = useState<any[]>([])
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(hoy.getDate())
  const [stats, setStats] = useState({ pacientes: 0, sesionesEsteMes: 0, informes: 0, sugerencias: 0 })
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleEvents, setGoogleEvents] = useState<any[]>([])

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

  useEffect(() => {
    async function loadStats() {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]

      const [{ count: pacientes }, { count: sesionesEsteMes }, { count: informes }, { count: sugerencias }] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
        supabase.from('sessions').select('*', { count: 'exact', head: true }).gte('fecha', inicioMes).lte('fecha', finMes),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
        supabase.from('ai_suggestions').select('*', { count: 'exact', head: true }).eq('vista', false),
      ])

      setStats({
        pacientes: pacientes || 0,
        sesionesEsteMes: sesionesEsteMes || 0,
        informes: informes || 0,
        sugerencias: sugerencias || 0,
      })
    }
    loadStats()
  }, [])

  useEffect(() => {
    async function loadCalendar() {
      try {
        const res = await fetch(`/api/calendario/eventos?mes=${mes + 1}&anio=${anio}`)
        const calData = await res.json()
        if (calData.connected) {
          setGoogleConnected(true)
          setGoogleEvents(calData.events || [])
        }
      } catch (e) {
        console.error('Error fetching calendar', e)
      }
    }
    loadCalendar()
  }, [mes, anio])

  const primerDia = new Date(anio, mes, 1).getDay()
  const offset = primerDia === 0 ? 6 : primerDia - 1
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const sesionesPorDia = (dia: number) => {
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return sesiones.filter(s => s.fecha === fecha)
  }

  const eventosGooglePorDia = (dia: number) => {
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return googleEvents.filter(e => {
      const fechaEvento = e.start?.date || e.start?.dateTime?.split('T')[0]
      return fechaEvento === fecha
    })
  }

  const esHoy = (dia: number) =>
    dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()

  const handleDia = (dia: number) => {
    setDiaSeleccionado(dia)
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    const citas = sesionesPorDia(dia)
    if (citas.length === 1) {
      router.push(`/consulta/nueva?fecha=${fecha}&sesion=${citas[0].id}`)
    } else {
      router.push(`/consulta/nueva?fecha=${fecha}`)
    }
  }

  const [hoveredCita, setHoveredCita] = useState<string | null>(null)
  const [hoveredDia, setHoveredDia] = useState<number | null>(null)

  const citasDelDia = diaSeleccionado ? sesionesPorDia(diaSeleccionado) : []
  const fechaLabel = diaSeleccionado
    ? `${diaSeleccionado} de ${MESES[mes]}`
    : `Hoy, ${hoy.getDate()} de ${MESES[hoy.getMonth()]}`

  const statCards = [
    { label: 'Pacientes activos', value: stats.pacientes, icon: Users, color: '#EFF6FF', iconColor: '#2563EB' },
    { label: 'Sesiones este mes', value: stats.sesionesEsteMes, icon: Calendar, color: '#F0FDF4', iconColor: '#16A34A' },
    { label: 'Informes', value: stats.informes, icon: FileText, color: 'var(--vino-pale)', iconColor: 'var(--vino)' },
    { label: 'Sugerencias IA', value: stats.sugerencias, icon: Brain, color: '#FFF7ED', iconColor: '#EA580C' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Inicio">
        {!googleConnected ? (
          <a href="/api/calendario/auth"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            📅 Conectar Google Calendar
          </a>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDF4', color: '#16A34A', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500 }}>
            ✓ Google Calendar
          </span>
        )}
        <Link href="/consulta/nueva" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          + Nueva sesión
        </Link>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#F7F8FA', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {statCards.map(({ label, value, icon: Icon, color, iconColor }) => (
            <div key={label} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={iconColor} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#1F2937', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CALENDARIO + PANEL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, flex: 1 }}>

          {/* CALENDARIO */}
          <div style={{ ...card, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>{MESES[mes]} {anio}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { if (mes === 0) { setMes(11); setAnio(a => a - 1) } else setMes(m => m - 1) }}
                  style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', display: 'flex' }}>
                  <ChevronLeft size={15} color="#6B7280" />
                </button>
                <button onClick={() => { if (mes === 11) { setMes(0); setAnio(a => a + 1) } else setMes(m => m + 1) }}
                  style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', display: 'flex' }}>
                  <ChevronRight size={15} color="#6B7280" />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {DIAS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#9CA3AF', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, flex: 1 }}>
              {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => {
                const citas = sesionesPorDia(dia)
                const evGoogle = eventosGooglePorDia(dia)
                const tiene = citas.length > 0 || evGoogle.length > 0
                const today = esHoy(dia)
                const seleccionado = diaSeleccionado === dia

                return (
                  <div key={dia}
                    className={!seleccionado ? 'clickeable' : undefined}
                    onClick={() => handleDia(dia)}
                    onMouseEnter={() => setHoveredDia(dia)}
                    onMouseLeave={() => setHoveredDia(null)}
                    style={{
                      minHeight: 50, borderRadius: 8, padding: '6px 4px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      cursor: 'pointer',
                      background: seleccionado ? 'rgb(255, 238, 238)' : today ? 'var(--vino)' : hoveredDia === dia ? '#F3F4F6' : tiene ? '#F9FAFB' : 'transparent',
                      border: seleccionado ? '1px solid #ff9696' : today ? 'none' : tiene && !today ? '1px solid #E5E7EB' : '1px solid transparent',
                      transform: seleccionado ? 'none' : hoveredDia === dia && !today ? 'translateY(-1px)' : 'none',
                      boxShadow: seleccionado ? 'none' : hoveredDia === dia && !today ? '0 2px 8px rgba(0,0,0,.06)' : 'none',
                      transition: 'all .15s',
                    }}>
                    <span style={{ fontSize: 13, fontWeight: seleccionado || today ? 700 : 400, color: seleccionado ? '#991B1B' : today ? '#fff' : '#374151' }}>{dia}</span>
                    {/* Sesiones de la app */}
                    {citas.slice(0, 2).map((c, i) => (
                      <div key={i}
                        onClick={(e) => { e.stopPropagation(); router.push(`/consulta/nueva?sesion=${c.id}`) }}
                        style={{ width: '92%', marginTop: 4, background: today ? 'rgba(255,255,255,.25)' : 'var(--vino-pale)', borderLeft: `3px solid ${today ? '#fff' : 'var(--vino)'}`, borderRadius: '0 6px 6px 0', padding: '3px 6px', cursor: 'pointer' }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: today ? '#fff' : 'var(--vino)', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block', textOverflow: 'ellipsis' }}>
                          {c.patients?.nombre} {c.patients?.apellido}
                        </span>
                      </div>
                    ))}

                    {/* Eventos de Google Calendar */}
                    {eventosGooglePorDia(dia).slice(0, 2).map((e, i) => (
                      <div key={`g${i}`}
                        onClick={(ev) => {
                          ev.stopPropagation()
                          const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
                          const sesionRelacionada = citas.find(c => c.google_event_id === e.id)
                          if (sesionRelacionada) {
                            router.push(`/consulta/nueva?sesion=${sesionRelacionada.id}`)
                          } else {
                            router.push(`/consulta/nueva?fecha=${fecha}&gtitulo=${encodeURIComponent(e.summary || '')}`)
                          }
                        }}
                        style={{ width: '92%', marginTop: 4, background: today ? 'rgba(255,255,255,.2)' : '#EFF6FF', borderLeft: `3px solid ${today ? '#fff' : '#2563EB'}`, borderRadius: '0 6px 6px 0', padding: '3px 6px', cursor: 'pointer' }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: today ? '#fff' : '#2563EB', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block', textOverflow: 'ellipsis' }}>
                          {e.summary}
                        </span>
                      </div>
                    ))}

                    {(citas.length + eventosGooglePorDia(dia).length) > 2 && (
                      <span style={{ fontSize: 10, color: today ? 'rgba(255,255,255,.7)' : '#9CA3AF', marginTop: 2 }}>
                        +{citas.length + eventosGooglePorDia(dia).length - 2} más
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* PANEL DERECHO */}
          <div style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={15} color="var(--vino)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{fechaLabel}</span>
            </div>

            <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {citasDelDia.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <User size={22} color="#D1D5DB" />
                  </div>
                  <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6 }}>Sin sesiones este día</p>
                  <Link href="/consulta/nueva" style={{ marginTop: 12, fontSize: 13, color: 'var(--vino)', textDecoration: 'none', fontWeight: 600 }}>
                    + Agregar sesión
                  </Link>
                </div>
              ) : citasDelDia.map(c => (
                <div key={c.id}
                  className="clickeable"
                  onClick={() => router.push(`/consulta/nueva?sesion=${c.id}`)}
                  onMouseEnter={() => setHoveredCita(c.id)}
                  onMouseLeave={() => setHoveredCita(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                    border: '1px solid #F3F4F6', cursor: 'pointer', background: hoveredCita === c.id ? '#F3F4F6' : '#FAFAFA',
                    transform: hoveredCita === c.id ? 'translateY(-1px)' : 'none',
                    boxShadow: hoveredCita === c.id ? '0 4px 12px rgba(0,0,0,.06)' : 'none',
                    transition: 'all .15s'
                  }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--vino-pale)', color: 'var(--vino)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {c.patients?.nombre?.[0]}{c.patients?.apellido?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{c.patients?.nombre} {c.patients?.apellido}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.patients?.motivo_consulta || c.tipo}</div>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--vino)', fontWeight: 700 }}>→</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}