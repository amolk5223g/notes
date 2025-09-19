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

    // Check if content is too short
    if (content.length < 10) {
      return NextResponse.json(
        { error: 'Content too short for analysis' },
        { status: 400 }
      )
    }

    const analysis = await aiAssistant.analyzeNote(content, title)
    
    return NextResponse.json({ 
      success: true,
      analysis 
    })
  } catch (error) {
    console.error('AI analysis route error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze note. Please try again.' },
      { status: 500 }
    )
  }
}
