'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  MessageCircle, 
  BookOpen, 
  Target, 
  Loader2,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react'
import { Note } from '@/types'
import { AIAnalysis, QuizQuestion } from '@/lib/ai-service'

interface AIAssistantProps {
  note: Note
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistant({ note, isOpen, onClose }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'analyze' | 'quiz' | 'chat'>('analyze')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [chatQuestion, setChatQuestion] = useState('')
  const [chatAnswer, setChatAnswer] = useState('')

  const analyzeNote = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: note.content,
          title: note.title
        })
      })
      
      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQuiz = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: note.content,
          title: note.title,
          questionCount: 5
        })
      })
      
      const data = await response.json()
      setQuiz(data.quiz)
      setCurrentQuestion(0)
    } catch (error) {
      console.error('Quiz error:', error)
    } finally {
      setLoading(false)
    }
  }

  const askQuestion = async () => {
    if (!chatQuestion.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteContent: note.content,
          question: chatQuestion
        })
      })
      
      const data = await response.json()
      setChatAnswer(data.answer)
    } catch (error) {
      console.error('Chat error:', error)
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
            display: 'flex',
            flexDirection: 'column'
          }}
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain size={20} color="white" />
              </div>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                  AI Assistant
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', margin: 0 }}>
                  Powered by Gemini
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {[
              { id: 'analyze', icon: Target, label: 'Analyze' },
              { id: 'quiz', icon: BookOpen, label: 'Quiz' },
              { id: 'chat', icon: MessageCircle, label: 'Chat' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: activeTab === tab.id ? 'rgba(102, 126, 234, 0.2)' : 'none',
                  border: 'none',
                  color: activeTab === tab.id ? '#a5b4fc' : 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px'
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
            {activeTab === 'analyze' && (
              <div>
                {!analysis ? (
                  <div style={{ textAlign: 'center' }}>
                    <Sparkles size={48} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px' }} />
                    <h4 style={{ color: 'white', marginBottom: '8px' }}>Analyze Your Note</h4>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px', fontSize: '14px' }}>
                      Get AI-powered insights, key points, and study tips
                    </p>
                    <motion.button
                      className="btn-primary"
                      onClick={analyzeNote}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}
                      {loading ? 'Analyzing...' : 'Analyze Note'}
                    </motion.button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ color: 'white', marginBottom: '8px' }}>Summary</h4>
                      <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', lineHeight: '1.5' }}>
                        {analysis.summary}
                      </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ color: 'white', marginBottom: '8px' }}>Key Points</h4>
                      {analysis.keyPoints.map((point, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          marginBottom: '6px'
                        }}>
                          <ChevronRight size={14} style={{ color: '#667eea', marginTop: '2px' }} />
                          <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}>
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ color: 'white', marginBottom: '8px' }}>Study Tips</h4>
                      {analysis.studyTips.map((tip, index) => (
                        <div key={index} style={{
                          padding: '8px 12px',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          borderRadius: '6px',
                          marginBottom: '6px'
                        }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}>
                            {tip}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                        Difficulty: {analysis.difficulty}
                      </span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                        {analysis.estimatedReadTime} min read
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quiz' && (
              <div>
                {quiz.length === 0 ? (
                  <div style={{ textAlign: 'center' }}>
                    <BookOpen size={48} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px' }} />
                    <h4 style={{ color: 'white', marginBottom: '8px' }}>Generate Quiz</h4>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px', fontSize: '14px' }}>
                      Test your knowledge with AI-generated questions
                    </p>
                    <motion.button
                      className="btn-primary"
                      onClick={generateQuiz}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <BookOpen size={16} />}
                      {loading ? 'Generating...' : 'Generate Quiz'}
                    </motion.button>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{ color: 'white', margin: 0 }}>
                        Question {currentQuestion + 1} of {quiz.length}
                      </h4>
                      <div style={{
                        width: '60px',
                        height: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${((currentQuestion + 1) / quiz.length) * 100}%`,
                          height: '100%',
                          backgroundColor: '#667eea',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {quiz[currentQuestion] && (
                      <div>
                        <h4 style={{
                          color: 'white',
                          marginBottom: '16px',
                          fontSize: '16px',
                          lineHeight: '1.4'
                        }}>
                          {quiz[currentQuestion].question}
                        </h4>

                        <div style={{ marginBottom: '20px' }}>
                          {quiz[currentQuestion].options.map((option, index) => (
                            <button
                              key={index}
                              style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.2)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                              }}
                            >
                              {String.fromCharCode(65 + index)}. {option}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            disabled={currentQuestion === 0}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '6px',
                              color: 'white',
                              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                              opacity: currentQuestion === 0 ? 0.5 : 1
                            }}
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setCurrentQuestion(Math.min(quiz.length - 1, currentQuestion + 1))}
                            disabled={currentQuestion === quiz.length - 1}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: 'rgba(102, 126, 234, 0.2)',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                              borderRadius: '6px',
                              color: '#a5b4fc',
                              cursor: currentQuestion === quiz.length - 1 ? 'not-allowed' : 'pointer',
                              opacity: currentQuestion === quiz.length - 1 ? 0.5 : 1
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: 'white', marginBottom: '8px' }}>Ask About This Note</h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '16px' }}>
                    Ask any question about the content and get AI-powered explanations
                  </p>
                  
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <input
                      type="text"
                      value={chatQuestion}
                      onChange={(e) => setChatQuestion(e.target.value)}
                      placeholder="What would you like to know about this note?"
                      style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: '50px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                    />
                    <button
                      onClick={askQuestion}
                      disabled={loading || !chatQuestion.trim()}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        color: 'white',
                        cursor: loading || !chatQuestion.trim() ? 'not-allowed' : 'pointer',
                        opacity: loading || !chatQuestion.trim() ? 0.5 : 1
                      }}
                    >
                      {loading ? <Loader2 className="animate-spin" size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>
                </div>

                {chatAnswer && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '8px'
                  }}>
                    <h5 style={{ color: '#a5b4fc', marginBottom: '8px', fontSize: '14px' }}>
                      AI Response:
                    </h5>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      margin: 0
                    }}>
                      {chatAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
