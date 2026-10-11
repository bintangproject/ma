import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { pushFileToGitHub, downloadProjectZip } from '../../services/githubApi';
import { GitBranch, Download, Check, AlertCircle, RefreshCw, ExternalLink, Key, Sparkles, CheckCircle2 } from 'lucide-react';
import { loadStoredConfig } from '../../utils/storage';
import { APP_CONFIG } from '../../config/appConfig';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [repoPath, setRepoPath] = useState('bintangproject/ma');
  const [branch, setBranch] = useState('main');
  const [token, setToken] = useState(() => localStorage.getItem('madar_github_token') || '');
  const [isPushing, setIsPushing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Files that fix the Vercel deployment issue
  const filesToPush: Record<string, string> = {
    'package.json': JSON.stringify({
      name: "simpres-ma-darul-lughah",
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite --port=3000 --host=0.0.0.0",
        build: "vite build",
        preview: "vite preview",
        lint: "tsc --noEmit"
      },
      dependencies: {
        "@google/genai": "^2.4.0",
        "@tailwindcss/vite": "^4.3.3",
        "@vitejs/plugin-react": "^6.1.1",
        "dotenv": "^17.2.3",
        "jszip": "^3.10.2",
        "lucide-react": "^0.546.0",
        "motion": "^12.23.24",
        "react": "^19.0.1",
        "react-dom": "^19.0.1",
        "vite": "^8.3.0"
      },
      devDependencies: {
        "@types/jszip": "^3.4.1",
        "@types/node": "^22.14.0",
        "@types/react": "^19.3.0",
        "@types/react-dom": "^19.3.0",
        "autoprefixer": "^10.4.21",
        "tailwindcss": "^4.3.3",
        "typescript": "^7.0.2"
      }
    }, null, 2),
    '.npmrc': 'legacy-peer-deps=true\n',
    'vercel.json': JSON.stringify({
      framework: "vite",
      installCommand: "npm install --legacy-peer-deps",
      buildCommand: "npm run build",
      outputDirectory: "dist",
      rewrites: [
        {
          source: "/(.*)",
          destination: "/index.html"
        }
      ]
    }, null, 2),
    'vite.config.ts': `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
`,
    'src/config/appConfig.ts': `export const APP_CONFIG = {
  // Database Google Apps Script Web App
  SPREADSHEET_GAS_URL: '${loadStoredConfig().gasUrl || APP_CONFIG.SPREADSHEET_GAS_URL || ''}',

  // Link Logo & Favicon CDN Resmi
  DEFAULT_LOGO_URL: 'https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/logo%20madar.png',
  DEFAULT_FAVICON_URL: 'https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/logo%20madar.png',
};
`,
    'index.html': `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rekap Kehadiran Guru MA Darul Lughah Wal Karomah</title>
    <meta name="description" content="Sistem Rekapitulasi Kehadiran Guru MA Darul Lughah Wal Karomah Kraksaan berbasis Google Sheets & Apps Script dengan ekspor PDF." />
    <meta property="og:title" content="Rekap Kehadiran Guru MA Darul Lughah Wal Karomah" />
    <meta property="og:description" content="Sistem Rekapitulasi Kehadiran Guru MA Darul Lughah Wal Karomah Kraksaan berbasis Google Sheets & Apps Script dengan ekspor PDF." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" id="dynamic-favicon" type="image/png" href="https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/logo%20madar.png" />
    <link rel="apple-touch-icon" href="https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/logo%20madar.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-800 antialiased font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  };

  const handlePushAuto = async () => {
    if (!token.trim()) {
      setResult({
        success: false,
        message: 'Masukkan GitHub Personal Access Token Anda terlebih dahulu.',
      });
      return;
    }

    const parts = repoPath.trim().split('/');
    if (parts.length !== 2) {
      setResult({
        success: false,
        message: 'Format nama repositori harus username/repo (contoh: bintangproject/ma)',
      });
      return;
    }

    const [owner, repo] = parts;
    setIsPushing(true);
    setResult(null);
    localStorage.setItem('madar_github_token', token.trim());

    try {
      const fileEntries = Object.entries(filesToPush);
      for (let i = 0; i < fileEntries.length; i++) {
        const [path, content] = fileEntries[i];
        setProgressMsg(`Mengunggah ${path} (${i + 1}/${fileEntries.length})...`);
        
        const pushRes = await pushFileToGitHub(
          owner, 
          repo, 
          path, 
          content, 
          token.trim(), 
          branch.trim(),
          `fix: resolve vercel dependency issue for ${path}`
        );

        if (!pushRes.success) {
          throw new Error(pushRes.message);
        }
      }

      setProgressMsg('');
      setResult({
        success: true,
        message: `Berhasil! Seluruh file konfigurasi berhasil di-push ke https://github.com/${owner}/${repo}. Vercel akan otomatis melakukan build ulang!`,
      });
    } catch (err: any) {
      setProgressMsg('');
      setResult({
        success: false,
        message: `Gagal sinkronisasi: ${err.message}`,
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleDownloadZip = async () => {
    await downloadProjectZip(filesToPush, 'perbaikan-vercel-simpres.zip');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sinkronkan Otomatis ke GitHub & Vercel"
      subtitle="Perbarui repositori GitHub bintangproject/ma langsung dari webapp tanpa terminal"
      icon={<GitBranch size={20} className="text-sky-600" />}
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        
        {/* Banner Penjelasan */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-sky-950 font-bold text-sm">
            <Sparkles size={16} className="text-sky-600" />
            <span>Sinkronisasi Otomatis 1-Klik</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Fitur ini akan secara otomatis memperbarui file <strong><code>package.json</code></strong> (menghapus esbuild yang bentrok), membuat <strong><code>.npmrc</code></strong> (legacy-peer-deps), dan <strong><code>vercel.json</code></strong> langsung ke repositori GitHub Anda. Begitu terkirim, Vercel akan otomatis mendeteksi dan melakukan build sampai berhasil!
          </p>
        </div>

        {/* Form Input Repositori */}
        <div className="space-y-3 bg-white border border-slate-200 p-4 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Repositori GitHub
              </label>
              <input
                type="text"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="bintangproject/ma"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Key size={13} className="text-sky-600" />
                <span>GitHub Personal Access Token (PAT)</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=SIMPRES-Vercel-AutoSync"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Buat Token di GitHub (1 Menit)</span>
                <ExternalLink size={11} />
              </a>
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Token hanya memerlukan centang pada hak akses <strong>repo</strong>. Token disimpan aman di browser lokal Anda.
            </p>
          </div>
        </div>

        {/* Progress or Result Message */}
        {progressMsg && (
          <div className="p-3 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl flex items-center gap-2">
            <RefreshCw size={14} className="animate-spin text-sky-600" />
            <span>{progressMsg}</span>
          </div>
        )}

        {result && (
          <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
            result.success
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {result.success ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />}
            <div>
              <p className="font-semibold">{result.message}</p>
              {result.success && (
                <a
                  href={`https://vercel.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>Buka Dashboard Vercel & Pantau Deployment</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDownloadZip}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Unduh file perbaikan dalam format .ZIP"
          >
            <Download size={14} />
            <span>Unduh File Perbaikan (.ZIP)</span>
          </button>

          <div className="w-full sm:w-auto flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePushAuto}
              disabled={isPushing}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <GitBranch size={14} />
              <span>{isPushing ? 'Menyinkronkan...' : '🚀 Push ke GitHub Sekarang'}</span>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
