import { useState } from 'react';
import { PageWrapper } from '../../components/layout';
import { Badge, Button, Card, CardHeader, Modal } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { apiFetch } from '../../services/apiClient';
import { useUIStore } from '../../store/useUIStore';
import type { Booking, BookingStatus, Fasilitas } from '../../types';

const ISLAMIC_ADMIN_KEY = import.meta.env.VITE_ISLAMIC_ADMIN_KEY as string | undefined;

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

const BOOKING_STATUS_BADGE: Record<BookingStatus, { label: string; variant: 'warning' | 'success' | 'danger' }> = {
  pending_review: { label: 'Pending', variant: 'warning' },
  disetujui: { label: 'Disetujui', variant: 'success' },
  ditolak: { label: 'Ditolak', variant: 'danger' },
};

const STATUS_TABS: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'pending_review', label: 'Pending' },
  { value: 'disetujui', label: 'Disetujui' },
  { value: 'ditolak', label: 'Ditolak' },
];

function formatRupiah(n: string | number | undefined) {
  if (n === undefined || n === null) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n));
}

interface FasilitasForm {
  nama: string;
  kapasitas: string;
  harga_per_hari: string;
  deskripsi: string;
  foto: File | null;
}

const emptyFasilitasForm = (): FasilitasForm => ({
  nama: '',
  kapasitas: '',
  harga_per_hari: '',
  deskripsi: '',
  foto: null,
});

interface FasilitasFormProps {
  readonly form: FasilitasForm;
  readonly setForm: React.Dispatch<React.SetStateAction<FasilitasForm>>;
}

