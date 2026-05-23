import React from 'react'

interface TopbarProps {
  title: string
  children?: React.ReactNode
}

export function Topbar({ title, children }: TopbarProps) {
  return (
    <div style={{
      background: '#fff', height: 56, display: 'flex', alignItems: 'center',
      padding: '0 24px', borderBottom: '1px solid #F0F0F0', gap: 12, flexShrink: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,.04)'
    }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', flex: 1 }}>{title}</span>
      {children}
    </div>
  )
}