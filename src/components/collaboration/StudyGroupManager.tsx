'use client'
import { motion } from 'framer-motion'
import { Users, Zap, Share2, MessageSquare, Calendar, Shield } from 'lucide-react'

export default function StudyGroupManager() {
  return (
    <div>
      <motion.div
        className="glass"
        style={{
          padding: '50px 40px',
          textAlign: 'center',
          borderRadius: '20px'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🚀</div>
        
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '16px'
        }}>
          Study Groups Coming Soon!
        </h1>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.25rem',
          marginBottom: '40px',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          We&apos;re building an amazing collaboration system where you and your friends 
          can create study groups, share notes, and work together on projects in real-time.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
          maxWidth: '900px',
          margin: '0 auto 48px'
        }}>
          {[
            {
              icon: Users,
              title: 'Create Study Groups',
              description: 'Organize groups by subjects like Math, Physics, Chemistry'
            },
            {
              icon: Share2,
              title: 'Share Everything',
              description: 'Share notes, PDFs, images, and videos with group members'
            },
            {
              icon: MessageSquare,
              title: 'Real-time Chat',
              description: 'Discuss topics and ask questions in group conversations'
            },
            {
              icon: Zap,
              title: 'Live Collaboration',
              description: 'Edit notes together in real-time like Google Docs'
            },
            {
              icon: Calendar,
              title: 'Assignment Tracking',
              description: 'Set deadlines and track progress on group projects'
            },
            {
              icon: Shield,
              title: 'Permission Control',
              description: 'Admin, Editor, and Viewer roles for secure collaboration'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              style={{
                padding: '24px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <feature.icon size={36} style={{ 
                color: '#667eea', 
                marginBottom: '16px' 
              }} />
              <h3 style={{
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div style={{
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            color: '#667eea',
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            🔧 Currently in Development
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px'
          }}>
            Your SecureNotes platform already has all the core features working perfectly. 
            Collaboration features are being added as the next major update!
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <motion.button
            className="btn-primary"
            style={{
              padding: '14px 24px',
              fontSize: '1rem',
              fontWeight: '600'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/dashboard'}
          >
            Back to Dashboard
          </motion.button>
          
          <motion.button
            className="btn-secondary"
            style={{
              padding: '14px 24px',
              fontSize: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/dashboard/files'}
          >
            Upload Study Files
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
