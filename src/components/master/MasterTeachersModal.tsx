import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { MasterGuru } from '../../types/attendance';
import { Users, Search, FileSpreadsheet, Shield, GraduationCap, CheckCircle } from 'lucide-react';

interface MasterTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: MasterGuru[];
}

export const MasterTeachersModal: React.FC<MasterTeachersModalProps> = ({
  isOpen,
  onClose,
  teachers,
}) => {
  const [search, setSearch] = useState('');

  const filtered = teachers.filter(t =>
    t.nama.toLowerCase().includes(search.toLowerCase()) ||
    t.kode.toLowerCase().includes(search.toLowerCase()) ||
    (t.keterangan && t.keterangan.toLowerCase().includes(search.toLowerCase()))
  );

  const strukturalCount = teachers.filter(t => {
    if (!t.keterangan) return false;
    const k = t.keterangan.trim().toLowerCase();
    return k !== '' && k !== 'guru' && k !== 'guru pengampu' && k !== 'pengajar';
  }).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Dewan Guru & Struktural (View Only)"
      subtitle="Data tersinkronisasi secara otomatis dari sheet Master_Guru di Google Spreadsheet"
      icon={<Users size={20} className="text-sky-600" />}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        
        {/* Info Banner: View Only from Spreadsheet */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-950">
          <FileSpreadsheet size={20} className="text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Mode Lihat Saja (Tersentralisasi di Spreadsheet):</span>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Daftar dewan guru, kode inisial, dan keterangan jabatan struktural disetting langsung di Google Spreadsheet pada sheet <strong>Master_Guru</strong>. Hal ini memastikan data tetap terpusat dan aman.
            </p>
          </div>
        </div>

        {/* Top Search & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, kode inisial, atau jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200">
              Total Guru: <strong>{teachers.length}</strong>
            </span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded-lg border border-purple-200">
              Struktural: <strong>{strukturalCount}</strong>
            </span>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="border border-slate-200 rounded-xl max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3 text-center w-20">Kode</th>
                <th className="py-2.5 px-3">Nama Lengkap & Gelar</th>
                <th className="py-2.5 px-3 w-48">Keterangan / Jabatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data guru yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => {
                  const isStruktural = t.keterangan && 
                    t.keterangan.trim().toLowerCase() !== 'guru' && 
                    t.keterangan.trim().toLowerCase() !== 'guru pengampu' && 
                    t.keterangan.trim().toLowerCase() !== 'pengajar';

                  return (
                    <tr key={t.kode + idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-sky-700">
                        <span className="bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {t.kode}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {t.nama}
                      </td>
                      <td className="py-2 px-3">
                        {isStruktural ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                            <Shield size={11} className="text-purple-600" />
                            <span>{t.keterangan}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-600 bg-slate-50 border border-slate-200">
                            <GraduationCap size={11} className="text-slate-400" />
                            <span>{t.keterangan || 'Guru Pengampu'}</span>
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

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Menampilkan {filtered.length} dari {teachers.length} guru</span>
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
