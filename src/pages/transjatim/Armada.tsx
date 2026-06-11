import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { PageWrapper } from "../../components/layout";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
} from "../../components/ui";
import { useFetch } from "../../hooks/useFetch";
import { apiFetch } from "../../services/apiClient";
import { useUIStore } from "../../store/useUIStore";
import type { Armada, Koridor } from "../../types";

interface UpdateLokasiForm {
  lat: string;
  lng: string;
}

function ArmadaStatusBadge({ status }: { status: string }) {
  return status === "aktif" ? (
    <Badge variant="success">Aktif</Badge>
  ) : (
    <Badge variant="neutral">Nonaktif</Badge>
  );
}

const inputCls =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#004a99]/10 focus:border-[#004a99] transition-all duration-200";
const labelCls =
  "block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide";

const createBusIcon = (status: string) => {
  const bgColor = status === "aktif" ? "bg-emerald-500" : "bg-slate-400";
  return L.divIcon({
    className: "bg-transparent",
    html: `
      <div class="w-9 h-9 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${bgColor} text-white transition-transform hover:scale-110">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3m-9 0h9M8 17v2m8-2v2M3 10h18" />
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

function ArmadaTable({
  koridorId,
  onUpdateLokasi,
}: {
  koridorId: string;
  onUpdateLokasi: (a: Armada) => void;
}) {
  const {
    data: initialArmada,
    loading,
    error,
  } = useFetch<Armada[]>(`/transjatim/armada/koridor/${koridorId}`);

  const [liveArmada, setLiveArmada] = useState<Armada[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (initialArmada) {
      setLiveArmada(initialArmada);
    }
  }, [initialArmada]);

  // Socket.IO Integration
  useEffect(() => {
    if (!koridorId) return;

    // Menghapus transports: ["websocket"] agar menggunakan default fallback (polling -> websocket)
    const socket: Socket = io("http://157.10.253.219", {
      path: "/api/v1/transjatim/armada/live",
      query: { koridor_id: koridorId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("Socket terhubung dengan ID:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket terputus. Alasan:", reason);
      setIsConnected(false);
    });

    // Tangkap error koneksi untuk mempermudah debugging di inspect element
    socket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err.message);
      setIsConnected(false);
    });

    socket.on("ARMADA_BERGERAK", (payload: Armada) => {
      setLiveArmada((prev) =>
        prev.map((a) =>
          a.id === payload.id
            ? {
                ...a,
                lat: payload.lat,
                lng: payload.lng,
                updated_at: payload.updated_at,
              }
            : a,
        ),
      );
    });

    socket.on("ARMADA_STATE", (payload: Armada) => {
      setLiveArmada((prev) =>
        prev.map((a) =>
          a.id === payload.id
            ? { ...a, status: payload.status, updated_at: payload.updated_at }
            : a,
        ),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [koridorId]);

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 bg-slate-50 border border-slate-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-rose-500">
        <svg
          className="w-10 h-10 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        <p className="text-[13px] font-bold">{error}</p>
      </div>
    );
  }

  if (liveArmada.length === 0) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-slate-400">
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
            d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3m-9 0h9M8 17v2m8-2v2M3 10h18"
          />
        </svg>
        <p className="text-[13px] font-medium tracking-wide">
          Tidak ada armada terdaftar di koridor ini
        </p>
      </div>
    );
  }

  // Mencegah crash jika data latitude/longitude corrupt
  const validArmada = liveArmada.find(
    (a) =>
      a.lat != null &&
      a.lng != null &&
      !isNaN(Number(a.lat)) &&
      !isNaN(Number(a.lng)),
  );

  const mapCenter: [number, number] = validArmada
    ? [Number(validArmada.lat), Number(validArmada.lng)]
    : [-7.250445, 112.768845];

  return (
    <div className="flex flex-col">
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

      <div className="p-6 pb-2">
        <div className="w-full h-[400px] border border-slate-200 rounded-2xl overflow-hidden relative z-0 shadow-inner">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {liveArmada.map((armada) => {
              // Validasi agar Map/Leaflet tidak crash jika menerima Null/String kosong
              const lat = Number(armada.lat);
              const lng = Number(armada.lng);

              if (
                isNaN(lat) ||
                isNaN(lng) ||
                armada.lat == null ||
                armada.lng == null
              ) {
                return null;
              }

              return (
                <Marker
                  key={armada.id}
                  position={[lat, lng]}
                  icon={createBusIcon(armada.status)}
                >
                  <Popup className="rounded-xl overflow-hidden">
                    <div className="p-1 -m-1 min-w-[120px]">
                      <p className="text-[14px] font-bold text-slate-800 mb-1">
                        {armada.kode_bus}
                      </p>
                      <p className="text-[12px] font-medium text-slate-500 mb-2">
                        Kapasitas: {armada.kapasitas} pax
                      </p>
                      <ArmadaStatusBadge status={armada.status} />
                      <p className="text-[10px] text-slate-400 mt-3 font-mono border-t border-slate-100 pt-2">
                        {lat.toFixed(5)}, {lng.toFixed(5)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      <div className="overflow-x-auto w-full mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-y border-slate-200">
              {[
                "Kode Bus",
                "Kapasitas",
                "Status",
                "Latitude",
                "Longitude",
                "Update Terakhir",
                "Aksi",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {liveArmada.map((a) => {
              // Memastikan konversi aman saat merender ke tabel
              const safeLat =
                a.lat != null && !isNaN(Number(a.lat))
                  ? Number(a.lat).toFixed(5)
                  : "—";
              const safeLng =
                a.lng != null && !isNaN(Number(a.lng))
                  ? Number(a.lng).toFixed(5)
                  : "—";

              return (
                <tr
                  key={a.id}
                  className="hover:bg-slate-50/80 transition-colors duration-200 group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#004a99]/10 flex items-center justify-center shrink-0">
                        <svg
                          className="w-4 h-4 text-[#004a99]"
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
                      </div>
                      <span className="font-bold text-[13px] text-slate-800">
                        {a.kode_bus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-slate-500 whitespace-nowrap">
                    {a.kapasitas} <span className="text-slate-400">pax</span>
                  </td>
                  <td className="px-6 py-4">
                    <ArmadaStatusBadge status={a.status} />
                  </td>
                  <td className="px-6 py-4 font-mono text-[12px] font-medium text-slate-500 transition-colors duration-300 group-hover:text-[#004a99]">
                    {safeLat}
                  </td>
                  <td className="px-6 py-4 font-mono text-[12px] font-medium text-slate-500 transition-colors duration-300 group-hover:text-[#004a99]">
                    {safeLng}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-[12px] font-medium whitespace-nowrap">
                    {a.updated_at
                      ? new Date(a.updated_at).toLocaleTimeString("id-ID")
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onUpdateLokasi(a)}
                    >
                      Update Lokasi
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Armada() {
  const addNotification = useUIStore((s) => s.addNotification);

  const [koridorFilter, setKoridorFilter] = useState("");
  const [activeKoridor, setActiveKoridor] = useState("");

  const { data: koridor } = useFetch<Koridor[]>("/transjatim/koridor");

  const [selectedArmada, setSelectedArmada] = useState<Armada | null>(null);
  const [form, setForm] = useState<UpdateLokasiForm>({ lat: "", lng: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleFilter = () => {
    setActiveKoridor(koridorFilter);
  };

  const handleUpdateLokasi = async () => {
    if (!selectedArmada || !form.lat || !form.lng) {
      addNotification({ type: "error", message: "Lat dan Lng wajib diisi" });
      return;
    }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      addNotification({
        type: "error",
        message: "Lat dan Lng harus berupa angka",
      });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/transjatim/armada/${selectedArmada.id}/lokasi`, {
        method: "PUT",
        body: { lat, lng },
      });
      addNotification({
        type: "success",
        message: `Lokasi ${selectedArmada.kode_bus} berhasil diperbarui`,
      });
      setSelectedArmada(null);
      setForm({ lat: "", lng: "" });
    } catch (err) {
      addNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal update lokasi",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openUpdateModal = (a: Armada) => {
    setSelectedArmada(a);
    setForm({
      lat: a.lat != null ? Number(a.lat).toString() : "",
      lng: a.lng != null ? Number(a.lng).toString() : "",
    });
  };

  return (
    <PageWrapper
      title="Armada Transjatim"
      subtitle="Tracking live posisi armada per koridor"
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardBody className="flex flex-col sm:flex-row items-center gap-4 p-5">
            <div className="w-full sm:w-auto flex-1">
              <label htmlFor="koridor-filter" className={labelCls}>
                Pilih Koridor
              </label>
              <select
                id="koridor-filter"
                value={koridorFilter}
                onChange={(e) => setKoridorFilter(e.target.value)}
                className={inputCls}
              >
                <option value="">
                  -- Pilih koridor yang ingin dipantau --
                </option>
                {(koridor ?? []).map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.kode} — {k.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-auto pt-0 sm:pt-6">
              <Button
                className="w-full sm:w-auto"
                onClick={handleFilter}
                disabled={!koridorFilter}
              >
                Tampilkan Armada
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title="Monitoring Armada"
            subtitle={
              activeKoridor
                ? ((koridor ?? []).find((k) => k.id === activeKoridor)?.nama ??
                  activeKoridor)
                : "Pilih koridor pada filter di atas"
            }
          />
          {activeKoridor ? (
            <ArmadaTable
              koridorId={activeKoridor}
              onUpdateLokasi={openUpdateModal}
            />
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
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <p className="text-[13px] font-medium tracking-wide">
                Pilih koridor untuk memulai live tracking
              </p>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={!!selectedArmada}
        title="Update Lokasi Manual"
        onClose={() => setSelectedArmada(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setSelectedArmada(null)}>
              Batal
            </Button>
            <Button loading={submitting} onClick={handleUpdateLokasi}>
              Update Lokasi
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {selectedArmada && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                  Kode Bus
                </span>
                <span className="text-[13px] font-bold text-slate-800">
                  {selectedArmada.kode_bus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                  Kapasitas
                </span>
                <span className="text-[13px] font-bold text-slate-800">
                  {selectedArmada.kapasitas} pax
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lat-input" className={labelCls}>
                Latitude <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="lat-input"
                type="number"
                step="any"
                placeholder="-7.305"
                value={form.lat}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lat: e.target.value }))
                }
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="lng-input" className={labelCls}>
                Longitude <span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                id="lng-input"
                type="number"
                step="any"
                placeholder="112.731"
                value={form.lng}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lng: e.target.value }))
                }
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
