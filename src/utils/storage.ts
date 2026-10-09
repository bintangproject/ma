import { AttendanceRecord, InstitutionConfig, MasterGuru, MasterMapel, DayScheduleMap } from '../types/attendance';
import { 
  DEFAULT_INSTITUTION_CONFIG, 
  DEFAULT_MASTER_GURU, 
  DEFAULT_MASTER_MAPEL, 
  DEFAULT_WEEKLY_SCHEDULE, 
  getInitialAttendanceRecords 
} from '../data/defaultData';
import { APP_CONFIG } from '../config/appConfig';

const STORAGE_KEYS = {
  RECORDS: 'madar_simpres_records_v2',
  CONFIG: 'madar_simpres_config_v2',
  TEACHERS: 'madar_simpres_teachers_v2',
  SUBJECTS: 'madar_simpres_subjects_v2',
  SCHEDULES: 'madar_simpres_schedules_v2',
  LAST_SYNC: 'madar_simpres_last_sync_v2',
};

export function loadStoredConfig(): InstitutionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If code-level SPREADSHEET_GAS_URL is provided in appConfig.ts, prioritize it
      const gasUrl = APP_CONFIG.SPREADSHEET_GAS_URL || parsed.gasUrl || DEFAULT_INSTITUTION_CONFIG.gasUrl;
      
      // Auto-migrate old default logo if user had the previous test image
      let logoUrl = parsed.LOGO_URL;
      if (!logoUrl || logoUrl.includes('Logo%20Madin%20Up') || logoUrl.includes('Logo Madin Up')) {
        logoUrl = APP_CONFIG.DEFAULT_LOGO_URL;
      }

      let faviconUrl = parsed.FAVICON_URL;
      if (!faviconUrl || faviconUrl.includes('Logo%20Madin%20Up') || faviconUrl.includes('Logo Madin Up')) {
        faviconUrl = APP_CONFIG.DEFAULT_FAVICON_URL;
      }

      return { 
        ...DEFAULT_INSTITUTION_CONFIG, 
        ...parsed,
        gasUrl,
        LOGO_URL: logoUrl,
        FAVICON_URL: faviconUrl,
      };
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

export function loadStoredTeachers(): MasterGuru[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load teachers', e);
  }
  return DEFAULT_MASTER_GURU;
}

export function saveStoredTeachers(teachers: MasterGuru[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  } catch (e) {
    console.error('Failed to save teachers', e);
  }
}

export function loadStoredSubjects(): MasterMapel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load subjects', e);
  }
  return DEFAULT_MASTER_MAPEL;
}

export function saveStoredSubjects(subjects: MasterMapel[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function loadStoredSchedules(): DayScheduleMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Failed to load schedules', e);
  }
  return DEFAULT_WEEKLY_SCHEDULE;
}

export function saveStoredSchedules(schedules: DayScheduleMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  } catch (e) {
    console.error('Failed to save schedules', e);
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
