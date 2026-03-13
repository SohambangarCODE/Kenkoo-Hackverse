require('dotenv').config();
const { sendContactEmail, sendConfirmationEmail } = require('./src/services/email.service');

console.log('=== Email Service Test ===\n');

// Check environment variables
console.log('Environment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
console.log('EMAIL_TO:', process.env.EMAIL_TO);
console.log('\n');

// Test data
const testData = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Test Email from Contact Form',
  message: 'This is a test message to verify email functionality is working correctly.'
};

console.log('Sending test email...\n');

// Test sending email
sendContactEmail(testData)
  .then(result => {
    console.log('\n=== Business Email Result ===');
    console.log('Success:', result.success);
    if (result.success) {
      console.log('Message ID:', result.messageId);
      console.log('✅ Email sent successfully!');
      
      // Test confirmation email
      console.log('\n\nSending confirmation email...\n');
      return sendConfirmationEmail(testData.email, testData.name);
    } else {
      console.log('Error:', result.error);
      console.log('❌ Email failed to send');
      process.exit(1);
    }
  })
  .then(result => {
    if (result) {
      console.log('\n=== Confirmation Email Result ===');
      console.log('Success:', result.success);
      if (result.success) {
        console.log('Message ID:', result.messageId);
        console.log('✅ Confirmation email sent successfully!');
      } else {
        console.log('Error:', result.error);
        console.log('❌ Confirmation email failed');
      }
    }
    console.log('\n=== Test Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });
