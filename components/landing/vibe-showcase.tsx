"use client"

import { motion } from "framer-motion"
import Link from "next/link"
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
import type { LucideIcon } from "lucide-react"

type VibeItem = {
    key: string
    name: string
    icon: LucideIcon
    desc: string
    iconColor: string
    glowColor: string
}

const VIBES: VibeItem[] = [
    { key: "shadow_realm", name: "Gölge Alemi", icon: Moon, desc: "Karanlık, gizemli, sessiz güç.", iconColor: "text-gray-400", glowColor: "hover:shadow-[0_0_30px_rgba(156,163,175,0.2)]" },
    { key: "dragon_forge", name: "Ejder Ocağı", icon: Flame, desc: "Ateşli, güçlü, savaşa hazır.", iconColor: "text-red-400", glowColor: "hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]" },
    { key: "cyber_district", name: "Siber Bölge", icon: Cpu, desc: "Neon ışıklar, synthwave.", iconColor: "text-indigo-400", glowColor: "hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]" },
    { key: "frost_kingdom", name: "Buz Krallığı", icon: Snowflake, desc: "Kristal netlikte minimalizm.", iconColor: "text-blue-400", glowColor: "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]" },
    { key: "enchanted_grove", name: "Büyülü Orman", icon: TreePine, desc: "Doğal, huzurlu, organik.", iconColor: "text-green-400", glowColor: "hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]" },
    { key: "sakura_garden", name: "Kiraz Bahçesi", icon: Cherry, desc: "Japon estetiği, pastel tonlar.", iconColor: "text-pink-400", glowColor: "hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]" },
    { key: "phantom_vault", name: "Hayalet Kasası", icon: Ghost, desc: "Stealth estetik, gizemli.", iconColor: "text-slate-400", glowColor: "hover:shadow-[0_0_30px_rgba(148,163,184,0.2)]" },
    { key: "neon_arcade", name: "Neon Arcade", icon: Gamepad2, desc: "RGB cenneti, tam gaz.", iconColor: "text-purple-400", glowColor: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]" },
    { key: "sunset_lounge", name: "Günbatımı Salonu", icon: Sunset, desc: "Sıcak tonlar, rahat atmosfer.", iconColor: "text-orange-400", glowColor: "hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]" },
    { key: "command_bridge", name: "Komuta Köprüsü", icon: Monitor, desc: "Verimlilik, tam kontrol.", iconColor: "text-sky-400", glowColor: "hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]" },
]

const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.06 },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
    },
}

export function VibeShowcase() {
    return (
        <section className="max-w-[1100px] mx-auto px-4 md:px-6 py-24 md:py-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="text-center mb-14"
            >
                <h2 className="text-[28px] md:text-[42px] font-semibold tracking-tight text-masam-text-primary mb-4">
                    Hangi vibe senin?
                </h2>
                <p className="text-[16px] text-masam-text-muted max-w-[440px] mx-auto">
                    Kişiliğini yansıtan vibe&apos;ı bul, sana özel setup&apos;ları keşfet.
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
            >
                {VIBES.map((vibe) => {
                    const Icon = vibe.icon
                    return (
                        <motion.div key={vibe.key} variants={item}>
                            <Link href="/onboarding">
                                <motion.div
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                    className={`relative p-5 rounded-2xl border border-masam-border-subtle bg-masam-elevated/60 backdrop-blur-sm cursor-pointer transition-all duration-300 ${vibe.glowColor}`}
                                >
                                    <Icon className={`w-7 h-7 mb-3 ${vibe.iconColor}`} strokeWidth={1.5} />
                                    <h3 className="text-[14px] font-medium text-masam-text-primary mb-1">
                                        {vibe.name}
                                    </h3>
                                    <p className="text-[12px] text-masam-text-muted leading-snug">
                                        {vibe.desc}
                                    </p>
                                </motion.div>
                            </Link>
                        </motion.div>
                    )
                })}
            </motion.div>
        </section>
    )
}
