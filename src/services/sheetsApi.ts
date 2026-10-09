import { AttendanceRecord, MasterGuru, MasterMapel, DayScheduleMap, InstitutionConfig, GuruPiketRecord, ApelAttendanceRecord } from '../types/attendance';

export interface GasSyncResponse {
  success: boolean;
  message: string;
  data?: {
    attendance?: AttendanceRecord[];
    teachers?: MasterGuru[];
    subjects?: MasterMapel[];
    schedules?: DayScheduleMap;
    config?: Partial<InstitutionConfig>;
    guruPiket?: GuruPiketRecord[];
    jadwalPiket?: Record<string, string[]>;
    rekapApel?: ApelAttendanceRecord[];
  };
}

/**
 * Fetch everything from Google Apps Script Web App
 */
export async function fetchFromGoogleSheets(gasUrl: string): Promise<GasSyncResponse> {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum diisi.',
    };
  }

  try {
    const targetUrl = new URL(gasUrl.trim());
    targetUrl.searchParams.set('action', 'getAllData');
    targetUrl.searchParams.set('t', Date.now().toString());

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
      // Normalize config keys from Google Sheets (handles lowercase, uppercase, spaces)
      const rawConfig = json.config || {};
      const normalizedConfig: Partial<InstitutionConfig> = {};
      for (const [k, v] of Object.entries(rawConfig)) {
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          const valStr = String(v).trim();
          const cleanKey = k.trim().toUpperCase().replace(/[\s-]+/g, '_');
          (normalizedConfig as any)[cleanKey] = valStr;
          
          if (cleanKey === 'LOGO' || cleanKey === 'LINK_LOGO' || cleanKey === 'LOGO_LINK') {
            normalizedConfig.LOGO_URL = valStr;
          }
          if (cleanKey === 'FAVICON' || cleanKey === 'LINK_FAVICON' || cleanKey === 'ICON') {
            normalizedConfig.FAVICON_URL = valStr;
          }
          if (cleanKey === 'PERSEN_SANGAT_BAIK') {
            normalizedConfig.PERSEN_SANGAT_BAIK = Number(valStr) || 90;
          }
          if (cleanKey === 'PERSEN_BAIK') {
            normalizedConfig.PERSEN_BAIK = Number(valStr) || 80;
          }
          if (cleanKey === 'PERSEN_CUKUP') {
            normalizedConfig.PERSEN_CUKUP = Number(valStr) || 70;
          }
        }
      }

      // Default logo URLs if empty
      if (!normalizedConfig.LOGO_URL) {
        normalizedConfig.LOGO_URL = 'https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/logo%20madar.png';
      }
      if (!normalizedConfig.LOGO_SIRAMA_URL) {
        normalizedConfig.LOGO_SIRAMA_URL = 'https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/Logo%20SIRAMA.png';
      }
      if (!normalizedConfig.FAVICON_URL) {
        normalizedConfig.FAVICON_URL = normalizedConfig.LOGO_SIRAMA_URL || normalizedConfig.LOGO_URL;
      }
      if (!normalizedConfig.NAMA_APLIKASI) {
        normalizedConfig.NAMA_APLIKASI = 'SIRAMA';
      }
      if (!normalizedConfig.KEPANJANGAN_APLIKASI) {
        normalizedConfig.KEPANJANGAN_APLIKASI = 'Sistem Informasi Rekap dan Absensi Pengajar Madrasah';
      }

      return {
        success: true,
        message: 'Data berhasil disinkronkan dari Google Sheets!',
        data: {
          attendance: json.attendance || [],
          teachers: json.teachers || [],
          subjects: json.subjects || [],
          schedules: json.schedules || {},
          config: normalizedConfig,
          guruPiket: json.guruPiket || [],
          jadwalPiket: json.jadwalPiket || {},
          rekapApel: json.rekapApel || [],
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
      message: `Gagal menghubungkan ke Google Sheets: ${error.message || 'Periksa koneksi atau hak akses Web App (Set to: Anyone)'}`,
    };
  }
}

/**
 * Save an entire day's attendance records in bulk to Google Sheets
 */
export async function postBulkDayAttendance(
  gasUrl: string, 
  tanggal: string, 
  records: AttendanceRecord[]
): Promise<GasSyncResponse> {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const payload = {
      action: 'saveDayAttendance',
      tanggal,
      records,
    };

    const response = await fetch(gasUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let json: any = {};
    try {
      json = JSON.parse(rawText);
    } catch {
      json = { status: response.ok ? 'success' : 'error' };
    }

    if (json.status === 'error') {
      return {
        success: false,
        message: `Gagal menyimpan ke Google Sheets: ${json.message || 'Script mengembalikan status error'}`,
      };
    }

    return {
      success: true,
      message: json.message || `Daftar hadir tanggal ${tanggal} berhasil disimpan ke Google Sheets!`,
    };
  } catch (error: any) {
    console.error('GAS Post Bulk Error:', error);
    return {
      success: false,
      message: `Gagal mengirim ke Google Sheets: ${error.message || 'Koneksi terputus'}`,
    };
  }
}

