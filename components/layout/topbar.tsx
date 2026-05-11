import React from 'react'

interface TopbarProps {
  title: string
  children?: React.ReactNode
}

export function Topbar({ title, children }: TopbarProps) {
  return (
    <div style={{ background: '#fff', height: 52, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #E8E8E8', gap: 12, flexShrink: 0 }}>
      <div style={{ width: 3, height: 18, background: 'var(--vino)', borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 15, fontWeight: 500, color: '#1F2937', flex: 1 }}>{title}</span>
      {children}
    </div>
  )
}