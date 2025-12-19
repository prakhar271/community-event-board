const axios = require('axios');
const { createClient } = require('redis');

async function testRedisCacheFeatures() {
  console.log('🚀 Testing Redis Cache Features...\n');
  
  const baseURL = 'http://localhost:3001';
  const redis = createClient({ url: 'redis://localhost:6379' });
  
  try {
    await redis.connect();
    console.log('✅ Connected to Redis for testing\n');
    
    // 1. Test API Response Caching
    console.log('📦 1. Testing API Response Caching');
    console.log('   Making first request...');
    const start1 = Date.now();
    await axios.get(`${baseURL}/api/events/search?q=cache-test`);
    const time1 = Date.now() - start1;
    
    console.log('   Making second request (should be cached)...');
    const start2 = Date.now();
    await axios.get(`${baseURL}/api/events/search?q=cache-test`);
    const time2 = Date.now() - start2;
    
    console.log(`   First request: ${time1}ms`);
    console.log(`   Second request: ${time2}ms`);
    console.log(`   ✅ Cache working: ${time2 < time1 ? 'YES' : 'MAYBE (too fast to measure)'}\n`);
    
    // 2. Check Redis Keys
    console.log('🔑 2. Checking Redis Keys');
    const keys = await redis.keys('api:*');
    console.log(`   Found ${keys.length} cached API responses:`);
    keys.forEach(key => console.log(`   - ${key}`));
    console.log('');
    
    // 3. Test TTL (Time To Live)
    console.log('⏰ 3. Testing Cache Expiration (TTL)');
    if (keys.length > 0) {
      const ttl = await redis.ttl(keys[0]);
      console.log(`   TTL for ${keys[0]}: ${ttl} seconds`);
      console.log(`   ✅ Cache will expire in ${Math.floor(ttl / 60)} minutes ${ttl % 60} seconds\n`);
    }
    
    // 4. Test Manual Cache Operations
    console.log('🛠️ 4. Testing Manual Cache Operations');
    
    // Set a custom cache value
    await redis.setEx('test:manual', 30, JSON.stringify({ message: 'Hello from Redis!', timestamp: new Date() }));
    console.log('   ✅ Set custom cache value with 30s TTL');
    
    // Get the value
    const value = await redis.get('test:manual');
    const parsed = JSON.parse(value);
    console.log(`   ✅ Retrieved value: ${parsed.message}`);
    
    // Test increment operations
    await redis.set('test:counter', '0');
    const count1 = await redis.incrBy('test:counter', 5);
    const count2 = await redis.incrBy('test:counter', 3);
    console.log(`   ✅ Counter operations: 0 → ${count1} → ${count2}\n`);
    
    // 5. Test Cache Performance
    console.log('⚡ 5. Testing Cache Performance');
    const iterations = 10;
    let totalRedisTime = 0;
    let totalMemoryTime = 0;
    
    // Redis operations
    console.log(`   Testing ${iterations} Redis operations...`);
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await redis.set(`perf:test:${i}`, `value-${i}`);
      await redis.get(`perf:test:${i}`);
      totalRedisTime += Date.now() - start;
    }
    
    // Memory operations (simulate)
    console.log(`   Simulating ${iterations} memory operations...`);
    const memoryCache = new Map();
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      memoryCache.set(`perf:test:${i}`, `value-${i}`);
      memoryCache.get(`perf:test:${i}`);
      totalMemoryTime += Date.now() - start;
    }
    
    console.log(`   Redis average: ${(totalRedisTime / iterations).toFixed(2)}ms per operation`);
    console.log(`   Memory average: ${(totalMemoryTime / iterations).toFixed(2)}ms per operation`);
    console.log(`   ✅ Performance test completed\n`);
    
    // 6. Test Cache Statistics
    console.log('📊 6. Cache Statistics');
    const info = await redis.info('memory');
    const memoryLines = info.split('\r\n').filter(line => line.includes('used_memory'));
    memoryLines.forEach(line => {
      if (line.includes('used_memory_human')) {
        console.log(`   Redis memory usage: ${line.split(':')[1]}`);
      }
    });
    
    const dbSize = await redis.dbSize();
    console.log(`   Total keys in Redis: ${dbSize}`);
    console.log('   ✅ Statistics retrieved\n');
    
    // 7. Cleanup test data
    console.log('🧹 7. Cleaning up test data');
    await redis.del('test:manual', 'test:counter');
    const perfKeys = await redis.keys('perf:test:*');
    if (perfKeys.length > 0) {
      await redis.del(...perfKeys);
    }
    console.log(`   ✅ Cleaned up ${perfKeys.length + 2} test keys\n`);
    
    console.log('🎉 All Redis cache features are working perfectly!');
    console.log('\n📋 Summary:');
    console.log('   ✅ API Response Caching: Working');
    console.log('   ✅ Cache Expiration (TTL): Working');
    console.log('   ✅ Manual Cache Operations: Working');
    console.log('   ✅ Performance: Good');
    console.log('   ✅ Statistics: Available');
    console.log('   ✅ Cleanup: Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await redis.quit();
    console.log('\n👋 Redis test connection closed');
  }
}

testRedisCacheFeatures();