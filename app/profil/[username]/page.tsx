import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileSetups } from "@/components/profile/profile-setups"

export const revalidate = 60

type PageProps = { params: Promise<{ username: string }> }

export default async function ProfilePage({ params }: PageProps) {
    const { username } = await params
    const supabase = await createClient()

    // Fetch profile by username
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, created_at")
        .eq("username", username)
        .single()

    if (!profile) notFound()

    // Get current viewer
    const { data: { user: viewer } } = await supabase.auth.getUser()

    // Parallel fetches
    const [
        followerCountResult,
        followingCountResult,
        setupsResult,
        viewerFollowResult,
        vibeResult,
        viewerLikesResult,
    ] = await Promise.all([
        // Follower count
        supabase
            .from("follows")
            .select("follower_id", { count: "exact", head: true })
            .eq("following_id", profile.id),
        // Following count
        supabase
            .from("follows")
            .select("following_id", { count: "exact", head: true })
            .eq("follower_id", profile.id),
        // User's public setups
        supabase
            .from("setups")
            .select("id, title, image_url, thumbnail_url, like_count, try_count, view_count, categories, user_id")
            .eq("user_id", profile.id)
            .eq("is_public", true)
            .order("created_at", { ascending: false }),
        // Viewer follow status
        viewer
            ? supabase
                .from("follows")
                .select("follower_id")
                .eq("follower_id", viewer.id)
                .eq("following_id", profile.id)
                .maybeSingle()
            : Promise.resolve({ data: null }),
        // User vibe
        supabase
            .from("user_preferences")
            .select("vibe")
            .eq("user_id", profile.id)
            .maybeSingle(),
        // Viewer's liked setup IDs
        viewer
            ? supabase
                .from("setup_likes")
                .select("setup_id")
                .eq("user_id", viewer.id)
            : Promise.resolve({ data: [] }),
    ])

    const followerCount = followerCountResult.count ?? 0
    const followingCount = followingCountResult.count ?? 0
    const isFollowing = !!viewerFollowResult.data
    const isOwnProfile = viewer?.id === profile.id
    const userVibe = vibeResult.data?.vibe as string | null

    // Fetch vibe label if exists
    let vibeLabel: string | null = null
    let vibeEmoji: string | null = null
    if (userVibe) {
        const { data: vibeData } = await supabase
            .from("vibes")
            .select("label_tr, emoji")
            .eq("id", userVibe)
            .single()
        if (vibeData) {
            vibeLabel = vibeData.label_tr
            vibeEmoji = vibeData.emoji
        }
    }

    const setups = (setupsResult.data || []).map((s: any) => ({
        ...s,
        profiles: { username: profile.username, display_name: profile.display_name },
    }))
    const likedSetupIds = (viewerLikesResult.data || []).map((r: any) => r.setup_id)

    return (
        <div className="min-h-screen bg-masam-black flex flex-col pt-20 md:pt-24 px-4 md:px-6 lg:px-12 pb-16 md:pb-24">
            <div className="max-w-[1600px] w-full mx-auto">
                {/* Profile header */}
                <div className="py-8 md:py-12">
                    <ProfileHeader
                        profile={profile}
                        followerCount={followerCount}
                        followingCount={followingCount}
                        isFollowing={isFollowing}
                        isOwnProfile={isOwnProfile}
                        isLoggedIn={!!viewer}
                        vibeLabel={vibeLabel}
                        vibeEmoji={vibeEmoji}
                    />
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-masam-border-subtle mb-8" />

                {/* Setups */}
                <ProfileSetups
                    setups={setups}
                    likedSetupIds={likedSetupIds}
                    username={profile.username}
                />
            </div>
        </div>
    )
}
