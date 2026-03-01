"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function FinalCTA() {
    return (
        <section className="relative py-32 md:py-40 overflow-hidden">
            {/* Dot grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />

            {/* Warm gradient glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.1),rgba(236,72,153,0.08),rgba(168,85,247,0.05),transparent_70%)] blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const }}
                className="relative z-10 max-w-[700px] mx-auto px-4 md:px-6 text-center"
            >
                <h2 className="text-[28px] md:text-[48px] font-semibold tracking-tight leading-[1.1] mb-8">
                    <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Setup&apos;ını oluşturmaya
                    </span>
                    <br />
                    <span className="text-masam-text-primary">hazır mısın?</span>
                </h2>

                <p className="text-[16px] text-masam-text-muted max-w-[400px] mx-auto mb-10 leading-relaxed">
                    Ücretsiz hesap oluştur, kişilik testini çöz ve hayalindeki masayı keşfet.
                </p>

                <Link
                    href="/login"
                    className="inline-flex items-center justify-center h-14 px-12 rounded-full bg-white text-masam-black text-[15px] font-medium hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-300"
                >
                    Ücretsiz Başla &rarr;
                </Link>
            </motion.div>
        </section>
    )
}
