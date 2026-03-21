// src/hooks/useSpeechRecognition.js — CREATE this file

import { useState, useEffect, useRef } from 'react'

export function useSpeechRecognition({ onResult, onError }) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)

    const recognition = new SpeechRecognition()

    // ✅ Key settings for Gujarati/Hindi
    recognition.lang = 'gu-IN'        // Gujarati first
    recognition.continuous = false     // stop after one sentence
    recognition.interimResults = true  // show text while speaking
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')

      const isFinal = event.results[event.results.length - 1].isFinal

      onResult(transcript, isFinal)
    }

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error)
      setIsListening(false)

      if (event.error === 'no-speech') {
        onError?.('Koi avaz na aavi. Phir thi try karo 🎤')
      } else if (event.error === 'not-allowed') {
        onError?.('Microphone permission aapvo 🙏')
      } else {
        onError?.('Avaz samjaai nahi. Phir boljo 🎤')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  function startListening() {
    if (!recognitionRef.current || isListening) return
    try {
      recognitionRef.current.start()
    } catch (e) {
      console.error(e)
    }
  }

  function stopListening() {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setIsListening(false)
  }

  function toggleLanguage(lang) {
    if (!recognitionRef.current) return
    recognitionRef.current.lang = lang
    // gu-IN = Gujarati
    // hi-IN = Hindi
    // en-IN = English (Indian)
  }

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleLanguage
  }
}