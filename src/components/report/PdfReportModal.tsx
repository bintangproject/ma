import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { AttendanceRecord, InstitutionConfig, FilterState } from '../../types/attendance';
import { MadarLogo } from '../common/MadarLogo';
import { 
  formatIndonesianDate, 
  formatIndonesianShortDate, 
  calculateSummary, 
  calculateTeacherSummaries,
  STATUS_CONFIG 
} from '../../utils/formatters';
import { Printer } from 'lucide-react';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  config: InstitutionConfig;
  filterState: FilterState;
  onChangeFilterState: (newFilter: FilterState) => void;
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  records,
  config,
  filterState,
  onChangeFilterState,
}) => {
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Filter records within the modal's date range
  const currentRecords = records.filter(r => {
    return r.tanggal >= filterState.startDate && r.tanggal <= filterState.endDate;
  });

  const stats = calculateSummary(currentRecords);
  const teacherSummaries = calculateTeacherSummaries(currentRecords);

  const handlePrint = () => {
    window.print();
  };

  const periodeText = filterState.startDate === filterState.endDate
    ? formatIndonesianDate(filterState.startDate)
    : `${formatIndonesianDate(filterState.startDate, false)} s.d. ${formatIndonesianDate(filterState.endDate)}`;

  const todayStr = formatIndonesianDate(new Date().toISOString().split('T')[0]);

  const lembagaName = config.NAMA_LEMBAGA || 'MADRASAH ALIYAH DARUL LUGHAH WAL KAROMAH';
  const kotaName = config.KOTA || 'Kraksaan';
  const kepalaName = config.NAMA_KEPALA || 'Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd.';
  const staffName = config.NAMA_STAFF || 'Ust. M. Fathur Rozak, S.Pd.';
  const staffJabatan = config.JABATAN_STAFF || 'Waka Kurikulum';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cetak & Ekspor Laporan Resmi (PDF)"
      subtitle="Dokumen administrasi kurikulum madrasah siap cetak atau simpan PDF"
      icon={<Printer size={20} />}
      maxWidth="5xl"
    >
      <div className="space-y-4">
        
        {/* Configuration Bar */}
        <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          
          {/* Format Model */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Model Laporan:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setReportType('summary')}
                className={`px-3 py-1 font-semibold rounded-md transition-all ${
                  reportType === 'summary'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rekap Akumulasi Per Guru
              </button>
              <button
                type="button"
                onClick={() => setReportType('detailed')}
                className={`px-3 py-1 font-semibold rounded-md transition-all ${
                  reportType === 'detailed'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Log Jurnal Rinci
              </button>
            </div>
          </div>

          {/* Quick Dates */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Atur Tanggal:</span>
            <input
              type="date"
              value={filterState.startDate}
              onChange={(e) => onChangeFilterState({ ...filterState, preset: 'custom', startDate: e.target.value })}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={filterState.endDate}
              onChange={(e) => onChangeFilterState({ ...filterState, preset: 'custom', endDate: e.target.value })}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
            />
          </div>

          {/* Cetak Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-white bg-sky-700 hover:bg-sky-800 active:bg-sky-900 rounded-lg shadow-sm transition-all"
          >
            <Printer size={15} />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>

        {/* Print Preview Container */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-100 p-3 sm:p-6 max-h-[65vh] overflow-y-auto">
          
          <div 
            id="official-print-document" 
            ref={printAreaRef}
            className="bg-white p-6 sm:p-10 rounded-sm shadow-md mx-auto max-w-4xl text-slate-900 text-xs font-sans print:p-0 print:shadow-none print:max-w-none"
          >
            {/* KOP SURAT RESMI MADRASAH */}
            <div className="border-b-[3px] border-double border-slate-900 pb-3 mb-5">
              <div className="flex items-center justify-between gap-4">
                {/* Logo Kiri */}
                <div className="w-20 flex-shrink-0 flex justify-center">
                  <MadarLogo size="lg" />
                </div>

                {/* Kop Teks Tengah */}
                <div className="flex-1 text-center leading-snug">
                  <h4 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-800 uppercase">
                    YAYASAN PONDOK PESANTREN DARUL LUGHAH WAL KAROMAH
                  </h4>
                  <h2 className="text-base sm:text-xl font-extrabold text-sky-950 tracking-tight uppercase my-0.5">
                    {lembagaName}
                  </h2>
                  <p className="text-[11px] text-slate-700 font-medium">
                    NSM: 131235130045 • NPSN: 20584412 • Terakreditasi "A" (Unggul)
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Jl. Raya Sidopekso No. 01, {kotaName}, Probolinggo, Jawa Timur
                  </p>
                </div>

                <div className="w-20 flex-shrink-0 hidden sm:flex flex-col items-center justify-center opacity-85">
                  <div className="w-16 h-16 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-center font-bold text-slate-700 p-1 bg-slate-50">
                    KEMENAG RI
                  </div>
                </div>
              </div>
            </div>

            {/* JUDUL LAPORAN */}
            <div className="text-center my-4">
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 underline decoration-slate-900 decoration-1 underline-offset-4">
                LAPORAN REKAPITULASI KEHADIRAN PENGAJAR (KBM)
              </h3>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                PERIODE: {periodeText.toUpperCase()}
              </p>
            </div>

            {/* RINGKASAN METRIK */}
            <div className="my-4 bg-slate-50 border border-slate-300 p-2.5 rounded text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-500 block">Total Sesi KBM:</span>
                <strong className="text-slate-800">{stats.total} Sesi</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tingkat Kehadiran:</span>
                <strong className="text-emerald-700">{stats.persentase}% ({stats.hadirEfektif} Sesi)</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Izin / Sakit / Alpa:</span>
                <strong className="text-slate-800">{stats.izin} I / {stats.sakit} S / {stats.alpa} A</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tugas Dinas:</span>
                <strong className="text-indigo-700">{stats.tugasDinas} TD</strong>
              </div>
            </div>

            {/* TABEL SESUAI PILIHAN MODEL */}
            {reportType === 'summary' ? (
              // TABEL 1: REKAP PER PENGAJAR (Bulanan)
              <div className="my-4 overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-800 text-[10px] sm:text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold text-center border-b border-slate-800">
                      <th className="border border-slate-800 py-1.5 px-2 w-8">No</th>
                      <th className="border border-slate-800 py-1.5 px-2 text-left">Nama Pengajar</th>
                      <th className="border border-slate-800 py-1.5 px-1.5 w-12">Total Sesi</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-8">H</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-8">I</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-8">S</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-8">A</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-8">TD</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-14">% Hadir</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-20">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherSummaries.map((ts, idx) => (
                      <tr key={ts.nama} className="border-b border-slate-300">
                        <td className="border border-slate-800 py-1 px-1.5 text-center font-medium">{idx + 1}</td>
                        <td className="border border-slate-800 py-1 px-2 font-semibold">
                          {ts.nama}
                        </td>
                        <td className="border border-slate-800 py-1 px-1.5 text-center font-bold">{ts.totalSesi}</td>
                        <td className="border border-slate-800 py-1 px-1 text-center font-semibold">{ts.hadir}</td>
                        <td className="border border-slate-800 py-1 px-1 text-center">{ts.izin || '-'}</td>
                        <td className="border border-slate-800 py-1 px-1 text-center">{ts.sakit || '-'}</td>
                        <td className="border border-slate-800 py-1 px-1 text-center font-bold text-rose-700">{ts.alpa || '-'}</td>
                        <td className="border border-slate-800 py-1 px-1 text-center">{ts.tugasDinas || '-'}</td>
                        <td className="border border-slate-800 py-1 px-1.5 text-center font-bold">
                          {ts.persentaseKehadiran}%
                        </td>
                        <td className="border border-slate-800 py-1 px-2 text-center text-[10px]">
                          {ts.alpa > 0 ? 'Perlu Klarifikasi' : ts.persentaseKehadiran >= 90 ? 'Disiplin' : 'Cukup'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // TABEL 2: LOG HARIAN / RINCI
              <div className="my-4 overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-800 text-[10px] sm:text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold text-center border-b border-slate-800">
                      <th className="border border-slate-800 py-1.5 px-1.5 w-8">No</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-20">Tanggal</th>
                      <th className="border border-slate-800 py-1.5 px-2 text-left">Nama Pengajar</th>
                      <th className="border border-slate-800 py-1.5 px-2 text-left">Mata Pelajaran</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-20">Kelas</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-14">Jam</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-16">Status</th>
                      <th className="border border-slate-800 py-1.5 px-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((r, idx) => (
                      <tr key={r.id} className="border-b border-slate-300">
                        <td className="border border-slate-800 py-1 px-1 text-center">{idx + 1}</td>
                        <td className="border border-slate-800 py-1 px-2 text-center whitespace-nowrap">{formatIndonesianShortDate(r.tanggal)}</td>
                        <td className="border border-slate-800 py-1 px-2 font-semibold">{r.namaGuru}</td>
                        <td className="border border-slate-800 py-1 px-2">{r.mataPelajaran}</td>
                        <td className="border border-slate-800 py-1 px-2 text-center">{r.kelas}</td>
                        <td className="border border-slate-800 py-1 px-2 text-center font-bold">Jam {r.jam}</td>
                        <td className="border border-slate-800 py-1 px-2 text-center font-bold">
                          {STATUS_CONFIG[r.status]?.label || r.status}
                        </td>
                        <td className="border border-slate-800 py-1 px-2 text-slate-600">{r.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TANDA TANGAN RESMI */}
            <div className="mt-8 pt-4 break-inside-avoid text-xs">
              <div className="flex justify-between items-start">
                
                {/* Waka / Staff Kurikulum */}
                <div className="text-center w-64">
                  <p className="text-slate-600 mb-1">Mengetahui,</p>
                  <p className="font-bold text-slate-900">{staffJabatan}</p>
                  <div className="h-20" />
                  <p className="font-bold text-slate-900 underline underline-offset-2">
                    {staffName}
                  </p>
                </div>

                {/* Kepala Madrasah */}
                <div className="text-center w-64">
                  <p className="text-slate-600 mb-1">
                    {kotaName}, {todayStr}
                  </p>
                  <p className="font-bold text-slate-900">Kepala Madrasah Aliyah</p>
                  <div className="h-20" />
                  <p className="font-bold text-slate-900 underline underline-offset-2">
                    {kepalaName}
                  </p>
                </div>

              </div>
            </div>

            {/* Footer Cetak */}
            <div className="mt-6 pt-2 border-t border-slate-200 text-[9px] text-slate-400 flex justify-between items-center">
              <span>{config.NAMA_APLIKASI || 'SIMPRES KURIKULUM'} • {lembagaName} {kotaName}</span>
              <span>Dicetak secara otomatis pada: {new Date().toLocaleString('id-ID')}</span>
            </div>

          </div>

        </div>

      </div>
    </Modal>
  );
};
