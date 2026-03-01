"use client"

import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-sm bg-masam-surface", className)}
            {...props}
        />
    )
}

export function SetupCardSkeleton() {
    return (
        <div className="mb-5 break-inside-avoid">
            <div className="relative overflow-hidden rounded-2xl bg-masam-elevated ring-1 ring-masam-border-subtle">
                <div className="relative w-full" style={{ paddingBottom: "125%" }}>
                    <Skeleton className="absolute inset-0 rounded-none" />
                </div>
            </div>
            <div className="px-1 pt-3 pb-0.5">
                <Skeleton className="h-2.5 w-16 mb-2 rounded-sm" />
                <Skeleton className="h-3.5 w-3/4 mb-2 rounded-sm" />
                <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-10 rounded-sm" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                </div>
            </div>
        </div>
    )
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-masam-elevated border border-masam-border-subtle rounded-sm overflow-hidden flex flex-col h-full">
            <Skeleton className="w-full aspect-square rounded-none" />
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="mt-4 pt-4 border-t border-masam-border-subtle flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function FeedSkeleton() {
    return (
        <div className="flex -ml-3 md:-ml-4 w-auto">
            {[0, 1, 2, 3].map((col) => (
                <div key={col} className={`pl-3 md:pl-4 flex-1 ${col >= 2 ? "hidden md:block" : ""}`}>
                    {[0, 1, 2].map((row) => (
                        <SetupCardSkeleton key={row} />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}

export function ProductPanelSkeleton() {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full flex border border-masam-border-subtle p-3 gap-3 rounded-xl bg-masam-elevated">
                    <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                    <div className="flex flex-col flex-1 justify-between">
                        <div>
                            <Skeleton className="h-2.5 w-16 mb-1.5" />
                            <Skeleton className="h-3.5 w-full mb-1" />
                        </div>
                        <Skeleton className="h-3 w-20 mt-1.5" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function WizardProductSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="flex flex-wrap gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="w-[160px] rounded-xl border border-masam-border-subtle overflow-hidden bg-masam-surface">
                    <Skeleton className="w-full aspect-square rounded-none" />
                    <div className="p-3">
                        <Skeleton className="h-3.5 w-full mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            ))}
        </div>
    )
}
