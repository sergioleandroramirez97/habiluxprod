const axios = require('axios');

async function testLogin(password) {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'admin@admin.com',
            password: password
        });
        console.log(`Login successful with password: ${password}`);
        console.log('Token:', response.data.token);
        return true;
    } catch (error) {
        console.log(`Login failed with password: ${password}`);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
        return false;
    }
}

async function main() {
    console.log('Testing password "admin"...');
    if (await testLogin('admin')) return;

    console.log('\nTesting password "admin123"...');
    if (await testLogin('admin123')) return;
}

main();
