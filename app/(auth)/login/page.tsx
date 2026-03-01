import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen bg-masam-black">
            {/* LEFT HALF */}
            <div className="hidden lg:flex flex-1 relative bg-masam-elevated">
                <Image
                    src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2042&auto=format&fit=crop"
                    alt="Setup background"
                    fill
                    className="object-cover"
                    sizes="50vw"
                    priority
                />
                <div className="absolute inset-0 bg-masam-black/40"></div>

                <div className="absolute inset-0 flex flex-col justify-center px-16 z-10">
                    <h1 className="text-[48px] font-bold text-masam-text-primary tracking-tight mb-2">masam.ai</h1>
                    <p className="text-[16px] text-masam-text-secondary">Masanı hayal et. Ürünleri dene.</p>
                </div>
            </div>

            {/* RIGHT HALF */}
            <div className="flex flex-1 items-center justify-center p-8 lg:p-16">
                <LoginForm />
            </div>
        </div>
    )
}
