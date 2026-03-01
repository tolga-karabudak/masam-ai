"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { getCategoryLabelTr } from "@/lib/categories"

interface HeaderProductsDropdownProps {
    categories: string[]
}

export function HeaderProductsDropdown({ categories }: HeaderProductsDropdownProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) {
            document.addEventListener("click", handleClickOutside)
            return () => document.removeEventListener("click", handleClickOutside)
        }
    }, [open])

    const sortedCategories = useMemo(() =>
        [...categories].sort((a, b) => getCategoryLabelTr(a).localeCompare(getCategoryLabelTr(b), "tr")),
    [categories])

    return (
        <div
            className="relative"
            ref={ref}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`
                    px-3.5 py-1.5 rounded-full text-[13px] transition-all duration-200 outline-none
                    flex items-center gap-1
                    ${open
                        ? "text-white bg-white/[0.08]"
                        : "text-masam-text-secondary hover:text-white hover:bg-white/[0.06]"
                    }
                `}
                aria-expanded={open}
                aria-haspopup="true"
            >
                Ürünler
                <svg
                    className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
                <div
                    className="min-w-[180px] py-1.5 rounded-2xl bg-masam-black/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                    role="menu"
                >
                    <Link
                        href="/urunler"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-[13px] text-masam-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors rounded-lg mx-1.5"
                        role="menuitem"
                    >
                        Tümü
                    </Link>
                    {sortedCategories.map((cat) => (
                        <Link
                            key={cat}
                            href={`/urunler?category=${encodeURIComponent(cat)}`}
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2 text-[13px] text-masam-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors rounded-lg mx-1.5"
                            role="menuitem"
                        >
                            {getCategoryLabelTr(cat)}
                        </Link>
                    ))}
                </div>
                </div>
            )}
        </div>
    )
}
