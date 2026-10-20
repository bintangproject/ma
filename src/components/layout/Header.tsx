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
  Menu,
  LogOut,
  UserCheck
} from 'lucide-react';
import { InstitutionConfig, AppUser } from '../../types/attendance';

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
  currentUser?: AppUser | null;
  onLogout?: () => void;
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
  currentUser,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-sky-100 shadow-xs sticky top-0 z-30 no-print">
      {/* Top institution accent ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-sky-600 to-yellow-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Identity */}
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

          {/* User Profile Badge, Sync Status & Action Buttons */}
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

            {/* User Logged-in Badge & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                <div 
                  className="flex items-center gap-2 bg-gradient-to-r from-sky-50 to-slate-50 border border-sky-200/90 rounded-xl px-2.5 py-1"
                  title={`Sedang masuk sebagai: ${currentUser.nama} (${currentUser.role})`}
                >
                  <div className={`w-6 h-6 rounded-lg text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs ${
                    currentUser.role.toLowerCase().includes('kepala')
                      ? 'bg-emerald-600'
                      : currentUser.role.toLowerCase().includes('kurikulum')
                      ? 'bg-sky-600'
                      : currentUser.role.toLowerCase().includes('piket')
                      ? 'bg-amber-600'
                      : 'bg-indigo-600'
                  }`}>
                    {currentUser.nama ? currentUser.nama.replace(/^(Ust\.|Ustd\.|K\.|KH\.|Gus\.|Ny\.)\s*/i, '').charAt(0) || 'U' : 'U'}
                  </div>
                  <div className="flex flex-col text-left max-w-[120px] sm:max-w-[190px]">
                    <span className="font-extrabold text-slate-900 text-[11px] leading-tight truncate">
                      {currentUser.nama}
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 truncate leading-tight">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                    title="Keluar / Ganti Akun"
                  >
                    <LogOut size={15} />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
