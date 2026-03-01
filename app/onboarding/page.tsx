import { OnboardingWizard } from "@/components/auth/onboarding-wizard"

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-masam-black flex flex-col items-center justify-center px-6 py-16">
            <OnboardingWizard />
        </div>
    )
}
