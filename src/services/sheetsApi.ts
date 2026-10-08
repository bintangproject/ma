import { AttendanceRecord, Teacher } from '../types/attendance';

export interface GasSyncResponse {
  success: boolean;
  message: string;
  data?: {
    attendance?: AttendanceRecord[];
    teachers?: Teacher[];
  };
}

/**
 * Fetch records from Google Apps Script Web App
 */
export async function fetchFromGoogleSheets(gasUrl: string): Promise<GasSyncResponse> {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum diisi dengan benar.',
    };
  }

  try {
    const targetUrl = new URL(gasUrl.trim());
    targetUrl.searchParams.set('action', 'getData');
    targetUrl.searchParams.set('t', Date.now().toString()); // prevent caching

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.status === 'success' || json.success === true) {
      return {
        success: true,
        message: 'Data berhasil disinkronkan dari Google Sheets!',
        data: {
          attendance: json.attendance || json.data?.attendance || [],
          teachers: json.teachers || json.data?.teachers || [],
        },
      };
    } else {
      return {
        success: false,
        message: json.message || 'Google Apps Script mengembalikan status gagal.',
      };
    }
  } catch (error: any) {
    console.error('GAS Fetch Error:', error);
    return {
      success: false,
      message: `Gagal menghubungkan ke Google Sheets: ${error.message || 'Periksa koneksi internet atau hak akses Web App (Set to: Anyone)'}`,
    };
  }
}

/**
 * Send a new attendance record to Google Apps Script Web App
 */
export async function postAttendanceToGAS(gasUrl: string, record: AttendanceRecord): Promise<GasSyncResponse> {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const payload = {
      action: 'addAttendance',
      record,
    };

    const response = await fetch(gasUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Prevents preflight CORS options check in GAS
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json().catch(() => ({ status: 'success' }));
    return {
      success: true,
      message: json.message || 'Data berhasil dikirim ke Google Sheets!',
    };
  } catch (error: any) {
    console.error('GAS Post Error:', error);
    return {
      success: false,
      message: `Gagal mengirim ke Google Sheets: ${error.message}`,
    };
  }
}

/**
 * Generates the clean Google Apps Script code for Google Sheets
 */
export function getGoogleAppsScriptTemplateCode(spreadsheetName = 'Database Presensi MA Darul Lughah Wal Karomah'): string {
  return `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - SISTEM REKAP KEHADIRAN PENGAJAR
 * MADRASAH ALIYAH DARUL LUGHAH WAL KAROMAH KRAKSAAN
 * =========================================================================
 * 
 * CARA PEMASANGAN DI GOOGLE SPREADSHEET:
 * 1. Buat Spreadsheet baru di Google Drive Anda.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus semua kode yang ada di editor, lalu PASTE SELURUH KODE INI.
 * 4. Klik ikon Save (Simpan).
 * 5. Klik tombol 'Terapkan' (Deploy) berwarna biru di kanan atas > 'Penerapan baru' (New deployment).
 * 6. Pilih jenis: 'Aplikasi Web' (Web App).
 *    - Deskripsi: SIMPRES MA DARUL LUGHAH WAL KAROMAH
 *    - Jalankan sebagai (Execute as): 'Saya' (Me)
 *    - Siapa yang memiliki akses (Who has access): 'Siapa saja' (Anyone)  <-- PENTING!
 * 7. Klik 'Terapkan' (Deploy) dan berikan izin akses Google Account Anda.
 * 8. Salin URL Aplikasi Web yang diberikan, lalu paste ke Pengaturan Aplikasi ini!
 */

const SHEET_PRESENSI = "Kehadiran";
const SHEET_GURU = "Daftar_Guru";

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheetsIfNeeded(ss);
    
    const attendanceSheet = ss.getSheetByName(SHEET_PRESENSI);
    const teacherSheet = ss.getSheetByName(SHEET_GURU);
    
    // Baca Data Kehadiran
    const attData = attendanceSheet.getDataRange().getValues();
    const attendance = [];
    if (attData.length > 1) {
      for (let i = 1; i < attData.length; i++) {
        const row = attData[i];
        if (!row[0] && !row[1]) continue;
        attendance.push({
          id: String(row[0] || 'rec-' + i),
          tanggal: formatDateString(row[1]),
          namaGuru: String(row[2] || ''),
          nip: String(row[3] || ''),
          mataPelajaran: String(row[4] || ''),
          kelas: String(row[5] || ''),
          jamKe: String(row[6] || ''),
          status: String(row[7] || 'HADIR').toUpperCase(),
          keterangan: String(row[8] || ''),
          waktuInput: String(row[9] || '')
        });
      }
    }
    
    // Baca Data Guru
    const tData = teacherSheet.getDataRange().getValues();
    const teachers = [];
    if (tData.length > 1) {
      for (let j = 1; j < tData.length; j++) {
        const trow = tData[j];
        if (!trow[1]) continue;
        teachers.push({
          id: String(trow[0] || 't-' + j),
          nama: String(trow[1] || ''),
          nip: String(trow[2] || ''),
          mataPelajaran: String(trow[3] || ''),
          jabatan: String(trow[4] || ''),
          telepon: String(trow[5] || '')
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      totalAttendance: attendance.length,
      totalTeachers: teachers.length,
      attendance: attendance,
      teachers: teachers
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheetsIfNeeded(ss);
    const sheet = ss.getSheetByName(SHEET_PRESENSI);
    
    const postData = JSON.parse(e.postData.contents);
    
    if (postData.action === "addAttendance" && postData.record) {
      const r = postData.record;
      sheet.appendRow([
        r.id || ('rec-' + new Date().getTime()),
        r.tanggal,
        r.namaGuru,
        "'" + (r.nip || '-'),
        r.mataPelajaran,
        r.kelas,
        r.jamKe,
        r.status,
        r.keterangan || '',
        r.waktuInput || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss")
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data presensi berhasil disimpan ke Google Sheets!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Aksi tidak dikenali."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function initSheetsIfNeeded(ss) {
  let attSheet = ss.getSheetByName(SHEET_PRESENSI);
  if (!attSheet) {
    attSheet = ss.insertSheet(SHEET_PRESENSI);
    attSheet.appendRow([
      "ID", "Tanggal", "Nama Guru", "NIP/NUPTK", "Mata Pelajaran", 
      "Kelas", "Jam Ke", "Status", "Keterangan", "Waktu Input"
    ]);
    attSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  }
  
  let teacherSheet = ss.getSheetByName(SHEET_GURU);
  if (!teacherSheet) {
    teacherSheet = ss.insertSheet(SHEET_GURU);
    teacherSheet.appendRow([
      "ID", "Nama Guru", "NIP/NUPTK", "Mata Pelajaran", "Jabatan", "No HP/WA"
    ]);
    teacherSheet.getRange("A1:F1").setFontWeight("bold").setBackground("#0369a1").setFontColor("#ffffff");
  }
}

function formatDateString(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Jakarta", "yyyy-MM-dd");
  }
  return String(val);
}
`;
}
