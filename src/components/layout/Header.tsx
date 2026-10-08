import React from 'react';
import { MadarLogo } from '../common/MadarLogo';
import { 
  RefreshCw, 
  PlusCircle, 
  FileText, 
  Share2, 
  Settings, 
  Download, 
  HelpCircle,
  Database,
  CloudCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { InstitutionConfig } from '../../types/attendance';

interface HeaderProps {
  config: InstitutionConfig;
  lastSyncTime: string | null;
  isSyncing: boolean;
  onSync: () => void;
  onOpenAddModal: () => void;
  onOpenPdfModal: () => void;
  onOpenWaModal: () => void;
  onExportCsv: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  isLiveConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  lastSyncTime,
  isSyncing,
  onSync,
  onOpenAddModal,
  onOpenPdfModal,
  onOpenWaModal,
  onExportCsv,
  onOpenSettings,
  onOpenGuide,
  isLiveConnected,
}) => {
  return (
    <header className="bg-white border-b border-sky-100 shadow-xs sticky top-0 z-30 no-print">
      {/* Top institution accent ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-sky-600 to-yellow-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3.5">
            <MadarLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span className="text-sky-700">{config.NAMA_APLIKASI || 'SIMPRES'}</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span>Presensi Pengajar</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                  {config.JABATAN_STAFF || 'Kurikulum'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {config.SINGKATAN || 'MA Darul Lughah Wal Karomah'} • {config.KOTA || 'Kraksaan'}
              </p>
            </div>
          </div>

          {/* Sync Status & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* GAS Sync Indicator */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  isSyncing 
                    ? 'bg-amber-500 animate-ping' 
                    : isLiveConnected 
                    ? 'bg-emerald-500' 
                    : 'bg-slate-400'
                }`} />
                <span className="font-medium hidden lg:inline">
                  {isSyncing ? 'Menyinkronkan...' : isLiveConnected ? 'Tersambung Sheets' : 'Penyimpanan Lokal'}
                </span>
              </div>
              
              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing}
                title="Sinkronkan data dengan Google Sheets"
                className="p-1 text-slate-500 hover:text-sky-700 hover:bg-white rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin text-sky-600' : ''} />
              </button>
            </div>

            {/* Input Presensi Hari Ini */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-2xs transition-colors"
            >
              <PlusCircle size={15} />
              <span>Input Presensi Hari Ini</span>
            </button>

            {/* Cetak / Ekspor PDF */}
            <button
              type="button"
              onClick={onOpenPdfModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
            >
              <FileText size={15} className="text-sky-600" />
              <span>Laporan PDF</span>
            </button>

            {/* Bagikan WhatsApp */}
            <button
              type="button"
              onClick={onOpenWaModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="Salin rekap untuk WhatsApp grup"
            >
              <Share2 size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">Share WA</span>
            </button>

            {/* Ekspor CSV */}
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              title="Unduh file Excel/CSV"
            >
              <Download size={14} className="text-slate-500" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Panduan Google Apps Script */}
            <button
              type="button"
              onClick={onOpenGuide}
              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg border border-transparent hover:border-sky-100 transition-colors"
              title="Panduan Google Apps Script & Deploy Vercel"
            >
              <HelpCircle size={16} />
            </button>

            {/* Pengaturan */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Pengaturan Kop Surat & Database"
            >
              <Settings size={16} />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
