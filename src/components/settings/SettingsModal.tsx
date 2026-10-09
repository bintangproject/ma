import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { InstitutionConfig } from '../../types/attendance';
import { Settings, Save, RefreshCw, CheckCircle2, AlertCircle, RotateCcw, Database, GitBranch, Copy, Check, Code, Image as ImageIcon } from 'lucide-react';
import { fetchFromGoogleSheets } from '../../services/sheetsApi';
import { MadarLogo, parseDirectImageUrl } from '../common/MadarLogo';
import { APP_CONFIG } from '../../config/appConfig';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: InstitutionConfig;
  onSaveConfig: (updated: InstitutionConfig) => void;
  onResetData: () => void;
  onOpenGitSync?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
  onOpenGitSync,
}) => {
  const [formData, setFormData] = useState<InstitutionConfig>(config);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

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

    // If config was returned, merge it into preview form
    if (res.success && res.data?.config) {
      setFormData(prev => ({
        ...prev,
        ...res.data!.config,
      }));
    }
  };

  const handleCopyAppConfigSnippet = () => {
    const url = formData.gasUrl?.trim() || '';
    const snippet = `// Di dalam file src/config/appConfig.ts:\nexport const APP_CONFIG = {\n  SPREADSHEET_GAS_URL: '${url}',\n  DEFAULT_LOGO_URL: '${formData.LOGO_URL || APP_CONFIG.DEFAULT_LOGO_URL}',\n  DEFAULT_FAVICON_URL: '${formData.FAVICON_URL || formData.LOGO_URL || APP_CONFIG.DEFAULT_FAVICON_URL}',\n};`;
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
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
        
        {/* BAGIAN REPOSITORI GITHUB & VERCEL */}
        {onOpenGitSync && (
          <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-lg">
                <GitBranch size={16} className="text-sky-300" />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Sinkronisasi Otomatis ke GitHub & Vercel</p>
                <p className="text-[11px] text-slate-300">Push perbaikan package.json & vercel.json langsung ke repositori Anda</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGitSync();
              }}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shrink-0"
            >
              Buka Sinkronisasi GitHub
            </button>
          </div>
        )}

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

          {/* CARA KONEKSI REALTIME SEMUA PERANGKAT */}
          <div className="bg-sky-100/70 border border-sky-300/80 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="text-sky-950">
              <span className="font-bold flex items-center gap-1.5 text-sky-900">
                <Code size={13} />
                <span>Koneksi Otomatis Semua Perangkat:</span>
              </span>
              <p className="text-[11px] text-sky-800 mt-0.5">
                Taruh URL ini langsung di file <strong>src/config/appConfig.ts</strong> agar HP & laptop manapun langsung terbuka secara realtime.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyAppConfigSnippet}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-sky-800 bg-white hover:bg-sky-50 border border-sky-300 rounded shadow-2xs transition-colors shrink-0"
              title="Salin baris kode untuk ditaruh di src/config/appConfig.ts"
            >
              {copiedCode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copiedCode ? 'Tersalin!' : 'Salin Kode appConfig.ts'}</span>
            </button>
          </div>

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

            {/* FAVICON_URL */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                FAVICON_URL (Ikon Tab Browser)
              </label>
              <input
                type="text"
                placeholder="https://.../favicon.png"
                value={formData.FAVICON_URL || ''}
                onChange={(e) => setFormData({ ...formData, FAVICON_URL: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

          </div>

          {/* PRATINJAU LOGO & FAVICON */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <MadarLogo size="md" logoUrl={formData.LOGO_URL} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Pratinjau Logo Lembaga</p>
                <p className="text-[11px] text-slate-500">
                  {formData.LOGO_URL ? 'Menggunakan URL kustom (CDN jsDelivr)' : 'Menggunakan logo default lembaga'}
                </p>
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded border border-slate-200 flex items-center justify-center shadow-2xs p-1">
                <img
                  src={parseDirectImageUrl(formData.FAVICON_URL || formData.LOGO_URL) || APP_CONFIG.DEFAULT_FAVICON_URL}
                  alt="Favicon"
                  className="w-5 h-5 object-contain"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-600">
                Pratinjau Favicon Tab Browser
              </p>
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
