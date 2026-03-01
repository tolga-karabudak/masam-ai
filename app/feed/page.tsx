import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { MasonryGrid } from "@/components/feed/masonry-grid"
import { FeedFilterBar } from "@/components/feed/feed-filter-bar"
import { FeedSortBar, type SortOption } from "@/components/feed/feed-sort-bar"
import { FeedPagination } from "@/components/feed/feed-pagination"
import { FeedSkeleton } from "@/components/ui/skeleton"
import { redirect } from "next/navigation"

export const revalidate = 60

const PAGE_SIZE = 24

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function parseSortOption(raw: string | undefined): SortOption {
    if (raw === "oldest" || raw === "likes" || raw === "views") return raw
    return "newest"
}

async function FeedContent({
    activeVibe,
    activeSort,
    page,
    userId,
}: {
    activeVibe: string
    activeSort: SortOption
    page: number
    userId: string
}) {
    const supabase = await createClient()

    // Build sort column + direction
    let orderCol = "created_at"
    let ascending = false
    if (activeSort === "oldest") { orderCol = "created_at"; ascending = true }
    else if (activeSort === "likes") { orderCol = "like_count"; ascending = false }
    else if (activeSort === "views") { orderCol = "view_count"; ascending = false }

    // Count query for pagination
    let countQuery = supabase
        .from("setups")
        .select("id", { count: "exact", head: true })
        .eq("is_public", true)

    if (activeVibe !== "all") {
        countQuery = countQuery.contains("categories", [activeVibe])
    }

    const { count: totalCount } = await countQuery
    const total = totalCount ?? 0
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const safePage = Math.max(1, Math.min(page, totalPages))
    const from = (safePage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    // Data query
    let query = supabase
        .from("setups")
        .select("id, title, image_url, thumbnail_url, like_count, try_count, view_count, categories, user_id")
        .eq("is_public", true)
        .order(orderCol, { ascending })
        .range(from, to)

    if (activeVibe !== "all") {
        query = query.contains("categories", [activeVibe])
    }

    const [setupsResult, likesResult] = await Promise.all([
        query,
        supabase
            .from("setup_likes")
            .select("setup_id")
            .eq("user_id", userId),
    ])

    const rawSetups = setupsResult.data || []

    // Bulk fetch profiles
    const userIds = [...new Set(rawSetups.map((s: any) => s.user_id).filter(Boolean))]
    let profileMap: Record<string, { username?: string; display_name?: string }> = {}
    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username, display_name")
            .in("id", userIds)
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

    return (
        <>
            <div className="mb-5">
                <FeedSortBar activeSort={activeSort} totalCount={total} />
            </div>
            <MasonryGrid setups={setups} likedSetupIds={likedSetupIds} />
            <FeedPagination currentPage={safePage} totalPages={totalPages} />
        </>
    )
}

export default async function FeedPage({ searchParams }: { searchParams: SearchParams }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login")
    }

    const params = await searchParams
    const activeVibe = (params?.vibe as string) || "all"
    const activeSort = parseSortOption(params?.sort as string | undefined)
    const page = Math.max(1, parseInt((params?.page as string) || "1", 10) || 1)
    const userVibe = (user.user_metadata?.vibe as string) || null

    const { data: vibes = [] } = await supabase
        .from("vibes")
        .select("id, emoji, label_tr, sort_order")
        .order("sort_order", { ascending: true })

    return (
        <div className="min-h-screen bg-masam-black flex flex-col pt-20 md:pt-24 px-4 md:px-6 lg:px-12 pb-16 md:pb-24">
            {/* Header area */}
            <div className="max-w-[1600px] w-full mx-auto mb-6 md:mb-10">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-[24px] md:text-[32px] font-semibold tracking-tight text-masam-text-primary mb-1">
                            Setup&apos;ları Keşfet
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
                    <FeedContent
                        activeVibe={activeVibe}
                        activeSort={activeSort}
                        page={page}
                        userId={user.id}
                    />
                </Suspense>
            </div>
        </div>
    )
}
