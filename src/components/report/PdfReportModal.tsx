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
import { Printer, Download, RefreshCw, FileText } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Filter records within the modal's date range
  const currentRecords = records.filter(r => {
    return r.tanggal >= filterState.startDate && r.tanggal <= filterState.endDate;
  });

  const stats = calculateSummary(currentRecords);
  const teacherSummaries = calculateTeacherSummaries(currentRecords);

  const periodeText = filterState.startDate === filterState.endDate
    ? formatIndonesianDate(filterState.startDate)
    : `${formatIndonesianDate(filterState.startDate, false)} s.d. ${formatIndonesianDate(filterState.endDate)}`;

  const todayStr = formatIndonesianDate(new Date().toISOString().split('T')[0]);

  const lembagaName = config.NAMA_LEMBAGA || 'MADRASAH ALIYAH DARUL LUGHAH WAL KAROMAH';
  const yayasanName = config.NAMA_YAYASAN || 'YAYASAN PONDOK PESANTREN DARUL LUGHAH WAL KAROMAH';
  const kotaName = config.KOTA || 'Kraksaan';
  const alamatName = config.ALAMAT_LEMBAGA || `Jl. Raya Sidopekso No. 01, ${kotaName}, Probolinggo, Jawa Timur`;
  const identitasName = config.IDENTITAS_LEMBAGA || 'NSM: 131235130045 • NPSN: 20584412 • Terakreditasi "A" (Unggul)';
  const judulLaporan = config.JUDUL_LAPORAN_PDF || 'LAPORAN REKAPITULASI KEHADIRAN PENGAJAR (KBM)';
  
  const kepalaName = config.NAMA_KEPALA || 'Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd.';
  const kepalaJabatan = config.JABATAN_KEPALA || 'Kepala Madrasah Aliyah';
  const staffName = config.NAMA_STAFF || 'Ust. Edi Amin, M.Hum.';
  const staffJabatan = config.JABATAN_STAFF || 'Waka Kurikulum';

  const logoSirama = config.LOGO_SIRAMA_URL || APP_CONFIG.DEFAULT_LOGO_SIRAMA_URL;
  const logoMadrasah = config.LOGO_URL || APP_CONFIG.DEFAULT_LOGO_URL;

  // 1. Ekspor langsung ke file PDF (.pdf) menggunakan html2canvas & jsPDF agar 100% presisi sesuai preview
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsExportingPdf(true);

    try {
      const el = printAreaRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Laporan_SIRAMA_${filterState.startDate}_sd_${filterState.endDate}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback
      handlePrint();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 2. Dialog Cetak Browser menggunakan Iframe Terisolasi (mencegah terpotong oleh scrolling modal)
  const handlePrint = () => {
    if (!printAreaRef.current) {
      window.print();
      return;
    }

    const content = printAreaRef.current.innerHTML;
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${judulLaporan} - ${config.NAMA_APLIKASI || 'SIRAMA'}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 15mm 15mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              font-size: 11px;
              line-height: 1.35;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #1e293b !important;
              padding: 4px 6px;
            }
            th {
              background-color: #f1f5f9 !important;
              font-weight: bold;
              text-align: center;
            }
            tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .break-inside-avoid {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 800px; margin: 0 auto;">
            ${content}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch {
        window.print();
      } finally {
        setTimeout(() => {
          document.body.removeChild(printIframe);
        }, 1500);
      }
    }, 600);
  };

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

          {/* Action Buttons: Download PDF & Print */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition-all"
              title="Download dokumen langsung sebagai file PDF dengan gambar & header lengkap"
            >
              {isExportingPdf ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Unduh File PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-white bg-sky-700 hover:bg-sky-800 active:bg-sky-900 rounded-lg shadow-sm transition-all"
              title="Cetak via browser atau simpan PDF standar"
            >
              <Printer size={14} />
              <span>Cetak / Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* Print Preview Container */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-100 p-3 sm:p-6 max-h-[65vh] overflow-y-auto">
          
          <div 
            id="official-print-document" 
            ref={printAreaRef}
            className="bg-white p-6 sm:p-10 rounded-sm shadow-md mx-auto max-w-4xl text-slate-900 text-xs font-sans print:p-0 print:shadow-none print:max-w-none"
          >
            {/* KOP SURAT RESMI MADRASAH (Logo Kiri SIRAMA, Logo Kanan Madrasah) */}
            <div className="border-b-[3px] border-double border-slate-900 pb-3 mb-5">
              <div className="flex items-center justify-between gap-4">
                {/* Logo Kiri: Logo Aplikasi SIRAMA */}
                <div className="w-20 flex-shrink-0 flex justify-center items-center">
                  <MadarLogo size="lg" logoUrl={logoSirama} />
                </div>

                {/* Kop Teks Tengah */}
                <div className="flex-1 text-center leading-snug px-2">
                  <h4 className="text-xs sm:text-sm font-semibold tracking-wider text-slate-800 uppercase">
                    {yayasanName}
                  </h4>
                  <h2 className="text-base sm:text-xl font-extrabold text-sky-950 tracking-tight uppercase my-0.5">
                    {lembagaName}
                  </h2>
                  <p className="text-[11px] text-slate-700 font-medium">
                    {identitasName}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {alamatName}
                  </p>
                </div>

                {/* Logo Kanan: Logo Resmi Madrasah (Menggantikan Kemenag) */}
                <div className="w-20 flex-shrink-0 flex justify-center items-center">
                  <MadarLogo size="lg" logoUrl={logoMadrasah} />
                </div>
              </div>
            </div>

            {/* JUDUL LAPORAN */}
            <div className="text-center my-4">
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 underline decoration-slate-900 decoration-1 underline-offset-4">
                {judulLaporan}
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
                      <th className="border border-slate-800 py-1.5 px-2 w-24">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherSummaries.map((ts, idx) => {
                      const sangatBaik = config.PERSEN_SANGAT_BAIK ?? 90;
                      const baik = config.PERSEN_BAIK ?? 80;
                      const predikat = ts.alpa > 0 
                        ? (config.LABEL_KURANG || 'Perlu Pembinaan') 
                        : ts.persentaseKehadiran >= sangatBaik 
                        ? (config.LABEL_SANGAT_BAIK || 'Sangat Baik') 
                        : ts.persentaseKehadiran >= baik 
                        ? (config.LABEL_BAIK || 'Baik') 
                        : (config.LABEL_CUKUP || 'Cukup');

                      return (
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
                          <td className="border border-slate-800 py-1 px-2 text-center text-[10px] font-medium">
                            {predikat}
                          </td>
                        </tr>
                      );
                    })}
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
                  <p className="font-bold text-slate-900">{kepalaJabatan}</p>
                  <div className="h-20" />
                  <p className="font-bold text-slate-900 underline underline-offset-2">
                    {kepalaName}
                  </p>
                </div>

              </div>
            </div>

            {/* Footer Cetak */}
            <div className="mt-6 pt-2 border-t border-slate-200 text-[9px] text-slate-400 flex justify-between items-center">
              <span>{config.NAMA_APLIKASI || 'SIRAMA'} • {lembagaName} {kotaName}</span>
              <span>Dicetak secara otomatis pada: {new Date().toLocaleString('id-ID')}</span>
            </div>

          </div>

        </div>

      </div>
    </Modal>
  );
};
