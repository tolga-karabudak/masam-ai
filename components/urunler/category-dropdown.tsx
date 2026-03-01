"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { getCategoryLabelTr } from "@/lib/categories"

interface CategoryDropdownProps {
    categories: string[]
    currentCategory: string | null
}

export function CategoryDropdown({ categories, currentCategory }: CategoryDropdownProps) {
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

    const label = currentCategory ? getCategoryLabelTr(currentCategory) : "Tüm kategoriler"
    const sortedCategories = useMemo(() =>
        [...categories].sort((a, b) => getCategoryLabelTr(a).localeCompare(getCategoryLabelTr(b), "tr")),
    [categories])

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-masam-border-default bg-masam-surface text-masam-text-primary text-[14px] font-medium hover:bg-masam-hover hover:border-masam-border-strong transition-colors outline-none"
                aria-expanded={open}
                aria-haspopup="listbox"
            >
                <span>{label}</span>
                <svg
                    className={`w-4 h-4 text-masam-text-muted transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div
                    className="absolute top-full right-0 md:left-0 md:right-auto mt-1 min-w-[180px] py-1 rounded-lg border border-masam-border-default bg-masam-surface shadow-lg z-50 max-h-[280px] overflow-y-auto"
                    role="listbox"
                >
                    <Link
                        href="/urunler"
                        onClick={() => setOpen(false)}
                        className={`block px-4 py-2.5 text-[14px] transition-colors ${!currentCategory ? "bg-masam-hover text-masam-text-primary" : "text-masam-text-secondary hover:bg-masam-hover hover:text-masam-text-primary"}`}
                        role="option"
                    >
                        Tümü
                    </Link>
                    {sortedCategories.map((cat) => (
                        <Link
                            key={cat}
                            href={`/urunler?category=${encodeURIComponent(cat)}`}
                            onClick={() => setOpen(false)}
                            className={`block px-4 py-2.5 text-[14px] transition-colors ${currentCategory === cat ? "bg-masam-hover text-masam-text-primary" : "text-masam-text-secondary hover:bg-masam-hover hover:text-masam-text-primary"}`}
                            role="option"
                        >
                            {getCategoryLabelTr(cat)}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
