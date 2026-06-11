import { useEffect, useState } from "react";
import { useUIStore } from "../../store/useUIStore";

const iconMap = {
  success: (
    <svg
      className="w-4.5 h-4.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-4.5 h-4.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-4.5 h-4.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-4.5 h-4.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const colorMap = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-[#004a99]",
};

const iconBgMap = {
  success: "bg-emerald-50 text-emerald-600",
  error: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-blue-50 text-[#004a99]",
};

function ToastItem({
  id,
  type,
  message,
}: {
  id: string;
  type: keyof typeof iconMap;
  message: string;
}) {
  const removeNotification = useUIStore((s) => s.removeNotification);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const entryTimer = setTimeout(() => setShow(true), 50);

    const exitTimer = setTimeout(() => {
      setShow(false);
      setTimeout(() => removeNotification(id), 300);
    }, 4000);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
    };
  }, [id, removeNotification]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => removeNotification(id), 300);
  };

  return (
    <div
      className={`relative flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden text-sm max-w-sm w-full pointer-events-auto transition-all duration-300 ease-out transform ${
        show
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-8 opacity-0 scale-95"
      }`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${colorMap[type]}`}
      />

      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ml-1 ${iconBgMap[type]}`}
      >
        {iconMap[type]}
      </div>

      <p className="flex-1 font-medium text-slate-700 leading-snug">
        {message}
      </p>

      <button
        onClick={handleClose}
        className="p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-rose-600 transition-colors cursor-pointer shrink-0 active:scale-95"
        aria-label="Tutup"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const notifications = useUIStore((s) => s.notifications);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
      {notifications.map((n) => (
        <ToastItem key={n.id} {...n} />
      ))}
    </div>
  );
}
