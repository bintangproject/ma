import React, { useState } from 'react';

interface MadarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  logoUrl?: string;
}

/**
 * Transforms GitHub blob/raw links, Google Drive links, or other URLs into high-speed direct CDN URLs.
 * Uses jsDelivr CDN for GitHub links to bypass CORS and prevent hotlinking blocks.
 */
export function parseDirectImageUrl(url?: string): string {
  if (!url || !url.trim()) return '';
  let trimmed = url.trim();

  // Strip query strings or hash for clean regex matching
  const cleanUrl = trimmed.split('?')[0].split('#')[0];

  // 1. Handle GitHub preview/blob/raw URLs:
  // e.g. https://github.com/contohdfi/tesfoto/blob/main/Logo%20Madin%20Up.png?raw=true
  // e.g. https://github.com/contohdfi/tesfoto/raw/main/Logo%20Madin%20Up.png
  const ghMatch = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)/i);
  if (ghMatch) {
    const [, user, repo, branch, filePath] = ghMatch;
    const encodedPath = filePath
      .split('/')
      .map(segment => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
    return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${encodedPath}`;
  }

  // 2. Handle raw.githubusercontent.com URLs:
  // e.g. https://raw.githubusercontent.com/contohdfi/tesfoto/main/Logo%20Madin%20Up.png
  const rawGhMatch = cleanUrl.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/(?:refs\/heads\/)?([^/]+)\/(.+)/i);
  if (rawGhMatch) {
    const [, user, repo, branch, filePath] = rawGhMatch;
    const encodedPath = filePath
      .split('/')
      .map(segment => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
    return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${encodedPath}`;
  }

  // 3. Handle Google Drive preview links:
  // e.g. https://drive.google.com/file/d/1B2C3D4E5F/view...
  const driveMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  return trimmed;
}

/**
 * Gets a secondary fallback URL for GitHub files (raw.githubusercontent.com)
 */
