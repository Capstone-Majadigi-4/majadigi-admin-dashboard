import { useRef, useState } from "react";
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
import type { HargaHarian, Komoditas, Koperasi, Pasar } from "../../types";

interface HargaKoperasiHarian {
  id: string;
  komoditas_id: string;
  nama_komoditas: string;
  satuan: string;
  koperasi_id: string;
  nama_koperasi: string;
  harga: number;
  tanggal: string;
}

// Interface baru untuk endpoint perbandingan
interface PerbandinganHarga {
  komoditas_id: string;
  nama_komoditas: string;
  satuan: string;
  tanggal: string;
  harga_pasar: number;
  harga_koperasi: number;
  selisih: number;
}

interface InputHargaKoperasiForm {
  komoditas_id: string;
  koperasi_id: string;
  harga: string;
  tanggal: string;
}

interface InputHargaForm {
  komoditas_id: string;
  pasar_id: string;
  harga: string;
  tanggal: string;
}

const BAPOK_ADMIN_KEY = import.meta.env.VITE_BAPOK_ADMIN_KEY as
  | string
  | undefined;

const todayISO = () => new Date().toISOString().split("T")[0];

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function HargaBapok() {
  const addNotification = useUIStore((s) => s.addNotification);

  const [tanggalFilter, setTanggalFilter] = useState(todayISO());

  // State untuk trigger fetch ketiga endpoint
  const [hargaParams, setHargaParams] = useState(
    `/bapok/harga?tanggal=${todayISO()}`,
  );
  const [hargaKoperasiParams, setHargaKoperasiParams] = useState(
    `/bapok/harga/koperasi?tanggal=${todayISO()}`,
  );
  const [perbandinganParams, setPerbandinganParams] = useState(
    `/bapok/harga/perbandingan?tanggal=${todayISO()}`,
  );

  // Fetch Data
  const {
    data: harga,
    loading: loadingHarga,
    refetch: refetchHarga,
  } = useFetch<HargaHarian[]>(hargaParams);
  const {
    data: hargaKoperasi,
    loading: loadingKoperasi,
    refetch: refetchKoperasi,
  } = useFetch<HargaKoperasiHarian[]>(hargaKoperasiParams);
  const {
    data: perbandingan,
    loading: loadingPerbandingan,
    refetch: refetchPerbandingan,
  } = useFetch<PerbandinganHarga[]>(perbandinganParams);

  // Data referensi untuk Modal input
  const { data: komoditas } = useFetch<Komoditas[]>("/bapok/komoditas");
  const { data: pasarList } = useFetch<Pasar[]>("/bapok/pasar");
  const { data: koperasiList } = useFetch<Koperasi[]>("/bapok/koperasi");

  const [showInputModal, setShowInputModal] = useState(false);
  const [showKoperasiModal, setShowKoperasiModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<InputHargaForm>({
    komoditas_id: "",
    pasar_id: "",
    harga: "",
    tanggal: todayISO(),
  });

  const [koperasiForm, setKoperasiForm] = useState<InputHargaKoperasiForm>({
    komoditas_id: "",
    koperasi_id: "",
    harga: "",
    tanggal: todayISO(),
  });

  const [uploadingCSV, setUploadingCSV] = useState(false);
  const csvRef = useRef<HTMLInputElement>(null);

  const handleFilter = () => {
    setHargaParams(`/bapok/harga?tanggal=${tanggalFilter}`);
    setHargaKoperasiParams(`/bapok/harga/koperasi?tanggal=${tanggalFilter}`);
    setPerbandinganParams(`/bapok/harga/perbandingan?tanggal=${tanggalFilter}`);
    refetchHarga();
    refetchKoperasi();
    refetchPerbandingan();
  };

  const handleInputHarga = async () => {
    if (!form.komoditas_id || !form.pasar_id || !form.harga || !form.tanggal) {
      addNotification({ type: "error", message: "Semua field wajib diisi" });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/bapok/admin/harga", {
        method: "POST",
        adminKey: BAPOK_ADMIN_KEY,
        body: {
          komoditas_id: form.komoditas_id,
          pasar_id: form.pasar_id,
          harga: Number.parseFloat(form.harga),
          tanggal: form.tanggal,
        },
      });
      addNotification({ type: "success", message: "Harga berhasil diinput" });
      setShowInputModal(false);

      // Update semua tabel secara instan
      setTanggalFilter(form.tanggal);
      setHargaParams(`/bapok/harga?tanggal=${form.tanggal}`);
      setHargaKoperasiParams(`/bapok/harga/koperasi?tanggal=${form.tanggal}`);
      setPerbandinganParams(
        `/bapok/harga/perbandingan?tanggal=${form.tanggal}`,
      );

      setForm({
        komoditas_id: "",
        pasar_id: "",
        harga: "",
        tanggal: todayISO(),
      });
    } catch (err) {
      addNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal input harga",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputHargaKoperasi = async () => {
    if (
      !koperasiForm.komoditas_id ||
      !koperasiForm.koperasi_id ||
      !koperasiForm.harga ||
      !koperasiForm.tanggal
    ) {
      addNotification({ type: "error", message: "Semua field wajib diisi" });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/bapok/admin/harga-koperasi", {
        method: "POST",
        adminKey: BAPOK_ADMIN_KEY,
        body: {
          komoditas_id: koperasiForm.komoditas_id,
          koperasi_id: koperasiForm.koperasi_id,
          harga: Number.parseFloat(koperasiForm.harga),
          tanggal: koperasiForm.tanggal,
        },
      });
      addNotification({
        type: "success",
        message: "Harga koperasi berhasil diinput",
      });
      setShowKoperasiModal(false);

      // Update semua tabel secara instan
      setTanggalFilter(koperasiForm.tanggal);
      setHargaParams(`/bapok/harga?tanggal=${koperasiForm.tanggal}`);
      setHargaKoperasiParams(
        `/bapok/harga/koperasi?tanggal=${koperasiForm.tanggal}`,
      );
      setPerbandinganParams(
        `/bapok/harga/perbandingan?tanggal=${koperasiForm.tanggal}`,
      );

      setKoperasiForm({
        komoditas_id: "",
        koperasi_id: "",
        harga: "",
        tanggal: todayISO(),
      });
    } catch (err) {
      addNotification({
        type: "error",
        message:
          err instanceof Error ? err.message : "Gagal input harga koperasi",
      });
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
      fd.append("file", file);
      await apiFetch("/bapok/admin/harga/bulk-csv", {
        method: "POST",
        adminKey: BAPOK_ADMIN_KEY,
        body: fd,
      });
      addNotification({
        type: "success",
        message: `Bulk upload berhasil: ${file.name}`,
      });
      refetchHarga();
      refetchKoperasi();
      refetchPerbandingan();
    } catch (err) {
      addNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal upload CSV",
      });
    } finally {
      setUploadingCSV(false);
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#004a99]/10 focus:border-[#004a99] transition-all duration-200";
  const labelCls =
    "block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide";

  return (
    <PageWrapper
      title="Monitoring Harga Bapok"
      subtitle="Data pantauan harga bahan pokok di Pasar dan Koperasi"
      action={
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            loading={uploadingCSV}
            onClick={() => csvRef.current?.click()}
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload CSV
          </Button>
          <input
            ref={csvRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleBulkCSV}
          />

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowKoperasiModal(true)}
          >
            + Harga Koperasi
          </Button>

          <Button size="sm" onClick={() => setShowInputModal(true)}>
            + Harga Pasar
          </Button>
        </div>
      }
    >
      {!BAPOK_ADMIN_KEY && (
        <Card className="border-amber-200 bg-amber-50/50 mb-6">
          <CardBody>
            <div className="flex items-center gap-3 text-sm text-amber-800">
              <svg
                className="w-5 h-5 shrink-0 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                <strong>VITE_BAPOK_ADMIN_KEY</strong> belum di-set di{" "}
                <code>.env.local</code>. Aksi admin tidak akan diizinkan oleh
                server.
              </span>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        <Card>
          <CardBody className="flex flex-col sm:flex-row items-center gap-4 p-5">
            <div className="w-full sm:w-auto flex-1">
              <label htmlFor="tanggal-filter" className={labelCls}>
                Filter Tanggal Pemantauan
              </label>
              <input
                id="tanggal-filter"
                type="date"
                value={tanggalFilter}
                onChange={(e) => setTanggalFilter(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="w-full sm:w-auto pt-0 sm:pt-6">
              <Button className="w-full sm:w-auto px-8" onClick={handleFilter}>
                Tampilkan Data
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* --- Card Perbandingan Harga (Baru) --- */}
        <Card>
          <CardHeader
            title="Perbandingan Harga Komoditas"
            subtitle="Selisih pantauan harga antara Pasar Tradisional dan Koperasi"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6 bg-slate-50/50">
            {loadingPerbandingan ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-white border border-slate-100 rounded-2xl animate-pulse shadow-sm"
                />
              ))
            ) : (perbandingan ?? []).length === 0 ? (
              <div className="col-span-full py-10 text-center flex flex-col items-center justify-center text-slate-400">
                <svg
                  className="w-10 h-10 mb-2 text-slate-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-[13px] font-medium">
                  Belum ada data perbandingan untuk tanggal ini.
                </p>
              </div>
            ) : (
              (perbandingan ?? []).map((p) => (
                <div
                  key={p.komoditas_id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-800">
                        {p.nama_komoditas}
                      </h4>
                      <p className="text-[12px] font-medium text-slate-500">
                        per <span className="font-mono">{p.satuan}</span>
                      </p>
                    </div>
                    {/* Jika selisih > 0, Pasar lebih mahal. Jika < 0, Pasar lebih murah. */}
                    <Badge variant={p.selisih > 0 ? "warning" : "success"}>
                      Selisih {formatRupiah(Math.abs(p.selisih))}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Pasar
                      </p>
                      <p className="text-[14px] font-bold text-slate-700">
                        {formatRupiah(p.harga_pasar)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#004a99] uppercase tracking-wider mb-1">
                        Koperasi
                      </p>
                      <p className="text-[14px] font-bold text-[#004a99]">
                        {formatRupiah(p.harga_koperasi)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Tabel Harga Pasar */}
        <Card className="overflow-hidden">
          <CardHeader
            title="Harga Harian Pasar Tradisional"
            subtitle={`${harga?.length ?? 0} entri terpantau pada ${tanggalFilter}`}
          />
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-y border-slate-200">
                  {["Komoditas", "Satuan", "Pasar", "Harga", "Tanggal"].map(
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
                {loadingHarga ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded-md animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : (harga ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-[13px] font-medium text-slate-400"
                    >
                      Tidak ada data harga pasar untuk tanggal ini.
                    </td>
                  </tr>
                ) : (
                  (harga ?? []).map((h) => (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-50/80 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-800">
                        {h.nama_komoditas}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral" className="font-mono">
                          {h.satuan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                        {h.nama_pasar}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-800">
                        {formatRupiah(h.harga)}
                      </td>
                      <td className="px-6 py-4 text-[12px] font-medium text-slate-400">
                        {h.tanggal}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Tabel Harga Koperasi */}
        <Card className="overflow-hidden">
          <CardHeader
            title="Harga Harian Koperasi"
            subtitle={`${hargaKoperasi?.length ?? 0} entri terpantau pada ${tanggalFilter}`}
          />
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-y border-slate-200">
                  {["Komoditas", "Satuan", "Koperasi", "Harga", "Tanggal"].map(
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
                {loadingKoperasi ? (
                  [1, 2].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded-md animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : (hargaKoperasi ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-[13px] font-medium text-slate-400"
                    >
                      Tidak ada data harga koperasi untuk tanggal ini.
                    </td>
                  </tr>
                ) : (
                  (hargaKoperasi ?? []).map((h) => (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-50/80 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-800">
                        {h.nama_komoditas}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info" className="font-mono">
                          {h.satuan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                        {h.nama_koperasi}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-800">
                        {formatRupiah(h.harga)}
                      </td>
                      <td className="px-6 py-4 text-[12px] font-medium text-slate-400">
                        {h.tanggal}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Koperasi */}
      <Modal
        open={showKoperasiModal}
        title="Input Harga Koperasi"
        onClose={() => setShowKoperasiModal(false)}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setShowKoperasiModal(false)}
            >
              Batal
            </Button>
            <Button loading={submitting} onClick={handleInputHargaKoperasi}>
              Simpan Data
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="kop-komoditas" className={labelCls}>
              Pilih Komoditas <span className="text-rose-500">*</span>
            </label>
            <select
              id="kop-komoditas"
              value={koperasiForm.komoditas_id}
              onChange={(e) =>
                setKoperasiForm((f) => ({ ...f, komoditas_id: e.target.value }))
              }
              className={inputCls}
            >
              <option value="">-- Pilih komoditas --</option>
              {(komoditas ?? [])
                .filter((k) => k.is_active)
                .map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.satuan})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="kop-koperasi" className={labelCls}>
              Nama Koperasi <span className="text-rose-500">*</span>
            </label>
            <select
              id="kop-koperasi"
              value={koperasiForm.koperasi_id}
              onChange={(e) =>
                setKoperasiForm((f) => ({ ...f, koperasi_id: e.target.value }))
              }
              className={inputCls}
            >
              <option value="">-- Pilih koperasi --</option>
              {(koperasiList ?? []).map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="kop-harga" className={labelCls}>
                Harga (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                id="kop-harga"
                type="number"
                min={0}
                placeholder="15000"
                value={koperasiForm.harga}
                onChange={(e) =>
                  setKoperasiForm((f) => ({ ...f, harga: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="kop-tanggal" className={labelCls}>
                Tanggal <span className="text-rose-500">*</span>
              </label>
              <input
                id="kop-tanggal"
                type="date"
                value={koperasiForm.tanggal}
                onChange={(e) =>
                  setKoperasiForm((f) => ({ ...f, tanggal: e.target.value }))
                }
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Pasar */}
      <Modal
        open={showInputModal}
        title="Input Harga Pasar"
        onClose={() => setShowInputModal(false)}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setShowInputModal(false)}
            >
              Batal
            </Button>
            <Button loading={submitting} onClick={handleInputHarga}>
              Simpan Data
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="km-komoditas" className={labelCls}>
              Pilih Komoditas <span className="text-rose-500">*</span>
            </label>
            <select
              id="km-komoditas"
              value={form.komoditas_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, komoditas_id: e.target.value }))
              }
              className={inputCls}
            >
              <option value="">-- Pilih komoditas --</option>
              {(komoditas ?? [])
                .filter((k) => k.is_active)
                .map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} ({k.satuan})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="km-pasar" className={labelCls}>
              Lokasi Pasar <span className="text-rose-500">*</span>
            </label>
            <select
              id="km-pasar"
              value={form.pasar_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, pasar_id: e.target.value }))
              }
              className={inputCls}
            >
              <option value="">-- Pilih pasar --</option>
              {(pasarList ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="km-harga" className={labelCls}>
                Harga (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                id="km-harga"
                type="number"
                min={0}
                placeholder="15000"
                value={form.harga}
                onChange={(e) =>
                  setForm((f) => ({ ...f, harga: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="km-tanggal" className={labelCls}>
                Tanggal <span className="text-rose-500">*</span>
              </label>
              <input
                id="km-tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tanggal: e.target.value }))
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
