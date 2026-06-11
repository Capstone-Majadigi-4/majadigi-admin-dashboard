interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-100/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
      <div className="flex flex-col justify-center">
        <h3 className="text-[15px] font-bold text-slate-800 tracking-tight leading-none">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="ml-4 shrink-0 flex items-center">{action}</div>
      )}
    </div>
  );
}

export function CardBody({ children, className = "" }: CardProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
