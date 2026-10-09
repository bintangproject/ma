import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { MasterGuru } from '../../types/attendance';
import { Users, Search, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

interface MasterTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: MasterGuru[];
  onSaveTeachers: (teachers: MasterGuru[]) => void;
}

export const MasterTeachersModal: React.FC<MasterTeachersModalProps> = ({
  isOpen,
  onClose,
  teachers,
  onSaveTeachers,
}) => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');

  const [editingKode, setEditingKode] = useState<string | null>(null);
  const [editNama, setEditNama] = useState('');

  const filtered = teachers.filter(t =>
    t.nama.toLowerCase().includes(search.toLowerCase()) ||
    t.kode.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim()) return;
    const kode = newKode.trim().toUpperCase() || `G${teachers.length + 1}`;
    if (teachers.some(t => t.kode === kode)) {
      alert(`Kode guru "${kode}" sudah digunakan.`);
      return;
    }
    const updated = [...teachers, { kode, nama: newNama.trim() }];
    onSaveTeachers(updated);
    setNewKode('');
    setNewNama('');
    setIsAdding(false);
  };

  const handleStartEdit = (t: MasterGuru) => {
    setEditingKode(t.kode);
    setEditNama(t.nama);
  };

  const handleSaveEdit = (kode: string) => {
    if (!editNama.trim()) return;
    const updated = teachers.map(t => t.kode === kode ? { ...t, nama: editNama.trim() } : t);
    onSaveTeachers(updated);
    setEditingKode(null);
  };

  const handleDelete = (kode: string) => {
    if (confirm(`Hapus pengajar dengan kode "${kode}"?`)) {
      const updated = teachers.filter(t => t.kode !== kode);
      onSaveTeachers(updated);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Master Data Pengajar / Guru"
      subtitle="Kelola daftar dewan guru dan kode inisial pengajar MA Darul Lughah Wal Karomah"
      icon={<Users size={20} className="text-sky-600" />}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari guru berdasarkan nama atau kode..."
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
            <span>Tambah Guru Baru</span>
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleAdd} className="bg-sky-50/70 border border-sky-200 p-3.5 rounded-xl space-y-3 animate-in fade-in">
            <h5 className="font-bold text-xs text-sky-900">Tambah Guru Baru:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Kode / Inisial</label>
                <input
                  type="text"
                  placeholder="Contoh: EA"
                  value={newKode}
                  onChange={(e) => setNewKode(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Contoh: Ust. Edi Amin, M.Hum."
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
                Simpan Guru
              </button>
            </div>
          </form>
        )}

        {/* Teachers Table */}
        <div className="border border-slate-200 rounded-xl max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3 w-28">Kode Guru</th>
                <th className="py-2.5 px-3">Nama Lengkap</th>
                <th className="py-2.5 px-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Tidak ada pengajar yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={t.kode} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {t.kode}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {editingKode === t.kode ? (
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
                            onClick={() => handleSaveEdit(t.kode)}
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
                        <span className="font-bold text-slate-900">{t.nama}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(t)}
                          className="p-1 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded"
                          title="Edit Nama"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.kode)}
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
          <span>Total Pengajar Terdaftar: <strong>{teachers.length} orang</strong></span>
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
