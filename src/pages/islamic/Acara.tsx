import { useRef, useState } from 'react';
import { PageWrapper } from '../../components/layout';
import { Badge, Button, Card, CardHeader, Modal } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { apiFetch } from '../../services/apiClient';
import { useUIStore } from '../../store/useUIStore';
import type { Acara, AcaraStatus } from '../../types';

const ISLAMIC_ADMIN_KEY = import.meta.env.VITE_ISLAMIC_ADMIN_KEY as string | undefined;

interface AcaraForm {
  judul: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  kuota_maksimal: string;
  deskripsi: string;
  poster: File | null;
  status: AcaraStatus;
}

const emptyForm = (): AcaraForm => ({
  judul: '',
  tanggal: '',
  waktu_mulai: '',
  waktu_selesai: '',
  lokasi: '',
  kuota_maksimal: '',
  deskripsi: '',
  poster: null,
  status: 'aktif',
});

const STATUS_BADGE: Record<AcaraStatus, { label: string; variant: 'success' | 'neutral' | 'danger' }> = {
  aktif: { label: 'Aktif', variant: 'success' },
  selesai: { label: 'Selesai', variant: 'neutral' },
  dibatalkan: { label: 'Dibatalkan', variant: 'danger' },
};

const fmtTime = (t: string) => t.slice(0, 5);

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

interface AcaraFormProps {
  readonly form: AcaraForm;
  readonly setForm: React.Dispatch<React.SetStateAction<AcaraForm>>;
  readonly isEdit?: boolean;
  readonly posterInputRef?: React.RefObject<HTMLInputElement | null>;
}

