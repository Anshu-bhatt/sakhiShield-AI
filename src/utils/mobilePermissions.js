// Mobile permission utilities for SakhiShield

export const requestMicrophonePermission = async () => {
  try {
    // First, try to get user media to trigger permission request
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    // Stop the stream immediately - we just needed permission
    stream.getTracks().forEach(track => track.stop())

    console.log('✅ Microphone permission granted')
    return true

  } catch (error) {
    console.error('❌ Microphone permission failed:', error)

    let errorMessage = 'માઈક પરવાનગી મળી નથી!'

    switch (error.name) {
      case 'NotAllowedError':
        errorMessage = '🎤 માઈક પરવાનગી આપવાની જરૂર છે!\n\n📱 મોબાઈલ પર:\n1. Address bar માં 🔒 લોક આઈકન પર tap કરો\n2. "Microphone" પર tap કરો\n3. "Allow" પસંદ કરો\n4. પેજ refresh કરો'
        break
      case 'NotFoundError':
        errorMessage = '❌ માઈક મળ્યું નથી - ચકાસો કે તમારું device માં માઈક છે'
        break
      case 'NotSupportedError':
        errorMessage = '❌ આ બ્રાઉઝર માં માઈક સપોર્ટ નથી'
        break
      default:
        errorMessage = `❌ માઈક error: ${error.message}`
    }

    return { error: true, message: errorMessage }
  }
}

export const checkMicrophoneSupport = () => {
  // Check if browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia

  return {
    speechRecognition: !!SpeechRecognition,
    mediaDevices: !!hasMediaDevices,
    isSupported: !!SpeechRecognition && !!hasMediaDevices
  }
}

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints > 0 && /Macintosh/.test(navigator.userAgent))
}

export const showPermissionGuide = () => {
  const isAndroid = /Android/i.test(navigator.userAgent)
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  let guide = '🎤 માઈક પરવાનગી આપવા માટે:\n\n'

  if (isAndroid) {
    guide += '📱 Android પર:\n'
    guide += '1. Address bar માં 🔒 લોક આઈકન દબાવો\n'
    guide += '2. "Microphone" પર tap કરો\n'
    guide += '3. "Allow" પસંદ કરો\n'
    guide += '4. પેજ refresh કરો (↻)'
  } else if (isIOS) {
    guide += '📱 iPhone/iPad પર:\n'
    guide += '1. Address bar માં aA આઈકન દબાવો\n'
    guide += '2. "Website Settings" પર tap કરો\n'
    guide += '3. "Microphone" પર tap કરો\n'
    guide += '4. "Allow" પસંદ કરો\n'
    guide += '5. પેજ refresh કરો (↻)'
  } else {
    guide += '🌐 Browser માં:\n'
    guide += '1. Address bar માં 🔒 temporary or 🎤 માઈક આઈકન દબાવો\n'
    guide += '2. "Always allow" પસંદ કરો\n'
    guide += '3. પેજ refresh કરો'
  }

  return guide
}