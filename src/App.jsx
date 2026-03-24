// src/App.jsx — REPLACE entire file
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ChatScreen from './screens/ChatScreen'
import QuizScreen from './screens/QuizScreen'
import ProfileScreen from './screens/ProfileScreen'
import SchemesScreen from './screens/SchemesScreen'
import SchemeDetailScreen from './screens/SchemeDetailScreen'
import ScanScreen from './screens/ScanScreen'
import { registerDevice } from './api/Database_API'
import { getDeviceId } from './utils/deviceId'
import LinkTesterScreen from './screens/LinkTesterScreen'

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
        <Route path="/link-tester" element={<LinkTesterScreen />} />
      </Routes>
    </BrowserRouter>
  )
}