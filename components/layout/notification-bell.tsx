"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { NotificationItem, type Notification } from "./notification-item"

interface NotificationBellProps {
    initialUnreadCount: number
}

export function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
    const [open, setOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loaded, setLoaded] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) {
            document.addEventListener("click", handleClickOutside)
            return () => document.removeEventListener("click", handleClickOutside)
        }
    }, [open])

    // Realtime subscription for new notifications
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel("notifications-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications" },
                () => {
                    setUnreadCount((c) => c + 1)
                    // If dropdown is open, refresh
                    if (open) fetchNotifications()
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchNotifications = useCallback(async () => {
        const supabase = createClient()
        const { data: rawNotifications } = await supabase
            .from("notifications")
            .select("id, type, actor_id, setup_id, read, created_at")
            .order("created_at", { ascending: false })
            .limit(20)

        if (!rawNotifications || rawNotifications.length === 0) {
            setNotifications([])
            setLoaded(true)
            return
        }

        // Fetch actor profiles
        const actorIds = [...new Set(rawNotifications.map((n: any) => n.actor_id))]
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url")
            .in("id", actorIds)

        const profileMap: Record<string, any> = {}
        if (profiles) {
            for (const p of profiles) profileMap[p.id] = p
        }

        // Fetch setup titles for setup_liked
        const setupIds = rawNotifications
            .filter((n: any) => n.setup_id)
            .map((n: any) => n.setup_id)
        let setupMap: Record<string, string> = {}
        if (setupIds.length > 0) {
            const { data: setups } = await supabase
                .from("setups")
                .select("id, title")
                .in("id", setupIds)
            if (setups) {
                for (const s of setups) setupMap[s.id] = s.title
            }
        }

        const enriched: Notification[] = rawNotifications.map((n: any) => ({
            ...n,
            actor: profileMap[n.actor_id] || undefined,
            setup_title: n.setup_id ? setupMap[n.setup_id] || null : null,
        }))

        setNotifications(enriched)
        setLoaded(true)
    }, [])

    const handleOpen = useCallback(async () => {
        setOpen((o) => {
            const next = !o
            if (next && !loaded) {
                fetchNotifications()
            }
            if (next && unreadCount > 0) {
                // Mark all as read
                const supabase = createClient()
                supabase.rpc("mark_all_notifications_read").then(() => {
                    setUnreadCount(0)
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                })
            }
            return next
        })
    }, [loaded, unreadCount, fetchNotifications])

    const displayCount = unreadCount > 9 ? "9+" : unreadCount

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={handleOpen}
                className="relative w-8 h-8 flex items-center justify-center rounded-full text-masam-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors"
                aria-label="Bildirimler"
                aria-expanded={open}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                        {displayCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="fixed md:absolute inset-x-3 md:inset-x-auto top-16 md:top-full right-auto md:right-0 md:pt-2 z-50">
                    <div className="w-auto md:w-[340px] max-h-[70vh] md:max-h-[400px] overflow-y-auto rounded-2xl bg-masam-black/95 md:bg-masam-black/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                            <h3 className="text-[14px] font-medium text-masam-text-primary">Bildirimler</h3>
                        </div>
                        {!loaded ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-5 h-5 border-2 border-masam-text-muted border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-masam-text-muted text-[13px]">Henüz bildirim yok.</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map((n) => (
                                    <NotificationItem key={n.id} notification={n} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
