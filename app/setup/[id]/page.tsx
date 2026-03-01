import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { unstable_cache } from "next/cache"
import { SetupDetailClient } from "@/components/setup/setup-detail-client"
import { notFound } from "next/navigation"

const getProducts = unstable_cache(
    async () => {
        const adminDb = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const { data } = await adminDb
            .from('wraith_products')
            .select('id, category, model, vendor, price, compare_at_price, image_url, page_url')
            .eq('available', true)
        return data || []
    },
    ["setup-detail-products"],
    { revalidate: 600 }
)

export default async function SetupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const adminDb = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { id } = await params

    // Get current user session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id || null

    const [setupResult, products] = await Promise.all([
        adminDb
            .from('setups')
            .select('id, title, image_url, thumbnail_url, peripheral_zones, categories, like_count, try_count, user_id, is_public')
            .eq('id', id)
            .single(),
        getProducts(),
    ])

    if (setupResult.error || !setupResult.data) {
        notFound()
    }

    // Increment view count (fire-and-forget)
    adminDb.rpc('increment_view_count', { p_setup_id: id }).then(() => {})

    // Resolve peripheral_zones product IDs to full product objects
    const setupProducts: typeof products = []
    const pz = setupResult.data.peripheral_zones
    if (pz && typeof pz === 'object' && !Array.isArray(pz)) {
        const productMap = new Map(products.map((p) => [p.id, p]))
        for (const [category, productId] of Object.entries(pz as Record<string, string>)) {
            if (productId && productMap.has(productId)) {
                const p = productMap.get(productId)!
                setupProducts.push({ ...p, category })
            }
        }
    }

    return (
        <div className="flex flex-col md:flex-row md:h-[calc(100vh-4rem)] bg-masam-black">
            <SetupDetailClient
                setup={setupResult.data}
                products={products}
                setupProducts={setupProducts}
                currentUserId={currentUserId}
            />
        </div>
    )
}
