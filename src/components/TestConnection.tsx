'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestConnection() {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
        
        if (error) {
          setError(error.message)
        } else {
          setConnected(true)
        }
      } catch (err) {
        setError('Connection failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: '20px', margin: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
      <h3>Database Connection Test</h3>
      {connected && <p style={{ color: 'green' }}>✅ Connected to Supabase!</p>}
      {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}
    </div>
  )
}
