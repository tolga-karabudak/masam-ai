async function seedSetups() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/seed-setups', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.ADMIN_SECRET_TOKEN || 'ftf28022026'}`
            }
        });

        const data = await response.json();
        console.log('Setup Seed Response:', data);

    } catch (err) {
        console.error('Error:', err);
    }
}

seedSetups();
