import React from 'react';
import { AttendanceStatus } from '../../types/attendance';
import { STATUS_CONFIG } from '../../utils/formatters';
import { CheckCircle2, AlertCircle, FileText, Stethoscope, Briefcase, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.HADIR;

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (status) {
      case 'HADIR': return <CheckCircle2 size={iconSize} className="stroke-[2.5]" />;
      case 'SAKIT': return <Stethoscope size={iconSize} className="stroke-[2.5]" />;
      case 'IZIN': return <FileText size={iconSize} className="stroke-[2.5]" />;
      case 'ALPA': return <AlertCircle size={iconSize} className="stroke-[2.5]" />;
      case 'TUGAS_DINAS': return <Briefcase size={iconSize} className="stroke-[2.5]" />;
      case 'TERLAMBAT': return <Clock size={iconSize} className="stroke-[2.5]" />;
      default: return null;
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 font-medium' 
    : 'text-xs px-2.5 py-1 font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs ${config.badgeBg} ${sizeClasses}`}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};
