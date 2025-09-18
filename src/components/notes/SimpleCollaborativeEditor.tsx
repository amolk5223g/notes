'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Users, Wifi, WifiOff, Save, Eye } from 'lucide-react'
import { Note } from '@/types'

interface SimpleCollaborativeEditorProps {
  note: Note
  onSave?: (content: string) => void
}

interface ActiveUser {
  id: string
  name: string
  color: string
  cursor_position: number
  last_seen: string
}

export default function SimpleCollaborativeEditor({ note, onSave }: SimpleCollaborativeEditorProps) {
  const { user } = useAuth()
  const [content, setContent] = useState(note.content || '')
  const [title, setTitle] = useState(note.title)
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const channelRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Generate user color based on ID
  const getUserColor = useCallback((userId: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
    const index = userId.charCodeAt(0) % colors.length
    return colors[index]
  }, [])

  // Save to database
  const saveToDatabase = useCallback(async (contentToSave: string, titleToSave: string) => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: titleToSave.trim(),
          content: contentToSave.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id)

      if (!error) {
        setLastSaved(new Date())
        onSave?.(contentToSave)
      }
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setIsSaving(false)
    }
  }, [user, note.id, onSave])

  // Auto-save with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content !== note.content || title !== note.title) {
        saveToDatabase(content, title)
      }
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [content, title, note.content, note.title, saveToDatabase])

  // Set up realtime channel
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`note_${note.id}`)
      .on('broadcast', { event: 'content_change' }, (payload) => {
        const { user_id, content: newContent, title: newTitle } = payload.payload
        if (user_id !== user.id) {
          setContent(newContent)
          setTitle(newTitle)
        }
      })
      .on('broadcast', { event: 'cursor_move' }, (payload) => {
        const { user_id, cursor_position } = payload.payload
        if (user_id !== user.id) {
          setActiveUsers(prev => 
            prev.map(u => 
              u.id === user_id 
                ? { ...u, cursor_position, last_seen: new Date().toISOString() }
                : u
            )
          )
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        const users: ActiveUser[] = []
        
        for (const userId in presenceState) {
          const presences = presenceState[userId] as any[]
          if (presences.length > 0 && userId !== user.id) {
            const presence = presences[0]
            users.push({
              id: userId,
              name: presence.name || 'Anonymous',
              color: getUserColor(userId),
              cursor_position: presence.cursor_position || 0,
              last_seen: new Date().toISOString()
            })
          }
        }
        
        setActiveUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key !== user.id && newPresences.length > 0) {
          const presence = newPresences[0] as any
          const newUser: ActiveUser = {
            id: key,
            name: presence.name || 'Anonymous',
            color: getUserColor(key),
            cursor_position: presence.cursor_position || 0,
            last_seen: new Date().toISOString()
          }
          
          setActiveUsers(prev => {
            const filtered = prev.filter(u => u.id !== key)
            return [...filtered, newUser]
          })
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setActiveUsers(prev => prev.filter(u => u.id !== key))
      })

    channel.subscribe(async (status) => {
      setIsConnected(status === 'SUBSCRIBED')
      
      if (status === 'SUBSCRIBED') {
        await channel.track({
          name: user.email?.split('@')[0] || 'Anonymous',
          cursor_position: 0
        })
      }
    })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user, note.id, getUserColor])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    
    // Broadcast change to other users
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'content_change',
        payload: {
          user_id: user?.id,
          content: newContent,
          title: title
        }
      })
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    
    // Broadcast change to other users
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'content_change',
        payload: {
          user_id: user?.id,
          content: content,
          title: newTitle
        }
      })
    }
  }

  const handleCursorMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const position = e.currentTarget.selectionStart
    
    // Broadcast cursor position
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: {
          user_id: user?.id,
          cursor_position: position
        }
      })
    }
  }

  return (
    <div style={{ height: '100%' }}>
      {/* Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        marginBottom: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isConnected ? (
              <Wifi size={16} style={{ color: '#10b981' }} />
            ) : (
              <WifiOff size={16} style={{ color: '#ef4444' }} />
            )}
            <span style={{
              color: isConnected ? '#10b981' : '#ef4444',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {isConnected ? 'Live Collaboration Active' : 'Connecting...'}
            </span>
          </div>

          {/* Active Users */}
          {activeUsers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              <div style={{ display: 'flex', gap: '4px' }}>
                {activeUsers.slice(0, 4).map((user) => (
                  <div
                    key={user.id}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: user.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'white',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {activeUsers.length > 4 && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    +{activeUsers.length - 4}
                  </div>
                )}
              </div>
              <span style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '12px'
              }}>
                {activeUsers.length === 1 
                  ? `${activeUsers[0].name} is here`
                  : `${activeUsers.length} people here`
                }
              </span>
            </div>
          )}
        </div>

        {/* Save Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isSaving ? (
            <>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '12px'
              }}>
                Saving...
              </span>
            </>
          ) : lastSaved ? (
            <>
              <Save size={12} style={{ color: '#10b981' }} />
              <span style={{
                color: '#10b981',
                fontSize: '12px'
              }}>
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title..."
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
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        onKeyUp={handleCursorMove}
        onMouseUp={handleCursorMove}
        placeholder="Start writing your collaborative note... Changes sync in real-time!"
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

      {/* Active Users List */}
      {activeUsers.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <h4 style={{
            color: 'white',
            fontSize: '14px',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            Active Collaborators:
          </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {activeUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  backgroundColor: user.color + '20',
                  borderRadius: '12px',
                  border: `1px solid ${user.color}40`
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: user.color
                }} />
                <span style={{
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {user.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
