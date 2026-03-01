"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizAnswer {
    text: string
    vibeScores: Record<string, number>
}

interface QuizQuestion {
    id: string
    question: string
    answers: QuizAnswer[]
}

// ─── Quiz Data ────────────────────────────────────────────────────────────────

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: "q1_adventure",
        question: "Bir RPG dünyasında uyanıyorsun. İlk nereye gidersin?",
        answers: [
            { text: "Karanlık bir zindana dalıp boss kesmeye 🗡️", vibeScores: { shadow_realm: 3, dragon_forge: 2, cyber_district: 1 } },
            { text: "Kristal göllerin olduğu bir elf köyüne 🧝", vibeScores: { frost_kingdom: 3, enchanted_grove: 2, sakura_garden: 1 } },
            { text: "Neon tabelalarla dolu bir siber şehre 🌃", vibeScores: { cyber_district: 3, neon_arcade: 2, phantom_vault: 1 } },
        ]
    },
    {
        id: "q2_weapon",
        question: "Savaşta hangi silahı seçersin?",
        answers: [
            { text: "Gölgelerde kaybolmamı sağlayan görünmezlik pelerini 🖤", vibeScores: { shadow_realm: 3, phantom_vault: 2 } },
            { text: "Kiraz çiçekleriyle süslü büyülü bir asa 🌸", vibeScores: { sakura_garden: 3, enchanted_grove: 2, sunset_lounge: 1 } },
            { text: "Lazer kılıç — tabii ki! ⚡", vibeScores: { neon_arcade: 3, cyber_district: 2, dragon_forge: 1 } },
        ]
    },
    {
        id: "q3_room",
        question: "Rüya odanı tarif et:",
        answers: [
            { text: "Sadece monitörümün ışığıyla aydınlanan karanlık bir mağara", vibeScores: { shadow_realm: 3, cyber_district: 1 } },
            { text: "Her şeyin bembeyaz ve minimalist olduğu ferah bir oda", vibeScores: { frost_kingdom: 3, command_bridge: 1 } },
            { text: "RGB LED'lerle gökkuşağına dönen bir oyun cenneti", vibeScores: { neon_arcade: 3, dragon_forge: 1 } },
            { text: "Bitkiler, ahşap masa ve pencereden gelen doğal ışık", vibeScores: { enchanted_grove: 3, sunset_lounge: 2 } },
        ]
    },
    {
        id: "q4_music",
        question: "Setup'ında hangi müzik çalar?",
        answers: [
            { text: "Dark ambient / synthwave 🎵", vibeScores: { shadow_realm: 2, cyber_district: 3, phantom_vault: 1 } },
            { text: "Lo-fi hip hop / chill beats 🎶", vibeScores: { frost_kingdom: 2, enchanted_grove: 2, sunset_lounge: 2 } },
            { text: "EDM / Bass-heavy tracks 🔊", vibeScores: { neon_arcade: 3, dragon_forge: 2 } },
            { text: "K-pop / J-pop / Anime OST 🎀", vibeScores: { sakura_garden: 3, neon_arcade: 1 } },
        ]
    },
    {
        id: "q5_snack",
        question: "Gece oyun maratonu! Yanında ne var?",
        answers: [
            { text: "Siyah kahve, başka bir şeye ihtiyacım yok ☕", vibeScores: { shadow_realm: 2, command_bridge: 2, frost_kingdom: 1 } },
            { text: "Enerji içeceği ve cips — tam gaz! 🥤", vibeScores: { neon_arcade: 2, dragon_forge: 2, cyber_district: 1 } },
            { text: "Matcha latte ve Japon atıştırmalıkları 🍵", vibeScores: { sakura_garden: 3, enchanted_grove: 1, sunset_lounge: 1 } },
            { text: "Özenle hazırlanmış bir cheese board 🧀", vibeScores: { sunset_lounge: 3, phantom_vault: 2 } },
        ]
    },
    {
        id: "q6_power",
        question: "Bir süper gücün olsa?",
        answers: [
            { text: "Görünmezlik — gölgelerde hareket etmek 👤", vibeScores: { shadow_realm: 3, phantom_vault: 1 } },
            { text: "Telekinezi — eşyaları düşünceyle düzenlemek 🧠", vibeScores: { frost_kingdom: 2, command_bridge: 3 } },
            { text: "Ateş kontrolü — her şeyi tutuşturmak 🔥", vibeScores: { dragon_forge: 3, neon_arcade: 1, sunset_lounge: 1 } },
            { text: "Doğayla konuşmak — bitkiler ve hayvanlarla iletişim 🌱", vibeScores: { enchanted_grove: 3, sakura_garden: 1 } },
        ]
    },
    {
        id: "q7_stream",
        question: "Twitch'te yayın açsan, arka planın nasıl olurdu?",
        answers: [
            { text: "Tamamen karanlık, sadece ekran ışığı — gizemli", vibeScores: { shadow_realm: 2, cyber_district: 2 } },
            { text: "Profesyonel stüdyo — 3 monitör, mikrofon, kamera", vibeScores: { command_bridge: 3, frost_kingdom: 1 } },
            { text: "Neon LED'ler, renkli ışıklar, parti ortamı", vibeScores: { neon_arcade: 3, cyber_district: 1 } },
            { text: "Rahat bir köşe, sıcak ışık, kitaplık", vibeScores: { sunset_lounge: 3, enchanted_grove: 1 } },
        ]
    },
]

// ─── Vibe Definitions ─────────────────────────────────────────────────────────

