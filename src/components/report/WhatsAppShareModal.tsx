import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AttendanceRecord, InstitutionConfig, FilterState } from '../../types/attendance';
import { generateWhatsAppMessage } from '../../utils/exportUtils';
import { Share2, Copy, Check, MessageSquare } from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  config: InstitutionConfig;
  filterState: FilterState;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  records,
  config,
  filterState,
}) => {
  const [copied, setCopied] = useState(false);

  const messageText = generateWhatsAppMessage(records, config, filterState);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = messageText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bagikan Rekap ke WhatsApp"
      subtitle="Format pesan rapi siap kirim ke Grup Pengajar atau Pimpinan Madrasah"
      icon={<MessageSquare size={20} className="text-emerald-600" />}
      maxWidth="lg"
    >
      <div className="space-y-4">
        
        {/* Preview Container */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700">
              Pratinjau Pesan WhatsApp:
            </span>
            <span className="text-[11px] text-slate-400">
              {messageText.length} karakter
            </span>
          </div>

          <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed border border-slate-800 shadow-inner">
            {messageText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-center"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700 font-bold">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Salin Teks Rekap</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-2xs transition-colors"
          >
            <Share2 size={14} />
            <span>Buka WhatsApp Sekarang</span>
          </button>
        </div>

      </div>
    </Modal>
  );
};
