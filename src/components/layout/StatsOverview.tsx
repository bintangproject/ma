import React from 'react';
import { AttendanceRecord } from '../../types/attendance';
import { calculateSummary } from '../../utils/formatters';
import { 
  CheckCircle2, 
  FileText, 
  Stethoscope, 
  AlertCircle, 
  Briefcase, 
  Award 
} from 'lucide-react';

interface StatsOverviewProps {
  records: AttendanceRecord[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ records }) => {
  const stats = calculateSummary(records);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 no-print">
      
      {/* 1. Persentase Kehadiran */}
      <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-sky-100 shadow-2xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tingkat Kehadiran
          </span>
          <Award size={18} className="text-sky-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.persentase}%
          </span>
          <span className="text-xs font-medium text-slate-500">
            ({stats.hadirEfektif}/{stats.total} sesi)
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, stats.persentase))}%` }}
          />
        </div>
      </div>

      {/* 2. Hadir */}
      <div className="bg-white p-4 rounded-xl border border-emerald-100/80 shadow-2xs flex flex-col justify-between hover:border-emerald-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Hadir
          </span>
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-black text-slate-800">
            {stats.hadir}
          </span>
          <span className="text-xs text-slate-400 block font-normal mt-0.5">
            sesi KBM terlaksana
          </span>
        </div>
      </div>

      {/* 3. Izin */}
      <div className="bg-white p-4 rounded-xl border border-blue-100/80 shadow-2xs flex flex-col justify-between hover:border-blue-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
            Izin
          </span>
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={16} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-black text-slate-800">
            {stats.izin}
          </span>
          <span className="text-xs text-slate-400 block font-normal mt-0.5">
            dengan keterangan
          </span>
        </div>
      </div>

      {/* 4. Sakit */}
      <div className="bg-white p-4 rounded-xl border border-amber-100/80 shadow-2xs flex flex-col justify-between hover:border-amber-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            Sakit
          </span>
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Stethoscope size={16} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-black text-slate-800">
            {stats.sakit}
          </span>
          <span className="text-xs text-slate-400 block font-normal mt-0.5">
            surat keterangan
          </span>
        </div>
      </div>

      {/* 5. Alpa */}
      <div className="bg-white p-4 rounded-xl border border-rose-100/80 shadow-2xs flex flex-col justify-between hover:border-rose-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
            Alpa
          </span>
          <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
            <AlertCircle size={16} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-black text-rose-600">
            {stats.alpa}
          </span>
          <span className="text-xs text-slate-400 block font-normal mt-0.5">
            tanpa kabar
          </span>
        </div>
      </div>

      {/* 6. Tugas Dinas */}
      <div className="bg-white p-4 rounded-xl border border-indigo-100/80 shadow-2xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
            Tugas Dinas
          </span>
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Briefcase size={16} />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-black text-slate-800">
            {stats.tugasDinas}
          </span>
          <span className="text-xs text-slate-400 block font-normal mt-0.5">
            workshop / luar madrasah
          </span>
        </div>
      </div>

    </div>
  );
};