const VIBES: Record<string, { name: string; subtitle: string; emoji: string }> = {
    shadow_realm:    { name: "Gölge Alemi",        subtitle: "Karanlık, gizemli, sessiz güç.",               emoji: "🖤" },
    dragon_forge:    { name: "Ejder Ocağı",         subtitle: "Ateşli, güçlü, savaşa hazır.",                 emoji: "🔥" },
    cyber_district:  { name: "Siber Bölge",         subtitle: "Neon ışıklar, synthwave, sonsuz gece.",         emoji: "🌃" },
    frost_kingdom:   { name: "Buz Krallığı",        subtitle: "Kristal netlikte minimalizm.",                  emoji: "❄️" },
    enchanted_grove: { name: "Büyülü Orman",        subtitle: "Doğal, huzurlu, organik bir sığınak.",          emoji: "🌿" },
    sakura_garden:   { name: "Kiraz Bahçesi",       subtitle: "Japon estetiği, pastel tonlar, sakin güzellik.",emoji: "🌸" },
    phantom_vault:   { name: "Hayalet Kasası",      subtitle: "Stealth estetik, şık ve gizemli.",              emoji: "👤" },
    neon_arcade:     { name: "Neon Arcade",         subtitle: "RGB cenneti, tam gaz eğlence.",                 emoji: "🎮" },
    sunset_lounge:   { name: "Günbatımı Salonu",    subtitle: "Sıcak tonlar, rahat atmosfer, sofistike şıklık.",emoji: "🌅" },
    command_bridge:  { name: "Komuta Köprüsü",      subtitle: "Verimlilik odaklı, tam kontrol, çok ekran.",    emoji: "🖥️" },
}

// ─── Component ────────────────────────────────────────────────────────────────

type Phase = "quiz" | "result"

export function OnboardingWizard() {
    const [currentQ, setCurrentQ] = useState(0)
    const [scores, setScores] = useState<Record<string, number>>({})
    const [phase, setPhase] = useState<Phase>("quiz")
    const [winningVibe, setWinningVibe] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [animating, setAnimating] = useState(false)
    const router = useRouter()

    const question = QUIZ_QUESTIONS[currentQ]
    const total = QUIZ_QUESTIONS.length

    const handleAnswer = (answer: QuizAnswer) => {
        if (animating) return
        setAnimating(true)

        // Accumulate scores
        const newScores = { ...scores }
        for (const [vibe, pts] of Object.entries(answer.vibeScores)) {
            newScores[vibe] = (newScores[vibe] || 0) + pts
        }
        setScores(newScores)

        const isLast = currentQ === total - 1

        setTimeout(() => {
            if (isLast) {
                // Pick highest score
                const winner = Object.entries(newScores)
                    .sort(([, a], [, b]) => b - a)[0][0]
                setWinningVibe(winner)
                setPhase("result")
            } else {
                setCurrentQ(q => q + 1)
            }
            setAnimating(false)
        }, 250)
    }

    const handleFinish = async () => {
        setIsSaving(true)
        try {
            const supabase = createClient()
            await supabase.auth.updateUser({
                data: { vibe: winningVibe, onboarding_done: true }
            })
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                supabase
                    .from('user_preferences')
                    .upsert(
                        { user_id: user.id, vibe: winningVibe, onboarding_completed: true },
                        { onConflict: 'user_id' }
                    )
                    .then(() => {})
            }
            router.push(`/feed?vibe=${encodeURIComponent(winningVibe)}`)
            router.refresh()
        } catch {
            setIsSaving(false)
        }
    }

    // ── Result screen ─────────────────────────────────────────────────────────
    if (phase === "result") {
        const vibe = VIBES[winningVibe] ?? { name: winningVibe, subtitle: "", emoji: "✨" }
        return (
            <div className="w-full max-w-[520px] mx-auto text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="text-[72px] mb-8 leading-none">{vibe.emoji}</div>

                <p className="text-[13px] uppercase tracking-[0.2em] text-masam-text-muted mb-3">
                    Senin viben
                </p>
                <h2 className="text-[42px] font-medium tracking-tight text-masam-text-primary mb-4">
                    {vibe.name}
                </h2>
                <p className="text-[16px] text-masam-text-muted mb-12 max-w-[360px] mx-auto leading-relaxed">
                    {vibe.subtitle}
                </p>

                <button
                    onClick={handleFinish}
                    disabled={isSaving}
                    className="w-full max-w-[280px] py-4 bg-white text-black text-[15px] font-medium rounded-sm hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                    {isSaving ? "Kaydediliyor..." : "Setupları Keşfet →"}
                </button>
            </div>
        )
    }

    // ── Quiz screen ───────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-[560px] mx-auto">

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-12">
                {QUIZ_QUESTIONS.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < currentQ
                                ? "bg-white"
                                : i === currentQ
                                    ? "bg-white/60"
                                    : "bg-masam-border-default"
                        }`}
                    />
                ))}
            </div>

            {/* Question */}
            <div
                key={currentQ}
                className="animate-in fade-in slide-in-from-bottom-4 duration-400"
            >
                <p className="text-[12px] uppercase tracking-[0.2em] text-masam-text-muted mb-5">
                    {currentQ + 1} / {total}
                </p>
                <h2 className="text-[28px] font-medium tracking-tight text-masam-text-primary mb-8 leading-snug">
                    {question.question}
                </h2>

                {/* Answers */}
                <div className="flex flex-col gap-3">
                    {question.answers.map((answer, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(answer)}
                            disabled={animating}
                            className={`
                                w-full text-left px-6 py-4 border border-masam-border-default
                                rounded-sm text-[15px] text-masam-text-primary
                                hover:border-masam-border-strong hover:bg-masam-elevated
                                transition-all duration-150 disabled:opacity-40
                            `}
                        >
                            {answer.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
