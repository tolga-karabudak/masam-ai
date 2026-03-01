"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

type FeaturedSetup = {
    id: string
    title: string
    image_url: string
    thumbnail_url?: string
    like_count: number
    view_count: number
}

const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 },
    },
}

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
    },
}

function SetupImage({ setup, priority }: { setup: FeaturedSetup; priority: boolean }) {
    const [loaded, setLoaded] = useState(false)

    return (
        <Image
            src={setup.thumbnail_url || setup.image_url}
            alt={setup.title || "Setup"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 group-hover/card:scale-[1.04] ${loaded ? "opacity-100 blur-none" : "opacity-0 blur-md"}`}
            onLoad={() => setLoaded(true)}
            priority={priority}
        />
    )
}

export function FeaturedSetups({ setups }: { setups: FeaturedSetup[] }) {
    if (!setups || setups.length === 0) return null

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
                    En beğenilen setup&apos;lar
                </h2>
                <p className="text-[16px] text-masam-text-muted max-w-[440px] mx-auto">
                    Topluluğun en çok beğendiği masa kurulumları.
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[280px]"
            >
                {setups.map((setup, i) => (
                    <motion.div
                        key={setup.id}
                        variants={item}
                        className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
                    >
                        <Link
                            href={`/setup/${setup.id}`}
                            className="group/card relative block w-full h-full rounded-2xl overflow-hidden bg-masam-elevated ring-1 ring-masam-border-subtle transition-all duration-300 hover:ring-masam-border-default hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
                        >
                            <SetupImage setup={setup} priority={i < 3} />

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h3 className={`font-medium text-masam-text-primary mb-2 leading-snug ${i === 0 ? "text-[20px] md:text-[24px]" : "text-[15px]"}`}>
                                    {setup.title}
                                </h3>
                                <div className="flex items-center gap-4 text-[12px] text-masam-text-secondary">
                                    <span className="flex items-center gap-1.5">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                        {setup.like_count}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        {setup.view_count}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-center mt-10"
            >
                <Link
                    href="/feed"
                    className="text-[14px] text-masam-text-muted hover:text-masam-text-primary transition-colors"
                >
                    Tüm setup&apos;ları gör &rarr;
                </Link>
            </motion.div>
        </section>
    )
}
