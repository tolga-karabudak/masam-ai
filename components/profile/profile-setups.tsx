"use client"

import { MasonryGrid } from "@/components/feed/masonry-grid"
import type { Setup } from "@/components/feed/setup-card"

interface ProfileSetupsProps {
    setups: Setup[]
    likedSetupIds: string[]
    username: string
}

export function ProfileSetups({ setups, likedSetupIds, username }: ProfileSetupsProps) {
    if (!setups || setups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-masam-text-muted text-[15px]">
                    @{username} henüz bir setup paylaşmadı.
                </p>
            </div>
        )
    }

    return <MasonryGrid setups={setups} likedSetupIds={likedSetupIds} />
}
