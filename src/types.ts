export type PaymentMethod = 'TUNAI' | 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'VA_BRI' | 'VA_BNI';

export type PaymentStatus = 'LUNAS' | 'SEBAGIAN' | 'BELUM_BAYAR' | 'MENUNGGAK';

export type BillFrequency = 'BULANAN' | 'SEMESTER' | 'TAHUNAN' | 'SEKALI_BAYAR';

export type BillCategory = 'SPP' | 'KEGIATAN' | 'EKSTRAKURIKULER' | 'LAINNYA';

export const EXTRACURRICULAR_OPTIONS = [
  'CODING',
  'DKV',
  'PADUS',
  'BIOLA',
  'BASKET',
  'TAEKWONDO',
  'BAND',
  'FUTSAL',
  'TARI',
  'LUKIS',
  'MUSIK KREATIF',
  'ENGLISH CLUB',
] as const;

export type ExtracurricularName = (typeof EXTRACURRICULAR_OPTIONS)[number];

export const SCHOOL_GRADES = [
  '1.1',
  '1.2',
  '2.1',
  '2.2',
  '3.1',
  '3.2',
  '4.1',
  '4.2',
  '5.1',
  '5.2',
  '6.1',
  '6.2',
] as const;

export type SchoolGrade = (typeof SCHOOL_GRADES)[number];

export const GRADE_MAPPING: Record<string, string> = {
  'Kelas 1A': '1.1',
  '1A': '1.1',
  'Kelas 1B': '1.2',
  '1B': '1.2',
  'Kelas 2A': '2.1',
  '2A': '2.1',
  'Kelas 2B': '2.2',
  '2B': '2.2',
  'Kelas 3A': '3.1',
  '3A': '3.1',
  'Kelas 3B': '3.2',
  '3B': '3.2',
  'Kelas 4A': '4.1',
  '4A': '4.1',
  'Kelas 4B': '4.2',
  '4B': '4.2',
  'Kelas 5A': '5.1',
  '5A': '5.1',
  'Kelas 5B': '4.2', // Sesuai permintaan pengguna: kelas 5B menjadi 4.2
  '5B': '4.2',
  'Kelas 6A': '6.1',
  '6A': '6.1',
  'Kelas 6B': '6.2',
  '6B': '6.2',
};

export function normalizeGrade(raw?: string): string {
  if (!raw) return '1.1';
  const trimmed = raw.trim();
  return GRADE_MAPPING[trimmed] || trimmed;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  grade: string; // "1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2", "5.1", "6.1", "6.2"
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string; // WhatsApp number
  parentEmail: string;
  address: string;
  vaNumber: string; // Default VA number (brivaSpp)
  brivaSpp?: string; // 5733-SPP TETAP BOGOTA
  brivaKegiatan?: string; // 5747-UANG KEGIATAN [DU]
  brivaEkskul?: string; // 14172-EKSKUL BOGOTA
  customerIdBri?: string; // ID Pelanggan from BRI
  status: 'AKTIF' | 'NONAKTIF';
  extracurriculars?: ExtracurricularName[]; // Max pilihan
  extracurricularFee?: number; // Besaran nominal biaya ekskul untuk siswa ini (Rp 200.000/semester per 1 pilihan ekskul)
  customSppAmount?: number; // Besaran nominal SPP bulanan siswa ini (berbeda setiap anak)
  customActivityFee?: number; // Besaran nominal Uang Kegiatan tahunan siswa ini (berbeda per kelas)
  createdAt: string;
}

export interface BillType {
  id: string;
  name: string;
  category: BillCategory;
  frequency: BillFrequency;
  defaultAmount: number;
  description: string;
  targetGrades: string[]; // e.g. ["Semua Kelas"] or ["1.1", "1.2", ...]
  classAmounts?: Record<string, number>; // Tarif per kelas (misal uang kegiatan tahunan berbeda setiap kelas)
  ekskulFeePerItem?: number; // Tarif ekskul per pilihan per semester (default Rp 200.000)
  isActive: boolean;
}

