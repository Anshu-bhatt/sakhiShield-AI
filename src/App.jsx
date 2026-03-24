import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ChatScreen from './screens/ChatScreen'
import QuizScreen from './screens/QuizScreen'
import ProfileScreen from './screens/ProfileScreen'
import LinkTesterScreen from './screens/LinkTesterScreen'

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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/scan" element={<ScanScreen />} />
        <Route path="/link-tester" element={<LinkTesterScreen />} />
      </Routes>
    </BrowserRouter>
  )
}