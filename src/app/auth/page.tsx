'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Toggle between login and register */}
        <motion.div 
          style={{ 
            textAlign: 'center', 
            marginBottom: '20px' 
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '8px'
          }}>
            SecureNotes
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1rem'
          }}>
            Your collaborative study platform
          </p>
        </motion.div>

        {/* Auth Forms - FIXED PROP NAMES */}
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}
