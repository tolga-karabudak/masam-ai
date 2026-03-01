"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback, useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Moon,
    Flame,
    Cpu,
    Snowflake,
    TreePine,
    Cherry,
    Ghost,
    Gamepad2,
    Sunset,
    Monitor,
} from "lucide-react"

export interface Vibe {
    id: string
    emoji: string
    label_en?: string
    label_tr: string
    description?: string | null
    percentage?: number | null
    sort_order?: number | null
}

interface FeedFilterBarProps {
    vibes: Vibe[]
    activeVibe: string
    userVibe: string | null
}

/* ── Animated Lucide icon wrapper ── */

function SparkleIcon({ active }: { active: boolean }) {
    return (
        <motion.svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            animate={{ rotate: active ? 360 : 0 }}
            transition={{ duration: active ? 4 : 0, repeat: Infinity, ease: "linear" }}
        >
            <motion.path
                d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z"
                fill="currentColor"
                animate={active ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
        </motion.svg>
    )
}

function AnimatedVibeIcon({ icon: Icon, active }: { icon: typeof Moon; active: boolean }) {
    return (
        <motion.div
            animate={active
                ? { scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }
                : { opacity: 0.7 }
            }
            transition={{ duration: active ? 2 : 0, repeat: active ? Infinity : 0, ease: "easeInOut" }}
        >
            <Icon size={16} strokeWidth={1.5} />
        </motion.div>
    )
}

/* ── Map vibe id to Lucide icon ── */
const VIBE_ICON_MAP: Record<string, typeof Moon> = {
    shadow_realm: Moon,
    dragon_forge: Flame,
    cyber_district: Cpu,
    frost_kingdom: Snowflake,
    enchanted_grove: TreePine,
    sakura_garden: Cherry,
    phantom_vault: Ghost,
    neon_arcade: Gamepad2,
    sunset_lounge: Sunset,
    command_bridge: Monitor,
}

function VibeIcon({ vibeId, active }: { vibeId: string; active: boolean }) {
    const Icon = VIBE_ICON_MAP[vibeId]
    if (!Icon) {
        return (
            <motion.div
                className="w-4 h-4 rounded-full bg-current"
                animate={active ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : { opacity: 0.5 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
        )
    }
    return <AnimatedVibeIcon icon={Icon} active={active} />
}

/* ── Floating particles behind active tab ── */
const PARTICLE_SEEDS = [
    { ix: 45, ax: 30, ay: 10, dur: 2.2 },
    { ix: 62, ax: 55, ay: 5, dur: 2.8 },
    { ix: 28, ax: 72, ay: 15, dur: 3.1 },
    { ix: 75, ax: 40, ay: -5, dur: 2.5 },
    { ix: 38, ax: 65, ay: 8, dur: 3.4 },
    { ix: 55, ax: 22, ay: -10, dur: 2.9 },
]

function ActiveParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
            {PARTICLE_SEEDS.map((seed, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white/30"
                    initial={{
                        x: `${seed.ix}%`,
                        y: "100%",
                        opacity: 0,
                    }}
                    animate={{
                        y: [null, `${seed.ay}%`],
                        opacity: [0, 0.6, 0],
                        x: `${seed.ax}%`,
                    }}
                    transition={{
                        duration: seed.dur,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    )
}

/* ── Main Component ── */

export function FeedFilterBar({ vibes, activeVibe, userVibe }: FeedFilterBarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const select = useCallback((id: string) => {
        const params = new URLSearchParams()
        if (id !== "all") params.set("vibe", id)
        const qs = params.toString()
        router.push(qs ? `${pathname}?${qs}` : pathname)
    }, [router, pathname])

    const allItems = [
        { id: "all", emoji: "✦", label_tr: "Tümü", isAll: true },
        ...vibes.map((v) => ({ ...v, isAll: false })),
    ]

    return (
        <div className="relative" ref={scrollRef}>
            <motion.div
                className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-2 px-1"
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={{
                    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
                    hidden: {},
                }}
            >
                {allItems.map((item, i) => {
                    const isActive = activeVibe === item.id
                    const isPersonal = userVibe === item.id
                    const showSeparator = item.isAll

                    return (
                        <motion.div
                            key={item.id}
                            className="flex items-center gap-2 shrink-0"
                            variants={{
                                hidden: { opacity: 0, y: 12, scale: 0.9 },
                                visible: { opacity: 1, y: 0, scale: 1 },
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <motion.button
                                onClick={() => select(item.id)}
                                className={`
                                    relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium
                                    whitespace-nowrap outline-none shrink-0 overflow-hidden
                                    transition-colors duration-300
                                    ${isActive
                                        ? "text-white"
                                        : "text-masam-text-muted hover:text-masam-text-primary"
                                    }
                                `}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                                {/* Sliding active background */}
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-white/[0.1] border border-white/[0.12]"
                                        layoutId="activeVibeIndicator"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        style={{ boxShadow: "0 0 20px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)" }}
                                    />
                                )}

                                {/* Particles on active */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <ActiveParticles />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Icon */}
                                <span className="relative z-10">
                                    {item.isAll
                                        ? <SparkleIcon active={isActive} />
                                        : <VibeIcon vibeId={item.id} active={isActive} />
                                    }
                                </span>

                                {/* Label */}
                                <span className="relative z-10">{item.label_tr}</span>

                                {/* Personal vibe indicator */}
                                {isPersonal && !isActive && (
                                    <motion.span
                                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white"
                                        animate={{
                                            scale: [1, 1.4, 1],
                                            opacity: [0.6, 1, 0.6],
                                            boxShadow: [
                                                "0 0 0px rgba(255,255,255,0.3)",
                                                "0 0 8px rgba(255,255,255,0.6)",
                                                "0 0 0px rgba(255,255,255,0.3)",
                                            ],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                )}
                            </motion.button>

                            {/* Separator after "All" */}
                            {showSeparator && (
                                <motion.div
                                    className="w-px h-5 bg-white/[0.08] shrink-0"
                                    variants={{
                                        hidden: { scaleY: 0, opacity: 0 },
                                        visible: { scaleY: 1, opacity: 1 },
                                    }}
                                    transition={{ delay: 0.2 }}
                                />
                            )}
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    )
}
