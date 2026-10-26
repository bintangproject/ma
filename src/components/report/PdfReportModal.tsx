import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { AttendanceRecord, InstitutionConfig, FilterState, MasterGuru } from '../../types/attendance';
import { MadarLogo, parseDirectImageUrl, getAlternateRawUrl } from '../common/MadarLogo';
import { 
  formatIndonesianDate, 
  formatIndonesianShortDate, 
  calculateSummary, 
  calculateTeacherSummaries,
  STATUS_CONFIG 
} from '../../utils/formatters';
import { Printer, Download, RefreshCw, FileText, Image as ImageIcon } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { BeritaAcaraJpgView } from './BeritaAcaraJpgView';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  config: InstitutionConfig;
  filterState: FilterState;
  onChangeFilterState: (newFilter: FilterState) => void;
  teachers?: MasterGuru[];
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  records,
  config,
  filterState,
  onChangeFilterState,
  teachers,
}) => {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'berita_acara'>('summary');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [isExportingBeritaAcaraJpg, setIsExportingBeritaAcaraJpg] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const beritaAcaraRef = useRef<HTMLDivElement>(null);

  // Filter records within the modal's date range
  const currentRecords = records.filter(r => {
    return r.tanggal >= filterState.startDate && r.tanggal <= filterState.endDate;
  });

  const stats = calculateSummary(currentRecords);
  const teacherSummaries = calculateTeacherSummaries(currentRecords);

  // Per-teacher summaries sorted alphabetically by teacher name
  const sortedTeacherSummaries = [...teacherSummaries].sort((a, b) => 
    a.nama.localeCompare(b.nama, 'id')
  );

  const totalWajibHadir = sortedTeacherSummaries.reduce((acc, t) => acc + t.totalSesi, 0);
  const totalHadir = sortedTeacherSummaries.reduce((acc, t) => acc + t.hadir, 0);
  const totalIzin = sortedTeacherSummaries.reduce((acc, t) => acc + t.izin, 0);
  const totalSakit = sortedTeacherSummaries.reduce((acc, t) => acc + t.sakit, 0);
  const totalAlpa = sortedTeacherSummaries.reduce((acc, t) => acc + t.alpa, 0);
  const totalTugasDinas = sortedTeacherSummaries.reduce((acc, t) => acc + t.tugasDinas, 0);
  const totalKehadiranEfektif = totalHadir + totalTugasDinas;
  const overallPercentage = totalWajibHadir > 0 
    ? Math.round((totalKehadiranEfektif / totalWajibHadir) * 100) 
    : 0;

  const periodeText = filterState.startDate === filterState.endDate
    ? formatIndonesianDate(filterState.startDate)
    : `${formatIndonesianDate(filterState.startDate, false)} s.d. ${formatIndonesianDate(filterState.endDate)}`;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = formatIndonesianDate(`${yyyy}-${mm}-${dd}`);

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

  const [base64Madrasah, setBase64Madrasah] = useState<string>('');
  const [base64Sirama, setBase64Sirama] = useState<string>('');

  // Pre-load gambar menjadi base64 Data URL agar html2canvas tidak pernah ter-taint (keamanan browser)
  React.useEffect(() => {
    let isMounted = true;
    const convertToBase64 = async (url: string) => {
      try {
        const direct = parseDirectImageUrl(url);
        const res = await fetch(direct, { mode: 'cors' });
        const blob = await res.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(direct);
          reader.readAsDataURL(blob);
        });
      } catch {
        return parseDirectImageUrl(url);
      }
    };

    if (logoMadrasah) {
      convertToBase64(logoMadrasah).then(b => { if (isMounted) setBase64Madrasah(b); });
    }
    if (logoSirama) {
      convertToBase64(logoSirama).then(b => { if (isMounted) setBase64Sirama(b); });
    }

    return () => { isMounted = false; };
  }, [logoMadrasah, logoSirama]);

  // Helper untuk render elemen print area ke Canvas HTML5 beresolusi tinggi tanpa terpotong scroll modal
  const renderDocumentToCanvas = async (el: HTMLElement) => {
    // Pastikan seluruh gambar selesai termuat
    const imgs = Array.from(el.querySelectorAll('img'));
    await Promise.all(
      imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => {
          img.onload = res;
          img.onerror = res;
        });
      })
    );

    return await html2canvas(el, {
      scale: 2, // 2x crisp retina resolution
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: el.scrollWidth || 1024,
    });
  };

  // 1. Ekspor Dokumen ke Format Gambar (JPG)
  const handleDownloadJpg = async () => {
    if (!printAreaRef.current) return;
    setIsExportingJpg(true);

    try {
      const canvas = await renderDocumentToCanvas(printAreaRef.current);
      
      // Metode Blob (Paling stabil & kompatibel di semua browser)
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) {
            fallbackDataUrlDownload(canvas);
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `Laporan_SIRAMA_${filterState.startDate}_s.d._${filterState.endDate}.jpg`;
          link.href = blobUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
          setIsExportingJpg(false);
        }, 'image/jpeg', 0.95);
      } else {
        fallbackDataUrlDownload(canvas);
      }
    } catch (err) {
      console.error('Error generating JPG:', err);
      // Fallback
      if (printAreaRef.current) {
        try {
          const fallbackCanvas = await html2canvas(printAreaRef.current, { scale: 1.5, useCORS: true });
          fallbackDataUrlDownload(fallbackCanvas);
        } catch {
          alert('Gagal mengekspor gambar JPG. Anda dapat menggunakan tombol Cetak / PDF Browser.');
          setIsExportingJpg(false);
        }
      } else {
        setIsExportingJpg(false);
      }
    }
  };

  const fallbackDataUrlDownload = (canvas: HTMLCanvasElement) => {
    try {
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `Laporan_SIRAMA_${filterState.startDate}_s.d._${filterState.endDate}.jpg`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Fallback DataURL failed:', e);
      alert('Gagal mengunduh gambar. Silakan gunakan tombol Cetak / PDF Browser.');
    } finally {
      setIsExportingJpg(false);
    }
  };

  const handleDownloadBeritaAcaraJpg = async () => {
    if (!beritaAcaraRef.current) return;
    setIsExportingBeritaAcaraJpg(true);

    try {
      const canvas = await renderDocumentToCanvas(beritaAcaraRef.current);
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `Berita_Acara_KBM_${filterState.startDate}_s.d._${filterState.endDate}.jpg`;
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
          }
          setIsExportingBeritaAcaraJpg(false);
        }, 'image/jpeg', 0.95);
      }
    } catch (err) {
      console.error('Error generating Berita Acara JPG:', err);
      setIsExportingBeritaAcaraJpg(false);
    }
  };

  // 2. Ekspor langsung ke file PDF (.pdf) menggunakan html2canvas & jsPDF standar Kertas F4 (Folio 210 x 330 mm)
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsExportingPdf(true);

    try {
      const canvas = await renderDocumentToCanvas(printAreaRef.current);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Standar Kertas F4 (Folio): 210 mm x 330 mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 330],
      });

      const pdfWidth = 210;
      const pdfHeight = 330;
      const margin = 8;
      const contentWidth = pdfWidth - (margin * 2); // 194 mm
      const maxTargetHeight = pdfHeight - (margin * 2); // 314 mm
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (reportType === 'summary') {
        // Rekap Per Guru diusahakan rapi dan muat pas dalam 1 lembar F4
        if (contentHeight <= maxTargetHeight) {
          pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
        } else {
          // Skalakan proporsional agar presisi dalam 1 lembar F4 tanpa terpotong
          const scale = maxTargetHeight / contentHeight;
          const scaledWidth = contentWidth * scale;
          const scaledX = margin + (contentWidth - scaledWidth) / 2;
          pdf.addImage(imgData, 'JPEG', scaledX, margin, scaledWidth, maxTargetHeight);
        }
      } else {
        // Multi-halaman F4 untuk log rinci
        if (contentHeight <= maxTargetHeight) {
          pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
        } else {
          const pageContentHeight = maxTargetHeight;
          let heightLeft = contentHeight;
          let position = margin;

          pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
          heightLeft -= pageContentHeight;

          while (heightLeft > 0) {
            pdf.addPage([210, 330], 'portrait');
            position = margin - (contentHeight - heightLeft);
            pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
            heightLeft -= pageContentHeight;
          }
        }
      }

      const filePrefix = reportType === 'summary' 
        ? 'Rekap_Kehadiran_Guru' 
        : reportType === 'detailed' 
        ? 'Log_Presensi_KBM' 
        : 'Berita_Acara_KBM';
      pdf.save(`${filePrefix}_${filterState.startDate}_sd_${filterState.endDate}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback ke cetak iframe
      handlePrint();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 3. Dialog Cetak Browser menggunakan Iframe Terisolasi dengan menyertakan seluruh stylesheet CSS
  const handlePrint = () => {
    if (!printAreaRef.current) {
      window.print();
      return;
    }

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

    // Salin seluruh stylesheet CSS dan style tag dari halaman utama agar Tailwind tampil 100% sempurna
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\n');

    const content = printAreaRef.current.innerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekap_Kehadiran_Guru_${filterState.startDate}_sd_${filterState.endDate}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          ${styleTags}
          <style>
            @page {
              size: 210mm 330mm;
              margin: 8mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              color: #000 !important;
              background: #fff !important;
              font-size: 10px;
            }
            .print-page-break {
              page-break-after: always;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 6px 0;
              table-layout: fixed;
            }
            th, td {
              border: 1px solid #000 !important;
              padding: 4px;
              word-wrap: break-word;
            }
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; margin: 0 auto; background: #ffffff;">
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
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 2000);
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
              <button
                type="button"
                onClick={() => setReportType('berita_acara')}
                className={`px-3 py-1 font-semibold rounded-md transition-all ${
                  reportType === 'berita_acara'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Berita Acara KBM
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

          {/* Action Buttons: Download JPG, Download PDF & Print */}
          <div className="flex flex-wrap items-center gap-2">
            {reportType === 'berita_acara' ? (
              <button
                type="button"
                onClick={handleDownloadBeritaAcaraJpg}
                disabled={isExportingBeritaAcaraJpg || isExportingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 rounded-lg shadow-sm transition-all text-xs"
                title="Download Berita Acara sebagai gambar (JPG)"
              >
                {isExportingBeritaAcaraJpg ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Membuat JPG...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={14} />
                    <span>Unduh JPG Berita Acara</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownloadJpg}
                disabled={isExportingJpg || isExportingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 rounded-lg shadow-sm transition-all text-xs"
                title="Download dokumen langsung sebagai gambar (JPG) resolusi tinggi"
              >
                {isExportingJpg ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Membuat JPG...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={14} />
                    <span>Unduh Gambar (JPG)</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf || isExportingJpg}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition-all text-xs"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-white bg-sky-700 hover:bg-sky-800 active:bg-sky-900 rounded-lg shadow-sm transition-all text-xs"
              title="Cetak via browser atau simpan PDF standar"
            >
              <Printer size={14} />
              <span>Cetak / Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* Print Preview Container */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-100 p-2 sm:p-5 max-h-[68vh] overflow-y-auto">
          
          <div 
            id="official-print-document" 
            ref={printAreaRef}
            className="bg-white p-5 sm:p-8 rounded-sm shadow-md mx-auto text-slate-900 font-sans print:p-0 print:shadow-none print:max-w-none"
            style={{ width: '100%', maxWidth: '210mm' }}
          >
            {/* KOP SURAT RESMI MADRASAH (Logo Kiri: Madrasah, Logo Kanan: SIRAMA Web App) */}
            <div className="border-b-[3px] border-double border-slate-900 pb-2 mb-3">
              <div className="flex items-center justify-between gap-3">
                {/* Logo Kiri: Logo Resmi Lembaga Madrasah */}
                <div className="w-16 h-16 flex-shrink-0 flex justify-center items-center">
                  <img
                    src={base64Madrasah || parseDirectImageUrl(logoMadrasah)}
                    alt="Logo Madrasah"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-contain select-none"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const alt = getAlternateRawUrl(logoMadrasah);
                      if (alt && target.src !== alt) {
                        target.src = alt;
                      } else {
                        target.src = APP_CONFIG.DEFAULT_LOGO_URL;
                      }
                    }}
                  />
                </div>

                {/* Kop Teks Tengah */}
                <div className="flex-1 text-center leading-tight px-1 overflow-hidden">
                  <h4 className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-800 uppercase">
                    {yayasanName}
                  </h4>
                  <h2 className="text-xs sm:text-sm md:text-base font-extrabold text-sky-950 tracking-tight uppercase my-0.5">
                    {lembagaName}
                  </h2>
                  <p className="text-[9.5px] text-slate-700 font-medium">
                    {identitasName}
                  </p>
                  <p className="text-[9px] text-slate-600">
                    {alamatName}
                  </p>
                </div>

                {/* Logo Kanan: Logo Web App SIRAMA */}
                <div className="w-16 h-16 flex-shrink-0 flex justify-center items-center">
                  <img
                    src={base64Sirama || parseDirectImageUrl(logoSirama)}
                    alt="Logo SIRAMA"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 object-contain select-none"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const alt = getAlternateRawUrl(logoSirama);
                      if (alt && target.src !== alt) {
                        target.src = alt;
                      } else {
                        target.src = APP_CONFIG.DEFAULT_LOGO_SIRAMA_URL;
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* JUDUL LAPORAN */}
            <div className="text-center my-2.5">
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 underline decoration-slate-900 decoration-1 underline-offset-4">
                {judulLaporan}
              </h3>
              <p className="text-[10.5px] font-semibold text-slate-700 mt-0.5">
                Periode: {periodeText}
              </p>
            </div>

            {/* RINGKASAN METRIK */}
            <div className="my-2.5 bg-slate-50 border border-slate-300 p-2 rounded text-[10px] grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-500 block">Total Sesi KBM:</span>
                <strong className="text-slate-800">{stats.total} Sesi</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tingkat Kehadiran:</span>
                <strong className="text-emerald-700">{stats.persentase}% ({stats.hadirEfektif} Sesi)</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Izin / Sakit / Alpha:</span>
                <strong className="text-slate-800">{stats.izin} I / {stats.sakit} S / {stats.alpa} A</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tugas Dinas:</span>
                <strong className="text-indigo-700">{stats.tugasDinas} TD</strong>
              </div>
            </div>

            {/* TABEL SESUAI PILIHAN MODEL */}
            {reportType === 'summary' ? (
              // TABEL REKAP KEHADIRAN PER GURU (KONSOLIDASI 1 LEMBAR F4)
              <div className="my-2.5 overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-800 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold text-center border-b border-slate-800">
                      <th className="border border-slate-800 py-1.5 px-1 w-9 text-center">Nomor</th>
                      <th className="border border-slate-800 py-1.5 px-2 text-left">Nama</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-24 text-center">Total Sesi / Wajib Hadir</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-12 text-center">Hadir</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-11 text-center">Izin</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-11 text-center">Sakit</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-11 text-center">Alpha</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-16 text-center">Tugas Dinas</th>
                      <th className="border border-slate-800 py-1.5 px-1 w-20 text-center">Persentase Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeacherSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="border border-slate-800 py-4 text-center text-slate-500 italic">
                          Tidak ada data presensi guru pada periode yang dipilih ({periodeText}).
                        </td>
                      </tr>
                    ) : (
                      sortedTeacherSummaries.map((ts, idx) => {
                        const wajibHadir = ts.totalSesi;
                        const kehadiran = ts.hadir + ts.tugasDinas;
                        const persentase = wajibHadir > 0 ? Math.round((kehadiran / wajibHadir) * 100) : 0;

                        return (
                          <tr key={ts.nama} className="border-b border-slate-300 even:bg-slate-50/50">
                            <td className="border border-slate-800 py-1 px-1 text-center font-medium">{idx + 1}</td>
                            <td className="border border-slate-800 py-1 px-2 font-semibold text-slate-900">{ts.nama}</td>
                            <td className="border border-slate-800 py-1 px-1 text-center font-bold bg-slate-50/50">{wajibHadir}</td>
                            <td className="border border-slate-800 py-1 px-1 text-center font-semibold text-emerald-800">{ts.hadir}</td>
                            <td className="border border-slate-800 py-1 px-1 text-center">{ts.izin || 0}</td>
                            <td className="border border-slate-800 py-1 px-1 text-center">{ts.sakit || 0}</td>
                            <td className={`border border-slate-800 py-1 px-1 text-center font-bold ${ts.alpa > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                              {ts.alpa || 0}
                            </td>
                            <td className="border border-slate-800 py-1 px-1 text-center">{ts.tugasDinas || 0}</td>
                            <td className="border border-slate-800 py-1 px-1 text-center font-bold bg-sky-50/40 text-slate-900">
                              {persentase}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {sortedTeacherSummaries.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-800">
                        <td colSpan={2} className="border border-slate-800 py-1.5 px-2 text-center uppercase tracking-wider text-[10px]">
                          TOTAL REKAPITULASI
                        </td>
                        <td className="border border-slate-800 py-1.5 px-1 text-center">{totalWajibHadir}</td>
                        <td className="border border-slate-800 py-1.5 px-1 text-center text-emerald-800">{totalHadir}</td>
                        <td className="border border-slate-800 py-1.5 px-1 text-center">{totalIzin}</td>
                        <td className="border border-slate-800 py-1.5 px-1 text-center">{totalSakit}</td>
                        <td className="border border-slate-800 py-1.5 px-1 text-center text-rose-700">{totalAlpa}</td>
                        <td className="border border-slate-800 py-1.5 px-1 text-center">{totalTugasDinas}</td>
                        <td className="border border-slate-800 py-1.5 px-1 text-center bg-sky-100 text-sky-950 font-extrabold">
                          {overallPercentage}%
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            ) : reportType === 'detailed' ? (
              // TABEL 2: LOG HARIAN / RINCI
              <div className="my-4 overflow-x-auto">
                {/* Header Judul Khusus untuk Tabel ini */}
                <div className="text-center mb-4">
                  <h3 className="text-sm font-bold uppercase underline">DAFTAR HADIR GURU - {filterState.selectedKelas || 'SEMUA KELAS'}</h3>
                  <p className="text-xs font-semibold">Periode: {periodeText}</p>
                </div>

                <table className="w-full text-left border-collapse border border-slate-800 text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold text-center border-b border-slate-800">
                      <th className="border border-slate-800 py-3 px-2 w-10">No</th>
                      <th className="border border-slate-800 py-3 px-3 w-28">Tanggal</th>
                      <th className="border border-slate-800 py-3 px-4 text-left">Nama Guru</th>
                      <th className="border border-slate-800 py-3 px-4 text-left">Mapel</th>
                      <th className="border border-slate-800 py-3 px-3 w-20">Kelas</th>
                      <th className="border border-slate-800 py-3 px-3 w-16">Jam</th>
                      <th className="border border-slate-800 py-3 px-3 w-24">Status</th>
                      <th className="border border-slate-800 py-3 px-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((r, idx) => (
                      <tr key={r.id} className="border-b border-slate-300">
                        <td className="border border-slate-800 py-3 px-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-800 py-3 px-3 text-center whitespace-nowrap">{formatIndonesianShortDate(r.tanggal)}</td>
                        <td className="border border-slate-800 py-3 px-4 font-semibold">{r.namaGuru}</td>
                        <td className="border border-slate-800 py-3 px-4">{r.mataPelajaran}</td>
                        <td className="border border-slate-800 py-3 px-3 text-center font-bold bg-sky-50">{r.kelas}</td>
                        <td className="border border-slate-800 py-3 px-3 text-center font-bold">Jam {r.jam}</td>
                        <td className="border border-slate-800 py-3 px-3 text-center font-bold">
                          {STATUS_CONFIG[r.status]?.label || r.status}
                        </td>
                        <td className="border border-slate-800 py-3 px-4 text-slate-600">{r.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // TABEL 3: BERITA ACARA KBM (Grouped by Kelas, 3 per row)
              <div className="my-4">
                <div className="text-center mb-4">
                   <h2 className="text-lg font-bold">Berita Acara KBM MADAR</h2>
                   <p className="text-sm">{periodeText}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(currentRecords.reduce((acc, r) => {
                    if (!acc[r.kelas]) acc[r.kelas] = [];
                    acc[r.kelas].push(r);
                    return acc;
                  }, {} as Record<string, AttendanceRecord[]>)).sort((a,b) => a[0].localeCompare(b[0])).map(([kelas, records], _, array) => {
                    // Logic to center the last row if it has fewer than 3 items
                    const isLastRow = array.length % 3 !== 0 && array.length - array.indexOf([kelas, records] as any) <= (array.length % 3);
                    const wrapperClass = isLastRow && array.length % 3 !== 0 ? 'md:col-start-2' : '';
                    
                    return (
                      <div key={kelas} className={`border border-slate-800 break-inside-avoid ${wrapperClass}`}>
                        <h3 className="font-bold bg-slate-100 p-1 border-b border-slate-800 text-center text-xs">Kelas {kelas}</h3>
                        <table className="w-full text-left border-collapse text-[9px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-800">
                              <th className="border-r border-slate-800 p-0.5 text-center">Jam</th>
                              <th className="border-r border-slate-800 p-0.5">Mapel</th>
                              <th className="border-r border-slate-800 p-0.5">Pengajar</th>
                              <th className="p-0.5 text-center">Ket</th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.sort((a,b) => Number(a.jam) - Number(b.jam)).map(r => {
                              let rowColor = '';
                              if (r.status === 'ALPA') rowColor = 'bg-rose-200';
                              else if (r.status === 'IZIN' || r.status === 'SAKIT') rowColor = 'bg-yellow-200';
                              else if (r.status === 'TUGAS_DINAS') rowColor = 'bg-sky-200';
                              
                              const statusShort = r.status === 'HADIR' ? '' : 
                                r.status === 'IZIN' ? 'I' : 
                                r.status === 'SAKIT' ? 'S' : 
                                r.status === 'ALPA' ? 'A' : 
                                r.status === 'TUGAS_DINAS' ? 'TD' : r.status;
                              
                              return (
                                <tr key={r.id} className={`border-b border-slate-200 last:border-b-0 ${rowColor}`}>
                                  <td className="border-r border-slate-800 p-0.5 text-center">{r.jam}</td>
                                  <td className="border-r border-slate-800 p-0.5 truncate max-w-[60px]" title={r.mataPelajaran}>{r.mataPelajaran}</td>
                                  <td className="border-r border-slate-800 p-0.5 truncate max-w-[80px]" title={r.namaGuru}>{r.namaGuru}</td>
                                  <td className="p-0.5 text-center font-bold">{statusShort}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TANDA TANGAN RESMI */}
            <div className="mt-6 pt-2 break-inside-avoid text-[10.5px]">
              <div className="flex justify-between items-start">
                
                {/* Waka / Staff Kurikulum */}
                <div className="text-center w-56">
                  <p className="text-slate-600 mb-0.5">Mengetahui,</p>
                  <p className="font-bold text-slate-900">{staffJabatan}</p>
                  <div className="h-14" />
                  <p className="font-bold text-slate-900 underline underline-offset-2">
                    {staffName}
                  </p>
                </div>

                {/* Kepala Madrasah */}
                <div className="text-center w-56">
                  <p className="text-slate-600 mb-0.5">
                    {kotaName}, {todayStr}
                  </p>
                  <p className="font-bold text-slate-900">{kepalaJabatan}</p>
                  <div className="h-14" />
                  <p className="font-bold text-slate-900 underline underline-offset-2">
                    {kepalaName}
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
      
      {/* Hidden Berita Acara JPG View */}
      <div className="absolute -top-[9999px] -left-[9999px]">
        <div ref={beritaAcaraRef}>
          <BeritaAcaraJpgView records={currentRecords} periodeText={periodeText} stats={stats} logoUrl={logoMadrasah} base64Logo={base64Madrasah} />
        </div>
      </div>
    </Modal>
  );
};
