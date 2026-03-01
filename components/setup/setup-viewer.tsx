"use client"

import React from "react"
import Image from "next/image"

interface SetupViewerProps {
    imageUrl: string
    title: string
    isProcessing?: boolean
    elapsedSeconds?: number
}

export function SetupViewer({
    imageUrl,
    title,
    isProcessing = false,
    elapsedSeconds = 0,
}: SetupViewerProps) {
    return (
        <div className="relative w-full h-full min-h-[400px] bg-masam-elevated overflow-hidden flex items-center justify-center">
            <Image
                src={imageUrl}
                alt={title}
                fill
                className={`object-contain transition-all duration-700 ${
                    isProcessing ? "blur-sm scale-[1.02] brightness-75" : "blur-none scale-100 brightness-100"
                }`}
                priority
            />

            {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="w-14 h-14 rounded-full border-2 border-white border-t-transparent animate-spin mb-4" />
                    <p className="text-[15px] font-medium text-white mb-1">AI Çalışıyor...</p>
                    <p className="text-[13px] text-white/60">Ürün setup'ına entegre ediliyor</p>
                    {elapsedSeconds > 0 && (
                        <p className="mt-2 font-mono text-[12px] text-white/40">{elapsedSeconds}s</p>
                    )}
                </div>
            )}
        </div>
    )
}
