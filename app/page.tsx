import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 120

export default async function LandingPage() {
    const supabase = await createClient()
    const { data: picked = [] } = await supabase
        .from("setups")
        .select("id, image_url, thumbnail_url, title")
        .eq("is_public", true)
        .order("try_count", { ascending: false })
        .limit(8)

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-masam-black flex flex-col">
            {/* Hero */}
            <section className="max-w-[900px] mx-auto px-6 pt-16 md:pt-24 pb-12 text-center">
                <h1 className="text-[40px] md:text-[52px] font-medium tracking-tight text-masam-text-primary leading-[1.1] mb-5">
                    Masanı hayal et.
                    <br />
                    <span className="text-masam-text-secondary">Ürünleri dene, setup'ını oluştur.</span>
                </h1>
                <p className="text-[17px] text-masam-text-muted max-w-[480px] mx-auto mb-10 leading-relaxed">
                    İlham al, vibe'ına göre filtrele, kendi masa kurulumunu keşfet.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-masam-black text-[15px] font-medium hover:bg-white/90 transition-colors"
                    >
                        Setup'ını oluştur
                    </Link>
                    <Link
                        href="/urunler"
                        className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-masam-border-default text-masam-text-primary text-[15px] font-medium hover:bg-masam-hover transition-colors"
                    >
                        Ürünler
                    </Link>
                </div>
            </section>

            {/* 8 random setup images */}
            <section className="max-w-[1000px] mx-auto px-6 py-12 md:py-16 w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(picked ?? []).length > 0
                        ? (picked ?? []).map((setup, i) => (
                              <div
                                  key={setup.id}
                                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-masam-surface border border-masam-border-subtle"
                              >
                                  <Image
                                      src={setup.thumbnail_url || setup.image_url}
                                      alt={setup.title || "Setup"}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 50vw, 25vw"
                                      priority={i < 4}
                                  />
                              </div>
                          ))
                        : Array.from({ length: 8 }).map((_, i) => (
                              <div
                                  key={i}
                                  className="aspect-[4/3] rounded-lg bg-masam-surface border border-masam-border-subtle"
                              />
                          ))}
                </div>
            </section>

            {/* Footer hint */}
            <section className="max-w-[900px] mx-auto px-6 pb-20 pt-4 text-center">
                <p className="text-[13px] text-masam-text-faint">
                    <Link href="/urunler" className="hover:text-masam-text-muted transition-colors">Ürünler</Link>
                    {" · "}
                    Keşfet · Filtrele · Kendi masanı kur
                </p>
            </section>
        </div>
    )
}
