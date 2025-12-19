const axios = require('axios');

async function testCache() {
  console.log('🔍 Testing Cache Service...');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test basic server health
    console.log('📊 Testing server health...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Server health:', healthResponse.data.message);
    
    // Test cache functionality by making some API calls that should be cached
    console.log('📦 Testing cache with API calls...');
    
    // Make a request that should be cached
    const start1 = Date.now();
    const response1 = await axios.get(`${baseURL}/api/events/search?q=test`);
    const time1 = Date.now() - start1;
    console.log(`✅ First request: ${time1}ms (should be slower - cache miss)`);
    
    // Make the same request again - should be faster if cached
    const start2 = Date.now();
    const response2 = await axios.get(`${baseURL}/api/events/search?q=test`);
    const time2 = Date.now() - start2;
    console.log(`✅ Second request: ${time2}ms (should be faster - cache hit)`);
    
    if (time2 < time1) {
      console.log('🎉 Cache appears to be working! Second request was faster.');
    } else {
      console.log('⚠️ Cache might not be working or requests were too fast to measure difference.');
    }
    
    console.log('📈 Cache test completed!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

testCache();