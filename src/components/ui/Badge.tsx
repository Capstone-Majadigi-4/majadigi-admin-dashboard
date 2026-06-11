type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClass: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-600 border-emerald-200",
  warning: "bg-amber-50 text-amber-600 border-amber-200",
  danger: "bg-rose-50 text-rose-600 border-rose-200",
  info: "bg-blue-50 text-blue-600 border-blue-200",
  neutral: "bg-slate-50 text-slate-600 border-slate-200",
};

export function Badge({ variant = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${variantClass[variant]}`}
    >
      {children}
    </span>
  );
}
