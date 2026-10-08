import React, { useState } from 'react';
import { TeacherSummary } from '../../types/attendance';
import { UserCheck, AlertTriangle } from 'lucide-react';

interface TeacherSummaryTableProps {
  summaries: TeacherSummary[];
  onSelectTeacherForFilter?: (teacherName: string) => void;
}

export const TeacherSummaryTable: React.FC<TeacherSummaryTableProps> = ({
  summaries,
  onSelectTeacherForFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = summaries.filter(s =>
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.kodeGuru && s.kodeGuru.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl border border-sky-100 shadow-2xs overflow-hidden">
      
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-sky-50/70 to-slate-50 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <UserCheck size={16} className="text-sky-600" />
            <span>Rekapitulasi Kehadiran Akumulasi Per Pengajar</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar persentase kehadiran dan jumlah jam KBM guru pada periode terpilih
          </p>
        </div>

        <input
          type="text"
          placeholder="Cari nama guru..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 w-full sm:w-56"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3.5 text-center w-12">No</th>
              <th className="py-2.5 px-3.5">Nama Guru</th>
              <th className="py-2.5 px-2.5 text-center font-bold">Total Sesi</th>
              <th className="py-2.5 px-2.5 text-center text-emerald-700 bg-emerald-50/50">H (Hadir)</th>
              <th className="py-2.5 px-2.5 text-center text-blue-700 bg-blue-50/50">I (Izin)</th>
              <th className="py-2.5 px-2.5 text-center text-amber-700 bg-amber-50/50">S (Sakit)</th>
              <th className="py-2.5 px-2.5 text-center text-rose-700 bg-rose-50/50">A (Alpa)</th>
              <th className="py-2.5 px-2.5 text-center text-indigo-700">TD (Dinas)</th>
              <th className="py-2.5 px-3.5 text-center font-bold">Persentase</th>
              <th className="py-2.5 px-3.5 text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  Tidak ada guru yang ditemukan pada periode ini.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const isHigh = item.persentaseKehadiran >= 90;
                const isMedium = item.persentaseKehadiran >= 75 && item.persentaseKehadiran < 90;
                
                return (
                  <tr 
                    key={item.nama}
                    className="hover:bg-sky-50/30 transition-colors"
                  >
                    <td className="py-2.5 px-3.5 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <button
                        type="button"
                        onClick={() => onSelectTeacherForFilter?.(item.nama)}
                        className="font-bold text-slate-900 hover:text-sky-700 text-left transition-colors"
                        title="Klik untuk filter riwayat guru ini"
                      >
                        {item.nama}
                      </button>
                    </td>

                    <td className="py-2.5 px-2.5 text-center font-bold text-slate-800">
                      {item.totalSesi}
                    </td>

                    <td className="py-2.5 px-2.5 text-center font-bold text-emerald-700 bg-emerald-50/20">
                      {item.hadir}
                    </td>

                    <td className="py-2.5 px-2.5 text-center font-semibold text-blue-700 bg-blue-50/20">
                      {item.izin || '-'}
                    </td>

                    <td className="py-2.5 px-2.5 text-center font-semibold text-amber-700 bg-amber-50/20">
                      {item.sakit || '-'}
                    </td>

                    <td className="py-2.5 px-2.5 text-center font-bold text-rose-600 bg-rose-50/20">
                      {item.alpa > 0 ? (
                        <span className="text-rose-600 font-extrabold">{item.alpa}</span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-2.5 px-2.5 text-center text-indigo-700">
                      {item.tugasDinas || '-'}
                    </td>

                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-black ${
                          isHigh ? 'text-emerald-700' : isMedium ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          {item.persentaseKehadiran}%
                        </span>
                        <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={`h-full rounded-full ${
                              isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.persentaseKehadiran}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5 text-center">
                      {item.alpa > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle size={10} /> Ada Alpa
                        </span>
                      ) : isHigh ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Sangat Disiplin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          Cukup
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span>Keterangan:</span>
          <span><strong>H:</strong> Hadir</span>
          <span><strong>I:</strong> Izin</span>
          <span><strong>S:</strong> Sakit</span>
          <span><strong>A:</strong> Alpa</span>
          <span><strong>TD:</strong> Tugas Dinas</span>
        </div>
        <span>Total Pengajar: {filtered.length} Orang</span>
      </div>

    </div>
  );
};
