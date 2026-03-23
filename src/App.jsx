// src/App.jsx — REPLACE entire file
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ChatScreen from './screens/ChatScreen'
import QuizScreen from './screens/QuizScreen'
import ProfileScreen from './screens/ProfileScreen'
import SchemesScreen from './screens/SchemesScreen'
import SchemeDetailScreen from './screens/SchemeDetailScreen'
import { registerDevice } from './api/Database_API'
import { getDeviceId } from './utils/deviceId'

function ScanScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-4"
      style={{
        minHeight: '100svh', minHeight: '100vh',
        background: 'linear-gradient(135deg,#EDE9FE,#F5F3FF)'
      }}>
      <div className="flex items-center justify-center rounded-full shadow-xl"
        style={{
          width: 96, height: 96, fontSize: 44,
          background: 'linear-gradient(135deg,#7C3AED,#6D28D9)'
        }}>
        🔍
      </div>
      <p className="font-black text-xl" style={{ color: '#5B21B6' }}>Document Scan</p>
      <p className="text-sm font-semibold" style={{ color: '#78716C' }}>Phase 2 ma aavse 🚀</p>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    // Initialize device on app load
    const initializeDevice = async () => {
      try {
        const deviceId = getDeviceId()
        console.log(`📱 Device ID: ${deviceId}`)

        // Register device in MongoDB
        await registerDevice()
        console.log('✅ Device registered in MongoDB')
      } catch (error) {
        console.error('❌ Failed to initialize device:', error)
      }
    }

    initializeDevice()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/schemes" element={<SchemesScreen />} />
        <Route path="/scheme/:schemeId" element={<SchemeDetailScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/scan" element={<ScanScreen />} />
      </Routes>
    </BrowserRouter>
  )
}