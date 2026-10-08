import { Teacher, AttendanceRecord, InstitutionConfig } from '../types/attendance';

export const DEFAULT_INSTITUTION_CONFIG: InstitutionConfig = {
  namaYayasan: 'YAYASAN PONDOK PESANTREN DARUL LUGHAH WAL KAROMAH',
  namaMadrasah: 'MADRASAH ALIYAH DARUL LUGHAH WAL KAROMAH',
  nsm: '131235130045',
  npsn: '20584412',
  alamat: 'Jl. Raya Sidopekso No. 01, Kraksaan',
  kecamatan: 'Kraksaan',
  kabupaten: 'Kabupaten Probolinggo',
  provinsi: 'Jawa Timur',
  telepon: '(0335) 841234',
  email: 'ma.darullughahwalkaromah@gmail.com',
  website: 'www.madar.sch.id',
  namaKepala: 'Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd.',
  nipKepala: '197805142005011004',
  namaKurikulum: 'Ust. M. Fathur Rozak, S.Pd. (Waka Kurikulum)',
  nipKurikulum: '198509202010011012',
  gasUrl: '', // Will be entered by user or loaded from localStorage
  autoSyncIntervalMinutes: 5,
  useSampleFallback: true,
};

export const DEFAULT_TEACHERS: Teacher[] = [
  { id: 't1', nama: 'Ust. H. Ahmad Baidhowi, M.Pd.', nip: '197805142005011004', mataPelajaran: 'Al-Qur\'an Hadits', jabatan: 'Kepala Madrasah' },
  { id: 't2', nama: 'Ust. M. Fathur Rozak, S.Pd.', nip: '198509202010011012', mataPelajaran: 'Bahasa Arab', jabatan: 'Waka Kurikulum' },
  { id: 't3', nama: 'Usth. Siti Maryam, S.Pd.I.', nip: '198903152014022003', mataPelajaran: 'Fiqih', jabatan: 'Guru Mata Pelajaran' },
  { id: 't4', nama: 'Ust. Ahmad Zaini, M.Hum.', nip: '198211042008011007', mataPelajaran: 'Nahwu Shorof', jabatan: 'Waka Kesiswaan' },
  { id: 't5', nama: 'Usth. Nurul Hidayati, S.Si.', nip: '199107222016042001', mataPelajaran: 'Matematika', jabatan: 'Guru Mata Pelajaran' },
  { id: 't6', nama: 'Ust. Moh. Kholilur Rahman, M.Pd.', nip: '198704182012011005', mataPelajaran: 'Sejarah Kebudayaan Islam (SKI)', jabatan: 'Pembina OSIS' },
  { id: 't7', nama: 'Usth. Dewi Anisah, S.Pd.', nip: '199308102018022006', mataPelajaran: 'Bahasa Inggris', jabatan: 'Guru Mata Pelajaran' },
  { id: 't8', nama: 'Ust. Syamsul Arifin, S.Pd.', nip: '198402282009021003', mataPelajaran: 'Biologi', jabatan: 'Kepala Lab IPA' },
  { id: 't9', nama: 'Ust. Abdurrahman, S.Ag.', nip: '198006122007011008', mataPelajaran: 'Akidah Akhlak', jabatan: 'Guru Mata Pelajaran' },
  { id: 't10', nama: 'Usth. Fitriyah, M.Pd.', nip: '199012052015032002', mataPelajaran: 'Bahasa Indonesia', jabatan: 'Kepala Perpustakaan' },
  { id: 't11', nama: 'Ust. Hasan Basri, S.T.', nip: '198601192011011009', mataPelajaran: 'Informatika', jabatan: 'Proktor Madrasah' },
  { id: 't12', nama: 'Ust. Zainul Muttaqin, S.Pd.', nip: '199209142019031001', mataPelajaran: 'Pendidikan Jasmani (PJOK)', jabatan: 'Guru Mata Pelajaran' },
];

export const KELAS_OPTIONS = [
  'X-A (Putra)',
  'X-B (Putri)',
  'X-C (Tahfidz)',
  'XI-MIPA 1 (Putra)',
  'XI-MIPA 2 (Putri)',
  'XI-IPS 1 (Putra)',
  'XI-IPS 2 (Putri)',
  'XI-Keagamaan (PK)',
  'XII-MIPA 1 (Putra)',
  'XII-MIPA 2 (Putri)',
  'XII-IPS (Campuran)',
  'XII-Keagamaan (PK)',
];

export const MAPEL_OPTIONS = [
  'Al-Qur\'an Hadits',
  'Akidah Akhlak',
  'Fiqih',
  'Sejarah Kebudayaan Islam (SKI)',
  'Bahasa Arab',
  'Nahwu Shorof',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika',
  'Biologi',
  'Fisika',
  'Kimia',
  'Ekonomi',
  'Geografi',
  'Sosiologi',
  'Informatika',
  'Pendidikan Jasmani (PJOK)',
  'Seni Budaya',
];

