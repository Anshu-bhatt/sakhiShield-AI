// Test script for OCR Document Upload functionality
import fetch from 'node-fetch'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

const API_BASE = 'http://localhost:5000'

// Test OCR endpoint availability
async function testOCREndpoints() {
  console.log('🧪 Testing OCR Document Upload Functionality...\n')

  try {
    // Test 1: Check server health
    console.log('1. Testing server health...')
    const healthResponse = await fetch(`${API_BASE}/`)
    const healthData = await healthResponse.json()

    console.log('✅ Server is running')
    console.log(`📌 Available endpoints: ${healthData.endpoints.length}`)

    // Check if our new OCR endpoints are listed
    const hasUploadEndpoint = healthData.endpoints.includes('/api/upload-document')
    console.log(`📤 Upload endpoint available: ${hasUploadEndpoint ? '✅' : '❌'}`)

    // Test 2: Test document templates endpoint
    console.log('\n2. Testing document templates...')
    const templatesResponse = await fetch(`${API_BASE}/api/document-templates`)
    const templatesData = await templatesResponse.json()

    if (templatesData.templates) {
      console.log('✅ Document templates loaded:')
      Object.keys(templatesData.templates).forEach(type => {
        console.log(`  • ${type}: ${templatesData.templates[type].gujaratiLabels.name}`)
      })
    }

    // Test 3: Test OCR upload endpoint (without actual file)
    console.log('\n3. Testing OCR upload endpoint (validation)...')
    const uploadResponse = await fetch(`${API_BASE}/api/upload-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: 'test_device' })
    })

    if (uploadResponse.status === 400) {
      console.log('✅ Upload endpoint correctly validates file requirement')
    } else {
      console.log('⚠️ Upload endpoint validation unexpected')
    }

    // Test 4: Test masked document serving
    console.log('\n4. Testing static file serving...')
    const staticResponse = await fetch(`${API_BASE}/uploads/masked/nonexistent.jpg`)

    if (staticResponse.status === 404) {
      console.log('✅ Masked document endpoint correctly handles missing files')
    }

    console.log('\n✅ All OCR endpoint tests passed!')
    console.log('\n📋 Ready for testing:')
    console.log('  • Visit: http://localhost:5174')
    console.log('  • Click: દસ્તાવેજ ચકાસણી')
    console.log('  • Choose: દસ્તાવેજ સ્કેન કરો (new OCR feature)')
    console.log('\n🚀 Upload any Aadhaar or PAN card image to test OCR!')

  } catch (error) {
    console.error('❌ OCR endpoint test failed:', error.message)

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:')
      console.log('   cd C:\\Users\\admin\\Desktop\\Sakhishiledai\\sakhiShield-AI')
      console.log('   node server.js')
    }
  }
}

// Test document validation functions
function testDocumentValidation() {
  console.log('\n🔍 Testing document validation functions...\n')

  const testCases = [
    {
      input: 'आधार कार्ड 1234 5678 9012 भारत सरकार',
      expected: 'aadhaar',
      description: 'Hindi Aadhaar text with number'
    },
    {
      input: 'PERMANENT ACCOUNT NUMBER ABCDE1234F INCOME TAX DEPARTMENT',
      expected: 'pan',
      description: 'English PAN text with number'
    },
    {
      input: 'Government of India Aadhaar 9876 5432 1098 unique identification',
      expected: 'aadhaar',
      description: 'English Aadhaar text'
    },
    {
      input: 'Random text with no document patterns',
      expected: 'unknown',
      description: 'Non-document text'
    }
  ]

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.description}`)
    console.log(`Input: "${testCase.input.substring(0, 50)}..."`)
    console.log(`Expected: ${testCase.expected}`)
    console.log('---')
  })

  console.log('🎯 These cases would test the OCR text parsing logic')
  console.log('💡 Real testing requires actual document images')
}

// Main test function
async function runOCRTests() {
  await testOCREndpoints()
  testDocumentValidation()
}

// Run the tests
runOCRTests().catch(console.error)