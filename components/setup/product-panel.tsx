"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { getCategoryLabelTr } from "@/lib/categories"
import { formatPrice } from "@/lib/format-price"

const CATEGORIES = ["mouse", "mousepad", "keyboard", "headset", "microphone", "chair"] as const

export type Product = {
    id: string
    category: string
    model: string
    vendor: string
    price: number
    compare_at_price?: number
    image_url: string
    page_url?: string
}

type Selections = Record<string, string | null>

const PAGE_SIZE = 10

interface ProductPanelProps {
    products: Product[]
    onApply: (selections: Selections) => void
    isProcessing: boolean
}

export function ProductPanel({
    products,
    onApply,
    isProcessing,
}: ProductPanelProps) {
    const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0])
    const [selections, setSelections] = useState<Selections>(() => {
        const init: Selections = {}
        for (const cat of CATEGORIES) init[cat] = null
        return init
    })
    const [page, setPage] = useState(0)

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat)
        setPage(0)
    }

    const handleSelect = (productId: string) => {
        setSelections((prev) => ({
            ...prev,
            [activeCategory]: prev[activeCategory] === productId ? null : productId,
        }))
    }

    const filtered = useMemo(
        () => products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase()),
        [products, activeCategory]
    )

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paged = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page])

    const selectedCount = Object.values(selections).filter(Boolean).length

    // Build a lookup for selected product info (for pills)
    const productMap = useMemo(() => {
        const map: Record<string, Product> = {}
        for (const p of products) map[p.id] = p
        return map
    }, [products])

    return (
        <div className="h-full flex flex-col border-l border-masam-border-subtle bg-masam-black">
            {/* Category Tabs */}
            <div className="p-4 border-b border-masam-border-subtle">
                <h2 className="text-[16px] font-medium text-masam-text-primary mb-3">Ürün Seç</h2>
                <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => {
                        const hasSelection = !!selections[cat]
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors relative ${
                                    activeCategory === cat
                                        ? "bg-white text-masam-black"
                                        : hasSelection
                                            ? "bg-masam-elevated text-masam-text-primary border border-masam-border-strong"
                                            : "bg-masam-elevated text-masam-text-muted hover:text-masam-text-primary hover:bg-masam-hover border border-masam-border-subtle"
                                }`}
                            >
                                {getCategoryLabelTr(cat)}
                                {hasSelection && activeCategory !== cat && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Selected Pills Summary */}
            {selectedCount > 0 && (
                <div className="px-4 py-2.5 border-b border-masam-border-subtle flex flex-wrap gap-1.5 items-center">
                    {CATEGORIES.map((cat) => {
                        const pid = selections[cat]
                        if (!pid) return null
                        const p = productMap[pid]
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryChange(cat)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-masam-elevated border border-masam-border-subtle text-[11px] text-masam-text-primary hover:border-masam-border-default transition-colors"
                            >
                                <span className="text-masam-text-muted">{getCategoryLabelTr(cat)}:</span>
                                <span className="truncate max-w-[80px]">{p?.model ?? "..."}</span>
                                <span
                                    className="ml-0.5 text-masam-text-muted hover:text-masam-text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelections((prev) => ({ ...prev, [cat]: null }))
                                    }}
                                >
                                    ×
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[50vh] md:max-h-none">
                {paged.length === 0 ? (
                    <div className="text-center py-12 text-masam-text-muted text-[13px]">
                        Bu kategoride ürün bulunamadı.
                    </div>
                ) : (
                    paged.map((product) => {
                        const isSelected = selections[activeCategory] === product.id
                        return (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => handleSelect(product.id)}
                                className={`w-full flex border p-3 gap-3 transition-colors rounded-xl text-left ${
                                    isSelected
                                        ? "border-white ring-1 ring-white bg-masam-elevated"
                                        : "border-masam-border-subtle bg-masam-elevated hover:bg-masam-hover"
                                }`}
                            >
                                <div className="w-14 h-14 bg-white rounded-lg relative flex-shrink-0 overflow-hidden">
                                    <Image
                                        src={product.image_url}
                                        alt={product.model}
                                        fill
                                        className="object-contain p-1"
                                        sizes="56px"
                                    />
                                </div>

                                <div className="flex flex-col flex-1 justify-between min-w-0">
                                    <div>
                                        <div className="text-[10px] text-masam-text-muted uppercase tracking-wider mb-0.5">
                                            {product.vendor}
                                        </div>
                                        <h4 className="text-[13px] font-medium text-masam-text-primary leading-tight line-clamp-2">
                                            {product.model}
                                        </h4>
                                    </div>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="font-mono text-[12px] text-masam-text-secondary">
                                            {formatPrice(product.price)}
                                        </span>
                                        {product.page_url && (
                                            <Link
                                                href={product.page_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-6 h-6 flex items-center justify-center border border-masam-border-subtle rounded-md hover:bg-masam-hover transition-colors"
                                                title="Wraith sitesinde gör"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-masam-text-muted"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shrink-0 self-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                )}
                            </button>
                        )
                    })
                )}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
                <div className="px-4 py-2 border-t border-masam-border-subtle flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-masam-border-subtle text-[14px] text-masam-text-secondary hover:bg-masam-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        ←
                    </button>
                    <span className="text-[12px] text-masam-text-muted tabular-nums">
                        {page + 1} / {pageCount}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                        disabled={page >= pageCount - 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-masam-border-subtle text-[14px] text-masam-text-secondary hover:bg-masam-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        →
                    </button>
                </div>
            )}

            {/* Apply Button */}
            <div className="p-4 border-t border-masam-border-subtle">
                <button
                    type="button"
                    onClick={() => onApply(selections)}
                    disabled={selectedCount === 0 || isProcessing}
                    className="w-full py-3 rounded-xl bg-white text-masam-black text-[14px] font-medium hover:bg-white/90 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                    {isProcessing
                        ? "İşleniyor..."
                        : selectedCount > 0
                            ? `Setup'ı Oluştur (${selectedCount} ürün)`
                            : "Ürün seçin"}
                </button>
            </div>
        </div>
    )
}
