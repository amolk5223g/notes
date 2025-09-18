'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  FileText, 
  Lock,
  Calendar,
  Tag
} from 'lucide-react'
import { Note } from '@/types'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    if (!user) return

    setNotesLoading(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching notes:', error)
      } else {
        setNotes(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setNotesLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      fetchNotes()
    }
  }, [user, loading, router, fetchNotes])

  useEffect(() => {
    const filtered = notes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredNotes(filtered)
  }, [searchQuery, notes])

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
              marginBottom: '4px'
            }}>
              Your Notes
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem'
            }}>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} • Last updated {new Date().toLocaleDateString()}
            </p>
          </div>

          <motion.button
            className="btn-primary"
            style={{
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard/new')}
          >
            <Plus size={18} />
            New Note
          </motion.button>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: '32px',
          maxWidth: '400px'
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
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
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
        {notesLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
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
        ) : filteredNotes.length === 0 ? (
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
            <FileText size={64} style={{
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '24px'
            }} />
            
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '12px'
            }}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              {searchQuery 
                ? `No notes match "${searchQuery}". Try a different search term.`
                : 'Create your first note to get started with your study journey!'
              }
            </p>
            
            {!searchQuery && (
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
                Create First Note
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                className="glass"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  cursor: 'pointer'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => router.push(`/dashboard/notes/${note.id}`)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px',
                    lineHeight: '1.3'
                  }}>
                    {note.title}
                  </h3>
                  
                  {note.is_encrypted && (
                    <Lock size={16} style={{ color: '#fbbf24' }} />
                  )}
                </div>

                {note.content && (
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {note.content.substring(0, 150)}
                    {note.content.length > 150 && '...'}
                  </p>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
                  }}>
                    {note.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(102, 126, 234, 0.3)',
                          color: '#a5b4fc',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '12px'
                      }}>
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  <Calendar size={12} />
                  {new Date(note.updated_at).toLocaleDateString()}
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
