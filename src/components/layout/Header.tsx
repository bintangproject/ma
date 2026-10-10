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
  AlertTriangle,
  GitBranch,
  Menu
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
  onOpenGitSync: () => void;
  isLiveConnected: boolean;
  onToggleSidebar?: () => void;
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
  onOpenGitSync,
  isLiveConnected,
  onToggleSidebar,
}) => {
  return (
    <header className="bg-white border-b border-sky-100 shadow-xs sticky top-0 z-30 no-print">
      {/* Top institution accent ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-sky-600 to-yellow-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Identity (Logo removed) */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-2 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl border border-slate-200 transition-colors"
                title="Buka Menu Sidebar"
              >
                <Menu size={20} />
              </button>
            )}

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span className="text-sky-700">{config.NAMA_APLIKASI || 'SIRAMA'}</span>
                  </h1>
                </div>
                <p className="text-[10px] text-slate-600 font-semibold leading-tight">
                  {config.KEPANJANGAN_APLIKASI || 'Sistem Informasi Rekap dan Absensi Pengajar Madrasah'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {config.SINGKATAN || 'MA Darul Lughah Wal Karomah'} • {config.KOTA || 'Kraksaan'}
                </p>
              </div>
          </div>

          {/* Sync Status & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
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
                <span className="font-medium hidden sm:inline">
                  {isSyncing ? 'Menyinkronkan...' : isLiveConnected ? 'Online (Sheets)' : 'Lokal'}
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

            {/* Input Presensi Hari Ini (Aksi Utama) */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-2xs transition-colors shrink-0"
              title="Input data presensi harian pengajar"
            >
              <PlusCircle size={15} />
              <span className="hidden xs:inline sm:inline">Input Presensi</span>
            </button>

            {/* Tombol Pengaturan */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg border border-slate-200 transition-colors"
              title="Buka Pengaturan Sistem & Database Spreadsheet"
            >
              <Settings size={16} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
