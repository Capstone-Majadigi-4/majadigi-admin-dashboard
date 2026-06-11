import { useState } from 'react';
import { PageWrapper } from '../../components/layout';
import { Badge, Button, Card, CardBody, CardHeader, Modal } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { apiFetch } from '../../services/apiClient';
import { useUIStore } from '../../store/useUIStore';
import type { Armada, Koridor } from '../../types';

interface UpdateLokasiForm {
  lat: string;
  lng: string;
}

function ArmadaStatusBadge({ status }: { status: string }) {
  return status === 'aktif'
    ? <Badge variant="success">Aktif</Badge>
    : <Badge variant="neutral">Nonaktif</Badge>;
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

function ArmadaTable({
  koridorId,
  onUpdateLokasi,
}: {
  koridorId: string;
  onUpdateLokasi: (a: Armada) => void;
}) {
  const { data: armada, loading, error } = useFetch<Armada[]>(
    `/transjatim/armada/koridor/${koridorId}`
  );
  const list = armada ?? [];

  if (loading) {
    return (
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-3">
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="px-4 py-10 text-center text-sm text-red-500">{error}</p>;
  }

  if (list.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-gray-400">Tidak ada armada untuk koridor ini</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {['Kode Bus', 'Kapasitas', 'Status', 'Latitude', 'Longitude', 'Update Terakhir', 'Aksi'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {list.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-gray-800">{a.kode_bus}</td>
              <td className="px-4 py-3 text-gray-600">{a.kapasitas} penumpang</td>
              <td className="px-4 py-3"><ArmadaStatusBadge status={a.status} /></td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.lat ?? '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.lng ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{a.updated_at}</td>
              <td className="px-4 py-3">
                <Button size="sm" variant="secondary" onClick={() => onUpdateLokasi(a)}>
                  Update Lokasi
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Armada() {
  const addNotification = useUIStore((s) => s.addNotification);

  const [koridorFilter, setKoridorFilter] = useState('');
  const [activeKoridor, setActiveKoridor] = useState('');

  const { data: koridor } = useFetch<Koridor[]>('/transjatim/koridor');

  const [selectedArmada, setSelectedArmada] = useState<Armada | null>(null);
  const [form, setForm] = useState<UpdateLokasiForm>({ lat: '', lng: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleFilter = () => {
    setActiveKoridor(koridorFilter);
  };

  const handleUpdateLokasi = async () => {
    if (!selectedArmada || !form.lat || !form.lng) {
      addNotification({ type: 'error', message: 'Lat dan Lng wajib diisi' });
      return;
    }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      addNotification({ type: 'error', message: 'Lat dan Lng harus berupa angka' });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/transjatim/armada/${selectedArmada.id}/lokasi`, {
        method: 'PUT',
        body: { lat, lng },
      });
      addNotification({ type: 'success', message: `Lokasi ${selectedArmada.kode_bus} berhasil diperbarui` });
      setSelectedArmada(null);
      setForm({ lat: '', lng: '' });
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Gagal update lokasi' });
    } finally {
      setSubmitting(false);
    }
  };

  const openUpdateModal = (a: Armada) => {
    setSelectedArmada(a);
    setForm({ lat: a.lat !== null ? a.lat.toString() : '', lng: a.lng !== null ? a.lng.toString() : '' });
  };

  return (
    <PageWrapper title="Armada Transjatim" subtitle="Tracking posisi armada per koridor">
      <Card>
        <CardBody className="flex items-center gap-3">
          <label htmlFor="koridor-filter" className="text-sm font-medium text-gray-600 shrink-0">Koridor:</label>
          <select
            id="koridor-filter"
            value={koridorFilter}
            onChange={(e) => setKoridorFilter(e.target.value)}
            className={`${inputCls} max-w-64`}
          >
            <option value="">-- Pilih koridor --</option>
            {(koridor ?? []).map((k) => (
              <option key={k.id} value={k.id}>{k.kode} — {k.nama}</option>
            ))}
          </select>
          <Button size="sm" onClick={handleFilter} disabled={!koridorFilter}>Tampilkan</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Daftar Armada"
          subtitle={activeKoridor
            ? (koridor ?? []).find((k) => k.id === activeKoridor)?.nama ?? activeKoridor
            : 'Pilih koridor terlebih dahulu'
          }
        />
        {activeKoridor
          ? <ArmadaTable koridorId={activeKoridor} onUpdateLokasi={openUpdateModal} />
          : (
            <div className="px-4 py-12 text-center text-sm text-gray-400">
              Pilih koridor di atas untuk melihat daftar armada
            </div>
          )
        }
      </Card>

      <Modal
        open={!!selectedArmada}
        title="Update Lokasi Armada"
        onClose={() => setSelectedArmada(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelectedArmada(null)}>Batal</Button>
            <Button loading={submitting} onClick={handleUpdateLokasi}>Update</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedArmada && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Kode Bus</span>
                <span className="font-semibold">{selectedArmada.kode_bus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kapasitas</span>
                <span>{selectedArmada.kapasitas} penumpang</span>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="lat-input" className={labelCls}>Latitude</label>
            <input
              id="lat-input"
              type="number"
              step="any"
              placeholder="Contoh: -7.305"
              value={form.lat}
              onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
              className={inputCls}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="lng-input" className={labelCls}>Longitude</label>
            <input
              id="lng-input"
              type="number"
              step="any"
              placeholder="Contoh: 112.731"
              value={form.lng}
              onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
