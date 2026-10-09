import { MasterGuru, MasterMapel, ScheduleItem, DayScheduleMap, InstitutionConfig, AttendanceRecord } from '../types/attendance';
import { APP_CONFIG } from '../config/appConfig';

export const DEFAULT_INSTITUTION_CONFIG: InstitutionConfig = {
  NAMA_LEMBAGA: 'Madrasah Aliyah Darul Lughah Wal Karomah',
  SINGKATAN: 'MA DARUL LUGHAH WAL KAROMAH',
  KOTA: 'Kraksaan',
  TIMEZONE: 'Asia/Jakarta',
  LOGO_URL: APP_CONFIG.DEFAULT_LOGO_URL,
  FAVICON_URL: APP_CONFIG.DEFAULT_FAVICON_URL,
  NAMA_APLIKASI: 'SIRAMA',
  NAMA_KEPALA: 'Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd.',
  NAMA_STAFF: 'Ust. Edi Amin, M.Hum.',
  JABATAN_STAFF: 'Waka Kurikulum',
  WARNA_UTAMA: '#0284c7',
  WARNA_SEKUNDER: '#0369a1',
  API_KEY: '',
  gasUrl: APP_CONFIG.SPREADSHEET_GAS_URL,
  autoSyncIntervalMinutes: 2,
  PERSEN_SANGAT_BAIK: 90,
  PERSEN_BAIK: 75,
  PERSEN_CUKUP: 60,
};

export const DEFAULT_STRUKTURAL_MADAR = [
  { nama: 'Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd.', jabatan: 'Kepala Madrasah' },
  { nama: 'Ust. Edi Amin, M.Hum.', jabatan: 'Waka Kurikulum' },
  { nama: 'Ust. Muh. Fathan Zamani, M.A.', jabatan: 'Waka Kesiswaan' },
  { nama: 'Ust. H. Djamauddin, M.Pd.I.', jabatan: 'Waka Sarpras & Humas' },
  { nama: 'Ust. M. Fathur Rozak, S.Pd.', jabatan: 'Staff Kurikulum' },
  { nama: 'Nurrahman, S.Kom.', jabatan: 'Staff Tata Usaha / IT' },
];

