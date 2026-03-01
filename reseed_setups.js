const { createClient } = require('@supabase/supabase-js');
const fal = require('@fal-ai/serverless-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

fal.config({ credentials: process.env.FAL_KEY });

async function falVision(imageUrl, prompt) {
    const result = await fal.subscribe('fal-ai/any-llm/vision', {
        input: {
            model: 'google/gemini-flash-1.5',
            prompt,
            image_urls: [imageUrl],
        },
    });
    return result.output;
}

// Setup definitions — Gemini detects zones automatically, fallback_zones used if Gemini fails
const setupDefinitions = [
    {
        title: 'Neon Warrior Gaming Setup',
        image_url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2670&auto=format&fit=crop',
        categories: ['gaming_rgb'],
        desk_size: 'wide',
        color_palette: ['dark', 'rgb'],
        lighting: 'rgb',
        fallback_zones: {
            keyboard: { x1: 380, y1: 900, x2: 1250, y2: 1150 },
            mouse: { x1: 1300, y1: 920, x2: 1580, y2: 1130 },
            mousepad: { x1: 300, y1: 860, x2: 1650, y2: 1200 },
            headset: { x1: 50, y1: 600, x2: 280, y2: 900 },
        },
    },
    {
        title: 'Minimalist Clean Desk',
        image_url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2670&auto=format&fit=crop',
        categories: ['minimalist', 'professional'],
        desk_size: 'standard',
        color_palette: ['light', 'wood'],
        lighting: 'natural',
        fallback_zones: {
            keyboard: { x1: 600, y1: 750, x2: 1400, y2: 980 },
            mouse: { x1: 1500, y1: 770, x2: 1700, y2: 940 },
            mousepad: { x1: 550, y1: 720, x2: 1750, y2: 1020 },
        },
    },
    {
        title: 'Stealth Developer Space',
        image_url: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=2670&auto=format&fit=crop',
        categories: ['stealth', 'professional'],
        desk_size: 'wide',
        color_palette: ['dark'],
        lighting: 'dark',
        fallback_zones: {
            keyboard: { x1: 550, y1: 620, x2: 1200, y2: 830 },
            mouse: { x1: 1250, y1: 640, x2: 1450, y2: 800 },
            mousepad: { x1: 500, y1: 590, x2: 1500, y2: 870 },
        },
    },
    {
        title: 'Dark RGB Dual Monitor Setup',
        image_url: '/setup-dark-dual-monitor.jpg', // local file → will be uploaded to Supabase storage
        categories: ['gaming_rgb', 'verimlilik & kodlama'],
        desk_size: 'wide',
        color_palette: ['dark', 'rgb'],
        lighting: 'rgb',
        fallback_zones: {
            keyboard: { x1: 360, y1: 720, x2: 740, y2: 870 },
            mouse: { x1: 760, y1: 730, x2: 890, y2: 840 },
            mousepad: { x1: 280, y1: 680, x2: 970, y2: 920 },
        },
    },
];

async function analyzeZones(imageUrl) {
    const text = await falVision(imageUrl, `Analyze this desk setup photo and detect the locations of peripherals.
Return ONLY a valid JSON object (no markdown, no explanation) with bounding boxes for detected peripherals.
Format: {"keyboard": {"x1": number, "y1": number, "x2": number, "y2": number}, "mouse": {...}, ...}

Only include peripherals you can actually see. Possible keys: keyboard, mouse, mousepad, headset, microphone, webcam.
Coordinates must be in pixels based on the actual image dimensions.
Add 20-30px padding around each peripheral for better inpainting results.`);

    const cleaned = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
}

async function processSetup(def) {
    let imageUrl = def.image_url;

    if (imageUrl.startsWith('/')) {
        // Local file: read from public/ folder and upload to Supabase storage
        const filePath = path.join(process.cwd(), 'public', imageUrl);
        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(imageUrl).replace('.', '');
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

        const storagePath = `system/${Date.now()}-${path.basename(imageUrl)}`;
        const { error: uploadError } = await supabase.storage
            .from('setups')
            .upload(storagePath, buffer, { contentType: mimeType });

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage.from('setups').getPublicUrl(storagePath);
        imageUrl = publicUrl;
        console.log(`   📤 Uploaded to storage: ${imageUrl}`);
    }

    // Run fal.ai vision zone detection, fall back to manual zones if it fails
    let peripheral_zones = def.fallback_zones || {};
    try {
        const detected = await analyzeZones(imageUrl);
        if (Object.keys(detected).length > 0) {
            peripheral_zones = detected;
            console.log(`   🔍 AI detected zones: ${Object.keys(peripheral_zones).join(', ')}`);
        }
    } catch (err) {
        console.warn(`   ⚠️  AI detection failed, using fallback zones: ${Object.keys(peripheral_zones).join(', ')}`);
    }

    return {
        title: def.title,
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        source: 'system',
        is_public: true,
        categories: def.categories,
        desk_size: def.desk_size,
        color_palette: def.color_palette,
        lighting: def.lighting,
        peripheral_zones,
    };
}

async function reseedSetups() {
    // Delete existing system setups
    const { error: deleteError } = await supabase
        .from('setups')
        .delete()
        .eq('source', 'system');

    if (deleteError) {
        console.error('Delete error:', deleteError.message);
        return;
    }
    console.log('✅ Old system setups deleted\n');

    // Process each setup one by one (Gemini rate limit friendly)
    for (const def of setupDefinitions) {
        console.log(`⏳ Processing: ${def.title}`);
        try {
            const setup = await processSetup(def);

            const { data, error } = await supabase
                .from('setups')
                .insert(setup)
                .select('id, title')
                .single();

            if (error) throw error;
            console.log(`✅ ${data.id} — ${data.title}\n`);
        } catch (err) {
            console.error(`❌ Failed: ${err.message}\n`);
        }
    }

    console.log('🎉 All setups seeded with AI-detected zones!');
}

reseedSetups();
