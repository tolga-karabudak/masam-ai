"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { LikeButton } from "./like-button"

export type Setup = {
    id: string
    title: string
    image_url: string
    thumbnail_url?: string
    like_count: number
    try_count: number
    view_count: number
    categories: string[]
    user_id?: string
    profiles?: { username?: string; display_name?: string } | null
}

interface SetupCardProps {
    setup: Setup
    isLiked?: boolean
}

export const SetupCard = React.memo(function SetupCard({ setup, isLiked = false }: SetupCardProps) {
    const [isLoaded, setIsLoaded] = useState(false)

    const displayName = setup.profiles?.display_name || setup.profiles?.username || null

    return (
        <div className="mb-5 break-inside-avoid group/card">
            <Link
                href={`/setup/${setup.id}`}
                className="block relative outline-none"
            >
                {/* Image container */}
                <div className="relative overflow-hidden rounded-2xl bg-masam-elevated ring-1 ring-masam-border-subtle transition-all duration-300 ease-out group-hover/card:ring-masam-border-default group-hover/card:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                    <div className="relative w-full min-h-[200px]" style={{ paddingBottom: '125%' }}>
                        <Image
                            src={setup.thumbnail_url || setup.image_url}
                            alt={setup.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className={`object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100 blur-none' : 'opacity-0 scale-105 blur-md'} group-hover/card:scale-[1.03]`}
                            onLoad={() => setIsLoaded(true)}
                        />
                    </div>
                </div>
            </Link>

            {/* Info section below image */}
            <div className="px-1 pt-3 pb-0.5">
                {/* Username */}
                {displayName && (
                    setup.profiles?.username ? (
                        <Link
                            href={`/profil/${setup.profiles.username}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-masam-text-faint text-[11px] font-medium tracking-wide uppercase mb-1 truncate block hover:text-masam-text-secondary transition-colors"
                        >
                            @{setup.profiles.username}
                        </Link>
                    ) : (
                        <p className="text-masam-text-faint text-[11px] font-medium tracking-wide uppercase mb-1 truncate">
                            {displayName}
                        </p>
                    )
                )}

                {/* Title */}
                <h3 className="text-masam-text-primary font-medium text-[14px] leading-snug mb-2 line-clamp-2">
                    {setup.title}
                </h3>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-masam-text-muted text-[12px]">
                    {/* Like button */}
                    <LikeButton
                        setupId={setup.id}
                        initialLiked={isLiked}
                        initialCount={setup.like_count}
                    />

                    {/* View count */}
                    <span className="flex items-center gap-1 tabular-nums">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        {setup.view_count}
                    </span>

                    {/* Category badge */}
                    {setup.categories[0] && (
                        <span className="ml-auto text-[10px] font-medium text-masam-text-faint bg-masam-elevated px-2 py-0.5 rounded-full border border-masam-border-subtle">
                            {setup.categories[0].replace('_', ' ')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
})