export interface Bill {
  id: string;
  billTypeId: string;
  billTypeName: string;
  category: BillCategory;
  studentId: string;
  studentName: string;
  studentNis: string;
  studentGrade: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  period: string; // e.g. "Oktober 2026", "Tahun Ajaran 2026/2027", "Semester Ganjil 2026"
  amount: number;
  paidAmount: number;
  dueDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  extracurriculars?: string[]; // Max 2 pilihan ekskul yang diambil
  notes?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  receiptNumber: string; // e.g. "BOPKRI-KW/2026/10/0042"
  billId: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  studentGrade: string;
  parentName: string;
  parentPhone: string;
  billTypeName: string;
  period: string;
  amount: number; // Amount paid in this transaction
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  cashChange?: number;
  referenceNumber?: string;
  paidAt: string; // ISO date string
  cashierName: string; // "Nastiti Ken Utami"
  treasurerName: string; // "Eni Utaminingsih, S.Pd"
  principalName: string; // "FX. Suhari Irawan, S.E"
  notes?: string;
}

export type EmploymentStatus = 'GTY' | 'PTY' | 'GTTY' | 'PTTY' | 'HONORER' | 'PNS_DPK' | 'Honor Sekolah' | 'HONOR_SEKOLAH';

export type StaffType = 'GURU' | 'TENAGA_KEPENDIDIKAN';
export type Gender = 'L' | 'P';

export interface Teacher {
  id: string;
  nip: string; // NIP atau NIK Guru / Nomor Induk Pegawai
  name: string; // Nama Lengkap beserta Gelar
  ktpNumber?: string; // No. KTP / NIK (16 digit)
  nuptk?: string; // NUPTK (16 digit)
  staffType?: StaffType; // GURU atau TENAGA_KEPENDIDIKAN
  role: string; // e.g. "Guru Kelas 1A", "Guru Pendidikan Agama Kristen", "Kasir & Staf TU", "Pustakawan", "Security", "Penjaga Sekolah", "Cleaning Service"
  status: EmploymentStatus; // GTY, PTY, GTTY, PTTY, HONOR SEKOLAH, PNS_DPK
  gender?: Gender; // L / P
  birthPlace?: string; // Tempat Lahir
  birthDate?: string; // Tanggal Lahir (YYYY-MM-DD)
  religion?: string; // Kristen Protestan, Katolik, Islam, dll.
  maritalStatus?: string; // Kawin, Belum Kawin, dll.
  lastEducation?: string; // S1 PGSD, S1 PAK, S2 Pendidikan, D3, SMA/SMK
  major?: string; // Jurusan / Program Studi
  tmtWorking?: string; // Terhitung Mulai Tanggal Bekerja (YYYY-MM-DD)
  address?: string; // Alamat Tempat Tinggal Lengkap
  phone: string; // WhatsApp guru / pegawai
  email: string;
  bankName: string; // e.g. "Mandiri", "BCA", "BRI", "BNI"
  accountNumber: string;
  accountHolder: string;
  baseSalary: number; // Gaji Pokok default
  isActive: boolean;
  username?: string; // Akun login guru/karyawan
  password?: string; // Kata sandi/PIN login
  notes?: string;
  createdAt: string;
}

export type UserRole =
  | 'ADMIN'           // Administrator (Benisius) / Super Admin
  | 'KEPALA_SEKOLAH'  // Kepala Sekolah
  | 'BENDAHARA'       // Bendahara
  | 'TATA_USAHA'      // Tata Usaha
  | 'GURU'            // Guru
  | 'STAFF'           // Staff / Karyawan
  | 'ORANG_TUA'       // Orang Tua Murid
  | 'TEACHER';        // Compatibility alias for Guru

export interface AuthUser {
  id: string;
  role: UserRole;
  username: string;
  name: string; // Nama Lengkap
  uniqueCode?: string; // Kode unik kombinasi 4 angka & 4 huruf (e.g. "B8K4P2X9")
  ktpNumber?: string; // No. KTP (16 digit)
  nuptk?: string; // NUPTK (16 digit)
  nip?: string; // NIP
  email: string;
  phone?: string; // No. HP / WhatsApp
  employmentStatus?: EmploymentStatus; // GTY | PTY | GTTY | PTTY | HONOR SEKOLAH
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  password?: string;
  teacherId?: string; // Terhubung ke ID guru jika role GURU/STAFF/TEACHER
  positionTitle?: string;
  // Link khusus Orang Tua Murid:
  studentId?: string; // ID Siswa anak
  studentNis?: string; // NIS Siswa anak
  studentName?: string; // Nama Siswa anak
  studentGrade?: string; // Kelas Siswa anak
  createdAt?: string;
}

