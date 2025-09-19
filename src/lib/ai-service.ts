import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
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
    Analyze this study note and provide insights in JSON format:
    
    Title: ${title}
    Content: ${content}
    
    Return JSON with:
    - summary: 2-3 sentence summary
    - keyPoints: Array of 3-5 important points
    - tags: Array of 3-5 relevant study tags
    - difficulty: "beginner", "intermediate", or "advanced"
    - estimatedReadTime: Reading time in minutes (number)
    - studyTips: Array of 3 specific study recommendations
    
    Keep responses student-friendly and concise.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      // Clean and parse JSON response
      const cleanResponse = response.replace(/``````\n?/g, '')
      return JSON.parse(cleanResponse) as AIAnalysis
    } catch (error) {
      console.error('AI Analysis failed:', error)
      
      // Fallback response if API fails
      return {
        summary: "AI analysis is temporarily unavailable. Your note content looks good for studying!",
        keyPoints: ["Review the main concepts", "Practice with examples", "Make connections between ideas"],
        tags: ["study", "notes", "learning"],
        difficulty: "intermediate" as const,
        estimatedReadTime: Math.ceil(content.length / 1000) || 1,
        studyTips: [
          "Break down complex topics into smaller parts",
          "Create visual diagrams if possible", 
          "Test your understanding with practice questions"
        ]
      }
    }
  }

  async generateQuiz(content: string, title: string, questionCount = 5): Promise<QuizQuestion[]> {
    const prompt = `
    Create ${questionCount} multiple-choice quiz questions from this study material:
    
    Title: ${title}
    Content: ${content}
    
    Return JSON array with each question having:
    - question: Clear question text
    - options: Array of 4 possible answers
    - correctAnswer: Index (0-3) of correct answer
    - explanation: Why the answer is correct
    - type: "multiple-choice"
    
    Make questions test understanding, not just memory.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const cleanResponse = response.replace(/``````\n?/g, '')
      return JSON.parse(cleanResponse) as QuizQuestion[]
    } catch (error) {
      console.error('Quiz generation failed:', error)
      
      // Fallback quiz if API fails
      return [
        {
          question: `What is the main topic of "${title}"?`,
          options: [
            "The content discusses multiple concepts",
            "It's a simple overview",
            "Complex technical details",
            "Basic introduction"
          ],
          correctAnswer: 0,
          explanation: "Quiz generation is temporarily unavailable. This is a sample question.",
          type: "multiple-choice"
        }
      ]
    }
  }

  async askQuestion(noteContent: string, userQuestion: string): Promise<string> {
    const prompt = `
    You are an AI study tutor helping a student understand their notes.
    
    Student's Notes: ${noteContent}
    
    Student's Question: ${userQuestion}
    
    Provide a clear, helpful answer based on the notes. If the question isn't covered in the notes, say so politely and offer related information that might help.
    
    Keep your response educational and encouraging.
    `

    try {
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error('Q&A failed:', error)
      return `I'm sorry, I'm having trouble processing your question right now. However, based on your notes about "${noteContent.substring(0, 50)}...", I'd suggest reviewing the key concepts and trying to connect them to your question. Feel free to ask again!`
    }
  }
}

// Export singleton instance
export const aiAssistant = new AIStudyAssistant()
