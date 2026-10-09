import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { getGoogleAppsScriptTemplateCode } from '../../services/sheetsApi';
import { 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  HelpCircle, 
  GitBranch, 
  Cloud,
  BookOpen,
  Calendar,
  Printer,
  Share2,
  PlusCircle,
  Database,
  CheckCircle2
} from 'lucide-react';

interface GasGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasGuideModal: React.FC<GasGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'usage' | 'gas' | 'vercel'>('usage');
  const [copiedCode, setCopiedCode] = useState(false);

  const gasCode = getGoogleAppsScriptTemplateCode();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gasCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Panduan Lengkap SIRAMA"
      subtitle="Panduan presensi KBM, Guru Piket, Wajib Apel, koneksi Google Sheets, dan deployment"
      icon={<HelpCircle size={20} />}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'usage'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen size={14} />
            <span>1. Cara Penggunaan Aplikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gas')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'gas'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code size={14} />
            <span>2. Koneksi Google Sheets (Database)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'vercel'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cloud size={14} />
            <span>3. Deploy ke GitHub & Vercel</span>
          </button>
        </div>

        {/* TAB 1: PANDUAN PENGGUNAAN APLIKASI */}
        {activeTab === 'usage' && (
          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
            
            <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-3.5">
              <h4 className="font-bold text-sky-950 text-sm mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-sky-700" />
                <span>Alur Kerja Cepat untuk Staff Kurikulum & Guru Piket</span>
              </h4>
              <p className="text-slate-600 text-[11px]">
                Aplikasi ini dirancang khusus untuk memudahkan administrasi kurikulum MA Darul Lughah Wal Karomah Kraksaan. Berikut 4 langkah utama penggunaannya:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Langkah 1: Input Presensi */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-sky-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <PlusCircle size={14} className="text-sky-600" />
                    <span>Input Presensi Cepat (Otomatis Hadir Semua)</span>
                  </h5>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Klik tombol <strong>"Input Presensi Hari Ini"</strong>. Sistem otomatis memuat seluruh jadwal KBM hari tersebut dan <strong>semua guru langsung terset HADIR</strong>. Anda hanya perlu mengubah status guru yang berhalangan:
                </p>
                <div className="flex flex-wrap gap-1 text-[10px] font-semibold">
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">Hadir</span>
                  <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">Izin</span>
                  <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">Sakit</span>
                  <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">Alpa</span>
                  <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">Tugas Dinas</span>
                </div>
                <p className="text-slate-500 text-[10px]">
                  Setelah itu klik <strong>"Simpan Daftar Hadir Hari Ini"</strong>. Semua sesi tersimpan sekaligus!
                </p>
              </div>

              {/* Langkah 2: Filter Rentang Tanggal */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-sky-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar size={14} className="text-sky-600" />
                    <span>Filter Periode Fleksibel</span>
                  </h5>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Pilih preset cepat: <strong>Hari Ini</strong>, <strong>Kemarin</strong>, <strong>Minggu Ini</strong>, atau <strong>Bulan Ini</strong>.
                </p>
                <p className="text-slate-600 text-[11px]">
                  Atau isi tanggal di kolom <strong>"Dari"</strong> s.d. <strong>"Sampai"</strong> untuk rekap khusus (misal 1 Oktober s.d. 15 Oktober). Data langsung tersaring otomatis!
                </p>
              </div>

              {/* Langkah 3: Ekspor PDF Resmi */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-sky-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Printer size={14} className="text-sky-600" />
                    <span>Cetak Laporan PDF Resmi</span>
                  </h5>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Klik tombol <strong>"Laporan PDF"</strong>. Dokumen sudah ber-<strong>KOP SURAT RESMI</strong> madrasah lengkap dengan logo dan tanda tangan Kepala Madrasah & Waka Kurikulum.
                </p>
                <p className="text-slate-600 text-[11px]">
                  Tersedia 2 format: <em>Rekap Akumulasi Per Guru</em> (bulanan) atau <em>Log Jurnal Rinci</em> (harian). Klik "Cetak / Simpan PDF".
                </p>
              </div>

              {/* Langkah 4: Share ke WhatsApp */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-sky-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">4</span>
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Share2 size={14} className="text-emerald-600" />
                    <span>Bagikan Rekap ke WhatsApp</span>
                  </h5>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Klik tombol <strong>"Share WA"</strong> untuk melihat format pesan rapi berisi persentase kehadiran dan daftar ustadz/ustadzah yang berhalangan hadir.
                </p>
                <p className="text-slate-600 text-[11px]">
                  Klik <strong>"Salin Teks"</strong> atau <strong>"Buka WhatsApp Sekarang"</strong> untuk dikirim langsung ke grup ustadz/ustadzah.
                </p>
              </div>

            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
              <span className="font-bold">💡 Tips:</span>
              <span>
                Anda bisa mengganti tampilan antara <strong>"Daftar Log Presensi"</strong> (catatan sesi mengajar) dan <strong>"Rekap Akumulasi Per Guru"</strong> (persentase kehadiran & disiplin guru) menggunakan tombol tab di bawah filter.
              </span>
            </div>

          </div>
        )}

        {/* TAB 2: GOOGLE APPS SCRIPT */}
        {activeTab === 'gas' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 space-y-2">
              <h4 className="font-bold text-sky-900 text-sm">
                Langkah Pemasangan di Google Spreadsheet:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>Buka Google Drive Anda, lalu buat <strong>Google Spreadsheet</strong> baru (misal beri judul: <em>"Database Presensi MA Darul Lughah Wal Karomah"</em>).</li>
                <li>Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
                <li>Hapus kode bawaan <code>function myFunction()</code> di editor.</li>
                <li>Klik tombol <strong>"Salin Kode Apps Script"</strong> di bawah ini, lalu paste ke editor tersebut.</li>
                <li>Klik tombol <strong>Simpan (Save)</strong> (ikon disket).</li>
                <li>Klik tombol biru <strong>Terapkan (Deploy)</strong> di kanan atas &gt; <strong>Penerapan baru (New deployment)</strong>.</li>
                <li>Pilih jenis ikon roda gigi &gt; <strong>Aplikasi web (Web app)</strong>:
                  <ul className="list-disc list-inside ml-4 text-[11px] text-slate-600 mt-1">
                    <li>Jalankan sebagai: <strong>Saya (email Anda)</strong></li>
                    <li>Siapa yang memiliki akses: <strong>Siapa saja (Anyone)</strong> <em>(Wajib agar webapp bisa membaca data tanpa login)</em></li>
                  </ul>
                </li>
                <li>Klik <strong>Terapkan (Deploy)</strong> dan izinkan izin akses akun Google Anda.</li>
                <li>Salin <strong>URL Aplikasi Web</strong> yang muncul (berakhiran <code>/exec</code>), lalu masukkan ke menu <strong>Pengaturan</strong> di aplikasi ini!</li>
                <li className="font-semibold text-sky-950 bg-sky-100/70 p-2 rounded-lg border border-sky-200 mt-1">
                  ⭐ <strong>Agar Langsung Terbuka Realtime di Semua Perangkat:</strong><br />
                  Taruh URL Web App tersebut langsung di dalam file <code>src/config/appConfig.ts</code> pada variabel <code>SPREADSHEET_GAS_URL</code>, lalu push ke GitHub. Dengan begitu, siapapun yang membuka webapp di HP, laptop, atau akun manapun akan langsung tersambung secara otomatis!
                </li>
              </ol>
            </div>

            {/* Code Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Kode Google Apps Script Siap Pakai:
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors text-xs"
                >
                  {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Kode Berhasil Disalin!' : 'Salin Kode Apps Script'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] max-h-60 overflow-y-auto border border-slate-800">
                <pre>{gasCode}</pre>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: GITHUB & VERCEL */}
        {activeTab === 'vercel' && (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <GitBranch size={16} className="text-sky-600" />
                <span>Cara Push ke GitHub dan Deploy ke Vercel (Gratis & Cepat):</span>
              </h4>

              <div className="space-y-2 text-slate-600">
                <p>
                  Aplikasi ini dirancang sebagai <strong>React Single Page Application (SPA)</strong> murni yang super ringan dan sepenuhnya kompatibel dengan hosting gratis Vercel, Netlify, atau GitHub Pages.
                </p>

                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                  <p className="font-bold text-sky-800"># 1. Inisialisasi Git & Push ke GitHub:</p>
                  <p>git init</p>
                  <p>git add .</p>
                  <p>git commit -m "feat: inisialisasi simpres MA Darul Lughah Wal Karomah"</p>
                  <p>git branch -M main</p>
                  <p>git remote add origin https://github.com/USERNAME-ANDA/simpres-madar.git</p>
                  <p>git push -u origin main</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <p className="font-bold text-sky-800"># 2. Deploy di Vercel (1 Menit):</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700">
                    <li>Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-sky-600 underline font-semibold">vercel.com</a> dan login dengan akun GitHub Anda.</li>
                    <li>Klik tombol <strong>"Add New..."</strong> &gt; <strong>Project</strong>.</li>
                    <li>Pilih repositori <strong>simpres-madar</strong> yang baru saja di-push.</li>
                    <li>Vercel akan otomatis mendeteksi framework <strong>Vite</strong>.</li>
                    <li>Klik tombol <strong>Deploy</strong>. Selesai! Webapp langsung aktif dan dapat diakses dari HP / Laptop manapun.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
              <Check size={16} className="text-emerald-600 shrink-0" />
              <span>
                <strong>Keuntungan Arsitektur Ini:</strong> Tidak memerlukan server database berbayar. Seluruh data tersimpan aman di Google Drive madrasah dalam Google Sheets, dan webapp dideploy gratis di Vercel!
              </span>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </Modal>
  );
};

