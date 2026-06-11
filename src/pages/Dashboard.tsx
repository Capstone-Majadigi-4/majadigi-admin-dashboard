import { Link } from "react-router-dom";
import { PageWrapper } from "../components/layout";
import { useAuth } from "../hooks/useAuth";

const modules = [
  {
    id: "rsud",
    title: "Layanan RSUD",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    menus: [
      {
        label: "Antrian Pasien",
        path: "/rsud/antrian",
        desc: "Manajemen panggilan antrian poliklinik",
      },
      {
        label: "Dokter & Kamar",
        path: "/rsud/dokter",
        desc: "Jadwal praktik dan ketersediaan rawat inap",
      },
    ],
  },
  {
    id: "islamic",
    title: "Islamic Center",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    menus: [
      {
        label: "Acara Keislaman",
        path: "/islamic/acara",
        desc: "Kelola jadwal kajian dan agenda masjid",
      },
      {
        label: "Booking Fasilitas",
        path: "/islamic/booking",
        desc: "Persetujuan peminjaman area Islamic Center",
      },
    ],
  },
  {
    id: "komoditas",
    title: "Pantauan Komoditas",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    menus: [
      {
        label: "Harga Pasar",
        path: "/komoditas",
        desc: "Pantau harga rata-rata bahan pokok harian",
      },
    ],
  },
  {
    id: "transjatim",
    title: "Transjatim",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3m-9 0h9M8 17v2m8-2v2M3 10h18"
        />
      </svg>
    ),
    menus: [
      {
        label: "Rute & Koridor",
        path: "/transjatim",
        desc: "Informasi jalur operasional dan halte aktif",
      },
    ],
  },
];

export function Dashboard() {
  const { user } = useAuth();

  // Format tanggal hari ini (opsional, untuk menambah kesan personal pada banner)
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <PageWrapper
      title="Portal Cepat"
      subtitle="Navigasi ke seluruh modul layanan"
    >
      {/* Welcoming Banner */}
      <div className="relative bg-[#004a99] rounded-2xl p-7 md:p-9 mb-8 overflow-hidden shadow-sm shadow-slate-200/50">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white/90 text-[11px] font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {today}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
            Selamat datang, {user?.nama ?? "Admin"}!
          </h1>
          <p className="text-blue-100 font-medium text-[14px] md:max-w-xl leading-relaxed">
            Pilih modul layanan di bawah ini untuk mulai mengelola data dan
            memantau sistem operasional Majadigi Super App hari ini.
          </p>
        </div>

        {/* Dekorasi Aksen Flat Minimalis di Background Banner */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none"></div>
        <div className="absolute right-32 -bottom-12 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
      </div>

      {/* Grid Katalog Layanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-100/50 flex flex-col overflow-hidden"
          >
            {/* Header Modul */}
            <div className="flex items-center gap-4 p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="w-12 h-12 rounded-xl bg-[#004a99]/10 text-[#004a99] flex items-center justify-center shrink-0">
                {module.icon}
              </div>
              <h2 className="text-[16px] font-bold text-slate-800 tracking-tight">
                {module.title}
              </h2>
            </div>

            {/* Daftar Sub-Menu */}
            <div className="p-3 flex-1 flex flex-col gap-1">
              {module.menus.map((menu, idx) => (
                <Link
                  key={idx}
                  to={menu.path}
                  className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200 ease-out active:scale-[0.99] outline-none"
                >
                  <div className="flex flex-col pr-4">
                    <h3 className="text-[14px] font-bold text-slate-800 mb-0.5 group-hover:text-[#004a99] transition-colors">
                      {menu.label}
                    </h3>
                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed">
                      {menu.desc}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-[#004a99] group-hover:text-white transition-colors duration-200">
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}
