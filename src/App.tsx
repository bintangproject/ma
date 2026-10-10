import React, { useState, useEffect, useMemo } from 'react';
import { 
  AttendanceRecord, 
  FilterState, 
  InstitutionConfig, 
  MasterGuru,
  MasterMapel,
  DayScheduleMap,
  GuruPiketRecord,
  ApelAttendanceRecord
} from './types/attendance';
import { 
  loadStoredConfig, 
  saveStoredConfig, 
  loadStoredRecords, 
  saveStoredRecords, 
  loadStoredTeachers, 
  saveStoredTeachers,
  loadStoredSubjects, 
  saveStoredSubjects,
  loadStoredSchedules, 
  saveStoredSchedules,
  loadStoredGuruPiket,
  saveStoredGuruPiket,
  loadStoredJadwalPiket,
  saveStoredJadwalPiket,
  loadStoredRekapApel,
  saveStoredRekapApel,
  loadLastSyncTime,
  saveLastSyncTime 
} from './utils/storage';
import { 
  DEFAULT_INSTITUTION_CONFIG, 
  DEFAULT_MASTER_GURU, 
  DEFAULT_MASTER_MAPEL, 
  DEFAULT_WEEKLY_SCHEDULE, 
  getInitialAttendanceRecords 
} from './data/defaultData';
import { exportToCsv } from './utils/exportUtils';
import { calculateTeacherSummaries, formatIndonesianDate, getMadarMonthlyRange, formatLocalISODate } from './utils/formatters';
import { 
  fetchFromGoogleSheets, 
  postBulkDayAttendance, 
  postBulkGuruPiket, 
  postBulkRekapApel 
} from './services/sheetsApi';

// Layout & Core Components
import { Header } from './components/layout/Header';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { StatsOverview } from './components/layout/StatsOverview';
import { FilterBar } from './components/filters/FilterBar';
import { AttendanceTable } from './components/attendance/AttendanceTable';
import { TeacherSummaryTable } from './components/attendance/TeacherSummaryTable';
import { BulkDailyAttendanceModal } from './components/attendance/BulkDailyAttendanceModal';
import { GuruPiketModal } from './components/piket/GuruPiketModal';
import { ApelAttendanceModal } from './components/apel/ApelAttendanceModal';
import { DailyScheduleShareModal } from './components/schedule/DailyScheduleShareModal';
import { MasterTeachersModal } from './components/master/MasterTeachersModal';
import { MasterSubjectsModal } from './components/master/MasterSubjectsModal';
import { TeachersWithoutScheduleModal } from './components/master/TeachersWithoutScheduleModal';
import { PdfReportModal } from './components/report/PdfReportModal';
import { WhatsAppShareModal } from './components/report/WhatsAppShareModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { GasGuideModal } from './components/settings/GasGuideModal';
import { GitHubSyncModal } from './components/settings/GitHubSyncModal';
import { MadarLogo, parseDirectImageUrl } from './components/common/MadarLogo';
import { APP_CONFIG } from './config/appConfig';

import { 
  Layers, 
  Users, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ArrowRight,
  Sparkles,
  CalendarCheck,
  Shield,
  Award,
  Clock,
  Menu
} from 'lucide-react';

