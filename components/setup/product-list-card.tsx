"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/format-price"
import { getCategoryLabelTr } from "@/lib/categories"

export interface ListProduct {
    id: string
    category: string
    model: string
    vendor: string
    price: number
    image_url: string
    page_url?: string
}

interface ProductListCardProps {
    products: ListProduct[]
    className?: string
    compact?: boolean
}

export function ProductListCard({ products, className = "", compact = false }: ProductListCardProps) {
    const total = products.reduce((sum, p) => sum + (p.price || 0), 0)

    if (products.length === 0) return null

    return (
        <div className={`bg-masam-elevated border border-masam-border-subtle rounded-xl overflow-hidden ${className}`}>
            <div className="px-4 py-3 border-b border-masam-border-subtle">
                <h3 className="text-[14px] font-medium text-masam-text-primary">
                    Kullanılan Ürünler
                </h3>
                <p className="text-[12px] text-masam-text-muted">
                    {products.length} ürün
                </p>
            </div>

            <div className={`divide-y divide-masam-border-subtle ${compact ? "max-h-[240px]" : "max-h-[400px]"} overflow-y-auto theme-scrollbar`}>
                {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 bg-white rounded-lg relative flex-shrink-0 overflow-hidden">
                            <Image
                                src={product.image_url}
                                alt={product.model}
                                fill
                                className="object-contain p-1"
                                sizes="40px"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-masam-text-muted uppercase tracking-wider">
                                {getCategoryLabelTr(product.category)}
                            </p>
                            <p className="text-[13px] text-masam-text-primary font-medium truncate">
                                {product.model}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[12px] text-masam-text-secondary">
                                {formatPrice(product.price)}
                            </span>
                            {product.page_url && (
                                <Link
                                    href={product.page_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 flex items-center justify-center border border-masam-border-subtle rounded-md hover:bg-masam-hover transition-colors"
                                    title="Satın al"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-masam-text-muted">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-4 py-3 border-t border-masam-border-subtle flex items-center justify-between">
                <span className="text-[13px] text-masam-text-muted">Toplam</span>
                <span className="font-mono text-[15px] font-medium text-masam-text-primary">
                    {formatPrice(total)}
                </span>
            </div>
        </div>
    )
}
