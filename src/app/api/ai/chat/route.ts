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

    if (question.length < 3) {
      return NextResponse.json(
        { error: 'Please ask a more detailed question' },
        { status: 400 }
      )
    }

    const answer = await aiAssistant.askQuestion(noteContent, question)
    
    return NextResponse.json({ 
      success: true,
      answer 
    })
  } catch (error) {
    console.error('AI chat route error:', error)
    return NextResponse.json(
      { error: 'Failed to process question. Please try again.' },
      { status: 500 }
    )
  }
}
