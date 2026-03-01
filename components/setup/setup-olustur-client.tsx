"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { getCategoryLabelTr } from "@/lib/categories"
import { getCached, setCache } from "@/lib/cache"
import { formatPrice } from "@/lib/format-price"
import { WizardProductSkeleton } from "@/components/ui/skeleton"

const WIZARD_ORDER = ["mouse", "mousepad", "keyboard", "headset", "microphone", "chair"] as const
type WizardStep = (typeof WIZARD_ORDER)[number]

const VIBE_LABELS: Record<string, { emoji: string; name: string }> = {
    shadow_realm: { emoji: "🖤", name: "Gölge Diyarı" },
    frost_kingdom: { emoji: "🤍", name: "Buz Krallığı" },
    neon_arcade: { emoji: "🌈", name: "Neon Atari Salonu" },
    cyber_district: { emoji: "💜", name: "Siber Bölge" },
    sakura_garden: { emoji: "🌸", name: "Sakura Bahçesi" },
    dragon_forge: { emoji: "🔥", name: "Ejder Ocağı" },
    enchanted_grove: { emoji: "🌿", name: "Büyülü Koru" },
    command_bridge: { emoji: "🎙️", name: "Komuta Köprüsü" },
    sunset_lounge: { emoji: "🌅", name: "Gün Batımı" },
    phantom_vault: { emoji: "👻", name: "Hayalet Kasası" },
}

type Selections = Record<WizardStep, string | null>

const initialSelections: Selections = {
    mouse: null,
    mousepad: null,
    keyboard: null,
    headset: null,
    microphone: null,
    chair: null,
}

const PAGE_SIZE = 20

interface Product {
    id: string
    model: string
    image_url: string
    category: string
    variant_title: string | null
    primary_vibe?: string | null
    price?: number | null
}

function ProductCard({ product, highlight, isSelected, onSelect }: {
    product: Product
    highlight?: boolean
    isSelected: boolean
    onSelect: (id: string) => void
}) {
    return (
        <button
            type="button"
            onClick={() => onSelect(product.id)}
            className={`relative w-full min-w-[160px] max-w-[180px] rounded-xl border overflow-hidden transition-all text-left flex flex-col ${
                isSelected
                    ? "border-white ring-2 ring-white shadow-lg"
                    : "border-masam-border-subtle hover:border-masam-border-default hover:shadow-md"
            } ${highlight ? "bg-masam-elevated/80" : "bg-masam-surface"}`}
        >
            {highlight && (
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-white/90 text-masam-black text-[10px] font-semibold uppercase tracking-wide">
                    Vibe'ına uygun
                </div>
            )}
            <div className="relative w-full aspect-square bg-white/5">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.model}
                        fill
                        className="object-contain p-3"
                        sizes="180px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-masam-text-muted text-[12px]">
                        Görsel yok
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-0.5">
                <span className="truncate text-[13px] text-masam-text-primary font-medium leading-tight">
                    {product.model}
                </span>
                {product.price != null && product.price > 0 && (
                    <span className="text-[12px] text-masam-text-muted">
                        {formatPrice(product.price)}
                    </span>
                )}
            </div>
        </button>
    )
}

interface SetupOlusturClientProps {
    userVibe: string
}

