const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBuckets() {
    const buckets = ['customizations', 'setups', 'products', 'avatars'];

    for (const bucket of buckets) {
        const { data, error } = await supabase.storage.createBucket(bucket, {
            public: true,
            allowedMimeTypes: ['image/*'],
            fileSizeLimit: 1024 * 1024 * 10, // 10MB
        });

        if (error && error.message !== 'The resource already exists') {
            console.error(`❌ Failed to create bucket "${bucket}":`, error.message);
        } else {
            console.log(`✅ Bucket "${bucket}" ready`);
        }
    }
}

createBuckets();
