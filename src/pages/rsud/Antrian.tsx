import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { PageWrapper } from "../../components/layout";
import { Badge, Button, Card, CardBody, CardHeader } from "../../components/ui";
import { useFetch } from "../../hooks/useFetch";
import { apiFetch } from "../../services/apiClient";
import { useUIStore } from "../../store/useUIStore";
import type { Poli } from "../../types";

// Tipe data berdasarkan payload dari screenshot
interface AntreanBaru {
  id: string;
  nomor_antrean: string;
  estimasi_jam: string;
  dokter: string;
  status: string;
}

interface AntreanDipanggil {
  nomor_dipanggil: string;
  poli: string;
  timestamp: string;
}

const inputCls =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#004a99]/10 focus:border-[#004a99] transition-all duration-200";
const labelCls =
  "block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide";

function LiveMonitor({ poli }: { poli: Poli }) {
  const addNotification = useUIStore((s) => s.addNotification);

  const [isConnected, setIsConnected] = useState(false);
  const [currentCalled, setCurrentCalled] = useState<AntreanDipanggil | null>(
    null,
  );
  const [waitingList, setWaitingList] = useState<AntreanBaru[]>([]);
  const [isCalling, setIsCalling] = useState(false);

  // Socket.IO Integration
  useEffect(() => {
    if (!poli.id) return;

    // Reset state ketika pindah poli
    setCurrentCalled(null);
    setWaitingList([]);

    const socket: Socket = io("http://157.10.253.219", {
      path: "/api/v1/rsud/antrean/live", // Path sesuai konfigurasi backend
      query: { poli_id: poli.id },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", (err) => {
      console.error("Socket Error:", err.message);
      setIsConnected(false);
    });

    // Asumsi: QUEUE_STATE mengirimkan list antrean awal saat pertama connect
    socket.on("QUEUE_STATE", (payload: any) => {
      if (Array.isArray(payload)) {
        setWaitingList(payload);
      } else if (payload && payload.antrean) {
        setWaitingList(payload.antrean);
      }
    });

    // Menangkap antrean baru yang mendaftar
    socket.on("ANTREAN_BARU", (payload: AntreanBaru) => {
      setWaitingList((prev) => [...prev, payload]);
    });

    // Menangkap nomor yang sedang dipanggil
    socket.on("ANTREAN_DIPANGGIL", (payload: AntreanDipanggil) => {
      setCurrentCalled(payload);
      // Opsional: Hapus nomor yang dipanggil dari waiting list
      setWaitingList((prev) =>
        prev.filter((q) => q.nomor_antrean !== payload.nomor_dipanggil),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [poli.id]);

  const handlePanggilBerikutnya = async () => {
    setIsCalling(true);
    try {
      await apiFetch("/rsud/webhook/panggilberikutnya", {
        method: "POST",
        body: { poli_id: poli.id },
      });
      addNotification({
        type: "success",
        message: `Berhasil memicu panggilan antrean di ${poli.nama}`,
      });
    } catch (err) {
      addNotification({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Gagal memanggil nomor berikutnya",
      });
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Status Koneksi Socket */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
          ></div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {isConnected ? "Live Tracking Aktif" : "Terputus dari Server"}
          </span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Kiri: Nomor Dipanggil */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-[#004a99] rounded-2xl p-6 text-center shadow-lg shadow-[#004a99]/20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(white_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
            <div className="relative z-10">
              <h3 className="text-white/80 text-[12px] font-bold uppercase tracking-widest mb-2">
                Nomor Antrean
              </h3>
              <p className="text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-md">
                {currentCalled ? currentCalled.nomor_dipanggil : "---"}
              </p>
              <Badge
                variant="neutral"
                className="bg-white/20 text-white border-0 backdrop-blur-sm"
              >
                {currentCalled?.poli ?? poli.nama}
              </Badge>
              {currentCalled?.timestamp && (
                <p className="text-[10px] text-white/60 mt-4 font-mono">
                  Dipanggil:{" "}
                  {new Date(currentCalled.timestamp).toLocaleTimeString(
                    "id-ID",
                  )}
                </p>
              )}
            </div>
          </div>

          <Button
            size="lg"
            className="w-full py-4 text-[14px]"
            loading={isCalling}
            onClick={handlePanggilBerikutnya}
            disabled={!isConnected}
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
            Panggil Berikutnya
          </Button>
        </div>

        {/* Panel Kanan: Daftar Antrean Baru / Menunggu */}
        <div className="lg:col-span-2 border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
            <h3 className="text-[14px] font-bold text-slate-800">
              Daftar Antrean Menunggu
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Live update dari pendaftaran baru
            </p>
          </div>

          {waitingList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 bg-white">
              <svg
                className="w-12 h-12 mb-3 text-slate-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-[13px] font-medium tracking-wide">
                Belum ada antrean baru yang masuk
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[300px] w-full bg-white">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b border-slate-100">
                    {["Nomor", "Estimasi Jam", "Dokter Tujuan", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {waitingList.map((q, idx) => (
                    <tr
                      key={q.id ?? idx}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-[14px] text-slate-800">
                          {q.nomor_antrean}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-slate-500 font-mono">
                        {q.estimasi_jam}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-slate-600">
                        {q.dokter}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="warning">{q.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Antrian() {
  const { data: poli, loading } = useFetch<Poli[]>("/rsud/poli");
  const [activePoliId, setActivePoliId] = useState<string>("");

  const activePoli = (poli ?? []).find((p) => p.id === activePoliId);

  return (
    <PageWrapper
      title="Live Antrean RSUD"
      subtitle={`Monitoring antrean real-time · ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}`}
    >
      <div className="flex flex-col gap-6">
        {/* Filter Poliklinik */}
        <Card>
          <CardBody className="p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full flex-1">
              <label htmlFor="poli-filter" className={labelCls}>
                Pilih Poliklinik untuk Monitor
              </label>
              <select
                id="poli-filter"
                value={activePoliId}
                onChange={(e) => setActivePoliId(e.target.value)}
                className={inputCls}
                disabled={loading}
              >
                <option value="">-- Pilih Poliklinik --</option>
                {(poli ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>
          </CardBody>
        </Card>

        {/* Live Monitor Card */}
        <Card className="overflow-hidden">
          <CardHeader
            title="Dashboard Monitor"
            subtitle={
              activePoli
                ? `Menampilkan data live dari ${activePoli.nama}`
                : "Pilih poliklinik di atas untuk memulai"
            }
          />
          {activePoli ? (
            <LiveMonitor poli={activePoli} />
          ) : (
            <div className="px-6 py-16 flex flex-col items-center justify-center text-slate-400">
              <svg
                className="w-12 h-12 mb-3 text-slate-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-[13px] font-medium tracking-wide">
                Pilih poliklinik untuk menghubungkan ke live socket
              </p>
            </div>
          )}
        </Card>

        {/* Informasi Poliklinik (Overview bawah) */}
        <Card>
          <CardHeader
            title="Daftar Poliklinik & Dokter"
            subtitle="Ringkasan data poliklinik aktif di RSUD"
          />
          {loading ? (
            <CardBody>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-slate-50 border border-slate-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </CardBody>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-y border-slate-200">
                    {["Poliklinik", "Jumlah Dokter", "Dokter Bertugas"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(poli ?? []).map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-800 whitespace-nowrap">
                        {p.nama}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          {p.dokter.length}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {p.dokter.map((dr) => (
                            <Badge key={dr.id} variant="neutral">
                              {dr.nama}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
}
