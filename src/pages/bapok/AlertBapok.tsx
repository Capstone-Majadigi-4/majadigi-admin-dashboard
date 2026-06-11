import { useState } from 'react';
import { PageWrapper } from '../../components/layout';
import { Badge, Button, Card, CardHeader, Modal } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { apiFetch } from '../../services/apiClient';
import { useUIStore } from '../../store/useUIStore';
import type { Komoditas } from '../../types';

const BAPOK_ADMIN_KEY = import.meta.env.VITE_BAPOK_ADMIN_KEY as string | undefined;

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

interface KomoditasForm {
  nama: string;
  kategori: string;
  satuan: string;
  ikon_url: string;
  is_active: boolean;
}

const emptyForm = (): KomoditasForm => ({
  nama: '',
  kategori: '',
  satuan: '',
  ikon_url: '',
  is_active: true,
});

interface KomoditasFormProps {
  readonly form: KomoditasForm;
  readonly setForm: React.Dispatch<React.SetStateAction<KomoditasForm>>;
  readonly isEdit?: boolean;
}

function KomoditasFormFields({ form, setForm, isEdit = false }: KomoditasFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="km-nama" className={labelCls}>Nama Komoditas</label>
        <input
          id="km-nama"
          type="text"
          placeholder="Contoh: Bawang Merah"
          value={form.nama}
          onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="km-kategori" className={labelCls}>Kategori</label>
        <input
          id="km-kategori"
          type="text"
          placeholder="Contoh: Sayuran, Bumbu, Daging"
          value={form.kategori}
          onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="km-satuan" className={labelCls}>Satuan</label>
        <input
          id="km-satuan"
          type="text"
          placeholder="Contoh: kg, liter, ikat"
          value={form.satuan}
          onChange={(e) => setForm((f) => ({ ...f, satuan: e.target.value }))}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="km-ikon" className={labelCls}>
          URL Ikon {isEdit
            ? <span className="text-gray-400 font-normal">(kosongkan jika tidak diganti)</span>
            : <span className="text-red-500">*</span>}
        </label>
        <input
          id="km-ikon"
          type="url"
          placeholder="https://example.com/icon.png"
          value={form.ikon_url}
          onChange={(e) => setForm((f) => ({ ...f, ikon_url: e.target.value }))}
          className={inputCls}
        />
      </div>
      {isEdit && (
        <div className="flex items-center gap-2">
          <input
            id="km-active"
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="km-active" className="text-sm font-medium text-gray-700">Aktif</label>
        </div>
      )}
    </div>
  );
}

export function AlertBapok() {
  const addNotification = useUIStore((s) => s.addNotification);
  const { data: komoditas, loading, refetch } = useFetch<Komoditas[]>('/bapok/komoditas');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Komoditas | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Komoditas | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<KomoditasForm>(emptyForm());

  const buildBody = (f: KomoditasForm, isEdit = false) => {
    const body: Record<string, unknown> = {};
    if (f.nama) body['nama'] = f.nama;
    if (f.kategori) body['kategori'] = f.kategori;
    if (f.satuan) body['satuan'] = f.satuan;
    if (f.ikon_url) body['ikon_url'] = f.ikon_url;
    if (isEdit) body['is_active'] = f.is_active;
    return body;
  };

  const handleAdd = async () => {
    if (!form.nama || !form.kategori || !form.satuan || !form.ikon_url) {
      addNotification({ type: 'error', message: 'Nama, kategori, satuan, dan URL ikon wajib diisi' });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/bapok/admin/komoditas', {
        method: 'POST',
        adminKey: BAPOK_ADMIN_KEY,
        body: buildBody(form),
      });
      addNotification({ type: 'success', message: `Komoditas "${form.nama}" berhasil ditambahkan` });
      setShowAddModal(false);
      setForm(emptyForm());
      refetch();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menambah komoditas' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await apiFetch(`/bapok/admin/komoditas/${editTarget.id}`, {
        method: 'PATCH',
        adminKey: BAPOK_ADMIN_KEY,
        body: buildBody(form, true),
      });
      addNotification({ type: 'success', message: `Komoditas "${editTarget.nama}" berhasil diupdate` });
      setEditTarget(null);
      setForm(emptyForm());
      refetch();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal update komoditas' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await apiFetch(`/bapok/admin/komoditas/${deleteTarget.id}`, {
        method: 'DELETE',
        adminKey: BAPOK_ADMIN_KEY,
      });
      addNotification({ type: 'success', message: `Komoditas "${deleteTarget.nama}" berhasil dihapus` });
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal hapus komoditas' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (k: Komoditas) => {
    setEditTarget(k);
    setForm({ nama: k.nama, kategori: k.kategori, satuan: k.satuan, ikon_url: k.ikon_url ?? '', is_active: k.is_active });
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <PageWrapper
      title="Manajemen Komoditas"
      subtitle="Kelola daftar bahan pokok yang dipantau"
      action={
        <Button size="sm" onClick={() => { setForm(emptyForm()); setShowAddModal(true); }}>
          + Tambah Komoditas
        </Button>
      }
    >
      {BAPOK_ADMIN_KEY === undefined && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><strong>VITE_BAPOK_ADMIN_KEY</strong> belum di-set. Set di <code>.env.local</code>.</span>
        </div>
      )}

      <Card>
        <CardHeader
          title="Daftar Komoditas"
          subtitle={`${(komoditas ?? []).length} komoditas · ${(komoditas ?? []).filter((k) => k.is_active).length} aktif`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Nama', 'Kategori', 'Satuan', 'Status', 'Harga Rata-rata', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? [1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : (komoditas ?? []).map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {k.ikon_url && (
                          <img src={k.ikon_url} alt={k.nama} className="w-7 h-7 rounded object-cover" />
                        )}
                        <span className="font-medium text-gray-800">{k.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{k.kategori}</td>
                    <td className="px-4 py-3"><Badge variant="neutral">{k.satuan}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={k.is_active ? 'success' : 'danger'}>
                        {k.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {k.harga_rata_rata === undefined || k.harga_rata_rata === null
                        ? '—'
                        : formatRupiah(k.harga_rata_rata)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(k)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(k)}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={showAddModal}
        title="Tambah Komoditas"
        onClose={() => setShowAddModal(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Batal</Button>
            <Button loading={submitting} onClick={handleAdd}>Tambah</Button>
          </div>
        }
      >
        <KomoditasFormFields form={form} setForm={setForm} />
      </Modal>

      <Modal
        open={editTarget !== null}
        title={`Edit: ${editTarget?.nama ?? ''}`}
        onClose={() => setEditTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Batal</Button>
            <Button loading={submitting} onClick={handleEdit}>Simpan</Button>
          </div>
        }
      >
        <KomoditasFormFields form={form} setForm={setForm} isEdit />
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Hapus Komoditas"
        onClose={() => setDeleteTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>Hapus</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Yakin ingin menghapus komoditas <strong>{deleteTarget?.nama}</strong>? Aksi ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </PageWrapper>
  );
}
