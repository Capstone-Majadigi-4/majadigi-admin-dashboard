import { useState } from 'react';
import { PageWrapper } from '../../components/layout';
import { Badge, Button, Card, CardBody, CardHeader, Modal } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { apiFetch } from '../../services/apiClient';
import { useUIStore } from '../../store/useUIStore';
import type { Tiket } from '../../types';

type StatusFilter = '' | 'valid' | 'digunakan' | 'expired';

function TiketStatusBadge({ status }: { status: string }) {
  if (status === 'valid') return <Badge variant="success">Valid</Badge>;
  if (status === 'digunakan') return <Badge variant="neutral">Digunakan</Badge>;
  if (status === 'expired') return <Badge variant="danger">Expired</Badge>;
  return <Badge variant="neutral">{status}</Badge>;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

export function Tiket() {
  const addNotification = useUIStore((s) => s.addNotification);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  const { data: tiket, loading, error, refetch } = useFetch<Tiket[]>('/transjatim/tiket');

  const [selectedTiket, setSelectedTiket] = useState<Tiket | null>(null);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleValidasi = async () => {
    if (!selectedTiket || !otp.trim()) {
      addNotification({ type: 'error', message: 'OTP wajib diisi' });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/transjatim/tiket/${selectedTiket.id}/validasi`, {
        method: 'POST',
        body: { otp },
      });
      addNotification({ type: 'success', message: 'Tiket berhasil divalidasi' });
      setSelectedTiket(null);
      setOtp('');
      refetch();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal validasi tiket' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (tiket ?? []).filter((t) => !statusFilter || t.status === statusFilter);

  return (
    <PageWrapper title="Tiket Transjatim" subtitle="Daftar tiket & validasi OTP">
      <Card>
        <CardBody className="flex items-center gap-3">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-600 shrink-0">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={`${inputCls} max-w-48`}
          >
            <option value="">Semua Status</option>
            <option value="valid">Valid</option>
            <option value="digunakan">Digunakan</option>
            <option value="expired">Expired</option>
          </select>
          <Button size="sm" variant="secondary" onClick={refetch}>Refresh</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Daftar Tiket" subtitle={`${filtered.length} tiket`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['ID Tiket', 'NIK Pengguna', 'Koridor', 'Jumlah', 'Total', 'Status', 'Valid Sampai', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
                : error
                  ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-red-500">{error}</td>
                    </tr>
                  )
                  : filtered.length === 0
                    ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                          Tidak ada tiket ditemukan
                        </td>
                      </tr>
                    )
                    : filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.id.slice(0, 8)}…</td>
                        <td className="px-4 py-3 text-gray-800">{t.user_nik}</td>
                        <td className="px-4 py-3 text-gray-600">{t.koridor?.nama ?? t.koridor_id}</td>
                        <td className="px-4 py-3 text-gray-800">{t.jumlah}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{formatRupiah(t.total)}</td>
                        <td className="px-4 py-3"><TiketStatusBadge status={t.status} /></td>
                        <td className="px-4 py-3 text-gray-500">{t.valid_sampai}</td>
                        <td className="px-4 py-3">
                          {t.status === 'valid' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => { setSelectedTiket(t); setOtp(''); }}
                            >
                              Validasi OTP
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!selectedTiket}
        title="Validasi OTP Tiket"
        onClose={() => setSelectedTiket(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelectedTiket(null)}>Batal</Button>
            <Button loading={submitting} onClick={handleValidasi}>Validasi</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedTiket && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">ID Tiket</span>
                <span className="font-mono text-xs">{selectedTiket.id.slice(0, 8)}…</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">NIK</span>
                <span>{selectedTiket.user_nik}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Koridor</span>
                <span>{selectedTiket.koridor?.nama ?? selectedTiket.koridor_id}</span>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="otp-input" className={labelCls}>OTP dari QR Code</label>
            <input
              id="otp-input"
              type="text"
              placeholder="Masukkan kode OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleValidasi(); }}
              className={inputCls}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">
              Status tiket akan berubah jadi <strong>digunakan</strong>
            </p>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
