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

/**
 * Unduh Template Excel untuk Upload Master Data Guru & Pegawai
 */
export function downloadStaffTemplate() {
  const sampleData = [
    {
      NIP: '198704242011011009',
      NUPTK: '8234765667200032',
      NIK_KTP: '3471022404870009',
      Nama_Lengkap: 'Benisius Rahmat Basuki, S.Pd',
      Jenis_Pegawai: 'GURU', // GURU atau TENAGA_KEPENDIDIKAN
      Jabatan_Tugas: 'Guru Kelas 4A & Penanggung Jawab SIBOGO',
      Status_Kepegawaian: 'GTY', // GTY, PTY, GTTY, PTTY, HONORER, PNS_DPK
      Jenis_Kelamin: 'L', // L atau P
      Tempat_Lahir: 'Yogyakarta',
      Tanggal_Lahir: '1987-04-24', // YYYY-MM-DD
      Agama: 'Katolik',
      Status_Kawin: 'Kawin',
      Pendidikan_Terakhir: 'S1 PGSD',
      Jurusan: 'Pendidikan Guru Sekolah Dasar',
      TMT_Kerja: '2011-01-01',
      Alamat: 'Jl. Gowongan Kidul No. 18, Jetis, Yogyakarta',
      No_WhatsApp: '081228491823',
      Email: 'benisiusbasuki24@guru.sd.belajar.id',
      Bank: 'BPD DIY',
      No_Rekening: '0012398489',
      Atas_Nama_Rekening: 'Benisius Rahmat Basuki',
      Gaji_Pokok: 3600000,
      Status_Aktif: 'AKTIF', // AKTIF atau NONAKTIF
    },
    {
      NIP: '198203152008012003',
      NUPTK: '6547760662300021',
      NIK_KTP: '3471021503820002',
      Nama_Lengkap: 'Eni Utaminingsih, S.Pd',
      Jenis_Pegawai: 'GURU',
      Jabatan_Tugas: 'Bendahara & Guru Kelas 1A',
      Status_Kepegawaian: 'GTY',
      Jenis_Kelamin: 'P',
      Tempat_Lahir: 'Bantul',
      Tanggal_Lahir: '1982-03-15',
      Agama: 'Kristen Protestan',
      Status_Kawin: 'Kawin',
      Pendidikan_Terakhir: 'S1 PGSD',
      Jurusan: 'Pendidikan Dasar',
      TMT_Kerja: '2008-01-01',
      Alamat: 'Jl. Bantul KM 4.5, Dongkelan, Sewon, Bantul',
      No_WhatsApp: '081328994321',
      Email: 'eni.utaminingsih@bopkri.sch.id',
      Bank: 'BPD DIY',
      No_Rekening: '0012398472',
      Atas_Nama_Rekening: 'Eni Utaminingsih',
      Gaji_Pokok: 3800000,
      Status_Aktif: 'AKTIF',
    },
    {
      NIP: '199011242015032002',
      NUPTK: '4356768670210043',
      NIK_KTP: '3471032411900003',
      Nama_Lengkap: 'Nastiti Ken Utami',
      Jenis_Pegawai: 'TENAGA_KEPENDIDIKAN',
      Jabatan_Tugas: 'Kasir & Staf Tata Usaha',
      Status_Kepegawaian: 'PTY',
      Jenis_Kelamin: 'P',
      Tempat_Lahir: 'Sleman',
      Tanggal_Lahir: '1990-11-24',
      Agama: 'Kristen Protestan',
      Status_Kawin: 'Kawin',
      Pendidikan_Terakhir: 'D3 Administrasi Niaga',
      Jurusan: 'Administrasi Perkantoran & Akuntansi',
      TMT_Kerja: '2015-03-01',
      Alamat: 'Jl. Monjali No. 88, Gemawang, Sinduadi, Mlati, Sleman',
      No_WhatsApp: '085729182736',
      Email: 'nastiti.ken@bopkri.sch.id',
      Bank: 'BCA',
      No_Rekening: '1692837461',
      Atas_Nama_Rekening: 'Nastiti Ken Utami',
      Gaji_Pokok: 3200000,
      Status_Aktif: 'AKTIF',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 20 }, // NIP
    { wch: 20 }, // NUPTK
    { wch: 18 }, // NIK_KTP
    { wch: 32 }, // Nama_Lengkap
    { wch: 22 }, // Jenis_Pegawai
    { wch: 35 }, // Jabatan_Tugas
    { wch: 18 }, // Status_Kepegawaian
    { wch: 14 }, // Jenis_Kelamin
    { wch: 16 }, // Tempat_Lahir
    { wch: 14 }, // Tanggal_Lahir
    { wch: 18 }, // Agama
    { wch: 14 }, // Status_Kawin
    { wch: 22 }, // Pendidikan_Terakhir
    { wch: 30 }, // Jurusan
    { wch: 14 }, // TMT_Kerja
    { wch: 38 }, // Alamat
    { wch: 16 }, // No_WhatsApp
    { wch: 32 }, // Email
    { wch: 14 }, // Bank
    { wch: 18 }, // No_Rekening
    { wch: 28 }, // Atas_Nama_Rekening
    { wch: 14 }, // Gaji_Pokok
    { wch: 14 }, // Status_Aktif
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Biodata Pegawai');
  XLSX.writeFile(workbook, 'Template_Biodata_Guru_Staf_SD_BOPKRI.xlsx');
}

/**
 * Ekspor Data Guru & Staf ke File Excel
 */
export function exportStaffToExcel(teachers: any[]) {
  const exportData = teachers.map((t, idx) => ({
    No: idx + 1,
    NIP: t.nip || '-',
    NUPTK: t.nuptk || '-',
    NIK_KTP: t.ktpNumber || '-',
    Nama_Lengkap: t.name,
    Jenis_Pegawai: t.staffType || 'GURU',
    Jabatan_Tugas: t.role,
    Status_Kepegawaian: t.status,
    Jenis_Kelamin: t.gender === 'P' ? 'Perempuan' : 'Laki-Laki',
    Tempat_Lahir: t.birthPlace || '-',
    Tanggal_Lahir: t.birthDate || '-',
    Agama: t.religion || '-',
    Status_Kawin: t.maritalStatus || '-',
    Pendidikan_Terakhir: t.lastEducation || '-',
    Jurusan: t.major || '-',
    TMT_Kerja: t.tmtWorking || '-',
    Alamat: t.address || '-',
    No_WhatsApp: t.phone || '-',
    Email: t.email || '-',
    Bank: t.bankName || '-',
    No_Rekening: t.accountNumber || '-',
    Atas_Nama_Rekening: t.accountHolder || t.name,
    Gaji_Pokok: t.baseSalary,
    Status_Keaktifan: t.isActive ? 'AKTIF' : 'NONAKTIF',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 32 },
    { wch: 20 },
    { wch: 35 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 30 },
    { wch: 14 },
    { wch: 38 },
    { wch: 16 },
    { wch: 32 },
    { wch: 14 },
    { wch: 18 },
    { wch: 28 },
    { wch: 14 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Guru & Staf');
  XLSX.writeFile(workbook, `Master_Data_Guru_Staf_BOPKRI_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Parsing data mentah dari Excel file menjadi objek Staff / Teacher
 */
export function parseStaffExcelRows(rows: any[]) {
  return rows
    .filter((row) => row && (row.Nama_Lengkap || row.Nama || row.NIP || row.nama))
    .map((row) => {
      const name = String(row.Nama_Lengkap || row.Nama || row.nama || '').trim();
      const nip = String(row.NIP || row.nip || row.NIK || '').trim() || `P-${Date.now().toString().slice(-6)}`;
      const nuptk = String(row.NUPTK || row.nuptk || '').trim();
      const ktpNumber = String(row.NIK_KTP || row.No_KTP || row.NIK || '').trim();
      const rawStaffType = String(row.Jenis_Pegawai || row.staffType || '').toUpperCase();
      const staffType = rawStaffType.includes('TENAGA') || rawStaffType.includes('STAFF') || rawStaffType.includes('KARYAWAN')
        ? ('TENAGA_KEPENDIDIKAN' as const)
        : ('GURU' as const);
      const role = String(row.Jabatan_Tugas || row.Jabatan || row.Tugas || row.role || 'Tenaga Pendidik').trim();
      
      const rawStatus = String(row.Status_Kepegawaian || row.Status || row.status || 'GTY').toUpperCase().trim();
      let status: 'GTY' | 'PTY' | 'GTTY' | 'PTTY' | 'HONORER' | 'PNS_DPK' = 'GTY';
      if (rawStatus.includes('PTY')) status = 'PTY';
      else if (rawStatus.includes('GTTY') || rawStatus.includes('GTT')) status = 'GTTY';
      else if (rawStatus.includes('PTTY') || rawStatus.includes('PTT')) status = 'PTTY';
      else if (rawStatus.includes('HONOR')) status = 'HONORER';
      else if (rawStatus.includes('PNS')) status = 'PNS_DPK';
      else if (rawStatus.includes('GTY')) status = 'GTY';

      const rawGender = String(row.Jenis_Kelamin || row.Gender || '').toUpperCase().trim();
      const gender = rawGender.startsWith('P') || rawGender.includes('WANITA') || rawGender.includes('PEREMPUAN') ? ('P' as const) : ('L' as const);

      const birthPlace = String(row.Tempat_Lahir || row.birthPlace || '').trim();
      const birthDate = String(row.Tanggal_Lahir || row.birthDate || '').trim();
      const religion = String(row.Agama || row.religion || 'Kristen Protestan').trim();
      const maritalStatus = String(row.Status_Kawin || row.Status_Pernikahan || row.maritalStatus || 'Kawin').trim();
      const lastEducation = String(row.Pendidikan_Terakhir || row.Pendidikan || row.lastEducation || 'S1').trim();
      const major = String(row.Jurusan || row.Program_Studi || row.major || '').trim();
      const tmtWorking = String(row.TMT_Kerja || row.TMT || row.tmtWorking || '').trim();
      const address = String(row.Alamat || row.address || '').trim();
      const phone = String(row.No_WhatsApp || row.No_HP || row.Telepon || row.phone || '').trim();
      const email = String(row.Email || row.email || '').trim() || `${nip.toLowerCase()}@bopkri.sch.id`;
      const bankName = String(row.Bank || row.Nama_Bank || row.bankName || 'BPD DIY').trim();
      const accountNumber = String(row.No_Rekening || row.Nomor_Rekening || row.accountNumber || '').trim();
      const accountHolder = String(row.Atas_Nama_Rekening || row.Atas_Nama || row.accountHolder || name).trim();
      
      const rawSalary = row.Gaji_Pokok || row.Gaji || row.baseSalary;
      const baseSalary = typeof rawSalary === 'number' ? rawSalary : parseFloat(String(rawSalary || '0').replace(/[^0-9]/g, '')) || 3000000;
      
      const rawActive = String(row.Status_Aktif || row.Status_Keaktifan || row.isActive || 'AKTIF').toUpperCase();
      const isActive = !rawActive.includes('NON') && !rawActive.includes('TIDAK') && !rawActive.includes('FALSE');

      // Generate suggested username
      const username = String(row.Username || name.toLowerCase().replace(/[^a-z0-9]/g, '.')).slice(0, 20);

      return {
        nip,
        nuptk,
        ktpNumber,
        name,
        staffType,
        role,
        status,
        gender,
        birthPlace,
        birthDate,
        religion,
        maritalStatus,
        lastEducation,
        major,
        tmtWorking,
        address,
        phone,
        email,
        bankName,
        accountNumber,
        accountHolder,
        baseSalary,
        isActive,
        username,
        password: '123',
      };
    });
}

