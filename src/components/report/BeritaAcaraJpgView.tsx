import React from 'react';
import { AttendanceRecord } from '../../types/attendance';
import { parseDirectImageUrl } from '../common/MadarLogo';

interface BeritaAcaraJpgViewProps {
  records: AttendanceRecord[];
  periodeText: string;
  stats: any;
  logoUrl: string;
  base64Logo: string;
}

export const BeritaAcaraJpgView: React.FC<BeritaAcaraJpgViewProps> = ({ records, periodeText, stats, logoUrl, base64Logo }) => {
  // Group records by class
  const groupedRecords = records.reduce((acc, r) => {
    if (!acc[r.kelas]) acc[r.kelas] = [];
    acc[r.kelas].push(r);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const classes = Object.keys(groupedRecords).sort((a, b) => a.localeCompare(b));

  return (
    <div className="p-4 bg-white text-slate-900 w-[800px]">
      <div className="grid grid-cols-3 gap-4">
        {/* Info Box */}
        <div className="border border-slate-300 p-2 bg-slate-50 flex flex-col justify-center items-center text-center">
          <img src={base64Logo || parseDirectImageUrl(logoUrl)} alt="Logo" className="w-16 h-16 mb-4 object-contain" />
          <h2 className="text-base font-bold uppercase">Berita Acara KBM MADAR</h2>
          <p className="text-xs font-semibold mt-1">Periode: {periodeText}</p>
          <div className="mt-2 text-sm font-bold text-emerald-700">Tingkat Kehadiran: {stats.persentase}%</div>
        </div>

        {classes.map(kelas => {
          const recordsInClass = groupedRecords[kelas].sort((a, b) => Number(a.jam) - Number(b.jam));
          return (
            <div key={kelas} className="border border-slate-300">
              <h3 className="font-bold bg-slate-100 p-1 border-b border-slate-300 text-center text-xs">Kelas {kelas}</h3>
              <table className="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <th className="border-r border-slate-300 p-1 text-center">Jam</th>
                    <th className="border-r border-slate-300 p-1 text-center">Mapel</th>
                    <th className="border-r border-slate-300 p-1 text-center">Pengajar</th>
                    <th className="p-1 text-center">Ket</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsInClass.map(r => {
                    let rowColor = '';
                    if (r.status === 'ALPA') rowColor = 'bg-rose-100';
                    else if (r.status === 'IZIN' || r.status === 'SAKIT') rowColor = 'bg-yellow-100';
                    else if (r.status === 'TUGAS_DINAS') rowColor = 'bg-sky-100';

                    const statusShort = r.status === 'HADIR' ? '' :
                      r.status === 'IZIN' ? 'I' :
                      r.status === 'SAKIT' ? 'S' :
                      r.status === 'ALPA' ? 'A' :
                      r.status === 'TUGAS_DINAS' ? 'TD' : r.status;

                    return (
                      <tr key={r.id} className={`border-b border-slate-200 last:border-b-0 ${rowColor}`}>
                        <td className="border-r border-slate-300 p-1 text-center">{r.jam}</td>
                        <td className="border-r border-slate-300 p-1 text-left truncate max-w-[60px]">{r.mataPelajaran}</td>
                        <td className="border-r border-slate-300 p-1 text-left truncate max-w-[80px]">{r.namaGuru}</td>
                        <td className="p-1 text-center font-bold">{statusShort}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
