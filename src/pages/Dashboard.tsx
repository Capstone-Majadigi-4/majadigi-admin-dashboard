import { PageWrapper } from '../components/layout';
import { Card, CardBody } from '../components/ui';

export function Dashboard() {
  return (
    <PageWrapper title="Dashboard" subtitle="Ringkasan semua layanan Majadigi Super App">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Antrian RSUD Hari Ini', value: '24', sub: '3 sedang dipanggil', color: 'text-blue-600' },
          { label: 'Booking Islamic Pending', value: '5', sub: 'Menunggu persetujuan', color: 'text-yellow-600' },
          { label: 'Komoditas Dipantau', value: '8', sub: 'Harga diperbarui hari ini', color: 'text-green-600' },
          { label: 'Tiket Transjatim Aktif', value: '12', sub: 'Dari 3 koridor', color: 'text-purple-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <p className="text-gray-500 text-sm text-center py-8">
            Dashboard overview lengkap akan dibuat di Fase 2
          </p>
        </CardBody>
      </Card>
    </PageWrapper>
  );
}
