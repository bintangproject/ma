import React, { useState } from 'react';
import { InstitutionConfig, MasterGuru, DayScheduleMap } from '../../types/attendance';
import { DAFTAR_HARI } from '../../data/defaultData';
import { Printer } from 'lucide-react';

interface MonthlyAttendanceSheetProps {
  config: InstitutionConfig;
  teachers: MasterGuru[];
  schedules: DayScheduleMap;
}

export const MonthlyAttendanceSheet: React.FC<MonthlyAttendanceSheetProps> = ({ config, teachers, schedules }) => {
  const [targetDay, setTargetDay] = useState('Sabtu');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11

  const institutionName = (config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();

  // Helper to find all dates for targetDay in selected year/month
  const getDatesForMonthAndDay = (year: number, month: number, dayName: string) => {
    const dates: Date[] = [];
    const date = new Date(year, month, 1);
    
    const dayMap: Record<string, number> = {
      'Ahad': 0, 'Minggu': 0, 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6
    };
    const targetDow = dayMap[dayName] ?? 6;

    while (date.getMonth() === month) {
      if (date.getDay() === targetDow) {
        dates.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const monthDates = getDatesForMonthAndDay(selectedYear, selectedMonth, targetDay);

  // Get schedules for targetDay
  const daySchedules = schedules[targetDay] || [];

  // Get unique classes from schedules
  const allClasses = Array.from(new Set(daySchedules.map(s => s.kelas))).sort();

  // Group classes into Grade X, Grade XI, Grade XII
  const gradeXClasses = allClasses.filter(c => {
    const upper = c.toUpperCase();
    return upper.startsWith('X') && !upper.startsWith('XI') && !upper.startsWith('XII');
  });
  const gradeXIClasses = allClasses.filter(c => c.toUpperCase().startsWith('XI'));
  const gradeXIIClasses = allClasses.filter(c => c.toUpperCase().startsWith('XII'));

  // If no classification found, fallback: if all start with X, put them in Grade X, etc.
  const gradeSheets = [
    { title: 'KELAS X', classes: gradeXClasses.length > 0 ? gradeXClasses : allClasses.filter(c => c.toUpperCase().includes('X') && !c.toUpperCase().includes('XI')) },
    { title: 'KELAS XI', classes: gradeXIClasses },
    { title: 'KELAS XII', classes: gradeXIIClasses },
  ].filter(sheet => sheet.classes.length > 0);

  // Helper to get teacher code by name
  const getTeacherCode = (guruName: string) => {
    const t = teachers.find(tch => tch.nama.toLowerCase() === guruName.toLowerCase() || tch.nama.includes(guruName));
    return t ? t.kode : 'NA';
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Bulan:</label>
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
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs"
        >
          <Printer size={14} />
          <span>Cetak / Unduh PDF (3 Lembar: X, XI, XII)</span>
        </button>
      </div>

      {/* Printable Sheets Container */}
      <div id="monthly-attendance-print-container" className="space-y-8 bg-white p-2">
        {gradeSheets.map((sheet, sIdx) => (
          <div key={sheet.title} className={`print-page bg-white p-4 text-slate-900 border border-slate-200 rounded-xl print:border-none print:p-0 ${sIdx < gradeSheets.length - 1 ? 'pb-8 border-b-2 border-dashed border-slate-200' : ''}`}>
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
                  <th className="border border-slate-900 px-1 py-1.5 w-12">KELAS</th>
                  <th className="border border-slate-900 px-1 py-1.5 w-8">JAM</th>
                  <th className="border border-slate-900 px-1 py-1.5 w-12">KODE GURU</th>
                  <th className="border border-slate-900 px-2 py-1.5 text-left min-w-44">NAMA</th>
                  {monthDates.map((dateObj, dIdx) => {
                    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' });
                    return (
                      <th key={dIdx} colSpan={2} className="border border-slate-900 px-1 py-1 text-center">
                        {targetDay}, {dateStr}
                      </th>
                    );
                  })}
                </tr>
                <tr className="bg-slate-50 text-center font-bold text-[9px]">
                  <th colSpan={4} className="border border-slate-900"></th>
                  {monthDates.map((_, dIdx) => (
                    <React.Fragment key={dIdx}>
                      <th className="border border-slate-950 px-1 py-1 w-10">H/TH</th>
                      <th className="border border-slate-950 px-1 py-1 w-10">KGP</th>
                    </React.Fragment>
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

                    return (
                      <tr key={`${kelas}-${jam}`} className="hover:bg-slate-50">
                        {pIdx === 0 && (
                          <td rowSpan={periods.length} className="border border-slate-900 px-1.5 py-1 font-bold text-center align-middle bg-slate-50/50">
                            {kelas}
                          </td>
                        )}
                        <td className="border border-slate-900 px-1.5 py-1 text-center font-medium">{jam}</td>
                        <td className="border border-slate-900 px-1.5 py-1 text-center font-bold text-sky-800">{kodeGuru}</td>
                        <td className="border border-slate-900 px-2 py-1 truncate max-w-xs">{guruName}</td>
                        {monthDates.map((_, dIdx) => (
                          <React.Fragment key={dIdx}>
                            <td className="border border-slate-900 px-1 py-1 text-center"></td>
                            <td className="border border-slate-900 px-1 py-1 text-center"></td>
                          </React.Fragment>
                        ))}
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>

            {/* Footer Signature */}
            <div className="mt-6 flex justify-between px-6 text-[11px]">
              <div>
                <p className="mb-12">Mengetahui,</p>
                <p className="font-bold underline">Kepala Madrasah</p>
              </div>
              <div>
                <p className="mb-12">Petugas Piket,</p>
                <p className="font-bold underline">( ........................................ )</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
