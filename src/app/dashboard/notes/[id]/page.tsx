'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  Save, 
  ArrowLeft, 
  Edit3, 
  Eye, 
  Share2, 
  MoreHorizontal,
  Trash2,
  Lock
} from 'lucide-react'
import { Note } from '@/types'

export default function EditNote() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (noteId && user) {
      fetchNote()
    }
  }, [noteId, user])

  const fetchNote = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('owner_id', user?.id)
        .single()

      if (error) {
        console.error('Error fetching note:', error)
        router.push('/dashboard')
      } else {
        setNote(data)
        setTitle(data.title)
        setContent(data.content || '')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!note) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id)

      if (error) {
        console.error('Error updating note:', error)
        alert('Error saving note: ' + error.message)
      } else {
        setIsEditing(false)
        // Refresh note data
        fetchNote()
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

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
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred')
    }
  }

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

  if (!note) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ color: 'white', marginBottom: '16px' }}>Note not found</h2>
          <button
            className="btn-primary"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '4px'
              }}>
                {isEditing ? 'Editing Note' : note.title}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px'
              }}>
                Last updated: {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {!isEditing ? (
              <>
                <motion.button
                  className="btn-secondary"
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 size={16} />
                  Edit
                </motion.button>
                
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
              </>
            ) : (
              <>
                <motion.button
                  className="btn-secondary"
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onClick={() => {
                    setIsEditing(false)
                    setTitle(note.title)
                    setContent(note.content || '')
                  }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  className="btn-primary"
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'Saving...' : 'Save'}
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Note Content */}
        <motion.div
          className="glass"
          style={{
            padding: '32px',
            borderRadius: '16px',
            marginBottom: '24px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isEditing ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '24px',
                  padding: '8px 0'
                }}
              />
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
                  fontFamily: 'inherit'
                }}
              />
            </>
          ) : (
            <>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '24px'
              }}>
                {note.title}
                {note.is_encrypted && (
                  <Lock size={20} style={{ marginLeft: '8px', color: '#10b981' }} />
                )}
              </h1>
              
              <div style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.9)',
                whiteSpace: 'pre-wrap'
              }}>
                {note.content || 'No content'}
              </div>
            </>
          )}
        </motion.div>

        {/* Note Metadata */}
        <motion.div
          className="glass"
          style={{
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {note.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: 'rgba(102, 126, 234, 0.3)',
                      color: '#667eea',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px'
          }}>
            Created: {new Date(note.created_at).toLocaleDateString()}
          </div>
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
