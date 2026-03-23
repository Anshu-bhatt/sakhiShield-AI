// Extended Quiz questions database for MongoDB
export const QUIZZES = [
  {
    quizId: 'gujarati_fraud_awareness',
    title: 'ગુજરાતી ફ્રૉડ જાગરૂકતા ક્વિઝ',
    description: 'તમારું આર્થિક સુરક્ષા રક્ષણ શીખો વાસ્તવિક પરિસ્થિતિઓ દ્વારા',
    questions: [
      {
        questionId: 'q1',
        scene: 'તમને WhatsApp પર message આવ્યો: "Congratulations! તમે ₹50,000 જીત્યા. ઇનામ લેવા આધાર + PAN card photo મોકલો."',
        question: 'તમે શું કરશો?',
        options: ['ફટાફટ document મોકલો', 'Message ignore કરો અને 1930 પર report કરો ✅', 'Friend ને પૂછો', 'ફક્ત આધાર મોકલો'],
        correctAnswer: 'Message ignore કરો અને 1930 પર report કરો ✅',
        feedbackCorrect: 'શાબ્બાશ! ઇનામ-ઇનામ message = 100% ફ્રૉડ. Document ક્યારેય ન મોકલો.',
        feedbackIncorrect: 'ના! આ ફ્રૉડ છે. 1930 = સાઇબર ક્રાઇમ હેલ્પલાઇન.',
        points: 20
      },
      {
        questionId: 'q2',
        scene: 'રમા બહેનને ફોન આવ્યો: "હું SBI bank manager છું. તમારું account બંધ થઈ જશે. OTP જણાવો."',
        question: 'OTP આપવો જોઈએ?',
        options: ['હા, account બચાવવા આપવો પડે', 'ના — બેંક ક્યારેય OTP ફોન પર નથી માંગતી ✅', 'OTP ના છેલ્લા 2 digit જ આપો', 'Bank branch જઈને verify કરો'],
        correctAnswer: 'ના — બેંક ક્યારેય OTP ફોન પર નથી માંગતી ✅',
        feedbackCorrect: '100% સાચું! OTP = ATM ની ચાવી. ફોન પર ક્યારેય ન આપો।',
        feedbackIncorrect: 'ખોટું! Bank ક્યારેય OTP ફોન પર નથી માંગતી।',
        points: 20
      },
      {
        questionId: 'q3',
        scene: 'તમને UPI app માં "Collect Request" આવ્યો ₹500 ના માટે unknown number તરફથી।',
        question: 'Request accept કરવો?',
        options: ['હા — receive કરવા accept કરવો પડે', 'ના — Collect Request Decline કરો ✅', 'પહેલાં બીજું કશું ચેક કરો', 'આધી રકમ accept કરો'],
        correctAnswer: 'ના — Collect Request Decline કરો ✅',
        feedbackCorrect: 'બિલકુલ! UPI Collect = તમારો પૈસા જાય. Decline કરો!',
        feedbackIncorrect: 'ના! Collect Request એટલે તમારો પૈસો બહાર જાય છે।',
        points: 20
      },
      {
        questionId: 'q4',
        scene: 'તમને આવ્યો message: "તમે ₹10,000 loan માટે qualify થયા છો. અહીં click કરો — unknown number તરફથી"',
        question: 'Link પર click કરવું?',
        options: ['હા — ₹10,000 ની જરૂર છે', 'ના — Link delete કરો અને number block કરો ✅', 'Link ખોલો પણ કોઈ info ન ભરો', 'Friend ને પૂછો'],
        correctAnswer: 'ના — Link delete કરો અને number block કરો ✅',
        feedbackCorrect: 'સવો જવાબ! Fake loan links = bank details ચોરાય. Real loan માટે bank branch જો।',
        feedbackIncorrect: 'ના! આ fake loan link છે। Link delete કરો, number block કરો।',
        points: 20
      },
      {
        questionId: 'q5',
        scene: 'WhatsApp પર: "Govt scheme — ₹2000 તમારા account મા આવશે. Aadhar + bank passbook photo મોકલો"',
        question: 'Govt scheme માટે document મોકલવા?',
        options: ['હા — Govt scheme છે તો મોકલવા જોઈએ', 'ના — Govt scheme ક્યારેય WhatsApp પર આવતું નથી ✅', 'ફક્ત aadhar મોકલો', 'Google પર ચેક કરીને તે પછી'],
        correctAnswer: 'ના — Govt scheme ક્યારેય WhatsApp પર આવતું નથી ✅',
        feedbackCorrect: 'Excellent! Govt scheme WhatsApp પર આવતું નથી। આ fraud છે।',
        feedbackIncorrect: 'ના! આ fraud છે। Govt schemes official channels દ્વારા આવે છે।',
        points: 20
      },
      {
        questionId: 'q6',
        scene: 'Email આવ્યો: "Amazon verification - તમારો payment declined. Update કરો તરત."',
        question: 'Email ચોક્કસ છે?',
        options: ['હા, તરત update કરવું જોઈએ', 'ના — Amazon ક્યારેય email પર payment update નથી માંગતો ✅', 'Customer service ને call કર', 'Card change કર'],
        correctAnswer: 'ના — Amazon ક્યારેય email પર payment update નથી માંગતો ✅',
        feedbackCorrect: 'સાચું! Phishing email છે. તમારા account પર જાઓ સીધું।',
        feedbackIncorrect: 'ખોટું! આ phishing email છે। Email links ક્યારેય trust ન કરો।',
        points: 20
      },
      {
        questionId: 'q7',
        scene: 'Facebook પર unknown person: "તમારો profile ખૂબ ગમ્યો. Chat કરી શકીએ?"',
        question: 'તમે શું કરશો?',
        options: ['Chat શરૂ કર', 'Profile check કર અને suspicious લાગે તો block કર ✅', 'તમારી personal info આપો', 'Link મોકલવા કહો'],
        correctAnswer: 'Profile check કર અને suspicious લાગે તો block કર ✅',
        feedbackCorrect: 'બરાબર! Unknown accounts suspicious હોય છે।',
        feedbackIncorrect: 'ખોટું! Romance scam હોઈ શકે છે।',
        points: 20
      },
      {
        questionId: 'q8',
        scene: 'YouTube ad: "₹5000 per day કમાવો! Work from home શરૂ કરો હવે"',
        question: 'આ ad ધરોવર છે?',
        options: ['હા! તરત click કર', 'ના — ઝડપ પૈસો = scam ✅', 'તમારી બેંક details આપીને sign up કર', 'Friend ને share કર'],
        correctAnswer: 'ના — ઝડપ પૈસો = scam ✅',
        feedbackCorrect: 'સાચું! "Quick money" = 100% scam.',
        feedbackIncorrect: 'ખોટું! આ work from home scam છે।',
        points: 20
      },
      {
        questionId: 'q9',
        scene: 'SMS: "Paytm urgent - Account suspicious છે. Verify કર: bit.ly/paytm"',
        question: 'તમે શું કરશો?',
        options: ['Link click કર અને update કર', 'Paytm app direct open કર અથવા 1960 ને call કર ✅', 'SMS reply કર', 'Link share કર'],
        correctAnswer: 'Paytm app direct open કર અથવા 1960 ને call કર ✅',
        feedbackCorrect: 'બરોબર! હંમેશા official app use કર।',
        feedbackIncorrect: 'ખોટું! SMS links ક્યારેય trust ન કર - phishing છે।',
        points: 20
      },
      {
        questionId: 'q10',
        scene: 'Instagram DM: "તમારું photo edit આપું? 50% discount!"',
        question: 'Advance payment આપવો?',
        options: ['હા! તરત payment આપો', 'ના — Unknown people ને ક્યારેય advance payment ન આપો ✅', 'Half payment આપો', 'Google Pay થી ફિક્સ કર'],
        correctAnswer: 'ના — Unknown people ને ક્યારેય advance payment ન આપો ✅',
        feedbackCorrect: 'સાચું! Advance payment = trust breaking scam.',
        feedbackIncorrect: 'ખોટું! Online strangers ને કદી advance payment ન આપો।',
        points: 20
      },
      {
        questionId: 'q11',
        scene: 'Phone call: "હું police છું - તમારો Aadhar ગુમ છે. તરત update કર"',
        question: 'તમે શું કરશો?',
        options: ['તરત information આપો', 'Line drop કર અને official number પર contact કર ✅', 'Password બતાવો', 'તમારું account lock કર'],
        correctAnswer: 'Line drop કર અને official number પર contact કર ✅',
        feedbackCorrect: 'બરોબર! Police ક્યારેય phone પર threats આપતા નથી।',
        feedbackIncorrect: 'ખોટું! આ impersonation scam છે।',
        points: 20
      },
      {
        questionId: 'q12',
        scene: 'Instagram: "Buy iPhone 13 - 80% OFF! Original Apple. Contact અમને"',
        question: 'તમે buy કરશો?',
        options: ['તરત order કર', 'DM માં detailed info લે અને reviews check કર ✅', 'Link click કર', 'Credit card number share કર'],
        correctAnswer: 'DM માં detailed info લે અને reviews check કર ✅',
        feedbackCorrect: 'સાચું! Unknown sellers બાબતે careful રહો।',
        feedbackIncorrect: 'ખોટું! Deep discount = likely counterfeit છે।',
        points: 20
      },
      {
        questionId: 'q13',
        scene: 'Email: "Bitcoin investment - 500% return yearly! Invest now"',
        question: 'આ legitimate છે?',
        options: ['હા! 500% return - તરત invest કર', 'ના — 500% impossible return = crypto scam ✅', 'નાનું amount invest કર', 'બધું investment કર'],
        correctAnswer: 'ના — 500% impossible return = crypto scam ✅',
        feedbackCorrect: 'સાચું! Unrealistic returns = guaranteed scam.',
        feedbackIncorrect: 'ખોટું! કોઈ પણ investment guaranteed high returns આપી શકતું નથી।',
        points: 20
      },
      {
        questionId: 'q14',
        scene: 'WhatsApp: "અરે! Missed you. ₹500 ઉધાર આપી શકશો? તરત return આપીશ"',
        question: 'તમે શું કરશો?',
        options: ['તરત payment કર', 'પહેલાં direct call કર કે truly તમારો friend છે ✅', 'Group માટે ચિંતા કર અને પણ આપ', 'Bank password share કર'],
        correctAnswer: 'પહેલાં direct call કર કે truly તમારો friend છે ✅',
        feedbackCorrect: 'બરાબર! Profile hacking common છે - verify કર।',
        feedbackIncorrect: 'ખોટું! Hacked accounts scammers દ્વારા use કરાય છે।',
        points: 20
      },
      {
        questionId: 'q15',
        scene: 'Email: "Google attention - Account verify કરો તરત: accounts.google.xxxxx"',
        question: 'Link authentic છે?',
        options: ['હા! Google official - verify કર', 'ના — Google links ક્યારેય email પર આવતા નથી. Direct site જાઓ ✅', 'તમારો password જાહેર કર', 'બાદમાં verify કર'],
        correctAnswer: 'ના — Google links ક્યારેય email પર આવતા નથી. Direct site જાઓ ✅',
        feedbackCorrect: 'સાચું! Official companies email links ક્યારેય આપતા નથી।',
        feedbackIncorrect: 'ખોટું! આ phishing scam છે।',
        points: 20
      }
    ]
  }
]
