"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface FollowButtonProps {
    userId: string
    initialFollowing: boolean
}

export function FollowButton({ userId, initialFollowing }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing)
    const [isPending, setIsPending] = useState(false)

    const handleToggle = useCallback(async () => {
        if (isPending) return
        setIsPending(true)

        const wasFollowing = isFollowing

        // Optimistic update
        setIsFollowing(!wasFollowing)

        try {
            const supabase = createClient()
            const { error } = await supabase.rpc("toggle_follow", { p_user_id: userId })
            if (error) throw error
        } catch {
            // Revert on error
            setIsFollowing(wasFollowing)
        } finally {
            setIsPending(false)
        }
    }, [userId, isFollowing, isPending])

    return (
        <button
            type="button"
            onClick={handleToggle}
            className={`
                inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200
                ${isFollowing
                    ? "bg-transparent border border-white/[0.12] text-masam-text-secondary hover:border-red-500/50 hover:text-red-400"
                    : "bg-white text-masam-black hover:bg-white/90"
                }
            `}
            aria-label={isFollowing ? "Takibi bırak" : "Takip et"}
        >
            {isFollowing ? (
                <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <polyline points="16 11 18 13 22 9" />
                    </svg>
                    Takip Ediliyor
                </>
            ) : (
                <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    Takip Et
                </>
            )}
        </button>
    )
}
