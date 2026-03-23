// src/screens/HomeScreen.jsx — CREATE this file
import { useNavigate } from 'react-router-dom'

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-purple-700 flex flex-col items-center justify-between p-6 py-12">
      {/* Top Section */}
      <div className="text-center">
        <div className="text-7xl mb-4">🛡️</div>
        <h1 className="text-white text-3xl font-bold">SakhiShield AI</h1>
        <p className="text-purple-200 text-base mt-2">તમારી સખી, તમારી સુરક્ષા</p>
      </div>  

      {/* Middle — Feature Cards */}
      <div className="w-full max-w-sm space-y-4">

        {/* VittSakhi Chat */}
        <button
          onClick={() => navigate('/chat')}
          className="w-full bg-white text-left rounded-2xl p-5 shadow-lg flex items-center gap-4 active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-3xl flex-shrink-0">
            💬
          </div>
          <div>
            <div className="text-purple-700 font-bold text-base">વિત્તસખી ચેટબોટ</div>
            <div className="text-gray-500 text-sm mt-0.5">
              આર્થિક સુરક્ષા શીખો ગુજરાતીમાં
            </div>
          </div>
          <div className="ml-auto text-purple-400 text-xl">›</div>
        </button>

        {/* Fraud Awareness Quiz */}
        <button
          onClick={() => navigate('/quiz')}
          className="w-full bg-yellow-100 text-left rounded-2xl p-5 shadow-lg flex items-center gap-4 active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-yellow-300 flex items-center justify-center text-3xl flex-shrink-0">
            📝
          </div>
          <div>
            <div className="text-purple-700 font-bold text-base">ફ્રૉડ જાગરૂકતા ક્વિઝ</div>
            <div className="text-gray-600 text-sm mt-0.5">
              તમારા મતલબનું ટેસ્ટ કરો
            </div>
          </div>
          <div className="ml-auto text-yellow-600 text-xl">›</div>
        </button>

        {/* Gujarat Government Schemes */}
        <button
          onClick={() => navigate('/schemes')}
          className="w-full bg-green-100 text-left rounded-2xl p-5 shadow-lg flex items-center gap-4 border-2 border-green-300 active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center text-3xl flex-shrink-0">
            🏛️
          </div>
          <div>
            <div className="text-green-700 font-bold text-base">સરકારી યોજનાઓ</div>
            <div className="text-gray-600 text-sm mt-0.5">
              ગુજરાત મહિલાઓ માટે લાભો
            </div>
          </div>
          <div className="ml-auto text-green-600 text-xl">›</div>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full bg-pink-100 text-left rounded-2xl p-5 shadow-lg flex items-center gap-4 active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-2xl bg-pink-300 flex items-center justify-center text-3xl flex-shrink-0">
            👤
          </div>
          <div>
            <div className="text-purple-700 font-bold text-base">મારી પ્રોફાઇલ</div>
            <div className="text-gray-600 text-sm mt-0.5">
              ક્વિઝ સ્કોર અને બેજ જુઓ
            </div>
          </div>
          <div className="ml-auto text-pink-600 text-xl">›</div>
        </button>
      </div>

      {/* Bottom */}
      <div className="text-center">
        <p className="text-purple-300 text-xs">
          🔒 તમારો ડેટા ફોનમાં જ રહે છે — 100% આત્મીય
        </p>
        <p className="text-purple-400 text-xs mt-1">
          DPDP Act 2023 અનુસાર
        </p>
      </div>
    </div>
  )
}