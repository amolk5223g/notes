'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface RegisterFormProps {
  onToggleMode: () => void
}

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CheckCircle size={64} style={{ color: '#10b981', marginBottom: '24px' }} />
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '16px'
        }}>
          Check your email
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          We&apos;ve sent you a confirmation link at <strong>{email}</strong>. 
          Click the link to activate your account.
        </p>
        <button
          onClick={onToggleMode}
          className="btn-secondary"
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          Back to Sign In
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="glass"
      style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        borderRadius: '20px'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '8px'
        }}>
          Create Account
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '1rem'
        }}>
          Join SecureNotes today
        </p>
      </div>

      {error && (
        <motion.div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <AlertCircle size={16} style={{ color: '#ef4444' }} />
          <span style={{ color: '#ef4444', fontSize: '14px' }}>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.5)'
            }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.5)'
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '14px 48px 14px 48px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Confirm Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.5)'
            }} />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '24px'
          }}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </motion.button>

        <p style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px'
        }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Sign in
          </button>
        </p>
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
