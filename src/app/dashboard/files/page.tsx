'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import SubjectManager from '@/components/subjects/SubjectManager'
import FileUpload from '@/components/files/FileUpload'
import { motion } from 'framer-motion'
import { 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  Image, 
  Video, 
  File,
  Calendar,
  Search,
  Filter
} from 'lucide-react'
import { Subject, UploadedFile } from '@/types'

export default function FilesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState('all')

  useEffect(() => {
    if (user) {
      fetchFiles()
    }
  }, [user, selectedSubject])

  useEffect(() => {
    filterFiles()
  }, [files, searchQuery, fileTypeFilter])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('uploaded_files')
        .select(`
          *,
          subjects (name, color)
        `)
        .eq('owner_id', user?.id)

      if (selectedSubject) {
        query = query.eq('subject_id', selectedSubject.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

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
  }

  const filterFiles = () => {
    let filtered = [...files]

    if (searchQuery) {
      filtered = filtered.filter(file => 
        file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(file => {
        switch (fileTypeFilter) {
          case 'images':
            return file.file_type.startsWith('image/')
          case 'documents':
            return file.file_type === 'application/pdf' || 
                   file.file_type.includes('document') || 
                   file.file_type.startsWith('text/')
          case 'videos':
            return file.file_type.startsWith('video/')
          default:
            return true
        }
      })
    }

    setFilteredFiles(filtered)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={24} />
    if (fileType.startsWith('video/')) return <Video size={24} />
    if (fileType === 'application/pdf') return <FileText size={24} />
    return <File size={24} />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async (file: UploadedFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('student-files')
        .download(file.file_path)

      if (error) {
        console.error('Download error:', error)
        alert('Failed to download file')
        return
      }

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.original_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file')
    }
  }

  const handleDelete = async (file: UploadedFile) => {
    const confirmed = confirm(`Are you sure you want to delete "${file.original_name}"?`)
    if (!confirmed) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('student-files')
        .remove([file.file_path])

      if (storageError) {
        console.error('Storage delete error:', storageError)
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', file.id)

      if (dbError) {
        console.error('Database delete error:', dbError)
        alert('Failed to delete file from database')
        return
      }

      // Update local state
      setFiles(files.filter(f => f.id !== file.id))
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  const handleUploadComplete = (newFiles: UploadedFile[]) => {
    setFiles([...newFiles, ...files])
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Left Column - Subjects */}
          <div>
            <SubjectManager 
              onSelectSubject={setSelectedSubject}
              selectedSubjectId={selectedSubject?.id}
            />
          </div>

          {/* Right Column - Files */}
          <div>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'white'
              }}>
                {selectedSubject ? `${selectedSubject.name} Files` : 'All Files'}
              </h1>
            </div>

            {/* Upload Section */}
            <div style={{ marginBottom: '32px' }}>
              <FileUpload 
                subjectId={selectedSubject?.id}
                onUploadComplete={handleUploadComplete}
              />
            </div>

            {/* Search and Filter */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{
                  position: 'absolute',
                  left: '12px',
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
                    padding: '12px 12px 12px 40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="all">All Types</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
                <option value="videos">Videos</option>
              </select>
            </div>

            {/* Files Grid */}
            {loading ? (
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
            ) : filteredFiles.length === 0 ? (
              <div className="glass" style={{
                padding: '40px',
                textAlign: 'center',
                borderRadius: '12px'
              }}>
                <File size={48} style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '16px'
                }} />
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '8px'
                }}>
                  No files found
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  {selectedSubject 
                    ? `Upload files for ${selectedSubject.name} to get started`
                    : 'Upload your first file to get started'
                  }
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    className="glass"
                    style={{
                      padding: '16px',
                      borderRadius: '12px'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        {getFileIcon(file.file_type)}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'white',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {file.original_name}
                        </h4>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <span style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '12px'
                          }}>
                            {formatFileSize(file.file_size)}
                          </span>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '12px'
                          }}>
                            <Calendar size={12} />
                            {new Date(file.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <motion.button
                        onClick={() => handleDownload(file)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          backgroundColor: 'rgba(102, 126, 234, 0.3)',
                          border: '1px solid rgba(102, 126, 234, 0.5)',
                          borderRadius: '6px',
                          color: '#667eea',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontSize: '12px'
                        }}
                        whileHover={{ backgroundColor: 'rgba(102, 126, 234, 0.4)' }}
                      >
                        <Download size={14} />
                        Download
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleDelete(file)}
                        style={{
                          padding: '8px',
                          backgroundColor: 'rgba(239, 68, 68, 0.3)',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          borderRadius: '6px',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.4)' }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
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
