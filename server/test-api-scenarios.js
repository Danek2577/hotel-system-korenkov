/**
 * API Test Scenarios
 * QA Testing Script for Hotel Management System
 */
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let adminToken = null;
let createdRoomId = null;
let createdBookingId = null;

// Test data
const testAdmin = {
    email: `test_admin_${Date.now()}@hotel.com`,
    password: 'Test123456!',
    name: 'Test Admin',
    role: 'ADMIN'
};

const testRoom = {
    name: `Room ${Date.now()}`,
    category: 'LUXURY',
    price: 5000,
    capacity: 2,
    status: 'AVAILABLE',
    is_published: true
};

// Helper: Log result
const logResult = (testName, passed, details = '') => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${testName}${details ? ` - ${details}` : ''}`);
    return passed;
};

// Helper: API request with error handling
const apiRequest = async (method, endpoint, data = null, token = null) => {
    try {
        const config = {
            method,
            url: `${API_URL}${endpoint}`,
            headers: token ? {Authorization: token} : {}  // No "Bearer " prefix
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return {success: true, data: response.data, status: response.status};
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status || 500
        };
    }
};

// ==================== TESTS ====================

/**
 * TEST 1: Register Admin
 */
const testRegister = async () => {
    const result = await apiRequest('POST', '/auth/register', testAdmin);
    
    // Response wrapped in {message: {...}}
    const data = result.data?.message || result.data;
    
    if (result.success && data?.token) {
        adminToken = data.token;
        return logResult('Регистрация админа', true, `Token получен`);
    }
    return logResult('Регистрация админа', false, result.error);
};

/**
 * TEST 2: Login
 */
const testLogin = async () => {
    const result = await apiRequest('POST', '/auth/login', {
        email: testAdmin.email,
        password: testAdmin.password
    });
    
    const data = result.data?.message || result.data;
    
    if (result.success && data?.token) {
        adminToken = data.token;
        return logResult('Вход в систему (Login)', true, `JWT Token: ${adminToken.substring(0, 20)}...`);
    }
    return logResult('Вход в систему (Login)', false, result.error);
};

/**
 * TEST 3: Create Room
 */
const testCreateRoom = async () => {
    const result = await apiRequest('POST', '/rooms/adm', testRoom, adminToken);
    
    const data = result.data?.message || result.data;
    
    if (result.success && data?.id) {
        createdRoomId = data.id;
        return logResult('Создание номера', true, `Room ID: ${createdRoomId}`);
    }
    return logResult('Создание номера', false, result.error);
};

/**
 * TEST 4: Create Booking
 */
const testCreateBooking = async () => {
    const now = Math.floor(Date.now() / 1000);
    const bookingData = {
        room_id: createdRoomId,
        guest_name: 'Иван Петров',
        guest_phone: '+7-999-123-4567',
        date_start: now + 86400,      // Завтра
        date_end: now + 86400 * 3     // Через 3 дня
    };
    
    const result = await apiRequest('POST', '/bookings/adm', bookingData, adminToken);
    
    const data = result.data?.message || result.data;
    
    if (result.success && data?.id) {
        createdBookingId = data.id;
        return logResult('Создание бронирования', true, `Booking ID: ${createdBookingId}`);
    }
    return logResult('Создание бронирования', false, result.error);
};

/**
 * TEST 5: Overbooking Protection
 */
const testOverbookingProtection = async () => {
    const now = Math.floor(Date.now() / 1000);
    const bookingData = {
        room_id: createdRoomId,
        guest_name: 'Анна Сидорова',
        guest_phone: '+7-999-987-6543',
        date_start: now + 86400 * 2,  // Пересекается с предыдущим бронированием
        date_end: now + 86400 * 5
    };
    
    const result = await apiRequest('POST', '/bookings/adm', bookingData, adminToken);
    
    // Должна быть ошибка 400
    if (!result.success && result.status === 400) {
        return logResult('Защита от овербукинга', true, `Ошибка корректно: "${result.error}"`);
    }
    return logResult('Защита от овербукинга', false, 'Бронирование не должно было создаться!');
};

/**
 * TEST 6: Get Rooms List (Public)
 */
const testGetRooms = async () => {
    const result = await apiRequest('GET', '/rooms/');
    
    const data = result.data?.message || result.data;
    
    if (result.success && Array.isArray(data?.rooms)) {
        return logResult('Получение списка номеров (Public)', true, `Найдено: ${data.count} номеров`);
    }
    return logResult('Получение списка номеров (Public)', false, result.error);
};

/**
 * TEST 7: Auth Check
 */
const testAuthCheck = async () => {
    const result = await apiRequest('GET', '/auth/check', null, adminToken);
    
    const data = result.data?.message || result.data;
    
    if (result.success && data?.email === testAdmin.email) {
        return logResult('Проверка авторизации (Auth Check)', true, `User: ${data.email}`);
    }
    return logResult('Проверка авторизации (Auth Check)', false, result.error);
};

// ==================== RUN ALL TESTS ====================

const runTests = async () => {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 HOTEL SYSTEM - API TEST SCENARIOS');
    console.log('='.repeat(60) + '\n');
    
    const results = [];
    
    // Run tests sequentially
    results.push(await testRegister());
    results.push(await testLogin());
    results.push(await testCreateRoom());
    results.push(await testCreateBooking());
    results.push(await testOverbookingProtection());
    results.push(await testGetRooms());
    results.push(await testAuthCheck());
    
    // Summary
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 РЕЗУЛЬТАТЫ: ${passed}/${total} тестов пройдено`);
    console.log('='.repeat(60) + '\n');
    
    if (passed === total) {
        console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!\n');
    } else {
        console.log('⚠️  ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ!\n');
        process.exit(1);
    }
};

runTests().catch(console.error);

