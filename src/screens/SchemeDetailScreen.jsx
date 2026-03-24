import React, { useEffect, useState } from 'react'
import { ChevronLeftIcon, PhoneIcon, GlobeAltIcon, CheckCircleIcon, DocumentTextIcon, CurrencyRupeeIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useParams, useNavigate } from 'react-router-dom'
import { SCHEME_CATEGORIES } from '../data/gujaratiSchemes'
import { getSchemeById } from '../api/Database_API'

export default function SchemeDetailScreen() {
  const { schemeId } = useParams()
  const navigate = useNavigate()
  const [scheme, setScheme] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadScheme = async () => {
      setIsLoading(true)
      const dbScheme = await getSchemeById(schemeId)
      setScheme(dbScheme)
      setIsLoading(false)
    }

    loadScheme()
  }, [schemeId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-green-700 mb-2">યોજના લોડ થઈ રહી છે...</h2>
          <p className="text-green-600">કૃપા કરીને રાહ જુઓ</p>
        </div>
      </div>
    )
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">યોજના મળી નથી</h2>
          <p className="text-red-500 mb-4">આ યોજના અસ્તિત્વમાં નથી અથવા ડિલીટ થઈ છે</p>
          <button
            onClick={() => navigate('/schemes')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            પાછા જાઓ
          </button>
        </div>
      </div>
    )
  }

  const category = SCHEME_CATEGORIES[scheme.category]

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    // Could add a toast notification here
    alert('કૉપિ થઈ ગઈ!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 flex flex-col">
      {/* Header */}
      <div className="text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/schemes')} className="p-1">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 ${category?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0`}>
              {category?.icon || '📋'}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-lg leading-tight">{scheme.name}</h1>
              <p className="text-green-200 text-sm">{scheme.nameEnglish}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <p className="text-white/90 text-sm">{scheme.shortDescription}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl overflow-hidden">
        <div className="overflow-y-auto h-full">
          <div className="p-6 space-y-6 max-w-md mx-auto">

            {/* Full Description */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                યોજના વિશે
              </h2>
              <p className="text-gray-700 leading-relaxed">{scheme.fullDescription}</p>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CurrencyRupeeIcon className="w-5 h-5 text-green-600" />
                લાભો
              </h2>
              <div className="space-y-2">
                {scheme.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-purple-600" />
                પાત્રતા
              </h2>
              <div className="space-y-2">
                {scheme.eligibility.map((criteria, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-700 text-sm">{criteria}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                જરૂરી દસ્તાવેજો
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {scheme.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm flex-1">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Process */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                અરજીની પ્રક્રિયા
              </h2>
              <div className="space-y-3">
                {scheme.applicationProcess.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 text-sm flex-1">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <h2 className="font-bold text-gray-800 mb-3">સંપર્ક માહિતી</h2>

              {/* Website */}
              <div className="space-y-3">
                <button
                  onClick={() => window.open(scheme.website, '_blank')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg active:scale-95 transition-transform"
                >
                  <GlobeAltIcon className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-blue-800">વેબસાઇટ ખોલો</p>
                    <p className="text-xs text-blue-600 truncate">{scheme.website}</p>
                  </div>
                  <span className="text-xs text-blue-600">🔗 ખોલો</span>
                </button>

                <button
                  onClick={() => copyText(scheme.website)}
                  className="w-full flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg active:scale-95 transition-transform"
                >
                  <div className="w-4 h-4 bg-gray-400 rounded flex items-center justify-center">
                    <span className="text-xs text-white">📋</span>
                  </div>
                  <span className="text-xs text-gray-600 flex-1 text-left">વેબસાઇટ લિંક કૉપિ કરો</span>
                  <span className="text-xs text-gray-500">કૉપિ</span>
                </button>

                {/* Helpline */}
                <button
                  onClick={() => copyText(scheme.helpline)}
                  className="w-full flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <PhoneIcon className="w-5 h-5 text-green-600" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-green-800">હેલ્પલાઇન</p>
                    <p className="text-lg font-bold text-green-600">{scheme.helpline}</p>
                  </div>
                  <span className="text-xs text-green-600">કૉપિ કરો</span>
                </button>

                {/* Department */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-800">વિભાગ</p>
                  <p className="text-sm text-gray-600">{scheme.department}</p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-xs text-gray-500">
              આખરી વાર અપડેટ: {new Date(scheme.lastUpdated).toLocaleDateString('gu-IN')}
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.open(scheme.website, '_blank')}
                className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl active:scale-95 transition-transform"
              >
                અરજી કરો
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.open(`tel:${scheme.helpline}`)}
                  className="bg-blue-600 text-white font-bold py-3 px-4 rounded-xl active:scale-95 transition-transform"
                >
                  📞 ફોન કરો
                </button>
                <button
                  onClick={() => {
                    const text = `${scheme.name}\n\n${scheme.shortDescription}\n\nવેબસાઇટ: ${scheme.website}\nહેલ્પલાઇન: ${scheme.helpline}`
                    if (navigator.share) {
                      navigator.share({
                        title: scheme.name,
                        text: text
                      })
                    } else {
                      copyText(text)
                    }
                  }}
                  className="bg-purple-600 text-white font-bold py-3 px-4 rounded-xl active:scale-95 transition-transform"
                >
                  📤 શેર કરો
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600">⚠️</span>
                <div>
                  <h4 className="font-bold text-yellow-800 mb-1">નોંધ</h4>
                  <p className="text-yellow-700 text-sm">
                    આ માહિતી સામાન્ય માર્ગદર્શન માટે છે. અરજી કરતા પહેલા અધિકૃત વેબસાઇટ પર જઈને તાજી માહિતી ચકાસો.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}