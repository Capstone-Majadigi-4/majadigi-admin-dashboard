import { useRef, useState } from "react";
import { PageWrapper } from "../../components/layout";
import { Badge, Button, Card, CardHeader, Modal } from "../../components/ui";
import { useFetch } from "../../hooks/useFetch";
import { apiFetch } from "../../services/apiClient";
import { useUIStore } from "../../store/useUIStore";
import type { Acara, AcaraStatus } from "../../types";

const ISLAMIC_ADMIN_KEY = import.meta.env.VITE_ISLAMIC_ADMIN_KEY as
  | string
  | undefined;

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
  judul: "",
  tanggal: "",
  waktu_mulai: "",
  waktu_selesai: "",
  lokasi: "",
  kuota_maksimal: "",
  deskripsi: "",
  poster: null,
  status: "aktif",
});

const STATUS_BADGE: Record<
  AcaraStatus,
  { label: string; variant: "success" | "neutral" | "danger" }
> = {
  aktif: { label: "Aktif", variant: "success" },
  selesai: { label: "Selesai", variant: "neutral" },
  dibatalkan: { label: "Dibatalkan", variant: "danger" },
};

const fmtTime = (t: string) => t.slice(0, 5);

const inputCls =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#004a99]/10 focus:border-[#004a99] transition-all duration-200";
const labelCls =
  "block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide";

interface AcaraFormProps {
  readonly form: AcaraForm;
  readonly setForm: React.Dispatch<React.SetStateAction<AcaraForm>>;
  readonly isEdit?: boolean;
  readonly posterInputRef?: React.RefObject<HTMLInputElement | null>;
}

function AcaraFormFields({
  form,
  setForm,
  isEdit = false,
  posterInputRef,
}: AcaraFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ac-judul" className={labelCls}>
          Judul <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input
          id="ac-judul"
          type="text"
          value={form.judul}
          onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
          className={inputCls}
          placeholder="Kajian Pagi Berkah"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ac-tanggal" className={labelCls}>
            Tanggal <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            id="ac-tanggal"
            type="date"
            value={form.tanggal}
            onChange={(e) =>
              setForm((f) => ({ ...f, tanggal: e.target.value }))
            }
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="ac-lokasi" className={labelCls}>
            Lokasi <span className="text-rose-500 ml-0.5">*</span>
          </label>
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ac-mulai" className={labelCls}>
            Waktu Mulai <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            id="ac-mulai"
            type="time"
            value={form.waktu_mulai}
            onChange={(e) =>
              setForm((f) => ({ ...f, waktu_mulai: e.target.value }))
            }
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="ac-selesai" className={labelCls}>
            Waktu Selesai <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            id="ac-selesai"
            type="time"
            value={form.waktu_selesai}
            onChange={(e) =>
              setForm((f) => ({ ...f, waktu_selesai: e.target.value }))
            }
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label htmlFor="ac-kuota" className={labelCls}>
          Kuota Maksimal <span className="text-rose-500 ml-0.5">*</span>
        </label>
        <input
          id="ac-kuota"
          type="number"
          min={1}
          value={form.kuota_maksimal}
          onChange={(e) =>
            setForm((f) => ({ ...f, kuota_maksimal: e.target.value }))
          }
          className={inputCls}
          placeholder="100"
        />
      </div>
      <div>
        <label htmlFor="ac-deskripsi" className={labelCls}>
          Deskripsi
        </label>
        <textarea
          id="ac-deskripsi"
          rows={3}
          value={form.deskripsi}
          onChange={(e) =>
            setForm((f) => ({ ...f, deskripsi: e.target.value }))
          }
          className={`${inputCls} resize-none`}
          placeholder="Deskripsi singkat acara..."
        />
      </div>
      <div>
        <label htmlFor="ac-poster" className={labelCls}>
          Poster{" "}
          {isEdit ? (
            <span className="text-slate-400 font-medium normal-case tracking-normal ml-1">
              (kosongkan jika tidak diganti)
            </span>
          ) : (
            <span className="text-rose-500 ml-0.5">*</span>
          )}
        </label>
        <input
          ref={posterInputRef}
          id="ac-poster"
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm((f) => ({ ...f, poster: e.target.files?.[0] ?? null }))
          }
          className={`${inputCls} p-1.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-wider file:bg-[#004a99]/10 file:text-[#004a99] hover:file:bg-[#004a99]/20 transition-colors cursor-pointer`}
        />
      </div>
      {isEdit && (
        <div>
          <label htmlFor="ac-status" className={labelCls}>
            Status <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <select
            id="ac-status"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value as AcaraStatus }))
            }
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
  if (f.judul) fd.append("judul", f.judul);
  if (f.tanggal) fd.append("tanggal", f.tanggal);
  if (f.waktu_mulai) fd.append("waktu_mulai", f.waktu_mulai);
  if (f.waktu_selesai) fd.append("waktu_selesai", f.waktu_selesai);
  if (f.lokasi) fd.append("lokasi", f.lokasi);
  if (f.kuota_maksimal) fd.append("kuota_maksimal", f.kuota_maksimal);
  if (f.deskripsi || !isEdit) fd.append("deskripsi", f.deskripsi);
  if (f.poster) fd.append("poster", f.poster);
  if (isEdit) fd.append("status", f.status);
  return fd;
}

