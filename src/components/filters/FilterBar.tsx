import React from 'react';
import { FilterState, DateFilterPreset } from '../../types/attendance';
import { 
  Calendar, 
  Search, 
  Filter, 
  RotateCcw, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Tag 
} from 'lucide-react';
import { KELAS_OPTIONS, MAPEL_OPTIONS } from '../../data/defaultData';
import { getMadarWeeklyRange, getMadarMonthlyRange, formatLocalISODate } from '../../utils/formatters';

interface FilterBarProps {
  filter: FilterState;
  onChangeFilter: (newFilter: FilterState) => void;
  uniqueTeachers: string[];
  totalRecordsCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  uniqueTeachers,
  totalRecordsCount,
  filteredCount,
}) => {
  // Helper to calculate date presets
  const applyPreset = (preset: DateFilterPreset) => {
    const today = new Date();

    let startDate = formatLocalISODate(today);
    let endDate = formatLocalISODate(today);

    if (preset === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      startDate = formatLocalISODate(y);
      endDate = formatLocalISODate(y);
    } else if (preset === 'this_week') {
      // Madrasah cycle: Sabtu s.d. Kamis
      const range = getMadarWeeklyRange(today);
      startDate = range.startDate;
      endDate = range.endDate;
    } else if (preset === 'this_month') {
      // Madrasah cycle: 26 bulan lalu s.d. 25 bulan ini
      const range = getMadarMonthlyRange(today);
      startDate = range.startDate;
      endDate = range.endDate;
    } else if (preset === 'all') {
      startDate = '2026-01-01';
      endDate = '2026-12-31';
    }

    onChangeFilter({
      ...filter,
      preset,
      startDate,
      endDate,
    });
  };

  const handleReset = () => {
    const monthlyRange = getMadarMonthlyRange(new Date());
    onChangeFilter({
      preset: 'this_month',
      startDate: monthlyRange.startDate,
      endDate: monthlyRange.endDate,
      searchQuery: '',
      selectedGuru: '',
      selectedKelas: '',
      selectedMapel: '',
      selectedStatus: '',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-sky-100 shadow-2xs p-4 sm:p-5 space-y-4 no-print">
      
      {/* Top Row: Presets & Date Range */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-3 border-b border-slate-100">
        
        {/* Presets Button Group */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar size={13} className="text-sky-600" />
            Periode:
          </span>

          <button
            type="button"
            onClick={() => applyPreset('today')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter.preset === 'today'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>

          <button
            type="button"
            onClick={() => applyPreset('yesterday')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter.preset === 'yesterday'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kemarin
          </button>

          <button
            type="button"
            onClick={() => applyPreset('this_week')}
            title="Siklus Mingguan Madrasah: Sabtu s.d. Kamis"
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter.preset === 'this_week'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Minggu Ini (Sabtu–Kamis)
          </button>

          <button
            type="button"
            onClick={() => applyPreset('this_month')}
            title="Siklus Bulanan Madrasah: Tgl 26 s.d. 25"
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter.preset === 'this_month'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bulan Ini (26–25)
          </button>

          <button
            type="button"
            onClick={() => onChangeFilter({ ...filter, preset: 'custom' })}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filter.preset === 'custom'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Rentang Kustom
          </button>
        </div>

        {/* Date Pickers (Dari tgl ... s/d tgl ...) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">Dari:</span>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) =>
                onChangeFilter({
                  ...filter,
                  preset: 'custom',
                  startDate: e.target.value,
                })
              }
              className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
            />
          </div>

          <span className="text-slate-400 text-xs font-medium">s/d</span>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">Sampai:</span>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) =>
                onChangeFilter({
                  ...filter,
                  preset: 'custom',
                  endDate: e.target.value,
                })
              }
              className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
            />
          </div>
        </div>

      </div>

      {/* Bottom Row: Detailed Dropdowns and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        
        {/* Search Query */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari guru / ket..."
            value={filter.searchQuery}
            onChange={(e) => onChangeFilter({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white"
          />
        </div>

        {/* Filter Guru */}
        <div className="relative">
          <select
            value={filter.selectedGuru}
            onChange={(e) => onChangeFilter({ ...filter, selectedGuru: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700"
          >
            <option value="">Semua Guru ({uniqueTeachers.length})</option>
            {uniqueTeachers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Mapel */}
        <div className="relative">
          <select
            value={filter.selectedMapel}
            onChange={(e) => onChangeFilter({ ...filter, selectedMapel: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700"
          >
            <option value="">Semua Mapel</option>
            {MAPEL_OPTIONS.map((mapel) => (
              <option key={mapel} value={mapel}>
                {mapel}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Kelas */}
        <div className="relative">
          <select
            value={filter.selectedKelas}
            onChange={(e) => onChangeFilter({ ...filter, selectedKelas: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700"
          >
            <option value="">Semua Kelas</option>
            {KELAS_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status & Reset */}
        <div className="flex items-center gap-2">
          <select
            value={filter.selectedStatus}
            onChange={(e) => onChangeFilter({ ...filter, selectedStatus: e.target.value })}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-700"
          >
            <option value="">Semua Status</option>
            <option value="HADIR">Hadir</option>
            <option value="IZIN">Izin</option>
            <option value="SAKIT">Sakit</option>
            <option value="ALPA">Alpa / Tanpa Ket.</option>
            <option value="TUGAS_DINAS">Tugas Dinas</option>
          </select>

          <button
            type="button"
            onClick={handleReset}
            title="Reset semua filter"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw size={14} />
          </button>
        </div>

      </div>

      {/* Info Bar Filter Active */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Menampilkan <strong className="text-sky-700">{filteredCount}</strong> dari {totalRecordsCount} data presensi
        </span>
        
        {(filter.searchQuery || filter.selectedGuru || filter.selectedKelas || filter.selectedMapel || filter.selectedStatus) && (
          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Penyaringan aktif
          </span>
        )}
      </div>

    </div>
  );
};
