"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface FeedPaginationProps {
    currentPage: number
    totalPages: number
}

export function FeedPagination({ currentPage, totalPages }: FeedPaginationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const goTo = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        if (page <= 1) {
            params.delete("page")
        } else {
            params.set("page", String(page))
        }
        const qs = params.toString()
        router.push(qs ? `${pathname}?${qs}` : pathname)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [router, pathname, searchParams])

    if (totalPages <= 1) return null

    // Build page numbers to show
    const pages: (number | "...")[] = []
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
        pages.push(1)
        if (currentPage > 3) pages.push("...")
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i)
        }
        if (currentPage < totalPages - 2) pages.push("...")
        pages.push(totalPages)
    }

    return (
        <div className="flex items-center justify-center gap-1.5 pt-12 pb-4">
            {/* Prev */}
            <button
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-masam-text-muted hover:text-masam-text-primary hover:bg-masam-hover transition-colors disabled:opacity-20 disabled:pointer-events-none"
            >
                <ChevronLeft size={16} strokeWidth={1.5} />
            </button>

            {/* Pages */}
            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-[13px] text-masam-text-faint">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => goTo(p)}
                        className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-colors ${
                            p === currentPage
                                ? "bg-white/[0.1] text-white border border-white/[0.1]"
                                : "text-masam-text-muted hover:text-masam-text-primary hover:bg-masam-hover"
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-masam-text-muted hover:text-masam-text-primary hover:bg-masam-hover transition-colors disabled:opacity-20 disabled:pointer-events-none"
            >
                <ChevronRight size={16} strokeWidth={1.5} />
            </button>
        </div>
    )
}
