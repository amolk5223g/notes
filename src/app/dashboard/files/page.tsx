'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FileUpload from '@/components/files/FileUpload'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Search, 
  SortDesc,
  Grid,
  List,
  Download,
  FileText
} from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  created_at: string
  subject_id?: string
}

interface Subject {
  id: string
  name: string
  color: string
}

export default function FilesPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  const fetchFiles = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select(`
          *,
          subjects (name, color)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching files:', error)
      } else {
        setFiles(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

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
    }
  }, [user])

  const filterFiles = useCallback(() => {
    let filtered = files

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(file => file.subject_id === selectedSubject)
    }

    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(file => {
        if (fileTypeFilter === 'images') return file.type.startsWith('image/')
        if (fileTypeFilter === 'documents') return file.type.includes('pdf') || file.type.includes('document')
        if (fileTypeFilter === 'videos') return file.type.startsWith('video/')
        return true
      })
    }

    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [files, selectedSubject, fileTypeFilter, searchQuery])

  useEffect(() => {
    if (user) {
      fetchFiles()
      fetchSubjects()
    }
  }, [user, fetchFiles, fetchSubjects])

  const filteredFiles = filterFiles()

  if (!user) {
    return null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.startsWith('video/')) return '🎥'
    if (type.includes('document')) return '📝'
    return '📁'
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '4px'
            }}>
              Files
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem'
            }}>
              {files.length} {files.length === 1 ? 'file' : 'files'} • {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))} total
            </p>
          </div>

          <FileUpload onUploadSuccess={fetchFiles} subjects={subjects} />
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.5)'
            }} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          {/* File Type Filter */}
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              minWidth: '120px'
            }}
          >
            <option value="all">All Types</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
            <option value="videos">Videos</option>
          </select>

          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 12px',
                backgroundColor: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 12px',
                backgroundColor: viewMode === 'list' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Files Grid/List */}
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
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
        ) : filteredFiles.length === 0 ? (
          <motion.div
            className="glass"
            style={{
              padding: '60px 40px',
              textAlign: 'center',
              borderRadius: '16px'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FileText size={64} style={{
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '24px'
            }} />
            
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '12px'
            }}>
              {searchQuery || selectedSubject !== 'all' || fileTypeFilter !== 'all' 
                ? 'No files match your filters' 
                : 'No files uploaded yet'
              }
            </h3>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              {searchQuery || selectedSubject !== 'all' || fileTypeFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you need.'
                : 'Upload your first file to get started organizing your study materials!'
              }
            </p>
          </motion.div>
        ) : (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'none',
            flexDirection: viewMode === 'list' ? 'column' : 'row',
            gap: '20px'
          }}>
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                className="glass"
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: viewMode === 'list' ? 'flex' : 'block',
                  alignItems: viewMode === 'list' ? 'center' : 'normal',
                  gap: viewMode === 'list' ? '16px' : '0'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div style={{
                  fontSize: '2rem',
                  marginBottom: viewMode === 'grid' ? '12px' : '0',
                  flexShrink: 0
                }}>
                  {getFileIcon(file.type)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {file.name}
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '12px'
                  }}>
                    <span>{formatFileSize(file.size)}</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexShrink: 0
                }}>
                  <motion.button
                    style={{
                      padding: '8px',
                      backgroundColor: 'rgba(102, 126, 234, 0.2)',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      borderRadius: '6px',
                      color: '#a5b4fc',
                      cursor: 'pointer'
                    }}
                    whileHover={{ backgroundColor: 'rgba(102, 126, 234, 0.3)' }}
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
