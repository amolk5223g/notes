'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { 
  Plus, 
  FileText, 
  Search, 
  Calendar, 
  TrendingUp,
  BookOpen,
  Users,
  Settings,
  LogOut
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Note } from '@/types'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  // Fixed fetchNotes function
  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotesLoading(false)
      return
    }

    try {
      console.log('Fetching notes for user:', user.id) // Debug log
      
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError)
        setError(`Database error: ${fetchError.message}`)
      } else {
        console.log('Notes fetched successfully:', data?.length || 0) // Debug log
        setNotes(data || [])
        setError('') // Clear any previous errors
      }
    } catch (err) {
      console.error('Network or parsing error:', err)
      setError('Failed to load notes. Please check your connection.')
    } finally {
      setNotesLoading(false)
    }
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      fetchNotes()
    }
  }, [user, loading, router, fetchNotes])

  const handleCreateNote = async () => {
    if (!user) return

    try {
      const { data, error: createError } = await supabase
        .from('notes')
        .insert([
          {
            title: 'Untitled Note',
            content: '',
            owner_id: user.id,
            subject: 'General',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('Error creating note:', createError)
        setError(`Failed to create note: ${createError.message}`)
      } else if (data) {
        router.push(`/dashboard/notes/${data.id}`)
      }
    } catch (err) {
      console.error('Create note error:', err)
      setError('Failed to create note. Please try again.')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  // Filter notes based on search
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Loading state
  if (loading || notesLoading) {
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

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Connection Error</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </p>
            <motion.button
              className="btn-primary"
              onClick={fetchNotes}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ padding: '12px 24px' }}
            >
              Try Again
            </motion.button>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ color: 'white', marginBottom: '12px' }}>Troubleshooting:</h4>
            <ul style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', textAlign: 'left' }}>
              <li>• Check your internet connection</li>
              <li>• Make sure Supabase is configured correctly</li>
              <li>• Verify your database permissions</li>
            </ul>
          </div>
        </div>
      </DashboardLayout>
    )
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
              Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem'
            }}>
              You have {notes.length} {notes.length === 1 ? 'note' : 'notes'} in your collection
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              className="btn-secondary"
              onClick={handleSignOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px'
              }}
            >
              <LogOut size={16} />
              Sign Out
            </motion.button>

            <motion.button
              className="btn-primary"
              onClick={handleCreateNote}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px'
              }}
            >
              <Plus size={18} />
              New Note
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          maxWidth: '500px',
          marginBottom: '32px'
        }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.5)'
          }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your notes..."
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <BookOpen size={64} style={{
              color: 'rgba(255, 255, 255, 0.3)',
              marginBottom: '24px'
            }} />
            <h3 style={{
              color: 'white',
              fontSize: '1.5rem',
              marginBottom: '12px'
            }}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              {searchQuery 
                ? `No notes match "${searchQuery}". Try a different search term.`
                : 'Create your first collaborative note to get started!'
              }
            </p>
            {!searchQuery && (
              <motion.button
                className="btn-primary"
                onClick={handleCreateNote}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 24px'
                }}
              >
                <Plus size={20} />
                Create Your First Note
              </motion.button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                className="glass"
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  borderRadius: '16px'
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <FileText size={24} style={{ color: '#667eea' }} />
                  <span style={{
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    color: '#a5b4fc',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {note.subject || 'General'}
                  </span>
                </div>

                <h3 style={{
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  lineHeight: '1.3'
                }}>
                  {note.title || 'Untitled'}
                </h3>

                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {note.content || 'No content yet...'}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  <span>
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                  <span>
                    {note.content?.length || 0} chars
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
