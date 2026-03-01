"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { getCategoryLabelTr } from "@/lib/categories"

interface MobileMenuProps {
    isLoggedIn: boolean
    categories: string[]
}

export function MobileMenu({ isLoggedIn, categories }: MobileMenuProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [open])

    // Lock body scroll when menu is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
            return () => { document.body.style.overflow = "" }
        }
    }, [open])

    return (
        <div ref={ref}>
            {/* Hamburger button */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-masam-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors"
                aria-label="Menü"
                aria-expanded={open}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

            {/* Fullscreen overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-masam-black/95 backdrop-blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-masam-elevated border border-masam-border-subtle text-white"
                            aria-label="Kapat"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <nav className="flex flex-col items-center justify-center h-full gap-2 px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                            >
                                <Link
                                    href="/feed"
                                    onClick={() => setOpen(false)}
                                    className="block text-center text-[22px] font-medium text-white py-4 px-8 rounded-2xl hover:bg-white/[0.06] transition-colors"
                                >
                                    Keşfet
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Link
                                    href="/urunler"
                                    onClick={() => setOpen(false)}
                                    className="block text-center text-[22px] font-medium text-white py-4 px-8 rounded-2xl hover:bg-white/[0.06] transition-colors"
                                >
                                    Ürünler
                                </Link>
                            </motion.div>

                            {/* Category links */}
                            {categories.length > 0 && (
                                <motion.div
                                    className="flex flex-wrap justify-center gap-2 mt-2 mb-2 max-w-[320px]"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat}
                                            href={`/urunler?category=${encodeURIComponent(cat)}`}
                                            onClick={() => setOpen(false)}
                                            className="px-4 py-2 rounded-full text-[13px] text-masam-text-secondary bg-masam-elevated border border-masam-border-subtle hover:text-white hover:border-masam-border-default transition-colors"
                                        >
                                            {getCategoryLabelTr(cat)}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}

                            {isLoggedIn && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Link
                                        href="/setup/olustur"
                                        onClick={() => setOpen(false)}
                                        className="block text-center text-[22px] font-medium text-white py-4 px-8 rounded-2xl hover:bg-white/[0.06] transition-colors"
                                    >
                                        Oluştur
                                    </Link>
                                </motion.div>
                            )}

                            {/* Divider */}
                            <motion.div
                                className="w-16 h-px bg-masam-border-subtle my-4"
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                transition={{ delay: 0.25 }}
                            />

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {isLoggedIn ? (
                                    <form action="/auth/signout" method="post">
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="text-[16px] text-masam-text-muted hover:text-white py-3 px-8 rounded-2xl transition-colors"
                                        >
                                            Çıkış Yap
                                        </button>
                                    </form>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setOpen(false)}
                                        className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-masam-black text-[16px] font-medium hover:bg-white/90 transition-colors"
                                    >
                                        Giriş Yap
                                    </Link>
                                )}
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
