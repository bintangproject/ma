import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { GuruPiketRecord, MasterGuru, InstitutionConfig, PiketStatus, DayScheduleMap } from '../../types/attendance';
import { getIndonesianDayName, formatIndonesianDate, formatLocalISODate } from '../../utils/formatters';
import { DEFAULT_JADWAL_PIKET } from '../../data/defaultData';
import { 
  Shield, 
  Save, 
  Copy, 
  Check, 
  Share2, 
  Calendar, 
  Printer, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { MonthlyAttendanceSheet } from './MonthlyAttendanceSheet';
import { MonthlyPiketAttendanceSheet } from './MonthlyPiketAttendanceSheet';

interface GuruPiketModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: MasterGuru[];
  schedules: DayScheduleMap;
  jadwalPiket?: Record<string, string[]>;
  piketHistory: GuruPiketRecord[];
  onSavePiket: (record: GuruPiketRecord) => void;
  config: InstitutionConfig;
}

export const GuruPiketModal: React.FC<GuruPiketModalProps> = ({
  isOpen,
  onClose,
  teachers,
  schedules,
  jadwalPiket = {},
  piketHistory,
  onSavePiket,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'monthlyPiket'>('daily');
  const todayStr = formatLocalISODate();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHari, setSelectedHari] = useState(getIndonesianDayName(todayStr));

  // Petugas Piket harian murni tersinkronisasi dari sheet Jadwal_Piket Spreadsheet
  const [petugasList, setPetugasList] = useState<{ nama: string; status: PiketStatus }[]>([]);

  const [keterangan, setKeterangan] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // When date changes or modal opens, load scheduled teachers strictly from Spreadsheet schedule
  useEffect(() => {
    if (!isOpen) return;
    const day = getIndonesianDayName(selectedDate);
    setSelectedHari(day);
    setSaveNotice(null);

    const rawScheduled = (jadwalPiket[day] && jadwalPiket[day].length > 0) 
      ? jadwalPiket[day] 
      : (DEFAULT_JADWAL_PIKET[day] || []);
    
    // Pastikan hanya nama guru yang valid dan tidak kosong dari sheet Jadwal_Piket
    const scheduled = rawScheduled
      .map(s => (typeof s === 'string' ? s.trim() : ''))
      .filter(s => s.length > 0);

    const existing = piketHistory.find(p => p.tanggal === selectedDate);

    if (existing) {
      // Ambil status presensi yang pernah disimpan untuk dicocokkan dengan nama guru jadwal sheet
      const anyExisting = existing as any;
      const statusMap = new Map<string, PiketStatus>();

      if (Array.isArray(anyExisting.petugasList)) {
        anyExisting.petugasList.forEach((p: any) => {
          if (p && p.nama) {
            statusMap.set(p.nama.toLowerCase().replace(/[^a-z0-9]/g, ''), p.status || 'HADIR');
          }
        });
      }

      let i = 1;
      while (anyExisting[`piket${i}`]) {
        const name = anyExisting[`piket${i}`];
        const st = (anyExisting[`status${i}`] as PiketStatus) || 'HADIR';
        statusMap.set(name.toLowerCase().replace(/[^a-z0-9]/g, ''), st);
        i++;
      }

      // Tampilkan TEPAT HANYA guru yang dijadwalkan di Spreadsheet untuk hari ini
      const populated = scheduled.map((sName) => {
        const clean = sName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return {
          nama: sName,
          status: (statusMap.get(clean) || 'HADIR') as PiketStatus,
        };
      });

      setPetugasList(populated);
      setKeterangan(existing.keterangan || '');
    } else {
      const initialized = scheduled.map((s) => ({
        nama: s,
        status: 'HADIR' as PiketStatus,
      }));
      setPetugasList(initialized);
      setKeterangan('');
    }
  }, [selectedDate, isOpen, piketHistory, jadwalPiket]);

  const handleResetToSpreadsheet = () => {
    const day = getIndonesianDayName(selectedDate);
    const rawScheduled = (jadwalPiket[day] && jadwalPiket[day].length > 0) 
      ? jadwalPiket[day] 
      : (DEFAULT_JADWAL_PIKET[day] || []);
    const scheduled = rawScheduled
      .map(s => (typeof s === 'string' ? s.trim() : ''))
      .filter(s => s.length > 0);

    const initialized = scheduled.map((s) => ({
      nama: s,
      status: 'HADIR' as PiketStatus,
    }));
    setPetugasList(initialized);
    setSaveNotice(`Daftar petugas piket berhasil dimuat ulang sesuai sheet Jadwal_Piket (${scheduled.length} guru).`);
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleSave = () => {
    const record: any = {
      id: `pkt-${selectedDate}`,
      tanggal: selectedDate,
      hari: selectedHari,
      keterangan: keterangan.trim(),
      waktuInput: `${selectedDate} ${new Date().toLocaleTimeString('id-ID')}`,
      petugasList,
    };
    
    petugasList.forEach((p, idx) => {
      record[`piket${idx + 1}`] = p.nama;
      record[`status${idx + 1}`] = p.status;
    });

    onSavePiket(record);
    setSaveNotice(`Kehadiran ${petugasList.length} Guru Piket hari ${selectedHari}, ${formatIndonesianDate(selectedDate, false)} berhasil disimpan!`);
    setTimeout(() => setSaveNotice(null), 4000);
  };

  const handleStatusChange = (idx: number, status: PiketStatus) => {
    setPetugasList(prev => prev.map((p, i) => i === idx ? { ...p, status } : p));
  };

  const generatePiketWaText = () => {
    const institutionName = (config.SINGKATAN || config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();
    let text = `🛡️ *GURU PIKET MADRASAH*\n`;
    text += `🏫 *${institutionName}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📅 *Hari/Tanggal:* ${selectedHari}, ${formatIndonesianDate(selectedDate, false)}\n\n`;
    
    text += `📋 *Daftar Petugas Piket Hari Ini (${petugasList.length} Petugas):*\n`;

    petugasList.forEach((item, idx) => {
      const statusIcon = item.status === 'HADIR' ? '✅' : item.status === 'IZIN' ? '✉️' : item.status === 'SAKIT' ? '🏥' : '❌';
      text += `${idx + 1}. ${statusIcon} *${item.nama}* [${item.status}]\n`;
    });

    if (keterangan) {
      text += `\n📝 *Catatan/Laporan Piket:* _${keterangan}_\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Waka Kurikulum: ${config.NAMA_STAFF || 'Ust. Edi Amin, M.Hum.'}_`;
    return text;
  };

  const handleCopyWa = async () => {
    const text = generatePiketWaText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWa = () => {
    const text = generatePiketWaText();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const renderStatusSelector = (currentStatus: PiketStatus, onChange: (s: PiketStatus) => void) => {
    return (
      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-0.5">
        {(['HADIR', 'IZIN', 'SAKIT', 'ALPA'] as PiketStatus[]).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => onChange(st)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
              currentStatus === st
                ? st === 'HADIR' ? 'bg-emerald-600 text-white shadow-xs' :
                  st === 'IZIN' ? 'bg-blue-600 text-white shadow-xs' :
                  st === 'SAKIT' ? 'bg-amber-600 text-white shadow-xs' :
                  'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === 'HADIR' ? 'Hadir' : st === 'IZIN' ? 'Izin' : st === 'SAKIT' ? 'Sakit' : 'Alpa'}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manajemen Guru Piket & Rekap Bulanan"
      subtitle="Input kehadiran piket harian atau cetak lembar rekap kehadiran guru bulanan sesuai format sheet"
      icon={<Shield size={20} className="text-sky-600" />}
      maxWidth="4xl"
      preventBackdropClose={true}
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 no-print">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'daily'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield size={14} />
            <span>Presensi Piket Harian & WA</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'monthly'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Printer size={14} />
            <span>Rekap Bulanan Guru</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monthlyPiket')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'monthlyPiket'
                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Printer size={14} />
            <span>Rekap Bulanan Guru Piket</span>
          </button>
        </div>

        {activeTab === 'daily' ? (
          <div className="space-y-4">
            {/* Save Notice Banner */}
            {saveNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-semibold">{saveNotice}</span>
              </div>
            )}

            {/* Date Selector & Day Header */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-sky-600" />
                <span className="text-xs font-bold text-slate-700">Tanggal Piket:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Total: <strong>{petugasList.length} Petugas</strong>
                </span>
                <div className="text-xs font-bold text-sky-900 bg-sky-100 px-3 py-1 rounded-lg">
                  Hari {selectedHari}
                </div>
                <button
                  type="button"
                  onClick={handleResetToSpreadsheet}
                  title="Muat ulang daftar guru piket dari sheet Jadwal_Piket"
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-sky-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Muat Ulang Sheet</span>
                </button>
              </div>
            </div>

            {/* Petugas Piket Cards (Strictly following sheet Jadwal_Piket, no manual add/remove) */}
            <div className="space-y-2.5">
              {petugasList.map((p, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-sky-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.nama || 'Petugas ' + (i + 1)}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Petugas {i + 1} ({selectedHari})</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <div>{renderStatusSelector(p.status, (s) => handleStatusChange(i, s))}</div>
                  </div>
                </div>
              ))}

              {petugasList.length === 0 && (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">
                  Tidak ada guru piket yang terjadwal untuk hari {selectedHari} di sheet Jadwal_Piket.
                </div>
              )}
            </div>

            {/* Keterangan Tugas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Keterangan Piket (Opsional):
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Kondisi KBM tertib, seluruh kelas terlaksana..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 bg-white"
              />
            </div>

            {/* WhatsApp Preview Box */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1">Pratinjau Pesan WA Guru Piket:</p>
              <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-800">
                {generatePiketWaText()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyWa}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Tersalin!' : 'Salin Teks WA'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareWa}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>Buka WA</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-2xs cursor-pointer"
                >
                  <Save size={14} />
                  <span>Simpan Kehadiran Piket</span>
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'monthly' ? (
          <MonthlyAttendanceSheet
            config={config}
            teachers={teachers}
            schedules={schedules}
          />
        ) : (
          <MonthlyPiketAttendanceSheet
            config={config}
            teachers={teachers}
            jadwalPiket={jadwalPiket}
          />
        )}
      </div>
    </Modal>
  );
};
