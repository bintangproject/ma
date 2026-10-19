import React, { useState, useRef } from 'react';
import { InstitutionConfig, MasterGuru, DayScheduleMap } from '../../types/attendance';
import { DAFTAR_HARI } from '../../data/defaultData';
import { Printer, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface MonthlyAttendanceSheetProps {
  config: InstitutionConfig;
  teachers: MasterGuru[];
  schedules: DayScheduleMap;
}

export const MonthlyAttendanceSheet: React.FC<MonthlyAttendanceSheetProps> = ({ config, teachers, schedules }) => {
  const [targetDay, setTargetDay] = useState('Sabtu');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [exportingGrade, setExportingGrade] = useState<string | null>(null);

  const sheetRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const institutionName = (config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();

  // Helper to find all dates for targetDay in range: 26th prev month to 25th current month
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

  // Get schedules for targetDay
  const daySchedules = schedules[targetDay] || [];

  // Get unique classes from schedules
  const allClasses = Array.from(new Set(daySchedules.map(s => s.kelas))).sort((a, b) => {
    const customOrder: Record<string, number> = {
      // Kelas X
      'X A': 1, 'X B': 2, 'X C': 3, 'X D': 4, 'X E': 5, 'X F': 6,
      // Kelas XI
      'XI-PA (IPS)': 7, 'XI-PI (IPS)': 8, 'XI-PA (IPA)': 9, 'XI-PI (IPA)': 10, 'XI (Bahasa)': 11,
      // Kelas XII
      'XII-PA (IPS)': 12, 'XII-PI (IPS)': 13, 'XII-PA (PK)': 14, 'XII-PI (PK)': 15, 'XII (IPA)': 16
    };
    return (customOrder[a] || 99) - (customOrder[b] || 99);
  });

  // Group classes into Grade X, Grade XI, Grade XII
  const gradeXClasses = allClasses.filter(c => {
    const upper = c.toUpperCase();
    return upper.startsWith('X') && !upper.startsWith('XI') && !upper.startsWith('XII');
  });
  const gradeXIClasses = allClasses.filter(c => {
    const upper = c.toUpperCase();
    return upper.startsWith('XI') && !upper.startsWith('XII');
  });
  const gradeXIIClasses = allClasses.filter(c => c.toUpperCase().startsWith('XII'));

  const gradeSheets = [
    { title: 'KELAS X', code: 'X', classes: gradeXClasses },
    { title: 'KELAS XI', code: 'XI', classes: gradeXIClasses },
    { title: 'KELAS XII', code: 'XII', classes: gradeXIIClasses },
  ].filter(sheet => sheet.classes.length > 0);

  // Helper to get teacher code by name
  const getTeacherCode = (guruName: string) => {
    const t = teachers.find(tch => tch.nama.toLowerCase() === guruName.toLowerCase() || tch.nama.includes(guruName));
    return t ? t.kode : 'NA';
  };

  const handleDownloadSinglePdf = async (sheetTitle: string, code: string) => {
    const el = sheetRefs.current[code];
    if (!el) return;

    setExportingGrade(code);

    try {
      const canvas = await html2canvas(el, {
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
      
      // Hitung dimensi agar proporsional
      const pdfWidth = 210;
      const margin = 15;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Tambahkan ke PDF
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      pdf.save(`Rekap_Presensi_${sheetTitle.replace(/\s+/g, '_')}_${targetDay}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setExportingGrade(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-4">
      {/* Controls (No Print) */}
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

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs"
          >
            <Printer size={14} />
            <span>Cetak Semua (Browser)</span>
          </button>

          {gradeSheets.map(sheet => (
            <button
              key={sheet.code}
              type="button"
              disabled={exportingGrade !== null}
              onClick={() => handleDownloadSinglePdf(sheet.title, sheet.code)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs disabled:opacity-50"
            >
              {exportingGrade === sheet.code ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{exportingGrade === sheet.code ? 'Memproses...' : `Unduh ${sheet.title}`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Printable Sheets Container (F4 sizing simulation: Margin left 2cm (~20mm), top/bottom/right 0.5cm (~5mm)) */}
      <div className="space-y-8 bg-white" style={{ paddingLeft: '30mm', paddingTop: '5mm', paddingRight: '5mm', paddingBottom: '5mm' }}>
        {gradeSheets.map((sheet, sIdx) => (
          <div 
            key={sheet.code}
            ref={(el) => { sheetRefs.current[sheet.code] = el; }}
            className="print-page bg-white text-slate-900" 
            style={{ 
              minHeight: '320mm', 
              pageBreakAfter: 'always', 
              breakAfter: 'page',
              marginBottom: sIdx < gradeSheets.length - 1 ? '20mm' : '0'
            }}
          >
            {/* Header */}
            <div className="text-center pb-3 mb-4 border-b-2 border-slate-900">
              <h1 className="text-lg font-extrabold tracking-wide uppercase">DAFTAR HADIR GURU - {sheet.title} - HARI {targetDay.toUpperCase()}</h1>
              <h2 className="text-base font-black uppercase tracking-wider">{institutionName}</h2>
              <p className="text-xs font-semibold mt-0.5">TAHUN PELAJARAN {selectedYear}-{selectedYear + 1}</p>
            </div>

            {/* Table */}
            <table className="w-full border-collapse border border-slate-900 table-fixed">
              <thead>
                <tr className="bg-slate-100 text-center font-bold text-[9px]">
                  <th className="border border-slate-900 px-0.5 py-1 w-[8%]">KELAS</th>
                  <th className="border border-slate-900 px-0.5 py-1 w-[4%]">JAM</th>
                  <th className="border border-slate-900 px-0.5 py-1 w-[6%]">KODE</th>
                  <th className="border border-slate-900 px-1 py-1 w-[25%]">NAMA</th>
                  <th className="border border-slate-900 px-1 py-1 w-[20%]">MAPEL</th>
                  {monthDates.map((dateObj, dIdx) => {
                    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric' });
                    return (
                      <th key={dIdx} className="border border-slate-900 px-0.5 py-1 text-center text-[8px]">
                        {dateStr}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sheet.classes.map(kelas => {
                  const classItems = daySchedules.filter(s => s.kelas === kelas).sort((a, b) => Number(a.jam) - Number(b.jam));
                  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

                  return periods.map((jam, pIdx) => {
                    const item = classItems.find(s => Number(s.jam) === jam);
                    const guruName = item ? item.guruPengampu : '-';
                    const kodeGuru = item ? getTeacherCode(guruName) : '-';
                    const mapel = item ? item.mataPelajaran : '-';

                    return (
                      <tr key={`${kelas}-${jam}`} className="hover:bg-slate-50 h-7">
                        {pIdx === 0 && (
                          <td rowSpan={periods.length} className="border border-slate-900 px-1 py-1 font-bold text-center align-middle bg-slate-50 text-[9px]">
                            {kelas}
                          </td>
                        )}
                        <td className="border border-slate-900 px-1 py-0.5 text-center font-bold text-[9px]">{jam}</td>
                        <td className="border border-slate-900 px-1 py-0.5 text-center font-normal text-[9px]">{kodeGuru}</td>
                        <td className="border border-slate-900 px-1.5 py-0.5 font-semibold text-[9px] truncate">{guruName}</td>
                        <td className="border border-slate-900 px-1.5 py-0.5 text-[9px] truncate">{mapel}</td>
                        {monthDates.map((_, dIdx) => (
                            <td key={dIdx} className="border border-slate-900 px-1 py-0.5 text-center"></td>
                        ))}
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
            <p className="text-[9px] italic text-slate-700 mt-1 font-medium">* Centang bila hadir, jika tidak hadir diisi keterangan (izin, sakit, alpha, atau nama pengganti).</p>
          </div>
        ))}
      </div>
    </div>
  );
};
