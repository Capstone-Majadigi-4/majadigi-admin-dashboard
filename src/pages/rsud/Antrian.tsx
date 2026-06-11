import { useState } from "react";
import { PageWrapper } from "../../components/layout";
import { Badge, Button, Card, CardBody, CardHeader } from "../../components/ui";
import { useFetch } from "../../hooks/useFetch";
import { apiFetch } from "../../services/apiClient";
import { useUIStore } from "../../store/useUIStore";
import type { Poli } from "../../types";

export function Antrian() {
  const { data: poli, loading } = useFetch<Poli[]>("/rsud/poli");
  const addNotification = useUIStore((s) => s.addNotification);
  const [callingPoli, setCallingPoli] = useState<string | null>(null);

  const handlePanggil = async (poliId: string, poliNama: string) => {
    setCallingPoli(poliId);
    try {
      await apiFetch("/rsud/webhook/panggilberikutnya", {
        method: "POST",
        body: { poli_id: poliId },
      });
      addNotification({
        type: "success",
        message: `Nomor berikutnya dipanggil di ${poliNama}`,
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
      setCallingPoli(null);
    }
  };

  return (
    <PageWrapper
      title="Antrian RSUD"
      subtitle={`Data antrian · ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}`}
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader
            title="Panggil Nomor Berikutnya"
            subtitle="Trigger notifikasi push ke pasien berikutnya per poliklinik"
          />
          <CardBody>
            <div className="flex flex-wrap gap-3">
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-40 bg-slate-100 rounded-full animate-pulse"
                    />
                  ))}
                </>
              ) : (
                (poli ?? []).map((p) => (
                  <Button
                    key={p.id}
                    variant="secondary"
                    size="sm"
                    loading={callingPoli === p.id}
                    onClick={() => handlePanggil(p.id, p.nama)}
                  >
                    <svg
                      className="w-4 h-4 shrink-0 text-slate-400"
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
                    <span>{p.nama}</span>
                  </Button>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Daftar Poliklinik Aktif"
            subtitle="Data dari endpoint GET /rsud/poli"
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

        <Card className="border-amber-200 bg-amber-50/30">
          <CardBody>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="pt-0.5">
                <h4 className="text-[13px] font-bold text-amber-800 uppercase tracking-wide mb-1.5">
                  Listing Antrian Belum Tersedia
                </h4>
                <p className="text-[13px] text-amber-700 leading-relaxed font-medium">
                  Endpoint{" "}
                  <code className="font-mono bg-amber-200/50 text-amber-800 px-1.5 py-0.5 rounded text-[11px] font-bold tracking-tight">
                    GET /rsud/antrean
                  </code>{" "}
                  belum didefinisikan di API spec.
                  <br className="mb-1" />
                  Saat ini hanya tersedia:{" "}
                  <code className="font-mono bg-amber-200/50 text-amber-800 px-1.5 py-0.5 rounded text-[11px] font-bold tracking-tight">
                    POST /rsud/antrean
                  </code>{" "}
                  (buat antrian baru) dan{" "}
                  <code className="font-mono bg-amber-200/50 text-amber-800 px-1.5 py-0.5 rounded text-[11px] font-bold tracking-tight">
                    GET /rsud/antrean/{"{id}"}/status
                  </code>{" "}
                  (cek status per ID).
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}
