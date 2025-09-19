'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Save, Eye, Brain } from 'lucide-react'
import { Note } from '@/types'
import { RealtimeChannel } from '@supabase/supabase-js'
import AIAssistant from '@/components/ai/AIAssistant'

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
  const [showAI, setShowAI] = useState(false)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
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
          const presences = presenceState[userId] as Record<string, unknown>[]
          if (presences.length > 0 && userId !== user.id) {
            const presence = presences[0] as Record<string, unknown>
            users.push({
              id: userId,
              name: (presence.name as string) || 'Anonymous',
              color: getUserColor(userId),
              cursor_position: (presence.cursor_position as number) || 0,
              last_seen: new Date().toISOString()
            })
          }
        }
        
        setActiveUsers(users)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key !== user.id && newPresences.length > 0) {
          const presence = newPresences[0] as Record<string, unknown>
          const newUser: ActiveUser = {
            id: key,
            name: (presence.name as string) || 'Anonymous',
            color: getUserColor(key),
            cursor_position: (presence.cursor_position as number) || 0,
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

  // Create updated note object for AI Assistant
  const currentNote: Note = {
    ...note,
    title: title,
    content: content
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {/* Enhanced Status Bar with AI Assistant */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        marginBottom: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdrop: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isConnected ? (
              <Wifi size={16} style={{ color: '#10b981' }} />
            ) : (
              <WifiOff size={16} style={{ color: '#ef4444' }} />
            )}
            <span style={{
              color: isConnected ? '#10b981' : '#ef4444',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>

          {/* Active Users */}
          {activeUsers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={14} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              <div style={{ display: 'flex', gap: '4px' }}>
                {activeUsers.slice(0, 3).map((activeUser) => (
                  <div
                    key={activeUser.id}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: activeUser.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: 'white',
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }}
                    title={activeUser.name}
                  >
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {activeUsers.length > 3 && (
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
                    +{activeUsers.length - 3}
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* AI Assistant Button */}
          <motion.button
            onClick={() => setShowAI(true)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
              color: '#a5b4fc',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: 'rgba(102, 126, 234, 0.3)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain size={14} />
            AI Assistant
          </motion.button>

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
            ) : (
              <span style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px'
              }}>
                Auto-save enabled
              </span>
            )}
          </div>
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
          padding: '12px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'border-color 0.2s ease'
        }}
        onFocus={(e) => e.target.style.borderBottomColor = 'rgba(102, 126, 234, 0.5)'}
        onBlur={(e) => e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)'}
      />

      {/* Content Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        onKeyUp={handleCursorMove}
        onMouseUp={handleCursorMove}
        placeholder="Start writing your collaborative note... Changes sync in real-time! ✨"
        style={{
          width: '100%',
          minHeight: '450px',
          background: 'none',
          border: 'none',
          outline: 'none',
          fontSize: '1rem',
          lineHeight: '1.7',
          color: 'rgba(255, 255, 255, 0.9)',
          resize: 'vertical',
          fontFamily: 'inherit',
          padding: '16px 0',
          letterSpacing: '0.01em'
        }}
      />

      {/* Enhanced Active Users List */}
      {activeUsers.length > 0 && (
        <motion.div 
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 style={{
            color: 'white',
            fontSize: '14px',
            marginBottom: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Eye size={16} />
            Active Collaborators ({activeUsers.length})
          </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {activeUsers.map((activeUser) => (
              <motion.div
                key={activeUser.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: activeUser.color + '20',
                  borderRadius: '20px',
                  border: `1px solid ${activeUser.color}40`
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: activeUser.color,
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {activeUser.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Word Count & Stats */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>{content.length} characters</span>
          <span>{content.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
          <span>{content.split('\n').length} lines</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Last modified: {new Date(note.updated_at || '').toLocaleDateString()}</span>
        </div>
      </div>

      {/* AI Assistant Component */}
      <AIAssistant
        note={currentNote}
        isOpen={showAI}
        onClose={() => setShowAI(false)}
      />

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
    </div>
  )
}
