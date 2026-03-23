// src/App.jsx — REPLACE entire file
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ChatScreen from './screens/ChatScreen'
import QuizScreen from './screens/QuizScreen'
import ProfileScreen from './screens/ProfileScreen'

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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/scan" element={<ScanScreen />} />
      </Routes>
    </BrowserRouter>
  )
}