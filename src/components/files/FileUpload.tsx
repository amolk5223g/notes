'use client'
import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Upload, File, CheckCircle } from 'lucide-react'

interface Subject {
  id: string
  name: string
  color: string
}

interface FileUploadProps {
  onUploadSuccess: () => void
  subjects: Subject[]
}

export default function FileUpload({ onUploadSuccess, subjects }: FileUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const uploadFile = useCallback(async (file: File) => {
    if (!user) return

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file)

      if (storageError) {
        console.error('Storage error:', storageError)
        alert('Upload failed: ' + storageError.message)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName)

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert([
          {
            name: file.name,
            size: file.size,
            type: file.type,
            url: urlData.publicUrl,
            subject_id: selectedSubject || null,
            owner_id: user.id
          }
        ])

      if (dbError) {
        console.error('Database error:', dbError)
        alert('Failed to save file info: ' + dbError.message)
        return
      }

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
      onUploadSuccess()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [user, selectedSubject, onUploadSuccess])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0])
    }
  }, [uploadFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0])
    }
  }, [uploadFile])

  return (
    <div>
      {/* Subject Selection */}
      {subjects.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Upload Area */}
      <motion.div
        style={{
          border: `2px dashed ${dragActive ? '#667eea' : 'rgba(255, 255, 255, 0.3)'}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: dragActive ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploading) {
            document.getElementById('file-input')?.click()
          }
        }}
        whileHover={{ scale: uploading ? 1 : 1.02 }}
      >
        <input
          id="file-input"
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
          disabled={uploading}
        />

        {uploading ? (
          <div>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
              Uploading...
            </p>
          </div>
        ) : uploadSuccess ? (
          <div>
            <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
            <p style={{ color: '#10b981', fontSize: '16px', fontWeight: '500' }}>
              Upload successful!
            </p>
          </div>
        ) : (
          <div>
            <Upload size={48} style={{ color: 'rgba(255, 255, 255, 0.5)', margin: '0 auto 16px' }} />
            <p style={{ color: 'white', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              Drop files here or click to upload
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              Supports PDF, DOC, images, and videos (max 50MB)
            </p>
          </div>
        )}
      </motion.div>

      {/* Recent Uploads Preview */}
      <div style={{ marginTop: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <File size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
          <span style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px'
          }}>
            Upload files to organize your study materials
          </span>
        </div>
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