export const DEFAULT_MASTER_GURU: MasterGuru[] = [
  { kode: 'RQ', nama: 'Gus. Ahmad Syauqi RN, M.Pd.' },
  { kode: 'AB', nama: 'K. Abdul Mukti, S.Pd.' },
  { kode: 'JU', nama: 'Ust. H. Djamauddin, M.Pd.I.' },
  { kode: 'WH', nama: 'KH. Abd. Wahed, M.Pd.I.' },
  { kode: 'SD', nama: "Ny. Hj. Sa'adah, S.Ag." },
  { kode: 'FH', nama: 'Ny. Farhiah, S.Ag.' },
  { kode: 'HF', nama: 'K. Hapip, M.Pd.I.' },
  { kode: 'LR', nama: 'Ny. Hj. Latifah Rais, S.Pd.' },
  { kode: 'SH', nama: 'Ny. Hj. Siti Khotijah, S.H.I.' },
  { kode: 'ZB', nama: "Ny. Zamharirrotun Badi'ah, S.Pd." },
  { kode: 'AA', nama: 'Abdul Aziz Zain, S.Pd.' },
  { kode: 'SK', nama: 'KH. Shabar, S.Pd.' },
  { kode: 'MG', nama: 'Ny. Maghfiroh, S.Pd.I.' },
  { kode: 'MD', nama: 'Ny. Hj. Maimunah Dahlia, S.Pd.I.' },
  { kode: 'ZY', nama: 'Ust. H. Zaidi, M.H.I., M.Pd.I.' },
  { kode: 'MC', nama: 'Ust. Mashudi, M.Pd.I.' },
  { kode: 'MR', nama: 'Ustd. Meri, S.Pd.' },
  { kode: 'KH', nama: 'Ustd. Khusnul Khotimah, SE' },
  { kode: 'DE', nama: 'Ustd. Dra. Diah Eviati' },
  { kode: 'AS', nama: 'Ustd. Anum Sriwindan, S.Pd.' },
  { kode: 'AF', nama: 'Ust. Aan Farisi, SS.' },
  { kode: 'SU', nama: 'Ustd. Siti Umil Mukminah, S.Si.' },
  { kode: 'EA', nama: 'Ust. Edi Amin, M.Hum.' },
  { kode: 'MH', nama: 'Ust. Moh Lutfi, S.Pd.' },
  { kode: 'US', nama: 'Ustd. Ummi Salamah, S.Pd.' },
  { kode: 'RN', nama: 'Nurrahman, S.Kom.' },
  { kode: 'HB', nama: 'Ust. Habibi, M.Pd.I.' },
  { kode: 'TR', nama: 'Ust. Taufik Rizal, S.Kom.' },
  { kode: 'SL', nama: 'Ust. Sholehuddin M.Pd' },
  { kode: 'LL', nama: 'Ustd. Lilik Burhanatus S., SS.' },
  { kode: 'FZ', nama: 'Ust. Muh. Fathan Zamani, M.A.' },
  { kode: 'DW', nama: 'Ust. Dwi Evayanto, S.Kom' },
  { kode: 'SR', nama: 'Ustd. Sriyati, S.Pd.I.' },
  { kode: 'AH', nama: 'Gus. Ahmad Habibi, Lc' },
  { kode: 'BR', nama: 'Ust. Abdul Bari, S.Pd.' },
  { kode: 'FN', nama: 'Ustd. Fini Novita Sari, S.Pd.' },
  { kode: 'FD', nama: 'Gus. Faid Mufaiqrahman, M.Pd.' },
  { kode: 'AR', nama: 'Ust. Abdus Syakir' },
  { kode: 'SS', nama: 'Gust. Saifus Shomad' },
  { kode: 'AD', nama: 'Ust. Moh. Abduh, Lc' },
  { kode: 'AT', nama: 'Ust. Ahmad Taufik, S.Pd.I' },
  { kode: 'NM', nama: 'Ny. Nurul Makiyah S.Pd' },
  { kode: 'NB', nama: 'Ust. Nurul Abrori' },
  { kode: 'LM', nama: 'Ustdz. Lalalul Maghfiroh' },
  { kode: 'UM', nama: 'Umi Maghfiroh' },
  { kode: 'NA', nama: 'Ning. Naila Afifa' },
  { kode: 'BS', nama: 'Badrus Salam, S.Pd.I' },
  { kode: 'HH', nama: 'Husnul Hotim, S.Or' },
  { kode: 'RD', nama: 'Robithud Dinil Matin, S.Pd.' },
];

export const DEFAULT_MASTER_MAPEL: MasterMapel[] = [
  { kode: 1, nama: "AL-QUR'AN HADITS" },
  { kode: 2, nama: 'AQIDAH AKHLAQ' },
  { kode: 3, nama: 'FIQIH' },
  { kode: 4, nama: 'SKI' },
  { kode: 5, nama: 'PKn' },
  { kode: 6, nama: 'BAHASA INDONESIA' },
  { kode: 7, nama: 'SASTRA INDONESIA' },
  { kode: 8, nama: 'BAHASA ARAB' },
  { kode: 9, nama: 'BAHASA ASING (ARAB)' },
  { kode: 10, nama: 'BAHASA INGGRIS' },
  { kode: 11, nama: 'SASTRA INGGRIS' },
  { kode: 12, nama: 'MATEMATIKA' },
  { kode: 13, nama: 'SEJARAH INDONESIA' },
  { kode: 14, nama: 'FISIKA' },
  { kode: 15, nama: 'BIOLOGI' },
  { kode: 16, nama: 'KIMIA' },
  { kode: 17, nama: 'GEOGRAFI' },
  { kode: 18, nama: 'GEOGRAFI PEMINATAN' },
  { kode: 19, nama: 'EKONOMI' },
  { kode: 20, nama: 'SOSIOLOGI' },
  { kode: 21, nama: 'SENI BUDAYA' },
  { kode: 22, nama: 'PENDIDIKAN JASMANI' },
  { kode: 23, nama: 'TEK. INFORMATIKA' },
  { kode: 24, nama: 'ANTROPOLOGI' },
  { kode: 25, nama: 'ASWAJA' },
  { kode: 26, nama: 'MATEMATIKA PEMINATAN' },
  { kode: 27, nama: 'HADITS' },
  { kode: 28, nama: 'ILMU TAFSIR' },
  { kode: 29, nama: 'USHUL FIQH' },
  { kode: 30, nama: 'BAHASA ARAB PEMINATAN' },
  { kode: 31, nama: "TAHFIDZ QUR'AN" },
  { kode: 32, nama: 'BIMBINGAN KONSELING' },
  { kode: 33, nama: 'BAHASA MANDARIN' },
];

