import Link from "next/link"
import { unstable_cache } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { HeaderProductsDropdown } from "@/components/layout/header-products-dropdown"

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
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null

    const categories = await getCategories()

    return (
        <header className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none px-4 pt-4">
            <div className="pointer-events-auto flex items-center gap-1 px-2 py-1.5 rounded-full bg-masam-black/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">

                {/* Logo */}
                <Link
                    href={user ? "/feed" : "/"}
                    className="flex items-center px-3.5 py-1.5 rounded-full text-[14px] font-bold text-white tracking-tight hover:bg-white/[0.06] transition-colors"
                >
                    masam
                    <span className="text-masam-text-muted">.ai</span>
                </Link>

                {/* Separator */}
                <div className="w-px h-4 bg-white/[0.08]" />

                {/* Nav items — desktop only */}
                <nav className="hidden md:flex items-center gap-0.5">
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
                <div className="w-px h-4 bg-white/[0.08] hidden md:block" />

                {/* Auth area */}
                <div className="flex items-center">
                    {user ? (
                        <form action="/auth/signout" method="post">
                            <button className="px-3.5 py-1.5 rounded-full text-[12px] font-medium text-masam-text-muted hover:text-white hover:bg-white/[0.06] transition-all duration-200">
                                Çıkış
                            </button>
                        </form>
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
    )
}
