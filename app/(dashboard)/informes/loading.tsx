export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }} />
      <div style={{ flex: 1, padding: '20px 24px', background: '#F7F8FA' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: '1px solid #F9FAFB' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F3F4F6', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 14, background: '#F3F4F6', borderRadius: 4, width: '50%', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: 11, background: '#F3F4F6', borderRadius: 4, width: '30%', animation: 'pulse 1.5s infinite' }} />
              </div>
              <div style={{ height: 24, background: '#F3F4F6', borderRadius: 20, width: 80, animation: 'pulse 1.5s infinite' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}