"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface UserMenuProps {
    username: string
    avatarUrl: string | null
    displayName: string | null
}

export function UserMenu({ username, avatarUrl, displayName }: UserMenuProps) {
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

    const initial = (displayName || username)?.[0]?.toUpperCase() || "?"

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-8 h-8 rounded-full overflow-hidden bg-masam-elevated border border-white/[0.08] hover:border-white/[0.16] transition-colors flex items-center justify-center"
                aria-label="Kullanıcı menüsü"
                aria-expanded={open}
            >
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={displayName || username}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <span className="text-[12px] font-bold text-masam-text-muted">{initial}</span>
                )}
            </button>

            {open && (
                <div className="absolute top-full right-0 pt-2 z-50">
                    <div className="min-w-[160px] py-1.5 rounded-2xl bg-masam-black/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                        <Link
                            href={`/profil/${username}`}
                            onClick={() => setOpen(false)}
                            className="block px-4 py-2 text-[13px] text-masam-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors rounded-lg mx-1.5"
                        >
                            Profilim
                        </Link>
                        <div className="h-px bg-white/[0.06] mx-3 my-1" />
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="w-full text-left px-4 py-2 text-[13px] text-masam-text-muted hover:text-white hover:bg-white/[0.06] transition-colors rounded-lg mx-1.5"
                            >
                                Çıkış Yap
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
