import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import googleTTS from 'google-tts-api'

function loadEnvFile(fileName = '.env.local') {
  const envPath = path.resolve(process.cwd(), fileName)

  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️ Env file not found: ${fileName}`)
    return
  }

  const fileBuffer = fs.readFileSync(envPath)
  let content = fileBuffer.toString('utf8')

  // Windows tools may save .env as UTF-16LE, which dotenv.config() won't parse.
  if (content.includes('\u0000')) {
    content = fileBuffer.toString('utf16le')
  }

  const parsed = dotenv.parse(content)
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]) {
      process.env[key] = value
    }
  }

  console.log(`📄 Loaded ${Object.keys(parsed).length} env vars from ${fileName}`)
}

function getGroqApiKey() {
  const rawApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROK_API || ''
  return rawApiKey.trim().replace(/^['\"]|['\"]$/g, '')
}

loadEnvFile('.env.local')

const app = express()
const PORT = 5000

// Middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'SakhiShield backend',
    status: 'ok',
    endpoints: ['/api/grok', '/api/tts']
  })
})

app.post('/api/tts', async (req, res) => {
  try {
    const { text = '', lang = 'gu' } = req.body || {}
    const cleanedText = String(text).replace(/\s+/g, ' ').trim()

    if (!cleanedText) {
      return res.status(400).json({ error: 'Text is required for TTS.' })
    }

    // Keep payload small to avoid oversized query URLs for provider endpoint.
    const safeText = cleanedText.slice(0, 350)
    const selectedLang = String(lang).startsWith('gu') ? 'gu' : 'gu'
    const audioUrl = googleTTS.getAudioUrl(safeText, {
      lang: selectedLang,
      slow: false,
      host: 'https://translate.google.com'
    })

    const ttsResponse = await fetch(audioUrl)
    if (!ttsResponse.ok) {
      return res.status(502).json({ error: 'Failed to fetch TTS audio.' })
    }

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer())
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).send(audioBuffer)
  } catch (error) {
    console.error('❌ TTS error:', error)
    return res.status(500).json({ error: 'TTS generation failed.', details: error.message })
  }
})

// Groq API proxy endpoint
app.post('/api/grok', async (req, res) => {
  try {
    const { messages, system } = req.body

    // Get API key from environment
    const GROQ_API_KEY = getGroqApiKey()

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
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Groq API error:', response.status, errorData)

      if (response.status === 401) {
        return res.status(401).json({
          error: 'Groq authentication failed. Please verify GROQ_API_KEY in .env.local.',
          details: errorData
        })
      }

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
  console.log(`📌 Using Groq API with key: ${getGroqApiKey() ? '✅ Loaded' : '❌ Not found'}`)
})
