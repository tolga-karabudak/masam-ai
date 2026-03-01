import Link from "next/link"
import { unstable_cache } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { HeaderProductsDropdown } from "@/components/layout/header-products-dropdown"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { NotificationBell } from "@/components/layout/notification-bell"
import { UserMenu } from "@/components/layout/user-menu"

/** Public data only - no cookies, safe to use inside unstable_cache */
async function fetchCategories() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
        .from("wraith_products")
        .select("category")
        .eq("available", true)
    return [...new Set((data ?? []).map((r) => r.category).filter(Boolean))] as string[]
}

const getCategories = unstable_cache(fetchCategories, ["header-categories"], { revalidate: 300 })

export async function Header() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const categories = await getCategories()

    // Fetch profile + unread count for logged-in user
    let profile: { username: string; display_name: string | null; avatar_url: string | null } | null = null
    let unreadCount = 0

    if (user) {
        const [profileResult, unreadResult] = await Promise.all([
            supabase
                .from("profiles")
                .select("username, display_name, avatar_url")
                .eq("id", user.id)
                .single(),
            supabase
                .from("notifications")
                .select("id", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("read", false),
        ])
        profile = profileResult.data
        unreadCount = unreadResult.count ?? 0
    }

    return (
        <>
            {/* ── Mobile header — full-width bar ── */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-40 pointer-events-auto">
                <div className="flex items-center justify-between px-4 py-3 bg-masam-black/80 backdrop-blur-xl border-b border-white/[0.06]">
                    {/* Left: hamburger */}
                    <MobileMenu
                        isLoggedIn={!!user}
                        categories={categories}
                        username={profile?.username}
                        avatarUrl={profile?.avatar_url}
                    />

                    {/* Center: logo */}
                    <Link
                        href="/"
                        className="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold text-white tracking-tight"
                    >
                        masam<span className="text-masam-text-muted">.ai</span>
                    </Link>

                    {/* Right: notification bell (or login) */}
                    <div className="flex items-center gap-1">
                        {user && profile ? (
                            <NotificationBell initialUnreadCount={unreadCount} />
                        ) : (
                            <Link
                                href="/login"
                                className="px-3 py-1 rounded-full text-[12px] font-medium text-masam-black bg-white hover:bg-white/90 transition-colors"
                            >
                                Giriş
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Desktop header — floating pill ── */}
            <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 justify-center pointer-events-none px-4 pt-4">
                <div className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-full bg-masam-black/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">

                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center px-3 py-1.5 rounded-full text-[14px] font-bold text-white tracking-tight hover:bg-white/[0.06] transition-colors"
                    >
                        masam
                        <span className="text-masam-text-muted">.ai</span>
                    </Link>

                    {/* Separator */}
                    <div className="w-px h-4 bg-white/[0.08]" />

                    {/* Nav items */}
                    <nav className="flex items-center gap-0.5">
                        <Link
                            href="/feed"
                            className="px-3.5 py-1.5 rounded-full text-[13px] text-masam-text-secondary hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                        >
                            Keşfet
                        </Link>
                        {categories.length > 0 ? (
                            <HeaderProductsDropdown categories={categories} />
                        ) : (
                            <Link
                                href="/urunler"
                                className="px-3.5 py-1.5 rounded-full text-[13px] text-masam-text-secondary hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                            >
                                Ürünler
                            </Link>
                        )}
                        {user && (
                            <Link
                                href="/setup/olustur"
                                className="px-3.5 py-1.5 rounded-full text-[13px] text-masam-text-secondary hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                            >
                                Oluştur
                            </Link>
                        )}
                    </nav>

                    {/* Separator */}
                    <div className="w-px h-4 bg-white/[0.08]" />

                    {/* Auth area */}
                    <div className="flex items-center gap-1">
                        {user && profile ? (
                            <>
                                <NotificationBell initialUnreadCount={unreadCount} />
                                <UserMenu
                                    username={profile.username}
                                    avatarUrl={profile.avatar_url}
                                    displayName={profile.display_name}
                                />
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-1.5 rounded-full text-[12px] font-medium text-masam-black bg-white hover:bg-white/90 transition-colors"
                            >
                                Giriş Yap
                            </Link>
                        )}
                    </div>
                </div>
            </header>
        </>
    )
}
