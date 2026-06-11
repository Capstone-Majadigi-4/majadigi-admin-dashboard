import { useRef, useState } from 'react';
import { PageWrapper } from '../../components/layout';
import { Badge, Button, Card, CardBody, CardHeader, Modal } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { apiFetch } from '../../services/apiClient';
import { useUIStore } from '../../store/useUIStore';
import type { HargaHarian, Komoditas, Koperasi } from '../../types';

interface InputHargaKoperasiForm {
  komoditas_id: string;
  koperasi_id: string;
  harga: string;
  tanggal: string;
}

const BAPOK_ADMIN_KEY = import.meta.env.VITE_BAPOK_ADMIN_KEY as string | undefined;

const PASAR_LIST = [
  { id: '6704666d-59d8-44b3-a6fb-e5a62ff3387a', nama: 'Pasar Besar Malang' },
  { id: '66be6309-f7be-4b2b-95c4-ca6c70233a5f', nama: 'Pasar Blimbing' },
  { id: '18f3098c-9682-4668-887b-4c0b6a7f2024', nama: 'Pasar Oro-Oro Dowo' },
  { id: 'cc882abe-f9df-4abe-927a-b5342d052c2e', nama: 'Pasar Sukun' },
];

const todayISO = () => new Date().toISOString().split('T')[0];

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

interface InputHargaForm {
  komoditas_id: string;
  pasar_id: string;
  harga: string;
  tanggal: string;
}

