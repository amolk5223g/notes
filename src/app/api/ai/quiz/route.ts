import { NextRequest, NextResponse } from 'next/server'
import { aiAssistant } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { content, title, questionCount = 5 } = await request.json()

    if (!content || !title) {
      return NextResponse.json(
        { error: 'Content and title are required' },
        { status: 400 }
      )
    }

    const quiz = await aiAssistant.generateQuiz(content, title, questionCount)
    
    return NextResponse.json({ quiz })
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}
