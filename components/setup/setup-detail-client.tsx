"use client"

import React, { useState, useRef, useEffect } from "react"
import { SetupViewer } from "./setup-viewer"
import { ProductPanel, type Product } from "./product-panel"
import { BeforeAfterSlider } from "./before-after-slider"
import { ProductListCard, type ListProduct } from "./product-list-card"
import { createClient } from "@/lib/supabase/client"

interface SetupDetailClientProps {
    setup: any
    products: Product[]
    setupProducts?: Product[]
    currentUserId: string | null
}

export function SetupDetailClient({ setup, products, setupProducts = [], currentUserId }: SetupDetailClientProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    const [resultImage, setResultImage] = useState<string | null>(null)
    const [baseImage, setBaseImage] = useState<string>(setup.image_url)
    const [showComparison, setShowComparison] = useState(false)
    const [appliedProducts, setAppliedProducts] = useState<ListProduct[]>([])
    const [isPublic, setIsPublic] = useState<boolean>(setup.is_public ?? false)
    const [isSharing, setIsSharing] = useState(false)

    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => {
        return () => { abortRef.current?.abort() }
    }, [])

    const isOwner = currentUserId && setup.user_id === currentUserId

    // Build merged peripheral_zones for share API
    const buildPeripheralZones = () => {
        const zones: Record<string, string> = {}
        for (const p of setupProducts) {
            zones[p.category] = p.id
        }
        for (const p of appliedProducts) {
            zones[p.category] = p.id
        }
        return zones
    }

    const handleApply = async (selections: Record<string, string | null>) => {
        const selected: Record<string, string> = {}
        for (const [cat, pid] of Object.entries(selections)) {
            if (pid) selected[cat] = pid
        }
        if (Object.keys(selected).length === 0) return

        // Merge: new selections override, unchanged categories keep original products
        const appliedMap = new Map<string, ListProduct>()
        for (const p of setupProducts) {
            appliedMap.set(p.category, p)
        }
        for (const [cat, pid] of Object.entries(selected)) {
            const p = products.find((pr) => pr.id === pid)
            if (p) appliedMap.set(cat, { ...p, category: cat } as ListProduct)
        }
        setAppliedProducts(Array.from(appliedMap.values()))

        setIsProcessing(true)
        setElapsedSeconds(0)

        const controller = new AbortController()
        abortRef.current = controller
        const signal = controller.signal

        const startTime = Date.now()
        const timer = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
        }, 1000)

        try {
            const submitRes = await fetch("/api/customize/inpaint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    setup_id: setup.id,
                    selections: selected,
                    base_image_url: baseImage,
                }),
            })

            const submitData = await submitRes.json()
            if (!submitRes.ok) throw new Error(submitData.message || "Failed to start processing")

            const { request_id, setup_id } = submitData

            const maxAttempts = 40
            for (let i = 0; i < maxAttempts; i++) {
                if (signal.aborted) return
                await new Promise((r) => setTimeout(r, 3000))
                if (signal.aborted) return

                const pollRes = await fetch(
                    `/api/customize/inpaint?request_id=${request_id}&setup_id=${setup_id}`,
                    { signal }
                )
                const pollData = await pollRes.json()

                if (pollData.status === "done") {
                    setResultImage(pollData.result_image_url)
                    setShowComparison(true)
                    return
                }

                if (pollData.status === "failed") {
                    throw new Error("AI processing failed")
                }
            }

            throw new Error("Processing timed out after 2 minutes")
        } catch (error) {
            if (!signal.aborted) {
                console.error("Failed to apply products:", error)
                alert("Yapay zeka işlemi sırasında bir hata oluştu.")
            }
        } finally {
            clearInterval(timer)
            setIsProcessing(false)
            setElapsedSeconds(0)
        }
    }

    const handleCloseComparison = (keepResult: boolean) => {
        setShowComparison(false)
        if (keepResult && resultImage) {
            setBaseImage(resultImage)
        }
    }

    // Simple share: just toggle is_public on existing setup (owner only)
    const handleSimpleShare = async () => {
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('setups')
                .update({ is_public: true })
                .eq('id', setup.id)

            if (error) throw error
            setIsPublic(true)
        } catch (e) {
            console.error("Share failed:", e)
            alert("Paylaşım sırasında hata oluştu.")
        }
    }

    // Share AI result: download webp, upload as PNG, create new public setup
    const handleShareResult = async () => {
        if (!resultImage || isSharing) return
        setIsSharing(true)

        try {
            const res = await fetch("/api/setup/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    result_image_url: resultImage,
                    setup_id: setup.id,
                    title: setup.title,
                    categories: setup.categories || [],
                    peripheral_zones: buildPeripheralZones(),
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Share failed")

            return true
        } catch (e) {
            console.error("Share result failed:", e)
            alert("Paylaşım sırasında hata oluştu.")
            return false
        } finally {
            setIsSharing(false)
        }
    }

    return (
        <>
            <div className="flex-1 relative h-full flex flex-col">
                <div className="flex-1 relative">
                    <SetupViewer
                        imageUrl={baseImage}
                        title={setup.title}
                        isProcessing={isProcessing}
                        elapsedSeconds={elapsedSeconds}
                    />
                </div>

                {/* Product list for setup with peripheral_zones */}
                {setupProducts.length > 0 && !isProcessing && (
                    <div className="p-4 border-t border-masam-border-subtle bg-masam-black">
                        <ProductListCard products={setupProducts} compact />
                    </div>
                )}

                {/* Share button for owner of non-public setup (no AI result) */}
                {isOwner && !isPublic && (
                    <div className="px-4 pb-4">
                        <button
                            onClick={handleSimpleShare}
                            className="w-full py-3 rounded-xl bg-white text-masam-black text-[14px] font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            Feed'de Paylaş
                        </button>
                    </div>
                )}

                {isOwner && isPublic && (
                    <div className="px-4 pb-4">
                        <div className="w-full py-3 rounded-xl bg-masam-elevated border border-masam-border-subtle text-masam-text-muted text-[14px] text-center">
                            Feed'de paylaşıldı
                        </div>
                    </div>
                )}
            </div>

            <div className="w-[380px] h-full flex-shrink-0 relative overflow-hidden">
                <ProductPanel
                    products={products}
                    onApply={handleApply}
                    isProcessing={isProcessing}
                />
            </div>

            {showComparison && resultImage && (
                <BeforeAfterSlider
                    beforeImage={baseImage}
                    afterImage={resultImage}
                    onClose={() => handleCloseComparison(true)}
                    products={appliedProducts}
                    onShare={handleShareResult}
                    isSharing={isSharing}
                />
            )}
        </>
    )
}
