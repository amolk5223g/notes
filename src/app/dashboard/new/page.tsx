'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  Save, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Tag, 
  Eye, 
  EyeOff,
  Plus,
  X
} from 'lucide-react'

export default function NewNote() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)

  // Auto-save functionality
  const autoSave = async () => {
    if (!title.trim() && !content.trim()) return
    
    setAutoSaving(true)
    try {
      // Auto-save logic will be added here
      setTimeout(() => setAutoSaving(false), 1000)
    } catch (error) {
      setAutoSaving(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your note')
      return
    }

    setSaving(true)
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags,
        is_encrypted: isEncrypted,
        password_hash: isEncrypted && password ? btoa(password) : null,
        owner_id: user?.id
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select()
        .single()

      if (error) {
        console.error('Error saving note:', error)
        alert('Error saving note: ' + error.message)
      } else {
        console.log('Note saved successfully:', data)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
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
            
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white'
            }}>
              Create New Note
            </h1>

            {autoSaving && (
              <div style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Auto-saving...
              </div>
            )}
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
            {saving ? 'Saving...' : 'Save Note'}
          </motion.button>
        </div>

        {/* Main Editor */}
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
          {/* Title Input */}
          <input
            type="text"
            placeholder="Enter note title..."
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

          {/* Content Editor */}
          <textarea
            placeholder="Start writing your note..."
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
        </motion.div>

        {/* Note Settings */}
        <motion.div
          className="glass"
          style={{
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'white',
            marginBottom: '20px'
          }}>
            Note Settings
          </h3>

          {/* Tags */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Tags
            </label>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '12px'
            }}>
              {tags.map((tag, index) => (
                <motion.div
                  key={tag}
                  style={{
                    backgroundColor: 'rgba(102, 126, 234, 0.3)',
                    color: '#667eea',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <motion.button
                onClick={addTag}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(102, 126, 234, 0.3)',
                  border: '1px solid rgba(102, 126, 234, 0.5)',
                  borderRadius: '6px',
                  color: '#667eea',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                whileHover={{ backgroundColor: 'rgba(102, 126, 234, 0.4)' }}
              >
                <Plus size={14} />
                Add
              </motion.button>
            </div>
          </div>

          {/* Encryption Toggle */}
          <div style={{ marginBottom: isEncrypted ? '20px' : '0' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <input
                type="checkbox"
                checked={isEncrypted}
                onChange={(e) => setIsEncrypted(e.target.checked)}
                style={{ display: 'none' }}
              />
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: isEncrypted ? '#667eea' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}>
                {isEncrypted && <div style={{ color: 'white', fontSize: '12px' }}>✓</div>}
              </div>
              {isEncrypted ? <Lock size={16} /> : <Unlock size={16} />}
              Encrypt this note
            </label>
          </div>

          {/* Password Input (if encrypted) */}
          {isEncrypted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <label style={{
                display: 'block',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Encryption Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password for encryption..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginTop: '4px'
              }}>
                This password will be required to view the note content
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '40px'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            className="btn-secondary"
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            Cancel
          </button>
          
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '10px 20px' }}
          >
            Save & Continue Editing
          </button>
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
