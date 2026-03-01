"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function RegisterForm() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (password !== passwordConfirm) {
            setError("Şifreler eşleşmiyor.")
            setIsLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        preferred_username: username,
                    },
                },
            })

            if (error) throw error

            router.push("/onboarding")
            router.refresh()
        } catch (error: any) {
            setError(error.message || "Kayıt işlemi başarısız oldu.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (error: any) {
            setError(error.message || "Google ile kayıt olunamadı.")
        }
    }

    return (
        <div className="w-full max-w-[380px] space-y-8 block">
            <div>
                <h1 className="text-[28px] font-medium text-masam-text-primary mb-1">Kayıt Ol</h1>
                <p className="text-[14px] text-masam-text-muted">Masanı keşfetmeye başla</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 relative block">
                <div className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Kullanıcı adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <Input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <Input
                        type="password"
                        placeholder="Şifre (min 8 karakter)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        disabled={isLoading}
                    />
                    <Input
                        type="password"
                        placeholder="Şifreyi tekrar gir"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        minLength={8}
                        disabled={isLoading}
                    />
                </div>

                {error && (
                    <div className="text-[13px] text-masam-error bg-masam-error-muted/20 px-4 py-3 border-l-2 border-masam-error">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full relative" disabled={isLoading}>
                    {isLoading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-masam-border-subtle"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-masam-black text-masam-text-muted text-[13px]">veya</span>
                </div>
            </div>

            <Button
                type="button"
                variant="secondary"
                className="w-full border-masam-border-default hover:bg-masam-hover text-masam-text-primary relative"
                onClick={handleGoogleLogin}
                disabled={isLoading}
            >
                <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                >
                    <path
                        fill="currentColor"
                        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                </svg>
                Google ile devam et
            </Button>

            <div className="text-center text-[13px] text-masam-text-muted mt-8">
                Zaten hesabın var mı?{" "}
                <Link href="/login" className="text-masam-text-primary hover:underline underline-offset-4">
                    Giriş yap
                </Link>
            </div>
        </div>
    )
}
