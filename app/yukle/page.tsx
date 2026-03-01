"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Stage = 'idle' | 'preview' | 'uploading' | 'analyzing' | 'done' | 'error'

export default function YuklePage() {
    const [stage, setStage] = useState<Stage>('idle')
    const [preview, setPreview] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [detectedZones, setDetectedZones] = useState<Record<string, object>>({})
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFile = useCallback((f: File) => {
        if (!f.type.startsWith('image/')) {
            setErrorMsg('Lütfen bir görsel dosyası seçin.')
            return
        }
        setFile(f)
        setPreview(URL.createObjectURL(f))
        setStage('preview')
        setErrorMsg('')
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }, [handleFile])

    const handleSubmit = async () => {
        if (!file) return
        setStage('uploading')

        try {
            const formData = new FormData()
            formData.append('image', file)
            formData.append('title', title || 'Benim Setup\'um')

            setStage('analyzing')
            const res = await fetch('/api/setup/analyze', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Analiz başarısız')

            setDetectedZones(data.peripheral_zones || {})
            setStage('done')

            // Redirect to setup detail page after brief success moment
            setTimeout(() => {
                router.push(`/setup/${data.setup_id}`)
            }, 1500)

        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Bir hata oluştu')
            setStage('error')
        }
    }

    return (
        <div className="min-h-screen bg-masam-black pt-16 px-6 lg:px-12 flex flex-col items-center justify-center">
            <div className="w-full max-w-[640px]">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-[28px] font-medium tracking-tight text-masam-text-primary mb-2">
                        Setup Yükle
                    </h1>
                    <p className="text-[14px] text-masam-text-muted">
                        Masanın fotoğrafını yükle, AI otomatik olarak klavye, mouse ve diğer ekipmanları tespit eder.
                    </p>
                </div>

                {/* Drop Zone */}
                {(stage === 'idle' || stage === 'error') && (
                    <div
                        className="border-2 border-dashed border-masam-border-subtle hover:border-masam-border-strong rounded-sm p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => inputRef.current?.click()}
                    >
                        <div className="w-16 h-16 rounded-full bg-masam-elevated flex items-center justify-center mb-5 group-hover:bg-masam-hover transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-masam-text-muted">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p className="text-[15px] text-masam-text-primary mb-2">Görseli buraya sürükle veya tıkla</p>
                        <p className="text-[13px] text-masam-text-muted">JPG, PNG veya WEBP · Maks 10MB</p>
                        {stage === 'error' && <p className="text-masam-error text-[13px] mt-4">{errorMsg}</p>}
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                    </div>
                )}

                {/* Preview */}
                {stage === 'preview' && preview && (
                    <div className="space-y-6">
                        <div className="relative w-full aspect-video bg-masam-elevated rounded-sm overflow-hidden border border-masam-border-subtle">
                            <Image src={preview} alt="Setup preview" fill className="object-cover" />
                        </div>
                        <input
                            type="text"
                            placeholder="Setup adı (opsiyonel)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-masam-elevated border border-masam-border-subtle px-4 py-3 text-[14px] text-masam-text-primary placeholder:text-masam-text-muted rounded-sm focus:outline-none focus:border-masam-border-strong"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setStage('idle'); setPreview(null); setFile(null) }}
                                className="flex-1 py-3 border border-masam-border-subtle text-masam-text-muted text-[14px] hover:bg-masam-hover rounded-sm transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-3 bg-white text-black text-[14px] font-medium hover:bg-white/90 rounded-sm transition-colors"
                            >
                                Analiz Et ve Devam Et →
                            </button>
                        </div>
                    </div>
                )}

                {/* Uploading / Analyzing */}
                {(stage === 'uploading' || stage === 'analyzing') && (
                    <div className="flex flex-col items-center justify-center py-16 gap-6">
                        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-white animate-spin" />
                        <div className="text-center">
                            <p className="text-[16px] font-medium text-white mb-2">
                                {stage === 'uploading' ? 'Yükleniyor...' : 'AI Ekipmanları Tespit Ediyor...'}
                            </p>
                            <p className="text-[13px] text-masam-text-muted">
                                {stage === 'analyzing' ? 'Gemini Vision klavye, mouse ve diğer ekipmanları buluyor.' : ''}
                            </p>
                        </div>
                    </div>
                )}

                {/* Done */}
                {stage === 'done' && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <p className="text-[16px] font-medium text-white">
                            {Object.keys(detectedZones).length > 0
                                ? `${Object.keys(detectedZones).length} ekipman tespit edildi: ${Object.keys(detectedZones).join(', ')}`
                                : 'Setup hazır!'}
                        </p>
                        <p className="text-[13px] text-masam-text-muted">Setup sayfasına yönlendiriliyorsunuz...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
