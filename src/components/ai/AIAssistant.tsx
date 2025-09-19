'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, MessageCircle, BookOpen, X, Loader2 } from 'lucide-react'
import { Note } from '@/types'

interface AIAssistantProps {
  note: Note
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistant({ note, isOpen, onClose }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'analyze' | 'quiz' | 'chat'>('analyze')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note.content, title: note.title })
      })
      const data = await response.json()
      setResult(data.analysis)
    } catch (error) {
      console.error('Analysis error:', error)
      setResult({ error: 'Failed to analyze note' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 1000,
            padding: '20px'
          }}
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: 'white', margin: 0 }}>🤖 AI Assistant</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Simple Demo */}
          <div style={{ color: 'white' }}>
            <p>Analyzing: {note.title}</p>
            
            {!result && !loading && (
              <button 
                onClick={handleAnalyze}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Brain size={16} />
                Analyze Note
              </button>
            )}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 className="animate-spin" size={16} />
                Analyzing...
              </div>
            )}

            {result && !result.error && (
              <div>
                <h4>Summary:</h4>
                <p style={{ fontSize: '14px' }}>{result.summary}</p>
                
                <h4>Key Points:</h4>
                <ul>
                  {result.keyPoints?.map((point: string, index: number) => (
                    <li key={index} style={{ fontSize: '14px', marginBottom: '4px' }}>{point}</li>
                  ))}
                </ul>

                <h4>Study Tips:</h4>
                <ul>
                  {result.studyTips?.map((tip: string, index: number) => (
                    <li key={index} style={{ fontSize: '14px', marginBottom: '4px' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {result?.error && (
              <p style={{ color: '#ef4444' }}>{result.error}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
