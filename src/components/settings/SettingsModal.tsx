import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { InstitutionConfig } from '../../types/attendance';
import { Settings, Save, RefreshCw, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { fetchFromGoogleSheets } from '../../services/sheetsApi';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: InstitutionConfig;
  onSaveConfig: (updated: InstitutionConfig) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
}) => {
  const [formData, setFormData] = useState<InstitutionConfig>(config);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!formData.gasUrl) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await fetchFromGoogleSheets(formData.gasUrl);
    setIsTesting(false);
    setTestResult({
      success: res.success,
      message: res.message,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Sistem & Database"
      subtitle="Konfigurasi Google Apps Script, KOP Surat, & Penandatangan"
      icon={<Settings size={20} />}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* BAGIAN 1: GOOGLE APPS SCRIPT DATABASE */}
        <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Integrasi Google Sheets & Apps Script</span>
            </h4>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
              Database Online
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Aplikasi Web Google Apps Script (Web App URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={formData.gasUrl}
                onChange={(e) => {
                  setFormData({ ...formData, gasUrl: e.target.value });
                  setTestResult(null);
                }}
                className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-2 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw size={12} className={isTesting ? 'animate-spin' : ''} />
                <span>Tes Koneksi</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Dapatkan URL ini setelah menerapkan (Deploy as Web App) script di Google Sheets Anda.
            </p>
          </div>

          {testResult && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {testResult.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
            <span>Interval Sinkronisasi Otomatis:</span>
            <select
              value={formData.autoSyncIntervalMinutes}
              onChange={(e) => setFormData({ ...formData, autoSyncIntervalMinutes: Number(e.target.value) })}
              className="text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg"
            >
              <option value={2}>Setiap 2 Menit</option>
              <option value={5}>Setiap 5 Menit</option>
              <option value={10}>Setiap 10 Menit</option>
              <option value={30}>Setiap 30 Menit</option>
              <option value={0}>Hanya Manual</option>
            </select>
          </div>
        </div>

        {/* BAGIAN 2: IDENTITAS MADRASAH & KOP SURAT */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Identitas Lembaga & Kop Surat
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Yayasan
              </label>
              <input
                type="text"
                value={formData.namaYayasan}
                onChange={(e) => setFormData({ ...formData, namaYayasan: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Madrasah
              </label>
              <input
                type="text"
                value={formData.namaMadrasah}
                onChange={(e) => setFormData({ ...formData, namaMadrasah: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NSM (Nomor Statistik Madrasah)
              </label>
              <input
                type="text"
                value={formData.nsm}
                onChange={(e) => setFormData({ ...formData, nsm: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NPSN
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Madrasah
              </label>
              <input
                type="text"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* BAGIAN 3: PEJABAT PENANDATANGAN */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Pejabat Penandatangan Laporan
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kepala Madrasah
              </label>
              <input
                type="text"
                value={formData.namaKepala}
                onChange={(e) => setFormData({ ...formData, namaKepala: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Kepala Madrasah
              </label>
              <input
                type="text"
                value={formData.nipKepala}
                onChange={(e) => setFormData({ ...formData, nipKepala: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Waka / Staff Kurikulum
              </label>
              <input
                type="text"
                value={formData.namaKurikulum}
                onChange={(e) => setFormData({ ...formData, namaKurikulum: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Waka / Staff Kurikulum
              </label>
              <input
                type="text"
                value={formData.nipKurikulum}
                onChange={(e) => setFormData({ ...formData, nipKurikulum: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kembalikan ke data contoh default MA Darul Lughah Wal Karomah?')) {
                onResetData();
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
          >
            <RotateCcw size={13} />
            <span>Reset ke Data Awal</span>
          </button>

          <div className="flex items-center gap-2">
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
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>

      </form>
    </Modal>
  );
};
