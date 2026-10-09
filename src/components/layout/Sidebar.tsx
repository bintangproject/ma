import React from 'react';
import { MadarLogo } from '../common/MadarLogo';
import { InstitutionConfig } from '../../types/attendance';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Shield, 
  Award, 
  CalendarDays, 
  Users, 
  BookOpen, 
  Share2, 
  FileText, 
  Download, 
  Settings, 
  HelpCircle, 
  GitBranch, 
  RefreshCw,
  X,
  ChevronRight,
  Sparkles,
  UserX
} from 'lucide-react';

export type NavItem = 
  | 'dashboard'
  | 'logs'
  | 'summary'
  | 'input_kbm'
  | 'piket'
  | 'apel'
  | 'jadwal'
  | 'guru'
  | 'guru_tanpa_jam'
  | 'mapel'
  | 'share_wa'
  | 'pdf'
  | 'csv'
  | 'settings'
  | 'guide'
  | 'git_sync';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: InstitutionConfig;
  activeItem: string;
  onNavigate: (item: NavItem) => void;
  isSyncing: boolean;
  isLiveConnected: boolean;
  lastSyncTime: string | null;
  onSync: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  config,
  activeItem,
  onNavigate,
  isSyncing,
  isLiveConnected,
  lastSyncTime,
  onSync,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 shadow-sm flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Top Institution Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-sky-50/50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MadarLogo size="md" logoUrl={config.LOGO_URL} />
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-extrabold text-sky-800 tracking-tight">
                    {config.NAMA_APLIKASI || 'SIRAMA'}
                  </h2>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    {config.JABATAN_STAFF || 'Kurikulum'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  {config.SINGKATAN || 'MA Darul Lughah Wal Karomah'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {config.KOTA || 'Kraksaan'}
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sync Status Pill */}
          <div className="mt-3.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isSyncing 
                  ? 'bg-amber-500 animate-ping' 
                  : isLiveConnected 
                  ? 'bg-emerald-500' 
                  : 'bg-slate-400'
              }`} />
              <div>
                <div className="text-[11px] font-bold text-slate-800 leading-none">
                  {isSyncing ? 'Menyinkronkan...' : isLiveConnected ? 'Online (Realtime Sheets)' : 'Penyimpanan Lokal'}
                </div>
                {lastSyncTime && (
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Update: {lastSyncTime.split(' ')[1] || lastSyncTime}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              title="Sinkronkan dengan Google Sheets"
              className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin text-sky-600' : ''} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          
          {/* Group 1: Presensi & KBM */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Presensi & KBM
            </div>
            <nav className="space-y-0.5">
              
              <button
                type="button"
                onClick={() => { onNavigate('dashboard'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === 'dashboard'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard size={16} className={activeItem === 'dashboard' ? 'text-white' : 'text-sky-600'} />
                  <span>Dashboard & Ringkasan</span>
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('input_kbm'); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 transition-all border border-emerald-200/60"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList size={16} className="text-emerald-700" />
                  <span>Input Presensi Harian KBM</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                  Cepat
                </span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('piket'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === 'piket'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className={activeItem === 'piket' ? 'text-white' : 'text-sky-600'} />
                  <span>Guru Piket Harian</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                  4 Guru
                </span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('apel'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === 'apel'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award size={16} className={activeItem === 'apel' ? 'text-white' : 'text-amber-600'} />
                  <span>Presensi Wajib Apel</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                  Sesi 1
                </span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('jadwal'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === 'jadwal'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={16} className={activeItem === 'jadwal' ? 'text-white' : 'text-indigo-600'} />
                  <span>Jadwal KBM & Share WA</span>
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>

            </nav>
          </div>

          {/* Group 2: Master Data & Laporan */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Master Data & Laporan
            </div>
            <nav className="space-y-0.5">
              
              <button
                type="button"
                onClick={() => { onNavigate('guru'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === 'guru'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users size={16} className={activeItem === 'guru' ? 'text-white' : 'text-sky-600'} />
                  <span>Data Dewan Guru</span>
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('guru_tanpa_jam'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === 'guru_tanpa_jam'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserX size={16} className={activeItem === 'guru_tanpa_jam' ? 'text-white' : 'text-amber-600'} />
                  <span>Guru Tanpa Jam (Libur)</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                  Hari Ini
                </span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('mapel'); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeItem === 'mapel'
                    ? 'bg-sky-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className={activeItem === 'mapel' ? 'text-white' : 'text-sky-600'} />
                  <span>Data Mata Pelajaran</span>
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('share_wa'); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 size={16} className="text-emerald-600" />
                  <span>Bagikan Rekap ke WA</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700">Rapi</span>
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('pdf'); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-800 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-sky-600" />
                  <span>Cetak / Ekspor PDF</span>
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('csv'); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Download size={16} className="text-slate-500" />
                  <span>Unduh File CSV</span>
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>

            </nav>
          </div>

          {/* Group 3: Pengaturan & Integrasi */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Integrasi Spreadsheet
            </div>
            <nav className="space-y-0.5">
              
              <button
                type="button"
                onClick={() => { onNavigate('settings'); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Settings size={16} className="text-slate-500" />
                  <span>Pengaturan & GAS</span>
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('guide'); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle size={16} className="text-slate-500" />
                  <span>Panduan Kode GAS</span>
                </div>
                <ChevronRight size={13} className="opacity-40" />
              </button>

              <button
                type="button"
                onClick={() => { onNavigate('git_sync'); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <GitBranch size={16} className="text-purple-600" />
                  <span>Sync ke GitHub</span>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.2 rounded">
                  Deploy
                </span>
              </button>

            </nav>
          </div>

        </div>

        {/* Bottom User / Staff Banner */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              EA
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">
                {config.NAMA_STAFF || 'Ust. Edi Amin, M.Hum.'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {config.JABATAN_STAFF || 'Waka Kurikulum'}
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