function FasilitasFormFields({ form, setForm }: FasilitasFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="fas-nama" className={labelCls}>Nama Fasilitas <span className="text-red-500">*</span></label>
        <input
          id="fas-nama"
          type="text"
          value={form.nama}
          onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
          className={inputCls}
          placeholder="Ruang VIP"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="fas-kapasitas" className={labelCls}>Kapasitas <span className="text-red-500">*</span></label>
          <input
            id="fas-kapasitas"
            type="number"
            min={1}
            value={form.kapasitas}
            onChange={(e) => setForm((f) => ({ ...f, kapasitas: e.target.value }))}
            className={inputCls}
            placeholder="50"
          />
        </div>
        <div>
          <label htmlFor="fas-harga" className={labelCls}>Harga/Hari (Rp) <span className="text-red-500">*</span></label>
          <input
            id="fas-harga"
            type="number"
            min={0}
            value={form.harga_per_hari}
            onChange={(e) => setForm((f) => ({ ...f, harga_per_hari: e.target.value }))}
            className={inputCls}
            placeholder="1500000"
          />
        </div>
      </div>
      <div>
        <label htmlFor="fas-deskripsi" className={labelCls}>Deskripsi <span className="text-red-500">*</span></label>
        <textarea
          id="fas-deskripsi"
          rows={2}
          value={form.deskripsi}
          onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
          className={inputCls}
          placeholder="Deskripsi fasilitas"
        />
      </div>
      <div>
        <label htmlFor="fas-foto" className={labelCls}>Foto <span className="text-red-500">*</span></label>
        <input
          id="fas-foto"
          type="file"
          accept="image/*"
          onChange={(e) => setForm((f) => ({ ...f, foto: e.target.files?.[0] ?? null }))}
          className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700`}
        />
      </div>
    </div>
  );
}

export function Booking() {
  const addNotification = useUIStore((s) => s.addNotification);

  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const bookingEndpoint = statusFilter ? `/islamic/admin/booking?status=${statusFilter}` : '/islamic/admin/booking';
  const { data: bookings, loading: loadingBookings, error: bookingError, refetch: refetchBookings } = useFetch<Booking[]>(bookingEndpoint, { adminKey: ISLAMIC_ADMIN_KEY, adminKeyHeader: 'x-admin-key' });
  const { data: fasilitas, loading: loadingFasilitas, refetch: refetchFasilitas } = useFetch<Fasilitas[]>('/islamic/fasilitas');

  const [approveTarget, setApproveTarget] = useState<Booking | null>(null);
  const [tolakTarget, setTolakTarget] = useState<Booking | null>(null);
  const [catatanTolak, setCatatanTolak] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showFasilitasModal, setShowFasilitasModal] = useState(false);
  const [fasilitasForm, setFasilitasForm] = useState<FasilitasForm>(emptyFasilitasForm());

  const handleApprove = async () => {
    if (!approveTarget) return;
    setSubmitting(true);
    try {
      await apiFetch(`/islamic/admin/booking/${approveTarget.id}/approve`, { method: 'PATCH', adminKey: ISLAMIC_ADMIN_KEY, adminKeyHeader: 'x-admin-key' });
      addNotification({ type: 'success', message: `Booking "${approveTarget.nama_acara}" disetujui` });
      setApproveTarget(null);
      refetchBookings();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menyetujui booking' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTolak = async () => {
    if (!tolakTarget) return;
    if (!catatanTolak.trim()) {
      addNotification({ type: 'error', message: 'Catatan admin wajib diisi' });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/islamic/admin/booking/${tolakTarget.id}/tolak`, {
        method: 'PATCH',
        adminKey: ISLAMIC_ADMIN_KEY,
        adminKeyHeader: 'x-admin-key',
        body: { catatan_admin: catatanTolak },
      });
      addNotification({ type: 'success', message: `Booking "${tolakTarget.nama_acara}" ditolak` });
      setTolakTarget(null);
      setCatatanTolak('');
      refetchBookings();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menolak booking' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFasilitas = async () => {
    if (!fasilitasForm.nama || !fasilitasForm.kapasitas || !fasilitasForm.harga_per_hari || !fasilitasForm.deskripsi || !fasilitasForm.foto) {
      addNotification({ type: 'error', message: 'Semua field wajib diisi termasuk foto' });
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('nama', fasilitasForm.nama);
      fd.append('kapasitas', fasilitasForm.kapasitas);
      fd.append('harga_per_hari', fasilitasForm.harga_per_hari);
      fd.append('deskripsi', fasilitasForm.deskripsi);
      fd.append('foto', fasilitasForm.foto);
      await apiFetch('/islamic/admin/fasilitas', { method: 'POST', adminKey: ISLAMIC_ADMIN_KEY, adminKeyHeader: 'x-admin-key', body: fd });
      addNotification({ type: 'success', message: `Fasilitas "${fasilitasForm.nama}" berhasil ditambahkan` });
      setShowFasilitasModal(false);
      setFasilitasForm(emptyFasilitasForm());
      refetchFasilitas();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menambah fasilitas' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper
      title="Booking Fasilitas"
      subtitle="Kelola permohonan peminjaman fasilitas Islamic Center"
    >
      {/* Fasilitas */}
      <Card>
        <CardHeader
          title="Fasilitas Tersedia"
          subtitle={`${(fasilitas ?? []).length} fasilitas`}
          action={
            <Button size="sm" onClick={() => { setFasilitasForm(emptyFasilitasForm()); setShowFasilitasModal(true); }}>
              + Tambah Fasilitas
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Nama', 'Kapasitas', 'Harga/Hari', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingFasilitas
                ? [1, 2].map((i) => (
                  <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
                : (fasilitas ?? []).map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {f.foto_url && <img src={f.foto_url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />}
                        <span className="font-medium text-gray-800">{f.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{f.kapasitas} orang</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{formatRupiah(f.harga_per_hari)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={f.is_active ? 'success' : 'danger'}>{f.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Daftar Booking */}
      <Card>
        <CardHeader
          title="Daftar Booking"
          subtitle={`${(bookings ?? []).length} permintaan`}
        />
        {/* Status filter tabs */}
        <div className="flex gap-1 px-4 pb-3 border-b border-gray-100">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Nama Acara', 'NIK', 'Tanggal', 'Estimasi Peserta', 'Estimasi Biaya', 'Kode', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingBookings && [1, 2, 3].map((i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))}
              {!loadingBookings && bookingError && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-red-500">
                    Gagal memuat data: {bookingError}
                  </td>
                </tr>
              )}
              {!loadingBookings && !bookingError && (bookings ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    Tidak ada booking
                  </td>
                </tr>
              )}
              {!loadingBookings && (bookings ?? []).map((b) => {
                const badge = BOOKING_STATUS_BADGE[b.status] ?? { label: b.status, variant: 'neutral' as const };
                const tanggalRange = b.tanggal_selesai === b.tanggal_mulai ? b.tanggal_mulai : `${b.tanggal_mulai} – ${b.tanggal_selesai}`;
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{b.nama_acara}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{b.user_nik}</td>
                    <td className="px-4 py-3 text-gray-600">{tanggalRange}</td>
                    <td className="px-4 py-3 text-gray-600">{b.estimasi_peserta} orang</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{formatRupiah(b.estimasi_biaya)}</td>
                    <td className="px-4 py-3"><Badge variant="neutral">{b.kode_bayar ?? '—'}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                    <td className="px-4 py-3">
                      {b.status === 'pending_review' && (
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setApproveTarget(b)}>Setujui</Button>
                          <Button variant="danger" size="sm" onClick={() => { setTolakTarget(b); setCatatanTolak(''); }}>Tolak</Button>
                        </div>
                      )}
                      {b.catatan_admin && (
                        <span className="text-xs text-gray-500 italic">{b.catatan_admin}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Tambah Fasilitas */}
      <Modal
        open={showFasilitasModal}
        title="Tambah Fasilitas"
        onClose={() => setShowFasilitasModal(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowFasilitasModal(false)}>Batal</Button>
            <Button loading={submitting} onClick={handleAddFasilitas}>Tambah</Button>
          </div>
        }
      >
        <FasilitasFormFields form={fasilitasForm} setForm={setFasilitasForm} />
      </Modal>

      {/* Modal: Konfirmasi Setujui */}
      <Modal
        open={approveTarget !== null}
        title="Setujui Booking"
        onClose={() => setApproveTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setApproveTarget(null)}>Batal</Button>
            <Button loading={submitting} onClick={handleApprove}>Ya, Setujui</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Setujui booking <strong>{approveTarget?.nama_acara}</strong> dari NIK <strong>{approveTarget?.user_nik}</strong>?
        </p>
      </Modal>

      {/* Modal: Tolak Booking */}
      <Modal
        open={tolakTarget !== null}
        title="Tolak Booking"
        onClose={() => setTolakTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTolakTarget(null)}>Batal</Button>
            <Button variant="danger" loading={submitting} onClick={handleTolak}>Tolak Booking</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Tolak booking <strong>{tolakTarget?.nama_acara}</strong>?
          </p>
          <div>
            <label htmlFor="catatan-tolak" className={labelCls}>
              Catatan Admin <span className="text-red-500">*</span>
            </label>
            <textarea
              id="catatan-tolak"
              rows={3}
              value={catatanTolak}
              onChange={(e) => setCatatanTolak(e.target.value)}
              className={inputCls}
              placeholder="Contoh: file kurang lengkap"
            />
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
