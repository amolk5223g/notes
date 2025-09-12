'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

// Test Connection Component
function TestConnection() {
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <motion.div 
      className="glass"
      style={{ 
        padding: '24px', 
        margin: '20px auto', 
        maxWidth: '500px',
        textAlign: 'center'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
        Database Connection Status
      </h3>
      {loading && (
        <div style={{ color: '#666' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '8px' }}>Testing connection...</p>
        </div>
      )}
      {!loading && connected && (
        <div style={{ color: '#10b981' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
          <p style={{ fontWeight: '500' }}>Connected to Supabase!</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Database is ready for SecureNotes
          </p>
        </div>
      )}
      {!loading && error && (
        <div style={{ color: '#ef4444' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
          <p style={{ fontWeight: '500' }}>Connection Error</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            {error}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// Main Home Component
export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Navigation functions
  const navigateToAuth = () => {
    router.push('/auth')
  }

  const navigateToDashboard = () => {
    router.push('/dashboard')
  }
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          letterSpacing: '-0.02em'
        }}>
          SecureNotes
        </h1>
        
        <motion.p
          style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '40px',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Secure, collaborative note-taking platform for teams. 
          Create, share, and protect your ideas with end-to-end encryption.
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          maxWidth: '800px',
          marginBottom: '40px',
          width: '100%'
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {[
          {
            icon: '🔒',
            title: 'End-to-End Encryption',
            description: 'Your notes are encrypted before they leave your device'
          },
          {
            icon: '👥',
            title: 'Real-time Collaboration',
            description: 'Work together with your team in real-time'
          },
          {
            icon: '🎨',
            title: 'Beautiful Interface',
            description: 'Clean, modern design that helps you focus'
          },
          {
            icon: '🔐',
            title: 'Access Control',
            description: 'Fine-grained permissions for every note'
          }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            className="glass"
            style={{
              padding: '24px',
              textAlign: 'center'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>
              {feature.icon}
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'white'
            }}>
              {feature.title}
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.5'
            }}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      {!user ? (
        <motion.div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '40px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            className="btn-primary"
            style={{ fontSize: '1.125rem', padding: '16px 32px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateToAuth}
          >
            Get Started Free
          </motion.button>
          
          <motion.button
            className="btn-secondary"
            style={{ 
              fontSize: '1.125rem', 
              padding: '16px 32px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateToAuth}
          >
            Sign In
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          style={{ marginBottom: '40px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="glass" style={{ padding: '24px', marginBottom: '16px' }}>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>
              Welcome back! 👋
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {user.email}
            </p>
          </div>
          
          <motion.button
            className="btn-primary"
            style={{ fontSize: '1.125rem', padding: '16px 32px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateToDashboard}
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      )}

      {/* Connection Test */}
      <TestConnection />

      {/* Footer */}
      <motion.footer
        style={{
          marginTop: '60px',
          padding: '20px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p>Built with Next.js, Supabase, and ❤️</p>
        <p style={{ marginTop: '8px' }}>
          Your data is encrypted and secure
        </p>
      </motion.footer>

      {/* Add spinning animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
