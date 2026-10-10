import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { DayScheduleMap, InstitutionConfig, GuruPiketRecord } from '../../types/attendance';
import { DAFTAR_HARI, DEFAULT_JADWAL_PIKET } from '../../data/defaultData';
import { formatIndonesianDate, getIndonesianDayName, formatLocalISODate } from '../../utils/formatters';
import { generateWhatsAppDailyScheduleMessage } from '../../utils/exportUtils';
import { Calendar, Copy, Check, Share2, Search, BookOpen, Clock, School } from 'lucide-react';

interface DailyScheduleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: DayScheduleMap;
  config: InstitutionConfig;
  guruPiketHistory?: GuruPiketRecord[];
  jadwalPiket?: Record<string, string[]>;
}

export const DailyScheduleShareModal: React.FC<DailyScheduleShareModalProps> = ({
  isOpen,
  onClose,
  schedules,
  config,
  guruPiketHistory = [],
  jadwalPiket = {},
}) => {
  const todayStr = formatLocalISODate();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const detectedHari = getIndonesianDayName(selectedDate);
  const selectedHari = DAFTAR_HARI.includes(detectedHari) ? detectedHari : 'Sabtu';
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const piketToday = useMemo(() => {
    const existing = guruPiketHistory.find(p => p.tanggal === selectedDate);
    if (existing) return existing;
    const defaultList = jadwalPiket[selectedHari] || DEFAULT_JADWAL_PIKET[selectedHari] || [];
    if (defaultList.length === 0) return null;
    return {
      id: `pkt-default-${selectedDate}`,
      tanggal: selectedDate,
      hari: selectedHari,
      piket1: defaultList[0] || '',
      status1: 'HADIR' as const,
      piket2: defaultList[1] || '',
      status2: 'HADIR' as const,
      piket3: defaultList[2] || '',
      status3: 'HADIR' as const,
      piket4: defaultList[3] || '',
      status4: 'HADIR' as const,
      keterangan: '',
    };
  }, [guruPiketHistory, selectedDate, selectedHari, jadwalPiket]);

  const messageText = generateWhatsAppDailyScheduleMessage(selectedHari, selectedDate, schedules, config, piketToday);

  const daySchedule = schedules[selectedHari] || [];

  // Group items by Kelas
  const byClass: Record<string, typeof daySchedule> = {};
  daySchedule.forEach(item => {
    const cls = item.kelas || 'Umum';
    if (!byClass[cls]) byClass[cls] = [];
    byClass[cls].push(item);
  });

  // Filter classes if searchQuery is present
  const classKeys = Object.keys(byClass).filter(cls => {
    if (!searchQuery) return true;
    const matchClass = cls.toLowerCase().includes(searchQuery.toLowerCase());
    const matchItems = byClass[cls].some(
      it => it.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
            it.guruPengampu.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchClass || matchItems;
  });

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
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jadwal KBM Harian & Share WhatsApp"
      subtitle="Pratinjau jadwal harian per kelas dan salin pesan format WA siap kirim ke grup guru"
      icon={<Clock size={20} className="text-sky-600" />}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        
        {/* Controls Bar: Pilih Tanggal */}
        <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar size={14} className="text-sky-600" />
              Pilih Tanggal:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Hari terdeteksi:</span>
            <span className="text-xs font-extrabold text-sky-800 bg-sky-100/80 px-3 py-1 rounded-lg border border-sky-200">
              {selectedHari}
            </span>
          </div>

        </div>

        {/* Search and summary */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Jadwal hari <strong className="text-sky-800">{selectedHari}</strong>: {daySchedule.length} sesi ({Object.keys(byClass).length} kelas)
          </div>

          <div className="relative w-48 sm:w-60">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kelas, mapel, guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Schedule Cards Grid */}
        <div className="max-h-60 overflow-y-auto space-y-3 p-1">
          {classKeys.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Tidak ada jadwal KBM yang ditemukan untuk hari {selectedHari}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {classKeys.map(cls => {
                const items = byClass[cls].slice().sort((a, b) => Number(a.jam) - Number(b.jam));
                return (
                  <div key={cls} className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-extrabold text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        Kelas {cls}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {items.length} Jam
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {items.map(s => (
                        <div key={s.id} className="flex items-start gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5">
                            {s.jam}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 truncate">{s.guruPengampu}</div>
                            <div className="text-[11px] text-slate-500 truncate">{s.mataPelajaran}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* WhatsApp Preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">
              Pratinjau Pesan WhatsApp Jadwal:
            </span>
            <span className="text-[11px] text-slate-400">
              {messageText.length} karakter
            </span>
          </div>

          <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-800 shadow-inner">
            {messageText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-center"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Salin Jadwal untuk WA</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-2xs transition-colors"
          >
            <Share2 size={14} />
            <span>Kirim Langsung ke WA</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