export const JAM_KE_OPTIONS = [
  '1 - 2 (07.00 - 08.20)',
  '3 - 4 (08.20 - 09.40)',
  '5 - 6 (10.00 - 11.20)',
  '7 - 8 (11.20 - 12.40)',
  '9 - 10 (13.15 - 14.35)',
];

// Generate sample attendance records around current date for realistic experience
export function getInitialAttendanceRecords(): AttendanceRecord[] {
  const today = new Date();
  const records: AttendanceRecord[] = [];

  // Helper to format date YYYY-MM-DD
  const formatISO = (d: Date) => d.toISOString().split('T')[0];

  // We generate data across the last 14 school days
  const sampleSchedule = [
    { guru: 'Ust. M. Fathur Rozak, S.Pd.', nip: '198509202010011012', mapel: 'Bahasa Arab', kelas: 'X-A (Putra)', jam: '1 - 2 (07.00 - 08.20)' },
    { guru: 'Usth. Siti Maryam, S.Pd.I.', nip: '198903152014022003', mapel: 'Fiqih', kelas: 'XI-MIPA 2 (Putri)', jam: '3 - 4 (08.20 - 09.40)' },
    { guru: 'Ust. Ahmad Zaini, M.Hum.', nip: '198211042008011007', mapel: 'Nahwu Shorof', kelas: 'XI-Keagamaan (PK)', jam: '1 - 2 (07.00 - 08.20)' },
    { guru: 'Usth. Nurul Hidayati, S.Si.', nip: '199107222016042001', mapel: 'Matematika', kelas: 'XII-MIPA 1 (Putra)', jam: '5 - 6 (10.00 - 11.20)' },
    { guru: 'Ust. Moh. Kholilur Rahman, M.Pd.', nip: '198704182012011005', mapel: 'Sejarah Kebudayaan Islam (SKI)', kelas: 'X-B (Putri)', jam: '3 - 4 (08.20 - 09.40)' },
    { guru: 'Usth. Dewi Anisah, S.Pd.', nip: '199308102018022006', mapel: 'Bahasa Inggris', kelas: 'XI-IPS 1 (Putra)', jam: '7 - 8 (11.20 - 12.40)' },
    { guru: 'Ust. Syamsul Arifin, S.Pd.', nip: '198402282009021003', mapel: 'Biologi', kelas: 'XII-MIPA 2 (Putri)', jam: '1 - 2 (07.00 - 08.20)' },
    { guru: 'Ust. Abdurrahman, S.Ag.', nip: '198006122007011008', mapel: 'Akidah Akhlak', kelas: 'X-C (Tahfidz)', jam: '5 - 6 (10.00 - 11.20)' },
    { guru: 'Usth. Fitriyah, M.Pd.', nip: '199012052015032002', mapel: 'Bahasa Indonesia', kelas: 'XII-IPS (Campuran)', jam: '3 - 4 (08.20 - 09.40)' },
    { guru: 'Ust. Hasan Basri, S.T.', nip: '198601192011011009', mapel: 'Informatika', kelas: 'XI-MIPA 1 (Putra)', jam: '7 - 8 (11.20 - 12.40)' },
  ];

  let idCounter = 1;

  for (let dayOffset = 10; dayOffset >= 0; dayOffset--) {
    const curDate = new Date(today);
    curDate.setDate(today.getDate() - dayOffset);

    // Skip Sunday (day 0) and Friday if preferred, or include school days (Sunday to Thursday in some Islamic boarding schools or Mon-Sat)
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek === 5) continue; // Skip Friday (Libur Pesantren/Madrasah)

    const dateStr = formatISO(curDate);

    sampleSchedule.forEach((sch, idx) => {
      let status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA' | 'TUGAS_DINAS' | 'TERLAMBAT' = 'HADIR';
      let ket = 'Hadir mengajar tepat waktu';

      // Inject realistic variance
      if (dayOffset === 1 && idx === 1) {
        status = 'IZIN';
        ket = 'Izin takziah keluarga di Paiton';
      } else if (dayOffset === 2 && idx === 3) {
        status = 'SAKIT';
        ket = 'Surat keterangan dokter (Klinik PKU)';
      } else if (dayOffset === 4 && idx === 5) {
        status = 'TUGAS_DINAS';
        ket = 'Workshop MGMP Bahasa Inggris Kemenag Probolinggo';
      } else if (dayOffset === 0 && idx === 6) {
        status = 'TERLAMBAT';
        ket = 'Terlambat 15 menit, kendala ban bocor';
      } else if (dayOffset === 6 && idx === 8) {
        status = 'ALPA';
        ket = 'Tanpa pemberitahuan ke piket kurikulum';
      }

      records.push({
        id: `rec-${dateStr}-${idCounter++}`,
        tanggal: dateStr,
        namaGuru: sch.guru,
        nip: sch.nip,
        mataPelajaran: sch.mapel,
        kelas: sch.kelas,
        jamKe: sch.jam,
        status,
        keterangan: ket,
        waktuInput: `${dateStr} 07:15:00`,
      });
    });
  }

  return records;
}
