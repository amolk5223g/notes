import { supabase } from './supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface CollaborativeNote {
  id: string
  content: string
  cursor_positions: { [userId: string]: number }
  active_users: string[]
}

export class RealtimeCollaboration {
  private channel: RealtimeChannel | null = null
  private noteId: string | null = null
  private userId: string | null = null

  constructor(userId: string) {
    this.userId = userId
  }

  joinNote(noteId: string, onUpdate: (data: any) => void) {
    this.noteId = noteId
    this.channel = supabase
      .channel(`note:${noteId}`)
      .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
        onUpdate({ type: 'cursor-move', ...payload })
      })
      .on('broadcast', { event: 'content-change' }, ({ payload }) => {
        onUpdate({ type: 'content-change', ...payload })
      })
      .on('presence', { event: 'sync' }, () => {
        const newState = this.channel?.presenceState()
        onUpdate({ type: 'presence-sync', users: newState })
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        onUpdate({ type: 'user-join', userId: key, user: newPresences[0] })
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        onUpdate({ type: 'user-leave', userId: key })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.channel?.track({
            user_id: this.userId,
            online_at: new Date().toISOString(),
          })
        }
      })
  }

  broadcastCursorMove(position: number) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: {
          user_id: this.userId,
          position,
        },
      })
    }
  }

  broadcastContentChange(content: string, selection: { start: number; end: number }) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'content-change',
        payload: {
          user_id: this.userId,
          content,
          selection,
        },
      })
    }
  }

  leaveNote() {
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
      this.noteId = null
    }
  }
}
