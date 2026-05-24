export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }} />
      <div style={{ flex: 1, padding: '20px 24px', background: '#F7F8FA', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F3F4F6', animation: 'pulse 1.5s infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 22, background: '#F3F4F6', borderRadius: 4, width: '40%', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: 11, background: '#F3F4F6', borderRadius: 4, width: '70%', animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, flex: 1 }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    </div>
  )
}