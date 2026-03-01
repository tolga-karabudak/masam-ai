import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export const runtime = "nodejs"
export const maxDuration = 30

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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const {
            result_image_url,
            setup_id,
            title,
            categories,
            peripheral_zones,
        } = body as {
            result_image_url: string
            setup_id: string
            title?: string
            categories?: string[]
            peripheral_zones?: Record<string, string>
        }

        if (!result_image_url || !setup_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const adminDb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Download the fal.ai result image (webp) and upload as PNG to Supabase storage
        const imageRes = await fetch(result_image_url)
        if (!imageRes.ok) {
            return NextResponse.json({ error: "Failed to fetch result image" }, { status: 500 })
        }
        const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
        const storagePath = `user/${user.id}/${Date.now()}.png`

        const { error: uploadErr } = await adminDb.storage
            .from("setups")
            .upload(storagePath, imageBuffer, { contentType: "image/png" })

        if (uploadErr) {
            return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 })
        }

        const { data: { publicUrl: permanentImageUrl } } = adminDb.storage
            .from("setups")
            .getPublicUrl(storagePath)

        // Create a new public setup with the AI result
        const { data: newSetup, error: insertErr } = await adminDb
            .from("setups")
            .insert({
                user_id: user.id,
                title: title || "AI Setup",
                image_url: permanentImageUrl,
                thumbnail_url: permanentImageUrl,
                source: "user",
                is_public: true,
                categories: categories || [],
                peripheral_zones: peripheral_zones || {},
            })
            .select("id")
            .single()

        if (insertErr) {
            return NextResponse.json({ error: `DB insert failed: ${insertErr.message}` }, { status: 500 })
        }

        return NextResponse.json({ success: true, setup_id: newSetup.id, image_url: permanentImageUrl })
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        console.error("Share setup error:", msg)
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
