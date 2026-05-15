import { Topbar } from '@/components/layout/topbar'

const servicios = [
  {
    nombre: 'Google Ads',
    descripcion: 'campaña de publicidad.',
    color: '#ffffff',
    icono: '',
    estado: 'aun nio',
  },
  {
    nombre: 'Google Wallet',
    descripcion: 'pagar',
 
    icono: '',
    estado: 'aun no tampoco',
  },
]

export default function ServiciosPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar title="Servicios" />

      <div style={{ flex: 1, padding: '24px', background: '#FAFAFA', overflow: 'auto' }}>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>
          Integraciones con servicios externos para hacer crecer tu práctica.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 700 }}>
          {servicios.map(s => (
            <div key={s.nombre} style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 6, background: s.color }} />
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icono}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 6 }}>{s.nombre}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>{s.descripcion}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F4F4F4', borderRadius: 20, padding: '4px 12px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF' }} />
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{s.estado}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}