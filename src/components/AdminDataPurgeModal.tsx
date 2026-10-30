import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  BookOpen,
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Receipt,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Users,
  Wallet,
  X,
} from 'lucide-react';

export const AdminDataPurgeModal: React.FC = () => {
  const {
    isDataPurgeModalOpen,
    setIsDataPurgeModalOpen,
    currentUser,
    students,
    bills,
    transactions,
    billTypes,
    teachers,
    payrolls,
    teachingDocs,
    assets,
    purgeModuleData,
    resetToDefaultData,
  } = useApp();

  const [confirmInput, setConfirmInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isDataPurgeModalOpen) return null;

  const isAdmin = currentUser?.role === 'ADMIN';
  if (!isAdmin) return null;

  const handlePurge = (
    module: 'students' | 'bills' | 'transactions' | 'billTypes' | 'teachers' | 'payrolls' | 'teachingDocs' | 'assets',
    moduleName: string
  ) => {
    if (window.confirm(`⚠️ PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA ${moduleName.toUpperCase()}?\nData yang dihapus tidak dapat dipulihkan kembali.`)) {
      purgeModuleData(module);
      setSuccessMessage(`Seluruh data ${moduleName} berhasil dikosongkan.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handlePurgeAll = () => {
    if (confirmInput.trim().toUpperCase() !== 'HAPUS') {
      alert('Ketik kata "HAPUS" pada kolom konfirmasi untuk melanjutkan.');
      return;
    }

    if (window.confirm('⚠️ KONFIRMASI TERAKHIR: Seluruh data (Siswa, Tagihan, Kwitansi, Guru, Slip, Dokumen Ajar, dan Inventaris) akan DIHAPUS TOTAL menjadi kosong.\n\nLanjutkan?')) {
      purgeModuleData('all');
      setConfirmInput('');
      setSuccessMessage('Seluruh data aplikasi SIBOGO berhasil dikosongkan total.');
      setTimeout(() => {
        setSuccessMessage(null);
        setIsDataPurgeModalOpen(false);
      }, 2000);
    }
  };

  const handleRestore = () => {
    resetToDefaultData();
    setIsDataPurgeModalOpen(false);
  };

  const totalAllItems =
    students.length +
    bills.length +
    transactions.length +
    billTypes.length +
    teachers.length +
    payrolls.length +
    teachingDocs.length +
    assets.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-red-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-800/80 rounded-xl text-red-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-800 text-red-100">
                  Hak Istimewa Admin
                </span>
                <span className="text-xs text-red-200 font-mono">Total {totalAllItems} data sistem</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                Pusat Penghapusan & Pengelolaan Data (Admin Purge Center)
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsDataPurgeModalOpen(false)}
            className="p-1.5 text-red-200 hover:text-white rounded-lg hover:bg-red-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Notification Toast */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Informasi Kontrol Data Admin:</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Sebagai Administrator, Anda memiliki otoritas penuh untuk menghapus data secara selektif per modul atau mengosongkan seluruh sistem untuk memulai dari lembaran bersih (fresh install). Anda juga dapat mengembalikan contoh data awal kapan saja.
                </p>
              </div>
            </div>
          </div>

          {/* Module-by-Module Cards Grid */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-slate-700" />
              Pilihan Penghapusan Data per Modul
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 1. Siswa */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Data Siswa</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {students.length} siswa terdaftar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('students', 'Data Siswa')}
                  disabled={students.length === 0}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan
                </button>
              </div>

              {/* 2. Tagihan Uang Sekolah */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Tagihan Uang Sekolah</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {bills.length} tagihan SPP / kegiatan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('bills', 'Tagihan')}
                  disabled={bills.length === 0}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan
                </button>
              </div>

              {/* 3. Transaksi & Kwitansi */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Riwayat Kwitansi & Kasir</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {transactions.length} kwitansi pembayaran
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('transactions', 'Riwayat Kwitansi & Kasir')}
                  disabled={transactions.length === 0}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan
                </button>
              </div>

              {/* 4. Pos Tagihan */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Pos & Jenis Tagihan</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {billTypes.length} pos jenis tagihan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('billTypes', 'Pos Tagihan')}
                  disabled={billTypes.length === 0}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan
                </button>
              </div>

              {/* 5. Master Guru & Staf */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Master Data Guru & Staf</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {teachers.length} guru / tenaga kependidikan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('teachers', 'Master Guru & Staf')}
                  disabled={teachers.length === 0}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan
                </button>
              </div>

              {/* 6. Penggajian & Slip */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Slip Gaji & Penggajian</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {payrolls.length} slip gaji tercatat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('payrolls', 'Data Penggajian & Slip Gaji')}
                  disabled={payrolls.length === 0}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan
                </button>
              </div>

              {/* 7. Administrasi Ajar */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Perangkat Administrasi Mengajar</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {teachingDocs.length} modul ajar & ATP
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('teachingDocs', 'Dokumen Administrasi Mengajar')}
                  disabled={teachingDocs.length === 0}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan
                </button>
              </div>

              {/* 8. Inventaris */}
              <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Aset & Sarana Inventaris</h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {assets.length} aset sarpras tercatat
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurge('assets', 'Aset Inventaris')}
                  disabled={assets.length === 0}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Kosongkan
                </button>
              </div>
            </div>
          </div>

          {/* PERINGATAN BERBAHAYA BOSS!!!: KOSONGKAN SELURUH DATA SISTEM */}
          <div className="border-2 border-red-200 bg-red-50/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-950">
                  Zona Bahaya: Kosongkan Seluruh Data Sistem (Full Factory Wipe)
                </h4>
                <p className="text-[11px] text-red-800 mt-0.5 leading-relaxed">
                  Tindakan ini akan menghapus <strong>seluruh database</strong> ({totalAllItems} entri data) di semua fitur tanpa terkecuali, mengosongkan aplikasi secara menyeluruh untuk mulai dari nol.
                </p>

                <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Ketik kata 'HAPUS' di sini"
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 uppercase placeholder:normal-case placeholder:font-normal"
                    />
                  </div>
                  <button
                    onClick={handlePurgeAll}
                    disabled={confirmInput.trim().toUpperCase() !== 'HAPUS'}
                    className="w-full sm:w-auto px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors shadow-xs inline-flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Kosongkan Seluruh Data Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RESTORE SEED DATA SECTION */}
          <div className="border border-slate-200 bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-indigo-700" />
                <span>Pemulihan Contoh Awal SD BOPKRI Gondolayu</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ingin mengembalikan data contoh resmi SD BOPKRI Gondolayu? Klik tombol berikut kapan saja.
              </p>
            </div>
            <button
              onClick={handleRestore}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Pulihkan Data Contoh</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 px-6 py-3.5 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Akses Admin: <strong>{currentUser?.name}</strong>
          </span>
          <button
            onClick={() => setIsDataPurgeModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
