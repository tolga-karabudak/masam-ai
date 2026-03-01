"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getCategoryLabelTr } from "@/lib/categories"

interface MobileMenuProps {
    isLoggedIn: boolean
    categories: string[]
    username?: string
    avatarUrl?: string | null
}

export function MobileMenu({ isLoggedIn, categories, username }: MobileMenuProps) {
    const [open, setOpen] = useState(false)

    // Lock body scroll when menu is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
            return () => { document.body.style.overflow = "" }
        }
    }, [open])

    return (
        <>
            {/* Hamburger / X button */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-masam-text-secondary hover:text-white transition-colors relative z-[60]"
                aria-label="Menü"
                aria-expanded={open}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {open ? (
                        <>
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </>
                    ) : (
                        <>
                            <line x1="4" y1="7" x2="20" y2="7" />
                            <line x1="4" y1="12" x2="20" y2="12" />
                            <line x1="4" y1="17" x2="20" y2="17" />
                        </>
                    )}
                </svg>
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-[51] bg-black/60"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-down panel */}
            <div
                className={`
                    fixed top-0 left-0 right-0 z-[55]
                    bg-masam-black border-b border-white/[0.08]
                    transition-transform duration-300 ease-out
                    ${open ? "translate-y-0" : "-translate-y-full"}
                `}
            >
                {/* Spacer for header height */}
                <div className="h-[52px]" />

                {/* Menu content */}
                <nav className="px-5 pb-6 pt-3">
                    {/* Main nav links */}
                    <div className="space-y-1">
                        <Link
                            href="/feed"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-white hover:bg-white/[0.06] transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-masam-text-muted">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            Keşfet
                        </Link>

                        <Link
                            href="/urunler"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-white hover:bg-white/[0.06] transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-masam-text-muted">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                            Ürünler
                        </Link>

                        {isLoggedIn && (
                            <Link
                                href="/setup/olustur"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-white hover:bg-white/[0.06] transition-colors"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-masam-text-muted">
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Oluştur
                            </Link>
                        )}
                    </div>

                    {/* Categories */}
                    {categories.length > 0 && (
                        <>
                            <div className="h-px bg-white/[0.06] mx-2 my-3" />
                            <div className="flex flex-wrap gap-2 px-2">
                                {categories.map((cat) => (
                                    <Link
                                        key={cat}
                                        href={`/urunler?category=${encodeURIComponent(cat)}`}
                                        onClick={() => setOpen(false)}
                                        className="px-3 py-1.5 rounded-full text-[12px] text-masam-text-secondary bg-white/[0.04] border border-white/[0.08] hover:text-white hover:border-white/[0.16] transition-colors"
                                    >
                                        {getCategoryLabelTr(cat)}
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {/* User section */}
                    {isLoggedIn && (
                        <>
                            <div className="h-px bg-white/[0.06] mx-2 my-3" />
                            <div className="space-y-1">
                                {username && (
                                    <Link
                                        href={`/profil/${username}`}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-white hover:bg-white/[0.06] transition-colors"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-masam-text-muted">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Profilim
                                    </Link>
                                )}
                                <form action="/auth/signout" method="post">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-masam-text-muted hover:text-white hover:bg-white/[0.06] transition-colors w-full text-left"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Çıkış Yap
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                    {!isLoggedIn && (
                        <>
                            <div className="h-px bg-white/[0.06] mx-2 my-3" />
                            <Link
                                href="/login"
                                onClick={() => setOpen(false)}
                                className="flex items-center justify-center mx-2 py-3 rounded-xl bg-white text-masam-black text-[15px] font-semibold hover:bg-white/90 transition-colors"
                            >
                                Giriş Yap
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </>
    )
}
