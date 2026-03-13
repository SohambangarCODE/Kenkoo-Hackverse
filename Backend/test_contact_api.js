const fetch = require('node-fetch');

async function testContactSubmission() {
    try {
        const response = await fetch('http://localhost:3000/api/contact/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'This is a test message from the verification script.'
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', data);

        if (response.ok && data.success) {
            console.log('✅ Contact form submission verification PASSED');
        } else {
            console.error('❌ Contact form submission verification FAILED');
        }
    } catch (error) {
        console.error('❌ Error during verification:', error.message);
    }
}

testContactSubmission();
