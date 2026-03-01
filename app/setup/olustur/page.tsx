import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SetupOlusturClient } from "@/components/setup/setup-olustur-client"

export default async function SetupOlusturPage() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        redirect("/login")
    }
    const userVibe = (session.user.user_metadata?.vibe as string) || "shadow_realm"
    return (
        <div className="min-h-screen bg-masam-black pt-24 px-6 lg:px-12 pb-24">
            <SetupOlusturClient userVibe={userVibe} />
        </div>
    )
}
