'use client'
import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Video, 
  X, 
  Check,
  AlertCircle
} from 'lucide-react'
import { Subject, UploadedFile } from '@/types'

interface FileUploadProps {
  subjectId?: string
  noteId?: string
  onUploadComplete?: (files: UploadedFile[]) => void
}

export default function FileUpload({ subjectId, noteId, onUploadComplete }: FileUploadProps) {
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = {
    'image/*': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    'application/pdf': ['pdf'],
    'video/*': ['mp4', 'avi', 'mkv', 'mov', 'wmv'],
    'audio/*': ['mp3', 'wav', 'ogg'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-powerpoint': ['ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
    'text/*': ['txt', 'md']
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={20} />
    if (fileType.startsWith('video/')) return <Video size={20} />
    if (fileType === 'application/pdf') return <FileText size={20} />
    return <File size={20} />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files: File[]) => {
    if (!user) return

    setUploading(true)
    const newUploadedFiles: UploadedFile[] = []

    for (const file of files) {
      try {
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 50MB.`)
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${subjectId || 'general'}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('student-files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          alert(`Failed to upload ${file.name}: ${uploadError.message}`)
          continue
        }

        // Save file metadata to database
        const { data: fileRecord, error: dbError } = await supabase
          .from('uploaded_files')
          .insert({
            filename: fileName,
            original_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
            subject_id: subjectId,
            note_id: noteId,
            owner_id: user.id
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          // Clean up uploaded file if database insert fails
          await supabase.storage.from('student-files').remove([fileName])
          continue
        }

        newUploadedFiles.push(fileRecord)

      } catch (error) {
        console.error('Error uploading file:', error)
        alert(`Failed to upload ${file.name}`)
      }
    }

    setUploadedFiles(prev => [...prev, ...newUploadedFiles])
    setUploading(false)
    
    if (onUploadComplete && newUploadedFiles.length > 0) {
      onUploadComplete(newUploadedFiles)
    }
  }

  return (
    <div>
      {/* Upload Area */}
      <motion.div
        className={`glass ${dragActive ? 'border-blue-400' : ''}`}
        style={{
          padding: '40px',
          borderRadius: '12px',
          border: `2px dashed ${dragActive ? '#667eea' : 'rgba(255, 255, 255, 0.3)'}`,
          backgroundColor: dragActive ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={Object.keys(allowedTypes).join(',')}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        <Upload size={48} style={{ 
          color: dragActive ? '#667eea' : 'rgba(255, 255, 255, 0.6)',
          marginBottom: '16px'
        }} />

        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'white',
          marginBottom: '8px'
        }}>
          {dragActive ? 'Drop files here' : 'Upload your study materials'}
        </h3>

        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '16px'
        }}>
          Drag & drop files here or click to browse
        </p>

        <p style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          Supports: Images, PDFs, Videos, Documents (Max 50MB each)
        </p>

        {uploading && (
          <motion.div
            style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ color: 'white' }}>Uploading files...</span>
          </motion.div>
        )}
      </motion.div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <motion.div
          style={{ marginTop: '20px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 style={{
            color: 'white',
            marginBottom: '12px',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="glass"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {getFileIcon(file.file_type)}
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '2px'
                  }}>
                    {file.original_name}
                  </p>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px'
                  }}>
                    {formatFileSize(file.file_size)}
                  </p>
                </div>
                <Check size={16} style={{ color: '#10b981' }} />
              </div>
            ))}
          </div>
        </motion.div>
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
