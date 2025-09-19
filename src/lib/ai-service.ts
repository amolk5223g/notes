import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface AIAnalysis {
  summary: string
  keyPoints: string[]
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedReadTime: number
  studyTips: string[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  type: 'multiple-choice'
}

export class AIStudyAssistant {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  async analyzeNote(content: string, title: string): Promise<AIAnalysis> {
    const prompt = `
    Analyze this study note and provide a detailed analysis in JSON format:
    
    Title: ${title}
    Content: ${content}
    
    Return a JSON object with:
    - summary: A concise 2-3 sentence summary
    - keyPoints: Array of 3-5 important points
    - tags: Array of relevant tags (3-5 tags)
    - difficulty: "beginner", "intermediate", or "advanced"
    - estimatedReadTime: Reading time in minutes
    - studyTips: Array of 3 study tips
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      const cleanResponse = response.replace(/``````\n?/g, '')
      return JSON.parse(cleanResponse) as AIAnalysis
    } catch (error) {
      console.error('AI Analysis error:', error)
      throw new Error('Failed to analyze note content')
    }
  }

  async generateQuiz(content: string, title: string, questionCount = 5): Promise<QuizQuestion[]> {
    const prompt = `
    Create ${questionCount} quiz questions based on this study material:
    
    Title: ${title}
    Content: ${content}
    
    Return a JSON array of quiz questions, each with:
    - question: The question text
    - options: Array of 4 possible answers
    - correctAnswer: Index (0-3) of correct answer
    - explanation: Brief explanation
    - type: "multiple-choice"
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      const cleanResponse = response.replace(/``````\n?/g, '')
      return JSON.parse(cleanResponse) as QuizQuestion[]
    } catch (error) {
      console.error('Quiz generation error:', error)
      throw new Error('Failed to generate quiz questions')
    }
  }

  async askQuestion(noteContent: string, userQuestion: string): Promise<string> {
    const prompt = `
    You are an AI study tutor. Answer the student's question about their notes.
    
    Study Notes: ${noteContent}
    Student Question: ${userQuestion}
    
    Provide a clear, helpful answer based on the notes.
    `

    try {
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error('Q&A error:', error)
      throw new Error('Failed to process question')
    }
  }
}

export const aiAssistant = new AIStudyAssistant()
