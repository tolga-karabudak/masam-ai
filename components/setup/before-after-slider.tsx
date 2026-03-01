"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { ProductListCard, type ListProduct } from "./product-list-card"

interface BeforeAfterSliderProps {
    beforeImage: string
    afterImage: string
    onClose: () => void
    products?: ListProduct[]
    onShare?: () => Promise<boolean | void>
    isSharing?: boolean
}

export function BeforeAfterSlider({ beforeImage, afterImage, onClose, products, onShare, isSharing = false }: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const [aspectRatio, setAspectRatio] = useState<number | null>(null)
    const [shared, setShared] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const rectRef = useRef<DOMRect | null>(null)

    useEffect(() => {
        let cancelled = false
        const loadImg = (src: string) =>
            new Promise<{ w: number; h: number }>((resolve) => {
                const img = new window.Image()
                img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
                img.onerror = () => resolve({ w: 16, h: 9 })
                img.src = src
            })

        Promise.all([loadImg(beforeImage), loadImg(afterImage)]).then(([before, after]) => {
            if (cancelled) return
            const beforeAR = before.w / before.h
            const afterAR = after.w / after.h
            setAspectRatio(Math.max(beforeAR, afterAR))
        })

        return () => { cancelled = true }
    }, [beforeImage, afterImage])

    const cacheRect = useCallback(() => {
        if (containerRef.current) {
            rectRef.current = containerRef.current.getBoundingClientRect()
        }
    }, [])

    const handleMove = useCallback((clientX: number) => {
        const rect = rectRef.current
        if (!rect) return
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100))
        setSliderPosition(percent)
    }, [])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX)
    }, [isDragging, handleMove])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (isDragging) handleMove(e.touches[0].clientX)
    }, [isDragging, handleMove])

    const startDrag = useCallback(() => {
        cacheRect()
        setIsDragging(true)
    }, [cacheRect])

    const handleMouseUp = useCallback(() => setIsDragging(false), [])

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mouseup", handleMouseUp)
            window.addEventListener("touchend", handleMouseUp)
        } else {
            window.removeEventListener("mouseup", handleMouseUp)
            window.removeEventListener("touchend", handleMouseUp)
        }
        return () => {
            window.removeEventListener("mouseup", handleMouseUp)
            window.removeEventListener("touchend", handleMouseUp)
        }
    }, [isDragging, handleMouseUp])

    const hasProducts = products && products.length > 0

    const handleShareClick = async () => {
        if (onShare) {
            const result = await onShare()
            if (result !== false) {
                setShared(true)
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-masam-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-masam-elevated border border-masam-border-subtle hover:bg-masam-hover transition-colors text-white outline-none"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>

            {/* Title */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
                <h2 className="text-white text-[20px] font-medium tracking-tight mb-1">AI Özelleştirme Sonucu</h2>
                <p className="text-white/60 text-[13px]">Karşılaştırmak için kaydırın</p>
            </div>

            <div className={`flex gap-4 w-full max-h-[80vh] ${hasProducts ? 'max-w-7xl' : 'max-w-6xl justify-center'}`}>
                {/* Slider */}
                <div
                    ref={containerRef}
                    className="relative flex-1 bg-masam-elevated overflow-hidden select-none cursor-ew-resize rounded-sm ring-1 ring-white/10"
                    style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : { aspectRatio: '16/9' }}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    onMouseDown={startDrag}
                    onTouchStart={startDrag}
                >
                    {/* After Image (full, sits behind) */}
                    <div className="absolute inset-0">
                        <Image src={afterImage} alt="After" fill className="object-contain" sizes="(max-width: 1152px) 100vw, 1152px" priority />
                        <div className="absolute bottom-6 right-6 bg-masam-black/80 backdrop-blur-md px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-widest text-white border border-white/10">
                            AI Sonuç
                        </div>
                    </div>

                    {/* Before Image */}
                    <div
                        className="absolute inset-0 bg-masam-elevated"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <Image src={beforeImage} alt="Before" fill className="object-contain" sizes="(max-width: 1152px) 100vw, 1152px" priority />
                        <div className="absolute bottom-6 left-6 bg-masam-black/80 backdrop-blur-md px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-widest text-white border border-white/10">
                            Orijinal
                        </div>
                    </div>

                    {/* Slider Handle */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize touch-none transform -translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                        style={{ left: `${sliderPosition}%` }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-masam-black rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 9l-4 3 4 3M16 9l4 3-4 3"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Product cart sidebar */}
                {hasProducts && (
                    <div className="hidden md:flex w-[320px] flex-col gap-3 shrink-0 overflow-y-auto">
                        <ProductListCard products={products!} compact />

                        {/* Share button — always visible after AI result */}
                        {onShare && !shared && (
                            <button
                                onClick={handleShareClick}
                                disabled={isSharing}
                                className="w-full py-3 rounded-xl bg-white text-masam-black text-[14px] font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isSharing ? (
                                    <>
                                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                        </svg>
                                        Paylaşılıyor...
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                        </svg>
                                        Feed'de Paylaş
                                    </>
                                )}
                            </button>
                        )}
                        {shared && (
                            <div className="w-full py-3 rounded-xl bg-masam-elevated border border-masam-border-subtle text-masam-text-muted text-[14px] text-center flex items-center justify-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Feed'de paylaşıldı
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