/**
 * Save Guru Piket for a day to Google Sheets
 */
export async function postBulkGuruPiket(
  gasUrl: string,
  piketRecord: GuruPiketRecord
): Promise<GasSyncResponse> {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const payload = {
      action: 'saveGuruPiket',
      piket: piketRecord,
    };

    const response = await fetch(gasUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let json: any = {};
    try {
      json = JSON.parse(rawText);
    } catch {
      json = { status: response.ok ? 'success' : 'error' };
    }

    if (json.status === 'error') {
      return {
        success: false,
        message: `Gagal menyimpan Guru Piket ke Google Sheets: ${json.message || 'Script error'}`,
      };
    }

    return {
      success: true,
      message: json.message || 'Data Guru Piket berhasil disimpan ke Google Sheets!',
    };
  } catch (error: any) {
    console.error('GAS Post Guru Piket Error:', error);
    return {
      success: false,
      message: `Gagal mengirim data Guru Piket ke Google Sheets: ${error.message}`,
    };
  }
}

/**
 * Save Rekap Apel Pagi to Google Sheets
 */
export async function postBulkRekapApel(
  gasUrl: string,
  tanggal: string,
  records: ApelAttendanceRecord[]
): Promise<GasSyncResponse> {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const payload = {
      action: 'saveRekapApel',
      tanggal,
      records,
    };

    const response = await fetch(gasUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let json: any = {};
    try {
      json = JSON.parse(rawText);
    } catch {
      json = { status: response.ok ? 'success' : 'error' };
    }

    if (json.status === 'error') {
      return {
        success: false,
        message: `Gagal menyimpan Rekap Apel ke Google Sheets: ${json.message || 'Script error'}`,
      };
    }

    return {
      success: true,
      message: json.message || 'Data Presensi Apel berhasil disimpan ke Google Sheets!',
    };
  } catch (error: any) {
    console.error('GAS Post Rekap Apel Error:', error);
    return {
      success: false,
      message: `Gagal mengirim data Apel ke Google Sheets: ${error.message}`,
    };
  }
}

/**
 * Save updated configuration to Google Sheets Config sheet
 */
export async function postSaveConfig(
  gasUrl: string,
  newConfig: Partial<InstitutionConfig>
): Promise<GasSyncResponse> {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const payload = {
      action: 'saveConfig',
      config: newConfig,
    };

    const response = await fetch(gasUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let json: any = {};
    try {
      json = JSON.parse(rawText);
    } catch {
      json = { status: response.ok ? 'success' : 'error' };
    }

    if (json.status === 'error') {
      return {
        success: false,
        message: `Gagal menyimpan konfigurasi ke Google Sheets: ${json.message || 'Script error'}`,
      };
    }

    return {
      success: true,
      message: json.message || 'Pengaturan berhasil diperbarui di Google Sheets!',
    };
  } catch (error: any) {
    console.error('GAS Post Config Error:', error);
    return {
      success: false,
      message: `Gagal mengirim konfigurasi: ${error.message}`,
    };
  }
}

/**
 * Trigger remote setup of all database sheets on Google Spreadsheet
 */
export async function postSetupDatabase(gasUrl: string): Promise<GasSyncResponse> {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const payload = {
      action: 'setupDatabase',
    };

    const response = await fetch(gasUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let json: any = {};
    try {
      json = JSON.parse(rawText);
    } catch {
      json = { status: response.ok ? 'success' : 'error' };
    }

    if (json.status === 'error') {
      return {
        success: false,
        message: `Gagal inisialisasi database: ${json.message}`,
      };
    }

    return {
      success: true,
      message: json.message || 'Seluruh struktur sheet database berhasil diinisialisasi!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal inisialisasi database: ${error.message}`,
    };
  }
}

/**
 * Generates the complete Google Apps Script code for Google Sheets
 */
