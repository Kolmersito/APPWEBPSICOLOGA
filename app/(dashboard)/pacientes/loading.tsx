export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }} />
      <div style={{ flex: 1, padding: '20px 24px', background: '#F7F8FA' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '12px 16px', background: '#F9FAFB', borderBottom: '1px solid #F0F0F0', gap: 8 }}>
            {['Nombre','Correo','Motivo','Estado'].map(h => (
              <div key={h} style={{ height: 12, background: '#E5E7EB', borderRadius: 4, width: '60%', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', padding: '14px 16px', borderBottom: '1px solid #F9FAFB', gap: 8, alignItems: 'center' }}>
              <div style={{ height: 14, background: '#F3F4F6', borderRadius: 4, width: '70%', animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 12, background: '#F3F4F6', borderRadius: 4, width: '80%', animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 12, background: '#F3F4F6', borderRadius: 4, width: '60%', animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 22, background: '#F3F4F6', borderRadius: 20, width: 70, animation: 'pulse 1.5s infinite' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}