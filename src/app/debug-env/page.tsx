'use client'

export default function DebugEnv() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Debug</h1>
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
        <strong>Supabase URL:</strong><br />
        {process.env.NEXT_PUBLIC_SUPABASE_URL || 'UNDEFINED'}
      </div>
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
        <strong>Supabase Key (first 50 chars):</strong><br />
        {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50) || 'UNDEFINED'}
      </div>
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
        <strong>All NEXT_PUBLIC vars:</strong><br />
        {JSON.stringify(
          Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
          null, 
          2
        )}
      </div>
    </div>
  )
}
