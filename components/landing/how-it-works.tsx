"use client"

import { motion } from "framer-motion"
import { Sparkles, ShoppingBag, Wand2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const STEPS: { num: string; title: string; desc: string; icon: LucideIcon; iconColor: string }[] = [
    {
        num: "01",
        title: "Vibe'ını Keşfet",
        desc: "Kısa bir kişilik testi ile sana en uygun setup tarzını bul. 10 farklı vibe arasından seninkini keşfet.",
        icon: Sparkles,
        iconColor: "text-purple-400",
    },
    {
        num: "02",
        title: "Ürünlerini Seç",
        desc: "Vibe'ına uygun ürünleri keşfet. Monitör, klavye, masa — her şey senin tarzına göre filtrelensin.",
        icon: ShoppingBag,
        iconColor: "text-pink-400",
    },
    {
        num: "03",
        title: "AI ile Oluştur",
        desc: "Yapay zeka seçtiğin ürünlerle hayalindeki masayı görselleştirsin. Setup'ını kaydet ve paylaş.",
        icon: Wand2,
        iconColor: "text-orange-400",
    },
]

export function HowItWorks() {
    return (
        <section className="max-w-[1000px] mx-auto px-4 md:px-6 py-24 md:py-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <h2 className="text-[28px] md:text-[42px] font-semibold tracking-tight text-masam-text-primary mb-4">
                    3 adımda hayalindeki setup
                </h2>
                <p className="text-[16px] text-masam-text-muted max-w-[440px] mx-auto">
                    Basit adımlarla kendi masa kurulumunu oluştur.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {STEPS.map((step, i) => {
                    const Icon = step.icon
                    return (
                        <motion.div
                            key={step.num}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{
                                duration: 0.6,
                                delay: i * 0.2,
                                ease: [0.25, 0.1, 0.25, 1] as const,
                            }}
                            className="relative p-7 rounded-2xl border border-masam-border-subtle bg-masam-elevated/40"
                        >
                            {/* Icon + number */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full border border-masam-border-default flex items-center justify-center">
                                    <Icon className={`w-5 h-5 ${step.iconColor}`} strokeWidth={1.5} />
                                </div>
                                <span className="text-[13px] font-mono text-masam-text-faint">
                                    {step.num}
                                </span>
                            </div>

                            <h3 className="text-[18px] font-medium text-masam-text-primary mb-3">
                                {step.title}
                            </h3>
                            <p className="text-[14px] text-masam-text-muted leading-relaxed">
                                {step.desc}
                            </p>

                            {/* Connector line (between cards, desktop only) */}
                            {i < STEPS.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-4 md:-right-[17px] w-6 h-px bg-masam-border-subtle" />
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </section>
    )
}
