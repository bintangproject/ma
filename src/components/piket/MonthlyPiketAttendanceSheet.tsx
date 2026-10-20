import React, { useState, useRef } from 'react';
import { InstitutionConfig, MasterGuru, JadwalPiketDayMap } from '../../types/attendance';
import { DAFTAR_HARI } from '../../data/defaultData';
import { Printer, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface MonthlyPiketAttendanceSheetProps {
  config: InstitutionConfig;
  teachers: MasterGuru[];
  jadwalPiket: JadwalPiketDayMap;
}

export const MonthlyPiketAttendanceSheet: React.FC<MonthlyPiketAttendanceSheetProps> = ({ config, teachers, jadwalPiket }) => {
  const [targetDay, setTargetDay] = useState('Sabtu');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const institutionName = (config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();

  const getDatesForRangeAndDay = (year: number, month: number, dayName: string) => {
    const startDate = new Date(year, month - 1, 26);
    const endDate = new Date(year, month, 25);
    const dates: Date[] = [];
    const curr = new Date(startDate);
    const dayMap: Record<string, number> = {
      'Ahad': 0, 'Minggu': 0, 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6
    };
    const targetDow = dayMap[dayName] ?? 6;
    while (curr <= endDate) {
      if (curr.getDay() === targetDow) {
        dates.push(new Date(curr));
      }
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const monthDates = getDatesForRangeAndDay(selectedYear, selectedMonth, targetDay);
  const piketTeachers = jadwalPiket[targetDay] || [];

  const handleDownloadPdf = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 330], // Standar F4 (Folio)
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Pengaturan Margin Sesuai Permintaan:
      // Margin kiri: 3 cm (30 mm)
      // Margin lain (atas, kanan, bawah): 0.5 cm (5 mm)
      const pdfWidth = 210;
      const pdfHeight = 330;
      const marginLeft = 30; // 3 cm
      const marginRight = 5; // 0.5 cm
      const marginTop = 5;   // 0.5 cm
      const marginBottom = 5;// 0.5 cm

      const targetWidth = pdfWidth - marginLeft - marginRight; // 175 mm
      const maxTargetHeight = pdfHeight - marginTop - marginBottom; // 320 mm

      let imgWidth = targetWidth;
      let imgHeight = (canvas.height * targetWidth) / canvas.width;

      if (imgHeight > maxTargetHeight) {
        const ratio = maxTargetHeight / imgHeight;
        imgHeight = maxTargetHeight;
        imgWidth = targetWidth * ratio;
      }

      pdf.addImage(imgData, 'JPEG', marginLeft, marginTop, imgWidth, imgHeight);
      pdf.save(`Rekap_Piket_${targetDay}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      handlePrint();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const printContainer = containerRef.current;
    if (!printContainer) {
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

    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daftar_Hadir_Guru_Piket_${targetDay}</title>
          <meta charset="utf-8" />
          ${styleTags}
          <style>
            @page {
              size: 210mm 330mm;
              margin: 5mm 5mm 5mm 30mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff !important;
              color: #000 !important;
              font-family: sans-serif;
            }
          </style>
        </head>
        <body>
          <div style="width: 175mm; margin: 0;">
            ${printContainer.outerHTML}
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
    }, 500);
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Jumlah baris catatan disesuaikan agar mengisi penuh halaman F4
  const numPiket = piketTeachers.length;
  const catatanRowCount = numPiket > 5 ? 11 : 12;
  const piketRowHeight = numPiket > 5 ? 'h-14' : 'h-16';

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="no-print bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Hari:</label>
            <select
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
            >
              {DAFTAR_HARI.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Bulan (Periode 26 s.d. 25):</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
            >
              {months.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tahun:</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs px-3 py-1.5 w-24 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs"
          >
            <Printer size={14} />
            <span>Cetak (Browser)</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{isExporting ? 'Memproses...' : 'Unduh PDF Rekap Piket'}</span>
          </button>
        </div>
      </div>

      {/* Preview Sheet Container dengan aspect ratio F4 terkalibrasi agar tidak pipih */}
      <div 
        id="monthly-piket-sheets-print-area" 
        className="bg-slate-100 p-2 sm:p-4 rounded-xl overflow-x-auto"
      >
        <div 
          ref={containerRef}
          className="print-page bg-white text-slate-900 shadow-md mx-auto"
          style={{ 
            width: '100%',
            maxWidth: '750px',
            padding: '4mm'
          }}
        >
          {/* Header Lembar Presensi */}
          <div className="text-center pb-2 mb-2.5 border-b-2 border-slate-900">
            <h1 className="text-base font-extrabold tracking-wide uppercase text-slate-900 leading-tight">
              DAFTAR HADIR GURU PIKET — HARI {targetDay.toUpperCase()}
            </h1>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 leading-tight mt-0.5">
              {institutionName}
            </h2>
            <p className="text-[11px] font-semibold text-slate-700 mt-0.5 leading-tight">
              TAHUN PELAJARAN {selectedYear}-{selectedYear + 1}
            </p>
          </div>

          {/* Tabel 1: Tanda Tangan Kehadiran Guru Piket */}
          <table className="w-full border-collapse border border-slate-900 table-fixed mb-2">
            <thead>
              <tr className="bg-slate-100 text-center font-bold text-[10px]">
                <th className="border border-slate-900 px-1 py-2 w-[7%] text-center">NO</th>
                <th className="border border-slate-900 px-2 py-2 w-[35%] text-center">NAMA GURU PIKET</th>
                {monthDates.map((dateObj, dIdx) => {
                  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                  const d = dateObj.getDate();
                  const m = shortMonths[dateObj.getMonth()];
                  const dateStr = `${d < 10 ? '0' + d : d} ${m}`;
                  return (
                    <th key={dIdx} className="border border-slate-900 px-1 py-2 text-center font-bold text-[9.5px] whitespace-nowrap">
                      {dateStr}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {piketTeachers.map((namaGuru, idx) => (
                <tr key={idx} className={piketRowHeight}>
                  <td className="border border-slate-900 px-1 py-1 text-center font-bold text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-900 px-2.5 py-1 font-bold text-[12px] text-slate-900 truncate">
                    {namaGuru}
                  </td>
                  {monthDates.map((_, dIdx) => (
                    <td key={dIdx} className="border border-slate-900 px-1 py-1 text-center"></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[9.5px] italic text-slate-700 mb-3.5 font-medium leading-normal">
            * Kolom diisi dengan tanda tangan guru piket pada tanggal dan hari yang bersangkutan.
          </p>

          {/* Tabel 2: Catatan Kejadian / Laporan Guru Piket */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide mb-1.5">
              CATATAN GURU PIKET:
            </h3>
            <table className="w-full border-collapse border border-slate-900 table-fixed">
              <thead>
                <tr className="bg-slate-100 text-center font-bold text-[10px]">
                  <th className="border border-slate-900 px-2 py-1.5 w-[18%] text-center">TANGGAL</th>
                  <th className="border border-slate-900 px-2 py-1.5 w-[57%] text-center">CATATAN KEJADIAN / PERISTIWA</th>
                  <th className="border border-slate-900 px-2 py-1.5 w-[25%] text-center">PETUGAS PIKET / TTD</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(catatanRowCount)].map((_, i) => (
                  <tr key={i} className="h-12 hover:bg-slate-50/50">
                    <td className="border border-slate-900 px-2 py-1"></td>
                    <td className="border border-slate-900 px-2 py-1"></td>
                    <td className="border border-slate-900 px-2 py-1"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
