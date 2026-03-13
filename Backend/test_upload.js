const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'test.pdf');
// Create a dummy PDF file
fs.writeFileSync(filePath, '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000244 00000 n \n0000000334 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n428\n%%EOF');

async function testUpload() {
    const formData = new FormData();
    const fileDetails = fs.readFileSync(filePath);
    const blob = new Blob([fileDetails], { type: 'application/pdf' });
    formData.append('file', blob, 'test.pdf');
    formData.append('message', 'Analyze this');

    try {
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

testUpload();
