import { AttendanceRecord, AttendanceStatus, TeacherSummary } from '../types/attendance';

export const STATUS_CONFIG: Record<AttendanceStatus, {
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}> = {
  HADIR: {
    label: 'Hadir',
    shortLabel: 'H',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-300',
  },
  SAKIT: {
    label: 'Sakit',
    shortLabel: 'S',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'text-amber-700',
    borderColor: 'border-amber-300',
  },
  IZIN: {
    label: 'Izin',
    shortLabel: 'I',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
  ALPA: {
    label: 'Alpa / Tanpa Ket.',
    shortLabel: 'A',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-700',
    borderColor: 'border-rose-300',
  },
  TUGAS_DINAS: {
    label: 'Tugas Dinas',
    shortLabel: 'TD',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'text-indigo-700',
    borderColor: 'border-indigo-300',
  },
};

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const NAMA_HARI_MADRASAH = [
  'Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function getIndonesianDayName(dateString: string): string {
  if (!dateString) return 'Sabtu';
  const parts = dateString.split('-');
  if (parts.length !== 3) return 'Sabtu';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return NAMA_HARI_MADRASAH[date.getDay()] || 'Sabtu';
}

export function formatIndonesianDate(dateString: string, includeDay = true): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  const dayName = NAMA_HARI_MADRASAH[date.getDay()];
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

  records.forEach((r) => {
    switch (r.status) {
      case 'HADIR': hadir++; break;
      case 'SAKIT': sakit++; break;
      case 'IZIN': izin++; break;
      case 'ALPA': alpa++; break;
      case 'TUGAS_DINAS': tugasDinas++; break;
    }
  });

  // Effective presence: HADIR + TUGAS_DINAS
  const hadirEfektif = hadir + tugasDinas;
  const persentase = total > 0 ? Math.round((hadirEfektif / total) * 100) : 0;

  return {
    total,
    hadir,
    sakit,
    izin,
    alpa,
    tugasDinas,
    hadirEfektif,
    persentase,
  };
}

export function calculateTeacherSummaries(records: AttendanceRecord[]): TeacherSummary[] {
  const map = new Map<string, TeacherSummary>();

  records.forEach((r) => {
    const key = r.namaGuru || 'Tanpa Nama';
    if (!map.has(key)) {
      map.set(key, {
        nama: key,
        kodeGuru: r.kodeGuru || '',
        mataPelajaran: r.mataPelajaran || '-',
        totalSesi: 0,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpa: 0,
        tugasDinas: 0,
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
  });

  const list = Array.from(map.values());
  list.forEach((item) => {
    const effective = item.hadir + item.tugasDinas;
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

/**
 * Rentang mingguan madrasah (Sabtu s.d. Kamis)
 */
export function getMadarWeeklyRange(referenceDate: Date = new Date()): { startDate: string; endDate: string } {
  const d = referenceDate.getDay(); // 0: Ahad, 1: Senin, ..., 5: Jumat, 6: Sabtu
  const offsetToSabtu = (d === 6) ? 0 : -(d + 1);

  const sabtu = new Date(referenceDate);
  sabtu.setDate(referenceDate.getDate() + offsetToSabtu);

  const kamis = new Date(sabtu);
  kamis.setDate(sabtu.getDate() + 5);

  const formatISO = (dt: Date) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    startDate: formatISO(sabtu),
    endDate: formatISO(kamis),
  };
}

/**
 * Rentang bulanan madrasah: tgl 26 bulan sebelumnya s.d. 25 bulan ini
 * (atau 26 bulan ini s.d. 25 bulan depan jika hari ini lewat tanggal 25)
 */
export function getMadarMonthlyRange(referenceDate: Date = new Date()): { startDate: string; endDate: string } {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-indexed
  const date = referenceDate.getDate();

  let startYear = year;
  let startMonth = month - 1;
  let endYear = year;
  let endMonth = month;

  if (date > 25) {
    startYear = year;
    startMonth = month;
    endMonth = month + 1;
    if (endMonth > 11) {
      endYear = year + 1;
      endMonth = 0;
    }
  } else if (startMonth < 0) {
    startYear = year - 1;
    startMonth = 11;
  }

  const startDate = new Date(startYear, startMonth, 26);
  const endDate = new Date(endYear, endMonth, 25);

  const formatISO = (dt: Date) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    startDate: formatISO(startDate),
    endDate: formatISO(endDate),
  };
}

/**
 * Menentukan predikat performa berdasarkan persentase kehadiran dan ambang batas konfigurasi
 */
export function getPerformanceCategory(
  persentase: number,
  thresholds?: { sangatBaik?: number; baik?: number; cukup?: number }
): {
  label: string;
  badgeClass: string;
  dotColor: string;
} {
  const tSangatBaik = thresholds?.sangatBaik ?? 90;
  const tBaik = thresholds?.baik ?? 75;
  const tCukup = thresholds?.cukup ?? 60;

  if (persentase >= tSangatBaik) {
    return {
      label: 'Sangat Baik / Teladan',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dotColor: 'bg-emerald-500',
    };
  }
  if (persentase >= tBaik) {
    return {
      label: 'Baik / Disiplin',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      dotColor: 'bg-sky-500',
    };
  }
  if (persentase >= tCukup) {
    return {
      label: 'Cukup',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      dotColor: 'bg-amber-500',
    };
  }
  return {
    label: 'Perlu Perhatian',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    dotColor: 'bg-rose-500',
  };
}
