'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Plus, Book, Edit3, Trash2, FolderOpen } from 'lucide-react'
import { Subject } from '@/types'

interface SubjectManagerProps {
  onSelectSubject?: (subject: Subject) => void
  selectedSubjectId?: string
}

const subjectColors = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b',
  '#fa709a', '#ffecd2', '#a8edea', '#fed6e3',
  '#ff9a9e', '#fecfef', '#ffecd2'
]

export default function SubjectManager({ onSelectSubject, selectedSubjectId }: SubjectManagerProps) {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', description: '', color: '#667eea' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubjects()
    }
  }, [user])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

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
  }

  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: newSubject.name.trim(),
          description: newSubject.description.trim(),
          color: newSubject.color,
          owner_id: user?.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding subject:', error)
        alert('Error adding subject: ' + error.message)
      } else {
        setSubjects([data, ...subjects])
        setNewSubject({ name: '', description: '', color: '#667eea' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An unexpected error occurred')
    }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    const confirmed = confirm('Are you sure you want to delete this subject? All associated files will be moved to "General".')
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)

      if (error) {
        console.error('Error deleting subject:', error)
        alert('Error deleting subject: ' + error.message)
      } else {
        setSubjects(subjects.filter(s => s.id !== subjectId))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An unexpected error occurred')
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
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
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'white'
        }}>
          Subjects ({subjects.length})
        </h3>
        
        <motion.button
          className="btn-primary"
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px'
          }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={16} />
          Add Subject
        </motion.button>
      </div>

      {/* Add Subject Form */}
      {showAddForm && (
        <motion.div
          className="glass"
          style={{
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 style={{
            color: 'white',
            marginBottom: '16px',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            Add New Subject
          </h4>
          
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Subject name (e.g., Mathematics, Physics)"
              value={newSubject.name}
              onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <textarea
              placeholder="Description (optional)"
              value={newSubject.description}
              onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: 'white',
              fontSize: '14px',
              marginBottom: '8px'
            }}>
              Choose Color:
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {subjectColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewSubject({...newSubject, color})}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: newSubject.color === color ? '3px solid white' : '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAddSubject}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Add Subject
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Subjects Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            className="glass"
            style={{
              padding: '20px',
              borderRadius: '12px',
              cursor: 'pointer',
              borderLeft: `4px solid ${subject.color}`,
              backgroundColor: selectedSubjectId === subject.id ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectSubject?.(subject)}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: subject.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Book size={20} color="white" />
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteSubject(subject.id)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '8px'
            }}>
              {subject.name}
            </h4>
            
            {subject.description && (
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {subject.description}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
