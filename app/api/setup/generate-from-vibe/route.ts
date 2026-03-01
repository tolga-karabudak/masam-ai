import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import * as fal from "@fal-ai/serverless-client"
import sharp from "sharp"
import fs from "fs"
import path from "path"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export const runtime = "nodejs"
export const maxDuration = 120

const MODEL = "fal-ai/nano-banana-pro/edit"
const AI_CATEGORIES = ["mouse", "mousepad", "keyboard", "headset", "microphone", "chair"] as const
type AiCategory = (typeof AI_CATEGORIES)[number]

const FAL_KEY = process.env.FAL_KEY
fal.config({ credentials: FAL_KEY })

function parseDimsMm(variantTitle: string | null): { wMm: number; hMm: number } | null {
    if (!variantTitle) return null
    const m = variantTitle.match(/(\d+)\s*[x×*]\s*(\d+)/i)
    if (!m) return null
    let w = parseInt(m[1], 10),
        h = parseInt(m[2], 10)
    if (w < 100 && h < 100) {
        w *= 10
        h *= 10
    }
    return { wMm: w, hMm: h }
}

type ProductInfo = { image_url: string; model: string; variant_title: string | null }

/**
 * Build a combined prompt. Template is always image 1.
 * Subsequent images are numbered dynamically based on which products are selected.
 */
