'use client'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Share2, Users } from 'lucide-react'

export default function SharedPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
  }, [user, router])

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
            Shared With Me
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem'
          }}>
            Content shared by your study group members
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
          <Share2 size={64} style={{
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '24px'
          }} />
          
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '12px'
          }}>
            Shared Content Coming Soon
          </h3>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '32px',
            lineHeight: '1.6',
            maxWidth: '500px',
            margin: '0 auto 32px'
          }}>
            Once your friends join study groups, shared notes and files will appear here. 
            Create groups and start collaborating!
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
            onClick={() => router.push('/dashboard/groups')}
          >
            <Users size={18} />
            Go to Study Groups
          </motion.button>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
