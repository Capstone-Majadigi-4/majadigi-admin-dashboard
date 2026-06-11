import { useState } from 'react';
import { PageWrapper } from '../../components/layout';
import { Badge, Button, Card, CardBody, CardHeader } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { apiFetch } from '../../services/apiClient';
import { useUIStore } from '../../store/useUIStore';
import type { Poli } from '../../types';

export function Antrian() {
  const { data: poli, loading } = useFetch<Poli[]>('/rsud/poli');
  const addNotification = useUIStore((s) => s.addNotification);
  const [callingPoli, setCallingPoli] = useState<string | null>(null);

  const handlePanggil = async (poliId: string, poliNama: string) => {
    setCallingPoli(poliId);
    try {
      await apiFetch('/rsud/webhook/panggilberikutnya', {
        method: 'POST',
        body: { poli_id: poliId },
      });
      addNotification({ type: 'success', message: `Nomor berikutnya dipanggil di ${poliNama}` });
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal memanggil nomor berikutnya',
      });
    } finally {
      setCallingPoli(null);
    }
  };

  return (
    <PageWrapper
      title="Antrian RSUD"
      subtitle={`Data antrian · ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`}
    >
      <Card>
        <CardHeader
          title="Panggil Nomor Berikutnya"
          subtitle="Trigger notifikasi push ke pasien berikutnya per poliklinik"
        />
        <CardBody className="flex flex-wrap gap-3">
          {loading ? (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (poli ?? []).map((p) => (
            <Button
              key={p.id}
              variant="secondary"
              size="sm"
              loading={callingPoli === p.id}
              onClick={() => handlePanggil(p.id, p.nama)}
            >
              📢 {p.nama}
            </Button>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Daftar Poliklinik Aktif" subtitle="Data dari GET /rsud/poli" />
        {loading ? (
          <CardBody>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['Poliklinik', 'Jumlah Dokter', 'Dokter Bertugas'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(poli ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{p.dokter.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.dokter.map((dr) => (
                          <Badge key={dr.id} variant="neutral">{dr.nama}</Badge>
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

      <Card>
        <CardBody>
          <div className="flex items-start gap-3 text-sm text-amber-700 bg-amber-50 rounded-lg p-4">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Listing antrian belum tersedia di API spec</p>
              <p className="text-amber-600 mt-0.5">
                Endpoint <code className="font-mono bg-amber-100 px-1 rounded">GET /rsud/antrean</code> belum didefinisikan.
                Tersedia: <code className="font-mono bg-amber-100 px-1 rounded">POST /rsud/antrean</code> (buat antrian) dan{' '}
                <code className="font-mono bg-amber-100 px-1 rounded">GET /rsud/antrean/{'{id}'}/status</code> (cek per ID).
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </PageWrapper>
  );
}