export function getGoogleAppsScriptTemplateCode(): string {
  return `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - SIRAMA v2.2
 * (Sistem Informasi Rekap dan Absensi Pengajar Madrasah)
 * MADRASAH ALIYAH DARUL LUGHAH WAL KAROMAH KRAKSAAN
 * =========================================================================
 * 
 * PANDUAN CEPAT PEMASANGAN DI GOOGLE SPREADSHEET:
 * 1. Buka Google Spreadsheet baru/lama di Google Drive Anda.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus seluruh isi Code.gs, lalu PASTE SELURUH KODE DI BAWAH INI.
 * 4. Klik ikon Save (Simpan) / Ctrl+S.
 * 5. SETUP OTOMATIS: Pilih fungsi 'setupDatabaseAwal' di dropdown atas,
 *    lalu klik tombol ▶ 'Run' (Jalankan) sekali saja.
 *    -> Seluruh 12 Sheet (Config, Master Guru, Jadwal Piket, Kehadiran, dll)
 *       akan otomatis dibuat dan terisi lengkap!
 * 6. DEPLOY APLIKASI WEB:
 *    - Klik tombol biru 'Terapkan' (Deploy) di pojok kanan atas > 'Penerapan baru' (New deployment).
 *    - Pilih jenis: 'Aplikasi Web' (Web App).
 *    - Deskripsi: SIRAMA Web App v2.
 *    - Jalankan sebagai: 'Saya' (Me).
 *    - Siapa yang memiliki akses: 'Siapa saja' (Anyone)  <-- SANGAT PENTING!
 *    - Klik 'Terapkan' (Deploy), berikan izin Google jika diminta.
 * 7. Salin URL Aplikasi Web (berakhiran /exec) dan paste ke Pengaturan SIRAMA.
 */

const SHEET_CONFIG = "Config";
const SHEET_GURU = "Master_Guru";
const SHEET_MAPEL = "Master_Mapel";
const SHEET_KEHADIRAN = "Kehadiran";
const SHEET_JADWAL_PIKET = "Jadwal_Piket";
const SHEET_PIKET = "Guru_Piket";
const SHEET_APEL = "Rekap_Apel";
const HARI_LIST = ["Sabtu", "Ahad", "Senin", "Selasa", "Rabu", "Kamis"];

/**
 * FUNGSI UTAMA: Inisialisasi Otomatis Seluruh Database Spreadsheet
 * Pilih fungsi ini di editor Apps Script lalu klik tombol ▶ 'Jalankan' (Run).
 */
function setupDatabaseAwal() {
  setupInitialDatabase();
  Logger.log("✅ Berhasil! Seluruh 12 Sheet Database SIRAMA telah dibuat & terisi lengkap.");
}

/**
 * Tes Koneksi ke Spreadsheet
 */
function testKoneksi() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const info = "Terhubung: " + ss.getName() + " (" + ss.getSheets().length + " sheets)";
  Logger.log(info);
  return info;
}

/**
 * HANDLER GET: Membaca seluruh data dari spreadsheet & Fallback aksi
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Fallback: Jika dipanggil dengan parameter aksi
    if (e && e.parameter && e.parameter.action) {
      return handleAction(ss, e.parameter);
    }

    // 1. Baca Config
    const config = {};
    const cfgSheet = ss.getSheetByName(SHEET_CONFIG);
    if (cfgSheet) {
      const cfgData = cfgSheet.getDataRange().getValues();
      if (cfgData.length > 0) {
        const firstCol = String(cfgData[0][0] || '').trim().toUpperCase();
        const hasHeader = firstCol === 'KEY' || firstCol === 'PARAMETER' || firstCol === 'NAMA';
        const startIdx = hasHeader ? 1 : 0;

        for (let i = startIdx; i < cfgData.length; i++) {
          const k = String(cfgData[i][0] || '').trim();
          const v = String(cfgData[i][1] || '').trim();
          if (k) {
            config[k] = v;
            const normKey = k.toUpperCase().replace(/[\s-]+/g, '_');
            config[normKey] = v;
          }
        }
      }
    }

    // 2. Baca Master Guru (termasuk kolom keterangan: jabatan struktural vs guru)
    const teachers = [];
    const guruSheet = ss.getSheetByName(SHEET_GURU);
    if (guruSheet) {
      const gData = guruSheet.getDataRange().getValues();
      for (let i = 1; i < gData.length; i++) {
        if (!gData[i][1]) continue;
        teachers.push({
          kode: String(gData[i][0] || ('G' + (i < 10 ? '0' : '') + i)),
          nama: String(gData[i][1] || '').trim(),
          keterangan: String(gData[i][2] || '').trim()
        });
      }
    }

    // 3. Baca Master Mapel
    const subjects = [];
    const mapelSheet = ss.getSheetByName(SHEET_MAPEL);
    if (mapelSheet) {
      const mData = mapelSheet.getDataRange().getValues();
      for (let i = 1; i < mData.length; i++) {
        if (!mData[i][1]) continue;
        subjects.push({
          kode: String(mData[i][0] || ('M' + (i < 10 ? '0' : '') + i)),
          nama: String(mData[i][1] || '').trim()
        });
      }
    }

    // 4. Baca Jadwal Guru Piket Mingguan
    const jadwalPiket = {};
    HARI_LIST.forEach(function(hari) {
      jadwalPiket[hari] = [];
    });
    const jpSheet = ss.getSheetByName(SHEET_JADWAL_PIKET);
    if (jpSheet) {
      const jpData = jpSheet.getDataRange().getValues();
      for (let i = 1; i < jpData.length; i++) {
        const h = String(jpData[i][0] || '').trim();
        if (h) {
          jadwalPiket[h] = [
            String(jpData[i][1] || '').trim(),
            String(jpData[i][2] || '').trim(),
            String(jpData[i][3] || '').trim(),
            String(jpData[i][4] || '').trim()
          ].filter(Boolean);
        }
      }
    }

    // 5. Baca Jadwal Mingguan per Hari
    const schedules = {};
    HARI_LIST.forEach(function(hari) {
      schedules[hari] = [];
      const hSheet = ss.getSheetByName(hari);
      if (hSheet) {
        const hData = hSheet.getDataRange().getValues();
        for (let i = 1; i < hData.length; i++) {
          if (!hData[i][0] && !hData[i][2] && !hData[i][3]) continue;
          schedules[hari].push({
            id: hari.toLowerCase() + '-' + i,
            hari: hari,
            kelas: String(hData[i][0] || ''),
            jam: hData[i][1],
            mataPelajaran: String(hData[i][2] || ''),
            guruPengampu: String(hData[i][3] || '')
          });
        }
      }
    });

    // 6. Baca Sheet Utama Kehadiran (KBM)
    const attendance = [];
    const attSheet = ss.getSheetByName(SHEET_KEHADIRAN);
    if (attSheet) {
      const attData = attSheet.getDataRange().getValues();
      for (let i = 1; i < attData.length; i++) {
        const row = attData[i];
        if (!row[1] && !row[6]) continue;
        attendance.push({
          id: String(row[0] || ('rec-' + i)),
          tanggal: formatDateString(row[1]),
          hari: String(row[2] || ''),
          kelas: String(row[3] || ''),
          jam: row[4],
          mataPelajaran: String(row[5] || ''),
          namaGuru: String(row[6] || ''),
          status: String(row[7] || 'HADIR').toUpperCase(),
          keterangan: String(row[8] || ''),
          waktuInput: String(row[9] || '')
        });
      }
    }

    // 7. Baca Sheet Guru Piket Harian
    const guruPiket = [];
    const piketSheet = ss.getSheetByName(SHEET_PIKET);
    if (piketSheet) {
      const pData = piketSheet.getDataRange().getValues();
      for (let i = 1; i < pData.length; i++) {
        const row = pData[i];
        if (!row[1]) continue;
        guruPiket.push({
          id: String(row[0] || ('pkt-' + i)),
          tanggal: formatDateString(row[1]),
          hari: String(row[2] || ''),
          piket1: String(row[3] || ''),
          piket2: String(row[4] || ''),
          piket3: String(row[5] || ''),
          piket4: String(row[6] || ''),
          keterangan: String(row[7] || ''),
          waktuInput: String(row[8] || '')
        });
      }
    }

    // 8. Baca Sheet Rekap Apel Pagi
    const rekapApel = [];
    const apelSheet = ss.getSheetByName(SHEET_APEL);
    if (apelSheet) {
      const aData = apelSheet.getDataRange().getValues();
      for (let i = 1; i < aData.length; i++) {
        const row = aData[i];
        if (!row[1] && !row[3]) continue;
        rekapApel.push({
          id: String(row[0] || ('apl-' + i)),
          tanggal: formatDateString(row[1]),
          hari: String(row[2] || ''),
          nama: String(row[3] || ''),
          kategori: String(row[4] || 'STRUKTURAL'),
          jabatanAtauJadwal: String(row[5] || ''),
          status: String(row[6] || 'HADIR').toUpperCase(),
          keterangan: String(row[7] || ''),
          waktuInput: String(row[8] || '')
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      config: config,
      teachers: teachers,
      subjects: subjects,
      schedules: schedules,
      jadwalPiket: jadwalPiket,
      attendance: attendance,
      guruPiket: guruPiket,
      rekapApel: rekapApel
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HANDLER POST: Menyimpan data dari aplikasi web SIRAMA
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!e) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Request kosong. Panggil via HTTP POST dari aplikasi SIRAMA."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    let postData = null;
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (ex) {
        postData = null;
      }
    }
    if (!postData && e.parameter) {
      postData = e.parameter;
    }

    if (!postData) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Data JSON tidak valid atau kosong."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return handleAction(ss, postData);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Eksekutor Aksi Penyimpanan Data
 */
function handleAction(ss, postData) {
  const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

  // AKSI 1: Inisialisasi Database
  if (postData.action === "setupDatabase") {
    setupInitialDatabase();
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Database SIRAMA berhasil diinisialisasi lengkap!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // AKSI 2: Simpan Presensi KBM Harian (Bulk Save Cepat & Aman)
  if (postData.action === "saveDayAttendance") {
    let attSheet = ss.getSheetByName(SHEET_KEHADIRAN);
    if (!attSheet) {
      attSheet = ss.insertSheet(SHEET_KEHADIRAN);
      attSheet.appendRow(["ID", "Tanggal", "Hari", "Kelas", "Jam", "Mata Pelajaran", "Guru Pengampu", "Status", "Keterangan", "Waktu Input"]);
      attSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
    }

    const targetDate = formatDateString(postData.tanggal);
    let records = postData.records || [];
    if (typeof records === "string") {
      try { records = JSON.parse(records); } catch (e) { records = []; }
    }

    const existingData = attSheet.getDataRange().getValues();
    const keptRows = [];

    // Filter baris lama di memori (cepat tanpa deleteRow satu-persatu)
    for (let i = 1; i < existingData.length; i++) {
      const row = existingData[i];
      if (!row[1] && !row[6]) continue;
      const rowDate = formatDateString(row[1]);
      if (rowDate !== targetDate) {
        keptRows.push(row);
      }
    }

    const newRows = [];
    for (let j = 0; j < records.length; j++) {
      const r = records[j];
      newRows.push([
        r.id || ('rec-' + targetDate + '-' + (j + 1)),
        targetDate,
        r.hari || '',
        r.kelas || '',
        r.jam || '',
        r.mataPelajaran || '',
        r.namaGuru || '',
        r.status || 'HADIR',
        r.keterangan || '',
        timestamp
      ]);
    }

    const finalData = keptRows.concat(newRows);

    // Bersihkan isi sheet dari baris 2
    if (attSheet.getLastRow() > 1) {
      attSheet.getRange(2, 1, attSheet.getLastRow() - 1, attSheet.getLastColumn()).clearContent();
    }

    // Tulis data gabungan dalam 1 kali eksekusi
    if (finalData.length > 0) {
      if (attSheet.getMaxRows() < (finalData.length + 10)) {
        attSheet.insertRowsAfter(attSheet.getMaxRows(), (finalData.length + 50) - attSheet.getMaxRows());
      }
      attSheet.getRange(2, 1, finalData.length, 10).setValues(finalData);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Berhasil menyimpan " + newRows.length + " data KBM tanggal " + targetDate
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // AKSI 3: Simpan Guru Piket Harian
  if (postData.action === "saveGuruPiket") {
    let pSheet = ss.getSheetByName(SHEET_PIKET);
    if (!pSheet) {
      pSheet = ss.insertSheet(SHEET_PIKET);
      pSheet.appendRow(["ID", "Tanggal", "Hari", "Piket 1", "Piket 2", "Piket 3", "Piket 4", "Keterangan", "Waktu Input"]);
      pSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
    }

    let pkt = postData.piket;
    if (typeof pkt === "string") {
      try { pkt = JSON.parse(pkt); } catch (e) { pkt = {}; }
    }
    const targetDate = formatDateString(pkt.tanggal);

    const data = pSheet.getDataRange().getValues();
    const kept = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][1]) continue;
      if (formatDateString(data[i][1]) !== targetDate) {
        kept.push(data[i]);
      }
    }

    kept.push([
      pkt.id || ('pkt-' + targetDate),
      targetDate,
      pkt.hari || '',
      pkt.piket1 || '',
      pkt.piket2 || '',
      pkt.piket3 || '',
      pkt.piket4 || '',
      pkt.keterangan || '',
      timestamp
    ]);

    if (pSheet.getLastRow() > 1) {
      pSheet.getRange(2, 1, pSheet.getLastRow() - 1, pSheet.getLastColumn()).clearContent();
    }
    if (kept.length > 0) {
      if (pSheet.getMaxRows() < (kept.length + 5)) {
        pSheet.insertRowsAfter(pSheet.getMaxRows(), 20);
      }
      pSheet.getRange(2, 1, kept.length, 9).setValues(kept);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Berhasil menyimpan data Guru Piket tanggal " + targetDate
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // AKSI 4: Simpan Rekap Apel Pagi
  if (postData.action === "saveRekapApel") {
    let aSheet = ss.getSheetByName(SHEET_APEL);
    if (!aSheet) {
      aSheet = ss.insertSheet(SHEET_APEL);
      aSheet.appendRow(["ID", "Tanggal", "Hari", "Nama", "Kategori", "Jabatan / Jadwal", "Status", "Keterangan", "Waktu Input"]);
      aSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
    }

    const targetDate = formatDateString(postData.tanggal);
    let records = postData.records || [];
    if (typeof records === "string") {
      try { records = JSON.parse(records); } catch (e) { records = []; }
    }

    const data = aSheet.getDataRange().getValues();
    const kept = [];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][1]) continue;
      if (formatDateString(data[i][1]) !== targetDate) {
        kept.push(data[i]);
      }
    }

    const newRows = [];
    for (let k = 0; k < records.length; k++) {
      const r = records[k];
      newRows.push([
        r.id || ('apl-' + targetDate + '-' + (k + 1)),
        targetDate,
        r.hari || '',
        r.nama || '',
        r.kategori || 'STRUKTURAL',
        r.jabatanAtauJadwal || '',
        r.status || 'HADIR',
        r.keterangan || '',
        timestamp
      ]);
    }

    const finalData = kept.concat(newRows);

    if (aSheet.getLastRow() > 1) {
      aSheet.getRange(2, 1, aSheet.getLastRow() - 1, aSheet.getLastColumn()).clearContent();
    }
    if (finalData.length > 0) {
      if (aSheet.getMaxRows() < (finalData.length + 10)) {
        aSheet.insertRowsAfter(aSheet.getMaxRows(), (finalData.length + 30) - aSheet.getMaxRows());
      }
      aSheet.getRange(2, 1, finalData.length, 9).setValues(finalData);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Berhasil menyimpan " + newRows.length + " presensi apel tanggal " + targetDate
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // AKSI 5: Simpan Pembaruan Config
  if (postData.action === "saveConfig") {
    let cfgSheet = ss.getSheetByName(SHEET_CONFIG);
    if (!cfgSheet) {
      cfgSheet = ss.insertSheet(SHEET_CONFIG);
      cfgSheet.appendRow(["KEY", "VALUE"]);
      cfgSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
    }

    let cfgObj = postData.config || {};
    if (typeof cfgObj === "string") {
      try { cfgObj = JSON.parse(cfgObj); } catch (e) { cfgObj = {}; }
    }

    const existingData = cfgSheet.getDataRange().getValues();
    const map = {};
    for (let i = 1; i < existingData.length; i++) {
      const k = String(existingData[i][0] || '').trim();
      if (k) map[k] = i + 1; // row index
    }

    Object.keys(cfgObj).forEach(function(key) {
      const val = String(cfgObj[key] ?? '');
      if (map[key]) {
        cfgSheet.getRange(map[key], 2).setValue(val);
      } else {
        cfgSheet.appendRow([key, val]);
      }
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Pengaturan berhasil diperbarui di Spreadsheet!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: "Aksi tidak dikenali: " + postData.action
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Konversi nilai tanggal sel ke format YYYY-MM-DD
 */
function formatDateString(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Jakarta", "yyyy-MM-dd");
  }
  let s = String(val).trim();
  if (s.indexOf("T") !== -1) {
    s = s.split("T")[0];
  }
  // Parsing DD/MM/YYYY atau YYYY-MM-DD
  const parts = s.split(/[\\/\\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return parts[0] + "-" + ("0" + parts[1]).slice(-2) + "-" + ("0" + parts[2]).slice(-2);
    } else if (parts[2].length === 4) {
      return parts[2] + "-" + ("0" + parts[1]).slice(-2) + "-" + ("0" + parts[0]).slice(-2);
    }
  }
  return s;
}

/**
 * Inisialisasi otomatis semua sheet sesuai spesifikasi MA Darul Lughah Wal Karomah
 */
function setupInitialDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Config
  let cfgSheet = ss.getSheetByName(SHEET_CONFIG);
  if (!cfgSheet) {
    cfgSheet = ss.insertSheet(SHEET_CONFIG);
  }
  if (cfgSheet.getLastRow() < 2) {
    cfgSheet.clear();
    cfgSheet.appendRow(["KEY", "VALUE"]);
    cfgSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
    
    const defaultConfigs = [
      ["NAMA_APLIKASI", "SIRAMA"],
      ["KEPANJANGAN_APLIKASI", "Sistem Informasi Rekap dan Absensi Pengajar Madrasah"],
      ["NAMA_YAYASAN", "YAYASAN PONDOK PESANTREN DARUL LUGHAH WAL KAROMAH"],
      ["NAMA_LEMBAGA", "Madrasah Aliyah Darul Lughah Wal Karomah"],
      ["SINGKATAN", "MA DARUL LUGHAH WAL KAROMAH"],
      ["KOTA", "Kraksaan"],
      ["ALAMAT_LEMBAGA", "Jl. Raya Sidopekso No. 01, Kraksaan, Probolinggo, Jawa Timur"],
      ["IDENTITAS_LEMBAGA", "NSM: 131235130045 • NPSN: 20584412 • Terakreditasi \\"A\\" (Unggul)"],
      ["JUDUL_LAPORAN_PDF", "LAPORAN REKAPITULASI KEHADIRAN PENGAJAR (KBM)"],
      ["SUBJUDUL_LAPORAN_PDF", "Dokumen Administrasi Rekapitulasi Presensi KBM Madrasah"],
      ["TIMEZONE", "Asia/Jakarta"],
      ["LOGO_URL", "https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/logo%20madar.png"],
      ["LOGO_SIRAMA_URL", "https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/Logo%20SIRAMA.png"],
      ["FAVICON_URL", "https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/Logo%20SIRAMA.png"],
      ["NAMA_KEPALA", "Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd."],
      ["JABATAN_KEPALA", "Kepala Madrasah Aliyah"],
      ["NAMA_STAFF", "Ust. Edi Amin, M.Hum."],
      ["JABATAN_STAFF", "Waka Kurikulum"],
      ["WARNA_UTAMA", "#0284c7"],
      ["WARNA_SEKUNDER", "#0369a1"],
      ["PERSEN_SANGAT_BAIK", "90"],
      ["PERSEN_BAIK", "80"],
      ["PERSEN_CUKUP", "70"],
      ["LABEL_SANGAT_BAIK", "Sangat Baik (Disiplin)"],
      ["LABEL_BAIK", "Baik"],
      ["LABEL_CUKUP", "Cukup"],
      ["LABEL_KURANG", "Kurang (Perlu Pembinaan)"]
    ];
    cfgSheet.getRange(2, 1, defaultConfigs.length, 2).setValues(defaultConfigs);
  }

  // 2. Sheet Master Guru (Disertai Kolom Keterangan: Struktural vs Guru)
  let guruSheet = ss.getSheetByName(SHEET_GURU);
  if (!guruSheet) {
    guruSheet = ss.insertSheet(SHEET_GURU);
  }
  if (guruSheet.getLastRow() < 2) {
    guruSheet.clear();
    guruSheet.appendRow(["KODE GURU", "NAMA GURU", "KETERANGAN / JABATAN"]);
    guruSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#0369a1").setFontColor("#ffffff");

    const defaultTeachers = [
      ["G01", "Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd.", "Kepala Madrasah"],
      ["G02", "Ust. Edi Amin, M.Hum.", "Waka Kurikulum"],
      ["G03", "Ust. Muh. Fathan Zamani, M.A.", "Waka Kesiswaan"],
      ["G04", "Ust. H. Djamauddin, M.Pd.I.", "Waka Humas"],
      ["G05", "Ust. Dwi Evayanto, S.Kom", "Waka Sarpras"],
      ["G06", "Ust. Moh. Sodik, S.Pd.", "Bendahara Madrasah"],
      ["G07", "Nurrahman, S.Kom.", "Staff EMIS & IT"],
      ["G08", "Ust. Sholehuddin M.Pd", "Staff TU / Administrasi"],
      ["G09", "Ust. M. Fathur Rozak, S.Pd.", "BP / BK"],
      ["G10", "Ust. Mashudi, M.Pd.I.", "Guru Pengampu"],
      ["G11", "Ust. Habibi, M.Pd.I.", "Guru Pengampu"],
      ["G12", "Ust. Abdul Bari, S.Pd.", "Guru Pengampu"],
      ["G13", "Ust. H. Zaidi, M.H.I., M.Pd.I.", "Guru Pengampu"],
      ["G14", "Ustd. Sriyati, S.Pd.I.", "Guru Pengampu"],
      ["G15", "Ustd. Khusnul Khotimah, SE", "Guru Pengampu"],
      ["G16", "Ustd. Meri, S.Pd.", "Guru Pengampu"],
      ["G17", "Ustd. Lilik Burhanatus S., SS.", "Guru Pengampu"],
      ["G18", "Ustd. Siti Umil Mukminah, S.Si.", "Guru Pengampu"],
      ["G19", "Ustd. Dra. Diah Eviati", "Guru Pengampu"],
      ["G20", "Ustd. Fini Novita Sari, S.Pd.", "Guru Pengampu"],
      ["G21", "Ust. Moh Lutfi, S.Pd.", "Guru Pengampu"],
      ["G22", "Ust. Aan Farisi, SS.", "Guru Pengampu"],
      ["G23", "Ust. Taufik Rizal, S.Kom.", "Guru Pengampu"],
      ["G24", "Ny. Maghfiroh, S.Pd.I.", "Guru Pengampu"],
      ["G25", "Ustd. Ummi Salamah, S.Pd.", "Guru Pengampu"],
      ["G26", "Ust. H. Syamsul Huda, M.Pd.", "Guru Pengampu"],
      ["G27", "Ustd. Nurul Hidayati, S.Pd.", "Guru Pengampu"],
      ["G28", "Ust. M. Khoirul Anam, S.Pd.", "Guru Pengampu"]
    ];
    guruSheet.getRange(2, 1, defaultTeachers.length, 3).setValues(defaultTeachers);
  }

  // 3. Sheet Master Mapel
  let mapelSheet = ss.getSheetByName(SHEET_MAPEL);
  if (!mapelSheet) {
    mapelSheet = ss.insertSheet(SHEET_MAPEL);
  }
  if (mapelSheet.getLastRow() < 2) {
    mapelSheet.clear();
    mapelSheet.appendRow(["KODE MAPEL", "MATA PELAJARAN"]);
    mapelSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");

    const defaultSubjects = [
      ["M01", "Al-Qur'an Hadits"],
      ["M02", "Akidah Akhlak"],
      ["M03", "Fikih"],
      ["M04", "Sejarah Kebudayaan Islam (SKI)"],
      ["M05", "Bahasa Arab"],
      ["M06", "Bahasa Indonesia"],
      ["M07", "Bahasa Inggris"],
      ["M08", "Matematika"],
      ["M09", "Fisika"],
      ["M10", "Kimia"],
      ["M11", "Biologi"],
      ["M12", "Ekonomi"],
      ["M13", "Sosiologi"],
      ["M14", "Geografi"],
      ["M15", "Sejarah Indonesia"],
      ["M16", "Pendidikan Pancasila (PPKn)"],
      ["M17", "Informatika / TIK"],
      ["M18", "Pendidikan Jasmani & Olahraga"]
    ];
    mapelSheet.getRange(2, 1, defaultSubjects.length, 2).setValues(defaultSubjects);
  }

  // 4. Sheet Jadwal Piket Mingguan (Diatur langsung dari Spreadsheet)
  let jpSheet = ss.getSheetByName(SHEET_JADWAL_PIKET);
  if (!jpSheet) {
    jpSheet = ss.insertSheet(SHEET_JADWAL_PIKET);
  }
  if (jpSheet.getLastRow() < 2) {
    jpSheet.clear();
    jpSheet.appendRow(["HARI", "PETUGAS 1", "PETUGAS 2", "PETUGAS 3", "PETUGAS 4"]);
    jpSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
    
    const defaultJadwalPiket = [
      ["Sabtu", "Ust. Edi Amin, M.Hum.", "Ust. Sholehuddin M.Pd", "Ustd. Khusnul Khotimah, SE", "Ust. Moh Lutfi, S.Pd."],
      ["Ahad", "Ust. Muh. Fathan Zamani, M.A.", "Ust. Mashudi, M.Pd.I.", "Ustd. Meri, S.Pd.", "Ust. Aan Farisi, SS."],
      ["Senin", "Ust. H. Djamauddin, M.Pd.I.", "Ust. Habibi, M.Pd.I.", "Ustd. Lilik Burhanatus S., SS.", "Ust. Taufik Rizal, S.Kom."],
      ["Selasa", "Ust. Dwi Evayanto, S.Kom", "Ust. Abdul Bari, S.Pd.", "Ustd. Siti Umil Mukminah, S.Si.", "Ny. Maghfiroh, S.Pd.I."],
      ["Rabu", "Ust. Moh. Sodik, S.Pd.", "Ust. H. Zaidi, M.H.I., M.Pd.I.", "Ustd. Dra. Diah Eviati", "Ustd. Ummi Salamah, S.Pd."],
      ["Kamis", "Nurrahman, S.Kom.", "Ust. M. Fathur Rozak, S.Pd.", "Ustd. Sriyati, S.Pd.I.", "Ustd. Fini Novita Sari, S.Pd."]
    ];
    jpSheet.getRange(2, 1, defaultJadwalPiket.length, 5).setValues(defaultJadwalPiket);
  }

  // 5. Sheet Hari Jadwal
  HARI_LIST.forEach(function(hari) {
    let hSheet = ss.getSheetByName(hari);
    if (!hSheet) {
      hSheet = ss.insertSheet(hari);
      hSheet.appendRow(["Kelas", "Jam", "Mata Pelajaran", "Guru Pengampu"]);
      hSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#0ea5e9").setFontColor("#ffffff");

      // Isi sampel jadwal harian
      const sampleSchedule = [
        ["X-A", "1", "Al-Qur'an Hadits", "Ust. Mashudi, M.Pd.I."],
        ["X-A", "2", "Al-Qur'an Hadits", "Ust. Mashudi, M.Pd.I."],
        ["X-B", "1", "Bahasa Arab", "Ust. Abdul Bari, S.Pd."],
        ["X-B", "2", "Bahasa Arab", "Ust. Abdul Bari, S.Pd."],
        ["XI-IPA", "1", "Matematika", "Ustd. Siti Umil Mukminah, S.Si."],
        ["XI-IPA", "2", "Matematika", "Ustd. Siti Umil Mukminah, S.Si."],
        ["XI-IPS", "1", "Sosiologi", "Ustd. Dra. Diah Eviati"],
        ["XI-IPS", "2", "Sosiologi", "Ustd. Dra. Diah Eviati"],
        ["XII-IPA", "1", "Fisika", "Ustd. Fini Novita Sari, S.Pd."],
        ["XII-IPA", "2", "Fisika", "Ustd. Fini Novita Sari, S.Pd."],
        ["XII-IPS", "1", "Ekonomi", "Ustd. Khusnul Khotimah, SE"],
        ["XII-IPS", "2", "Ekonomi", "Ustd. Khusnul Khotimah, SE"]
      ];
      hSheet.getRange(2, 1, sampleSchedule.length, 4).setValues(sampleSchedule);
    }
  });

  // 6. Sheet Utama Kehadiran (KBM)
  let attSheet = ss.getSheetByName(SHEET_KEHADIRAN);
  if (!attSheet) {
    attSheet = ss.insertSheet(SHEET_KEHADIRAN);
    attSheet.appendRow([
      "ID", "Tanggal", "Hari", "Kelas", "Jam", "Mata Pelajaran", 
      "Guru Pengampu", "Status", "Keterangan", "Waktu Input"
    ]);
    attSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  }

  // 7. Sheet Rekap Guru Piket
  let piketSheet = ss.getSheetByName(SHEET_PIKET);
  if (!piketSheet) {
    piketSheet = ss.insertSheet(SHEET_PIKET);
    piketSheet.appendRow([
      "ID", "Tanggal", "Hari", "Piket 1", "Piket 2", "Piket 3", "Piket 4", "Keterangan", "Waktu Input"
    ]);
    piketSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  }

  // 8. Sheet Rekap Apel Pagi
  let apelSheet = ss.getSheetByName(SHEET_APEL);
  if (!apelSheet) {
    apelSheet = ss.insertSheet(SHEET_APEL);
    apelSheet.appendRow([
      "ID", "Tanggal", "Hari", "Nama", "Kategori", "Jabatan / Jadwal", "Status", "Keterangan", "Waktu Input"
    ]);
    apelSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  }
}
`;
}
