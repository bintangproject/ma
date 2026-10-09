import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { GuruPiketRecord, MasterGuru, InstitutionConfig } from '../../types/attendance';
import { getIndonesianDayName, formatIndonesianDate } from '../../utils/formatters';
import { Shield, Save, Copy, Check, Share2, Plus, Calendar, Clock, UserCheck } from 'lucide-react';

interface GuruPiketModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: MasterGuru[];
  piketHistory: GuruPiketRecord[];
  onSavePiket: (record: GuruPiketRecord) => void;
  config: InstitutionConfig;
}

export const GuruPiketModal: React.FC<GuruPiketModalProps> = ({
  isOpen,
  onClose,
  teachers,
  piketHistory,
  onSavePiket,
  config,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHari, setSelectedHari] = useState(getIndonesianDayName(todayStr));

  const [piket1, setPiket1] = useState('');
  const [piket2, setPiket2] = useState('');
  const [piket3, setPiket3] = useState('');
  const [piket4, setPiket4] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [copied, setCopied] = useState(false);

  // When date changes or modal opens, load existing piket record if any
  useEffect(() => {
    if (!isOpen) return;
    const day = getIndonesianDayName(selectedDate);
    setSelectedHari(day);

    const existing = piketHistory.find(p => p.tanggal === selectedDate);
    if (existing) {
      setPiket1(existing.piket1 || '');
      setPiket2(existing.piket2 || '');
      setPiket3(existing.piket3 || '');
      setPiket4(existing.piket4 || '');
      setKeterangan(existing.keterangan || '');
    } else {
      // Suggest default teachers if empty
      setPiket1(teachers[0]?.nama || '');
      setPiket2(teachers[1]?.nama || '');
      setPiket3(teachers[2]?.nama || '');
      setPiket4(teachers[3]?.nama || '');
      setKeterangan('Standby bertugas mengawal KBM & ketertiban madrasah');
    }
  }, [selectedDate, isOpen, piketHistory, teachers]);

  const handleSave = () => {
    if (!piket1 && !piket2 && !piket3 && !piket4) {
      alert('Harap isi minimal 1 nama Guru Piket.');
      return;
    }

    const record: GuruPiketRecord = {
      id: `pkt-${selectedDate}`,
      tanggal: selectedDate,
      hari: selectedHari,
      piket1: piket1.trim(),
      piket2: piket2.trim(),
      piket3: piket3.trim(),
      piket4: piket4.trim(),
      keterangan: keterangan.trim(),
      waktuInput: `${selectedDate} ${new Date().toLocaleTimeString('id-ID')}`,
    };

    onSavePiket(record);
    alert(`Data Guru Piket hari ${selectedHari}, ${formatIndonesianDate(selectedDate)} berhasil disimpan dan diarsipkan!`);
  };

  const generatePiketWaText = () => {
    const institutionName = (config.SINGKATAN || config.NAMA_LEMBAGA || 'MA DARUL LUGHAH WAL KAROMAH').toUpperCase();
    let text = `🛡️ *GURU PIKET MADRASAH*\n`;
    text += `🏫 *${institutionName}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📅 *Hari/Tanggal:* ${selectedHari}, ${formatIndonesianDate(selectedDate)}\n\n`;
    text += `📋 *Daftar Guru Piket (4 Petugas):*\n`;
    if (piket1) text += `1. *${piket1}*\n`;
    if (piket2) text += `2. *${piket2}*\n`;
    if (piket3) text += `3. *${piket3}*\n`;
    if (piket4) text += `4. *${piket4}*\n`;
    if (keterangan) text += `\n📝 *Tugas/Catatan:* _${keterangan}_\n`;
    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Selamat bertugas bapak/ibu guru piket. Jazakumullah khair._\n`;
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
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWa = () => {
    const text = generatePiketWaText();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guru Piket Harian Madrasah"
      subtitle="Arsip 4 guru piket harian yang disertakan dalam laporan harian tanpa dihitung jam KBM"
      icon={<Shield size={20} className="text-sky-600" />}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        
        {/* Date Selector */}
        <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100 flex flex-wrap items-center justify-between gap-3">
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

          <div className="text-xs font-semibold text-sky-800 bg-sky-100 px-3 py-1 rounded-lg">
            Hari {selectedHari}
          </div>
        </div>

        {/* 4 Piket Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Piket 1 */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-[11px] font-black">1</span>
              <span>Guru Piket 1</span>
            </label>
            <input
              list="guru-list"
              type="text"
              value={piket1}
              onChange={(e) => setPiket1(e.target.value)}
              placeholder="Pilih atau ketik nama guru..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Piket 2 */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-[11px] font-black">2</span>
              <span>Guru Piket 2</span>
            </label>
            <input
              list="guru-list"
              type="text"
              value={piket2}
              onChange={(e) => setPiket2(e.target.value)}
              placeholder="Pilih atau ketik nama guru..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Piket 3 */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-[11px] font-black">3</span>
              <span>Guru Piket 3</span>
            </label>
            <input
              list="guru-list"
              type="text"
              value={piket3}
              onChange={(e) => setPiket3(e.target.value)}
              placeholder="Pilih atau ketik nama guru..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Piket 4 */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center text-[11px] font-black">4</span>
              <span>Guru Piket 4</span>
            </label>
            <input
              list="guru-list"
              type="text"
              value={piket4}
              onChange={(e) => setPiket4(e.target.value)}
              placeholder="Pilih atau ketik nama guru..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>

        </div>

        {/* Datalist for autocomplete */}
        <datalist id="guru-list">
          {teachers.map(t => (
            <option key={t.kode} value={t.nama} />
          ))}
        </datalist>

        {/* Keterangan Tugas */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Catatan / Instruksi Piket (Opsional):
          </label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Menertibkan kedisiplinan gerbang, mengontrol kelas jam kosong, dll."
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* WhatsApp Preview Box */}
        <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-800">
          {generatePiketWaText()}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyWa}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks WA'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareWa}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-2xs"
            >
              <Save size={14} />
              <span>Simpan & Arsipkan</span>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
