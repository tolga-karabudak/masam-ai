import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { MasonryGrid } from "@/components/feed/masonry-grid"
import { FeedFilterBar } from "@/components/feed/feed-filter-bar"
import { FeedSkeleton } from "@/components/ui/skeleton"
import { redirect } from "next/navigation"

export const revalidate = 60

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

async function FeedContent({ activeVibe, userId }: { activeVibe: string; userId: string }) {
    const supabase = await createClient()

    let query = supabase
        .from('setups')
        .select('id, title, image_url, thumbnail_url, like_count, try_count, view_count, categories, user_id')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)

    if (activeVibe !== "all") {
        query = query.contains('categories', [activeVibe])
    }

    const [setupsResult, likesResult] = await Promise.all([
        query,
        supabase
            .from('setup_likes')
            .select('setup_id')
            .eq('user_id', userId),
    ])

    const rawSetups = setupsResult.data || []

    // Fetch profiles for all user_ids in one query
    const userIds = [...new Set(rawSetups.map((s: any) => s.user_id).filter(Boolean))]
    let profileMap: Record<string, { username?: string; display_name?: string }> = {}
    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, display_name')
            .in('id', userIds)
        if (profiles) {
            for (const p of profiles) {
                profileMap[p.id] = { username: p.username, display_name: p.display_name }
            }
        }
    }

    const setups = rawSetups.map((s: any) => ({
        ...s,
        profiles: s.user_id ? profileMap[s.user_id] || null : null,
    }))
    const likedSetupIds = (likesResult.data || []).map((r: any) => r.setup_id)

    return <MasonryGrid setups={setups} likedSetupIds={likedSetupIds} />
}

export default async function FeedPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const params = await searchParams
    const activeVibe = (params?.vibe as string) || "all"
    const userVibe = (user.user_metadata?.vibe as string) || null

    const { data: vibes = [] } = await supabase
        .from('vibes')
        .select('id, emoji, label_tr, sort_order')
        .order('sort_order', { ascending: true })

    return (
        <div className="min-h-screen bg-masam-black flex flex-col pt-20 md:pt-24 px-4 md:px-6 lg:px-12 pb-16 md:pb-24">
            {/* Header area */}
            <div className="max-w-[1600px] w-full mx-auto mb-6 md:mb-10">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-[24px] md:text-[32px] font-semibold tracking-tight text-masam-text-primary mb-1">
                            Setup'ları Keşfet
                        </h1>
                        <p className="text-masam-text-muted text-[13px] md:text-[14px]">
                            Topluluğun en iyi masa kurulumlarından ilham al.
                        </p>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="pb-5">
                    <FeedFilterBar
                        vibes={vibes ?? []}
                        activeVibe={activeVibe}
                        userVibe={userVibe}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-[1600px] w-full mx-auto">
                <Suspense fallback={<FeedSkeleton />}>
                    <FeedContent activeVibe={activeVibe} userId={user.id} />
                </Suspense>
            </div>
        </div>
    )
}
