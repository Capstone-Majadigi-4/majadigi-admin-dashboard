import { useUIStore } from "../../store/useUIStore";
import { useAuth } from "../../hooks/useAuth";

export function Navbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { user, logout } = useAuth();

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      <button
        onClick={toggleSidebar}
        className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all duration-200 cursor-pointer active:scale-95"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
              {user?.nama ?? "Admin"}
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              NIK: {user?.nik ?? "-"}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <button
          onClick={logout}
          className="group p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 cursor-pointer active:scale-95"
          title="Logout"
        >
          <svg
            className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
