import axios from 'axios';

const BASE_URL = 'https://vibralert-backend.fly.dev';
const FRONTEND_URL = 'https://vibralert-frontend.vercel.app';

async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  // Test 1: System State
  console.log('Test 1: GET /api/device/state');
  try {
    const state = await axios.get(`${BASE_URL}/api/device/state`);
    console.log(`   ✅ PASS - Alarm status: ${state.data.alarm_status}`);
  } catch (e) {
    console.log(`   ❌ FAIL - ${e.message}`);
  }
  
  // Test 2: Get Sensor Logs
  console.log('\nTest 2: GET /api/device/sensor-logs');
  try {
    const logs = await axios.get(`${BASE_URL}/api/device/sensor-logs`);
    console.log(`   ✅ PASS - Found ${logs.data.length} logs`);
  } catch (e) {
    console.log(`   ❌ FAIL - ${e.message}`);
  }
  
  // Test 3: Get Web Bypass Logs
  console.log('\nTest 3: GET /api/device/web-bypass-logs');
  try {
    const logs = await axios.get(`${BASE_URL}/api/device/web-bypass-logs`);
    console.log(`   ✅ PASS - Found ${logs.data.length} web logs`);
  } catch (e) {
    console.log(`   ❌ FAIL - ${e.message}`);
  }
  
  // Test 4: Get Device Bypass Logs
  console.log('\nTest 4: GET /api/device/device-bypass-logs');
  try {
    const logs = await axios.get(`${BASE_URL}/api/device/device-bypass-logs`);
    console.log(`   ✅ PASS - Found ${logs.data.length} device logs`);
  } catch (e) {
    console.log(`   ❌ FAIL - ${e.message}`);
  }
  
  // Test 5: Check ESP32 Status
  console.log('\nTest 5: GET /api/device/status');
  try {
    const status = await axios.get(`${BASE_URL}/api/device/status`);
    console.log(`   ✅ PASS - ESP32 connected: ${status.data.connected}`);
  } catch (e) {
    console.log(`   ❌ FAIL - ${e.message}`);
  }
  
  // Test 6: Frontend Accessibility
  console.log('\nTest 6: GET Frontend');
  try {
    const frontend = await axios.get(FRONTEND_URL);
    console.log(`   ✅ PASS - Frontend accessible (${frontend.status})`);
  } catch (e) {
    console.log(`   ❌ FAIL - ${e.message}`);
  }
  
  console.log('\n✅ All tests completed!');
}

runTests();