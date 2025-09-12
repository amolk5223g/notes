'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  FileText, 
  Plus, 
  Calendar, 
  Users, 
  Star, 
  MoreVertical,
  Share2,
  Trash2,
  Edit3
} from 'lucide-react'
import { Note } from '@/types'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Fetch user's notes
  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const fetchNotes = async () => {
  try {
    console.log('Current user:', user?.id) // Debug log
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('owner_id', user?.id)
      .order('updated_at', { ascending: false })

    console.log('Query result:', { data, error }) // Debug log

    if (error) {
      console.error('Error fetching notes:', error)
      // Show user-friendly error
      alert(`Database Error: ${error.message}`)
    } else {
      console.log('Successfully fetched notes:', data)
      setNotes(data || [])
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  } finally {
    setNotesLoading(false)
  }
}


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (!content) return 'No content'
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
  }

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
        }} />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '8px'
            }}>
              All Notes
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem'
            }}>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>

          <motion.button
            className="btn-primary"
            style={{
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard/new')}
          >
            <Plus size={18} />
            Create Note
          </motion.button>
        </div>

        {/* Notes Grid */}
        {notesLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass"
                style={{
                  padding: '20px',
                  height: '200px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  animation: 'pulse 2s infinite'
                }}
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
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
            <FileText size={48} style={{
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '16px'
            }} />
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '8px'
            }}>
              No notes yet
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '24px'
            }}>
              Create your first note to get started with SecureNotes
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
              onClick={() => router.push('/dashboard/new')}
            >
              <Plus size={18} />
              Create Your First Note
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                className="glass"
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                onClick={() => router.push(`/dashboard/notes/${note.id}`)}
              >
                {/* Note Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'white',
                    lineHeight: '1.4',
                    flex: 1,
                    marginRight: '8px'
                  }}>
                    {note.title}
                  </h3>
                  
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      opacity: 0.7
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Add dropdown menu
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Note Content Preview */}
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  flex: 1,
                  marginBottom: '16px'
                }}>
                  {truncateContent(note.content || '')}
                </p>

                {/* Note Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem'
                  }}>
                    <Calendar size={12} />
                    {formatDate(note.updated_at)}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {note.tags.length > 0 && (
                      <div style={{
                        backgroundColor: 'rgba(102, 126, 234, 0.3)',
                        color: '#667eea',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: '500'
                      }}>
                        {note.tags[0]}
                        {note.tags.length > 1 && ` +${note.tags.length - 1}`}
                      </div>
                    )}
                    
                    {note.is_encrypted && (
                      <div style={{
                        color: 'rgba(34, 197, 94, 0.8)',
                        fontSize: '0.75rem'
                      }}>
                        🔒
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </DashboardLayout>
  )
}
