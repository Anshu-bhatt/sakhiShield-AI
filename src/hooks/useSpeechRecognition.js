import { useEffect, useRef, useState, useCallback } from 'react'

export function useSpeechRecognition({ onResult, onError }) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)
  const callbacksRef = useRef({ onResult, onError })
  const [currentLang, setCurrentLang] = useState('gu-IN')

  // Update callbacks without re-initializing
  useEffect(() => {
    callbacksRef.current = { onResult, onError }
  }, [onResult, onError])

  // Initialize speech recognition ONCE
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    let silenceTimeout = null

    // Configuration
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.language = currentLang

    // Handle recognized speech
    recognition.onresult = (event) => {
      // Clear any existing timeout
      if (silenceTimeout) clearTimeout(silenceTimeout)

      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // Send interim results
      if (interimTranscript) {
        callbacksRef.current.onResult(interimTranscript, false)
      }

      // Send final results and auto-stop
      if (finalTranscript) {
        callbacksRef.current.onResult(finalTranscript.trim(), true)
        // Stop recognition after final result
        setTimeout(() => {
          try {
            recognition.stop()
          } catch (e) {
            setIsListening(false)
          }
        }, 100)
      }
    }

    // Handle errors
    recognition.onerror = (event) => {
      // Clear any existing timeout
      if (silenceTimeout) clearTimeout(silenceTimeout)

      // Ignore aborted errors - they're expected when stopping
      if (event.error === 'aborted') {
        setIsListening(false)
        return
      }

      let errorMsg = 'ભૂલ આવી'

      switch (event.error) {
        case 'no-speech':
          errorMsg = 'કોઈ આવાજ સાંભળાયો નહીં। ફરીથી પ્રયાસ કરો 🔄'
          break
        case 'audio-capture':
          errorMsg = 'માઈક ઉપલબ્ધ નથી ✋'
          break
        case 'network':
          errorMsg = 'ઇન્ટરનેટ જોડાણ તપાસો 📡'
          break
        default:
          errorMsg = `ભૂલ: ${event.error}`
      }

      callbacksRef.current.onError(errorMsg)
      setIsListening(false)
    }

    // Handle end of speech
    recognition.onend = () => {
      // Clear any existing timeout
      if (silenceTimeout) clearTimeout(silenceTimeout)
      setIsListening(false)
    }

    // Handle start
    recognition.onstart = () => {
      // Clear any existing timeout
      if (silenceTimeout) clearTimeout(silenceTimeout)
      setIsListening(true)

      // Auto-stop after 10 seconds of no final result
      silenceTimeout = setTimeout(() => {
        try {
          recognition.stop()
        } catch (e) {
          setIsListening(false)
        }
      }, 10000)
    }

    // Only cleanup on unmount
    return () => {
      if (silenceTimeout) clearTimeout(silenceTimeout)
      try {
        recognition.abort()
      } catch (e) {
        // Ignore abort errors
      }
    }
  }, []) // Empty dependency - initialize ONCE

  // Update language without re-initializing
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.language = currentLang
    }
  }, [currentLang])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Already running, ignore
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Already stopped, ignore
      }
    }
  }, [])

  const toggleLanguage = useCallback((langCode) => {
    setCurrentLang(langCode)
  }, [])

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleLanguage
  }
}
