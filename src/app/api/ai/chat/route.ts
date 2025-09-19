import { NextRequest, NextResponse } from 'next/server'
import { aiAssistant } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { noteContent, question } = await request.json()

    if (!noteContent || !question) {
      return NextResponse.json(
        { error: 'Note content and question are required' },
        { status: 400 }
      )
    }

    const answer = await aiAssistant.askQuestion(noteContent, question)
    
    return NextResponse.json({ answer })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}
