import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as fal from '@fal-ai/serverless-client'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const MODEL = 'fal-ai/nano-banana-pro/edit'
const AI_CATEGORIES = ["mouse", "mousepad", "keyboard", "headset", "microphone", "chair"] as const

fal.config({ credentials: process.env.FAL_KEY })

async function toPublicUrl(imageUrl: string): Promise<string> {
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
    const filePath = path.join(process.cwd(), 'public', imageUrl)
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(imageUrl).replace('.', '') || 'jpg'
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'
    return fal.storage.upload(new File([buffer], `setup.${ext}`, { type: contentType }))
}

function parseDimsMm(variantTitle: string | null): { wMm: number; hMm: number } | null {
    if (!variantTitle) return null
    const m = variantTitle.match(/(\d+)\s*[x×*]\s*(\d+)/i)
    if (!m) return null
    let w = parseInt(m[1]), h = parseInt(m[2])
    if (w < 100 && h < 100) { w *= 10; h *= 10 }
    return { wMm: w, hMm: h }
}

type ProductInfo = { image_url: string; model: string; variant_title: string | null }

function buildCombinedPrompt(products: Partial<Record<string, ProductInfo>>): string {
    const parts: string[] = [
        "Image 1 is the base desk setup. Edit it in a single coherent result with these rules:",
    ]

    let imgIdx = 2

    if (products.mouse) {
        parts.push(
            `Replace the mouse in the scene with the mouse product shown in image ${imgIdx}. Keep its size proportional to the desk and keyboard.`
        )
        imgIdx++
    }
    if (products.mousepad) {
        const dims = parseDimsMm(products.mousepad.variant_title)
        const isLarge = dims && dims.wMm >= 600
        if (isLarge && dims) {
            const wCm = Math.round(dims.wMm / 10)
            const hCm = Math.round(dims.hMm / 10)
            parts.push(
                `Replace the mousepad/deskmat with the product in image ${imgIdx}. It is a large deskmat (${wCm}x${hCm}cm) — scale it to cover the same desk area as in the base image.`
            )
        } else {
            parts.push(
                `Replace the mousepad with the product in image ${imgIdx}. Important: the mousepad must stay proportionally small — it sits only under the mouse, not under the keyboard. Normal size like 45x45 cm, not oversized.`
            )
        }
        imgIdx++
    }
    if (products.keyboard) {
        parts.push(
            `Replace the keyboard with the keyboard product shown in image ${imgIdx}. Keep its size and perspective consistent with the scene.`
        )
        imgIdx++
    }
    if (products.headset) {
        parts.push(
            `Place the headset shown in image ${imgIdx} on the desk or hanging on the monitor side, as commonly seen in gaming setups. Keep realistic proportions.`
        )
        imgIdx++
    }
    if (products.microphone) {
        parts.push(
            `Place the microphone shown in image ${imgIdx} on the desk near the monitor, mounted on a small stand or boom arm. Keep realistic proportions.`
        )
        imgIdx++
    }
    if (products.chair) {
        parts.push(
            `Replace the chair/seat in the scene with the gaming chair shown in image ${imgIdx}. If no chair is visible, place it behind the desk. Keep realistic proportions and perspective.`
        )
        imgIdx++
    }

    parts.push(
        "Preserve the rest exactly: desk, monitors, lighting, background, and camera angle. Output one image with all replacements applied and realistic proportions."
    )
    return parts.join(" ")
}

// POST — submit multi-product job to fal.ai queue
export async function POST(request: Request) {
    try {
        const adminDb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const body = await request.json()
        const { setup_id, selections, base_image_url } = body as {
            setup_id: string
            selections: Record<string, string>
            base_image_url: string
        }

        if (!setup_id || !selections || Object.keys(selections).length === 0) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // Verify setup exists
        const { data: setup, error: setupErr } = await adminDb
            .from('setups')
            .select('id, image_url')
            .eq('id', setup_id)
            .single()
        if (setupErr || !setup) throw new Error('Setup not found')

        const setupImageUrl = await toPublicUrl(base_image_url || setup.image_url)

        // Fetch all selected products
        const productIds = Object.values(selections)
        const { data: productRows, error: prodErr } = await adminDb
            .from('wraith_products')
            .select('id, model, image_url, variant_title')
            .in('id', productIds)
        if (prodErr) throw new Error('Products not found')

        const productById: Record<string, ProductInfo> = {}
        for (const row of productRows || []) {
            productById[row.id] = {
                image_url: row.image_url,
                model: row.model ?? '',
                variant_title: row.variant_title ?? null,
            }
        }

        // Build ordered products map and image_urls
        const products: Partial<Record<string, ProductInfo>> = {}
        const image_urls: string[] = [setupImageUrl]

        for (const cat of AI_CATEGORIES) {
            const pid = selections[cat]
            if (!pid || !productById[pid]) continue
            products[cat] = productById[pid]
            image_urls.push(productById[pid].image_url)
        }

        const prompt = buildCombinedPrompt(products)
        console.log(`Inpaint submit | categories: ${Object.keys(products).join(',')} | images: ${image_urls.length}`)

        const { request_id } = await fal.queue.submit(MODEL, {
            input: {
                prompt,
                image_urls,
                resolution: "1K",
            },
        }) as { request_id: string }

        console.log(`Queued: ${request_id}`)
        return NextResponse.json({ success: true, request_id, setup_id: setup.id })

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        console.error('Inpaint submit error:', msg)
        return NextResponse.json({ error: 'Failed to start inpainting', message: msg }, { status: 500 })
    }
}

// GET — poll fal.ai queue status
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const request_id = searchParams.get('request_id')
        const setup_id = searchParams.get('setup_id')

        if (!request_id) {
            return NextResponse.json({ error: 'Missing request_id' }, { status: 400 })
        }

        const status = await fal.queue.status(MODEL, {
            requestId: request_id,
            logs: false,
        }) as { status: string }

        console.log(`Poll ${request_id}: ${status.status}`)

        if (status.status === 'COMPLETED') {
            const result = await fal.queue.result(MODEL, {
                requestId: request_id,
            }) as { images?: { url: string }[] }

            const resultUrl = result?.images?.[0]?.url
            if (!resultUrl) throw new Error('fal.ai returned no image')

            if (setup_id) {
                const adminDb = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );
                (async () => {
                    try { await adminDb.rpc('increment_try_count', { setup_id_param: setup_id }) } catch {}
                })()
            }

            return NextResponse.json({ status: 'done', result_image_url: resultUrl })
        }

        if (status.status === 'FAILED') {
            return NextResponse.json({ status: 'failed', error: 'Processing failed' }, { status: 500 })
        }

        return NextResponse.json({ status: 'processing' })

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        console.error('Inpaint poll error:', msg)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