export function getAlternateRawUrl(url?: string): string {
  if (!url || !url.trim()) return '';
  const cleanUrl = url.trim().split('?')[0].split('#')[0];

  const ghMatch = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)/i);
  if (ghMatch) {
    const [, user, repo, branch, filePath] = ghMatch;
    const encodedPath = filePath.split('/').map(s => encodeURIComponent(decodeURIComponent(s))).join('/');
    return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${encodedPath}`;
  }
  return '';
}

export const MadarLogo: React.FC<MadarLogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = false,
  logoUrl = ''
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => parseDirectImageUrl(logoUrl));
  const [hasFailed, setHasFailed] = useState<boolean>(false);
  const [attempt, setAttempt] = useState<number>(1);

  // Setup URLs whenever logoUrl prop changes
  React.useEffect(() => {
    if (!logoUrl || !logoUrl.trim()) {
      setCurrentSrc('');
      setHasFailed(false);
      setAttempt(0);
      return;
    }

    const direct = parseDirectImageUrl(logoUrl);
    setCurrentSrc(direct);
    setHasFailed(false);
    setAttempt(1);
  }, [logoUrl]);

  const handleImageError = () => {
    // If the jsDelivr URL failed, try the raw.githubusercontent URL
    const altUrl = getAlternateRawUrl(logoUrl);
    if (attempt === 1 && altUrl && altUrl !== currentSrc) {
      setAttempt(2);
      setCurrentSrc(altUrl);
    } else if (attempt === 2 && logoUrl && logoUrl !== currentSrc) {
      // Try the raw input url directly
      setAttempt(3);
      setCurrentSrc(logoUrl);
    } else {
      // All image attempts failed, fall back to default SVG emblem
      setHasFailed(true);
    }
  };

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // If a valid custom logo URL is provided from Config sheet, render the image!
  if (currentSrc && !hasFailed) {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <img
          src={currentSrc}
          alt="Logo MA Darul Lughah Wal Karomah"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className={`${sizeMap[size]} object-contain flex-shrink-0 drop-shadow-sm select-none`}
        />
        {showSubtitle && (
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-sky-950 text-base tracking-tight">
              MA DARUL LUGHAH WAL KAROMAH
            </span>
            <span className="text-xs text-sky-700 font-medium">
              Sistem Presensi & Rekap Kurikulum
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback: Default High-Resolution SVG Emblem of MA Darul Lughah Wal Karomah
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 500 500"
        className={`${sizeMap[size]} flex-shrink-0 drop-shadow-sm select-none`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path
            id="textArcPath"
            d="M 95 240 A 180 180 0 0 1 405 240"
            fill="none"
          />
          <linearGradient id="madarBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#29B6F6" />
            <stop offset="50%" stopColor="#03A9F4" />
            <stop offset="100%" stopColor="#0288D1" />
          </linearGradient>
          <radialGradient id="globeGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
        </defs>

        {/* Outer Black Border & Yellow Ring */}
        <path
          d="M 250,20 
             C 310,20 375,55 410,105 
             C 445,155 480,225 465,300 
             C 450,375 395,445 340,465 
             C 300,480 270,470 250,470 
             C 230,470 200,480 160,465 
             C 105,445 50,375 35,300 
             C 20,225 55,155 90,105 
             C 125,55 190,20 250,20 Z"
          fill="#FFEB3B"
          stroke="#111827"
          strokeWidth="14"
          strokeLinejoin="round"
        />

        {/* Inner Cyan Blue Shield */}
        <path
          d="M 250,38 
             C 304,38 362,70 395,115 
             C 426,160 458,225 444,292 
             C 431,360 382,425 332,444 
             C 295,458 268,450 250,450 
             C 232,450 205,458 168,444 
             C 118,425 69,360 56,292 
             C 42,225 74,160 105,115 
             C 138,70 196,38 250,38 Z"
          fill="url(#madarBlue)"
          stroke="#111827"
          strokeWidth="9"
        />

        {/* Arched Text: MADRASAH ALIYAH */}
        <text
          fill="#111827"
          fontWeight="900"
          fontSize="40"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="4"
        >
          <textPath
            href="#textArcPath"
            startOffset="50%"
            textAnchor="middle"
          >
            MADRASAH ALIYAH
          </textPath>
        </text>

        {/* Stack of Kitab / Books on the left */}
        <g id="kitab-stack" stroke="#111827" strokeWidth="5" strokeLinejoin="round">
          <polygon points="175,225 210,235 210,275 175,265" fill="#FFFFFF" />
          <polygon points="175,225 190,215 225,225 210,235" fill="#F1F5F9" />
          <polygon points="210,235 225,225 225,265 210,275" fill="#CBD5E1" />

          <polygon points="190,225 225,235 225,275 190,265" fill="#FFFFFF" />
          <polygon points="190,225 205,215 240,225 225,235" fill="#F1F5F9" />
          <polygon points="225,235 240,225 240,265 225,275" fill="#CBD5E1" />
        </g>

        {/* Globe on the right */}
        <g id="globe">
          <circle
            cx="285"
            cy="245"
            r="44"
            fill="url(#globeGrad)"
            stroke="#111827"
            strokeWidth="5"
          />
          <path d="M 241,245 Q 285,255 329,245" stroke="#111827" strokeWidth="3" fill="none" />
          <path d="M 247,225 Q 285,233 323,225" stroke="#111827" strokeWidth="3" fill="none" />
          <path d="M 247,265 Q 285,273 323,265" stroke="#111827" strokeWidth="3" fill="none" />
          <ellipse cx="285" cy="245" rx="22" ry="44" stroke="#111827" strokeWidth="3" fill="none" />
          <line x1="285" y1="201" x2="285" y2="289" stroke="#111827" strokeWidth="3" />
        </g>

        {/* Mosque Dome / Minaret in Center */}
        <g id="minaret" stroke="#111827" strokeWidth="5">
          <rect x="238" y="195" width="16" height="75" fill="#E2E8F0" />
          <rect x="234" y="190" width="24" height="6" fill="#0F172A" />
          <path
            d="M 235,190 C 235,170 246,160 246,155 C 246,160 257,170 257,190 Z"
            fill="#0F172A"
          />
          <circle cx="246" cy="150" r="3.5" fill="#FFEB3B" stroke="none" />
          <line x1="246" y1="154" x2="246" y2="146" stroke="#111827" strokeWidth="2.5" />
        </g>

        {/* Open Holy Qur'an / Book at the bottom */}
        <g id="open-quran" stroke="#111827" strokeWidth="5.5" strokeLinejoin="round">
          <path
            d="M 140,360 Q 246,380 352,360 L 362,345 Q 246,365 130,345 Z"
            fill="#CBD5E1"
          />
          <path
            d="M 246,275 Q 185,268 140,285 L 135,348 Q 185,332 246,340 Z"
            fill="#FFFFFF"
          />
          <path d="M 160,296 Q 195,288 230,293" stroke="#64748B" strokeWidth="3" fill="none" />
          <path d="M 158,310 Q 195,302 230,307" stroke="#64748B" strokeWidth="3" fill="none" />
          <path d="M 156,324 Q 195,316 230,321" stroke="#64748B" strokeWidth="3" fill="none" />

          <path
            d="M 246,275 Q 307,268 352,285 L 357,348 Q 307,332 246,340 Z"
            fill="#FFFFFF"
          />
          <path d="M 262,293 Q 297,288 332,296" stroke="#64748B" strokeWidth="3" fill="none" />
          <path d="M 262,307 Q 297,302 334,310" stroke="#64748B" strokeWidth="3" fill="none" />
          <path d="M 262,321 Q 297,316 336,324" stroke="#64748B" strokeWidth="3" fill="none" />
        </g>

        {/* Golden Feather Quill Pen */}
        <g id="feather-quill" stroke="#111827" strokeWidth="4">
          <path
            d="M 312,230 
               C 305,250 280,270 232,325 
               C 255,305 285,285 305,245 
               Z"
            fill="#FFCA28"
          />
          <polygon points="232,325 228,332 236,329" fill="#1E293B" />
          <path d="M 315,225 Q 275,275 230,330" stroke="#B45309" strokeWidth="3" fill="none" />
        </g>

        {/* Institution Name at the bottom */}
        <text
          x="250"
          y="400"
          fill="#111827"
          fontWeight="800"
          fontSize="23"
          textAnchor="middle"
          letterSpacing="0.8"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          DARUL LUGHAH WAL KAROMAH
        </text>
        <text
          x="250"
          y="428"
          fill="#111827"
          fontWeight="900"
          fontSize="26"
          textAnchor="middle"
          letterSpacing="3"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          KRAKSAAN
        </text>
      </svg>

      {showSubtitle && (
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold text-sky-950 text-base tracking-tight">
            MA DARUL LUGHAH WAL KAROMAH
          </span>
          <span className="text-xs text-sky-700 font-medium">
            Sistem Presensi & Rekap Kurikulum
          </span>
        </div>
      )}
    </div>
  );
};
