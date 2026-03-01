/**
 * Creates vibe_templates bucket, uploads ../vibe_template/*.png to Supabase Storage,
 * and updates vibes.template_url. Run from project root: node scripts/seed-vibe-templates.js
 */
require("dotenv").config({ path: ".env.local" })
const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)
const BUCKET = "vibe_templates"

const templateDir =
    fs.existsSync(path.join(process.cwd(), "vibe_template"))
        ? path.join(process.cwd(), "vibe_template")
        : path.join(process.cwd(), "..", "vibe_template")
if (!fs.existsSync(templateDir)) {
    console.error("Template dir not found. Tried:", path.join(process.cwd(), "vibe_template"), "and", path.join(process.cwd(), "..", "vibe_template"))
    process.exit(1)
}
console.log("Using template dir:", templateDir)

async function main() {
    const files = fs.readdirSync(templateDir).filter((f) => f.endsWith(".png"))
    if (files.length === 0) {
        console.error("No .png files in", templateDir)
        process.exit(1)
    }

    const { data: buckets } = await supabase.storage.listBuckets()
    const exists = buckets?.some((b) => b.name === BUCKET)
    if (!exists) {
        const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
        if (error) {
            console.error("Failed to create bucket:", error.message)
            process.exit(1)
        }
        console.log("Created bucket:", BUCKET)
    } else {
        console.log("Bucket already exists:", BUCKET)
    }

    console.log("Checking vibes.template_url column...")
    const { error: colError } = await supabase.from("vibes").select("template_url").limit(1)
    if (colError) {
        console.error("vibes error:", colError.message)
        console.error("Add the column in Supabase Dashboard → SQL Editor:")
        console.error("  ALTER TABLE public.vibes ADD COLUMN IF NOT EXISTS template_url text;")
        process.exit(1)
    }
    console.log("Column OK, uploading", files.length, "files...")

    for (const file of files) {
        const filePath = path.join(templateDir, file)
        const buffer = fs.readFileSync(filePath)
        const { error } = await supabase.storage.from(BUCKET).upload(file, buffer, {
            contentType: "image/png",
            upsert: true,
        })
        if (error) {
            console.error("Upload failed", file, error.message)
            continue
        }
        console.log("Uploaded:", file)
    }

    console.log("Updating vibes.template_url...")
    for (const file of files) {
        const vibeId = file.replace(/\.png$/i, "")
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(file)
        const templateUrl = data.publicUrl
        const { error } = await supabase.from("vibes").update({ template_url: templateUrl }).eq("id", vibeId)
        if (error) {
            console.warn("Update vibes failed for", vibeId, error.message)
            continue
        }
        console.log("Updated vibes.template_url for", vibeId)
    }

    console.log("Done.")
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
