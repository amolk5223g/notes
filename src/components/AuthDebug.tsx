'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebug() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)

  const testConnection = async () => {
    try {
      const { data: result, error } = await supabase.from('notes').select('count').limit(1)
      if (error) {
        setData({ error: error.message })
      } else {
        setData({ success: true, result })
      }
    } catch (err) {
      setData({ error: 'Connection failed' })
    }
  }

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h3>Auth Debug</h3>
      <button onClick={testConnection} style={{ padding: '10px', margin: '10px 0' }}>
        Test Connection
      </button>
      {data && (
        <pre style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
