import { useState } from 'react'
import { generateDynamicQuiz, getRandomQuiz } from '../api/Database_API'
import './DynamicQuizSelector.css'

export default function DynamicQuizSelector({ onQuizGenerated, onClose }) {
  const [generating, setGenerating] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [numQuestions, setNumQuestions] = useState(5)

  const quizTopics = [
    {
      id: 'upi_scams',
      name: 'UPI અને પેમેન્ટ ફ્રૉડ',
      description: 'UPI, GPay, PhonePe સાથે સંબંધિત scams'
    },
    {
      id: 'otp_frauds',
      name: 'OTP અને બેંકિંગ ફ્રૉડ',
      description: 'OTP, ATM card, net banking scams'
    },
    {
      id: 'phone_calls',
      name: 'ફેક કૉલ્સ અને SMS',
      description: 'Fake bank calls, lottery, prize scams'
    },
    {
      id: 'social_media',
      name: 'સોશિયલ મીડિયા ફ્રૉડ',
      description: 'Facebook, Instagram, WhatsApp scams'
    },
    {
      id: 'investment',
      name: 'રોકાણ અને ટ્રેડિંગ ફ્રૉડ',
      description: 'Crypto, stock trading, get-rich-quick schemes'
    },
    {
      id: 'romance_job',
      name: 'રોમાન્સ અને જોબ ફ્રૉડ',
      description: 'Fake relationships, work from home scams'
    },
    {
      id: 'online_shopping',
      name: 'ઓનલાઇન શોપિંગ ફ્રૉડ',
      description: 'Fake websites, delivery scams, deep discounts'
    },
    {
      id: 'govt_schemes',
      name: 'સરકારી યોજના ફ્રૉડ',
      description: 'Fake government benefit schemes and documents'
    }
  ]

  const generateQuiz = async () => {
    if (!selectedTopic) {
      alert('કૃપા કરીને વિષય પસંદ કરો')
      return
    }

    setGenerating(true)
    try {
      const topicData = quizTopics.find(t => t.id === selectedTopic)
      const result = await generateDynamicQuiz(
        topicData.name,
        difficulty,
        numQuestions
      )

      if (result && result.quiz) {
        console.log('✅ Dynamic quiz generated successfully')
        onQuizGenerated(result.quiz)
      } else {
        alert('ક્વિઝ બનાવવામાં સમસ્યા આવી. કૃપા પછીથી પ્રયાસ કરો.')
      }
    } catch (error) {
      console.error('❌ Quiz generation failed:', error)
      alert('ક્વિઝ બનાવવામાં સમસ્યા આવી. કૃપા પછીથી પ્રયાસ કરો.')
    } finally {
      setGenerating(false)
    }
  }

  const playDefaultQuiz = async () => {
    setGenerating(true)
    try {
      const quiz = await getRandomQuiz('gujarati_fraud_awareness')
      if (quiz) {
        onQuizGenerated(quiz)
      } else {
        alert('ક્વિઝ લોડ કરવામાં સમસ્યા આવી')
      }
    } catch (error) {
      console.error('❌ Default quiz load failed:', error)
      alert('ક્વિઝ લોડ કરવામાં સમસ્યા આવી')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="quiz-selector-overlay">
      <div className="quiz-selector-modal">
        <div className="quiz-selector-header">
          <h2>ક્વિઝ પસંદ કરો</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="quiz-options">
          {/* Default Quiz Option */}
          <div className="quiz-option-card default-quiz">
            <h3>🎯 મૂળ ફ્રૉડ જાગરૂકતા ક્વિઝ</h3>
            <p>તૈયાર પ્રશ્નો સાથે ક્વિક કવિઝ રમો</p>
            <button
              onClick={playDefaultQuiz}
              className="quiz-option-btn default"
              disabled={generating}
            >
              {generating ? 'લોડ થઈ રહ્યું છે...' : 'રમવાનું શરૂ કરો'}
            </button>
          </div>

          {/* AI-Generated Quiz Option */}
          <div className="quiz-option-card ai-quiz">
            <h3>🤖 AI દ્વારા બનાવાયેલ ક્વિઝ</h3>
            <p>તમારા મનગમતા વિષય પર નવા પ્રશ્નો જનરેટ કરો</p>

            <div className="quiz-settings">
              <div className="setting-group">
                <label>વિષય પસંદ કરો:</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="topic-selector"
                >
                  <option value="">વિષય પસંદ કરો...</option>
                  {quizTopics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                {selectedTopic && (
                  <p className="topic-description">
                    {quizTopics.find(t => t.id === selectedTopic)?.description}
                  </p>
                )}
              </div>

              <div className="setting-row">
                <div className="setting-group">
                  <label>કઠિનતા:</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">સરળ</option>
                    <option value="medium">મધ્યમ</option>
                    <option value="hard">મુશ્કેલ</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label>પ્રશ્નો:</label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                  >
                    <option value={3}>3 પ્રશ્નો</option>
                    <option value={5}>5 પ્રશ્નો</option>
                    <option value={8}>8 પ્રશ્નો</option>
                    <option value={10}>10 પ્રશ્નો</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={generateQuiz}
              className="quiz-option-btn ai"
              disabled={generating || !selectedTopic}
            >
              {generating ? '🤖 AI ક્વિઝ બનાવી રહ્યું છે...' : '🚀 AI ક્વિઝ બનાવો'}
            </button>
          </div>
        </div>

        {generating && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>કૃપા કરીને રાહ જુઓ... AI તમારા માટે ક્વિઝ બનાવી રહ્યું છે</p>
          </div>
        )}
      </div>
    </div>
  )
}