export function Acara() {
  const addNotification = useUIStore((s) => s.addNotification);
  const {
    data: acaraList,
    loading,
    refetch,
  } = useFetch<Acara[]>("/islamic/acara");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Acara | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Acara | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AcaraForm>(emptyForm());
  const posterAddRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    const poster = posterAddRef.current?.files?.[0] ?? form.poster;
    if (
      !form.judul ||
      !form.tanggal ||
      !form.waktu_mulai ||
      !form.waktu_selesai ||
      !form.lokasi ||
      !form.kuota_maksimal ||
      !poster
    ) {
      addNotification({
        type: "error",
        message: "Semua field wajib diisi termasuk poster",
      });
      return;
    }
    setSubmitting(true);
    try {
      const posterFile = posterAddRef.current?.files?.[0] ?? form.poster;
      await apiFetch("/islamic/admin/acara", {
        method: "POST",
        adminKey: ISLAMIC_ADMIN_KEY,
        adminKeyHeader: "x-admin-key",
        body: buildAcaraFormData({ ...form, poster: posterFile ?? null }),
      });
      addNotification({
        type: "success",
        message: `Acara "${form.judul}" berhasil dibuat`,
      });
      setShowAddModal(false);
      setForm(emptyForm());
      refetch();
    } catch (err) {
      addNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal membuat acara",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await apiFetch(`/islamic/admin/acara/${editTarget.id}`, {
        method: "PUT",
        adminKey: ISLAMIC_ADMIN_KEY,
        adminKeyHeader: "x-admin-key",
        body: buildAcaraFormData(form, true),
      });
      addNotification({
        type: "success",
        message: `Acara "${editTarget.judul}" berhasil diupdate`,
      });
      setEditTarget(null);
      setForm(emptyForm());
      refetch();
    } catch (err) {
      addNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal update acara",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await apiFetch(`/islamic/admin/acara/${deleteTarget.id}`, {
        method: "DELETE",
        adminKey: ISLAMIC_ADMIN_KEY,
        adminKeyHeader: "x-admin-key",
      });
      addNotification({
        type: "success",
        message: `Acara "${deleteTarget.judul}" berhasil dibatalkan`,
      });
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Gagal membatalkan acara",
      });
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
      deskripsi: a.deskripsi ?? "",
      poster: null,
      status: a.status,
    });
  };

  return (
    <PageWrapper
      title="Acara Islamic Center"
      subtitle="Daftar dan kelola acara keislaman"
      action={
        <Button
          size="sm"
          onClick={() => {
            setForm(emptyForm());
            setShowAddModal(true);
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Acara
        </Button>
      }
    >
      <Card>
        <CardHeader
          title="Daftar Acara"
          subtitle={`${(acaraList ?? []).length} acara terdaftar`}
        />
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-y border-slate-200">
                {[
                  "Judul",
                  "Tanggal",
                  "Waktu",
                  "Lokasi",
                  "Kuota",
                  "Status",
                  "Aksi",
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
              {loading &&
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-8 bg-slate-50 rounded-md animate-pulse w-full" />
                    </td>
                  </tr>
                ))}
              {!loading && (acaraList ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <svg
                        className="w-12 h-12 mb-3 text-slate-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-[13px] font-medium tracking-wide">
                        Belum ada acara
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                (acaraList ?? []).map((a) => {
                  const badge = STATUS_BADGE[a.status] ?? {
                    label: a.status,
                    variant: "neutral" as const,
                  };
                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-50/80 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {a.poster_url ? (
                            <img
                              src={a.poster_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm border border-slate-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <svg
                                className="w-5 h-5 text-slate-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          <span className="font-bold text-[13px] text-slate-800">
                            {a.judul}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500 whitespace-nowrap">
                        {a.tanggal}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500 whitespace-nowrap">
                        {fmtTime(a.waktu_mulai)} – {fmtTime(a.waktu_selesai)}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                        {a.lokasi}
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500 whitespace-nowrap">
                        <span className="font-bold text-slate-700">
                          {a.kuota_terisi}
                        </span>{" "}
                        / {a.kuota_maksimal}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEdit(a)}
                          >
                            Edit
                          </Button>
                          {a.status === "aktif" && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeleteTarget(a)}
                            >
                              Batalkan
                            </Button>
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
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Batal
            </Button>
            <Button loading={submitting} onClick={handleAdd}>
              Buat Acara
            </Button>
          </div>
        }
      >
        <AcaraFormFields
          form={form}
          setForm={setForm}
          posterInputRef={posterAddRef}
        />
      </Modal>

      <Modal
        open={editTarget !== null}
        title={`Edit: ${editTarget?.judul ?? ""}`}
        onClose={() => setEditTarget(null)}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>
              Batal
            </Button>
            <Button loading={submitting} onClick={handleEdit}>
              Simpan Perubahan
            </Button>
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
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Kembali
            </Button>
            <Button
              variant="danger"
              loading={submitting}
              onClick={handleDelete}
            >
              Ya, Batalkan
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-4 p-1">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-rose-600"
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
          <p className="text-[13px] font-medium text-slate-600 leading-relaxed mt-1">
            Apakah Anda yakin ingin membatalkan acara{" "}
            <strong className="text-slate-800">{deleteTarget?.judul}</strong>?
            <br />
            Status acara akan berubah menjadi dibatalkan dan tidak dapat diikuti
            lagi.
          </p>
        </div>
      </Modal>
    </PageWrapper>
  );
}
