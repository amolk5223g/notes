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
  type: 'multiple-choice' | 'true-false' | 'short-answer'
}

export class AIStudyAssistant {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  async analyzeNote(content: string, title: string): Promise<AIAnalysis> {
    const prompt = `
    Analyze this study note and provide a detailed analysis in JSON format:
    
    Title: ${title}
    Content: ${content}
    
    Return a JSON object with:
    - summary: A concise 2-3 sentence summary of the main concepts
    - keyPoints: Array of 3-5 most important points (as strings)
    - tags: Array of relevant subject/topic tags (3-5 tags)
    - difficulty: Rate as "beginner", "intermediate", or "advanced"
    - estimatedReadTime: Reading time in minutes (number)
    - studyTips: Array of 3 specific study tips for this content
    
    Keep responses concise and student-friendly.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      // Parse JSON response (add error handling)
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
    - options: Array of 4 possible answers for multiple choice
    - correctAnswer: Index (0-3) of the correct answer
    - explanation: Brief explanation of why the answer is correct
    - type: Always "multiple-choice" for now
    
    Make questions test understanding, not just memorization.
    Vary difficulty levels across questions.
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
    You are an AI study tutor. A student is asking a question about their study notes.
    
    Study Notes: ${noteContent}
    
    Student Question: ${userQuestion}
    
    Provide a clear, helpful answer based on the study notes. If the question isn't covered in the notes, say so and offer related information that might help.
    
    Keep your response concise but thorough, and explain concepts in a student-friendly way.
    `

    try {
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error('Q&A error:', error)
      throw new Error('Failed to process question')
    }
  }

  async getStudyPlan(notes: Array<{title: string, content: string}>, timeAvailable: number): Promise<string> {
    const notesContent = notes.map(note => `${note.title}: ${note.content.substring(0, 200)}...`).join('\n\n')
    
    const prompt = `
    Create a personalized study plan based on these notes. The student has ${timeAvailable} hours available.
    
    Notes:
    ${notesContent}
    
    Create a structured study plan that:
    - Prioritizes topics by importance and difficulty
    - Allocates time efficiently 
    - Suggests study techniques for each topic
    - Includes break recommendations
    - Provides a timeline
    
    Format as markdown with clear sections.
    `

    try {
      const result = await this.model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error('Study plan error:', error)
      throw new Error('Failed to generate study plan')
    }
  }
}

export const aiAssistant = new AIStudyAssistant()
