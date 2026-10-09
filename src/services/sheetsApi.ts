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
const SHEET_JADWAL_PIKET = "Jadwal_Piket";
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
            const normKey = k.toUpperCase().replace(/[\s-]+/g, '_');
            config[normKey] = v;
          }
        }
      }
    }

    // 2. Baca Master Guru (termasuk kolom keterangan struktural / guru)
    const teachers = [];
    const guruSheet = ss.getSheetByName(SHEET_GURU);
    if (guruSheet) {
      const gData = guruSheet.getDataRange().getValues();
      for (let i = 1; i < gData.length; i++) {
        if (!gData[i][1]) continue;
        teachers.push({
          kode: String(gData[i][0] || ''),
          nama: String(gData[i][1] || ''),
          keterangan: String(gData[i][2] || '')
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
      ["NAMA_APLIKASI", "SIRAMA"],
      ["KEPANJANGAN_APLIKASI", "Sistem Informasi Rekap dan Absensi Pengajar Madrasah"],
      ["NAMA_YAYASAN", "YAYASAN PONDOK PESANTREN DARUL LUGHAH WAL KAROMAH"],
      ["NAMA_LEMBAGA", "Madrasah Aliyah Darul Lughah Wal Karomah"],
      ["SINGKATAN", "MA DARUL LUGHAH WAL KAROMAH"],
      ["KOTA", "Kraksaan"],
      ["ALAMAT_LEMBAGA", "Jl. Raya Sidopekso No. 01, Kraksaan, Probolinggo, Jawa Timur"],
      ["IDENTITAS_LEMBAGA", "NSM: 131235130045 • NPSN: 20584412 • Terakreditasi \"A\" (Unggul)"],
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
      ["LABEL_KURANG", "Kurang (Perlu Pembinaan)"],
      ["API_KEY", ""]
    ];
    cfgSheet.getRange(2, 1, defaultConfigs.length, 2).setValues(defaultConfigs);
  }

  // 2. Sheet Master Guru (Disertai Kolom Keterangan: Struktural vs Guru)
  let guruSheet = ss.getSheetByName(SHEET_GURU);
  if (!guruSheet) {
    guruSheet = ss.insertSheet(SHEET_GURU);
    guruSheet.appendRow(["KODE GURU", "NAMA GURU", "KETERANGAN / JABATAN"]);
    guruSheet.getRange("A1:C1").setFontWeight("bold").setBackground("#0369a1").setFontColor("#ffffff");
  }

  // 3. Sheet Master Mapel
  let mapelSheet = ss.getSheetByName(SHEET_MAPEL);
  if (!mapelSheet) {
    mapelSheet = ss.insertSheet(SHEET_MAPEL);
    mapelSheet.appendRow(["KODE MAPEL", "MATA PELAJARAN"]);
    mapelSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  }

  // 4. Sheet Jadwal Piket Mingguan (Diatur langsung dari Spreadsheet)
  let jpSheet = ss.getSheetByName(SHEET_JADWAL_PIKET);
  if (!jpSheet) {
    jpSheet = ss.insertSheet(SHEET_JADWAL_PIKET);
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
