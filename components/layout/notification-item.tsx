"use client"

import Link from "next/link"
import Image from "next/image"

export interface Notification {
    id: string
    type: "new_follower" | "setup_liked"
    actor_id: string
    setup_id: string | null
    read: boolean
    created_at: string
    actor?: {
        username: string
        display_name: string | null
        avatar_url: string | null
    }
    setup_title?: string | null
}

function timeAgo(dateStr: string): string {
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const diffMs = now - then
    const minutes = Math.floor(diffMs / 60000)
    if (minutes < 1) return "şimdi"
    if (minutes < 60) return `${minutes}dk önce`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}sa önce`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}g önce`
    return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
}

export function NotificationItem({ notification }: { notification: Notification }) {
    const actor = notification.actor
    const actorName = actor?.display_name || actor?.username || "Birisi"
    const initial = actorName[0]?.toUpperCase() || "?"

    let message: string
    let href: string

    if (notification.type === "new_follower") {
        message = "seni takip etmeye başladı"
        href = `/profil/${actor?.username || ""}`
    } else {
        message = "setup'ını beğendi"
        href = notification.setup_id ? `/setup/${notification.setup_id}` : "#"
    }

    return (
        <Link
            href={href}
            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04] ${
                !notification.read ? "bg-white/[0.02]" : ""
            }`}
        >
            {/* Actor avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-masam-elevated border border-masam-border-subtle flex-shrink-0">
                {actor?.avatar_url ? (
                    <Image
                        src={actor.avatar_url}
                        alt={actorName}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-masam-text-muted">
                        {initial}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-[13px] text-masam-text-secondary leading-snug">
                    <span className="font-medium text-masam-text-primary">{actorName}</span>
                    {" "}{message}
                </p>
                <p className="text-[11px] text-masam-text-faint mt-0.5">
                    {timeAgo(notification.created_at)}
                </p>
            </div>

            {/* Unread dot */}
            {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            )}
        </Link>
    )
}
