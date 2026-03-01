const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CATEGORY_MAP = {
    'Mouse': 'mouse',
    'Klavye': 'keyboard',
    'Mousepad': 'mousepad',
    'Kulaklık': 'headset',
    'Mikrofon': 'microphone',
    'Oyuncu Koltukları': 'chair',
};

async function seedManifest() {
    // 1. Load manifest
    const manifest = JSON.parse(fs.readFileSync('C:/Users/Tolgahan/Desktop/masamai/manifest.json', 'utf-8'));
    console.log(`📦 Manifest: ${manifest.length} total records`);

    // 2. Filter & map
    const products = manifest
        .filter(item => item.image_url && (item.available === 'True' || item.available === true))
        .map(item => ({
            category: CATEGORY_MAP[item.category] || item.category.toLowerCase(),
            model: item.model,
            vendor: item.vendor,
            product_type: item.product_type || null,
            product_handle: item.product_handle,
            variant_id: item.variant_id,
            variant_title: item.variant_title || null,
            sku: item.sku || null,
            available: true,
            color_option: item.color_option || null,
            color: item.color || null,
            price: item.price_raw ? item.price_raw / 100 : parseFloat(item.price) || 0,
            compare_at_price: item.compare_at_price_raw ? item.compare_at_price_raw / 100 : null,
            price_raw: item.price_raw || 0,
            compare_at_price_raw: item.compare_at_price_raw || null,
            page_url: item.page_url,
            image_url: item.image_url,
            local_image_url: item.local_path || item.image_url,
        }));

    // Log breakdown
    const cats = {};
    for (const p of products) cats[p.category] = (cats[p.category] || 0) + 1;
    console.log(`✅ After filter: ${products.length} products`);
    console.log('   By category:', cats);

    // 3. Truncate existing table
    console.log('\n🗑️  Deleting existing products...');
    const { error: delErr } = await supabase
        .from('wraith_products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

    if (delErr) {
        console.error('Delete error:', delErr.message);
        return;
    }
    console.log('✅ Existing products deleted\n');

    // 4. Batch insert in chunks of 100
    const CHUNK = 100;
    let inserted = 0;
    let failed = 0;

    for (let i = 0; i < products.length; i += CHUNK) {
        const chunk = products.slice(i, i + CHUNK);
        const { error } = await supabase
            .from('wraith_products')
            .insert(chunk);

        if (error) {
            console.error(`❌ Chunk ${i}-${i + chunk.length} failed:`, error.message);
            failed += chunk.length;
        } else {
            inserted += chunk.length;
            process.stdout.write(`\r⏳ Inserted: ${inserted}/${products.length}`);
        }
    }

    console.log(`\n\n🎉 Done! Inserted: ${inserted}, Failed: ${failed}`);
}

seedManifest().catch(console.error);
