
const API_URL = 'http://localhost:3001/auth/login';

async function main() {
    console.log('🧪 Testing Login...');

    const email = 'general@company.com';
    const password = '123456';

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (res.ok) {
        const user = await res.json();
        console.log('✅ Login Successful:', user.email);
    } else {
        const err = await res.json();
        console.log('❌ Login Failed:', res.status, err);
    }

    // Test invalid email
    const res2 = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'wrong@email.com', password: '123' })
    });
    const err2 = await res2.json();
    console.log('✅ Invalid Email Test (Expect 401):', res2.status, err2);
}

main();
