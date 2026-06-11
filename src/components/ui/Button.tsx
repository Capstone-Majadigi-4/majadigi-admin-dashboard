import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[#004a99] text-white hover:bg-[#003875] disabled:bg-slate-300 disabled:text-slate-500",
  secondary:
    "bg-white text-rose-600 border border-rose-600 hover:bg-rose-50 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:bg-transparent disabled:text-slate-400",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${
        disabled || loading ? "cursor-not-allowed" : "cursor-pointer"
      } ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
