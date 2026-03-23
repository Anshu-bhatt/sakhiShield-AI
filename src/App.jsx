// src/App.jsx — REPLACE entire file
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ChatScreen from './screens/ChatScreen'
import QuizScreen from './screens/QuizScreen'
import ProfileScreen from './screens/ProfileScreen'
import SchemesScreen from './screens/SchemesScreen'
import SchemeDetailScreen from './screens/SchemeDetailScreen'
import { registerDevice } from './api/Database_API'
import { getDeviceId } from './utils/deviceId'

// Placeholder screens for now
function ScanScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-600 font-bold">સ્કેન સ્ક્રીન</p>
        <p className="text-gray-400 text-sm">ફેઝ 2 માં આવશે</p>
      </div>
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