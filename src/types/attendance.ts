export type AttendanceStatus = 
  | 'HADIR' 
  | 'SAKIT' 
  | 'IZIN' 
  | 'ALPA' 
  | 'TUGAS_DINAS';

export interface AttendanceRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari?: string; // Sabtu, Ahad, Senin, Selasa, Rabu, Kamis
  kelas: string;
  jam: string | number; // 1, 2, 3, etc.
  mataPelajaran: string;
  namaGuru: string;
  kodeGuru?: string;
  status: AttendanceStatus;
  keterangan: string;
  waktuInput?: string;
}

export interface MasterGuru {
  kode: string;
  nama: string;
}

export interface MasterMapel {
  kode: number | string;
  nama: string;
}

export interface ScheduleItem {
  id: string;
  hari: string;
  kelas: string;
  jam: number | string;
  mataPelajaran: string;
  guruPengampu: string;
}

export type DayScheduleMap = Record<string, ScheduleItem[]>;

export interface InstitutionConfig {
  NAMA_LEMBAGA: string;
  SINGKATAN: string;
  KOTA: string;
  TIMEZONE: string;
  LOGO_URL: string;
  FAVICON_URL: string;
  NAMA_APLIKASI: string;
  NAMA_KEPALA: string;
  NAMA_STAFF: string;
  JABATAN_STAFF: string;
  WARNA_UTAMA: string;
  WARNA_SEKUNDER: string;
  API_KEY: string;
  gasUrl: string; // Google Apps Script Web App URL
  autoSyncIntervalMinutes: number;
  PERSEN_SANGAT_BAIK?: number; // e.g. 90
  PERSEN_BAIK?: number;        // e.g. 75
  PERSEN_CUKUP?: number;       // e.g. 60
  [key: string]: any;
}

export interface GuruPiketRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: string;
  piket1: string;
  piket2: string;
  piket3: string;
  piket4: string;
  keterangan?: string;
  waktuInput?: string;
}

export type ApelStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPA';

export interface ApelAttendanceRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: string;
  nama: string;
  kategori: 'STRUKTURAL' | 'PENGAJAR_SESI_1_2';
  jabatanAtauJadwal: string; // e.g. "Kepala Madrasah", "Pengajar Jam 1-2 di X-A"
  status: ApelStatus;
  keterangan?: string;
  waktuInput?: string;
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

export interface TeacherSummary {
  nama: string;
  kodeGuru?: string;
  mataPelajaran: string;
  totalSesi: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  tugasDinas: number;
  persentaseKehadiran: number;
}