export default function App() {
  // 1. Initial State
  const [config, setConfig] = useState<InstitutionConfig>(loadStoredConfig);
  const [records, setRecords] = useState<AttendanceRecord[]>(loadStoredRecords);
  const [teachers, setTeachers] = useState<MasterGuru[]>(loadStoredTeachers);
  const [subjects, setSubjects] = useState<MasterMapel[]>(loadStoredSubjects);
  const [schedules, setSchedules] = useState<DayScheduleMap>(loadStoredSchedules);
  const [guruPiketHistory, setGuruPiketHistory] = useState<GuruPiketRecord[]>(loadStoredGuruPiket);
  const [jadwalPiket, setJadwalPiket] = useState<Record<string, string[]>>(loadStoredJadwalPiket);
  const [rekapApelHistory, setRekapApelHistory] = useState<ApelAttendanceRecord[]>(loadStoredRekapApel);

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(loadLastSyncTime);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Layout Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active View Tab: 'logs' or 'summary'
  const [activeTab, setActiveTab] = useState<'logs' | 'summary'>('logs');

  // 2. Filter State: Default range bulanan MA Darul Lughah Wal Karomah (26 bulan lalu s.d. 25 bulan ini)
  const initialMonthRange = useMemo(() => getMadarMonthlyRange(new Date()), []);
  const todayStr = formatLocalISODate();

  const [filter, setFilter] = useState<FilterState>({
    preset: 'today',
    startDate: todayStr,
    endDate: todayStr,
    searchQuery: '',
    selectedGuru: '',
    selectedKelas: '',
    selectedMapel: '',
    selectedStatus: '',
  });

  // 3. Modals State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isPiketModalOpen, setIsPiketModalOpen] = useState(false);
  const [isApelModalOpen, setIsApelModalOpen] = useState(false);
  const [isJadwalModalOpen, setIsJadwalModalOpen] = useState(false);
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);
  const [isTeachersWithoutScheduleModalOpen, setIsTeachersWithoutScheduleModalOpen] = useState(false);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isGitSyncModalOpen, setIsGitSyncModalOpen] = useState(false);

  // Auto-dismiss notice
  useEffect(() => {
    if (syncNotice) {
      const timer = setTimeout(() => setSyncNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [syncNotice]);

  // Dynamically synchronize browser tab favicon and title with config
  useEffect(() => {
    const faviconUrl = config.FAVICON_URL || config.LOGO_URL || APP_CONFIG.DEFAULT_FAVICON_URL;
    if (faviconUrl) {
      const parsedUrl = parseDirectImageUrl(faviconUrl);
      if (parsedUrl) {
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        existingLinks.forEach((el) => el.remove());

        const newLink = document.createElement('link');
        newLink.id = 'dynamic-favicon';
        newLink.rel = 'icon';
        newLink.type = 'image/png';
        newLink.href = parsedUrl;
        document.head.appendChild(newLink);

        let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.head.appendChild(appleLink);
        }
        appleLink.href = parsedUrl;
      }
    }

    if (config.NAMA_APLIKASI) {
      document.title = `${config.NAMA_APLIKASI} - ${config.SINGKATAN || 'MA Darul Lughah Wal Karomah'}`;
    }
  }, [config.FAVICON_URL, config.LOGO_URL, config.NAMA_APLIKASI, config.SINGKATAN]);

  // Initial automatic sync on mount for any device / account
  useEffect(() => {
    if (config.gasUrl && config.gasUrl.trim().startsWith('http')) {
      handleSync(true);
    }
  }, [config.gasUrl]);

  // Auto-sync periodic timer if configured
  useEffect(() => {
    if (!config.gasUrl || config.autoSyncIntervalMinutes <= 0) return;

    const intervalMs = config.autoSyncIntervalMinutes * 60 * 1000;
    const interval = setInterval(() => {
      handleSync(true);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [config.gasUrl, config.autoSyncIntervalMinutes]);

  // 4. Synchronization Handler
  const handleSync = async (silent = false) => {
    if (!config.gasUrl) {
      if (!silent) {
        setSyncNotice({
          type: 'info',
          message: 'URL Google Apps Script belum diisi. Membuka panduan pemasangan...',
        });
        setIsGuideModalOpen(true);
      }
      return;
    }

    setIsSyncing(true);
    if (!silent) {
      setSyncNotice({
        type: 'info',
        message: 'Sedang menyinkronkan data dengan Google Spreadsheet...',
      });
    }

    try {
      const result = await fetchFromGoogleSheets(config.gasUrl);
      if (result.success && result.data) {
        // Attendance Records (KBM)
        if (result.data.attendance) {
          setRecords(result.data.attendance);
          saveStoredRecords(result.data.attendance);
        }
        // Master Guru
        if (result.data.teachers && result.data.teachers.length > 0) {
          setTeachers(result.data.teachers);
          saveStoredTeachers(result.data.teachers);
        }
        // Master Mapel
        if (result.data.subjects && result.data.subjects.length > 0) {
          setSubjects(result.data.subjects);
          saveStoredSubjects(result.data.subjects);
        }
        // Schedules
        if (result.data.schedules && Object.keys(result.data.schedules).length > 0) {
          setSchedules(result.data.schedules);
          saveStoredSchedules(result.data.schedules);
        }
        // Guru Piket
        if (result.data.guruPiket && result.data.guruPiket.length > 0) {
          setGuruPiketHistory(result.data.guruPiket);
          saveStoredGuruPiket(result.data.guruPiket);
        }
        // Jadwal Piket
        if (result.data.jadwalPiket && Object.keys(result.data.jadwalPiket).length > 0) {
          setJadwalPiket(result.data.jadwalPiket);
          saveStoredJadwalPiket(result.data.jadwalPiket);
        }
        // Rekap Apel
        if (result.data.rekapApel && result.data.rekapApel.length > 0) {
          setRekapApelHistory(result.data.rekapApel);
          saveStoredRekapApel(result.data.rekapApel);
        }
        // Config if present
        if (result.data.config && Object.keys(result.data.config).length > 0) {
          setConfig(prev => {
            const merged = { ...prev, ...result.data!.config };
            if (merged.LOGO_URL && !merged.FAVICON_URL) {
              merged.FAVICON_URL = merged.LOGO_URL;
            }
            saveStoredConfig(merged);
            return merged;
          });
        }

        const nowStr = new Date().toLocaleTimeString('id-ID');
        setLastSyncTime(nowStr);
        saveLastSyncTime(nowStr);
        setSyncNotice({
          type: 'success',
          message: `Sinkronisasi berhasil! Data terhubung realtime dengan Google Sheets.`,
        });
      } else {
        setSyncNotice({
          type: 'error',
          message: result.message || 'Gagal menyinkronkan data dari Google Sheets.',
        });
      }
    } catch (e: any) {
      setSyncNotice({
        type: 'error',
        message: `Terjadi kendala saat koneksi: ${e.message}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Save Bulk Day Attendance Handler
  const handleSaveDayAttendance = async (tanggal: string, newDayRecords: AttendanceRecord[]) => {
    const otherRecords = records.filter(r => r.tanggal !== tanggal);
    const updated = [...newDayRecords, ...otherRecords];

    setRecords(updated);
    saveStoredRecords(updated);

    setSyncNotice({
      type: 'info',
      message: `Menyimpan daftar hadir tanggal ${formatIndonesianDate(tanggal)} (${newDayRecords.length} sesi KBM)...`,
    });

    if (config.gasUrl) {
      postBulkDayAttendance(config.gasUrl, tanggal, newDayRecords).then(res => {
        if (!res.success) {
          setSyncNotice({
            type: 'error',
            message: `Tersimpan di perangkat lokal, namun gagal ke Spreadsheet: ${res.message}`,
          });
        } else {
          setSyncNotice({
            type: 'success',
            message: `Daftar hadir tanggal ${formatIndonesianDate(tanggal)} (${newDayRecords.length} sesi) berhasil disimpan ke Google Sheets!`,
          });
        }
      });
    } else {
      setSyncNotice({
        type: 'success',
        message: `Berhasil menyimpan daftar hadir tanggal ${formatIndonesianDate(tanggal)} (${newDayRecords.length} sesi KBM)!`,
      });
    }
  };

  // 6. Save Guru Piket Handler
  const handleSaveGuruPiket = async (record: GuruPiketRecord) => {
    const others = guruPiketHistory.filter(p => p.tanggal !== record.tanggal);
    const updated = [record, ...others];
    setGuruPiketHistory(updated);
    saveStoredGuruPiket(updated);

    if (config.gasUrl) {
      postBulkGuruPiket(config.gasUrl, record).then(res => {
        if (!res.success) {
          setSyncNotice({
            type: 'error',
            message: `Piket tersimpan di lokal, namun gagal ke Spreadsheet: ${res.message}`,
          });
        } else {
          setSyncNotice({
            type: 'success',
            message: `Guru Piket hari ${record.hari}, ${formatIndonesianDate(record.tanggal)} berhasil disimpan ke Google Sheets!`,
          });
        }
      });
    } else {
      setSyncNotice({
        type: 'success',
        message: `Guru Piket hari ${record.hari}, ${formatIndonesianDate(record.tanggal)} berhasil disimpan!`,
      });
    }
  };

  // 7. Save Rekap Apel Handler
  const handleSaveRekapApel = async (tanggal: string, apelRecords: ApelAttendanceRecord[]) => {
    const others = rekapApelHistory.filter(a => a.tanggal !== tanggal);
    const updated = [...apelRecords, ...others];
    setRekapApelHistory(updated);
    saveStoredRekapApel(updated);

    if (config.gasUrl) {
      postBulkRekapApel(config.gasUrl, tanggal, apelRecords).then(res => {
        if (!res.success) {
          setSyncNotice({
            type: 'error',
            message: `Presensi Apel tersimpan di lokal, namun gagal ke Spreadsheet: ${res.message}`,
          });
        } else {
          setSyncNotice({
            type: 'success',
            message: `Presensi Apel Pagi tanggal ${formatIndonesianDate(tanggal)} (${apelRecords.length} orang) berhasil disimpan ke Google Sheets!`,
          });
        }
      });
    } else {
      setSyncNotice({
        type: 'success',
        message: `Presensi Apel Pagi tanggal ${formatIndonesianDate(tanggal)} (${apelRecords.length} orang) berhasil disimpan!`,
      });
    }
  };

  // 8. Delete Record Handler
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveStoredRecords(updated);
    setSyncNotice({
      type: 'info',
      message: 'Catatan presensi telah dihapus.',
    });
  };

  // 9. Save Config Handler
  const handleSaveConfig = (newConfig: InstitutionConfig) => {
    setConfig(newConfig);
    saveStoredConfig(newConfig);
    setSyncNotice({
      type: 'success',
      message: 'Pengaturan sistem berhasil disimpan.',
    });
  };

  // 10. Reset Data Handler
  const handleResetData = () => {
    const initialRecords = getInitialAttendanceRecords();
    setRecords(initialRecords);
    saveStoredRecords(initialRecords);
    setTeachers(DEFAULT_MASTER_GURU);
    saveStoredTeachers(DEFAULT_MASTER_GURU);
    setSubjects(DEFAULT_MASTER_MAPEL);
    saveStoredSubjects(DEFAULT_MASTER_MAPEL);
    setSchedules(DEFAULT_WEEKLY_SCHEDULE);
    saveStoredSchedules(DEFAULT_WEEKLY_SCHEDULE);
    setConfig(DEFAULT_INSTITUTION_CONFIG);
    saveStoredConfig(DEFAULT_INSTITUTION_CONFIG);
    setSyncNotice({
      type: 'info',
      message: 'Data telah dikembalikan ke standar SIRAMA MA Darul Lughah Wal Karomah.',
    });
  };

  // 11. Filtering logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Date range filter
      if (filter.startDate && r.tanggal < filter.startDate) return false;
      if (filter.endDate && r.tanggal > filter.endDate) return false;

      // Search query
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchName = r.namaGuru.toLowerCase().includes(query);
        const matchNotes = (r.keterangan || '').toLowerCase().includes(query);
        const matchSubject = r.mataPelajaran.toLowerCase().includes(query);
        if (!matchName && !matchNotes && !matchSubject) return false;
      }

      // Teacher dropdown filter
      if (filter.selectedGuru && r.namaGuru !== filter.selectedGuru) return false;

      // Subject filter
      if (filter.selectedMapel && r.mataPelajaran !== filter.selectedMapel) return false;

      // Class filter
      if (filter.selectedKelas && r.kelas !== filter.selectedKelas) return false;

      // Status filter
      if (filter.selectedStatus && r.status !== filter.selectedStatus) return false;

      return true;
    });
  }, [records, filter]);

  // Unique list of teachers
  const uniqueTeachers = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach(t => set.add(t.nama));
    records.forEach(r => set.add(r.namaGuru));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [teachers, records]);

  // Per-teacher summaries for active filtered records
  const teacherSummaries = useMemo(() => {
    return calculateTeacherSummaries(filteredRecords);
  }, [filteredRecords]);

  // Today's Guru Piket (for WhatsApp report integration)
  const todayPiket = useMemo(() => {
    return guruPiketHistory.find(p => p.tanggal === todayStr) || null;
  }, [guruPiketHistory, todayStr]);

  // Check if live connected
  const isLiveConnected = Boolean(config.gasUrl && config.gasUrl.trim().startsWith('http'));

  // Sidebar navigation handler
  const handleSidebarNavigate = (item: NavItem) => {
    switch (item) {
      case 'dashboard':
        setActiveTab('logs');
        break;
      case 'logs':
        setActiveTab('logs');
        break;
      case 'summary':
        setActiveTab('summary');
        break;
      case 'input_kbm':
        setIsBulkModalOpen(true);
        break;
      case 'piket':
        setIsPiketModalOpen(true);
        break;
      case 'apel':
        setIsApelModalOpen(true);
        break;
      case 'jadwal':
        setIsJadwalModalOpen(true);
        break;
      case 'guru':
        setIsTeachersModalOpen(true);
        break;
      case 'guru_tanpa_jam':
        setIsTeachersWithoutScheduleModalOpen(true);
        break;
      case 'mapel':
        setIsSubjectsModalOpen(true);
        break;
      case 'share_wa':
        setIsWaModalOpen(true);
        break;
      case 'pdf':
        setIsPdfModalOpen(true);
        break;
      case 'csv':
        exportToCsv(filteredRecords, config);
        break;
      case 'settings':
        setIsSettingsModalOpen(true);
        break;
      case 'guide':
        setIsGuideModalOpen(true);
        break;
      case 'git_sync':
        setIsGitSyncModalOpen(true);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-sky-200 selection:text-sky-900">
      
      {/* 1. Sleek Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        config={config}
        activeItem={activeTab === 'summary' ? 'summary' : 'dashboard'}
        onNavigate={handleSidebarNavigate}
        isSyncing={isSyncing}
        isLiveConnected={isLiveConnected}
        lastSyncTime={lastSyncTime}
        onSync={() => handleSync(false)}
      />

      {/* Main Wrapper with Desktop Sidebar Offset */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300">
        
        {/* 2. Top Header Bar */}
        <Header
          config={config}
          lastSyncTime={lastSyncTime}
          isSyncing={isSyncing}
          onSync={() => handleSync(false)}
          onOpenAddModal={() => setIsBulkModalOpen(true)}
          onOpenPdfModal={() => setIsPdfModalOpen(true)}
          onOpenWaModal={() => setIsWaModalOpen(true)}
          onExportCsv={() => exportToCsv(filteredRecords, config)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onOpenGitSync={() => setIsGitSyncModalOpen(true)}
          isLiveConnected={isLiveConnected}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* 3. Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
          
          {/* Notification Toast Bar */}
          {syncNotice && (
            <div 
              className={`px-4 py-3 rounded-xl border text-xs font-medium flex items-center justify-between shadow-2xs transition-all duration-300 no-print ${
                syncNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : syncNotice.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : 'bg-sky-50 text-sky-900 border-sky-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {syncNotice.type === 'success' && <CheckCircle size={16} className="text-emerald-600 shrink-0" />}
                {syncNotice.type === 'error' && <AlertCircle size={16} className="text-rose-600 shrink-0" />}
                {syncNotice.type === 'info' && <Info size={16} className="text-sky-600 shrink-0" />}
                <span>{syncNotice.message}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSyncNotice(null)}
                className="text-slate-400 hover:text-slate-700 ml-3 text-xs"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Quick Action Cards Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 no-print">
            
            {/* 1. Input Presensi KBM */}
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="p-3 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all shadow-2xs flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <CalendarCheck size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 truncate">Input KBM Hari Ini</div>
                <div className="text-[10px] text-slate-400 truncate">Presensi harian</div>
              </div>
            </button>

            {/* 2. Guru Piket */}
            <button
              type="button"
              onClick={() => setIsPiketModalOpen(true)}
              className="p-3 bg-white hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 rounded-xl transition-all shadow-2xs flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Shield size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-900 truncate">Guru Piket</div>
                <div className="text-[10px] text-slate-400 truncate">4 Petugas harian</div>
              </div>
            </button>

            {/* 3. Wajib Apel */}
            <button
              type="button"
              onClick={() => setIsApelModalOpen(true)}
              className="p-3 bg-white hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 rounded-xl transition-all shadow-2xs flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Award size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 group-hover:text-amber-900 truncate">Wajib Apel Pagi</div>
                <div className="text-[10px] text-slate-400 truncate">Struktural & KBM 1</div>
              </div>
            </button>

            {/* 4. Jadwal KBM & Share WA */}
            <button
              type="button"
              onClick={() => setIsJadwalModalOpen(true)}
              className="p-3 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all shadow-2xs flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 truncate">Jadwal KBM</div>
                <div className="text-[10px] text-slate-400 truncate">Share format teks WA</div>
              </div>
            </button>

          </div>

          {/* Banner if Google Apps Script URL is empty */}
          {!isLiveConnected && (
            <div className="bg-gradient-to-r from-sky-900 to-sky-800 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white/10 rounded-xl shrink-0 mt-0.5">
                  <FileSpreadsheet size={24} className="text-yellow-300" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                    Sinkronisasi Google Spreadsheet ({config.NAMA_LEMBAGA || 'MA Darul Lughah Wal Karomah'})
                  </h2>
                  <p className="text-xs text-sky-150 mt-0.5 leading-relaxed max-w-2xl">
                    Hubungkan Google Spreadsheet Anda agar jadwal mingguan, data master guru (49 dewan guru), master mapel (33 mapel), rekap apel, dan piket tersinkronisasi realtime.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsGuideModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-sky-950 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-sm transition-all"
                >
                  <span>Lihat Panduan & Salin Script</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="px-3 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
                >
                  Masukkan URL
                </button>
              </div>
            </div>
          )}

          {/* 4. Summary KPI Overview Cards */}
          <StatsOverview records={filteredRecords} />

          {/* 5. Flexible Filter Bar */}
          <FilterBar
            filter={filter}
            onChangeFilter={setFilter}
            uniqueTeachers={uniqueTeachers}
            totalRecordsCount={records.length}
            filteredCount={filteredRecords.length}
          />

          {/* 6. View Switcher Tabs: Detailed Logs vs Teacher Summary */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 no-print">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'logs'
                    ? 'bg-sky-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers size={14} />
                <span>Daftar Log Presensi ({filteredRecords.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'summary'
                    ? 'bg-sky-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users size={14} />
                <span>Rekap Akumulasi Per Guru ({teacherSummaries.length})</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden sm:block">
              Periode: <strong className="text-slate-700 font-semibold">{formatIndonesianDate(filter.startDate, false)} s.d. {formatIndonesianDate(filter.endDate)}</strong>
            </div>
          </div>

          {/* 7. Active Tab Content */}
          {activeTab === 'logs' ? (
            <AttendanceTable
              records={filteredRecords}
              onDeleteRecord={handleDeleteRecord}
              onEditRecord={() => {
                setIsBulkModalOpen(true);
              }}
            />
          ) : (
            <TeacherSummaryTable
              summaries={teacherSummaries}
              config={config}
              onSelectTeacherForFilter={(teacherName) => {
                setFilter(prev => ({
                  ...prev,
                  selectedGuru: teacherName,
                }));
                setActiveTab('logs');
              }}
            />
          )}

        </main>

        {/* 8. Institutional Footer */}
        <footer className="bg-white border-t border-sky-100 py-6 mt-10 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            
            <div className="flex items-center gap-3">
              <MadarLogo size="sm" logoUrl={config.LOGO_URL} />
              <div>
                <p className="font-bold text-slate-700">
                  {config.NAMA_LEMBAGA || 'MA Darul Lughah Wal Karomah'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {config.NAMA_APLIKASI || 'SIRAMA'} • {config.KOTA || 'Kraksaan'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-500">
              <span>Waka Kurikulum: <strong>{config.NAMA_STAFF || 'Ust. Edi Amin, M.Hum.'}</strong></span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsGuideModalOpen(true)}
                className="text-sky-700 hover:underline font-medium"
              >
                Panduan Script & Vercel
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="text-sky-700 hover:underline font-medium"
              >
                Ekspor PDF
              </button>
            </div>

          </div>
        </footer>

      </div>

      {/* 9. Modals */}
      {/* BULK DAILY ATTENDANCE MODAL */}
      <BulkDailyAttendanceModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSaveDay={handleSaveDayAttendance}
        existingRecords={records}
        schedules={schedules}
        teachers={teachers}
        subjects={subjects}
      />

      {/* GURU PIKET MODAL */}
      <GuruPiketModal
        isOpen={isPiketModalOpen}
        onClose={() => setIsPiketModalOpen(false)}
        teachers={teachers}
        jadwalPiket={jadwalPiket}
        piketHistory={guruPiketHistory}
        onSavePiket={handleSaveGuruPiket}
        config={config}
      />

      {/* APEL ATTENDANCE MODAL */}
      <ApelAttendanceModal
        isOpen={isApelModalOpen}
        onClose={() => setIsApelModalOpen(false)}
        schedules={schedules}
        existingApelRecords={rekapApelHistory}
        onSaveApel={handleSaveRekapApel}
        config={config}
        teachers={teachers}
      />

      {/* DAILY SCHEDULE SHARE MODAL */}
      <DailyScheduleShareModal
        isOpen={isJadwalModalOpen}
        onClose={() => setIsJadwalModalOpen(false)}
        schedules={schedules}
        config={config}
        guruPiketHistory={guruPiketHistory}
        jadwalPiket={jadwalPiket}
      />

      {/* MASTER DATA TEACHERS MODAL (VIEW ONLY) */}
      <MasterTeachersModal
        isOpen={isTeachersModalOpen}
        onClose={() => setIsTeachersModalOpen(false)}
        teachers={teachers}
      />

      {/* TEACHERS WITHOUT SCHEDULE MODAL */}
      <TeachersWithoutScheduleModal
        isOpen={isTeachersWithoutScheduleModalOpen}
        onClose={() => setIsTeachersWithoutScheduleModalOpen(false)}
        teachers={teachers}
        schedules={schedules}
        config={config}
      />

      {/* MASTER DATA SUBJECTS MODAL (VIEW ONLY) */}
      <MasterSubjectsModal
        isOpen={isSubjectsModalOpen}
        onClose={() => setIsSubjectsModalOpen(false)}
        subjects={subjects}
      />

      {/* OFFICIAL PDF REPORT MODAL */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        records={records}
        config={config}
        filterState={filter}
        onChangeFilterState={setFilter}
      />

      {/* WHATSAPP SHARE MODAL (Included today's Guru Piket) */}
      <WhatsAppShareModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        records={filteredRecords}
        config={config}
        filterState={filter}
        piketToday={todayPiket}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetData={handleResetData}
        onOpenGitSync={() => setIsGitSyncModalOpen(true)}
      />

      {/* GAS GUIDE MODAL */}
      <GasGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* GITHUB SYNC MODAL */}
      <GitHubSyncModal
        isOpen={isGitSyncModalOpen}
        onClose={() => setIsGitSyncModalOpen(false)}
      />

    </div>
  );
}
