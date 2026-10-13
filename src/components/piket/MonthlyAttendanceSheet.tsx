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
    // Custom sort: split by grade and section (e.g., 'X A' -> ['X', 'A'])
    const partsA = a.split(' ');
    const partsB = b.split(' ');
    
    // Compare grade first
    if (partsA[0] !== partsB[0]) return partsA[0].localeCompare(partsB[0]);
    // Then compare section
    return partsA[1].localeCompare(partsB[1]);
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
      const imgWidth = 210 - 35; // F4 width 210, left 30mm, right 5mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Margins: left 30mm, top 5mm
      pdf.addImage(imgData, 'JPEG', 30, 5, imgWidth, imgHeight > 320 ? 320 : imgHeight);
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
              <h1 className="text-sm font-extrabold tracking-wide">DAFTAR HADIR GURU — {sheet.title}</h1>
              <h2 className="text-base font-black uppercase tracking-wider">{institutionName}</h2>
              <p className="text-[11px] font-semibold mt-0.5">TAHUN PELAJARAN {selectedYear}-{selectedYear + 1}</p>
            </div>

            {/* Table */}
            <table className="w-full border-collapse border border-slate-900 text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th rowSpan={2} className="border border-slate-900 px-1 py-1.5 w-10">KELAS</th>
                  <th rowSpan={2} className="border border-slate-900 px-1 py-1.5 w-6">JAM</th>
                  <th rowSpan={2} className="border border-slate-900 px-1 py-1.5 w-10">KODE</th>
                  <th rowSpan={2} className="border border-slate-900 px-2 py-1.5 text-center w-32">NAMA</th>
                  <th rowSpan={2} className="border border-slate-900 px-2 py-1.5 text-center w-32">MAPEL</th>
                  {monthDates.map((dateObj, dIdx) => {
                    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' });
                    return (
                      <th key={dIdx} colSpan={2} className="border border-slate-900 px-1 py-1 text-center w-16">
                        {targetDay}, {dateStr}
                      </th>
                    );
                  })}
                </tr>
                <tr className="bg-slate-50 text-center font-bold text-[9px]">
                  {monthDates.map((_, dIdx) => (
                    <th key={dIdx} colSpan={2} className="border border-slate-950 px-1 py-1">H/I/S/A | KGP</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheet.classes.map(kelas => {
                  const classItems = daySchedules.filter(s => s.kelas === kelas).sort((a, b) => Number(a.jam) - Number(b.jam));
                  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

                  return periods.map((jam, pIdx) => {
                    const item = classItems.find(s => Number(s.jam) === jam);
                    const guruName = item ? item.guruPengampu : '#N/A';
                    const kodeGuru = item ? getTeacherCode(guruName) : 'NA';
                    const mapel = item ? item.mataPelajaran : '-';

                    return (
                      <tr key={`${kelas}-${jam}`} className="hover:bg-slate-50">
                        {pIdx === 0 && (
                          <td rowSpan={periods.length} className="border border-slate-900 px-1.5 py-1 font-bold text-center align-middle bg-slate-50/50">
                            {kelas}
                          </td>
                        )}
                        <td className="border border-slate-900 px-1.5 py-1 text-center font-medium">{jam}</td>
                        <td className="border border-slate-900 px-1.5 py-1 text-center font-bold text-sky-800">{kodeGuru}</td>
                        <td className="border border-slate-900 px-2 py-1 text-left text-[9px]" style={{ width: '120px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{guruName}</td>
                        <td className="border border-slate-900 px-2 py-1 text-left text-[9px]" style={{ width: '100px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{mapel}</td>
                        {monthDates.map((_, dIdx) => (
                            <React.Fragment key={dIdx}>
                                <td className="border border-slate-900 px-1 py-1 text-center w-8"></td>
                                <td className="border border-slate-900 px-1 py-1 text-center w-8"></td>
                            </React.Fragment>
                        ))}
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};
