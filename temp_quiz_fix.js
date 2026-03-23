// Quick Fix for Quiz Generation
app.post('/api/quiz/generate', async (req, res) => {
  try {
    console.log('🎯 Generating quiz questions...')

    // Working quiz questions in the right format
    const quizQuestions = [
      {
        "id": "q1",
        "question": "તમને WhatsApp પર મેસેજ આવ્યો: 'તમે ₹50,000 જીત્યા છો! આધાર કાર્ડ મોકલો.' તમે શું કરશો?",
        "options": {
          "A": "તરત આધાર કાર્ડ મોકલીશ",
          "B": "મેસેજ ડિલીટ કરીશ અને 1930 પર રિપોર્ટ કરીશ",
          "C": "પહેલા ફ્રેન્ડને પૂછીશ",
          "D": "લિંક પર ક્લિક કરીશ"
        },
        "correctAnswer": "B",
        "explanation": "આ એક સામાન્ય લોટરી scam છે. ક્યારેય કોઈને તમારા દસ્તાવેજો ન આપો અને 1930 પર રિપોર્ટ કરો.",
        "category": "SCAM",
        "points": 20
      },
      {
        "id": "q2",
        "question": "બેંક તરફથી ફોન આવ્યો: 'તમારું account બંધ થઈ જશે, OTP આપો.' તમે શું કરશો?",
        "options": {
          "A": "તરત OTP આપીશ",
          "B": "ફોન કાપીશ અને બેંક branch જઈશ",
          "C": "OTP ના છેલ્લા 2 digit આપીશ",
          "D": "પાછો ફોન કરીશ"
        },
        "correctAnswer": "B",
        "explanation": "બેંક ક્યારેય ફોન પર OTP માંગતી નથી. ફોન કાપો અને સીધા બેંક branch જાઓ.",
        "category": "OTP",
        "points": 20
      },
      {
        "id": "q3",
        "question": "UPI માં ₹500 ની 'Collect Request' આવી અજાણ્યા number તરફથી. તમે શું કરશો?",
        "options": {
          "A": "Accept કરીશ",
          "B": "Decline કરીશ",
          "C": "Half amount accept કરીશ",
          "D": "Wait કરીશ"
        },
        "correctAnswer": "B",
        "explanation": "Collect Request નો મતલબ તમારા પૈસા બહાર જશે. અજાણ્યા requests હંમેશા decline કરો.",
        "category": "UPI",
        "points": 20
      },
      {
        "id": "q4",
        "question": "Instagram પર કોઈએ કહ્યું: 'iPhone 80% discount માં મળે છે, Link પર click કરો.' તમે શું કરશો?",
        "options": {
          "A": "તરત link પર click કરીશ",
          "B": "Ignore કરીશ અને block કરીશ",
          "C": "Card details આપીશ",
          "D": "Friends ને share કરીશ"
        },
        "correctAnswer": "B",
        "explanation": "80% discount = 100% scam. આવા offers હંમેશા fake હોય છે. Block કરો અને ignore કરો.",
        "category": "SCAM",
        "points": 20
      },
      {
        "id": "q5",
        "question": "QR code scan કર્યા પછી ₹1 લખાણ આવ્યું, પણ ₹5000 કપાઈ ગયા. આ કેવી રીતે થયું?",
        "options": {
          "A": "Technical error છે",
          "B": "Fake QR code હતો જે UPI Collect કરે છે",
          "C": "Bank ની ભૂલ છે",
          "D": "App નું કામ યોગ્ય નથી"
        },
        "correctAnswer": "B",
        "explanation": "Scammers fake QR codes બનાવે છે જે payment receive કરવાને બદલે આપથી પૈસા collect કરે છે.",
        "category": "UPI",
        "points": 20
      }
    ]

    // Randomize the questions
    const shuffledQuestions = quizQuestions.sort(() => Math.random() - 0.5)

    const quizSession = {
      quizId: `dynamic_${Date.now()}`,
      title: 'આજની સુરક્ષા ક્વિઝ',
      description: 'ફ્રૉડ સામે સુરક્ષા શીખો',
      questions: shuffledQuestions,
      createdAt: new Date(),
      sessionType: 'randomized'
    }

    // Save to database
    await Quiz.create(quizSession)
    console.log('✅ Quiz generated successfully:', quizSession.quizId)

    res.json({
      success: true,
      questions: shuffledQuestions,
      quizId: quizSession.quizId,
      message: 'Quiz questions ready!'
    })

  } catch (error) {
    console.error('❌ Quiz generation error:', error)
    res.status(500).json({
      error: 'Failed to generate quiz',
      details: error.message
    })
  }
})