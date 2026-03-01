import { createClient } from "@/lib/supabase/server"
import { HeroSection } from "@/components/landing/hero-section"
import { VibeShowcase } from "@/components/landing/vibe-showcase"
import { FeaturedSetups } from "@/components/landing/featured-setups"
import { HowItWorks } from "@/components/landing/how-it-works"
import { FinalCTA } from "@/components/landing/final-cta"

export const revalidate = 120

export default async function LandingPage() {
    const supabase = await createClient()

    // Featured setups (top 7 by likes)
    const { data: setups = [] } = await supabase
        .from("setups")
        .select("id, title, image_url, thumbnail_url, like_count, view_count")
        .eq("is_public", true)
        .order("like_count", { ascending: false })
        .limit(7)

    // Hero background images — random selection from recent public setups
    const { data: heroPool = [] } = await supabase
        .from("setups")
        .select("id, image_url, thumbnail_url")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(30)

    // Shuffle and pick 6
    const shuffled = (heroPool ?? [])
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)

    return (
        <div className="min-h-screen bg-masam-black">
            <HeroSection images={shuffled} />
            <VibeShowcase />
            <FeaturedSetups setups={setups ?? []} />
            <HowItWorks />
            <FinalCTA />
        </div>
    )
}