export const DAFTAR_HARI = ['Sabtu', 'Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis'];

export const DEFAULT_WEEKLY_SCHEDULE: DayScheduleMap = {
  Sabtu: [
    { id: 'sb-1', hari: 'Sabtu', kelas: 'X A', jam: 1, mataPelajaran: 'SKI', guruPengampu: 'Abdul Aziz Zain, S.Pd.' },
    { id: 'sb-2', hari: 'Sabtu', kelas: 'X A', jam: 2, mataPelajaran: 'SKI', guruPengampu: 'Abdul Aziz Zain, S.Pd.' },
    { id: 'sb-3', hari: 'Sabtu', kelas: 'X A', jam: 3, mataPelajaran: "TAHFIDZ QUR'AN", guruPengampu: 'Ning. Naila Afifa' },
    { id: 'sb-4', hari: 'Sabtu', kelas: 'X A', jam: 4, mataPelajaran: "TAHFIDZ QUR'AN", guruPengampu: 'Ning. Naila Afifa' },
    { id: 'sb-5', hari: 'Sabtu', kelas: 'X A', jam: 5, mataPelajaran: 'ASWAJA', guruPengampu: 'Ust. Abdus Syakir' },
    { id: 'sb-6', hari: 'Sabtu', kelas: 'X A', jam: 6, mataPelajaran: 'ASWAJA', guruPengampu: 'Ust. Abdus Syakir' },
    { id: 'sb-7', hari: 'Sabtu', kelas: 'X A', jam: 7, mataPelajaran: 'FIQIH', guruPengampu: 'Ust. Mashudi, M.Pd.I.' },
    { id: 'sb-8', hari: 'Sabtu', kelas: 'X A', jam: 8, mataPelajaran: 'FIQIH', guruPengampu: 'Ust. Mashudi, M.Pd.I.' },

    { id: 'sb-9', hari: 'Sabtu', kelas: 'X B', jam: 1, mataPelajaran: 'BAHASA INDONESIA', guruPengampu: 'Ust. Habibi, M.Pd.I.' },
    { id: 'sb-10', hari: 'Sabtu', kelas: 'X B', jam: 2, mataPelajaran: 'BAHASA INDONESIA', guruPengampu: 'Ust. Habibi, M.Pd.I.' },
    { id: 'sb-11', hari: 'Sabtu', kelas: 'X B', jam: 3, mataPelajaran: 'SKI', guruPengampu: 'Abdul Aziz Zain, S.Pd.' },
    { id: 'sb-12', hari: 'Sabtu', kelas: 'X B', jam: 4, mataPelajaran: 'SKI', guruPengampu: 'Abdul Aziz Zain, S.Pd.' },
    { id: 'sb-13', hari: 'Sabtu', kelas: 'X B', jam: 5, mataPelajaran: 'KIMIA', guruPengampu: 'Ustd. Meri, S.Pd.' },
    { id: 'sb-14', hari: 'Sabtu', kelas: 'X B', jam: 6, mataPelajaran: 'FISIKA', guruPengampu: 'Ustd. Siti Umil Mukminah, S.Si.' },
    { id: 'sb-15', hari: 'Sabtu', kelas: 'X B', jam: 7, mataPelajaran: 'FISIKA', guruPengampu: 'Ustd. Siti Umil Mukminah, S.Si.' },
    { id: 'sb-16', hari: 'Sabtu', kelas: 'X B', jam: 8, mataPelajaran: 'FISIKA', guruPengampu: 'Ustd. Siti Umil Mukminah, S.Si.' },

    { id: 'sb-17', hari: 'Sabtu', kelas: 'X C', jam: 1, mataPelajaran: 'PKn', guruPengampu: 'Ust. Edi Amin, M.Hum.' },
    { id: 'sb-18', hari: 'Sabtu', kelas: 'X C', jam: 2, mataPelajaran: 'PKn', guruPengampu: 'Ust. Edi Amin, M.Hum.' },
    { id: 'sb-19', hari: 'Sabtu', kelas: 'X C', jam: 3, mataPelajaran: 'AQIDAH AKHLAQ', guruPengampu: 'Badrus Salam, S.Pd.I' },
    { id: 'sb-20', hari: 'Sabtu', kelas: 'X C', jam: 4, mataPelajaran: 'AQIDAH AKHLAQ', guruPengampu: 'Badrus Salam, S.Pd.I' },
    { id: 'sb-21', hari: 'Sabtu', kelas: 'X C', jam: 5, mataPelajaran: 'KIMIA', guruPengampu: 'Ustd. Meri, S.Pd.' },
    { id: 'sb-22', hari: 'Sabtu', kelas: 'X C', jam: 6, mataPelajaran: 'KIMIA', guruPengampu: 'Ustd. Meri, S.Pd.' },
    { id: 'sb-23', hari: 'Sabtu', kelas: 'X C', jam: 7, mataPelajaran: 'MATEMATIKA', guruPengampu: 'Ust. Moh Lutfi, S.Pd.' },
    { id: 'sb-24', hari: 'Sabtu', kelas: 'X C', jam: 8, mataPelajaran: 'MATEMATIKA', guruPengampu: 'Ust. Moh Lutfi, S.Pd.' },

    { id: 'sb-25', hari: 'Sabtu', kelas: 'X D', jam: 1, mataPelajaran: 'MATEMATIKA', guruPengampu: 'Ust. Moh Lutfi, S.Pd.' },
    { id: 'sb-26', hari: 'Sabtu', kelas: 'X D', jam: 2, mataPelajaran: 'MATEMATIKA', guruPengampu: 'Ust. Moh Lutfi, S.Pd.' },
    { id: 'sb-27', hari: 'Sabtu', kelas: 'X D', jam: 3, mataPelajaran: 'BAHASA ARAB', guruPengampu: 'Gus. Ahmad Habibi, Lc' },
    { id: 'sb-28', hari: 'Sabtu', kelas: 'X D', jam: 4, mataPelajaran: 'BAHASA ARAB', guruPengampu: 'Gus. Ahmad Habibi, Lc' },
    { id: 'sb-29', hari: 'Sabtu', kelas: 'X D', jam: 5, mataPelajaran: "AL-QUR'AN HADITS", guruPengampu: 'Gus. Ahmad Syauqi RN, M.Pd.' },
    { id: 'sb-30', hari: 'Sabtu', kelas: 'X D', jam: 6, mataPelajaran: "AL-QUR'AN HADITS", guruPengampu: 'Gus. Ahmad Syauqi RN, M.Pd.' },
    { id: 'sb-31', hari: 'Sabtu', kelas: 'X D', jam: 7, mataPelajaran: 'BIOLOGI', guruPengampu: 'Ustd. Fini Novita Sari, S.Pd.' },
    { id: 'sb-32', hari: 'Sabtu', kelas: 'X D', jam: 8, mataPelajaran: 'BIOLOGI', guruPengampu: 'Ustd. Fini Novita Sari, S.Pd.' },
  ],
  Ahad: [
    { id: 'ah-1', hari: 'Ahad', kelas: 'X A', jam: 1, mataPelajaran: 'BAHASA ARAB', guruPengampu: 'Gus. Ahmad Habibi, Lc' },
    { id: 'ah-2', hari: 'Ahad', kelas: 'X A', jam: 2, mataPelajaran: 'BAHASA ARAB', guruPengampu: 'Gus. Ahmad Habibi, Lc' },
    { id: 'ah-3', hari: 'Ahad', kelas: 'X A', jam: 3, mataPelajaran: 'MATEMATIKA', guruPengampu: 'Ust. Moh Lutfi, S.Pd.' },
    { id: 'ah-4', hari: 'Ahad', kelas: 'X A', jam: 4, mataPelajaran: 'MATEMATIKA', guruPengampu: 'Ust. Moh Lutfi, S.Pd.' },
    { id: 'ah-5', hari: 'Ahad', kelas: 'X A', jam: 5, mataPelajaran: 'BIOLOGI', guruPengampu: 'Ustd. Fini Novita Sari, S.Pd.' },
    { id: 'ah-6', hari: 'Ahad', kelas: 'X A', jam: 6, mataPelajaran: 'BIOLOGI', guruPengampu: 'Ustd. Fini Novita Sari, S.Pd.' },
    { id: 'ah-7', hari: 'Ahad', kelas: 'X A', jam: 7, mataPelajaran: 'PENDIDIKAN JASMANI', guruPengampu: 'Husnul Hotim, S.Or' },
    { id: 'ah-8', hari: 'Ahad', kelas: 'X A', jam: 8, mataPelajaran: 'PENDIDIKAN JASMANI', guruPengampu: 'Husnul Hotim, S.Or' },

    { id: 'ah-9', hari: 'Ahad', kelas: 'X B', jam: 1, mataPelajaran: 'FIQIH', guruPengampu: 'Ust. Mashudi, M.Pd.I.' },
    { id: 'ah-10', hari: 'Ahad', kelas: 'X B', jam: 2, mataPelajaran: 'FIQIH', guruPengampu: 'Ust. Mashudi, M.Pd.I.' },
    { id: 'ah-11', hari: 'Ahad', kelas: 'X B', jam: 3, mataPelajaran: "TAHFIDZ QUR'AN", guruPengampu: 'Ning. Naila Afifa' },
    { id: 'ah-12', hari: 'Ahad', kelas: 'X B', jam: 4, mataPelajaran: "TAHFIDZ QUR'AN", guruPengampu: 'Ning. Naila Afifa' },
    { id: 'ah-13', hari: 'Ahad', kelas: 'X B', jam: 5, mataPelajaran: 'MATEMATIKA', guruPengampu: 'Ust. Moh Lutfi, S.Pd.' },
    { id: 'ah-14', hari: 'Ahad', kelas: 'X B', jam: 6, mataPelajaran: 'MATEMATIKA', guruPengampu: 'Ust. Moh Lutfi, S.Pd.' },
    { id: 'ah-15', hari: 'Ahad', kelas: 'X B', jam: 7, mataPelajaran: 'BAHASA INGGRIS', guruPengampu: 'Ustd. Anum Sriwindan, S.Pd.' },
    { id: 'ah-16', hari: 'Ahad', kelas: 'X B', jam: 8, mataPelajaran: 'BAHASA INGGRIS', guruPengampu: 'Ustd. Anum Sriwindan, S.Pd.' },

    { id: 'ah-17', hari: 'Ahad', kelas: 'X C', jam: 1, mataPelajaran: 'BAHASA INGGRIS', guruPengampu: 'Ustd. Anum Sriwindan, S.Pd.' },
    { id: 'ah-18', hari: 'Ahad', kelas: 'X C', jam: 2, mataPelajaran: 'BAHASA INGGRIS', guruPengampu: 'Ustd. Anum Sriwindan, S.Pd.' },
    { id: 'ah-19', hari: 'Ahad', kelas: 'X C', jam: 3, mataPelajaran: 'BIOLOGI', guruPengampu: 'Ustd. Fini Novita Sari, S.Pd.' },
    { id: 'ah-20', hari: 'Ahad', kelas: 'X C', jam: 4, mataPelajaran: 'BIOLOGI', guruPengampu: 'Ustd. Fini Novita Sari, S.Pd.' },
    { id: 'ah-21', hari: 'Ahad', kelas: 'X C', jam: 5, mataPelajaran: 'BAHASA INDONESIA', guruPengampu: 'Ust. Habibi, M.Pd.I.' },
    { id: 'ah-22', hari: 'Ahad', kelas: 'X C', jam: 6, mataPelajaran: 'BAHASA INDONESIA', guruPengampu: 'Ust. Habibi, M.Pd.I.' },
    { id: 'ah-23', hari: 'Ahad', kelas: 'X C', jam: 7, mataPelajaran: 'SKI', guruPengampu: 'Abdul Aziz Zain, S.Pd.' },
    { id: 'ah-24', hari: 'Ahad', kelas: 'X C', jam: 8, mataPelajaran: 'SKI', guruPengampu: 'Abdul Aziz Zain, S.Pd.' },

    { id: 'ah-25', hari: 'Ahad', kelas: 'X D', jam: 1, mataPelajaran: 'PKn', guruPengampu: 'Ust. Edi Amin, M.Hum.' },
    { id: 'ah-26', hari: 'Ahad', kelas: 'X D', jam: 2, mataPelajaran: 'PKn', guruPengampu: 'Ust. Edi Amin, M.Hum.' },
    { id: 'ah-27', hari: 'Ahad', kelas: 'X D', jam: 3, mataPelajaran: 'KIMIA', guruPengampu: 'Ustd. Meri, S.Pd.' },
    { id: 'ah-28', hari: 'Ahad', kelas: 'X D', jam: 4, mataPelajaran: 'KIMIA', guruPengampu: 'Ustd. Meri, S.Pd.' },
    { id: 'ah-29', hari: 'Ahad', kelas: 'X D', jam: 5, mataPelajaran: 'FIQIH', guruPengampu: 'Ust. Mashudi, M.Pd.I.' },
    { id: 'ah-30', hari: 'Ahad', kelas: 'X D', jam: 6, mataPelajaran: 'FIQIH', guruPengampu: 'Ust. Mashudi, M.Pd.I.' },
    { id: 'ah-31', hari: 'Ahad', kelas: 'X D', jam: 7, mataPelajaran: 'AQIDAH AKHLAQ', guruPengampu: 'Badrus Salam, S.Pd.I' },
    { id: 'ah-32', hari: 'Ahad', kelas: 'X D', jam: 8, mataPelajaran: 'AQIDAH AKHLAQ', guruPengampu: 'Badrus Salam, S.Pd.I' },
  ],
  Senin: [],
  Selasa: [],
  Rabu: [],
  Kamis: [],
};

