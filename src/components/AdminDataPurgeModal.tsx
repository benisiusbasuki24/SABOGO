import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Banknote,
  BookOpen,
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Receipt,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';

export const AdminDataPurgeModal: React.FC = () => {
  const {
    isDataPurgeModalOpen,
    setIsDataPurgeModalOpen,
    currentUser,
    isSuperAdmin,
    students,
    bills,
    transactions,
    billTypes,
    teachers,
    payrolls,
    teachingDocs,
    assets,
    spmbRegistrations,
    registeredUsers,
    purgeModuleData,
    resetToDefaultData,
  } = useApp();

  const [confirmInput, setConfirmInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState<string | null>(null);

  if (!isDataPurgeModalOpen || !isSuperAdmin) return null;

  const nonAdminUsers = registeredUsers.filter(
    (u) =>
      u.id !== 'usr-admin-benisius' &&
      u.id !== 'usr-admin-filipus' &&
      u.username.toLowerCase() !== 'benisiusbasuki24' &&
      u.username.toLowerCase() !== 'benisius'
  );

  const totalAllItems =
    students.length +
    bills.length +
    transactions.length +
    billTypes.length +
    teachers.length +
    payrolls.length +
    teachingDocs.length +
    assets.length +
    spmbRegistrations.length +
    nonAdminUsers.length;

  const handlePurge = async (
    module:
      | 'students'
      | 'bills'
      | 'transactions'
      | 'billTypes'
      | 'teachers'
      | 'payrolls'
      | 'teachingDocs'
      | 'assets'
      | 'spmb'
      | 'users',
    moduleName: string
  ) => {
    let confirmPrompt = `⚠️ PERINGATAN SUPER ADMIN:\nApakah Anda yakin ingin MENGHAPUS SEMUA DATA ${moduleName.toUpperCase()}?\n\nData akan dibersihkan permanen dari Cloud Firestore dan seluruh perangkat sinkron.`;
    if (module === 'users') {
      confirmPrompt += '\n\nCatatan: Akun root Super Admin (Benisius Rahmat Basuki & Filipus) otomatis SELALU DILINDUNGI dan tidak akan terhapus.';
    }

    if (window.confirm(confirmPrompt)) {
      try {
        setIsPurging(module);
        await purgeModuleData(module);
        setSuccessMessage(`Seluruh data ${moduleName} berhasil dikosongkan permanen dari Cloud Firestore.`);
        setTimeout(() => setSuccessMessage(null), 3500);
      } finally {
        setIsPurging(null);
      }
    }
  };

  const handlePurgeAll = async () => {
    if (confirmInput.trim().toUpperCase() !== 'HAPUS') {
      alert('Ketik kata "HAPUS" pada kolom konfirmasi untuk melanjutkan.');
      return;
    }

    const confirmMsg =
      '⚠️ KONFIRMASI TERAKHIR FACTORY WIPE:\n\n' +
      `Seluruh data aplikasi (${totalAllItems} entri data mencakup Siswa, Tagihan, Kwitansi, Pos Tagihan, Guru, Slip Gaji, Modul Ajar, Inventaris Sarpras, Pendaftaran SPMB, dan Akun Pengguna Terdaftar) akan DIHAPUS TOTAL dari Cloud Firestore.\n\n` +
      'Akun utama Super Admin (Benisius Rahmat Basuki) tetap dilindungi agar Anda tetap dapat masuk dan mengelola sistem dari lembaran bersih.\n\n' +
      'Apakah Anda benar-benar yakin ingin melanjutkan?';

    if (window.confirm(confirmMsg)) {
      try {
        setIsPurging('all');
        await purgeModuleData('all');
        setConfirmInput('');
        setSuccessMessage('Seluruh data aplikasi SIBOGO berhasil dikosongkan total dari Cloud Firestore.');
        setTimeout(() => {
          setSuccessMessage(null);
          setIsDataPurgeModalOpen(false);
        }, 2200);
      } finally {
        setIsPurging(null);
      }
    }
  };

  const handleRestore = () => {
    resetToDefaultData();
    setIsDataPurgeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-red-800/40 px-5 sm:px-6 py-4 bg-red-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-800/80 rounded-xl text-red-100 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-800 text-red-100 border border-red-700/60">
                  Otoritas Super Admin
                </span>
                <span className="text-xs text-red-200 font-mono font-medium">
                  Total {totalAllItems} data tersimpan
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                Pusat Penghapusan & Pembersihan Data (Purge Center)
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsDataPurgeModalOpen(false)}
            className="p-2 text-red-200 hover:text-white rounded-xl hover:bg-red-800/60 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700">
          {/* Notification Toast */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {isPurging && (
            <div className="p-3.5 bg-blue-50 border border-blue-300 rounded-xl text-blue-900 font-semibold flex items-center gap-3 shadow-xs animate-pulse">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>
                Sedang memproses pembersihan data di Cloud Firestore & seluruh perangkat, mohon tunggu sebentar...
              </span>
            </div>
          )}

          {/* Advisory Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950">
                  Panduan Kontrol Data Super Administrator:
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Gunakan menu ini untuk membersihkan data demo/testing per modul, menghapus pendaftaran PPDB atau akun uji coba, ataupun mengosongkan seluruh basis data untuk memulai tahun ajaran baru dari nol (fresh state). Perubahan tersinkronisasi otomatis ke Cloud Firestore dan seluruh perangkat yang terhubung.
                </p>
              </div>
            </div>
          </div>

          {/* Module-by-Module Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-slate-700" />
                Pilihan Pembersihan per Modul (10 Modul Tersedia)
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Pilih modul yang ingin dikosongkan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 1. Siswa */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">Data Siswa</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {students.length} siswa terdaftar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('students', 'Data Siswa')}
                  disabled={students.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              {/* 2. Tagihan Uang Sekolah */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">Tagihan Uang Sekolah</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {bills.length} tagihan SPP & kegiatan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('bills', 'Tagihan')}
                  disabled={bills.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              {/* 3. Transaksi & Kwitansi */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">Riwayat Kwitansi & Kasir</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {transactions.length} kwitansi pembayaran
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('transactions', 'Riwayat Kwitansi & Kasir')}
                  disabled={transactions.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              {/* 4. Pos Tagihan */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">Pos & Jenis Tagihan</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {billTypes.length} pos jenis tagihan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('billTypes', 'Pos Tagihan')}
                  disabled={billTypes.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              {/* 5. Master Guru & Staf */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">Master Data Guru & Staf</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {teachers.length} guru & staf kependidikan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('teachers', 'Master Guru & Staf')}
                  disabled={teachers.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              {/* 6. Penggajian & Slip */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">Slip Gaji & Penggajian</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {payrolls.length} slip gaji tercatat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('payrolls', 'Data Penggajian & Slip Gaji')}
                  disabled={payrolls.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              {/* 7. Administrasi Ajar */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">Administrasi Mengajar Guru</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {teachingDocs.length} modul ajar & ATP
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('teachingDocs', 'Dokumen Administrasi Mengajar')}
                  disabled={teachingDocs.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              {/* 8. Inventaris */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">Aset & Sarana Inventaris</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {assets.length} aset sarpras tercatat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('assets', 'Aset Inventaris')}
                  disabled={assets.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              {/* 9. SPMB / PPDB */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">Pendaftaran Siswa Baru (SPMB / PPDB)</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {spmbRegistrations.length} calon siswa terdaftar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('spmb', 'Pendaftaran Siswa Baru (SPMB / PPDB)')}
                  disabled={spmbRegistrations.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              {/* 10. Akun Pengguna Terdaftar */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-xs truncate">Akun Terdaftar Portal</h4>
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-semibold rounded shrink-0 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" /> SuperAdmin Aman
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {nonAdminUsers.length} akun non-admin ({registeredUsers.length} total)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('users', 'Akun Pengguna Terdaftar')}
                  disabled={nonAdminUsers.length === 0 || isPurging !== null}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>
            </div>
          </div>

          {/* PERINGATAN BERBAHAYA: KOSONGKAN SELURUH DATA SISTEM */}
          <div className="border-2 border-red-200 bg-red-50/70 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <h4 className="text-sm font-bold text-red-950">
                    Zona Bahaya: Kosongkan Seluruh Data Sistem (Full Factory Wipe)
                  </h4>
                  <p className="text-[11px] text-red-800 mt-1 leading-relaxed">
                    Tindakan ini akan menghapus <strong>seluruh database</strong> ({totalAllItems} entri data aktif) di semua fitur tanpa terkecuali, mengosongkan aplikasi secara menyeluruh di Cloud Firestore untuk mulai dari nol. Akun Super Admin Benisius Basuki tetap dilindungi agar Anda dapat mengonfigurasi ulang aplikasi.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Ketik kata 'HAPUS' di sini"
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      disabled={isPurging !== null}
                      className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-white border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    onClick={handlePurgeAll}
                    disabled={confirmInput.trim().toUpperCase() !== 'HAPUS' || isPurging !== null}
                    className="px-5 py-2.5 bg-red-700 hover:bg-red-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors shadow-xs inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isPurging === 'all' ? 'Sedang Menghapus...' : 'Kosongkan Seluruh Data Sekarang'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RESTORE SEED DATA SECTION */}
          <div className="border border-slate-200 bg-slate-50/90 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-indigo-700" />
                <span>Pemulihan Contoh Awal SD BOPKRI Gondolayu</span>
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ingin mengembalikan seluruh database ke data contoh resmi SD BOPKRI Gondolayu (212 siswa, guru, tagihan)? Klik tombol ini kapan saja.
              </p>
            </div>
            <button
              onClick={handleRestore}
              disabled={isPurging !== null}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 font-bold rounded-xl text-xs transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Pulihkan Data Contoh</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 px-6 py-3.5 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Akses Terverifikasi: <strong className="text-slate-800">{currentUser?.name}</strong> (Super Admin)
          </span>
          <button
            onClick={() => setIsDataPurgeModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
