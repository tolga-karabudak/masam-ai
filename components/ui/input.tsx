import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, hasError, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-sm border bg-masam-black/50 px-4 py-2 text-sm text-masam-text-primary transition-colors",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    "placeholder:text-masam-text-muted focus-visible:outline-none focus-visible:border-masam-border-strong",
                    "disabled:cursor-not-allowed disabled:bg-masam-elevated disabled:text-masam-text-faint",
                    hasError ? "border-masam-error" : "border-masam-border-default",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
