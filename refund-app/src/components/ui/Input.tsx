import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none"></div>
                    <input
                        ref={ref}
                        className={cn(
                            "relative w-full bg-[#0A0A0A] border border-white/10 text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-blue-500/50 focus:bg-[#111] transition-all placeholder:text-gray-600",
                            error && "border-red-500/50 focus:border-red-500",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
