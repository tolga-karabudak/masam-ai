"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useState, useRef, useEffect } from "react"
import { ArrowDownUp, Heart, Eye, Clock, TrendingUp } from "lucide-react"

export type SortOption = "newest" | "oldest" | "likes" | "views"

const SORT_OPTIONS: { value: SortOption; label: string; icon: typeof Heart }[] = [
    { value: "newest", label: "En Yeni", icon: Clock },
    { value: "oldest", label: "En Eski", icon: Clock },
    { value: "likes", label: "En Beğenilen", icon: Heart },
    { value: "views", label: "En Çok Görüntülenen", icon: Eye },
]

interface FeedSortBarProps {
    activeSort: SortOption
    totalCount: number
}

export function FeedSortBar({ activeSort, totalCount }: FeedSortBarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const current = SORT_OPTIONS.find(o => o.value === activeSort) || SORT_OPTIONS[0]

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const select = useCallback((value: SortOption) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "newest") {
            params.delete("sort")
        } else {
            params.set("sort", value)
        }
        // Reset to page 1 on sort change
        params.delete("page")
        const qs = params.toString()
        router.push(qs ? `${pathname}?${qs}` : pathname)
        setOpen(false)
    }, [router, pathname, searchParams])

    return (
        <div className="flex items-center justify-between">
            <p className="text-[13px] text-masam-text-faint tabular-nums">
                {totalCount} setup
            </p>

            <div className="relative" ref={ref}>
                <button
                    onClick={() => setOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-masam-text-muted hover:text-masam-text-primary hover:bg-masam-hover transition-colors"
                >
                    <ArrowDownUp size={14} strokeWidth={1.5} />
                    <span>{current.label}</span>
                </button>

                {open && (
                    <div className="absolute right-0 top-full mt-1 z-50 w-48 py-1 rounded-xl border border-masam-border-subtle bg-masam-elevated shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                        {SORT_OPTIONS.map(option => {
                            const Icon = option.icon
                            const isActive = option.value === activeSort
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => select(option.value)}
                                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors ${
                                        isActive
                                            ? "text-white bg-white/[0.06]"
                                            : "text-masam-text-muted hover:text-masam-text-primary hover:bg-masam-hover"
                                    }`}
                                >
                                    <Icon size={14} strokeWidth={1.5} />
                                    <span>{option.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
