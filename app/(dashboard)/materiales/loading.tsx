export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }} />
      <div style={{ flex: 1, padding: '20px 24px', background: '#F7F8FA' }}>
        <div style={{ height: 12, background: '#E5E7EB', borderRadius: 4, width: 120, marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F3F4F6', marginBottom: 12, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 13, background: '#F3F4F6', borderRadius: 4, width: '80%', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 11, background: '#F3F4F6', borderRadius: 4, width: '50%', animation: 'pulse 1.5s infinite' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}