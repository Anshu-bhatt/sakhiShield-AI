import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDeviceId } from '../utils/deviceId'
import { getQuizHistory, getAlerts, getFrauds } from '../api/Database_API'
import './ProfileScreen.css'

export default function ProfileScreen() {
  const navigate = useNavigate()
  const [quizHistory, setQuizHistory] = useState([])
  const [alerts, setAlerts] = useState([])
  const [frauds, setFrauds] = useState([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stats')
  const deviceId = getDeviceId()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const history = await getQuizHistory()
      const fraudsList = await getFrauds()
      const alertsList = await getAlerts()

      setQuizHistory(history || [])
      setFrauds(fraudsList || [])
      setAlerts(alertsList || [])

      // Calculate total points from quiz history
      const points = history.reduce((sum, quiz) => sum + quiz.score * 20, 0)
      setTotalPoints(points)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setLoading(false)
  }

  const getBadges = () => {
    const badges = []
    const avgScore = quizHistory.length > 0
      ? quizHistory.reduce((sum, q) => sum + q.percentage, 0) / quizHistory.length
      : 0

    if (quizHistory.length >= 1) badges.push({ icon: '📝', name: 'પ્રથમ ક્વિઝ', color: '#eaf3de' })
    if (quizHistory.length >= 5) badges.push({ icon: '🔥', name: '5 ક્વિઝ સમ્પૂર્ણ', color: '#faeeda' })
    if (quizHistory.length >= 10) badges.push({ icon: '🏆', name: 'દશ ક્વિઝ ચેમ્પિયન', color: '#e8f5e9' })
    if (avgScore >= 80) badges.push({ icon: '⭐', name: 'ફ્રૉડ નિષ્ણાત', color: '#fff9c4' })
    if (frauds.length >= 1) badges.push({ icon: '🛡️', name: 'સુરક્ષા સચેતન', color: '#ffe0b2' })

    return badges
  }

  const getLevel = () => {
    const quizCount = quizHistory.length
    if (quizCount === 0) return { level: 1, title: 'શીખાર્થી' }
    if (quizCount < 3) return { level: 2, title: 'સુરક્ષા સાથી' }
    if (quizCount < 5) return { level: 3, title: 'સુરક્ષા શિક્ષક' }
    return { level: 4, title: 'સુરક્ષા પ્રમુખ' }
  }

  const getStreakDays = () => {
    if (quizHistory.length === 0) return 0
    // Simple calculation: count quizzes from today backwards
    const today = new Date()
    let streak = 0
    for (let i = 0; i < quizHistory.length; i++) {
      const quizDate = new Date(quizHistory[i].completedAt)
      const diff = Math.floor((today - quizDate) / (1000 * 60 * 60 * 24))
      if (diff === i) streak++
      else break
    }
    return streak
  }

  const levelInfo = getLevel()
  const badges = getBadges()
  const streak = getStreakDays()

  if (loading) {
    return <div className="profile-container"><div className="loading">લોડ થઈ રહ્યું છે...</div></div>
  }

  return (
    <div className="profile-container">
      {/* Header with Back Button */}
      <div className="profile-header-top">
        <button onClick={() => navigate('/')} className="back-btn">
          ← પાછું
        </button>
        <h2>મારી પ્રોફાઇલ</h2>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* Header Card */}
      <div className="profile-card">
        <div className="profile-top">
          <div className="avatar">👩</div>
          <div className="profile-info">
            <h2>નમસ્તે, સખી!</h2>
            <p className="level-title">સ્તર {levelInfo.level} · {levelInfo.title}</p>
            <p className="device-id">ID: {deviceId.substring(0, 12)}...</p>
          </div>
        </div>

        <div className="points-display">
          <div className="points-item">
            <span className="points-value">{totalPoints}</span>
            <span className="points-label">પોઇન્ટ</span>
          </div>
          <div className="points-item">
            <span className="points-value">{quizHistory.length}</span>
            <span className="points-label">ક્વિઝ સમ્પૂર્ણ</span>
          </div>
          <div className="points-item">
            <span className="points-value">{streak}</span>
            <span className="points-label">દિવસી સ્ટ્રીક</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 આંકડા
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📝 ઈતિહાસ
        </button>
        <button
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 સાવધાનીઓ
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="tab-content">
          {/* Badges */}
          <div className="section">
            <h3 className="section-title">🏅 મારા બેજ</h3>
            <div className="badges-grid">
              {badges.length > 0 ? (
                badges.map((badge, idx) => (
                  <div key={idx} className="badge-item" style={{ background: badge.color }}>
                    <div className="badge-icon">{badge.icon}</div>
                    <div className="badge-text">{badge.name}</div>
                  </div>
                ))
              ) : (
                <p className="empty-state">હજી કોઈ બેજ મેળવાયો નથી</p>
              )}
            </div>
          </div>

          {/* Performance */}
          <div className="section">
            <h3 className="section-title">📈 પ્રવર્તન</h3>
            {quizHistory.length > 0 ? (
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-label">સર્વોચ્ચ સ્કોર</span>
                  <span className="stat-value">
                    {Math.max(...quizHistory.map(q => q.percentage))}%
                  </span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">સરેરાશ સ્કોર</span>
                  <span className="stat-value">
                    {Math.round(quizHistory.reduce((sum, q) => sum + q.percentage, 0) / quizHistory.length)}%
                  </span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">કુલ સાચા જવાબ</span>
                  <span className="stat-value">
                    {quizHistory.reduce((sum, q) => sum + q.score, 0)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="empty-state">ક્વિઝ રમીને પોતાનો રેકોર્ડ શરૂ કરો!</p>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="tab-content">
          {quizHistory.length > 0 ? (
            <div className="history-list">
              {quizHistory.map((quiz, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-header">
                    <span className="history-title">ક્વિઝ {idx + 1}</span>
                    <span className={`history-score ${quiz.percentage >= 80 ? 'good' : quiz.percentage >= 60 ? 'ok' : 'poor'}`}>
                      {quiz.percentage}%
                    </span>
                  </div>
                  <div className="history-details">
                    <span>{quiz.score}/{quiz.totalQuestions} સાચા</span>
                    <span>+{quiz.score * 20} પોઇન્ટ</span>
                  </div>
                  <div className="history-date">
                    {new Date(quiz.completedAt).toLocaleDateString('gu-IN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">હજી કોઈ ક્વિઝ સમ્પૂર્ણ થયો નથી</p>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="tab-content">
          {frauds.length > 0 || alerts.length > 0 ? (
            <div className="alerts-list">
              {frauds.map((fraud, idx) => (
                <div key={`fraud-${idx}`} className="alert-item danger">
                  <span className="alert-icon">🚨</span>
                  <div className="alert-content">
                    <p className="alert-type">{fraud.fraudType}</p>
                    <p className="alert-msg">{fraud.details}</p>
                    <p className="alert-date">{new Date(fraud.timestamp).toLocaleDateString('gu-IN')}</p>
                  </div>
                </div>
              ))}
              {alerts.map((alert, idx) => (
                <div key={`alert-${idx}`} className="alert-item warning">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-content">
                    <p className="alert-type">{alert.type}</p>
                    <p className="alert-msg">{alert.message}</p>
                    <p className="alert-date">{new Date(alert.timestamp).toLocaleDateString('gu-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">કોઈ સાવધાનીઓ નથી - તમે સુરક્ષિત છો! 🛡️</p>
          )}
        </div>
      )}
    </div>
  )
}
