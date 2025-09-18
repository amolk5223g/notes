'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SimpleCollaborativeEditor from '@/components/notes/SimpleCollaborativeEditor'
import { 
  ArrowLeft, 
  Trash2
} from 'lucide-react'
import { Note } from '@/types'

export default function EditNotePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [note, setNote] = useState<Note | null>(null)
  const [noteLoading, setNoteLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchNote = useCallback(async () => {
    if (!user || !noteId) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('owner_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching note:', error)
        setError('Note not found or access denied')
      } else {
        setNote(data)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load note')
    } finally {
      setNoteLoading(false)
    }
  }, [user, noteId])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (noteId && user) {
      fetchNote()
    }
  }, [noteId, user, loading, router, fetchNote])

  const handleDelete = async () => {
    if (!note) return

    const confirmed = confirm('Are you sure you want to delete this note? This action cannot be undone.')
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id)

      if (error) {
        console.error('Error deleting note:', error)
        alert('Error deleting note: ' + error.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    }
  }

  if (loading || noteLoading) {
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

  if (error || !note) {
    return (
      <DashboardLayout>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '16px',
            fontSize: '1.5rem'
          }}>
            {error || 'Note not found'}
          </h2>
          <motion.button
            className="btn-primary"
            onClick={() => router.push('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Dashboard
          </motion.button>
        </div>
      </DashboardLayout>
    )
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
                Collaborative Editor
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px'
              }}>
                Real-time collaboration • Auto-save enabled
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              style={{
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                padding: '10px',
                borderRadius: '6px'
              }}
              whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              onClick={handleDelete}
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>

        {/* Collaborative Editor */}
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
          <SimpleCollaborativeEditor 
            note={note}
            onSave={(content) => {
              setNote(prev => prev ? { ...prev, content } : null)
            }}
          />
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
