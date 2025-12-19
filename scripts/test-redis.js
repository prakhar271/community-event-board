const { createClient } = require('redis');

async function testRedis() {
  console.log('🔍 Testing Redis connection...');
  
  const client = createClient({ url: 'redis://localhost:6379' });
  
  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
  });

  client.on('connect', () => {
    console.log('✅ Connected to Redis');
  });

  client.on('ready', () => {
    console.log('✅ Redis client ready');
  });

  try {
    await client.connect();
    
    // Test basic operations
    console.log('📝 Testing SET operation...');
    await client.set('test:key', 'Hello Redis!');
    
    console.log('📖 Testing GET operation...');
    const value = await client.get('test:key');
    console.log('✅ Retrieved value:', value);
    
    console.log('🗑️ Testing DEL operation...');
    await client.del('test:key');
    
    console.log('⏰ Testing TTL operations...');
    await client.setEx('test:ttl', 10, 'expires in 10 seconds');
    const ttl = await client.ttl('test:ttl');
    console.log('✅ TTL value:', ttl, 'seconds');
    
    console.log('🧮 Testing increment operations...');
    await client.set('test:counter', '0');
    const count1 = await client.incrBy('test:counter', 5);
    const count2 = await client.incrBy('test:counter', 3);
    console.log('✅ Counter values:', count1, count2);
    
    // Cleanup
    await client.del('test:ttl', 'test:counter');
    
    console.log('🎉 All Redis tests passed!');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
  } finally {
    await client.quit();
    console.log('👋 Redis connection closed');
  }
}

testRedis();