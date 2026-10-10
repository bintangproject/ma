import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { MasterGuru, DayScheduleMap, InstitutionConfig } from '../../types/attendance';
import { DAFTAR_HARI } from '../../data/defaultData';
import { getIndonesianDayName, formatLocalISODate } from '../../utils/formatters';
import { UserX, CalendarDays, Search, Copy, Check, Users, ShieldAlert, Sparkles } from 'lucide-react';

interface TeachersWithoutScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: MasterGuru[];
  schedules: DayScheduleMap;
  config: InstitutionConfig;
}

export const TeachersWithoutScheduleModal: React.FC<TeachersWithoutScheduleModalProps> = ({
  isOpen,
  onClose,
  teachers,
  schedules,
  config,
}) => {
  const todayDayName = getIndonesianDayName(formatLocalISODate());
  const [selectedHari, setSelectedHari] = useState<string>(
    DAFTAR_HARI.includes(todayDayName) ? todayDayName : 'Sabtu'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Get list of teacher names scheduled on selectedHari
  const scheduledTeacherNamesSet = useMemo(() => {
    const set = new Set<string>();
    const daySchedules = schedules[selectedHari] || [];
    daySchedules.forEach(item => {
      if (item.guruPengampu) {
        set.add(item.guruPengampu.trim().toLowerCase());
      }
    });
    return set;
  }, [schedules, selectedHari]);

  // Teachers who are NOT scheduled on selectedHari
  const freeTeachers = useMemo(() => {
    return teachers.filter(t => {
      const nameLower = t.nama.trim().toLowerCase();
      return !scheduledTeacherNamesSet.has(nameLower);
    });
  }, [teachers, scheduledTeacherNamesSet]);

  // Filtered free teachers by search query
  const filteredFreeTeachers = useMemo(() => {
    if (!searchQuery.trim()) return freeTeachers;
    const q = searchQuery.toLowerCase();
    return freeTeachers.filter(
      t => t.nama.toLowerCase().includes(q) || 
           t.kode.toLowerCase().includes(q) || 
           (t.keterangan && t.keterangan.toLowerCase().includes(q))
    );
  }, [freeTeachers, searchQuery]);

  const handleCopyList = () => {
    const header = `DAFTAR GURU TANPA JAM MENGAJAR / NGANTOR\n${config.NAMA_LEMBAGA || 'MA Darul Lughah Wal Karomah'}\nHari: ${selectedHari.toUpperCase()}\nTotal: ${filteredFreeTeachers.length} Guru\n--------------------------------------------\n`;
    const rows = filteredFreeTeachers.map((t, idx) => `${idx + 1}. [${t.kode}] ${t.nama}${t.keterangan ? ` (${t.keterangan})` : ''}`).join('\n');
    const text = header + rows;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daftar Guru Tanpa Jam Mengajar (Hari Tertentu)"
      maxWidth="4xl"
    >
      <div className="space-y-5">
        
        {/* Info Banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-900 flex items-start gap-3">
          <div className="p-2 bg-sky-600 text-white rounded-lg shrink-0 mt-0.5">
            <UserX size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sky-950 text-sm mb-0.5">Informasi Ketersediaan Pengajar</h4>
            <p className="text-sky-800 leading-relaxed">
              Daftar di bawah ini membandingkan <strong>Daftar Keseluruhan Pengajar ({teachers.length} guru)</strong> dengan jadwal KBM yang tercatat pada hari <strong>{selectedHari}</strong>. Guru yang tercantum di sini tidak memiliki jadwal mengajar tatap muka pada hari tersebut.
            </p>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Pilih Hari Pengamatan:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {DAFTAR_HARI.map(day => {
              const countScheduled = (schedules[day] || []).reduce((acc, curr) => {
                if (curr.guruPengampu) acc.add(curr.guruPengampu.trim().toLowerCase());
                return acc;
              }, new Set()).size;
              const countFree = teachers.length - countScheduled;

              const isSelected = selectedHari === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedHari(day)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-extrabold">{day}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                    {Math.max(0, countFree)} Libur / Tanpa Jam
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls Bar: Search & Copy */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama guru atau jabatan..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-600">
              Total: <strong className="text-sky-700">{filteredFreeTeachers.length}</strong> guru
            </span>
            <button
              type="button"
              onClick={handleCopyList}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-2xs"
              title="Salin daftar guru tanpa jam ke clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Berhasil Disalin!' : 'Salin Daftar'}</span>
            </button>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs max-h-[380px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider sticky top-0 z-10 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 w-20 text-center">Kode</th>
                <th className="py-2.5 px-3">Nama Pengajar & Gelar</th>
                <th className="py-2.5 px-3">Status / Keterangan</th>
                <th className="py-2.5 px-3 text-right">Status Hari {selectedHari}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFreeTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                    {searchQuery ? 'Tidak ditemukan guru yang sesuai dengan pencarian.' : `Semua guru (${teachers.length} pengajar) memiliki jadwal mengajar pada hari ${selectedHari}.`}
                  </td>
                </tr>
              ) : (
                filteredFreeTeachers.map((t, idx) => (
                  <tr key={t.kode || idx} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-800">{t.kode}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{t.nama}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {t.keterangan || 'Guru Pengampu'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Tidak Ada Jam KBM
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Total Keseluruhan Pengajar: <strong>{teachers.length} guru</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </Modal>
  );
};
