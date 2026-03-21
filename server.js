import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())

// Groq API proxy endpoint
app.post('/api/grok', async (req, res) => {
  try {
    const { messages, system } = req.body

    // Get API key from environment
    const GROQ_API_KEY = process.env.VITE_GROK_API

    console.log('📝 Received request:', { messages: messages.length, hasSystem: !!system })
    console.log('🔑 API Key available:', !!GROQ_API_KEY)

    if (!GROQ_API_KEY) {
      console.error('❌ Error: Groq API key not found in environment')
      return res.status(400).json({ error: 'Groq API key not configured. Check .env.local file.' })
    }

    // Build message array with system message at the beginning
    const allMessages = [
      { role: 'system', content: system },
      ...messages
    ]

    // Call Groq API
    console.log('🚀 Calling Groq API...')
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        max_tokens: 300,
        messages: allMessages
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Groq API error:', response.status, errorData)
      return res.status(response.status).json({ error: `Groq API Error: ${response.status}`, details: errorData })
    }

    const data = await response.json()
    console.log('✅ Success! Got response from Groq')
    res.json({
      success: true,
      content: data.choices[0].message.content
    })

  } catch (error) {
    console.error('❌ Server error:', error)
    res.status(500).json({ error: 'Server error', details: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`)
  console.log(`📌 Using Groq API with key: ${process.env.VITE_GROK_API ? '✅ Loaded' : '❌ Not found'}`)
})
