'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Star, FileText } from 'lucide-react'

export default function FavoritesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    setLoading(false)
  }, [user, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '8px'
          }}>
            Favorites
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem'
          }}>
            Your starred notes and important files
          </p>
        </div>

        <motion.div
          className="glass"
          style={{
            padding: '60px 40px',
            textAlign: 'center',
            borderRadius: '16px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Star size={64} style={{
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '24px'
          }} />
          
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '12px'
          }}>
            No favorites yet
          </h3>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Star your important notes and files to find them quickly here
          </p>
          
          <motion.button
            className="btn-primary"
            style={{
              padding: '12px 24px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
          >
            <FileText size={18} />
            View All Notes
          </motion.button>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  )
}
