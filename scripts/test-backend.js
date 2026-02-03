/**
 * Test script for checking Railway backend health
 * Usage: node scripts/test-backend.js
 */

const https = require('https');

const BACKEND_URL = 'https://web-production-cae6c.up.railway.app';
const HEALTH_ENDPOINT = '/api/health';

console.log(`\n🔍 Testing Backend: ${BACKEND_URL}`);
console.log('----------------------------------------');

const req = https.get(`${BACKEND_URL}${HEALTH_ENDPOINT}`, (res) => {
    let data = '';

    console.log(`📡 Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode === 200) {
                const response = JSON.parse(data);
                console.log('\n✅ Connection Successful!');
                console.log('----------------------------------------');
                console.log(`Status:         ${response.status}`);
                console.log(`RAG Initialized: ${response.rag_initialized ? '✅ YES' : '❌ NO'}`);
                if (response.memory_optimized) {
                    console.log(`Mode:           Memory Optimized (Render/Railway Safe)`);
                }
                console.log(`Timestamp:      ${response.timestamp}`);
                console.log('----------------------------------------');

                if (response.rag_initialized) {
                    console.log('🚀 API IS READY FOR CHAT!');
                } else {
                    console.log('⚠️  Model is still loading (Lazy Load enabled).');
                    console.log('   The first chat request will trigger initialization.');
                }
            } else {
                console.error('\n❌ Error: Non-200 Status');
                console.log(data);
            }
        } catch (e) {
            console.error('\n❌ Failed to parse response:', e.message);
            console.log('Raw received data:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`\n❌ Network Error: ${e.message}`);
    if (e.message.includes('ENOTFOUND')) {
        console.error('   -> Domain not found. DNS propagation might take time.');
    }
});