function buildCombinedPrompt(products: Record<AiCategory, ProductInfo | null>): string {
    const parts: string[] = [
        "Image 1 is the base desk setup. Edit it in a single coherent result with these rules:",
    ]

    let imgIdx = 2 // image 1 = template, products start at 2

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
                `Replace the mousepad with the product in image ${imgIdx}. Important: the mousepad must stay proportionally small — it sits only under the mouse, not under the keyboard (do not extend it toward the keyboard). Normal size like 45x45 cm, not oversized. Do not make it cover the whole desk.`
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

async function waitForFalResult(requestId: string): Promise<string> {
    const maxWait = 120000
    const pollInterval = 2500
    const start = Date.now()
    while (Date.now() - start < maxWait) {
        const status = (await fal.queue.status(MODEL, {
            requestId: requestId,
            logs: false,
        })) as { status: string }
        if (status.status === "COMPLETED") {
            const result = (await fal.queue.result(MODEL, { requestId: requestId })) as {
                images?: { url: string }[]
            }
            const url = result?.images?.[0]?.url
            if (!url) throw new Error("fal.ai returned no image")
            return url
        }
        if (status.status === "FAILED") {
            throw new Error("fal.ai processing failed")
        }
        await new Promise((r) => setTimeout(r, pollInterval))
    }
    throw new Error("fal.ai timeout")
}

export async function POST(request: Request) {
    console.log("generate-from-vibe: POST start")
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll() {},
                },
            }
        )
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            console.log("generate-from-vibe: no user")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        console.log("generate-from-vibe: user", user.id)

        if (!FAL_KEY) {
            console.error("generate-from-vibe: FAL_KEY missing")
            return NextResponse.json(
                { error: "Server configuration error", message: "FAL_KEY not set" },
                { status: 500 }
            )
        }

        const body = await request.json()
        console.log("generate-from-vibe: body parsed", { vibe_id: body?.vibe_id, selections: body?.selections })
        const vibe_id = (body.vibe_id as string) || "shadow_realm"
        const allSelections = (body.selections || {}) as Record<string, string | null>

        const adminDb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        let templateUrl: string | null = null
        const { data: vibeRow } = await adminDb
            .from("vibes")
            .select("template_url")
            .eq("id", vibe_id)
            .single()
        if (vibeRow?.template_url) {
            templateUrl = vibeRow.template_url
            console.log("generate-from-vibe: using template from DB", vibe_id)
        }
        if (!templateUrl) {
            const { data: fallbackRow } = await adminDb
                .from("vibes")
                .select("template_url")
                .eq("id", "command_bridge")
                .single()
            if (fallbackRow?.template_url) {
                templateUrl = fallbackRow.template_url
                console.log("generate-from-vibe: using command_bridge template from DB")
            }
        }
        if (!templateUrl) {
            const cwd = process.cwd()
            const possibleDirs = [
                path.join(cwd, "vibe_template"),
                path.join(cwd, "..", "vibe_template"),
            ]
            let templatePath: string | null = null
            for (const dir of possibleDirs) {
                const p = path.join(dir, `${vibe_id}.png`)
                if (fs.existsSync(p)) {
                    templatePath = p
                    break
                }
            }
            if (!templatePath) {
                for (const dir of possibleDirs) {
                    const p = path.join(dir, "command_bridge.png")
                    if (fs.existsSync(p)) {
                        templatePath = p
                        break
                    }
                }
            }
            if (!templatePath) {
                console.error("generate-from-vibe: template not found in", possibleDirs)
                return NextResponse.json(
                    { error: "Vibe template not found" },
                    { status: 400 }
                )
            }
            console.log("generate-from-vibe: using local template", templatePath)
            const templateBuffer = fs.readFileSync(templatePath)
            templateUrl = await fal.storage.upload(
                new File([templateBuffer], "template.png", { type: "image/png" })
            )
            console.log("generate-from-vibe: template uploaded to fal", templateUrl?.slice?.(0, 50))
        }

        // Fetch all selected products across all AI categories
        const products: Record<AiCategory, ProductInfo | null> = {
            mouse: null,
            mousepad: null,
            keyboard: null,
            headset: null,
            microphone: null,
            chair: null,
        }
        const productResults = await Promise.all(
            AI_CATEGORIES.map(async (key) => {
                const productId = allSelections[key]
                if (!productId) return { key, row: null }
                const { data: row, error: productErr } = await adminDb
                    .from("wraith_products")
                    .select("id, model, image_url, variant_title")
                    .eq("id", productId)
                    .single()
                if (productErr || !row?.image_url) {
                    console.warn("generate-from-vibe: skip product", productId, productErr?.message)
                    return { key, row: null }
                }
                return { key, row }
            })
        )
        for (const { key, row } of productResults) {
            if (!row) continue
            products[key as AiCategory] = {
                image_url: row.image_url,
                model: row.model ?? "",
                variant_title: row.variant_title ?? null,
            }
        }

        // Build image_urls: template first, then only selected products (no placeholder for unselected)
        const image_urls: string[] = [templateUrl]
        for (const key of AI_CATEGORIES) {
            if (products[key]) {
                image_urls.push(products[key]!.image_url)
            }
        }

        const prompt = buildCombinedPrompt(products)
        console.log("generate-from-vibe: single fal submit", { imageCount: image_urls.length, promptLen: prompt.length })

        let request_id: string
        try {
            const submitResult = (await fal.queue.submit(MODEL, {
                input: { prompt, image_urls, resolution: "4K" },
            })) as { request_id?: string }
            request_id = submitResult?.request_id ?? ""
            if (!request_id) throw new Error("fal.queue.submit returned no request_id")
        } catch (e) {
            console.error("generate-from-vibe: fal submit failed", e)
            throw e
        }
        console.log("generate-from-vibe: waiting for fal result", request_id)
        const currentImageUrl = await waitForFalResult(request_id)
        console.log("generate-from-vibe: got result")

        console.log("generate-from-vibe: fetching result image...")
        const imageRes = await fetch(currentImageUrl)
        if (!imageRes.ok) throw new Error(`Failed to fetch result image: ${imageRes.status}`)
        const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
        const ts = Date.now()
        const storagePath = `user/${user.id}/${ts}.png`
        console.log("generate-from-vibe: uploading to storage...")
        const { error: uploadErr } = await adminDb.storage
            .from("setups")
            .upload(storagePath, imageBuffer, { contentType: "image/png" })

        if (uploadErr) {
            throw new Error(`Storage upload failed: ${uploadErr.message}`)
        }

        const {
            data: { publicUrl: imageUrl },
        } = adminDb.storage.from("setups").getPublicUrl(storagePath)

        // Generate WebP thumbnail (800px wide)
        let thumbnailUrl = imageUrl
        try {
            const thumbBuffer = await sharp(imageBuffer)
                .resize(800, null, { withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer()
            const thumbPath = `user/${user.id}/thumb/${ts}.webp`
            const { error: thumbErr } = await adminDb.storage
                .from("setups")
                .upload(thumbPath, thumbBuffer, { contentType: "image/webp" })
            if (!thumbErr) {
                thumbnailUrl = adminDb.storage.from("setups").getPublicUrl(thumbPath).data.publicUrl
                console.log("generate-from-vibe: thumbnail created", (thumbBuffer.length / 1024).toFixed(0) + "KB")
            }
        } catch (thumbError) {
            console.warn("generate-from-vibe: thumbnail generation failed, using original", thumbError)
        }

        // Save all selections in peripheral_zones
        const peripheralZones: Record<string, string> = {}
        for (const key of AI_CATEGORIES) {
            if (allSelections[key]) peripheralZones[key] = allSelections[key]!
        }

        const { data: setup, error: insertErr } = await adminDb
            .from("setups")
            .insert({
                user_id: user.id,
                title: "Vibe Setup",
                image_url: imageUrl,
                thumbnail_url: thumbnailUrl,
                source: "user",
                is_public: false,
                categories: [vibe_id],
                peripheral_zones: peripheralZones,
            })
            .select("id")
            .single()

        if (insertErr) {
            throw new Error(`DB insert failed: ${insertErr.message}`)
        }

        return NextResponse.json({ setup_id: setup.id, image_url: imageUrl })
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        console.error("generate-from-vibe error:", msg, error)
        return NextResponse.json(
            { error: "Setup oluşturulamadı", message: msg },
            { status: 500 }
        )
    }
}
