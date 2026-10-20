import React, { useState } from 'react';
import { InstitutionConfig, AppUser } from '../../types/attendance';
import { MadarLogo } from '../common/MadarLogo';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  config: InstitutionConfig;
  users: AppUser[];
  onLogin: (user: AppUser) => void;
  onSyncUsers: () => Promise<{ success: boolean; message: string; count?: number }>;
  isSyncing: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  config,
  users,
  onLogin,
  onSyncUsers,
  isSyncing,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMessage('Silakan masukkan username akun Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user from spreadsheet users list
      // Matching is case-insensitive for username
      const matchedUser = users.find(
        (u) => u.username.trim().toLowerCase() === cleanUsername
      );

      if (!matchedUser) {
        setErrorMessage(
          `Username "${username}" tidak terdaftar di sheet 'Pengguna' Spreadsheet.`
        );
        setIsLoading(false);
        return;
      }

      // Check password if configured on user record
      const userPassword = (matchedUser.password || '').trim();
      if (userPassword && userPassword !== cleanPassword) {
        setErrorMessage('Kata sandi (password) salah. Silakan periksa kembali.');
        setIsLoading(false);
        return;
      }

      // Login success
      setIsLoading(false);
      onLogin(matchedUser);
    }, 250);
  };

  const handleTriggerSync = async () => {
    setSyncNotice(null);
    const result = await onSyncUsers();
    setSyncNotice(result);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-900/5 relative flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top institution accent ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-sky-600 to-yellow-400 sticky top-0 z-30" />

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-5">
          
          {/* Header Card / Institution Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-sm border border-slate-200/80 mb-1">
              <MadarLogo size="xl" logoUrl={config.LOGO_SIRAMA_URL || config.LOGO_URL} />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/90 text-sky-800 text-[11px] font-extrabold uppercase tracking-wider">
                <ShieldCheck size={13} className="text-sky-700" />
                <span>Portal Presensi & Rekapitulasi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {config.NAMA_APLIKASI || 'SIRAMA'}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-sky-900/80 leading-relaxed max-w-sm mx-auto">
                {config.KEPANJANGAN_APLIKASI || 'Sistem Informasi Rekap dan Absensi Pengajar Madrasah'}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {config.SINGKATAN || 'MA DARUL LUGHAH WAL KAROMAH'} • {config.KOTA || 'Kraksaan'}
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/90 p-6 sm:p-8 space-y-4">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Sync Notice */}
            {syncNotice && (
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                syncNotice.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {syncNotice.success ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-medium">{syncNotice.message}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    required
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    required
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-50/70 focus:bg-white border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 sm:py-3 px-4 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 active:from-sky-800 active:to-sky-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Masuk ke Web App</span>
                  </>
                )}
              </button>
            </form>

            {/* Subtle Sync Button */}
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-sky-600 transition-colors disabled:opacity-50"
                title="Perbarui daftar akun jika Anda baru saja mengubah akun di Spreadsheet"
              >
                <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Menyinkronkan data akun...' : 'Perbarui akun dari Spreadsheet'}</span>
              </button>
            </div>

          </div>

          {/* Footer note */}
          <div className="text-center text-[11px] text-slate-400 font-medium">
            SIRAMA &copy; {new Date().getFullYear()}
          </div>

        </div>
      </div>
    </div>
  );
};
