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
  keterangan?: string; // Struktural atau Guru: misal "Kepala Madrasah", "Waka Kurikulum", "Waka Kesiswaan", "Waka Humas", "Staff EMIS", "Kepala TU", "Guru", dsb.
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

// Jadwal 4 Guru Piket harian yang disetting di Spreadsheet
export type JadwalPiketDayMap = Record<string, string[]>;

export interface InstitutionConfig {
  NAMA_LEMBAGA: string;
  SINGKATAN: string;
  KOTA: string;
  TIMEZONE: string;
  LOGO_URL: string; // Logo Madrasah Aliyah (Kop kanan & branding)
  LOGO_SIRAMA_URL?: string; // Logo SIRAMA (Kop kiri & webapp)
  FAVICON_URL: string;
  NAMA_APLIKASI: string; // "SIRAMA"
  KEPANJANGAN_APLIKASI: string; // "Sistem Informasi Rekap dan Absensi Pengajar Madrasah"
  NAMA_YAYASAN: string; // "YAYASAN PONDOK PESANTREN DARUL LUGHAH WAL KAROMAH"
  ALAMAT_LEMBAGA: string; // "Jl. Raya Sidopekso No. 01, Kraksaan, Probolinggo, Jawa Timur"
  IDENTITAS_LEMBAGA: string; // "NSM: 131235130045 • NPSN: 20584412 • Terakreditasi \"A\" (Unggul)"
  JUDUL_LAPORAN_PDF: string; // "LAPORAN REKAPITULASI KEHADIRAN PENGAJAR (KBM)"
  SUBJUDUL_LAPORAN_PDF?: string; // "Dokumen Administrasi Rekapitulasi Presensi KBM Madrasah"
  NAMA_KEPALA: string; // "Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd."
  JABATAN_KEPALA?: string; // "Kepala Madrasah Aliyah"
  NAMA_STAFF: string; // "Ust. Edi Amin, M.Hum."
  JABATAN_STAFF: string; // "Waka Kurikulum"
  WARNA_UTAMA: string;
  WARNA_SEKUNDER: string;
  API_KEY: string;
  gasUrl: string; // Google Apps Script Web App URL
  autoSyncIntervalMinutes: number;
  PERSEN_SANGAT_BAIK?: number; // 90
  PERSEN_BAIK?: number;        // 80
  PERSEN_CUKUP?: number;       // 70
  LABEL_SANGAT_BAIK?: string;
  LABEL_BAIK?: string;
  LABEL_CUKUP?: string;
  LABEL_KURANG?: string;
  [key: string]: any;
}

export type PiketStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';

export interface GuruPiketRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: string;
  piket1: string;
  status1?: PiketStatus;
  piket2: string;
  status2?: PiketStatus;
  piket3: string;
  status3?: PiketStatus;
  piket4: string;
  status4?: PiketStatus;
  keterangan?: string;
  waktuInput?: string;
}

// Opsi status apel (TERLAMBAT dihapus sesuai permintaan revisi)
export type ApelStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';

export interface ApelAttendanceRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  hari: string;
  nama: string;
  kategori: 'STRUKTURAL' | 'PENGAJAR_SESI_1' | 'PENGAJAR_SESI_1_2';
  jabatanAtauJadwal: string; // e.g. "Waka Kurikulum" atau "Pengajar Sesi 1"
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
