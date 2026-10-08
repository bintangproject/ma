import { AttendanceRecord, InstitutionConfig, FilterState } from '../types/attendance';
import { formatIndonesianDate, calculateSummary, STATUS_CONFIG } from './formatters';

export function exportToCsv(records: AttendanceRecord[], config: InstitutionConfig, filename = 'rekap_kehadiran_guru.csv') {
  const headers = [
    'No',
    'Tanggal',
    'Nama Guru',
    'NIP/NUPTK',
    'Mata Pelajaran',
    'Kelas',
    'Jam Ke',
    'Status Kehadiran',
    'Keterangan',
    'Waktu Catat',
  ];

  const rows = records.map((r, index) => [
    (index + 1).toString(),
    r.tanggal,
    `"${r.namaGuru.replace(/"/g, '""')}"`,
    `'${r.nip || '-'}`,
    `"${r.mataPelajaran.replace(/"/g, '""')}"`,
    `"${r.kelas.replace(/"/g, '""')}"`,
    `"${r.jamKe.replace(/"/g, '""')}"`,
    STATUS_CONFIG[r.status]?.label || r.status,
    `"${(r.keterangan || '').replace(/"/g, '""')}"`,
    `"${r.waktuInput || '-'}"`,
  ]);

  const csvContent = [
    `# REKAP KEHADIRAN PENGAJAR - ${config.namaMadrasah}`,
    `# Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\r\n');

  // Add UTF-8 BOM so Excel opens accents and symbols correctly
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

export function generateWhatsAppMessage(
  records: AttendanceRecord[],
  config: InstitutionConfig,
  filterState: FilterState
): string {
  const stats = calculateSummary(records);
  let periodeText = '';

  if (filterState.startDate === filterState.endDate) {
    periodeText = formatIndonesianDate(filterState.startDate);
  } else {
    periodeText = `${formatIndonesianDate(filterState.startDate, false)} s.d. ${formatIndonesianDate(filterState.endDate)}`;
  }

  // Filter records that need attention (not HADIR)
  const nonHadir = records.filter(r => r.status !== 'HADIR');

  let text = `*LAPORAN REKAP KEHADIRAN PENGAJAR*\n`;
  text += `*${config.namaMadrasah.toUpperCase()}*\n`;
  text += `*KRAKSAAN - PROBOLINGGO*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📅 *Periode:* ${periodeText}\n`;
  text += `👥 *Total Sesi KBM:* ${stats.total} sesi\n`;
  text += `📈 *Tingkat Kehadiran:* ${stats.persentase}%\n\n`;

  text += `📊 *Ringkasan Status:*\n`;
  text += `• Hadir Tepat Waktu: ${stats.hadir} sesi\n`;
  if (stats.terlambat > 0) text += `• Terlambat: ${stats.terlambat} sesi\n`;
  if (stats.tugasDinas > 0) text += `• Tugas Dinas: ${stats.tugasDinas} sesi\n`;
  if (stats.izin > 0) text += `• Izin: ${stats.izin} sesi\n`;
  if (stats.sakit > 0) text += `• Sakit: ${stats.sakit} sesi\n`;
  if (stats.alpa > 0) text += `• Alpa / Tanpa Ket: ${stats.alpa} sesi\n`;

  if (nonHadir.length > 0) {
    text += `\n⚠️ *Daftar Guru Berhalangan / Khusus (${nonHadir.length} sesi):*\n`;
    nonHadir.slice(0, 15).forEach((item, idx) => {
      const statusLabel = STATUS_CONFIG[item.status]?.label || item.status;
      text += `${idx + 1}. *${item.namaGuru}* [${statusLabel}]\n`;
      text += `   ↳ ${item.mataPelajaran} (${item.kelas}) - ${item.keterangan || '-'}\n`;
    });
    if (nonHadir.length > 15) {
      text += `   ...dan ${nonHadir.length - 15} sesi lainnya.\n`;
    }
  } else {
    text += `\n✅ *Alhamdulillah, seluruh pengajar hadir 100%! Makasih atas dedikasi para Asatidz/Ustadzah.*\n`;
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Disampaikan oleh Staff Kurikulum MA Darul Lughah Wal Karomah._\n`;
  text += `_Sistem Informasi Presensi Pengajar (SIMPRES)_`;

  return text;
}
