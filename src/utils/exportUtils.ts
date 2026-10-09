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
  text += `Kepala Madrasah: *${config.NAMA_KEPALA || 'Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd.'}*\n\n`;
  text += `_Dikelola melalui SIRAMA (Sistem Informasi Rekap & Absensi Pengajar Madrasah)_`;

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
  const total = records.length;
  const hadirList = records.filter(r => r.status === 'HADIR');
  const izinList = records.filter(r => r.status === 'IZIN');
  const sakitList = records.filter(r => r.status === 'SAKIT');
  const alpaList = records.filter(r => r.status === 'ALPA');

  const institutionName = (config.SINGKATAN || config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();

  let text = `🎖️ *LAPORAN PRESENSI APEL PAGI PENGAJAR*\n`;
  text += `🏫 *${institutionName}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📅 *Hari/Tanggal:* ${hariStr}, ${formatIndonesianDate(tanggalStr, false)}\n`;
  const apelTime = (hariStr || '').toLowerCase().includes('ahad') ? 'Pukul 08.20 - 08.30 WIB' : 'Pukul 09.20 - 09.30 WIB';
  text += `⏰ *Pelaksanaan:* ${apelTime}\n\n`;

  text += `📊 *RINGKASAN KEHADIRAN APEL:*\n`;
  text += `• Total Wajib Apel : *${total} orang*\n`;
  text += `• Hadir            : *${hadirList.length} orang*\n`;
  if (izinList.length > 0) text += `• Izin             : *${izinList.length} orang*\n`;
  if (sakitList.length > 0) text += `• Sakit            : *${sakitList.length} orang*\n`;
  if (alpaList.length > 0) text += `• Alpa / Tanpa Ket : *${alpaList.length} orang*\n`;

  // 1. DAFTAR HADIR
  text += `\n✅ *DAFTAR HADIR APEL (${hadirList.length} Orang):*\n`;
  if (hadirList.length === 0) {
    text += `_Tidak ada_\n`;
  } else {
    hadirList.forEach((r, i) => {
      text += `${i + 1}. *${r.nama}* (${r.jabatanAtauJadwal})\n`;
    });
  }

  // 2. DAFTAR IZIN
  if (izinList.length > 0) {
    text += `\n✉️ *DAFTAR IZIN (${izinList.length} Orang):*\n`;
    izinList.forEach((r, i) => {
      text += `${i + 1}. *${r.nama}* (${r.jabatanAtauJadwal})${r.keterangan ? ` — _${r.keterangan}_` : ''}\n`;
    });
  }

  // 3. DAFTAR SAKIT
  if (sakitList.length > 0) {
    text += `\n🏥 *DAFTAR SAKIT (${sakitList.length} Orang):*\n`;
    sakitList.forEach((r, i) => {
      text += `${i + 1}. *${r.nama}* (${r.jabatanAtauJadwal})${r.keterangan ? ` — _${r.keterangan}_` : ''}\n`;
    });
  }

  // 4. DAFTAR ALPA
  if (alpaList.length > 0) {
    text += `\n❌ *DAFTAR ALPA / TANPA KETERANGAN (${alpaList.length} Orang):*\n`;
    alpaList.forEach((r, i) => {
      text += `${i + 1}. *${r.nama}* (${r.jabatanAtauJadwal})${r.keterangan ? ` — _${r.keterangan}_` : ''}\n`;
    });
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Disampaikan oleh Staff Kurikulum & Kedisiplinan Madrasah._\n`;
  text += `_SIRAMA (Sistem Informasi Rekap dan Absensi Pengajar Madrasah)_`;

  return text;
}
