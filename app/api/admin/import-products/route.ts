import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// We use the service role key here because this is an admin route that needs to bypass RLS to insert products
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const CATEGORY_MAP: Record<string, string> = {
    'Mouse': 'mouse',
    'Klavye': 'keyboard',
    'Mousepad': 'mousepad',
    'Kulaklık': 'headset',
    'Kulaklık ve Ses': 'headset',
    'Mikrofon': 'microphone',
    'Webcamler': 'webcam',
    'Oyuncu Koltukları': 'chair',
};

export async function POST(request: Request) {
    try {
        // Check for a simple admin token to prevent unauthorized execution
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_TOKEN}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { manifest } = await request.json()

        if (!manifest || !Array.isArray(manifest)) {
            return NextResponse.json({ error: 'Invalid manifest format' }, { status: 400 })
        }

        const products = manifest
            .filter(item => item.image_url && (item.available === 'True' || item.available === true))
            .map(item => ({
                category: CATEGORY_MAP[item.category] || item.category.toLowerCase(),
                primary_vibe: item.primary_vibe || null,
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

        // Batch upsert 
        // Chunking to avoid payload too large errors
        const chunkSize = 100
        let successCount = 0
        let errorCount = 0

        for (let i = 0; i < products.length; i += chunkSize) {
            const chunk = products.slice(i, i + chunkSize)
            const { error } = await supabase
                .from('wraith_products')
                .upsert(chunk, { onConflict: 'product_handle,variant_id' })

            if (error) {
                console.error('Import chunk error:', error)
                errorCount += chunk.length
            } else {
                successCount += chunk.length
            }
        }

        return NextResponse.json({
            success: true,
            imported: successCount,
            failed: errorCount,
            total_processed: products.length
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 })
    }
}
