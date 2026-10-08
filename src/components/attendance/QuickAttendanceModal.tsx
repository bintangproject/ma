import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AttendanceRecord, AttendanceStatus, Teacher } from '../../types/attendance';
import { KELAS_OPTIONS, MAPEL_OPTIONS, JAM_KE_OPTIONS } from '../../data/defaultData';
import { PlusCircle, Save, UserCheck } from 'lucide-react';

interface QuickAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: AttendanceRecord) => void;
  teachers: Teacher[];
  editingRecord: AttendanceRecord | null;
}

export const QuickAttendanceModal: React.FC<QuickAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teachers,
  editingRecord,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<{
    id?: string;
    tanggal: string;
    namaGuru: string;
    nip: string;
    mataPelajaran: string;
    kelas: string;
    jamKe: string;
    status: AttendanceStatus;
    keterangan: string;
  }>({
    tanggal: todayStr,
    namaGuru: '',
    nip: '',
    mataPelajaran: MAPEL_OPTIONS[0],
    kelas: KELAS_OPTIONS[0],
    jamKe: JAM_KE_OPTIONS[0],
    status: 'HADIR',
    keterangan: '',
  });

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        id: editingRecord.id,
        tanggal: editingRecord.tanggal,
        namaGuru: editingRecord.namaGuru,
        nip: editingRecord.nip || '',
        mataPelajaran: editingRecord.mataPelajaran,
        kelas: editingRecord.kelas,
        jamKe: editingRecord.jamKe,
        status: editingRecord.status,
        keterangan: editingRecord.keterangan || '',
      });
    } else {
      setFormData({
        tanggal: todayStr,
        namaGuru: teachers[0]?.nama || '',
        nip: teachers[0]?.nip || '',
        mataPelajaran: teachers[0]?.mataPelajaran || MAPEL_OPTIONS[0],
        kelas: KELAS_OPTIONS[0],
        jamKe: JAM_KE_OPTIONS[0],
        status: 'HADIR',
        keterangan: '',
      });
    }
  }, [editingRecord, isOpen, teachers]);

  const handleTeacherChange = (nama: string) => {
    const matched = teachers.find(t => t.nama === nama);
    setFormData(prev => ({
      ...prev,
      namaGuru: nama,
      nip: matched ? matched.nip : prev.nip,
      mataPelajaran: matched ? matched.mataPelajaran : prev.mataPelajaran,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaGuru.trim()) {
      alert('Silakan pilih atau masukkan nama pengajar.');
      return;
    }

    const recordToSave: AttendanceRecord = {
      id: formData.id || `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tanggal: formData.tanggal,
      namaGuru: formData.namaGuru.trim(),
      nip: formData.nip.trim(),
      mataPelajaran: formData.mataPelajaran,
      kelas: formData.kelas,
      jamKe: formData.jamKe,
      status: formData.status,
      keterangan: formData.keterangan.trim(),
      waktuInput: new Date().toISOString(),
    };

    onSave(recordToSave);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? 'Ubah Catatan Kehadiran' : 'Input Presensi Pengajar'}
      subtitle="Catat kehadiran guru piket/KBM MA Darul Lughah Wal Karomah"
      icon={<UserCheck size={20} />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Tanggal & Jam Ke */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal KBM <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jam Ke- <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.jamKe}
              onChange={(e) => setFormData({ ...formData, jamKe: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {JAM_KE_OPTIONS.map((jam) => (
                <option key={jam} value={jam}>
                  {jam}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nama Guru */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Pengajar / Ustadz / Ustadzah <span className="text-rose-500">*</span>
          </label>
          <div className="space-y-2">
            <select
              value={formData.namaGuru}
              onChange={(e) => handleTeacherChange(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">-- Pilih dari Daftar Pengajar --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.nama}>
                  {t.nama} {t.nip ? `(NIP: ${t.nip})` : ''}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Atau ketik nama guru manual jika belum terdaftar..."
              value={formData.namaGuru}
              onChange={(e) => setFormData({ ...formData, namaGuru: e.target.value })}
              className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            />
          </div>
        </div>

        {/* NIP & Mapel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP / NUPTK / Peg.ID
            </label>
            <input
              type="text"
              placeholder="Contoh: 19850920..."
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mata Pelajaran <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.mataPelajaran}
              onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {MAPEL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kelas & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kelas yang Diajar <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.kelas}
              onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {KELAS_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Kehadiran <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AttendanceStatus })}
              className="w-full text-xs px-3 py-2 font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-sky-900"
            >
              <option value="HADIR">Hadir Tepat Waktu</option>
              <option value="TERLAMBAT">Terlambat Datang</option>
              <option value="TUGAS_DINAS">Tugas Dinas / Workshop / MGMP</option>
              <option value="IZIN">Izin (Pribadi / Keluarga)</option>
              <option value="SAKIT">Sakit (Ada Keterangan)</option>
              <option value="ALPA">Alpa (Tanpa Keterangan)</option>
            </select>
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Keterangan / Catatan Piket
          </label>
          <textarea
            rows={2}
            placeholder="Catatan tambahan (misal: sakit flu, materi bab 3, tugas dinas di Kemenag, dll.)"
            value={formData.keterangan}
            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-2xs transition-colors"
          >
            <Save size={14} />
            <span>{editingRecord ? 'Perbarui Data' : 'Simpan Presensi'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
