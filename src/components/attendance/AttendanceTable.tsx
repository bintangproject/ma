import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import { StatusBadge } from '../common/Badge';
import { formatIndonesianShortDate, formatIndonesianDate } from '../../utils/formatters';
import { Trash2, Edit3, ArrowUpDown, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: AttendanceRecord) => void;
  onQuickChangeStatus?: (id: string, newStatus: AttendanceStatus) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  onDeleteRecord,
  onEditRecord,
  onQuickChangeStatus,
}) => {
  const [sortField, setSortField] = useState<'tanggal' | 'namaGuru'>('tanggal');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const sortedRecords = [...records].sort((a, b) => {
    if (sortField === 'tanggal') {
      const cmp = a.tanggal.localeCompare(b.tanggal);
      return sortAsc ? cmp : -cmp;
    } else {
      const cmp = a.namaGuru.localeCompare(b.namaGuru);
      return sortAsc ? cmp : -cmp;
    }
  });

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage) || 1;
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'tanggal' | 'namaGuru') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-sky-100 shadow-2xs overflow-hidden">
      
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-sky-50 via-sky-50/50 to-slate-50 border-b border-sky-100 text-slate-700 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5 text-center w-12">No</th>
              <th 
                className="py-3 px-3.5 cursor-pointer hover:bg-sky-100/50 transition-colors"
                onClick={() => toggleSort('tanggal')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Tanggal</span>
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-3.5 cursor-pointer hover:bg-sky-100/50 transition-colors"
                onClick={() => toggleSort('namaGuru')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Nama Guru & NIP</span>
                  <ArrowUpDown size={12} className="text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3.5">Mata Pelajaran & Kelas</th>
              <th className="py-3 px-3.5 text-center">Jam Ke-</th>
              <th className="py-3 px-3.5 text-center">Status</th>
              <th className="py-3 px-3.5">Keterangan</th>
              <th className="py-3 px-3.5 text-center w-20 no-print">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen size={32} className="text-slate-300 stroke-1" />
                    <p className="text-sm font-medium text-slate-600">Tidak ada data presensi yang sesuai filter</p>
                    <p className="text-xs text-slate-400">Ubah rentang tanggal atau bersihkan penyaringan pencarian</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r, idx) => {
                const itemIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr 
                    key={r.id} 
                    className="hover:bg-sky-50/40 transition-colors group"
                  >
                    {/* 1. No */}
                    <td className="py-3 px-3.5 text-center text-slate-400 font-medium">
                      {itemIndex}
                    </td>

                    {/* 2. Tanggal */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        {formatIndonesianShortDate(r.tanggal)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatIndonesianDate(r.tanggal).split(',')[0]}
                      </div>
                    </td>

                    {/* 3. Guru & NIP */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 leading-snug">
                        {r.namaGuru}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        NIP: {r.nip || '-'}
                      </div>
                    </td>

                    {/* 4. Mapel & Kelas */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-sky-900">
                        {r.mataPelajaran}
                      </div>
                      <div className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {r.kelas}
                      </div>
                    </td>

                    {/* 5. Jam Ke */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span className="font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-[11px]">
                        {r.jamKe || '-'}
                      </span>
                    </td>

                    {/* 6. Status */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <StatusBadge status={r.status} />
                    </td>

                    {/* 7. Keterangan */}
                    <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate" title={r.keterangan}>
                      {r.keterangan || <span className="text-slate-300 italic">-</span>}
                    </td>

                    {/* 8. Aksi */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap no-print">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEditRecord(r)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="Ubah data"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus catatan kehadiran ${r.namaGuru} pada tanggal ${r.tanggal}?`)) {
                              onDeleteRecord(r.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus data"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 no-print">
          <div>
            Halaman <span className="font-bold text-slate-700">{currentPage}</span> dari {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
