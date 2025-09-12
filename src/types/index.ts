export interface Note {
  id: string
  title: string
  content?: string
  encrypted_content?: string
  tags: string[]
  is_encrypted: boolean
  is_public: boolean
  password_hash?: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface SharedNote {
  id: string
  note_id: string
  shared_with: string
  permission: 'view' | 'edit' | 'admin'
  created_at: string
}

export interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}
export interface Subject {
  id: string
  name: string
  color: string
  description?: string
  owner_id: string
  created_at: string
}

export interface UploadedFile {
  id: string
  filename: string
  original_name: string
  file_path: string
  file_size: number
  file_type: string
  subject_id?: string
  note_id?: string
  owner_id: string
  created_at: string
}

// Update Note interface
export interface Note {
  id: string
  title: string
  content?: string
  encrypted_content?: string
  tags: string[]
  is_encrypted: boolean
  is_public: boolean
  password_hash?: string
  owner_id: string
  subject_id?: string // Add this
  created_at: string
  updated_at: string
}
