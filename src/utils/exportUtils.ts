import { AttendanceRecord, InstitutionConfig, FilterState, GuruPiketRecord, ApelAttendanceRecord, DayScheduleMap } from '../types/attendance';
import { formatIndonesianDate, calculateSummary, STATUS_CONFIG, getPerformanceCategory } from './formatters';

export function exportToCsv(records: AttendanceRecord[], config: InstitutionConfig, filename = 'rekap_kehadiran_guru.csv') {
  const headers = [
    'No',
    'Tanggal',
    'Hari',
    'Kelas',
    'Jam Ke',
    'Mata Pelajaran',
    'Guru Pengampu',
    'Status Kehadiran',
    'Keterangan',
    'Waktu Catat',
  ];

  const rows = records.map((r, index) => [
    (index + 1).toString(),
    r.tanggal,
    r.hari || '-',
    `"${(r.kelas || '').replace(/"/g, '""')}"`,
    `"${r.jam}"`,
    `"${(r.mataPelajaran || '').replace(/"/g, '""')}"`,
    `"${(r.namaGuru || '').replace(/"/g, '""')}"`,
    STATUS_CONFIG[r.status]?.label || r.status,
    `"${(r.keterangan || '').replace(/"/g, '""')}"`,
    `"${r.waktuInput || '-'}"`,
  ]);

  const institutionName = config.NAMA_LEMBAGA || config.SINGKATAN || 'MADRASAH ALIYAH DARUL LUGHAH WAL KAROMAH';
  const csvContent = [
    `# REKAP KEHADIRAN PENGAJAR - ${institutionName}`,
    `# Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format Pesan WhatsApp Rekapitulasi Presensi KBM Guru (Eye-Catching & Rapi)
 */
export function generateWhatsAppMessage(
  records: AttendanceRecord[],
  config: InstitutionConfig,
  filterState: FilterState,
  piketToday?: GuruPiketRecord | null
): string {
  const stats = calculateSummary(records);
  let periodeText = '';

  if (filterState.startDate === filterState.endDate) {
    periodeText = formatIndonesianDate(filterState.startDate);
  } else {
    periodeText = `${formatIndonesianDate(filterState.startDate, false)} s.d. ${formatIndonesianDate(filterState.endDate)}`;
  }

  const category = getPerformanceCategory(stats.persentase, {
    sangatBaik: config.PERSEN_SANGAT_BAIK,
    baik: config.PERSEN_BAIK,
    cukup: config.PERSEN_CUKUP,
  });

  const nonHadir = records.filter(r => r.status !== 'HADIR');
  const institutionName = (config.SINGKATAN || config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();
  const city = (config.KOTA || 'KRAKSAAN').toUpperCase();

  let text = `🏛️ *LAPORAN REKAPITULASI PRESENSI PENGAJAR*\n`;
  text += `🏫 *${institutionName} - ${city}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📅 *Periode:* ${periodeText}\n`;
  text += `⏰ *Waktu Rilis:* ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB\n\n`;

  text += `📊 *STATISTIK RINGKAS KBM:*\n`;
  text += `• Total Sesi KBM     : *${stats.total} sesi*\n`;
  text += `• Tingkat Kehadiran  : *${stats.persentase}%* [${category.label}]\n`;
  text += `• Hadir di Kelas     : ${stats.hadir} sesi\n`;
  if (stats.tugasDinas > 0) text += `• Tugas Dinas        : ${stats.tugasDinas} sesi\n`;
  if (stats.izin > 0) text += `• Izin Resmi         : ${stats.izin} sesi\n`;
  if (stats.sakit > 0) text += `• Sakit              : ${stats.sakit} sesi\n`;
  if (stats.alpa > 0) text += `• Alpa / Tanpa Ket   : ${stats.alpa} sesi\n`;

  // Sisipkan Guru Piket jika ada
  if (piketToday && (piketToday.piket1 || piketToday.piket2 || piketToday.piket3 || piketToday.piket4)) {
    text += `\n🛡️ *GURU PIKET HARI INI:*\n`;
    const piketItems = [piketToday.piket1, piketToday.piket2, piketToday.piket3, piketToday.piket4].filter(Boolean);
    piketItems.forEach((p, idx) => {
      text += `${idx + 1}. ${p}\n`;
    });
    if (piketToday.keterangan) {
      text += `   _(Catatan: ${piketToday.keterangan})_\n`;
    }
  }

  // Rincian Guru Berhalangan
  if (nonHadir.length > 0) {
    text += `\n⚠️ *RINCIAN GURU BERHALANGAN / PENUGASAN (${nonHadir.length} sesi):*\n`;
    nonHadir.slice(0, 25).forEach((item, idx) => {
      const statusLabel = STATUS_CONFIG[item.status]?.label || item.status;
      const statusEmoji = item.status === 'SAKIT' ? '🏥' : item.status === 'IZIN' ? '✉️' : item.status === 'TUGAS_DINAS' ? '💼' : '❌';
      text += `${idx + 1}. ${statusEmoji} *${item.namaGuru}* [${statusLabel}]\n`;
      text += `   ↳ Kelas: ${item.kelas} | Jam ke-${item.jam} | ${item.mataPelajaran}\n`;
      if (item.keterangan) {
        text += `   ↳ Keterangan: _${item.keterangan}_\n`;
      }
    });
    if (nonHadir.length > 25) {
      text += `   _...dan ${nonHadir.length - 25} sesi berhalangan lainnya._\n`;
    }
  } else {
    text += `\n✨ *Alhamdulillah, seluruh pengajar hadir 100% tepat waktu.* Jazakumullah khairan katsiran atas kedisiplinan dan dedikasi segenap dewan guru.\n`;
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `✍️ *Tertanda:*\n`;
  text += `Waka Kurikulum : *${config.NAMA_STAFF || 'Ust. Edi Amin, M.Hum.'}*\n`;
  text += `Kepala Madrasah: *${config.NAMA_KEPALA || 'Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd.'}*`;

  return text;
}

/**
 * Format Pesan WhatsApp Jadwal Harian KBM (Item 9)
 */
export function generateWhatsAppDailyScheduleMessage(
  hari: string,
  tanggalStr: string,
  schedules: DayScheduleMap,
  config: InstitutionConfig,
  piketToday?: GuruPiketRecord | null
): string {
  const daySchedule = schedules[hari] || [];
  const institutionName = (config.SINGKATAN || config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();

  let text = `📚 *JADWAL KBM PENGAJAR ${institutionName}*\n`;
  text += `🗓️ *Hari ${hari}, ${formatIndonesianDate(tanggalStr, false)}*\n`;

  // Sisipkan Guru Piket jika ada (mendukung berapapun jumlah petugas: 4, 5, 6 atau lebih)
  const piketItems: string[] = [];
  if (piketToday) {
    if (Array.isArray(piketToday.petugasList) && piketToday.petugasList.length > 0) {
      piketToday.petugasList.forEach(p => {
        if (p.nama) piketItems.push(p.nama);
      });
    } else {
      let pIdx = 1;
      while ((piketToday as any)[`piket${pIdx}`]) {
        const val = (piketToday as any)[`piket${pIdx}`];
        if (val) piketItems.push(val);
        pIdx++;
      }
    }
  }

  if (piketItems.length > 0) {
    text += `\n🛡️ *GURU PIKET HARI INI (${piketItems.length} Petugas):*\n`;
    piketItems.forEach((p, idx) => {
      text += `${idx + 1}. ${p}\n`;
    });
    if (piketToday?.keterangan) {
      text += `   _(Catatan: ${piketToday.keterangan})_\n`;
    }
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (daySchedule.length === 0) {
    text += `_Tidak ada jadwal KBM yang terdaftar untuk hari ${hari}._\n`;
  } else {
    // Group by Kelas
    const byClass: Record<string, typeof daySchedule> = {};
    daySchedule.forEach(item => {
      const cls = item.kelas || 'Umum';
      if (!byClass[cls]) byClass[cls] = [];
      byClass[cls].push(item);
    });

    // Sort items by Jam inside each class
    Object.keys(byClass).forEach(cls => {
      byClass[cls].sort((a, b) => Number(a.jam) - Number(b.jam));
      text += `🏫 *KELAS ${cls}*\n`;
      byClass[cls].forEach(s => {
        text += `${s.jam}. ${s.guruPengampu} — _${s.mataPelajaran}_\n`;
      });
      text += `\n`;
    });
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Diharap kepada segenap pengajar untuk hadir tepat waktu. Semoga KBM hari ini lancar dan berkah. Amiin._\n`;
  text += `_Waka Kurikulum: ${config.NAMA_STAFF || 'Ust. Edi Amin, M.Hum.'}_`;

  return text;
}

/**
 * Format Pesan WhatsApp Rekapitulasi Apel Pagi (Item 8 & 10)
 * Mencantumkan daftar Hadir, Izin, Sakit, dan Alpa secara lengkap tanpa opsi telat atau rincian jam kelas
 */
export function generateWhatsAppApelMessage(
  tanggalStr: string,
  hariStr: string,
  records: ApelAttendanceRecord[],
  config: InstitutionConfig
): string {
  const institutionName = (config.SINGKATAN || config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();

  let text = `🎖️ *LAPORAN PRESENSI APEL PAGI PIMPINAN, KARYAWAN, DAN DEWAN GURU*\n`;
  text += `🏫 *${institutionName}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📅 *Hari/Tanggal:* ${hariStr}, ${formatIndonesianDate(tanggalStr, false)}\n`;
  const apelTime = (hariStr || '').toLowerCase().includes('ahad') ? 'Pukul 08.20 - 08.30 WIB' : 'Pukul 09.20 - 09.30 WIB';
  text += `⏰ *Pelaksanaan:* ${apelTime}\n\n`;

  // Pimpinan dan Dewan Guru Categorization
  const pimpinan = records.filter(r => r.kategori === 'STRUKTURAL').sort((a,b) => a.nama.localeCompare(b.nama));
  const dewanGuru = records.filter(r => r.kategori !== 'STRUKTURAL').sort((a,b) => a.nama.localeCompare(b.nama));

  // Helper to format row
  const formatRow = (r: ApelAttendanceRecord, idx: number) => {
    // Mapping: Hadir -> ✅, Izin -> ℹ️, Sakit -> 🏥, Alpa -> ❌
    let statusIcon = '❌';
    if (r.status === 'HADIR') statusIcon = '✅';
    else if (r.status === 'IZIN') statusIcon = 'ℹ️';
    else if (r.status === 'SAKIT') statusIcon = '🏥';
    
    return `${idx + 1}. ${r.nama} ${statusIcon}`;
  };

  text += `👤 *Pimpinan dan Karyawan :*\n`;
  pimpinan.forEach((r, i) => {
    text += `${formatRow(r, i)}\n`;
  });

  text += `\n👨‍🏫 *Dewan Guru :*\n`;
  dewanGuru.forEach((r, i) => {
    text += `${formatRow(r, i)}\n`;
  });

  return text;
}
