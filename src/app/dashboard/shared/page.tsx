'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Share2, FileText, Users, Calendar } from 'lucide-react'
import { Note, UploadedFile } from '@/types'

export default function SharedPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [sharedNotes, setSharedNotes] = useState<Note[]>([])
  const [sharedFiles, setSharedFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    // For now, show empty state until we implement full sharing
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

        {/* Coming Soon State */}
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
