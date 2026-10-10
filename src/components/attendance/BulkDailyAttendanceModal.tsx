import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { 
  AttendanceRecord, 
  AttendanceStatus, 
  DayScheduleMap, 
  MasterGuru, 
  MasterMapel 
} from '../../types/attendance';
import { getIndonesianDayName, formatIndonesianDate, STATUS_CONFIG, formatLocalISODate } from '../../utils/formatters';
import { DAFTAR_HARI, KELAS_OPTIONS } from '../../data/defaultData';
import { 
  CheckCircle2, 
  Save, 
  Calendar, 
  Filter, 
  Plus, 
  CheckCheck, 
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface BulkDailyAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDay: (tanggal: string, records: AttendanceRecord[]) => void;
  existingRecords: AttendanceRecord[];
  schedules: DayScheduleMap;
  teachers: MasterGuru[];
  subjects: MasterMapel[];
}

export interface DayAttendanceItem {
  id: string;
  jam: number | string;
  kelas: string;
  mataPelajaran: string;
  namaGuru: string;
  status: AttendanceStatus;
  keterangan: string;
}

export const BulkDailyAttendanceModal: React.FC<BulkDailyAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSaveDay,
  existingRecords,
  schedules,
  teachers,
  subjects,
}) => {
  const todayStr = formatLocalISODate();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHari, setSelectedHari] = useState(getIndonesianDayName(todayStr));
  const [items, setItems] = useState<DayAttendanceItem[]>([]);
  const [filterKelas, setFilterKelas] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [mobileMode, setMobileMode] = useState<'cards' | 'table'>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'cards'
  );

  // New custom session state
  const [customKelas, setCustomKelas] = useState(KELAS_OPTIONS[0]);
  const [customJam, setCustomJam] = useState(1);
  const [customMapel, setCustomMapel] = useState(subjects[0]?.nama || "AL-QUR'AN HADITS");
  const [customGuru, setCustomGuru] = useState(teachers[0]?.nama || '');

  // When date changes, update detected day and initialize rows
  useEffect(() => {
    if (!isOpen) return;

    const detectedDay = getIndonesianDayName(selectedDate);
    const dayToUse = DAFTAR_HARI.includes(detectedDay) ? detectedDay : 'Sabtu';
    setSelectedHari(dayToUse);

    // Check if records already exist for this date
    const forThisDate = existingRecords.filter(r => r.tanggal === selectedDate);
    if (forThisDate.length > 0) {
      // Load saved state
      setItems(forThisDate.map(r => ({
        id: r.id,
        jam: r.jam,
        kelas: r.kelas,
        mataPelajaran: r.mataPelajaran,
        namaGuru: r.namaGuru,
        status: r.status,
        keterangan: r.keterangan || '',
      })));
    } else {
      // Load from schedule for dayToUse, ALL defaulted to HADIR
      const daySchedule = schedules[dayToUse] || schedules.Sabtu || [];
      const initialized = daySchedule.map((s, idx) => ({
        id: `draft-${selectedDate}-${s.kelas}-${s.jam}-${idx}`,
        jam: s.jam,
        kelas: s.kelas,
        mataPelajaran: s.mataPelajaran,
        namaGuru: s.guruPengampu,
        status: 'HADIR' as AttendanceStatus,
        keterangan: '',
      }));
      setItems(initialized);
    }
  }, [selectedDate, isOpen]);

  // When admin manually switches schedule day
  const handleHariChange = (newHari: string) => {
    setSelectedHari(newHari);
    const daySchedule = schedules[newHari] || schedules.Sabtu || [];
    const initialized = daySchedule.map((s, idx) => ({
      id: `draft-${selectedDate}-${s.kelas}-${s.jam}-${idx}`,
      jam: s.jam,
      kelas: s.kelas,
      mataPelajaran: s.mataPelajaran,
      namaGuru: s.guruPengampu,
      status: 'HADIR' as AttendanceStatus,
      keterangan: '',
    }));
    setItems(initialized);
  };

  // Set all to Hadir
  const handleSetAllHadir = () => {
    setItems(prev => prev.map(item => ({ ...item, status: 'HADIR' })));
  };

  // Update single item status
  const handleUpdateStatus = (id: string, status: AttendanceStatus) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  // Update single item keterangan
  const handleUpdateKeterangan = (id: string, keterangan: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, keterangan } : item));
  };

  // Add custom session
  const handleAddCustomSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGuru) return;
    const newItem: DayAttendanceItem = {
      id: `manual-${Date.now()}`,
      jam: customJam,
      kelas: customKelas,
      mataPelajaran: customMapel,
      namaGuru: customGuru,
      status: 'HADIR',
      keterangan: 'Jadwal Tambahan / Inval',
    };
    setItems(prev => [...prev, newItem]);
    setShowAddCustom(false);
  };

  // Save all items
  const handleSave = () => {
    if (items.length === 0) {
      alert('Tidak ada data kehadiran yang akan disimpan.');
      return;
    }

    const recordsToSave: AttendanceRecord[] = items.map((it, idx) => ({
      id: it.id.startsWith('draft-') ? `rec-${selectedDate}-${idx + 1}` : it.id,
      tanggal: selectedDate,
      hari: selectedHari,
      kelas: it.kelas,
      jam: it.jam,
      mataPelajaran: it.mataPelajaran,
      namaGuru: it.namaGuru,
      status: it.status,
      keterangan: it.keterangan,
      waktuInput: new Date().toISOString(),
    }));

    onSaveDay(selectedDate, recordsToSave);
    onClose();
  };

  // Filter items by class if selected
  const displayedItems = filterKelas 
    ? items.filter(it => it.kelas === filterKelas)
    : items;

  // Stats
  const countHadir = items.filter(it => it.status === 'HADIR').length;
  const countBerhalangan = items.length - countHadir;

  const uniqueClassesInItems = Array.from(new Set(items.map(it => it.kelas)));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Presensi Harian Pengajar"
      subtitle="Semua jadwal otomatis terset HADIR. Ubah status hanya bagi pengajar yang berhalangan."
      icon={<CheckCheck size={20} className="text-sky-600" />}
      maxWidth="5xl"
    >
      <div className="space-y-4">
        
        {/* Top Control Bar */}
        <div className="bg-sky-50/70 border border-sky-100 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Date & Day Pickers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <Calendar size={14} className="text-sky-600" />
              <span className="font-semibold text-slate-600">Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold text-slate-800 outline-none cursor-pointer text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="font-semibold text-slate-600">Jadwal Hari:</span>
              <select
                value={selectedHari}
                onChange={(e) => handleHariChange(e.target.value)}
                className="font-bold text-sky-800 outline-none cursor-pointer text-xs"
              >
                {DAFTAR_HARI.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter & Bulk Action */}
          <div className="flex items-center gap-2">
            {/* Filter Kelas */}
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg text-slate-700"
            >
              <option value="">Semua Kelas ({uniqueClassesInItems.length})</option>
              {uniqueClassesInItems.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>

            {/* Set Semua Hadir */}
            <button
              type="button"
              onClick={handleSetAllHadir}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold rounded-lg transition-colors shadow-2xs"
              title="Reset seluruh sesi menjadi Hadir"
            >
              <Sparkles size={13} />
              <span>Set Semua Hadir</span>
            </button>
          </div>

        </div>

        {/* Status Metrics Strip & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500">
              Total Sesi KBM: <strong className="text-slate-800">{items.length} sesi</strong>
            </span>
            <span className="text-emerald-700 font-medium">
              • Hadir: <strong>{countHadir}</strong>
            </span>
            {countBerhalangan > 0 ? (
              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Berhalangan: <strong>{countBerhalangan} sesi</strong>
              </span>
            ) : (
              <span className="text-emerald-600 text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                Semua tercentang hadir
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setMobileMode('table')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  mobileMode === 'table' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Tabel Geser
              </button>
              <button
                type="button"
                onClick={() => setMobileMode('cards')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                  mobileMode === 'cards' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Kartu HP
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="text-sky-700 hover:text-sky-900 font-semibold text-xs flex items-center gap-1 hover:underline"
            >
              <Plus size={13} />
              <span>Tambah Sesi</span>
            </button>
          </div>
        </div>

        {/* Collapsible Form for Custom / Extra Session */}
        {showAddCustom && (
          <form onSubmit={handleAddCustomSession} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3 text-xs animate-in fade-in duration-150">
            <h5 className="font-bold text-slate-800">Tambah Jadwal Tambahan / Guru Pengganti (Inval):</h5>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Kelas</label>
                <select
                  value={customKelas}
                  onChange={(e) => setCustomKelas(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-1.5 rounded"
                >
                  {KELAS_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Jam Ke-</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={customJam}
                  onChange={(e) => setCustomJam(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 p-1.5 rounded"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Mata Pelajaran</label>
                <select
                  value={customMapel}
                  onChange={(e) => setCustomMapel(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-1.5 rounded"
                >
                  {subjects.map(s => <option key={s.kode} value={s.nama}>{s.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Guru Pengampu</label>
                <select
                  value={customGuru}
                  onChange={(e) => setCustomGuru(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-1.5 rounded"
                >
                  {teachers.map(t => <option key={t.kode} value={t.nama}>{t.nama}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="px-3 py-1 text-slate-500 hover:bg-slate-200 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded"
              >
                Tambahkan ke Daftar
              </button>
            </div>
          </form>
        )}

        {/* Mobile Swipe Hint for Table View */}
        {mobileMode === 'table' && (
          <div className="sm:hidden flex items-center justify-between px-3 py-1.5 bg-sky-50 text-sky-800 text-[11px] rounded-lg border border-sky-200">
            <span>👉 <strong>Geser tabel ke samping</strong> untuk memilih Hadir / Sakit / Izin</span>
            <button
              type="button"
              onClick={() => setMobileMode('cards')}
              className="text-sky-900 underline font-bold"
            >
              Mode Kartu
            </button>
          </div>
        )}

        {/* View 1: Card View for Mobile Phones */}
        {mobileMode === 'cards' ? (
          <div className="max-h-[58vh] overflow-y-auto space-y-3 pr-1">
            {displayedItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada jadwal yang terdaftar untuk hari {selectedHari}.
              </div>
            ) : (
              displayedItems.map((item) => {
                const isHadir = item.status === 'HADIR';
                return (
                  <div 
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all ${
                      !isHadir ? 'bg-amber-50/50 border-amber-300' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          Jam {item.jam}
                        </span>
                        <span className="font-bold text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                          Kelas {item.kelas}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'IZIN' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'SAKIT' ? 'bg-amber-100 text-amber-800' :
                        item.status === 'ALPA' ? 'bg-rose-100 text-rose-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {STATUS_CONFIG[item.status]?.label || item.status}
                      </span>
                    </div>

                    <div className="mb-2.5">
                      <div className="font-bold text-slate-900 text-sm">{item.namaGuru}</div>
                      <div className="text-xs text-slate-500 font-medium">{item.mataPelajaran}</div>
                    </div>

                    {/* Touch Buttons */}
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      {(['HADIR', 'IZIN', 'SAKIT', 'ALPA', 'TUGAS_DINAS'] as AttendanceStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, st)}
                          className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all text-center ${
                            item.status === st
                              ? st === 'HADIR' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' :
                                st === 'IZIN' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' :
                                st === 'SAKIT' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' :
                                st === 'ALPA' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' :
                                'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'TUGAS_DINAS' ? 'Dinas' : STATUS_CONFIG[st].label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder={isHadir ? 'Catatan (opsional)...' : 'Tulis keterangan berhalangan...'}
                      value={item.keterangan}
                      onChange={(e) => handleUpdateKeterangan(item.id, e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-sky-500 outline-none"
                    />
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* View 2: Horizontal Scrollable Table */
          <div className="border border-slate-200 rounded-xl max-h-[55vh] overflow-y-auto overflow-x-auto touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full min-w-[720px] text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center w-14">Jam</th>
                  <th className="py-2.5 px-3 w-20">Kelas</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Mata Pelajaran & Guru Pengampu</th>
                  <th className="py-2.5 px-3 text-center w-72">Status Kehadiran</th>
                  <th className="py-2.5 px-3 min-w-[160px]">Keterangan</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Tidak ada jadwal yang terdaftar untuk hari {selectedHari}.
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((item) => {
                    const isHadir = item.status === 'HADIR';
                    return (
                      <tr 
                        key={item.id}
                        className={`transition-colors ${
                          !isHadir ? 'bg-amber-50/40' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Jam */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">
                            Jam {item.jam}
                          </span>
                        </td>

                        {/* Kelas */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-sky-950 bg-sky-100/70 text-sky-800 px-2 py-0.5 rounded text-[11px]">
                            {item.kelas}
                          </span>
                        </td>

                        {/* Mapel & Guru */}
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800 leading-tight">
                            {item.namaGuru}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.mataPelajaran}
                          </div>
                        </td>

                        {/* Status Selector Segmented Buttons */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-0.5">
                            
                            {/* HADIR */}
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, 'HADIR')}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                item.status === 'HADIR'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              Hadir
                            </button>

                            {/* IZIN */}
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, 'IZIN')}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                item.status === 'IZIN'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                              }`}
                            >
                              Izin
                            </button>

                            {/* SAKIT */}
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, 'SAKIT')}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                item.status === 'SAKIT'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                              }`}
                            >
                              Sakit
                            </button>

                            {/* ALPA */}
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, 'ALPA')}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                item.status === 'ALPA'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              Alpa
                            </button>

                            {/* TUGAS DINAS */}
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, 'TUGAS_DINAS')}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                item.status === 'TUGAS_DINAS'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'
                              }`}
                            >
                              Dinas
                            </button>

                          </div>
                        </td>

                        {/* Keterangan */}
                        <td className="py-2.5 px-3 min-w-[160px]">
                          <input
                            type="text"
                            placeholder={isHadir ? 'Catatan (opsional)' : 'Keterangan berhalangan...'}
                            value={item.keterangan}
                            onChange={(e) => handleUpdateKeterangan(item.id, e.target.value)}
                            className={`w-full text-xs px-2.5 py-1 rounded border outline-none transition-colors ${
                              !isHadir
                                ? 'border-amber-300 bg-amber-50/30 focus:border-amber-500 focus:bg-white font-medium text-slate-800'
                                : 'border-slate-200 bg-slate-50/50 focus:border-sky-500 focus:bg-white text-slate-600'
                            }`}
                          />
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Menyimpan presensi untuk: <strong className="text-slate-800">{formatIndonesianDate(selectedDate)}</strong> ({items.length} sesi)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-md transition-all"
            >
              <Save size={15} />
              <span>Simpan Daftar Hadir Hari Ini</span>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