export type TeachingDocCategory =
  | 'MODUL_AJAR'        // Modul Ajar / RPP Kurikulum Merdeka
  | 'SILABUS_ATP'       // Alur Tujuan Pembelajaran (ATP)
  | 'PROMES_PROTA'      // Program Tahunan & Semester (Prota/Promes)
  | 'ASESMEN_SOAL'      // Kisi-kisi & Butir Soal Asesmen / Ujian
  | 'JURNAL_MENGAJAR'   // Jurnal Harian & Refleksi Mengajar
  | 'LKPD'              // Lembar Kerja Peserta Didik
  | 'REKAP_NILAI'       // Daftar & Rekap Nilai Siswa
  | 'LAINNYA';          // Dokumen Administrasi Pendukung

export interface TeachingAdminDoc {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  title: string;
  category: TeachingDocCategory;
  academicYear: string;   // Contoh: "2026/2027"
  semester: 'Ganjil' | 'Genap';
  grade: string;          // Contoh: "Kelas 4A", "Semua Kelas"
  subject: string;        // Contoh: "Pendidikan Agama Kristen", "IPAS", "Matematika"
  fileName: string;
  fileSize?: string;
  fileData?: string;      // Base64 file data or link
  fileType?: string;      // PDF, DOCX, XLSX
  notes?: string;
  uploadedAt: string;     // ISO Date
  status: 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'PERLU_REVISI';
  adminFeedback?: string;
}

export interface PayrollRecord {
  id: string;
  slipNumber: string; // e.g. "BOPKRI-SLIP/2026/10/001"
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  teacherRole: string;
  period: string; // e.g. "Oktober 2026"
  baseSalary: number;
  positionAllowance: number; // Tunjangan Jabatan / Wali Kelas
  teachingAllowance: number; // Tunjangan Mengajar / Jam Tatap Muka
  welfareAllowance: number; // Tunjangan Kesejahteraan & Uang Makan
  bpjsAllowance: number; // Subsidi BPJS
  otherAllowance: number; // Tunjangan Lainnya / Ekstrakurikuler
  // Potongan
  coopDeduction: number; // Potongan Koperasi BOPKRI
  bpjsDeduction: number; // Iuran BPJS Ketenagakerjaan / Kesehatan
  taxDeduction: number; // PPh 21
  loanDeduction: number; // Kasbon / Pinjaman
  otherDeduction: number; // Potongan Lainnya
  // Totals
  totalAllowance: number;
  totalDeduction: number;
  netSalary: number; // Take Home Pay
  // Status transfer
  paymentStatus: 'BELUM_DITRANSFER' | 'SUDAH_DITRANSFER';
  paidAt?: string;
  transferRef?: string;
  bankName: string;
  accountNumber: string;
  teacherPhone: string;
  teacherEmail: string;
  principalName: string; // FX. Suhari Irawan, S.E
  treasurerName: string; // Eni Utaminingsih, S.Pd
  notes?: string;
  createdAt: string;
}

export interface SchoolStaffInfo {
  schoolName: string;
  foundationName: string;
  tagline: string; // "Cerdas Berkarakter"
  address: string;
  phone: string;
  email: string;
  website?: string;
  principal: string; // FX. Suhari Irawan, S.E
  treasurer: string; // Eni Utaminingsih, S.Pd
  cashier: string; // Nastiti Ken Utami
  academicYear: string;
  appDeveloper?: string; // Benisius Rahmat Basuki, S.Pd
  officialStampUrl?: string; // "/cap_resmi_bopkri.jpg"
}

// INVENTARISASI SEKOLAH TYPES
export type AssetCondition = 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT';

export type AssetStatus = 'TERSEDIA' | 'DIPINJAM' | 'DALAM_PERBAIKAN' | 'DIHAPUSBUKUKAN';

export type AssetCategory =
  | 'TIK_ELEKTRONIK'
  | 'MEBEL_PERABOT'
  | 'ALAT_MUSIK'
  | 'ALAT_OLAHRAGA'
  | 'ALAT_LAB_IPA'
  | 'BUKU_PUSTAKA'
  | 'SARANA_GEDUNG'
  | 'LAINNYA';

export type AssetFundingSource =
  | 'BOS_REGULER'
  | 'BOS_KINERJA'
  | 'YAYASAN_BOPKRI'
  | 'KOMITE_SEKOLAH'
  | 'HIBAH_DONASI';

