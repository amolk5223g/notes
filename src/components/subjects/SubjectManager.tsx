'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Plus, BookOpen } from 'lucide-react'

interface Subject {
  id: string
  name: string
  color: string
  created_at: string
}

export default function SubjectManager() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectColor, setNewSubjectColor] = useState('#667eea')

  const fetchSubjects = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('owner_id', user.id)
        .order('name')

      if (error) {
        console.error('Error fetching subjects:', error)
      } else {
        setSubjects(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchSubjects()
    }
  }, [user, fetchSubjects])

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newSubjectName.trim()) return

    try {
      const { error } = await supabase
        .from('subjects')
        .insert([
          {
            name: newSubjectName.trim(),
            color: newSubjectColor,
            owner_id: user.id
          }
        ])

      if (error) {
        console.error('Error creating subject:', error)
      } else {
        setNewSubjectName('')
        setNewSubjectColor('#667eea')
        setShowForm(false)
        fetchSubjects()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const predefinedColors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b',
    '#fa709a', '#ffecd2', '#a8edea', '#fad0c4'
  ]

  if (loading) {
    return (
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
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>
          Subjects
        </h2>
        <motion.button
          className="btn-primary"
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} />
          Add Subject
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          className="glass"
          style={{
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleCreateSubject}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Subject Name
              </label>
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="e.g., Mathematics, Physics, Chemistry"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Color
              </label>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewSubjectColor(color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: newSubjectColor === color ? '3px solid white' : '1px solid rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                type="submit"
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Subject
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {subjects.length === 0 ? (
        <motion.div
          className="glass"
          style={{
            padding: '40px',
            textAlign: 'center',
            borderRadius: '12px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BookOpen size={48} style={{
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '16px'
          }} />
          <h3 style={{
            color: 'white',
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            No subjects yet
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '20px'
          }}>
            Create your first subject to organize your study materials
          </p>
          <motion.button
            className="btn-primary"
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} style={{ marginRight: '6px' }} />
            Add Subject
          </motion.button>
        </motion.div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              className="glass"
              style={{
                padding: '20px',
                borderRadius: '12px',
                borderLeft: `4px solid ${subject.color}`
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: subject.color
                }} />
                <h3 style={{
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {subject.name}
                </h3>
              </div>
            </motion.div>
          ))}
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
