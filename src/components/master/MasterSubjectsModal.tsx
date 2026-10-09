import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { MasterMapel } from '../../types/attendance';
import { BookOpen, Search, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

interface MasterSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: MasterMapel[];
  onSaveSubjects: (subjects: MasterMapel[]) => void;
}

export const MasterSubjectsModal: React.FC<MasterSubjectsModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onSaveSubjects,
}) => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');

  const [editingKode, setEditingKode] = useState<string | number | null>(null);
  const [editNama, setEditNama] = useState('');

  const filtered = subjects.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    String(s.kode).toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim()) return;
    const kode = newKode.trim() || String(subjects.length + 1);
    const updated = [...subjects, { kode, nama: newNama.trim().toUpperCase() }];
    onSaveSubjects(updated);
    setNewKode('');
    setNewNama('');
    setIsAdding(false);
  };

  const handleStartEdit = (s: MasterMapel) => {
    setEditingKode(s.kode);
    setEditNama(s.nama);
  };

  const handleSaveEdit = (kode: string | number) => {
    if (!editNama.trim()) return;
    const updated = subjects.map(s => s.kode === kode ? { ...s, nama: editNama.trim().toUpperCase() } : s);
    onSaveSubjects(updated);
    setEditingKode(null);
  };

  const handleDelete = (kode: string | number) => {
    if (confirm(`Hapus mata pelajaran ini?`)) {
      const updated = subjects.filter(s => s.kode !== kode);
      onSaveSubjects(updated);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Master Mata Pelajaran (Mapel)"
      subtitle="Kelola daftar mata pelajaran kurikulum MA Darul Lughah Wal Karomah"
      icon={<BookOpen size={20} className="text-sky-600" />}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mata pelajaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Tambah Mapel Baru</span>
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="bg-sky-50/70 border border-sky-200 p-3.5 rounded-xl space-y-3 animate-in fade-in">
            <h5 className="font-bold text-xs text-sky-900">Tambah Mata Pelajaran Baru:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Kode / No</label>
                <input
                  type="text"
                  placeholder="Contoh: 1, 2, dll."
                  value={newKode}
                  onChange={(e) => setNewKode(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  placeholder="Contoh: BAHASA ARAB / FIQIH"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-sky-600 text-white font-bold rounded shadow-2xs"
              >
                Simpan Mapel
              </button>
            </div>
          </form>
        )}

        {/* Subjects Table */}
        <div className="border border-slate-200 rounded-xl max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3 w-28">Kode Mapel</th>
                <th className="py-2.5 px-3">Nama Mata Pelajaran</th>
                <th className="py-2.5 px-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Tidak ada mata pelajaran yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={s.kode} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {s.kode}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {editingKode === s.kode ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            className="flex-1 text-xs px-2 py-1 border border-sky-400 rounded outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(s.kode)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Simpan"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingKode(null)}
                            className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                            title="Batal"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-900">{s.nama}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(s)}
                          className="p-1 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded"
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.kode)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Total Mapel Terdaftar: <strong>{subjects.length} mapel</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Selesai
          </button>
        </div>

      </div>
    </Modal>
  );
};
