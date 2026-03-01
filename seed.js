const fs = require('fs');

async function uploadManifest() {
    try {
        const rawData = fs.readFileSync('c:\\Users\\Tolgahan\\Desktop\\masamai\\manifest.json');
        const manifest = JSON.parse(rawData);

        console.log(`Sending ${manifest.length} products to the API...`);

        const response = await fetch('http://localhost:3000/api/admin/import-products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ADMIN_SECRET_TOKEN || 'ftf28022026'}`
            },
            body: JSON.stringify({ manifest })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error response text:', text);
            return;
        }

        const data = await response.json();
        console.log('Response:', data);

    } catch (err) {
        console.error('Error:', err);
    }
}

uploadManifest();
