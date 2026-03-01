import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { CategoryDropdown } from "@/components/urunler/category-dropdown"
import { getCategoryLabelTr } from "@/lib/categories"
import { ProductGridSkeleton } from "@/components/ui/skeleton"

export const revalidate = 3600

const tryCurrencyFormatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function ProductList({ currentCategory }: { currentCategory: string | null }) {
    const supabase = await createClient()

    let query = supabase
        .from("wraith_products")
        .select("id, model, vendor, category, image_url, page_url, price")
        .eq("available", true)
        .order("created_at", { ascending: false })

    if (currentCategory) {
        query = query.eq("category", currentCategory)
    }

    const { data: products, error } = await query

    if (error) {
        return <div className="text-masam-text-muted">Ürünler yüklenirken hata oluştu.</div>
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products?.map((product) => (
                <a
                    key={product.id}
                    href={product.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block focus:outline-none focus-visible:ring-1 focus-visible:ring-masam-text-primary"
                >
                    <div className="bg-masam-elevated border border-masam-border-subtle hover:border-masam-border-strong rounded-sm overflow-hidden transition-all duration-300 flex flex-col h-full">
                        <div className="relative w-full aspect-square bg-white flex items-center justify-center p-6">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.model}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="text-masam-text-muted">Görsel Yok</div>
                            )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="text-[11px] text-masam-text-muted font-mono uppercase tracking-wider mb-2">
                                    {product.vendor || "Wraith"} • {getCategoryLabelTr(product.category)}
                                </div>
                                <h3 className="text-[15px] font-medium text-masam-text-primary line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors">
                                    {product.model}
                                </h3>
                            </div>
                            <div className="mt-4 pt-4 border-t border-masam-border-subtle flex items-center justify-between">
                                {product.price ? (
                                    <span className="font-mono text-[14px] text-masam-text-primary">
                                        {tryCurrencyFormatter.format(product.price)}
                                    </span>
                                ) : (
                                    <span className="text-masam-text-muted text-[13px]">Stokta Yok</span>
                                )}
                                <div className="w-8 h-8 rounded-full bg-masam-hover flex items-center justify-center group-hover:bg-masam-text-primary transition-colors text-masam-text-primary group-hover:text-masam-black">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    )
}

export default async function UrunlerPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()
    const params = await searchParams
    const categoryParam = params?.category as string | undefined
    const currentCategory = categoryParam && categoryParam.trim() !== "" ? categoryParam : null

    // Fetch categories separately (lightweight query)
    const { data: catRows } = await supabase
        .from("wraith_products")
        .select("category")
        .eq("available", true)

    const categories = [...new Set((catRows ?? []).map((r) => r.category).filter(Boolean))] as string[]

    return (
        <div className="min-h-screen bg-masam-black flex flex-col pt-24 px-6 lg:px-12 pb-24">
            <div className="max-w-[1600px] w-full mx-auto mb-12 flex flex-col md:flex-row items-baseline justify-between gap-6 border-b border-masam-border-subtle pb-6">
                <div>
                    <h1 className="text-[32px] font-medium tracking-tight text-masam-text-primary mb-2">Ürünler</h1>
                    <p className="text-masam-text-muted text-[15px]">Tüm Wraith modellerini inceleyin ve setup'ınızda hayal edin.</p>
                </div>
                {categories.length > 0 && (
                    <CategoryDropdown categories={categories} currentCategory={currentCategory} />
                )}
            </div>

            <div className="max-w-[1600px] w-full mx-auto">
                <Suspense fallback={<ProductGridSkeleton count={10} />}>
                    <ProductList currentCategory={currentCategory} />
                </Suspense>
            </div>
        </div>
    )
}