export interface InventoryAsset {
  id: string;
  code: string;               // e.g. "INV-TIK/2026/001"
  name: string;               // e.g. "Chromebook Asus C214MA Rugged"
  category: AssetCategory;
  location: string;           // e.g. "Lab Komputer Lt. 2", "Ruang Kelas 4A"
  condition: AssetCondition;
  quantity: number;
  unit: string;               // "Unit", "Set", "Buah", "Paket"
  procurementYear: number;    // e.g. 2025, 2026
  sourceOfFunds: AssetFundingSource;
  purchasePrice: number;      // Nilai perolehan per satuan (Rp)
  totalValue: number;         // purchasePrice * quantity
  picName: string;            // Penanggung Jawab / Peminjam
  status: AssetStatus;
  notes?: string;             // Spesifikasi teknis, nomor seri
  createdAt: string;
  updatedAt?: string;
}

// SPMB (SISTEM PENERIMAAN MURID BARU) TYPES
export type SPMBStatus = 'MENUNGGU_VERIFIKASI' | 'DITERIMA' | 'CADANGAN' | 'DITOLAK';
export type SPMBEntryTrack = 'REGULER' | 'ZONASI' | 'PRESTASI' | 'AFIRMASI';

export interface SPMBRegistration {
  id: string;
  registrationNumber: string; // e.g. "SPMB-2026/001"
  nis: string; // Auto-generated NIS e.g. "2026001"
  fullName: string; // Nama Lengkap (*)
  previousSchool?: string; // Asal sekolah (*)
  birthPlace: string; // Tempat lahir (*)
  birthDate: string; // Tanggal lahir (*) (YYYY-MM-DD)
  nik?: string; // NIK (*)
  nisn?: string; // NISN (*)
  gender: 'L' | 'P'; // Jenis kelamin (*)
  heightCm?: number; // Tinggi badan (dalam cm) (*)
  weightKg?: number; // Berat badan (dalam kg) (*)
  headCircumferenceCm?: number; // Lingkar kepala (dalam cm)
  noKk?: string; // No. KK (*)
  aktaLahirRegNo?: string; // No. Registrasi Akta Lahir (*)
  religion?: string; // Agama (*)
  address: string; // Alamat tempat tinggal (sesuai KK) (*)
  rt?: string; // RT (sesuai KK) (*)
  rw?: string; // RW (sesuai KK) (*)
  dusun?: string; // Nama dusun
  kelurahan?: string; // Desa/Kelurahan (sesuai KK) (*)
  kecamatan?: string; // Kecamatan (sesuai KK) (*)
  kabupatenKota?: string; // Kabupaten/Kota (sesuai KK) (*)
  provinsi?: string; // Provinsi (sesuai KK) (*)
  postalCode?: string; // Kode pos (sesuai KK) (*)
  residenceType?: string; // Tempat tinggal (*)
  transportationMode?: string; // Moda Transportasi (*)
  distanceToSchoolKm?: number; // Jarak rumah ke sekolah (dalam kilometer) (*)
  travelTimeToSchoolMin?: number; // Waktu tempuh ke sekolah (dalam menit) (*)
  birthOrder?: number; // Anak ke-berapa (berdasarkan KK) (*)
  familyRelationStatus?: string; // Status hubungan dalam keluarga (*)
  siblingsCount?: number; // Jumlah saudara kandung (*)
  isKpsRecipient?: 'YA' | 'TIDAK'; // Penerima KPS (*)
  kpsNumber?: string;
  hasKip?: 'YA' | 'TIDAK'; // Apakah punya KIP (*)
  kipNumber?: string;
  
  // Berkas Dokumen (max 10MB)
  docPasFoto?: string; // Upload pas foto terbaru (*)
  docKartuKeluarga?: string; // Upload Kartu Keluarga (C1) (*)
  docAktaLahir?: string; // Upload Akta Lahir (*)
  docSuratTkOrPindah?: string; // Surat keterangan TK / Pindah (opsional)
  docSuratPsikolog?: string; // Surat Keterangan Psikolog (opsional)

  // Kontak Orang Tua & Jalur
  targetGrade: string; // Default "Kelas 1A"
  entryTrack: SPMBEntryTrack;
  status: SPMBStatus;
  registrationDate: string; // ISO string
  emailNotificationSent: boolean;
  emailSentAt?: string;
  parentName: string;
  parentPhone: string; // WhatsApp
  parentEmail: string;
  notes?: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp?: number;
}

