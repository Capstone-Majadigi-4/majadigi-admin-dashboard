import { PageWrapper } from '../../components/layout';
import { Badge, Card, CardBody, CardHeader } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import type { Poli, KamarResponse } from '../../types';

const hariOrder = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
const hariLabel: Record<string, string> = {
  senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu',
  kamis: 'Kamis', jumat: 'Jumat', sabtu: 'Sabtu', minggu: 'Minggu',
};

export function Dokter() {
  const { data: poli, loading: loadingPoli, error: errorPoli } = useFetch<Poli[]>('/rsud/poli');
  const { data: kamarData, loading: loadingKamar } = useFetch<KamarResponse>('/rsud/kamar');

  const kamar = kamarData?.ruangan ?? [];
  const totalDokter = (poli ?? []).reduce((acc, p) => acc + p.dokter.length, 0);

  if (errorPoli) {
    return (
      <PageWrapper title="Dokter & Jadwal">
        <Card><CardBody><p className="text-red-500 text-sm">{errorPoli}</p></CardBody></Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Dokter & Jadwal"
      subtitle={`${poli?.length ?? 0} poliklinik · ${totalDokter} dokter terdaftar`}
    >
      {loadingPoli ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(poli ?? []).map((p) => (
            <Card key={p.id}>
              <CardHeader title={p.nama} subtitle={`${p.dokter.length} dokter${p.lantai ? ` · ${p.lantai}` : ''}`} />
              <CardBody className="space-y-4">
                {p.dokter.map((dr, idx) => (
                  <div key={dr.id} className="flex flex-col gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{dr.nama}</p>
                      <p className="text-xs text-gray-500">{dr.spesialis} · {dr.jam_mulai}–{dr.jam_selesai}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {hariOrder
                        .filter((h) => dr.jadwal.map((j) => j.toLowerCase()).includes(h))
                        .map((hari) => (
                          <Badge key={hari} variant="info">{hariLabel[hari]}</Badge>
                        ))}
                    </div>
                    {idx < p.dokter.length - 1 && <hr className="border-gray-100" />}
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
          subtitle={kamarData ? `Total ${kamarData.total_kamar} kamar · ${kamarData.tersedia} tersedia` : undefined}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Nama Kamar', 'Kelas', 'Kapasitas', 'Terisi', 'Tersedia', 'Okupansi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingKamar
                ? [1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-5 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : kamar.map((k) => {
                    const pct = Math.round((k.terisi / k.kapasitas) * 100);
                    let barColor = 'bg-green-500';
                    if (pct >= 90) barColor = 'bg-red-500';
                    else if (pct >= 70) barColor = 'bg-yellow-400';
                    return (
                      <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{k.nama}</td>
                        <td className="px-4 py-3"><Badge variant="neutral">{k.kelas}</Badge></td>
                        <td className="px-4 py-3 text-gray-600">{k.kapasitas}</td>
                        <td className="px-4 py-3 text-gray-600">{k.terisi}</td>
                        <td className="px-4 py-3">
                          <span className={k.tersedia === 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                            {k.tersedia}
                          </span>
                        </td>
                        <td className="px-4 py-3 w-32">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </Card>
    </PageWrapper>
  );
}
