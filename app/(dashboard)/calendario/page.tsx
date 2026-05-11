import { Topbar } from '@/components/layout/topbar'

const dias = ['L','M','X','J','V','S','D']
const conEventos = [1,2,5,6,7,8,9,12,14,15,19,20,22,26,27,29,30]

export default function CalendarioPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Calendario — Mayo 2026">
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#4B5563', border: '0.5px solid #E8E8E8', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
          Sincronizar Google
        </button>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--vino)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
          + Nueva cita
        </button>
      </Topbar>

      <div style={{ flex: 1, padding: '20px 24px', background: '#FAFAFA', overflow: 'auto', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>Mayo 2026</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#9CA3AF', cursor: 'pointer' }}>‹</span>
                <span style={{ fontSize: 13, color: '#9CA3AF', cursor: 'pointer' }}>›</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {dias.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#9CA3AF', fontWeight: 500, padding: '4px 0' }}>{d}</div>)}
              {[28,29,30].map(d => <div key={`prev-${d}`} style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#E8E8E8' }}>{d}</div>)}
              {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                <div key={d} style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, borderRadius: 6, cursor: 'pointer', position: 'relative', background: d === 8 ? 'var(--vino)' : 'transparent', color: d === 8 ? '#fff' : '#4B5563', fontWeight: d === 8 ? 500 : 400 }}>
                  {d}
                  {conEventos.includes(d) && d !== 8 && <div style={{ width: 4, height: 4, background: 'var(--vino-border)', borderRadius: '50%', position: 'absolute', bottom: 2 }} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937', marginBottom: 10 }}>Próximas citas</div>
            {[
              { hora: 'Hoy 10:00', nombre: 'Ana García', sesion: 'Sesión 8 · Presencial' },
              { hora: 'Hoy 12:30', nombre: 'Luis Peña', sesion: 'Sesión 12 · Virtual' },
              { hora: 'Mañana 09:00', nombre: 'Roberto S.', sesion: 'Sesión 3 · Presencial' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < 2 ? '0.5px solid #E8E8E8' : 'none' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1F2937' }}>{c.hora} — {c.nombre}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.sesion}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E8E8E8' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>Semana del 5 al 11 de mayo</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(5, 1fr)', fontSize: 11, flex: 1 }}>
            <div />
            {['Lun 5','Mar 6','Mié 7','Jue 8','Vie 9'].map((d, i) => (
              <div key={d} style={{ padding: 8, textAlign: 'center', color: i === 3 ? 'var(--vino)' : '#9CA3AF', fontWeight: i === 3 ? 500 : 400, borderBottom: '0.5px solid #E8E8E8' }}>{d}{i === 3 ? ' ●' : ''}</div>
            ))}
            {['9:00','12:00','16:00'].map((hora, hi) => [
              <div key={`h${hi}`} style={{ padding: '16px 6px', textAlign: 'right', color: '#9CA3AF', borderRight: '0.5px solid #E8E8E8', fontSize: 10 }}>{hora}</div>,
              ...[0,1,2,3,4].map(di => {
                const evento = (hi===0&&di===3) ? 'Ana G. 10:00' : (hi===1&&di===0) ? 'Luis P. 12:30' : (hi===1&&di===3) ? 'Luis P. 12:30' : (hi===2&&di===1) ? 'Carla R. 16:00' : null
                return (
                  <div key={`${hi}-${di}`} style={{ padding: 4, borderRight: di < 4 ? '0.5px solid #E8E8E8' : 'none', borderBottom: hi < 2 ? '0.5px solid #F4F4F4' : 'none' }}>
                    {evento && <div style={{ background: 'var(--vino-pale)', borderLeft: '2px solid var(--vino)', padding: '2px 6px', borderRadius: '0 4px 4px 0', fontSize: 10, color: 'var(--vino)' }}>{evento}</div>}
                  </div>
                )
              })
            ])}
          </div>
        </div>
      </div>
    </div>
  )
}