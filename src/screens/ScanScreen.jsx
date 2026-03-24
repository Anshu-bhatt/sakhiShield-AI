import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_FILE_SIZE_MB = 10

function detectDocumentType(file) {
  if (!file) {
    return { label: 'અજ્ઞાત દસ્તાવેજ', confidence: 'ઓછું' }
  }

  const name = file.name.toLowerCase()
  const mimeType = (file.type || '').toLowerCase()

  const checks = [
    {
      label: 'આધાર કાર્ડ',
      confidence: 'ઉચ્ચ',
      keywords: ['aadhaar', 'aadhar', 'uidai', 'adhar']
    },
    {
      label: 'PAN કાર્ડ',
      confidence: 'ઉચ્ચ',
      keywords: ['pan', 'pancard', 'permanent account number']
    },
    {
      label: 'બેંક પાસબુક',
      confidence: 'મધ્યમ',
      keywords: ['passbook', 'bank statement', 'statement']
    },
    {
      label: 'ચેક (Cheque)',
      confidence: 'મધ્યમ',
      keywords: ['cheque', 'check leaf', 'bank cheque']
    },
    {
      label: 'રેશન કાર્ડ',
      confidence: 'મધ્યમ',
      keywords: ['ration', 'food card']
    },
    {
      label: 'વોટર આઈડી',
      confidence: 'મધ્યમ',
      keywords: ['voter', 'epic card', 'election card']
    }
  ]

  for (const check of checks) {
    if (check.keywords.some((keyword) => name.includes(keyword))) {
      return { label: check.label, confidence: check.confidence }
    }
  }

  if (mimeType === 'application/pdf') {
    return { label: 'PDF દસ્તાવેજ', confidence: 'મધ્યમ' }
  }

  if (mimeType.startsWith('image/')) {
    return { label: 'ફોટો આધારિત દસ્તાવેજ', confidence: 'ઓછું' }
  }

  return { label: 'અજ્ઞાત દસ્તાવેજ', confidence: 'ઓછું' }
}

function formatBytes(bytes = 0) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function getRiskHints(file) {
  if (!file) return []

  const hints = []
  const lowerName = file.name.toLowerCase()

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    hints.push('ફાઇલ મોટી છે. કૃપા કરીને 10MB કરતાં નાની ફાઇલ અપલોડ કરો.')
  }

  if (lowerName.includes('otp') || lowerName.includes('pin') || lowerName.includes('password')) {
    hints.push('ફાઇલના નામમાં સંવેદનશીલ માહિતી હોઈ શકે. OTP/PIN/Password ક્યારેય શેર ન કરો.')
  }

  if (lowerName.includes('kyc') || lowerName.includes('aadhar') || lowerName.includes('aadhaar') || lowerName.includes('pan')) {
    hints.push('Aadhaar/PAN/KYC દસ્તાવેજ શેર કરતા પહેલાં સ્ત્રોત ચોક્કસ ચકાસો.')
  }

  if (!file.type.includes('image') && file.type !== 'application/pdf') {
    hints.push('આ ફાઇલ ફોર્મેટ સામાન્ય નથી. Image અથવા PDF ફોર્મેટ પસંદ કરો.')
  }

  return hints
}

