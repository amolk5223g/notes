'use client'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function AuthDebug() {
  const { user } = useAuth()
  const [dbUser, setDbUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setDbUser(currentUser)
    }
    checkAuth()
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <div><strong>Auth Context User:</strong> {user?.id || 'None'}</div>
      <div><strong>Direct DB User:</strong> {dbUser?.id || 'None'}</div>
      <div><strong>Match:</strong> {user?.id === dbUser?.id ? '✅' : '❌'}</div>
    </div>
  )
}
