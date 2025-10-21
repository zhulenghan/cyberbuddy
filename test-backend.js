/**
 * Test script to verify backend API is working
 */

const API_BASE_URL = 'http://localhost:3000/v1'

async function testBackend() {
  console.log('🧪 Testing Backend API...')
  
  try {
    // Test 1: Check if server is running
    console.log('\n1. Testing server availability...')
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    console.log('Health check status:', healthResponse.status)
    
    // Test 2: Test pet generation (without auth for now)
    console.log('\n2. Testing pet generation...')
    const petResponse = await fetch(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Mock token
      },
      body: JSON.stringify({
        prompt: 'A cute pixel art cat with a hat',
        style: 'pixel'
      })
    })
    
    console.log('Pet generation status:', petResponse.status)
    
    if (petResponse.ok) {
      const petData = await petResponse.json()
      console.log('✅ Pet generated successfully!')
      console.log('Pet data:', JSON.stringify(petData, null, 2))
      
      if (petData.images) {
        console.log('\n📸 Image URLs:')
        Object.entries(petData.images).forEach(([state, url]) => {
          console.log(`  ${state}: ${url}`)
        })
      }
    } else {
      const error = await petResponse.text()
      console.log('❌ Pet generation failed:', error)
    }
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message)
    console.log('\n💡 Make sure the backend server is running:')
    console.log('   cd backend/infrastructure')
    console.log('   npm run deploy')
    console.log('   or')
    console.log('   npm run dev (if local development server exists)')
  }
}

// Run the test
testBackend()