export function HargaBapok() {
  const addNotification = useUIStore((s) => s.addNotification);

  const [tanggalFilter, setTanggalFilter] = useState(todayISO());
  const [hargaParams, setHargaParams] = useState(`/bapok/harga?tanggal=${todayISO()}`);

  const { data: harga, loading: loadingHarga, refetch: refetchHarga } = useFetch<HargaHarian[]>(hargaParams);
  const { data: komoditas, loading: loadingKomoditas } = useFetch<Komoditas[]>('/bapok/komoditas');
  const { data: koperasiList } = useFetch<Koperasi[]>('/bapok/koperasi');

  const [showInputModal, setShowInputModal] = useState(false);
  const [showKoperasiModal, setShowKoperasiModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<InputHargaForm>({
    komoditas_id: '',
    pasar_id: '',
    harga: '',
    tanggal: todayISO(),
  });
  const [koperasiForm, setKoperasiForm] = useState<InputHargaKoperasiForm>({
    komoditas_id: '',
    koperasi_id: '',
    harga: '',
    tanggal: todayISO(),
  });

  const [uploadingCSV, setUploadingCSV] = useState(false);
  const csvRef = useRef<HTMLInputElement>(null);

  const handleFilter = () => {
    setHargaParams(`/bapok/harga?tanggal=${tanggalFilter}`);
    refetchHarga();
  };

  const handleInputHarga = async () => {
    if (!form.komoditas_id || !form.pasar_id || !form.harga || !form.tanggal) {
      addNotification({ type: 'error', message: 'Semua field wajib diisi' });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/bapok/admin/harga', {
        method: 'POST',
        adminKey: BAPOK_ADMIN_KEY,
        body: {
          komoditas_id: form.komoditas_id,
          pasar_id: form.pasar_id,
          harga: Number.parseFloat(form.harga),
          tanggal: form.tanggal,
        },
      });
      addNotification({ type: 'success', message: 'Harga berhasil diinput' });
      setShowInputModal(false);
      setForm({ komoditas_id: '', pasar_id: '', harga: '', tanggal: todayISO() });
      setHargaParams(`/bapok/harga?tanggal=${form.tanggal}`);
      setTanggalFilter(form.tanggal);
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal input harga' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputHargaKoperasi = async () => {
    if (!koperasiForm.komoditas_id || !koperasiForm.koperasi_id || !koperasiForm.harga || !koperasiForm.tanggal) {
      addNotification({ type: 'error', message: 'Semua field wajib diisi' });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch('/bapok/admin/harga-koperasi', {
        method: 'POST',
        adminKey: BAPOK_ADMIN_KEY,
        body: {
          komoditas_id: koperasiForm.komoditas_id,
          koperasi_id: koperasiForm.koperasi_id,
          harga: Number.parseFloat(koperasiForm.harga),
          tanggal: koperasiForm.tanggal,
        },
      });
      addNotification({ type: 'success', message: 'Harga koperasi berhasil diinput' });
      setShowKoperasiModal(false);
      setKoperasiForm({ komoditas_id: '', koperasi_id: '', harga: '', tanggal: todayISO() });
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal input harga koperasi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCSV(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await apiFetch('/bapok/admin/harga/bulk-csv', {
        method: 'POST',
        adminKey: BAPOK_ADMIN_KEY,
        body: fd,
      });
      addNotification({ type: 'success', message: `Bulk upload berhasil: ${file.name}` });
      refetchHarga();
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal upload CSV' });
    } finally {
      setUploadingCSV(false);
      if (csvRef.current) csvRef.current.value = '';
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <PageWrapper
      title="Monitoring Harga Bapok"
      subtitle="Data harga bahan pokok harian"
      action={
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" loading={uploadingCSV} onClick={() => csvRef.current?.click()}>
            Upload CSV
          </Button>
          <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleBulkCSV} />
          <Button variant="secondary" size="sm" onClick={() => setShowKoperasiModal(true)}>
            + Harga Koperasi
          </Button>
          <Button size="sm" onClick={() => setShowInputModal(true)}>
            + Harga Pasar
          </Button>
        </div>
      }
    >
      {!BAPOK_ADMIN_KEY && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>VITE_BAPOK_ADMIN_KEY</strong> belum di-set di <code>.env.local</code>. Aksi admin tidak akan berfungsi.
              </span>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <label htmlFor="tanggal-filter" className="text-sm font-medium text-gray-600 shrink-0">Tanggal:</label>
            <input
              id="tanggal-filter"
              type="date"
              value={tanggalFilter}
              onChange={(e) => setTanggalFilter(e.target.value)}
              className={`${inputCls} max-w-48`}
            />
          </div>
          <Button size="sm" variant="secondary" onClick={handleFilter}>Tampilkan</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Harga Harian"
          subtitle={`${harga?.length ?? 0} entri · ${tanggalFilter}`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Komoditas', 'Satuan', 'Pasar', 'Harga', 'Tanggal'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingHarga
                ? [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : (harga ?? []).length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                        Tidak ada data harga untuk tanggal ini
                      </td>
                    </tr>
                  )
                  : (harga ?? []).map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{h.nama_komoditas}</td>
                      <td className="px-4 py-3"><Badge variant="neutral">{h.satuan}</Badge></td>
                      <td className="px-4 py-3 text-gray-600">{h.nama_pasar}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{formatRupiah(h.harga)}</td>
                      <td className="px-4 py-3 text-gray-500">{h.tanggal}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Ringkasan Komoditas" subtitle="Rata-rata, terendah, dan tertinggi berdasarkan data terkini" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {loadingKomoditas
            ? [1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)
            : (komoditas ?? []).filter((k) => k.is_active).map((k) => (
              <div key={k.id} className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-gray-800">{k.nama}</p>
                <p className="text-xs text-gray-500">{k.kategori} · {k.satuan}</p>
                {k.harga_rata_rata !== undefined && (
                  <div className="pt-1 space-y-0.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Rata-rata</span><span className="font-medium">{formatRupiah(k.harga_rata_rata)}</span></div>
                    {k.harga_terendah !== undefined && <div className="flex justify-between"><span className="text-green-600">Terendah</span><span className="text-green-600">{formatRupiah(k.harga_terendah)}</span></div>}
                    {k.harga_tertinggi !== undefined && <div className="flex justify-between"><span className="text-red-600">Tertinggi</span><span className="text-red-600">{formatRupiah(k.harga_tertinggi)}</span></div>}
                  </div>
                )}
              </div>
            ))}
        </div>
      </Card>

      <Modal
        open={showKoperasiModal}
        title="Input Harga Koperasi"
        onClose={() => setShowKoperasiModal(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowKoperasiModal(false)}>Batal</Button>
            <Button loading={submitting} onClick={handleInputHargaKoperasi}>Simpan</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="kop-komoditas" className={labelCls}>Komoditas</label>
            <select
              id="kop-komoditas"
              value={koperasiForm.komoditas_id}
              onChange={(e) => setKoperasiForm((f) => ({ ...f, komoditas_id: e.target.value }))}
              className={inputCls}
            >
              <option value="">-- Pilih komoditas --</option>
              {(komoditas ?? []).filter((k) => k.is_active).map((k) => (
                <option key={k.id} value={k.id}>{k.nama} ({k.satuan})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="kop-koperasi" className={labelCls}>Koperasi</label>
            <select
              id="kop-koperasi"
              value={koperasiForm.koperasi_id}
              onChange={(e) => setKoperasiForm((f) => ({ ...f, koperasi_id: e.target.value }))}
              className={inputCls}
            >
              <option value="">-- Pilih koperasi --</option>
              {(koperasiList ?? []).map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="kop-harga" className={labelCls}>Harga (Rp)</label>
            <input
              id="kop-harga"
              type="number"
              min={0}
              placeholder="Contoh: 15000"
              value={koperasiForm.harga}
              onChange={(e) => setKoperasiForm((f) => ({ ...f, harga: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="kop-tanggal" className={labelCls}>Tanggal</label>
            <input
              id="kop-tanggal"
              type="date"
              value={koperasiForm.tanggal}
              onChange={(e) => setKoperasiForm((f) => ({ ...f, tanggal: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={showInputModal}
        title="Input Harga Bahan Pokok"
        onClose={() => setShowInputModal(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowInputModal(false)}>Batal</Button>
            <Button loading={submitting} onClick={handleInputHarga}>Simpan</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="km-komoditas" className={labelCls}>Komoditas</label>
            <select
              id="km-komoditas"
              value={form.komoditas_id}
              onChange={(e) => setForm((f) => ({ ...f, komoditas_id: e.target.value }))}
              className={inputCls}
            >
              <option value="">-- Pilih komoditas --</option>
              {(komoditas ?? []).filter((k) => k.is_active).map((k) => (
                <option key={k.id} value={k.id}>{k.nama} ({k.satuan})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="km-pasar" className={labelCls}>Pasar</label>
            <select
              id="km-pasar"
              value={form.pasar_id}
              onChange={(e) => setForm((f) => ({ ...f, pasar_id: e.target.value }))}
              className={inputCls}
            >
              <option value="">-- Pilih pasar --</option>
              {PASAR_LIST.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="km-harga" className={labelCls}>Harga (Rp)</label>
            <input
              id="km-harga"
              type="number"
              min={0}
              placeholder="Contoh: 15000"
              value={form.harga}
              onChange={(e) => setForm((f) => ({ ...f, harga: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="km-tanggal" className={labelCls}>Tanggal</label>
            <input
              id="km-tanggal"
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