export function SetupOlusturClient({ userVibe }: SetupOlusturClientProps) {
    const [mode, setMode] = useState<"choice" | "wizard" | "generating">("choice")
    const [wizardStep, setWizardStep] = useState(0)
    const [selections, setSelections] = useState<Selections>({ ...initialSelections })
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [otherPage, setOtherPage] = useState(0)

    const supabaseRef = useRef(createClient())
    const currentCategory = WIZARD_ORDER[wizardStep]
    const vibeInfo = VIBE_LABELS[userVibe] ?? { emoji: "✨", name: userVibe }

    // Reset pagination when step changes
    useEffect(() => {
        setOtherPage(0)
    }, [wizardStep])

    useEffect(() => {
        if (mode !== "wizard" || !currentCategory) return

        const cacheKey = `products_${currentCategory}`
        const cached = getCached<Product[]>(cacheKey)
        if (cached) {
            const sorted = [...cached].sort((a, b) => {
                const aMatch = a.primary_vibe === userVibe ? 1 : 0
                const bMatch = b.primary_vibe === userVibe ? 1 : 0
                if (bMatch !== aMatch) return bMatch - aMatch
                return (a.model || "").localeCompare(b.model || "")
            })
            setProducts(sorted)
            setLoading(false)
            return
        }

        setLoading(true)
        const supabase = supabaseRef.current
        supabase
            .from("wraith_products")
            .select("id, model, image_url, category, variant_title, primary_vibe, price")
            .eq("available", true)
            .eq("category", currentCategory)
            .order("created_at", { ascending: false })
            .then(({ data, error: err }) => {
                if (err) {
                    setError("Ürünler yüklenemedi.")
                    setLoading(false)
                    return
                }
                const list = (data as Product[]) ?? []
                setCache(cacheKey, list, 10 * 60 * 1000) // 10 min
                setProducts(
                    [...list].sort((a, b) => {
                        const aMatch = a.primary_vibe === userVibe ? 1 : 0
                        const bMatch = b.primary_vibe === userVibe ? 1 : 0
                        if (bMatch !== aMatch) return bMatch - aMatch
                        return (a.model || "").localeCompare(b.model || "")
                    })
                )
                setLoading(false)
            })
    }, [mode, wizardStep, currentCategory, userVibe])

    const forVibe = useMemo(() => products.filter((p) => p.primary_vibe === userVibe), [products, userVibe])
    const other = useMemo(() => products.filter((p) => p.primary_vibe !== userVibe), [products, userVibe])

    // Paginated other products
    const otherPageCount = Math.max(1, Math.ceil(other.length / PAGE_SIZE))
    const otherPaged = useMemo(() => other.slice(otherPage * PAGE_SIZE, (otherPage + 1) * PAGE_SIZE), [other, otherPage])

    // All products across categories for pill display
    const [allProducts, setAllProducts] = useState<Record<string, Product>>({})
    useEffect(() => {
        for (const p of products) {
            setAllProducts((prev) => (prev[p.id] ? prev : { ...prev, [p.id]: p }))
        }
    }, [products])

    const handleSelect = useCallback((productId: string) => {
        setSelections((prev) => {
            const wasSelected = prev[currentCategory] === productId
            return { ...prev, [currentCategory]: wasSelected ? null : productId }
        })
        // Auto-advance to next step after a short delay for visual feedback
        setTimeout(() => {
            setWizardStep((s) => (s < WIZARD_ORDER.length - 1 ? s + 1 : s))
        }, 250)
    }, [currentCategory])

    const handleSkip = () => {
        setSelections((prev) => ({ ...prev, [currentCategory]: null }))
        if (wizardStep < WIZARD_ORDER.length - 1) {
            setWizardStep((s) => s + 1)
        }
    }

    const handleCreate = async () => {
        setMode("generating")
        setError(null)
        try {
            const res = await fetch("/api/setup/generate-from-vibe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vibe_id: userVibe,
                    selections,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || data.message || "Oluşturulamadı")
            if (data.setup_id) {
                window.location.href = `/setup/${data.setup_id}`
                return
            }
            throw new Error("Sunucu yanıt hatası")
        } catch (e) {
            setError(e instanceof Error ? e.message : "Setup oluşturulamadı.")
            setMode("wizard")
        }
    }

    const selectedCount = Object.values(selections).filter(Boolean).length

    if (mode === "choice") {
        return (
            <div className="max-w-[800px] mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-[30px] font-medium tracking-tight text-masam-text-primary mb-2">
                        Setup Oluştur
                    </h1>
                    <p className="text-[15px] text-masam-text-muted">
                        Mevcut setup'ını geliştir veya vibe'ına göre sıfırdan oluştur.
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Link
                        href="/yukle"
                        className="group block p-8 rounded-2xl border border-masam-border-subtle bg-masam-elevated hover:border-masam-border-strong hover:bg-masam-hover transition-all text-left"
                    >
                        <div className="w-12 h-12 rounded-xl bg-masam-surface flex items-center justify-center mb-5 group-hover:bg-masam-hover transition-colors">
                            <svg className="w-6 h-6 text-masam-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-[20px] font-medium text-masam-text-primary mb-2">
                            Setup'ım var, geliştirmek istiyorum
                        </h2>
                        <p className="text-[14px] text-masam-text-muted leading-relaxed">
                            Masanın fotoğrafını yükle, AI ile ekipmanları tespit et ve ürünleri dene.
                        </p>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMode("wizard")}
                        className="group block p-8 rounded-2xl border border-masam-border-subtle bg-masam-elevated hover:border-masam-border-strong hover:bg-masam-hover transition-all text-left w-full"
                    >
                        <div className="w-12 h-12 rounded-xl bg-masam-surface flex items-center justify-center mb-5 group-hover:bg-masam-hover transition-colors">
                            <span className="text-2xl">{vibeInfo.emoji}</span>
                        </div>
                        <h2 className="text-[20px] font-medium text-masam-text-primary mb-2">
                            Setup'ım yok / Vibe'ına göre oluştur
                        </h2>
                        <p className="text-[14px] text-masam-text-muted leading-relaxed">
                            Ürünlerini seç; <span className="text-masam-text-secondary">{vibeInfo.name}</span> şablonuna yerleştirilmiş setup'ını oluştur.
                        </p>
                    </button>
                </div>
            </div>
        )
    }

    if (mode === "generating") {
        return (
            <div className="max-w-[480px] mx-auto flex flex-col items-center justify-center py-20 gap-6">
                <div className="w-14 h-14 rounded-full border-2 border-masam-border-strong border-t-transparent animate-spin" />
                <p className="text-[16px] font-medium text-masam-text-primary">Setup oluşturuluyor…</p>
                <p className="text-[13px] text-masam-text-muted text-center">
                    Seçtiğin ürünler vibe şablonuna yerleştiriliyor. Bu birkaç on saniye sürebilir.
                </p>
                {error && (
                    <p className="text-[14px] text-masam-error mt-2">{error}</p>
                )}
            </div>
        )
    }

    // Wizard
    const stepLabel = getCategoryLabelTr(currentCategory)

    return (
        <div className="max-w-[1100px] mx-auto pb-24">
            <button
                type="button"
                onClick={() => (wizardStep > 0 ? setWizardStep((s) => s - 1) : setMode("choice"))}
                className="text-[14px] text-masam-text-muted hover:text-masam-text-primary transition-colors mb-6"
            >
                ← Geri
            </button>

            <div className="flex items-center gap-4 mb-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-masam-elevated border border-masam-border-subtle text-[13px] text-masam-text-primary">
                    <span>{vibeInfo.emoji}</span>
                    <span>{vibeInfo.name}</span>
                </span>
                <span className="text-[13px] text-masam-text-muted">
                    Adım {wizardStep + 1} / {WIZARD_ORDER.length}
                </span>
            </div>
            <h1 className="text-[26px] font-medium tracking-tight text-masam-text-primary mb-1">
                {stepLabel} seç
            </h1>
            <p className="text-[14px] text-masam-text-muted mb-8">
                Bir ürün seç veya bu adımı geç. Senin vibe'ına uygun ürünler önce listelenir.
            </p>

            <div className="flex gap-2 mb-6">
                {WIZARD_ORDER.map((step, i) => (
                    <button
                        key={step}
                        type="button"
                        onClick={() => setWizardStep(i)}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= wizardStep ? "bg-masam-border-strong" : "bg-masam-border-subtle"
                        }`}
                    />
                ))}
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-masam-error-muted/20 border border-masam-error text-[14px] text-masam-error">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-start gap-4 mb-8">
                <button
                    type="button"
                    onClick={handleSkip}
                    className="px-5 py-2.5 rounded-xl border border-masam-border-default text-masam-text-secondary hover:bg-masam-hover hover:text-masam-text-primary transition-colors text-[14px] font-medium shrink-0"
                >
                    Bu adımı geç
                </button>
            </div>

            {/* Loading skeleton */}
            {loading && <WizardProductSkeleton count={6} />}

            {/* Vibe-matched products (no pagination, usually few) */}
            {!loading && forVibe.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-[12px] font-semibold uppercase tracking-wider text-masam-text-muted mb-4">
                        Senin vibe'ına uygun
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {forVibe.map((product) => (
                            <ProductCard key={product.id} product={product} highlight isSelected={selections[currentCategory] === product.id} onSelect={handleSelect} />
                        ))}
                    </div>
                </section>
            )}

            {/* Other products with pagination */}
            {!loading && <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[12px] font-semibold uppercase tracking-wider text-masam-text-muted">
                        {forVibe.length > 0 ? "Diğer ürünler" : "Ürünler"}
                        {other.length > PAGE_SIZE && (
                            <span className="ml-2 font-normal normal-case">({other.length} ürün)</span>
                        )}
                    </h2>
                    {otherPageCount > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setOtherPage((p) => Math.max(0, p - 1))}
                                disabled={otherPage === 0}
                                className="px-2.5 py-1 rounded-lg border border-masam-border-subtle text-[13px] text-masam-text-secondary hover:bg-masam-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                ←
                            </button>
                            <span className="text-[12px] text-masam-text-muted">
                                {otherPage + 1} / {otherPageCount}
                            </span>
                            <button
                                type="button"
                                onClick={() => setOtherPage((p) => Math.min(otherPageCount - 1, p + 1))}
                                disabled={otherPage >= otherPageCount - 1}
                                className="px-2.5 py-1 rounded-lg border border-masam-border-subtle text-[13px] text-masam-text-secondary hover:bg-masam-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-4">
                    {otherPaged.map((product) => (
                        <ProductCard key={product.id} product={product} isSelected={selections[currentCategory] === product.id} onSelect={handleSelect} />
                    ))}
                </div>
                {other.length === 0 && forVibe.length === 0 && (
                    <p className="text-[14px] text-masam-text-muted py-8 text-center">Bu kategoride ürün bulunamadı.</p>
                )}
            </section>}

            {/* Inline compact bar - fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-masam-border-subtle bg-masam-surface/95 backdrop-blur-md">
                <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center gap-3">
                    {/* Step indicators */}
                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                        {WIZARD_ORDER.map((step, i) => (
                            <button
                                key={step}
                                type="button"
                                onClick={() => setWizardStep(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    i === wizardStep
                                        ? "bg-white"
                                        : selections[step]
                                            ? "bg-masam-border-strong"
                                            : "bg-masam-border-subtle"
                                }`}
                                title={getCategoryLabelTr(step)}
                            />
                        ))}
                    </div>

                    {/* Selected product pills */}
                    <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0">
                        {WIZARD_ORDER.map((step) => {
                            const productId = selections[step]
                            if (!productId) return null
                            const product = allProducts[productId]
                            return (
                                <button
                                    key={step}
                                    type="button"
                                    onClick={() => setWizardStep(WIZARD_ORDER.indexOf(step))}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-masam-elevated border border-masam-border-subtle text-[12px] text-masam-text-primary shrink-0 hover:border-masam-border-default transition-colors"
                                >
                                    <span className="text-masam-text-muted">{getCategoryLabelTr(step)}:</span>
                                    <span className="truncate max-w-[100px]">{product?.model ?? "..."}</span>
                                    <span
                                        className="ml-0.5 text-masam-text-muted hover:text-masam-text-primary"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelections((prev) => ({ ...prev, [step]: null }))
                                        }}
                                    >
                                        ×
                                    </span>
                                </button>
                            )
                        })}
                        {selectedCount === 0 && (
                            <span className="text-[13px] text-masam-text-muted">Henüz ürün seçilmedi</span>
                        )}
                    </div>

                    {/* Create button */}
                    {selectedCount > 0 && (
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={loading}
                            className="px-6 py-2 rounded-xl bg-white text-masam-black text-[14px] font-medium hover:bg-white/90 transition-colors disabled:opacity-50 shrink-0"
                        >
                            Setup'ı oluştur ({selectedCount})
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
