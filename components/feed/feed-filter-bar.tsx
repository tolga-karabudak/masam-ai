"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback, useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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

/* ── Animated SVG icons per emoji key ── */

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

function ShadowFlameIcon({ active }: { active: boolean }) {
    return (
        <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <motion.path
                d="M12 23C7.58 23 4 19.42 4 15C4 11.83 5.67 9.21 6.75 8.08C6.89 7.93 7.13 8.04 7.11 8.24C6.87 10.53 8.54 12.19 9.68 12.92C9.84 13.02 10.04 12.89 10.01 12.71C9.64 10.58 10.13 7.87 12.28 5.69C12.41 5.56 12.63 5.63 12.65 5.81C12.87 7.63 14.41 9.15 15.42 9.8C17.39 11.07 18.75 12.66 19.25 14.25C20.32 17.58 18.39 21.15 15.06 22.51C14.08 22.88 13.04 23.02 12 23Z"
                fill="currentColor"
                animate={active
                    ? { y: [0, -1.5, 0, 1, 0], scale: [1, 1.05, 1, 0.97, 1], opacity: [0.9, 1, 0.8, 1, 0.9] }
                    : { opacity: [0.6, 0.8, 0.6] }
                }
                transition={{ duration: active ? 1.2 : 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {active && (
                <motion.path
                    d="M12 23C10 23 8.2 21.8 7.5 20C7 18.7 7 17 8 15.5C8.5 14.8 9.2 14.2 10 14C10.2 13.9 10.3 14.1 10.2 14.3C9.8 15.5 10.5 16.8 11.5 17.5C12.5 18.2 13 19 13 20C13 21.1 12.5 22 12 23Z"
                    fill="currentColor"
                    opacity={0.5}
                    animate={{ opacity: [0.3, 0.7, 0.3], y: [0, -1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
        </motion.svg>
    )
}

function SnowflakeIcon({ active }: { active: boolean }) {
    return (
        <motion.svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            animate={{ rotate: active ? 360 : 0 }}
            transition={{ duration: active ? 8 : 0, repeat: Infinity, ease: "linear" }}
        >
            <motion.g
                animate={active ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
                {/* Branches */}
                <line x1="12" y1="2" x2="14" y2="5" />
                <line x1="12" y1="2" x2="10" y2="5" />
                <line x1="22" y1="12" x2="19" y2="14" />
                <line x1="22" y1="12" x2="19" y2="10" />
                <line x1="12" y1="22" x2="14" y2="19" />
                <line x1="12" y1="22" x2="10" y2="19" />
                <line x1="2" y1="12" x2="5" y2="14" />
                <line x1="2" y1="12" x2="5" y2="10" />
            </motion.g>
        </motion.svg>
    )
}

function NeonIcon({ active }: { active: boolean }) {
    return (
        <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <motion.path
                d="M6 11L8 7L10 13L12 5L14 15L16 9L18 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={active
                    ? { pathLength: [0, 1], opacity: [0.5, 1] }
                    : {}
                }
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={active ? {} : { pathLength: 1 }}
            />
            {active && (
                <motion.path
                    d="M6 11L8 7L10 13L12 5L14 15L16 9L18 11"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.2}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: "blur(4px)" }}
                />
            )}
            {/* Base line */}
            <motion.line
                x1="4" y1="18" x2="20" y2="18"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity={0.3}
                strokeLinecap="round"
            />
        </motion.svg>
    )
}

/* ── Fallback animated icon ── */
function PulseOrb({ active }: { active: boolean }) {
    return (
        <motion.div
            className="w-4 h-4 rounded-full bg-current"
            animate={active
                ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }
                : { opacity: 0.5 }
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
    )
}

/* ── Map emoji to icon component ── */
const ICON_MAP: Record<string, React.ComponentType<{ active: boolean }>> = {
    "🖤": ShadowFlameIcon,
    "🤍": SnowflakeIcon,
    "🌈": NeonIcon,
}

function VibeIcon({ emoji, active }: { emoji: string; active: boolean }) {
    const Icon = ICON_MAP[emoji] || PulseOrb
    return <Icon active={active} />
}

/* ── Floating particles behind active tab ── */
function ActiveParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white/30"
                    initial={{
                        x: `${20 + Math.random() * 60}%`,
                        y: "100%",
                        opacity: 0,
                    }}
                    animate={{
                        y: [null, `${-20 + Math.random() * 40}%`],
                        opacity: [0, 0.6, 0],
                        x: `${10 + Math.random() * 80}%`,
                    }}
                    transition={{
                        duration: 2 + Math.random() * 1.5,
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
                                        : <VibeIcon emoji={item.emoji} active={isActive} />
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
