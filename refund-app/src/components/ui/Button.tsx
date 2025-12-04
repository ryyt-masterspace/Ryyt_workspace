import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        const variants = {
            primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 border border-blue-400/20",
            ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
            outline: "bg-white/5 border border-white/10 hover:bg-white/10 text-white",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-6 py-2.5 text-sm",
            lg: "px-8 py-3 text-base",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
