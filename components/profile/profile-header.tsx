"use client"

import Image from "next/image"
import { FollowButton } from "./follow-button"

interface ProfileHeaderProps {
    profile: {
        id: string
        username: string
        display_name: string | null
        avatar_url: string | null
        created_at: string
    }
    followerCount: number
    followingCount: number
    isFollowing: boolean
    isOwnProfile: boolean
    isLoggedIn: boolean
    vibeLabel: string | null
    vibeEmoji: string | null
}

export function ProfileHeader({
    profile,
    followerCount,
    followingCount,
    isFollowing,
    isOwnProfile,
    isLoggedIn,
    vibeLabel,
    vibeEmoji,
}: ProfileHeaderProps) {
    const initial = (profile.display_name || profile.username)?.[0]?.toUpperCase() || "?"

    const joinDate = new Date(profile.created_at).toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
    })

    return (
        <div className="flex flex-col items-center text-center gap-4">
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-masam-elevated border border-masam-border-subtle">
                {profile.avatar_url ? (
                    <Image
                        src={profile.avatar_url}
                        alt={profile.display_name || profile.username}
                        fill
                        className="object-cover"
                        sizes="80px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[28px] font-bold text-masam-text-muted">
                        {initial}
                    </div>
                )}
            </div>

            {/* Name & username */}
            <div>
                <h1 className="text-[20px] md:text-[24px] font-semibold text-masam-text-primary tracking-tight">
                    {profile.display_name || profile.username}
                </h1>
                <p className="text-masam-text-muted text-[13px] mt-0.5">
                    @{profile.username}
                </p>
            </div>

            {/* Vibe badge */}
            {vibeLabel && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium text-masam-text-secondary bg-masam-elevated border border-masam-border-subtle">
                    {vibeEmoji && <span>{vibeEmoji}</span>}
                    {vibeLabel}
                </span>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-[13px]">
                <div>
                    <span className="font-semibold text-masam-text-primary">{followerCount}</span>
                    <span className="text-masam-text-muted ml-1">takipçi</span>
                </div>
                <div>
                    <span className="font-semibold text-masam-text-primary">{followingCount}</span>
                    <span className="text-masam-text-muted ml-1">takip</span>
                </div>
            </div>

            {/* Follow button */}
            {!isOwnProfile && isLoggedIn && (
                <FollowButton
                    userId={profile.id}
                    initialFollowing={isFollowing}
                />
            )}

            {/* Join date */}
            <p className="text-masam-text-faint text-[11px]">
                {joinDate} tarihinden beri üye
            </p>
        </div>
    )
}
