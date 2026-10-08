export type AttendanceStatus = 
  | 'HADIR' 
  | 'SAKIT' 
  | 'IZIN' 
  | 'ALPA' 
  | 'TUGAS_DINAS' 
  | 'TERLAMBAT';

export interface AttendanceRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  namaGuru: string;
  nip: string;
  mataPelajaran: string;
  kelas: string;
  jamKe: string; // e.g., "1 - 2" or "3 - 4"
  status: AttendanceStatus;
  keterangan: string;
  waktuInput?: string;
}

export interface Teacher {
  id: string;
  nama: string;
  nip: string;
  mataPelajaran: string;
  telepon?: string;
  jabatan?: string;
}

export type DateFilterPreset = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export interface FilterState {
  preset: DateFilterPreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  searchQuery: string;
  selectedGuru: string;
  selectedKelas: string;
  selectedMapel: string;
  selectedStatus: string;
}

export interface InstitutionConfig {
  namaYayasan: string;
  namaMadrasah: string;
  nsm: string;
  npsn: string;
  alamat: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  telepon: string;
  email: string;
  website: string;
  namaKepala: string;
  nipKepala: string;
  namaKurikulum: string;
  nipKurikulum: string;
  gasUrl: string; // Google Apps Script Web App URL
  autoSyncIntervalMinutes: number;
  useSampleFallback: boolean;
}

export interface TeacherSummary {
  nama: string;
  nip: string;
  mataPelajaran: string;
  totalSesi: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  tugasDinas: number;
  terlambat: number;
  persentaseKehadiran: number;
}
