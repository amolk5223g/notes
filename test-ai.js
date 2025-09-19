const { GoogleGenerativeAI } = require('@google/generative-ai')

// Test your API key
async function testGeminiAPI() {
  const genAI = new GoogleGenerativeAI('AIzaSyD9L98YpN1W2I7o279UCFtTIsGIIpPDDPQ')
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  try {
    const result = await model.generateContent('Say hello!')
    console.log('✅ Gemini API works!')
    console.log('Response:', result.response.text())
  } catch (error) {
    console.error('❌ API Error:', error.message)
  }
}

testGeminiAPI()