function AcaraFormFields({ form, setForm, isEdit = false, posterInputRef }: AcaraFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="ac-judul" className={labelCls}>Judul <span className="text-red-500">*</span></label>
        <input
          id="ac-judul"
          type="text"
          value={form.judul}
          onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
          className={inputCls}
          placeholder="Kajian Pagi Berkah"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ac-tanggal" className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
          <input
            id="ac-tanggal"
            type="date"
            value={form.tanggal}
            onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="ac-lokasi" className={labelCls}>Lokasi <span className="text-red-500">*</span></label>
          <input
            id="ac-lokasi"
            type="text"
            value={form.lokasi}
            onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))}
            className={inputCls}
            placeholder="Aula Utama"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ac-mulai" className={labelCls}>Waktu Mulai <span className="text-red-500">*</span></label>
          <input
            id="ac-mulai"
            type="time"
            value={form.waktu_mulai}
            onChange={(e) => setForm((f) => ({ ...f, waktu_mulai: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="ac-selesai" className={labelCls}>Waktu Selesai <span className="text-red-500">*</span></label>
          <input
            id="ac-selesai"
            type="time"
            value={form.waktu_selesai}
            onChange={(e) => setForm((f) => ({ ...f, waktu_selesai: e.target.value }))}
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label htmlFor="ac-kuota" className={labelCls}>Kuota Maksimal <span className="text-red-500">*</span></label>
        <input
          id="ac-kuota"
          type="number"
          min={1}
          value={form.kuota_maksimal}
          onChange={(e) => setForm((f) => ({ ...f, kuota_maksimal: e.target.value }))}
          className={inputCls}
          placeholder="100"
        />
      </div>
      <div>
        <label htmlFor="ac-deskripsi" className={labelCls}>Deskripsi</label>
        <textarea
          id="ac-deskripsi"
          rows={2}
          value={form.deskripsi}
          onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
          className={inputCls}
          placeholder="Deskripsi singkat acara"
        />
      </div>
      <div>
        <label htmlFor="ac-poster" className={labelCls}>
          Poster{' '}
          {isEdit
            ? <span className="text-gray-400 font-normal">(kosongkan jika tidak diganti)</span>
            : <span className="text-red-500">*</span>}
        </label>
        <input
          ref={posterInputRef}
          id="ac-poster"
          type="file"
          accept="image/*"
          onChange={(e) => setForm((f) => ({ ...f, poster: e.target.files?.[0] ?? null }))}
          className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700`}
        />
      </div>
      {isEdit && (
        <div>
          <label htmlFor="ac-status" className={labelCls}>Status <span className="text-red-500">*</span></label>
          <select
            id="ac-status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AcaraStatus }))}
            className={inputCls}
          >
            <option value="aktif">Aktif</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      )}
    </div>
  );
}

function buildAcaraFormData(f: AcaraForm, isEdit = false): FormData {
  const fd = new FormData();
  if (f.judul) fd.append('judul', f.judul);
  if (f.tanggal) fd.append('tanggal', f.tanggal);
  if (f.waktu_mulai) fd.append('waktu_mulai', f.waktu_mulai);
  if (f.waktu_selesai) fd.append('waktu_selesai', f.waktu_selesai);
  if (f.lokasi) fd.append('lokasi', f.lokasi);
  if (f.kuota_maksimal) fd.append('kuota_maksimal', f.kuota_maksimal);
  if (f.deskripsi || !isEdit) fd.append('deskripsi', f.deskripsi);
  if (f.poster) fd.append('poster', f.poster);
  if (isEdit) fd.append('status', f.status);
  return fd;
}

export function Acara() {
  const addNotification = useUIStore((s) => s.addNotification);
  const { data: acaraList, loading, refetch } = useFetch<Acara[]>('/islamic/acara');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Acara | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Acara | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AcaraForm>(emptyForm());
  const posterAddRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    const poster = posterAddRef.current?.files?.[0] ?? form.poster;
    if (!form.judul || !form.tanggal || !form.waktu_mulai || !form.waktu_selesai || !form.lokasi || !form.kuota_maksimal || !poster) {
      addNotification({ type: 'error', message: 'Semua field wajib diisi termasuk poster' });
      return;
    }
    setSubmitting(true);
    try {
      const posterFile = posterAddRef.current?.files?.[0] ?? form.poster;
      await apiFetch('/islamic/admin/acara', { method: 'POST', adminKey: ISLAMIC_ADMIN_KEY, adminKeyHeader: 'x-admin-key', body: buildAcaraFormData({ ...form, poster: posterFile ?? null }) });
      addNotification({ type: 'success', message: `Acara "${form.judul}" berhasil dibuat` });
      setShowAddModal(false);
      setForm(emptyForm());
      refetch();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal membuat acara' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await apiFetch(`/islamic/admin/acara/${editTarget.id}`, { method: 'PUT', adminKey: ISLAMIC_ADMIN_KEY, adminKeyHeader: 'x-admin-key', body: buildAcaraFormData(form, true) });
      addNotification({ type: 'success', message: `Acara "${editTarget.judul}" berhasil diupdate` });
      setEditTarget(null);
      setForm(emptyForm());
      refetch();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal update acara' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await apiFetch(`/islamic/admin/acara/${deleteTarget.id}`, { method: 'DELETE', adminKey: ISLAMIC_ADMIN_KEY, adminKeyHeader: 'x-admin-key' });
      addNotification({ type: 'success', message: `Acara "${deleteTarget.judul}" berhasil dibatalkan` });
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal membatalkan acara' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (a: Acara) => {
    setEditTarget(a);
    setForm({
      judul: a.judul,
      tanggal: a.tanggal,
      waktu_mulai: fmtTime(a.waktu_mulai),
      waktu_selesai: fmtTime(a.waktu_selesai),
      lokasi: a.lokasi,
      kuota_maksimal: String(a.kuota_maksimal),
      deskripsi: a.deskripsi ?? '',
      poster: null,
      status: a.status,
    });
  };

  return (
    <PageWrapper
      title="Acara Islamic Center"
      subtitle="Daftar dan kelola acara keislaman"
      action={
        <Button size="sm" onClick={() => { setForm(emptyForm()); setShowAddModal(true); }}>
          + Tambah Acara
        </Button>
      }
    >
      <Card>
        <CardHeader
          title="Daftar Acara"
          subtitle={`${(acaraList ?? []).length} acara`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Judul', 'Tanggal', 'Waktu', 'Lokasi', 'Kuota', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && [1, 2, 3].map((i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))}
              {!loading && (acaraList ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    Belum ada acara
                  </td>
                </tr>
              )}
              {!loading && (acaraList ?? []).map((a) => {
                    const badge = STATUS_BADGE[a.status] ?? { label: a.status, variant: 'neutral' as const };
                    return (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {a.poster_url && (
                              <img src={a.poster_url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                            )}
                            <span className="font-medium text-gray-800">{a.judul}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{a.tanggal}</td>
                        <td className="px-4 py-3 text-gray-600">{fmtTime(a.waktu_mulai)}–{fmtTime(a.waktu_selesai)}</td>
                        <td className="px-4 py-3 text-gray-600">{a.lokasi}</td>
                        <td className="px-4 py-3 text-gray-600">{a.kuota_terisi}/{a.kuota_maksimal}</td>
                        <td className="px-4 py-3"><Badge variant={badge.variant}>{badge.label}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => openEdit(a)}>Edit</Button>
                            {a.status === 'aktif' && (
                              <Button variant="danger" size="sm" onClick={() => setDeleteTarget(a)}>Batalkan</Button>
                            )}
                          </div>
                        </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={showAddModal}
        title="Tambah Acara"
        onClose={() => setShowAddModal(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Batal</Button>
            <Button loading={submitting} onClick={handleAdd}>Buat Acara</Button>
          </div>
        }
      >
        <AcaraFormFields form={form} setForm={setForm} posterInputRef={posterAddRef} />
      </Modal>

      <Modal
        open={editTarget !== null}
        title={`Edit: ${editTarget?.judul ?? ''}`}
        onClose={() => setEditTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Batal</Button>
            <Button loading={submitting} onClick={handleEdit}>Simpan</Button>
          </div>
        }
      >
        <AcaraFormFields form={form} setForm={setForm} isEdit />
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Batalkan Acara"
        onClose={() => setDeleteTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Kembali</Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>Ya, Batalkan</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Yakin ingin membatalkan acara <strong>{deleteTarget?.judul}</strong>?
          Status akan berubah menjadi dibatalkan.
        </p>
      </Modal>
    </PageWrapper>
  );
}
