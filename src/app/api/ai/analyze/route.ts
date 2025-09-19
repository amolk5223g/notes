import { NextRequest, NextResponse } from 'next/server'
import { aiAssistant } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { content, title } = await request.json()

    if (!content || !title) {
      return NextResponse.json(
        { error: 'Content and title are required' },
        { status: 400 }
      )
    }

    const analysis = await aiAssistant.analyzeNote(content, title)
    
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze note' },
      { status: 500 }
    )
  }
}
