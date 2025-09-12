'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Settings, 
  LogOut, 
  FileText, 
  Users, 
  Star,
  Archive,
  Menu,
  X,
  FolderOpen,
  Share2
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    if (isMobile) setSidebarOpen(false)
    setCurrentPath(href)
  }

  const menuItems = [
    { 
      icon: FileText, 
      label: 'All Notes', 
      href: '/dashboard', 
      active: currentPath === '/dashboard' 
    },
    { 
      icon: FolderOpen, 
      label: 'Files & Media', 
      href: '/dashboard/files', 
      active: currentPath.startsWith('/dashboard/files') 
    },
    { 
      icon: Users, 
      label: 'Study Groups', 
      href: '/dashboard/groups', 
      active: currentPath.startsWith('/dashboard/groups') 
    },
    { 
      icon: Share2, 
      label: 'Shared', 
      href: '/dashboard/shared',
      active: currentPath.startsWith('/dashboard/shared')
    },
    { 
      icon: Star, 
      label: 'Favorites', 
      href: '/dashboard/favorites',
      active: currentPath.startsWith('/dashboard/favorites')
    },
    { 
      icon: Archive, 
      label: 'Archive', 
      href: '/dashboard/archive',
      active: currentPath.startsWith('/dashboard/archive')
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        style={{
          width: '280px',
          position: isMobile ? 'fixed' : 'relative',
          height: '100vh',
          zIndex: 50,
          transform: (isMobile && !sidebarOpen) ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s ease'
        }}
        className="glass"
        initial={{ x: isMobile ? -280 : 0 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '32px' 
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white'
            }}>
              SecureNotes
            </h1>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* User Info */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              color: 'white',
              fontWeight: '600'
            }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <p style={{
              color: 'white',
              fontWeight: '500',
              fontSize: '14px',
              marginBottom: '4px'
            }}>
              {user?.email?.split('@')[0]}
            </p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px'
            }}>
              {user?.email}
            </p>
          </div>

          {/* Create Note Button */}
          <motion.button
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation('/dashboard/new')}
          >
            <Plus size={18} />
            New Note
          </motion.button>

          {/* Navigation */}
          <nav style={{ flex: 1 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {menuItems.map((item) => (
                <li key={item.label} style={{ marginBottom: '8px' }}>
                  <motion.button
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: item.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{
                      backgroundColor: item.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      scale: 1.02
                    }}
                    onClick={() => handleNavigation(item.href)}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </motion.button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Settings & Logout */}
          <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            <motion.button
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                marginBottom: '8px'
              }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => {
                // TODO: Add settings functionality
                alert('Settings functionality coming soon!')
              }}
            >
              <Settings size={18} />
              Settings
            </motion.button>
            
            <motion.button
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px'
              }}
              whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              Sign Out
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <header style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: isMobile ? 'flex' : 'none',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Menu size={20} />
          </button>

          <div style={{
            flex: 1,
            maxWidth: '400px',
            position: 'relative'
          }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.5)'
            }} />
            <input
              type="text"
              placeholder="Search notes..."
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: '24px',
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
