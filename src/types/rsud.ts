export interface Dokter {
  id: string;
  nama: string;
  spesialisasi: string;
  jadwal: string[];
}

export interface Poli {
  id: string;
  nama: string;
  dokter: Dokter[];
}

export type AntreanStatus = 'menunggu' | 'dipanggil' | 'selesai';

export interface Antrean {
  antrean_id: string;
  nomor_antrean: string;
  poli: string;
  poli_id: string;
  dokter: string;
  estimasi_jam: string;
  status: AntreanStatus;
  tanggal: string;
  pasien_nama: string;
  pasien_nik: string;
}

export interface Kamar {
  id: string;
  nama: string;
  kelas: string;
  kapasitas: number;
  terisi: number;
}
