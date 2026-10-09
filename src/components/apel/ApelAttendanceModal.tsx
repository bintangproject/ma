import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { 
  ApelAttendanceRecord, 
  ApelStatus, 
  DayScheduleMap, 
  InstitutionConfig, 
  MasterGuru 
} from '../../types/attendance';
import { DEFAULT_STRUKTURAL_MADAR, DAFTAR_HARI } from '../../data/defaultData';
import { getIndonesianDayName, formatIndonesianDate } from '../../utils/formatters';
import { generateWhatsAppApelMessage } from '../../utils/exportUtils';
import { Award, Save, Copy, Check, Share2, Sparkles, Calendar, Clock, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

interface ApelAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: DayScheduleMap;
  existingApelRecords: ApelAttendanceRecord[];
  onSaveApel: (tanggal: string, records: ApelAttendanceRecord[]) => void;
  config: InstitutionConfig;
  teachers: MasterGuru[];
}

export const ApelAttendanceModal: React.FC<ApelAttendanceModalProps> = ({
  isOpen,
  onClose,
  schedules,
  existingApelRecords,
  onSaveApel,
  config,
  teachers,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const detectedHari = getIndonesianDayName(todayStr);
  const [selectedHari, setSelectedHari] = useState(DAFTAR_HARI.includes(detectedHari) ? detectedHari : 'Sabtu');
  const [records, setRecords] = useState<ApelAttendanceRecord[]>([]);
  const [copied, setCopied] = useState(false);

  // Extract Session 1 & 2 teachers for the selected day
  const session1And2Teachers = useMemo(() => {
    const daySchedule = schedules[selectedHari] || [];
    const map = new Map<string, string[]>();

    daySchedule.forEach(item => {
      const j = Number(item.jam);
      if (j === 1 || j === 2) {
        const name = (item.guruPengampu || '').trim();
        if (name) {
          if (!map.has(name)) map.set(name, []);
          map.get(name)!.push(`Jam ${item.jam} di ${item.kelas}`);
        }
      }
    });

    return Array.from(map.entries()).map(([nama, schedulesList]) => ({
      nama,
      jadwalStr: schedulesList.join(', '),
    }));
  }, [schedules, selectedHari]);

  // Initialize or load existing records when date or day changes
  useEffect(() => {
    if (!isOpen) return;

    const forThisDate = existingApelRecords.filter(r => r.tanggal === selectedDate);
    if (forThisDate.length > 0) {
      setRecords(forThisDate);
      return;
    }

    // Generate fresh list
    const initialList: ApelAttendanceRecord[] = [];

    // 1. Struktural Madar
    DEFAULT_STRUKTURAL_MADAR.forEach((s, idx) => {
      initialList.push({
        id: `apl-${selectedDate}-str-${idx}`,
        tanggal: selectedDate,
        hari: selectedHari,
        nama: s.nama,
        kategori: 'STRUKTURAL',
        jabatanAtauJadwal: s.jabatan,
        status: 'HADIR',
        keterangan: '',
      });
    });

    // 2. Pengajar Sesi 1 & 2
    session1And2Teachers.forEach((t, idx) => {
      // Don't duplicate if already in structural
      const alreadyIn = initialList.some(item => item.nama.toLowerCase() === t.nama.toLowerCase());
      if (!alreadyIn) {
        initialList.push({
          id: `apl-${selectedDate}-sesi-${idx}`,
          tanggal: selectedDate,
          hari: selectedHari,
          nama: t.nama,
          kategori: 'PENGAJAR_SESI_1_2',
          jabatanAtauJadwal: t.jadwalStr,
          status: 'HADIR',
          keterangan: '',
        });
      }
    });

    setRecords(initialList);
  }, [selectedDate, selectedHari, isOpen, existingApelRecords, session1And2Teachers]);

  const handleUpdateStatus = (id: string, status: ApelStatus) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleUpdateKeterangan = (id: string, keterangan: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, keterangan } : r));
  };

  const handleSetAllHadir = () => {
    setRecords(prev => prev.map(r => ({ ...r, status: 'HADIR' })));
  };

  const handleSave = () => {
    if (records.length === 0) {
      alert('Tidak ada data wajib apel yang tersimpan.');
      return;
    }

    const timestamp = `${selectedDate} ${new Date().toLocaleTimeString('id-ID')}`;
    const finalized = records.map(r => ({ ...r, waktuInput: timestamp }));
    onSaveApel(selectedDate, finalized);
    alert(`Daftar Hadir Apel Pagi hari ${selectedHari}, ${formatIndonesianDate(selectedDate)} (${finalized.length} orang) berhasil disimpan!`);
  };

  const messageText = generateWhatsAppApelMessage(selectedDate, selectedHari, records, config);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`, '_blank');
  };

  const hadirCount = records.filter(r => r.status === 'HADIR').length;
  const nonHadirCount = records.length - hadirCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Presensi Pengajar Wajib Apel Pagi"
      subtitle="Presensi apel pagi untuk Struktural Madar dan Pengajar Sesi 1 & 2 hari ini"
      icon={<Award size={20} className="text-amber-600" />}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        
        {/* Controls Bar: Tanggal & Reset Hadir */}
        <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-amber-700" />
              <span className="text-xs font-bold text-slate-700">Tanggal:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  const d = getIndonesianDayName(e.target.value);
                  if (DAFTAR_HARI.includes(d)) setSelectedHari(d);
                }}
                className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-md">
              Hari {selectedHari}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetAllHadir}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors shadow-2xs"
            >
              <Sparkles size={13} />
              <span>Set Semua Hadir</span>
            </button>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Total Wajib Apel: <strong className="text-slate-900">{records.length} orang</strong>
            </span>
            <span className="text-emerald-700 font-semibold">
              • Hadir: <strong>{hadirCount}</strong>
            </span>
            {nonHadirCount > 0 ? (
              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Catatan/Izin: <strong>{nonHadirCount} orang</strong>
              </span>
            ) : (
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                Semua lengkap hadir
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            Pukul 06.45 - 07.15 WIB
          </span>
        </div>

        {/* Scrollable List Table */}
        <div className="border border-slate-200 rounded-xl max-h-[50vh] overflow-y-auto overflow-x-auto touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full min-w-[650px] text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">No</th>
                <th className="py-2.5 px-3">Nama & Peran / Jadwal</th>
                <th className="py-2.5 px-3 text-center w-60">Status Kehadiran Apel</th>
                <th className="py-2.5 px-3">Keterangan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Tidak ada pengajar wajib apel yang terdata.
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => {
                  const isHadir = r.status === 'HADIR';
                  return (
                    <tr 
                      key={r.id}
                      className={!isHadir ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{r.nama}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                            r.kategori === 'STRUKTURAL' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {r.kategori === 'STRUKTURAL' ? 'Struktural' : 'Sesi 1-2'}
                          </span>
                          <span className="truncate">{r.jabatanAtauJadwal}</span>
                        </div>
                      </td>

                      {/* Status Buttons */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-0.5">
                          {(['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPA'] as ApelStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateStatus(r.id, st)}
                              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                                r.status === st
                                  ? st === 'HADIR' ? 'bg-emerald-600 text-white shadow-xs' :
                                    st === 'TERLAMBAT' ? 'bg-amber-600 text-white shadow-xs' :
                                    st === 'IZIN' ? 'bg-blue-600 text-white shadow-xs' :
                                    st === 'SAKIT' ? 'bg-indigo-600 text-white shadow-xs' :
                                    'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {st === 'TERLAMBAT' ? 'Telat' : st === 'HADIR' ? 'Hadir' : st === 'IZIN' ? 'Izin' : st === 'SAKIT' ? 'Sakit' : 'Alpa'}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder={isHadir ? 'Catatan (opsional)' : 'Alasan / surat...'}
                          value={r.keterangan || ''}
                          onChange={(e) => handleUpdateKeterangan(r.id, e.target.value)}
                          className="w-full text-xs px-2.5 py-1 border border-slate-200 rounded bg-slate-50/50 focus:bg-white focus:border-amber-500 outline-none"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* WhatsApp Preview */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-700">
              Pratinjau Pesan WA Laporan Apel:
            </span>
            <span className="text-[11px] text-slate-400">
              {messageText.length} karakter
            </span>
          </div>
          <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-28 overflow-y-auto border border-slate-800">
            {messageText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin Laporan WA'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Share2 size={14} />
              <span>Buka WA</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-2xs"
            >
              <Save size={14} />
              <span>Simpan Presensi Apel</span>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
