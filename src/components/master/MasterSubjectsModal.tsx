import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { MasterMapel } from '../../types/attendance';
import { BookOpen, Search, FileSpreadsheet } from 'lucide-react';

interface MasterSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: MasterMapel[];
}

export const MasterSubjectsModal: React.FC<MasterSubjectsModalProps> = ({
  isOpen,
  onClose,
  subjects,
}) => {
  const [search, setSearch] = useState('');

  const filtered = subjects.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    String(s.kode).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Master Mata Pelajaran (View Only)"
      subtitle="Data tersinkronisasi otomatis dari sheet Master_Mapel di Google Spreadsheet"
      icon={<BookOpen size={20} className="text-sky-600" />}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        
        {/* Info Banner: View Only from Spreadsheet */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-950">
          <FileSpreadsheet size={20} className="text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Mode Lihat Saja (Tersentralisasi di Spreadsheet):</span>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Daftar mata pelajaran dan kurikulum disetting langsung melalui sheet <strong>Master_Mapel</strong> di Google Spreadsheet Anda.
            </p>
          </div>
        </div>

        {/* Top Search & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mata pelajaran atau kode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="text-xs">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200">
              Total Mapel: <strong>{subjects.length}</strong>
            </span>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="border border-slate-200 rounded-xl max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3 text-center w-24">Kode</th>
                <th className="py-2.5 px-3">Nama Mata Pelajaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    Tidak ditemukan mata pelajaran yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={String(s.kode) + idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-700">
                      <span className="bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {s.kode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {s.nama}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Menampilkan {filtered.length} dari {subjects.length} mata pelajaran</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </Modal>
  );
};