export default function ScanScreen() {
  const navigate = useNavigate()
  const cameraInputRef = useRef(null)
  const uploadInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [docInfo, setDocInfo] = useState(null)

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      setPreviewUrl('')
      return undefined
    }

    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setDocInfo(detectDocumentType(file))
    setScanResult(null)
  }

  const analyzeFile = () => {
    if (!selectedFile) {
      setScanResult({
        status: 'warning',
        title: 'પહેલા ફાઇલ પસંદ કરો',
        details: ['Open Camera અથવા Upload Document થી ફાઇલ પસંદ કરો.']
      })
      return
    }

    const hints = getRiskHints(selectedFile)
    const detectedDoc = detectDocumentType(selectedFile)

    if (hints.length > 0) {
      setScanResult({
        status: 'warning',
        title: 'દસ્તાવેજમાં જોખમના સંકેત મળ્યા',
        details: [
          `આ દસ્તાવેજ શક્યતા મુજબ: ${detectedDoc.label} (વિશ્વાસ: ${detectedDoc.confidence})`,
          ...hints
        ]
      })
      return
    }

    setScanResult({
      status: 'safe',
      title: 'બેઝિક સ્કેન સફળ',
      details: [
        `આ દસ્તાવેજ શક્યતા મુજબ: ${detectedDoc.label} (વિશ્વાસ: ${detectedDoc.confidence})`,
        'ફાઇલ ફોર્મેટ સામાન્ય છે અને સાઇઝ મર્યાદામાં છે.',
        'દસ્તાવેજ મોકલતા પહેલાં સામેવાળી વ્યક્તિની ઓળખ ચોક્કસ કરો.',
        'બેંક OTP, PIN, Password અથવા સંપૂર્ણ કાર્ડ વિગતો ક્યારેય શેર ન કરો.'
      ]
    })
  }

  return (
    <div
      className="min-h-screen px-4 py-5"
      style={{
        minHeight: '100svh',
        background: 'linear-gradient(165deg,#F8FAFC,#EEF2FF 45%,#E0F2FE 100%)'
      }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 460 }}>
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="press flex items-center justify-center rounded-xl text-white font-black"
            style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#1D4ED8,#2563EB)' }}
          >
            ←
          </button>
          <div>
            <p className="text-lg font-black" style={{ color: '#0F172A' }}>Document Scan</p>
            <p className="text-xs font-semibold" style={{ color: '#475569' }}>Camera athva upload thi quick safety check</p>
          </div>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{
            background: 'rgba(255,255,255,.82)',
            border: '1px solid #DBEAFE',
            boxShadow: '0 14px 32px rgba(37,99,235,.15)'
          }}
        >
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="press rounded-2xl py-3 px-3 text-sm font-black"
              style={{ background: '#1D4ED8', color: '#FFFFFF', minHeight: 48 }}
            >
              📷 Open Camera
            </button>

            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="press rounded-2xl py-3 px-3 text-sm font-black"
              style={{ background: '#0369A1', color: '#FFFFFF', minHeight: 48 }}
            >
              📁 Upload Document
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={analyzeFile}
            className="press mt-1 w-full rounded-2xl py-3 text-sm font-black"
            style={{ background: '#16A34A', color: '#FFFFFF', minHeight: 48 }}
          >
            🔎 Scan Now
          </button>

          {selectedFile && (
            <div className="mt-4 rounded-2xl p-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <p className="text-sm font-black" style={{ color: '#0F172A' }}>Selected File</p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#334155' }}>{selectedFile.name}</p>
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                {selectedFile.type || 'Unknown type'} • {formatBytes(selectedFile.size)}
              </p>

              {docInfo && (
                <div
                  className="mt-2 rounded-xl px-3 py-2"
                  style={{ background: '#E0F2FE', border: '1px solid #7DD3FC' }}
                >
                  <p className="text-xs font-black" style={{ color: '#0C4A6E' }}>
                    ઓળખાયેલ દસ્તાવેજ: {docInfo.label}
                  </p>
                  <p className="text-xs font-semibold mt-1" style={{ color: '#0369A1' }}>
                    વિશ્વાસ સ્તર: {docInfo.confidence}
                  </p>
                </div>
              )}

              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="mt-3 w-full rounded-xl"
                  style={{ maxHeight: 260, objectFit: 'cover', border: '1px solid #DBEAFE' }}
                />
              )}

              {!previewUrl && (
                <div
                  className="mt-3 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ height: 120, background: '#EFF6FF', color: '#1D4ED8', border: '1px dashed #93C5FD' }}
                >
                  PDF preview not available. Tap Scan Now.
                </div>
              )}
            </div>
          )}

          {scanResult && (
            <div
              className="mt-4 rounded-2xl p-3"
              style={{
                background: scanResult.status === 'safe' ? '#ECFDF5' : '#FEF3C7',
                border: scanResult.status === 'safe' ? '1px solid #86EFAC' : '1px solid #FCD34D'
              }}
            >
              <p className="text-sm font-black" style={{ color: '#111827' }}>{scanResult.title}</p>
              <ul className="mt-2 space-y-1">
                {scanResult.details.map((item) => (
                  <li key={item} className="text-xs font-semibold" style={{ color: '#374151' }}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
