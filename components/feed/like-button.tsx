"use client"

import React, { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface LikeButtonProps {
    setupId: string
    initialLiked: boolean
    initialCount: number
}

export function LikeButton({ setupId, initialLiked, initialCount }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialLiked)
    const [count, setCount] = useState(initialCount)
    const [isPending, setIsPending] = useState(false)

    const handleToggle = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isPending) return
        setIsPending(true)

        const wasLiked = isLiked

        // Optimistic update
        setIsLiked(!wasLiked)
        setCount((c) => c + (wasLiked ? -1 : 1))

        try {
            const supabase = createClient()
            const { error } = await supabase.rpc("toggle_like", { p_setup_id: setupId })
            if (error) throw error
        } catch {
            // Revert on error
            setIsLiked(wasLiked)
            setCount((c) => c + (wasLiked ? 1 : -1))
        } finally {
            setIsPending(false)
        }
    }, [setupId, isLiked, isPending])

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-1 tabular-nums transition-colors duration-200 ${
                isLiked
                    ? "text-red-400"
                    : "hover:text-masam-text-primary"
            }`}
            aria-label={isLiked ? "Beğeniyi kaldır" : "Beğen"}
        >
            <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-200 ${isLiked ? "scale-110" : "opacity-60"}`}
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {count}
        </button>
    )
}
