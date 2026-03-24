import React, { useState } from 'react'
import { ChevronLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import { GUJARAT_WOMEN_SCHEMES, SCHEME_CATEGORIES } from '../data/gujaratiSchemes'

export default function SchemesScreen() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const schemes = Object.values(GUJARAT_WOMEN_SCHEMES)

  const filteredSchemes = schemes.filter(scheme => {
    const categoryMatch = selectedCategory === 'all' || scheme.category === selectedCategory
    const searchMatch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       scheme.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  const handleSchemeClick = (schemeId) => {
    navigate(`/scheme/${schemeId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-600 flex flex-col">
      {/* Header */}
      <div className="text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="p-1">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h1 className="text-lg font-bold">ગુજરાત સરકારી યોજનાઓ</h1>
              <p className="text-sm text-green-200">મહિલાઓ માટે સરકારી લાભો</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="યોજના શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-white/30 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap border ${
              selectedCategory === 'all'
                ? 'bg-white text-green-600 border-white'
                : 'bg-white/20 text-white border-white/30'
            }`}
          >
            બધી યોજનાઓ
          </button>
          {Object.entries(SCHEME_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full whitespace-nowrap border flex items-center gap-2 ${
                selectedCategory === key
                  ? 'bg-white text-green-600 border-white'
                  : 'bg-white/20 text-white border-white/30'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Schemes List */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl p-6">
        {filteredSchemes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">કોઈ યોજના મળી નથી</h3>
            <p className="text-gray-500">બીજા શબ્દો સાથે શોધો અથવા કેટેગરી બદલો</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-4">
            {filteredSchemes.map((scheme) => {
              const category = SCHEME_CATEGORIES[scheme.category]
              return (
                <button
                  key={scheme.schemeId}
                  onClick={() => handleSchemeClick(scheme.schemeId)}
                  className="w-full bg-white rounded-xl p-5 shadow-lg flex items-start gap-4 text-left active:scale-95 transition-transform"
                >
                  <div className={`w-14 h-14 ${category?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0`}>
                    {category?.icon || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
                      {scheme.name}
                    </div>
                    <div className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {scheme.shortDescription}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {category?.name || scheme.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {scheme.department}
                      </span>
                    </div>
                  </div>
                  <div className="text-green-600 self-center">
                    <ChevronLeftIcon className="w-5 h-5 rotate-180" />
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="max-w-md mx-auto mt-8 bg-white rounded-xl p-4 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3 text-center">આંકડાઓ</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{Object.keys(GUJARAT_WOMEN_SCHEMES).length}</p>
              <p className="text-xs text-gray-500">કુલ યોજનાઓ</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{Object.keys(SCHEME_CATEGORIES).length}</p>
              <p className="text-xs text-gray-500">કેટેગરીઓ</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{filteredSchemes.length}</p>
              <p className="text-xs text-gray-500">પરિણામો</p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="max-w-md mx-auto mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-bold text-blue-800 mb-1">મદદ જોઈએ?</h4>
              <p className="text-blue-700 text-sm mb-2">
                કોઈ પણ યોજના વિશે વધુ માહિતી માટે ફોન કરો:
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">સામાન્ય મદદ:</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">181</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">મહિલા હેલ્પલાઇન:</span>
                  <span className="bg-pink-100 px-2 py-1 rounded">1090</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}