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
            normalizedConfig.PERSEN_BAIK = Number(valStr) || 75;
          }
          if (cleanKey === 'PERSEN_CUKUP') {
            normalizedConfig.PERSEN_CUKUP = Number(valStr) || 60;
          }
        }
      }

      // If LOGO_URL is set but FAVICON_URL is empty, automatically share it with FAVICON_URL
      if (normalizedConfig.LOGO_URL && !normalizedConfig.FAVICON_URL) {
        normalizedConfig.FAVICON_URL = normalizedConfig.LOGO_URL;
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

    const json = await response.json().catch(() => ({ status: 'success' }));
    return {
      success: true,
      message: json.message || 'Daftar hadir harian berhasil disimpan ke Google Sheets!',
    };
  } catch (error: any) {
    console.error('GAS Post Bulk Error:', error);
    return {
      success: false,
      message: `Gagal mengirim ke Google Sheets: ${error.message}`,
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

    const json = await response.json().catch(() => ({ status: 'success' }));
    return {
      success: true,
      message: json.message || 'Data Guru Piket berhasil diarsipkan ke Google Sheets!',
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

    const json = await response.json().catch(() => ({ status: 'success' }));
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
 * Generates the complete Google Apps Script code for Google Sheets
 */
export function getGoogleAppsScriptTemplateCode(): string {
  return `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - SIRAMA
 * (Sistem Informasi Rekap dan Absensi Pengajar Madrasah)
 * MADRASAH ALIYAH DARUL LUGHAH WAL KAROMAH KRAKSAAN
 * =========================================================================
 * 
 * CARA PEMASANGAN DI GOOGLE SPREADSHEET:
 * 1. Buka Google Spreadsheet di Google Drive Anda.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus semua kode bawaan, lalu PASTE SELURUH KODE DI BAWAH INI.
 * 4. Klik ikon Save (Simpan).
 * 5. Pilih fungsi 'setupInitialDatabase' lalu klik 'Run' (Jalankan) sekali saja
 *    untuk membuat/melengkapi sheet: Config, Master_Guru, Master_Mapel,
 *    Jadwal (Sabtu s.d. Kamis), Kehadiran, Guru_Piket, dan Rekap_Apel secara otomatis!
 * 6. Klik tombol biru 'Terapkan' (Deploy) > 'Penerapan baru' (New deployment).
 *    - Jenis: 'Aplikasi Web' (Web App)
 *    - Jalankan sebagai: 'Saya' (Me)
 *    - Siapa yang memiliki akses: 'Siapa saja' (Anyone)  <-- PENTING!
 * 7. Salin URL Aplikasi Web (berakhiran /exec) dan simpan di aplikasi SIRAMA.
 */

const SHEET_CONFIG = "Config";
const SHEET_GURU = "Master_Guru";
const SHEET_MAPEL = "Master_Mapel";
const SHEET_KEHADIRAN = "Kehadiran";
const SHEET_PIKET = "Guru_Piket";
const SHEET_APEL = "Rekap_Apel";
const HARI_LIST = ["Sabtu", "Ahad", "Senin", "Selasa", "Rabu", "Kamis"];

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupInitialDatabase();
    
    // 1. Baca Config
    const config = {};
    const cfgSheet = ss.getSheetByName(SHEET_CONFIG);
    if (cfgSheet) {
      const cfgData = cfgSheet.getDataRange().getValues();
      if (cfgData.length > 0) {
        const firstCol = String(cfgData[0][0] || '').trim().toUpperCase();
        const hasHeader = firstCol === 'KEY' || firstCol === 'PARAMETER' || firstCol === 'NAMA' || firstCol === 'VARIABEL';
        const startIdx = hasHeader ? 1 : 0;

        for (let i = startIdx; i < cfgData.length; i++) {
          const k = String(cfgData[i][0] || '').trim();
          const v = String(cfgData[i][1] || '').trim();
          if (k) {
            config[k] = v;
            const normKey = k.toUpperCase().replace(/[\\s-]+/g, '_');
            config[normKey] = v;
          }
        }
      }
    }

    // 2. Baca Master Guru
    const teachers = [];
    const guruSheet = ss.getSheetByName(SHEET_GURU);
    if (guruSheet) {
      const gData = guruSheet.getDataRange().getValues();
      for (let i = 1; i < gData.length; i++) {
        if (!gData[i][1]) continue;
        teachers.push({
          kode: String(gData[i][0] || ''),
          nama: String(gData[i][1] || '')
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
          kode: mData[i][0],
          nama: String(mData[i][1] || '')
        });
      }
    }

    // 4. Baca Jadwal Mingguan per Hari
    const schedules = {};
    HARI_LIST.forEach(function(hari) {
      schedules[hari] = [];
      const hSheet = ss.getSheetByName(hari);
      if (hSheet) {
        const hData = hSheet.getDataRange().getValues();
        for (let i = 1; i < hData.length; i++) {
          if (!hData[i][0] && !hData[i][2]) continue;
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

    // 5. Baca Sheet Utama Kehadiran (KBM)
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

    // 6. Baca Sheet Guru Piket
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

    // 7. Baca Sheet Rekap Apel Pagi
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

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupInitialDatabase();
    const postData = JSON.parse(e.postData.contents);
    const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

    // A. Simpan Presensi KBM Harian (Bulk Save)
    if (postData.action === "saveDayAttendance" && postData.records) {
      const attSheet = ss.getSheetByName(SHEET_KEHADIRAN);
      const targetDate = postData.tanggal;
      const records = postData.records;

      // Hapus data lama untuk tanggal yang sama
      const data = attSheet.getDataRange().getValues();
      for (let i = data.length - 1; i >= 1; i--) {
        const rowDate = formatDateString(data[i][1]);
        if (rowDate === targetDate) {
          attSheet.deleteRow(i + 1);
        }
      }

      const rowsToAdd = [];
      for (let j = 0; j < records.length; j++) {
        const r = records[j];
        rowsToAdd.push([
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

      if (rowsToAdd.length > 0) {
        attSheet.getRange(attSheet.getLastRow() + 1, 1, rowsToAdd.length, 10).setValues(rowsToAdd);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Berhasil menyimpan " + rowsToAdd.length + " data KBM tanggal " + targetDate
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // B. Simpan Guru Piket Harian
    if (postData.action === "saveGuruPiket" && postData.piket) {
      const pSheet = ss.getSheetByName(SHEET_PIKET);
      const pkt = postData.piket;
      const targetDate = pkt.tanggal;

      // Hapus piket tanggal yang sama
      const data = pSheet.getDataRange().getValues();
      for (let i = data.length - 1; i >= 1; i--) {
        const rowDate = formatDateString(data[i][1]);
        if (rowDate === targetDate) {
          pSheet.deleteRow(i + 1);
        }
      }

      pSheet.appendRow([
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

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Berhasil menyimpan data Guru Piket tanggal " + targetDate
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // C. Simpan Rekap Apel Pagi
    if (postData.action === "saveRekapApel" && postData.records) {
      const aSheet = ss.getSheetByName(SHEET_APEL);
      const targetDate = postData.tanggal;
      const records = postData.records;

      // Hapus rekap apel tanggal yang sama
      const data = aSheet.getDataRange().getValues();
      for (let i = data.length - 1; i >= 1; i--) {
        const rowDate = formatDateString(data[i][1]);
        if (rowDate === targetDate) {
          aSheet.deleteRow(i + 1);
        }
      }

      const rowsToAdd = [];
      for (let k = 0; k < records.length; k++) {
        const r = records[k];
        rowsToAdd.push([
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

      if (rowsToAdd.length > 0) {
        aSheet.getRange(aSheet.getLastRow() + 1, 1, rowsToAdd.length, 9).setValues(rowsToAdd);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Berhasil menyimpan " + rowsToAdd.length + " data presensi apel tanggal " + targetDate
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

function formatDateString(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Jakarta", "yyyy-MM-dd");
  }
  return String(val);
}

// Inisialisasi otomatis semua sheet sesuai spesifikasi MA Darul Lughah Wal Karomah
function setupInitialDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Config
  let cfgSheet = ss.getSheetByName(SHEET_CONFIG);
  if (!cfgSheet) {
    cfgSheet = ss.insertSheet(SHEET_CONFIG);
    cfgSheet.appendRow(["KEY", "VALUE"]);
    cfgSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
    
    const defaultConfigs = [
      ["NAMA_LEMBAGA", "Madrasah Aliyah Darul Lughah Wal Karomah"],
      ["SINGKATAN", "MA DARUL LUGHAH WAL KAROMAH"],
      ["KOTA", "Kraksaan"],
      ["TIMEZONE", "Asia/Jakarta"],
      ["LOGO_URL", "https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/logo%20madar.png"],
      ["FAVICON_URL", "https://cdn.jsdelivr.net/gh/contohdfi/tesfoto@main/logo%20madar.png"],
      ["NAMA_APLIKASI", "SIRAMA"],
      ["NAMA_KEPALA", "Ust. H. Ahmad Baidhowi, S.Pd.I., M.Pd."],
      ["NAMA_STAFF", "Ust. Edi Amin, M.Hum."],
      ["JABATAN_STAFF", "Waka Kurikulum"],
      ["WARNA_UTAMA", "#0284c7"],
      ["WARNA_SEKUNDER", "#0369a1"],
      ["PERSEN_SANGAT_BAIK", "90"],
      ["PERSEN_BAIK", "75"],
      ["PERSEN_CUKUP", "60"],
      ["API_KEY", ""]
    ];
    cfgSheet.getRange(2, 1, defaultConfigs.length, 2).setValues(defaultConfigs);
  }

  // 2. Sheet Master Guru
  let guruSheet = ss.getSheetByName(SHEET_GURU);
  if (!guruSheet) {
    guruSheet = ss.insertSheet(SHEET_GURU);
    guruSheet.appendRow(["KODE GURU", "NAMA GURU"]);
    guruSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#0369a1").setFontColor("#ffffff");
  }

  // 3. Sheet Master Mapel
  let mapelSheet = ss.getSheetByName(SHEET_MAPEL);
  if (!mapelSheet) {
    mapelSheet = ss.insertSheet(SHEET_MAPEL);
    mapelSheet.appendRow(["KODE MAPEL", "MATA PELAJARAN"]);
    mapelSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  }

  // 4. Sheet Hari Jadwal
  HARI_LIST.forEach(function(hari) {
    let hSheet = ss.getSheetByName(hari);
    if (!hSheet) {
      hSheet = ss.insertSheet(hari);
      hSheet.appendRow(["Kelas", "Jam", "Mata Pelajaran", "Guru Pengampu"]);
      hSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#0ea5e9").setFontColor("#ffffff");
    }
  });

  // 5. Sheet Utama Kehadiran
  let attSheet = ss.getSheetByName(SHEET_KEHADIRAN);
  if (!attSheet) {
    attSheet = ss.insertSheet(SHEET_KEHADIRAN);
    attSheet.appendRow([
      "ID", "Tanggal", "Hari", "Kelas", "Jam", "Mata Pelajaran", 
      "Guru Pengampu", "Status", "Keterangan", "Waktu Input"
    ]);
    attSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  }

  // 6. Sheet Guru Piket
  let piketSheet = ss.getSheetByName(SHEET_PIKET);
  if (!piketSheet) {
    piketSheet = ss.insertSheet(SHEET_PIKET);
    piketSheet.appendRow([
      "ID", "Tanggal", "Hari", "Piket 1", "Piket 2", "Piket 3", "Piket 4", "Keterangan", "Waktu Input"
    ]);
    piketSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  }

  // 7. Sheet Rekap Apel Pagi
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
