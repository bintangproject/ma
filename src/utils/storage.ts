import { AttendanceRecord, InstitutionConfig, Teacher } from '../types/attendance';
import { DEFAULT_INSTITUTION_CONFIG, DEFAULT_TEACHERS, getInitialAttendanceRecords } from '../data/defaultData';

const STORAGE_KEYS = {
  RECORDS: 'madar_presensi_records_v1',
  CONFIG: 'madar_presensi_config_v1',
  TEACHERS: 'madar_presensi_teachers_v1',
  LAST_SYNC: 'madar_presensi_last_sync_v1',
};

export function loadStoredConfig(): InstitutionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      return { ...DEFAULT_INSTITUTION_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load stored config', e);
  }
  return DEFAULT_INSTITUTION_CONFIG;
}

export function saveStoredConfig(config: InstitutionConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config', e);
  }
}

export function loadStoredTeachers(): Teacher[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load teachers', e);
  }
  return DEFAULT_TEACHERS;
}

export function saveStoredTeachers(teachers: Teacher[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  } catch (e) {
    console.error('Failed to save teachers', e);
  }
}

export function loadStoredRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load records', e);
  }
  return getInitialAttendanceRecords();
}

export function saveStoredRecords(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
}

export function loadLastSyncTime(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch {
    return null;
  }
}

export function saveLastSyncTime(timeStr: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr);
  } catch {
    // Ignore
  }
}
