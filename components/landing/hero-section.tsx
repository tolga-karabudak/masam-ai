"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

const stagger = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.15 },
    },
}

const fadeUp = {
    hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
    },
}

type HeroImage = {
    id: string
    image_url: string
    thumbnail_url?: string
}

export function HeroSection({ images = [] }: { images?: HeroImage[] }) {
    return (
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
            {/* Floating setup images background */}
            {images.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                    {images.map((img, i) => {
                        const positions = [
                            { top: "8%", left: "3%", rotate: -12, size: "w-[180px] md:w-[260px]" },
                            { top: "12%", right: "4%", rotate: 8, size: "w-[160px] md:w-[240px]" },
                            { bottom: "18%", left: "5%", rotate: 6, size: "w-[150px] md:w-[220px]" },
                            { bottom: "10%", right: "3%", rotate: -8, size: "w-[170px] md:w-[250px]" },
                            { top: "45%", left: "-2%", rotate: -4, size: "w-[140px] md:w-[200px]" },
                            { top: "40%", right: "-1%", rotate: 10, size: "w-[140px] md:w-[200px]" },
                        ]
                        const pos = positions[i % positions.length]

                        return (
                            <motion.div
                                key={img.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.25, 0.1, 0.25, 1] as const }}
                                className={`absolute ${pos.size}`}
                                style={{
                                    top: pos.top,
                                    left: pos.left,
                                    right: pos.right,
                                    bottom: pos.bottom,
                                }}
                            >
                                <motion.div
                                    animate={{
                                        y: [0, i % 2 === 0 ? -12 : 12, 0],
                                        rotate: [pos.rotate, pos.rotate + (i % 2 === 0 ? 2 : -2), pos.rotate],
                                    }}
                                    transition={{
                                        duration: 6 + i * 0.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.06]"
                                    style={{ transform: `rotate(${pos.rotate}deg)` }}
                                >
                                    <Image
                                        src={img.thumbnail_url || img.image_url}
                                        alt=""
                                        fill
                                        className="object-cover opacity-40 md:opacity-50"
                                        sizes="260px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </motion.div>
                            </motion.div>
                        )
                    })}

                    {/* Extra vignette overlay so text stays readable */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.85)_75%)]" />
                </div>
            )}

            {/* Radial gradient glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="hero-glow absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.15),rgba(236,72,153,0.1),rgba(249,115,22,0.05),transparent_70%)] blur-[120px]" />
            </div>

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="relative z-10 max-w-[900px] mx-auto px-4 md:px-6 text-center"
            >
                {/* Badge */}
                <motion.div variants={fadeUp} className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-masam-border-subtle bg-masam-elevated/50 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[13px] font-mono text-masam-text-secondary tracking-wide">
                            masam.ai
                        </span>
                    </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={fadeUp}
                    className="text-[36px] md:text-[64px] font-semibold tracking-tight text-masam-text-primary leading-[1.08] mb-6"
                >
                    Hayalindeki setup&apos;ı
                    <br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                        vibe&apos;ına göre oluştur.
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={fadeUp}
                    className="text-[17px] md:text-[19px] text-masam-text-muted max-w-[520px] mx-auto mb-12 leading-relaxed"
                >
                    AI destekli masa kurulumu platformu. Kişilik testini çöz,
                    vibe&apos;ını keşfet, hayalindeki setup&apos;ı oluştur.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    variants={fadeUp}
                    className="flex flex-wrap items-center justify-center gap-4"
                >
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center h-13 px-10 rounded-full bg-white text-masam-black text-[15px] font-medium hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300"
                    >
                        Hemen Başla
                    </Link>
                    <Link
                        href="/feed"
                        className="inline-flex items-center justify-center h-13 px-10 rounded-full border border-masam-border-default text-masam-text-primary text-[15px] font-medium hover:bg-masam-hover hover:border-masam-text-muted transition-all duration-300"
                    >
                        Setup&apos;ları Keşfet
                    </Link>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-5 h-8 rounded-full border-2 border-masam-text-faint flex items-start justify-center pt-1.5"
                >
                    <div className="w-1 h-1.5 rounded-full bg-masam-text-muted" />
                </motion.div>
            </motion.div>
        </section>
    )
}
