// Test script for document validation functionality
import { DOCUMENT_TEMPLATES, FRAUD_INDICATORS } from './src/data/documentTemplates.js'
import crypto from 'crypto'

// Test data
const testDocuments = {
  aadhaar: {
    valid: ['2345 6789 0123'], // Note: May fail checksum, but valid format
    invalid: ['1234 5678 9012', '0000 0000 0000', '1111 1111 1111'], // Known fraud patterns
    malformed: ['12345678901', 'abcd efgh ijkl', '123 456 789'] // Wrong format/length
  },
  pan: {
    valid: ['ABCPD1234F', 'GHIJK5678L'], // Valid format PAN numbers
    invalid: ['ABCDE1234F', 'AAAAA0000A'], // Known fraud patterns
    malformed: ['ABC123', 'abcde1234f', 'ABCDE12345'] // Wrong format
  },
  upi: {
    valid: ['test@paytm', 'user123@phonepe', 'myname@okaxis'],
    invalid: ['admin@paytm', 'support@phonepe', 'help@gpay'], // Suspicious usernames
    malformed: ['test', '@paytm', 'test@', 'test@@paytm'] // Malformed UPI IDs
  }
}

// Utility functions (copied from server.js)
function hashDocument(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function verhoeffCheck(num) {
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ]

  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ]

  const cleanNum = num.replace(/\s/g, '')

  // Validate input contains only digits
  if (!/^\d+$/.test(cleanNum)) {
    return false
  }

  let c = 0

  for (let i = 0; i < cleanNum.length; i++) {
    const digit = parseInt(cleanNum[i])
    const position = (cleanNum.length - i) % 8

    // Additional bounds checking
    if (digit < 0 || digit > 9 || position < 0 || position >= 8) {
      return false
    }

    c = d[c][p[position][digit]]
  }

  return c === 0
}

function validateDocument(input, type) {
  const template = DOCUMENT_TEMPLATES[type]
  if (!template) {
    return { isValid: false, issues: ['Unknown document type'] }
  }

  const issues = []
  let confidence = 100

  // Check format
  const formatRegex = new RegExp(template.validationRules.pattern)
  if (!formatRegex.test(input)) {
    issues.push('Invalid format')
    confidence -= 30
  }

  // Check length
  const cleanInput = input.replace(/\s/g, '')
  if (type === 'upi') {
    // For UPI, check if it's within maximum length
    if (input.length > template.validationRules.length) {
      issues.push('Invalid length')
      confidence -= 20
    }
  } else {
    // For other documents, check exact length
    if (cleanInput.length !== template.validationRules.length) {
      issues.push('Invalid length')
      confidence -= 20
    }
  }

  // Check against fraud patterns
  if (template.commonFraudPatterns.includes(input)) {
    issues.push('Known fraud pattern')
    confidence -= 50
  }

  // Type-specific validations
  if (type === 'aadhaar' && cleanInput.length === 12) {
    if (!verhoeffCheck(cleanInput)) {
      issues.push('Invalid checksum')
      confidence -= 40
    }
  }

  if (type === 'upi') {
    const [username, domain] = input.split('@')
    if (domain && !template.validBankCodes.includes(domain.toLowerCase())) {
      issues.push('Unknown bank code')
      confidence -= 25
    }

    // Check for suspicious usernames
    const suspiciousWords = ['admin', 'support', 'help', 'service', 'team', 'official', 'manager', 'winner']
    if (username && suspiciousWords.some(word => username.toLowerCase().includes(word))) {
      issues.push('Suspicious username')
      confidence -= 30
    }
  }

  // Determine risk level
  let riskLevel = 'low'
  if (confidence < 30) riskLevel = 'high'
  else if (confidence < 70) riskLevel = 'medium'

  return {
    isValid: issues.length === 0,
    confidence: Math.max(0, confidence),
    riskLevel,
    issues
  }
}

// Test function
function runTests() {
  console.log('🧪 Running Document Validation Tests...\n')

  let totalTests = 0
  let passedTests = 0

  Object.entries(testDocuments).forEach(([type, tests]) => {
    console.log(`\n📋 Testing ${type.toUpperCase()} documents:`)

    // Test valid documents
    tests.valid.forEach(doc => {
      totalTests++
      const result = validateDocument(doc, type)
      const passed = result.isValid

      console.log(`  ✓ ${doc}: ${passed ? '✅ PASS' : '❌ FAIL'} (${result.confidence}% confidence)`)
      if (passed) passedTests++
      if (!passed && result.issues.length > 0) {
        console.log(`    Issues: ${result.issues.join(', ')}`)
      }
    })

    // Test invalid documents
    tests.invalid.forEach(doc => {
      totalTests++
      const result = validateDocument(doc, type)
      const passed = !result.isValid // Should be invalid

      console.log(`  ✓ ${doc}: ${passed ? '✅ PASS (Correctly flagged as invalid)' : '❌ FAIL (Should be invalid)'} (${result.confidence}% confidence)`)
      if (passed) passedTests++
      if (result.issues.length > 0) {
        console.log(`    Issues found: ${result.issues.join(', ')}`)
      }
    })

    // Test malformed documents
    tests.malformed.forEach(doc => {
      totalTests++
      const result = validateDocument(doc, type)
      const passed = !result.isValid // Should be invalid

      console.log(`  ✓ ${doc}: ${passed ? '✅ PASS (Correctly flagged as malformed)' : '❌ FAIL (Should be invalid)'} (${result.confidence}% confidence)`)
      if (passed) passedTests++
      if (result.issues.length > 0) {
        console.log(`    Issues found: ${result.issues.join(', ')}`)
      }
    })
  })

  console.log(`\n📊 Test Results:`)
  console.log(`   Total Tests: ${totalTests}`)
  console.log(`   Passed: ${passedTests}`)
  console.log(`   Failed: ${totalTests - passedTests}`)
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

  // Test template loading
  console.log(`\n🔧 Template Loading:`)
  Object.keys(DOCUMENT_TEMPLATES).forEach(type => {
    const template = DOCUMENT_TEMPLATES[type]
    console.log(`  ✓ ${type}: ${template.commonFraudPatterns.length} fraud patterns, ${template.validBankCodes?.length || 0} bank codes`)
  })

  // Test hash function
  console.log(`\n🔐 Hash Function Test:`)
  const testString = "test@paytm"
  const hash1 = hashDocument(testString)
  const hash2 = hashDocument(testString)
  const hash3 = hashDocument("different@paytm")
  console.log(`  ✓ Same input produces same hash: ${hash1 === hash2 ? '✅' : '❌'}`)
  console.log(`  ✓ Different input produces different hash: ${hash1 !== hash3 ? '✅' : '❌'}`)

  console.log(`\n🎉 Document validation tests completed!`)
}

// Run the tests
runTests()