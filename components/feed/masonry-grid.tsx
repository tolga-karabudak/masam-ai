"use client"

import React from "react"
import Masonry from "react-masonry-css"
import { SetupCard, type Setup } from "./setup-card"

interface MasonryGridProps {
    setups: Setup[]
    likedSetupIds?: string[]
}

const breakpointColumnsObj = {
    default: 4,
    1536: 4, // 2xl
    1280: 3, // xl
    1024: 3, // lg
    768: 2,  // md
    640: 1   // sm
}

export const MasonryGrid = React.memo(function MasonryGrid({ setups, likedSetupIds = [] }: MasonryGridProps) {
    if (!setups || setups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-masam-text-muted text-[15px]">Henüz bir setup bulunamadı.</p>
            </div>
        )
    }

    const likedSet = new Set(likedSetupIds)

    return (
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex -ml-4 w-auto"
            columnClassName="pl-4 bg-clip-padding"
        >
            {setups.map((setup) => (
                <SetupCard
                    key={setup.id}
                    setup={setup}
                    isLiked={likedSet.has(setup.id)}
                />
            ))}
        </Masonry>
    )
})
