import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { InstitutionConfig } from '../../types/attendance';
import { Settings, Save, RefreshCw, CheckCircle2, AlertCircle, RotateCcw, Database } from 'lucide-react';
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
      title="Pengaturan Sistem & Database Spreadsheet"
      subtitle="Pengaturan terhubung dengan sheet 'Config' di Google Spreadsheet Anda"
      icon={<Settings size={20} />}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* BAGIAN 1: GOOGLE APPS SCRIPT DATABASE */}
        <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database size={15} />
              <span>URL Google Apps Script (Web App)</span>
            </h4>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
              Database Online
            </span>
          </div>

          <div>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={formData.gasUrl || ''}
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
              Didapat dari Google Sheets &gt; Ekstensi &gt; Apps Script &gt; Terapkan (Deploy as Web App, Access: Anyone).
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
              <option value={0}>Hanya Manual</option>
            </select>
          </div>
        </div>

        {/* NOTIFIKASI SINKRONISASI SHEET CONFIG */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
          <strong>💡 Sinkronisasi Sheet 'Config':</strong> Nilai-nilai di bawah ini tersinkronisasi langsung dengan baris-baris pada tab/sheet <strong>Config</strong> di Google Spreadsheet Anda. Anda dapat mengubahnya di form ini atau mengeditnya langsung di Spreadsheet.
        </div>

        {/* BAGIAN 2: SHEET CONFIG FIELDS */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Variabel Sheet 'Config'
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            
            {/* NAMA_LEMBAGA */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                NAMA_LEMBAGA
              </label>
              <input
                type="text"
                value={formData.NAMA_LEMBAGA || ''}
                onChange={(e) => setFormData({ ...formData, NAMA_LEMBAGA: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* SINGKATAN */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                SINGKATAN
              </label>
              <input
                type="text"
                value={formData.SINGKATAN || ''}
                onChange={(e) => setFormData({ ...formData, SINGKATAN: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* KOTA */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                KOTA
              </label>
              <input
                type="text"
                value={formData.KOTA || ''}
                onChange={(e) => setFormData({ ...formData, KOTA: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* NAMA_APLIKASI */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                NAMA_APLIKASI
              </label>
              <input
                type="text"
                value={formData.NAMA_APLIKASI || ''}
                onChange={(e) => setFormData({ ...formData, NAMA_APLIKASI: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* TIMEZONE */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                TIMEZONE
              </label>
              <input
                type="text"
                value={formData.TIMEZONE || 'Asia/Jakarta'}
                onChange={(e) => setFormData({ ...formData, TIMEZONE: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* API_KEY */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                API_KEY
              </label>
              <input
                type="text"
                placeholder="(Opsional)"
                value={formData.API_KEY || ''}
                onChange={(e) => setFormData({ ...formData, API_KEY: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* NAMA_KEPALA */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                NAMA_KEPALA
              </label>
              <input
                type="text"
                value={formData.NAMA_KEPALA || ''}
                onChange={(e) => setFormData({ ...formData, NAMA_KEPALA: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* NAMA_STAFF */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                NAMA_STAFF
              </label>
              <input
                type="text"
                value={formData.NAMA_STAFF || ''}
                onChange={(e) => setFormData({ ...formData, NAMA_STAFF: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* JABATAN_STAFF */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                JABATAN_STAFF
              </label>
              <input
                type="text"
                value={formData.JABATAN_STAFF || ''}
                onChange={(e) => setFormData({ ...formData, JABATAN_STAFF: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* WARNA_UTAMA */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                WARNA_UTAMA
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.WARNA_UTAMA || '#0284c7'}
                  onChange={(e) => setFormData({ ...formData, WARNA_UTAMA: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.WARNA_UTAMA || '#0284c7'}
                  onChange={(e) => setFormData({ ...formData, WARNA_UTAMA: e.target.value })}
                  className="flex-1 text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                />
              </div>
            </div>

            {/* WARNA_SEKUNDER */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                WARNA_SEKUNDER
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.WARNA_SEKUNDER || '#0369a1'}
                  onChange={(e) => setFormData({ ...formData, WARNA_SEKUNDER: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.WARNA_SEKUNDER || '#0369a1'}
                  onChange={(e) => setFormData({ ...formData, WARNA_SEKUNDER: e.target.value })}
                  className="flex-1 text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                />
              </div>
            </div>

            {/* LOGO_URL */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                LOGO_URL
              </label>
              <input
                type="text"
                placeholder="https://.../logo.png"
                value={formData.LOGO_URL || ''}
                onChange={(e) => setFormData({ ...formData, LOGO_URL: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kembalikan ke pengaturan default?')) {
                onResetData();
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
          >
            <RotateCcw size={13} />
            <span>Reset Standar</span>
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
