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
        format: [210, 330], // F4
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = 210 - 35; // 30 left, 5 right
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      // Margins: top 25mm, left 30mm
      pdf.addImage(imgData, 'JPEG', 30, 25, imgWidth, imgHeight > 300 ? 300 : imgHeight);
      pdf.save(`Rekap_Piket_${targetDay}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-4">
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

      <div 
        ref={containerRef}
        className="print-page bg-white text-slate-900 p-8"
        style={{ minHeight: '320mm' }}
      >
        <div className="text-center pb-3 mb-6 border-b-2 border-slate-900">
          <h1 className="text-sm font-extrabold tracking-wide">DAFTAR HADIR GURU PIKET — HARI {targetDay.toUpperCase()}</h1>
          <h2 className="text-base font-black uppercase tracking-wider">{institutionName}</h2>
          <p className="text-[11px] font-semibold mt-0.5">TAHUN PELAJARAN {selectedYear}-{selectedYear + 1}</p>
        </div>

        <table className="w-full border-collapse border border-slate-900 text-[10px]">
          <thead>
            <tr className="bg-slate-100 text-center font-bold">
              <th className="border border-slate-900 px-1 py-1.5 w-12">NO</th>
              <th className="border border-slate-900 px-2 py-1.5 text-left min-w-44">NAMA GURU</th>
              <th className="border border-slate-900 px-2 py-1.5 text-center min-w-24">MAPEL</th>
              {monthDates.map((dateObj, dIdx) => {
                const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                return (
                  <th key={dIdx} className="border border-slate-900 px-1 py-1 text-center w-8">
                    {dateStr}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {piketTeachers.map((namaGuru, idx) => (
              <tr key={idx}>
                <td className="border border-slate-900 px-1.5 py-2 text-center font-bold">{idx + 1}</td>
                <td className="border border-slate-900 px-2 py-2">{namaGuru}</td>
                <td className="border border-slate-900 px-2 py-2 text-center">-</td>
                {monthDates.map((_, dIdx) => (
                  <td key={dIdx} className="border border-slate-900 px-1 py-2 text-center"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
