import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger"
    size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center font-medium uppercase transition-colors outline-none",
                    "focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-masam-border-strong focus-visible:ring-offset-masam-black",
                    "disabled:opacity-50 disabled:pointer-events-none",

                    // Variants
                    {
                        "bg-masam-border-strong text-masam-black hover:bg-[#e0e0e0] active:bg-[#cccccc]": variant === "primary",
                        "bg-transparent text-masam-text-primary border border-masam-border-strong hover:bg-masam-hover active:bg-masam-border-default": variant === "secondary",
                        "bg-transparent text-masam-text-secondary hover:text-masam-text-primary hover:underline underline-offset-4": variant === "ghost",
                        "bg-transparent text-masam-error border border-masam-error hover:bg-masam-error/10": variant === "danger",
                    },

                    // Sizes
                    {
                        "h-7 px-3 text-[11px] tracking-[0.06em] rounded-sm": size === "sm",
                        "h-10 px-5 text-[13px] tracking-[0.06em] rounded-sm": size === "md",
                        "h-12 px-6 text-[14px] tracking-[0.06em] rounded-sm": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
