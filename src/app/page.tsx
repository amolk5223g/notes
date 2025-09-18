'use client'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, Users, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        style={{
          maxWidth: '800px',
          textAlign: 'center',
          color: 'white'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '24px'
        }}>
          SecureNotes
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '48px',
          opacity: 0.9
        }}>
          Your collaborative study platform
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {[
            { icon: BookOpen, title: 'Notes', desc: 'Create and edit' },
            { icon: Users, title: 'Collaborate', desc: 'Study together' },
            { icon: Shield, title: 'Secure', desc: 'Your data safe' },
            { icon: Zap, title: 'Real-time', desc: 'Live updates' }
          ].map((feature) => (
            <div key={feature.title} style={{
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <feature.icon size={32} style={{ marginBottom: '12px' }} />
              <h3 style={{ marginBottom: '8px' }}>{feature.title}</h3>
              <p style={{ opacity: 0.8, fontSize: '14px' }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        <motion.button
          className="btn-primary"
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/auth')}
        >
          Get Started
        </motion.button>
      </motion.div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
