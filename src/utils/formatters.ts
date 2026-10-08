import { AttendanceRecord, AttendanceStatus, TeacherSummary } from '../types/attendance';

export const STATUS_CONFIG: Record<AttendanceStatus, {
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  icon: string;
}> = {
  HADIR: {
    label: 'Hadir',
    shortLabel: 'H',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    icon: 'CheckCircle2',
  },
  SAKIT: {
    label: 'Sakit',
    shortLabel: 'S',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-300',
    icon: 'Stethoscope',
  },
  IZIN: {
    label: 'Izin',
    shortLabel: 'I',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-300',
    icon: 'FileText',
  },
  ALPA: {
    label: 'Alpa / Tanpa Ket.',
    shortLabel: 'A',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-700',
    borderColor: 'border-rose-300',
    icon: 'AlertCircle',
  },
  TUGAS_DINAS: {
    label: 'Tugas Dinas',
    shortLabel: 'TD',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'text-indigo-700',
    borderColor: 'border-indigo-300',
    icon: 'Briefcase',
  },
  TERLAMBAT: {
    label: 'Terlambat',
    shortLabel: 'T',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeText: 'text-orange-700',
    borderColor: 'border-orange-300',
    icon: 'Clock',
  },
};

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const NAMA_HARI = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function formatIndonesianDate(dateString: string, includeDay = true): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  const dayName = NAMA_HARI[date.getDay()];
  const monthName = NAMA_BULAN[month];

  if (includeDay) {
    return `${dayName}, ${day < 10 ? '0' + day : day} ${monthName} ${year}`;
  }
  return `${day < 10 ? '0' + day : day} ${monthName} ${year}`;
}

export function formatIndonesianShortDate(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const month = parseInt(parts[1], 10) - 1;
  const shortMonth = NAMA_BULAN[month]?.slice(0, 3) || '';
  return `${parts[2]} ${shortMonth} ${parts[0]}`;
}

export function calculateSummary(records: AttendanceRecord[]) {
  const total = records.length;
  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alpa = 0;
  let tugasDinas = 0;
  let terlambat = 0;

  records.forEach((r) => {
    switch (r.status) {
      case 'HADIR': hadir++; break;
      case 'SAKIT': sakit++; break;
      case 'IZIN': izin++; break;
      case 'ALPA': alpa++; break;
      case 'TUGAS_DINAS': tugasDinas++; break;
      case 'TERLAMBAT': terlambat++; break;
    }
  });

  // Effective presence: HADIR + TERLAMBAT + TUGAS_DINAS
  const hadirEfektif = hadir + terlambat + tugasDinas;
  const persentase = total > 0 ? Math.round((hadirEfektif / total) * 100) : 0;

  return {
    total,
    hadir,
    sakit,
    izin,
    alpa,
    tugasDinas,
    terlambat,
    hadirEfektif,
    persentase,
  };
}

export function calculateTeacherSummaries(records: AttendanceRecord[]): TeacherSummary[] {
  const map = new Map<string, TeacherSummary>();

  records.forEach((r) => {
    const key = r.namaGuru;
    if (!map.has(key)) {
      map.set(key, {
        nama: r.namaGuru,
        nip: r.nip || '-',
        mataPelajaran: r.mataPelajaran || '-',
        totalSesi: 0,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpa: 0,
        tugasDinas: 0,
        terlambat: 0,
        persentaseKehadiran: 0,
      });
    }

    const item = map.get(key)!;
    item.totalSesi += 1;
    if (r.status === 'HADIR') item.hadir += 1;
    else if (r.status === 'SAKIT') item.sakit += 1;
    else if (r.status === 'IZIN') item.izin += 1;
    else if (r.status === 'ALPA') item.alpa += 1;
    else if (r.status === 'TUGAS_DINAS') item.tugasDinas += 1;
    else if (r.status === 'TERLAMBAT') item.terlambat += 1;
  });

  const list = Array.from(map.values());
  list.forEach((item) => {
    const effective = item.hadir + item.terlambat + item.tugasDinas;
    item.persentaseKehadiran = item.totalSesi > 0 ? Math.round((effective / item.totalSesi) * 100) : 0;
  });

  // Sort by highest attendance rate, then alphabetical
  list.sort((a, b) => {
    if (b.persentaseKehadiran !== a.persentaseKehadiran) {
      return b.persentaseKehadiran - a.persentaseKehadiran;
    }
    return a.nama.localeCompare(b.nama);
  });

  return list;
}
