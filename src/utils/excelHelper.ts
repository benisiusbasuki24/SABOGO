import * as XLSX from 'xlsx';

/**
 * Membaca file Excel atau CSV dari file input HTML
 */
export async function parseExcelFile<T = any>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Ambil sheet pertama
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Konversi ke JSON (array of objects)
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet, {
          defval: '',
          raw: false,
        });

        resolve(jsonData);
      } catch (error) {
        reject(new Error('Gagal membaca format file Excel. Pastikan file valid (.xlsx, .xls, .csv).'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file dari perangkat Anda.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Unduh Template Excel untuk Input Data Siswa
 */
export function downloadStudentTemplate() {
  const sampleData = [
    {
      NIS: '260109',
      NISN: '0158291009',
      Nama_Siswa: 'Yohanes Christian Pratama',
      Kelas: 'Kelas 1A',
      Jenis_Kelamin: 'L',
      Nama_Orang_Tua: 'Hendra Pratama',
      No_WhatsApp_Orang_Tua: '081234567890',
      Email_Orang_Tua: 'hendra.pratama@gmail.com',
      Alamat: 'Jl. Magelang KM 4, Sinduadi, Mlati, Sleman',
      Nomor_VA: '88012260109',
    },
    {
      NIS: '260110',
      NISN: '0158291010',
      Nama_Siswa: 'Bernadetta Ratna Sari',
      Kelas: 'Kelas 1B',
      Jenis_Kelamin: 'P',
      Nama_Orang_Tua: 'Fransiscus Agus',
      No_WhatsApp_Orang_Tua: '081329881122',
      Email_Orang_Tua: 'agus.frans@gmail.com',
      Alamat: 'Jl. C. Simanjuntak No. 44, Terban, Yogyakarta',
      Nomor_VA: '88012260110',
    },
    {
      NIS: '250202',
      NISN: '0147382902',
      Nama_Siswa: 'Daniel Timothy Susanto',
      Kelas: 'Kelas 2B',
      Jenis_Kelamin: 'L',
      Nama_Orang_Tua: 'Susanto',
      No_WhatsApp_Orang_Tua: '085743129876',
      Email_Orang_Tua: 'susanto.jogja@yahoo.co.id',
      Alamat: 'Jl. Gowongan Kidul No. 12, Jetis, Yogyakarta',
      Nomor_VA: '88012250202',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 }, // NIS
    { wch: 14 }, // NISN
    { wch: 28 }, // Nama_Siswa
    { wch: 12 }, // Kelas
    { wch: 14 }, // Jenis_Kelamin
    { wch: 24 }, // Nama_Orang_Tua
    { wch: 22 }, // No_WhatsApp_Orang_Tua
    { wch: 28 }, // Email_Orang_Tua
    { wch: 35 }, // Alamat
    { wch: 16 }, // Nomor_VA
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
  XLSX.writeFile(workbook, 'Template_Data_Siswa_SD_BOPKRI.xlsx');
}

/**
 * Unduh Template Excel untuk Upload Tagihan Siswa
 */
export function downloadBillTemplate() {
  const sampleData = [
    {
      NIS: '260101',
      Nama_Siswa: 'Gabriel Adhitama Prasetyo',
      Jenis_Tagihan: 'SPP Bulanan',
      Kategori: 'SPP',
      Periode: 'November 2026',
      Nominal: 350000,
      Jatuh_Tempo: '2026-11-10',
      Keterangan: 'Tagihan SPP Reguler November',
    },
    {
      NIS: '260102',
      Nama_Siswa: 'Maria Clarissa Anggraini',
      Jenis_Tagihan: 'SPP Bulanan',
      Kategori: 'SPP',
      Periode: 'November 2026',
      Nominal: 350000,
      Jatuh_Tempo: '2026-11-10',
      Keterangan: 'Tagihan SPP Reguler November',
    },
    {
      NIS: '250201',
      Nama_Siswa: 'Jonathan David Kristianto',
      Jenis_Tagihan: 'Uang Buku & Modul Pembelajaran',
      Kategori: 'LAINNYA',
      Periode: 'Semester Ganjil 2026',
      Nominal: 480000,
      Jatuh_Tempo: '2026-11-20',
      Keterangan: 'Paket Buku Tematik Kurikulum Merdeka',
    },
    {
      NIS: '240301',
      Nama_Siswa: 'Grace Natasha Wibowo',
      Jenis_Tagihan: 'Uang Ekstrakurikuler Semester',
      Kategori: 'EKSTRAKURIKULER',
      Periode: 'Semester Ganjil 2026',
      Nominal: 250000,
      Jatuh_Tempo: '2026-11-15',
      Keterangan: 'Iuran Robotik & Drumband',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 10 }, // NIS
    { wch: 28 }, // Nama_Siswa
    { wch: 30 }, // Jenis_Tagihan
    { wch: 16 }, // Kategori
    { wch: 18 }, // Periode
    { wch: 14 }, // Nominal
    { wch: 14 }, // Jatuh_Tempo
    { wch: 35 }, // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Tagihan');
  XLSX.writeFile(workbook, 'Template_Tagihan_Siswa_SD_BOPKRI.xlsx');
}
