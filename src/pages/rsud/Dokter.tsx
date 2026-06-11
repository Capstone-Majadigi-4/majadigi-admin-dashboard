import { PageWrapper } from "../../components/layout";
import { Badge, Card, CardBody, CardHeader } from "../../components/ui";
import { useFetch } from "../../hooks/useFetch";
import type { Poli, KamarResponse } from "../../types";

const hariOrder = [
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
  "minggu",
];
const hariLabel: Record<string, string> = {
  senin: "Senin",
  selasa: "Selasa",
  rabu: "Rabu",
  kamis: "Kamis",
  jumat: "Jumat",
  sabtu: "Sabtu",
  minggu: "Minggu",
};

export function Dokter() {
  const {
    data: poli,
    loading: loadingPoli,
    error: errorPoli,
  } = useFetch<Poli[]>("/rsud/poli");
  const { data: kamarData, loading: loadingKamar } =
    useFetch<KamarResponse>("/rsud/kamar");

  const kamar = kamarData?.ruangan ?? [];
  const totalDokter = (poli ?? []).reduce((acc, p) => acc + p.dokter.length, 0);

  if (errorPoli) {
    return (
      <PageWrapper title="Dokter & Jadwal">
        <Card className="border-rose-200 bg-rose-50/50">
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>
              <p className="text-[13px] font-bold text-rose-700">{errorPoli}</p>
            </div>
          </CardBody>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Dokter & Jadwal"
      subtitle={`${poli?.length ?? 0} poliklinik · ${totalDokter} dokter terdaftar`}
    >
      <div className="flex flex-col gap-6">
        {loadingPoli ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-56 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(poli ?? []).map((p) => (
              <Card key={p.id} className="flex flex-col">
                <CardHeader
                  title={p.nama}
                  subtitle={`${p.dokter.length} dokter${p.lantai ? ` · Lantai ${p.lantai}` : ""}`}
                />
                <CardBody className="flex-1 space-y-5 bg-slate-50/30">
                  {p.dokter.map((dr, idx) => (
                    <div key={dr.id} className="flex flex-col gap-3">
                      <div>
                        <p className="text-[14px] font-bold text-slate-800 leading-tight mb-1">
                          {dr.nama}
                        </p>
                        <div className="flex items-center text-[12px] font-medium text-slate-500">
                          <span>{dr.spesialis}</span>
                          <span className="mx-2 text-slate-300">•</span>
                          <span className="text-[#004a99] font-bold flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {dr.jam_mulai}–{dr.jam_selesai}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hariOrder
                          .filter((h) =>
                            dr.jadwal.map((j) => j.toLowerCase()).includes(h),
                          )
                          .map((hari) => (
                            <Badge key={hari} variant="info">
                              {hariLabel[hari]}
                            </Badge>
                          ))}
                      </div>
                      {idx < p.dokter.length - 1 && (
                        <hr className="border-slate-100 mt-2" />
                      )}
                    </div>
                  ))}
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader
            title="Ketersediaan Kamar Rawat Inap"
            subtitle={
              kamarData
                ? `Total ${kamarData.total_kamar} kamar · ${kamarData.tersedia} tersedia untuk pasien`
                : "Memuat data ketersediaan kamar..."
            }
          />
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-y border-slate-200">
                  {[
                    "Nama Kamar",
                    "Kelas",
                    "Kapasitas",
                    "Terisi",
                    "Tersedia",
                    "Okupansi",
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
                {loadingKamar
                  ? [1, 2, 3, 4].map((i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-4">
                          <div className="h-6 bg-slate-50 rounded-md animate-pulse w-full" />
                        </td>
                      </tr>
                    ))
                  : kamar.map((k) => {
                      const pct = Math.round((k.terisi / k.kapasitas) * 100);
                      let barColor = "bg-emerald-500";
                      let textColor = "text-emerald-700";

                      if (pct >= 90) {
                        barColor = "bg-rose-500";
                        textColor = "text-rose-700";
                      } else if (pct >= 70) {
                        barColor = "bg-amber-400";
                        textColor = "text-amber-700";
                      }

                      return (
                        <tr
                          key={k.id}
                          className="hover:bg-slate-50/80 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 text-[13px] font-bold text-slate-800 whitespace-nowrap">
                            {k.nama}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="neutral">{k.kelas}</Badge>
                          </td>
                          <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                            {k.kapasitas}
                          </td>
                          <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                            {k.terisi}
                          </td>
                          <td className="px-6 py-4 text-[13px]">
                            <span
                              className={`font-bold ${k.tersedia === 0 ? "text-rose-600" : "text-emerald-600"}`}
                            >
                              {k.tersedia}
                            </span>
                          </td>
                          <td className="px-6 py-4 min-w-[160px]">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${barColor} transition-all duration-500 ease-out`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span
                                className={`text-[12px] font-bold w-9 text-right ${textColor}`}
                              >
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