// Copy schedule to remaining days with appropriate variation if empty
DAFTAR_HARI.forEach(day => {
  if (!DEFAULT_WEEKLY_SCHEDULE[day] || DEFAULT_WEEKLY_SCHEDULE[day].length === 0) {
    DEFAULT_WEEKLY_SCHEDULE[day] = DEFAULT_WEEKLY_SCHEDULE.Sabtu.map((item, idx) => ({
      ...item,
      id: `${day.toLowerCase()}-${idx + 1}`,
      hari: day,
    }));
  }
});

export const KELAS_OPTIONS = [
  'X A',
  'X B',
  'X C',
  'X D',
  'XI MIPA 1',
  'XI MIPA 2',
  'XI IPS 1',
  'XI IPS 2',
  'XI PK',
  'XII MIPA 1',
  'XII MIPA 2',
  'XII IPS',
  'XII PK',
];

export const MAPEL_OPTIONS = DEFAULT_MASTER_MAPEL.map(m => m.nama);

export const JAM_KE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export function getInitialAttendanceRecords(): AttendanceRecord[] {
  const today = new Date();
  const formatISO = (d: Date) => d.toISOString().split('T')[0];
  const records: AttendanceRecord[] = [];

  const dayNamesIndo = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  let idCounter = 1;

  for (let offset = 7; offset >= 0; offset--) {
    const curDate = new Date(today);
    curDate.setDate(today.getDate() - offset);

    const dayIdx = curDate.getDay();
    if (dayIdx === 5) continue; // Skip Friday (Libur)

    const dateStr = formatISO(curDate);
    const dayName = dayNamesIndo[dayIdx];
    const schedule = DEFAULT_WEEKLY_SCHEDULE[dayName] || DEFAULT_WEEKLY_SCHEDULE.Sabtu;

    // Take schedule items
    schedule.slice(0, 16).forEach((sch, sIdx) => {
      let status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA' | 'TUGAS_DINAS' = 'HADIR';
      let ket = '';

      if (offset === 1 && sIdx === 2) {
        status = 'IZIN';
        ket = 'Izin takziah';
      } else if (offset === 2 && sIdx === 6) {
        status = 'SAKIT';
        ket = 'Surat dokter';
      } else if (offset === 3 && sIdx === 9) {
        status = 'TUGAS_DINAS';
        ket = 'MGMP Kemenag';
      } else if (offset === 4 && sIdx === 14) {
        status = 'ALPA';
        ket = 'Tanpa keterangan';
      }

      records.push({
        id: `rec-${dateStr}-${sch.kelas.replace(/\s+/g, '')}-j${sch.jam}-${idCounter++}`,
        tanggal: dateStr,
        hari: dayName,
        kelas: sch.kelas,
        jam: sch.jam,
        mataPelajaran: sch.mataPelajaran,
        namaGuru: sch.guruPengampu,
        status,
        keterangan: ket,
        waktuInput: `${dateStr} 07:05:00`,
      });
    });
  }

  return records;
}
