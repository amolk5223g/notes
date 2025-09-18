'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { 
  Save, 
  ArrowLeft, 
  Lock, 
  Unlock,
  FileText
} from 'lucide-react'

export default function NewNotePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
  }, [user, router])

  const handleSave = async () => {
    if (!user || !title.trim()) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            is_encrypted: isEncrypted,
            owner_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error saving note:', error)
        alert('Error saving note: ' + error.message)
      } else {
        setLastSaved(new Date())
        router.push(`/dashboard/notes/${data.id}`)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <motion.button
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft size={18} />
              Back
            </motion.button>
            
            <div>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '4px'
              }}>
                Create New Note
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px'
              }}>
                {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              onClick={() => setIsEncrypted(!isEncrypted)}
              style={{
                padding: '10px 16px',
                backgroundColor: isEncrypted ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: isEncrypted ? '#fbbf24' : 'white',
                border: `1px solid ${isEncrypted ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}
              whileHover={{ scale: 1.05 }}
            >
              {isEncrypted ? <Lock size={16} /> : <Unlock size={16} />}
              {isEncrypted ? 'Encrypted' : 'Public'}
            </motion.button>
            
            <motion.button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: saving || !title.trim() ? 0.5 : 1,
                cursor: saving || !title.trim() ? 'not-allowed' : 'pointer'
              }}
              whileHover={{ scale: saving || !title.trim() ? 1 : 1.05 }}
              whileTap={{ scale: saving || !title.trim() ? 1 : 0.95 }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Note
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Editor */}
        <motion.div
          className="glass"
          style={{
            padding: '32px',
            borderRadius: '16px',
            minHeight: '600px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '20px',
              padding: '8px 0'
            }}
          />

          {/* Content Editor */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            style={{
              width: '100%',
              minHeight: '400px',
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.9)',
              resize: 'vertical',
              fontFamily: 'inherit',
              padding: '0'
            }}
          />

          {/* Encryption Notice */}
          {isEncrypted && (
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Lock size={16} style={{ color: '#fbbf24' }} />
              <span style={{
                color: '#fbbf24',
                fontSize: '14px'
              }}>
                This note will be encrypted and only visible to you
              </span>
            </div>
          )}
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
