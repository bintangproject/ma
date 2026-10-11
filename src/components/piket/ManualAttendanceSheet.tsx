import React from 'react';
import { InstitutionConfig, MasterGuru } from '../../types/attendance';
import { formatIndonesianDate } from '../../utils/formatters';

interface ManualAttendanceSheetProps {
  date: string;
  config: InstitutionConfig;
  teachers: MasterGuru[];
}

export const ManualAttendanceSheet: React.FC<ManualAttendanceSheetProps> = ({ date, config, teachers }) => {
  const institutionName = (config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();
  
  return (
    <div id="manual-attendance-print-sheet" className="hidden print:block p-8 bg-white text-slate-900">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
        <h1 className="text-xl font-bold">{institutionName}</h1>
        <h2 className="text-lg font-semibold">LEMBAR PRESENSI GURU PIKET</h2>
        <p className="text-sm mt-1">Tanggal: {formatIndonesianDate(date, true)}</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-slate-900 text-[10px]">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-900 px-2 py-2">No</th>
            <th className="border border-slate-900 px-2 py-2">Nama Guru</th>
            <th className="border border-slate-900 px-2 py-2">Hadir</th>
            <th className="border border-slate-900 px-2 py-2">Izin</th>
            <th className="border border-slate-900 px-2 py-2">Sakit</th>
            <th className="border border-slate-900 px-2 py-2">Alpa</th>
            <th className="border border-slate-900 px-2 py-2 w-40">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher, index) => (
            <tr key={teacher.kode}>
              <td className="border border-slate-900 px-2 py-2 text-center">{index + 1}</td>
              <td className="border border-slate-900 px-2 py-2">{teacher.nama}</td>
              <td className="border border-slate-900 px-2 py-2 text-center"></td>
              <td className="border border-slate-900 px-2 py-2 text-center"></td>
              <td className="border border-slate-900 px-2 py-2 text-center"></td>
              <td className="border border-slate-900 px-2 py-2 text-center"></td>
              <td className="border border-slate-900 px-2 py-2"></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-8 flex justify-end">
        <div className="text-center w-48">
          <p className="text-xs mb-16">Petugas Piket</p>
          <p className="text-xs font-bold border-t border-slate-900 pt-2">( .............................. )</p>
        </div>
      </div>
    </div>
  );
};
