import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import * as fal from '@fal-ai/serverless-client'

export const runtime = 'nodejs'

fal.config({ credentials: process.env.FAL_KEY })

async function detectZones(imageUrl: string): Promise<Record<string, { x1: number; y1: number; x2: number; y2: number }>> {
    const result = await fal.subscribe('fal-ai/any-llm/vision', {
        input: {
            model: 'google/gemini-flash-1.5',
            prompt: `Analyze this desk setup photo and detect the locations of peripherals.
Return ONLY a valid JSON object (no markdown, no explanation) with bounding boxes for detected peripherals.
Format: {"keyboard": {"x1": number, "y1": number, "x2": number, "y2": number}, "mouse": {...}, ...}

Only include peripherals you can actually see. Possible keys: keyboard, mouse, mousepad, headset, microphone, webcam.
Coordinates must be in pixels based on the actual image dimensions.
Add 20-30px padding around each peripheral for better inpainting results.`,
            image_urls: [imageUrl],
        }
    }) as { output: string }

    const cleaned = result.output.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
}

async function detectCategories(imageUrl: string): Promise<string[]> {
    const result = await fal.subscribe('fal-ai/any-llm/vision', {
        input: {
            model: 'google/gemini-flash-1.5',
            prompt: `Look at this desk setup photo and return ONLY a JSON array of matching category slugs from this list:
["gaming_rgb","minimalist","stealth","retro","professional","cyberpunk","nature","pastel","industrial","creator_studio"]
Example output: ["gaming_rgb","stealth"]`,
            image_urls: [imageUrl],
        }
    }) as { output: string }

    const cleaned = result.output.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
}

export async function POST(request: Request) {
    try {
        // Authenticate user
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() {},
                },
            }
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminDb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const formData = await request.formData()
        const file = formData.get('image') as File
        const title = (formData.get('title') as string) || 'Benim Setup\'um'

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        // 1. Upload image to Supabase Storage
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const ext = file.type === 'image/png' ? 'png' : 'jpg'
        const storagePath = `user/${Date.now()}.${ext}`

        const { error: uploadError } = await adminDb.storage
            .from('setups')
            .upload(storagePath, buffer, { contentType: file.type })

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

        const { data: { publicUrl: imageUrl } } = adminDb.storage
            .from('setups')
            .getPublicUrl(storagePath)

        // 2. Detect peripheral zones and categories via fal.ai vision
        let peripheral_zones: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {}
        let categories: string[] = ['custom']

        const [zonesResult, categoriesResult] = await Promise.allSettled([
            detectZones(imageUrl),
            detectCategories(imageUrl),
        ])

        if (zonesResult.status === 'fulfilled') {
            peripheral_zones = zonesResult.value
            console.log('Detected zones:', Object.keys(peripheral_zones).join(', '))
        } else {
            console.warn('Zone detection failed:', zonesResult.reason)
        }

        if (categoriesResult.status === 'fulfilled') {
            categories = categoriesResult.value
        } else {
            console.warn('Category detection failed:', categoriesResult.reason)
        }

        // 3. Save setup to DB
        const { data: setup, error: dbError } = await adminDb
            .from('setups')
            .insert({
                user_id: user.id,
                title,
                image_url: imageUrl,
                thumbnail_url: imageUrl,
                source: 'user',
                is_public: false,
                categories,
                peripheral_zones,
            })
            .select('id')
            .single()

        if (dbError) throw new Error(`DB insert failed: ${dbError.message}`)

        return NextResponse.json({
            success: true,
            setup_id: setup.id,
            peripheral_zones,
            categories,
            image_url: imageUrl,
        })

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        console.error('Setup analyze error:', error)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
