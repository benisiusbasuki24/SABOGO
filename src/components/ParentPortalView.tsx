import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateIndo, formatDateTimeIndo, formatRupiah } from '../utils/formatters';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  GraduationCap,
  History,
  Phone,
  Printer,
  QrCode,
  Receipt,
  Search,
  Sparkles,
  User,
  Users,
  Wallet,
} from 'lucide-react';

import { Student } from '../types';
import { StudentPicker } from './StudentPicker';

export const ParentPortalView: React.FC = () => {
  const {
    currentUser,
    students,
    bills,
    transactions,
    staffInfo,
    openReceiptPrint,
    updateUserProfile,
  } = useApp();

  // Active sub-tab for Parent Portal
  const [activeSubTab, setActiveSubTab] = useState<'TAGIHAN' | 'HISTORY'>('TAGIHAN');
  const [copiedVa, setCopiedVa] = useState(false);
  const [selectedStudentIdOverride, setSelectedStudentIdOverride] = useState<string>('');
  const [linkingChild, setLinkingChild] = useState<Student | null>(null);

  // Find all children belonging to this parent account (strict isolation)
  const myChildren = useMemo(() => {
    if (!currentUser) return [];
    return students.filter((s) => {
      if (currentUser.studentId && s.id === currentUser.studentId) return true;
      if (currentUser.studentNis && s.nis === currentUser.studentNis) return true;
      if (currentUser.studentName && s.name.toLowerCase() === currentUser.studentName.toLowerCase()) return true;
      // Match by parent phone or parent name if already recorded
      if (currentUser.phone && s.parentPhone && s.parentPhone.replace(/[^0-9]/g, '').length >= 8) {
        const cleanParentPhone = currentUser.phone.replace(/[^0-9]/g, '');
        const cleanStudentPhone = s.parentPhone.replace(/[^0-9]/g, '');
        if (cleanParentPhone.includes(cleanStudentPhone) || cleanStudentPhone.includes(cleanParentPhone)) return true;
      }
      if (currentUser.name && s.parentName && currentUser.name.trim().toLowerCase() === s.parentName.trim().toLowerCase()) return true;
      return false;
    });
  }, [currentUser, students]);

  // Primary linked student
  const matchedStudent = useMemo(() => {
    if (selectedStudentIdOverride) {
      const found = myChildren.find((s) => s.id === selectedStudentIdOverride);
      if (found) return found;
    }
    if (currentUser?.studentId) {
      const found = students.find((s) => s.id === currentUser.studentId);
      if (found) return found;
    }
    if (currentUser?.studentNis) {
      const found = students.find((s) => s.nis === currentUser.studentNis);
      if (found) return found;
    }
    if (currentUser?.studentName) {
      const found = students.find((s) => s.name.toLowerCase() === currentUser.studentName?.toLowerCase());
      if (found) return found;
    }
    if (myChildren.length > 0) {
      return myChildren[0];
    }
    return null;
  }, [currentUser, students, myChildren, selectedStudentIdOverride]);

  const handleConfirmLinkStudent = async () => {
    if (!linkingChild) return;
    await updateUserProfile({
      studentId: linkingChild.id,
      studentName: linkingChild.name,
      studentNis: linkingChild.nis,
      studentGrade: linkingChild.grade,
    });
    setLinkingChild(null);
  };

  // Student's bills (STRICTLY ISOLATED TO THE MATCHED STUDENT ONLY)
  const studentBills = useMemo(() => {
    if (!matchedStudent) return [];
    return bills.filter((b) => b.studentId === matchedStudent.id || (matchedStudent.nis && b.studentNis === matchedStudent.nis));
  }, [matchedStudent, bills]);

  // Student's transaction history (STRICTLY ISOLATED TO THE MATCHED STUDENT ONLY)
  const studentTransactions = useMemo(() => {
    if (!matchedStudent) return [];
    return transactions.filter(
      (tx) => tx.studentId === matchedStudent.id || (matchedStudent.nis && tx.studentNis === matchedStudent.nis)
    );
  }, [matchedStudent, transactions]);

  const unpaidBills = studentBills.filter((b) => b.status === 'BELUM_BAYAR' || b.status === 'MENUNGGAK' || b.status === 'SEBAGIAN');
  const paidBills = studentBills.filter((b) => b.status === 'LUNAS');

  const totalUnpaidAmount = unpaidBills.reduce((acc, b) => acc + (b.amount - b.paidAmount), 0);
  const totalPaidAmount = studentTransactions.reduce((acc, tx) => acc + tx.amount, 0);

  const vaNumber = matchedStudent?.vaNumber || (matchedStudent ? `88012${matchedStudent.nis}` : '8801200000');

  const handleCopyVa = () => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner for Orang Tua */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Portal Orang Tua / Wali Murid
              </span>
              <span className="text-xs text-blue-200">
                SD BOPKRI Gondolayu Yogyakarta
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Informasi Tagihan & Riwayat Pembayaran Siswa
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Selamat datang, <strong>{currentUser?.name || 'Bapak/Ibu Orang Tua Murid'}</strong>. Melalui portal ini, Anda dapat memantau rincian biaya sekolah putra/putri Anda secara transparan serta mencetak tanda bukti kwitansi sah kapan saja.
            </p>
          </div>

          {/* Quick Selector if parent has multiple children (ONLY parent's own children!) */}
          {myChildren.length > 1 && (
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 text-xs shrink-0 max-w-xs">
              <span className="text-[11px] text-blue-200 font-semibold block mb-1">
                Pilih Profil Siswa (Anak Anda):
              </span>
              <select
                value={matchedStudent?.id || ''}
                onChange={(e) => setSelectedStudentIdOverride(e.target.value)}
                className="w-full bg-slate-900/90 text-white border border-blue-400/40 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden"
              >
                {myChildren.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade} - NIS {s.nis})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Student Biodata & Virtual Account Strip */}
      {matchedStudent ? (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Student Identity */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-black shrink-0 border border-blue-200 shadow-2xs">
                {matchedStudent.name.charAt(0)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900">{matchedStudent.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {matchedStudent.grade}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {matchedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 font-mono">
                  NIS: <strong className="text-slate-800">{matchedStudent.nis}</strong> · NISN:{' '}
                  <strong className="text-slate-800">{matchedStudent.nisn || '-'}</strong>
                </p>
                
                <p className="text-xs text-slate-600">
                  Orang Tua / Wali: <strong className="text-slate-800">{matchedStudent.parentName}</strong> · No. HP WA: {matchedStudent.parentPhone}
                </p>
              </div>
            </div>

            {/* Right: Virtual Account Mandiri Box */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-2 max-w-sm shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  Nomor Virtual Account Mandiri
                </span>
                <span className="text-[10px] bg-amber-200/60 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">
                  Bank Mandiri
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-xl border border-amber-200">
                <span className="font-mono text-base font-extrabold text-blue-950 tracking-wider">
                  {vaNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyVa}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
                  title="Salin Nomor VA"
                >
                  {copiedVa ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-amber-800/90 leading-tight">
                Gunakan nomor VA di atas saat transfer via Livin' by Mandiri, ATM Mandiri, atau antar-bank dengan kode bank 008.
              </p>
            </div>

          </div>
        </div>

        {/* KPI Stats for Parent */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Belum Bayar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Sisa Tagihan Belum Dibayar</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${totalUnpaidAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatRupiah(totalUnpaidAmount)}
            </div>
            <span className="text-[11px] text-slate-400">
              {unpaidBills.length} item tagihan aktif
            </span>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totalUnpaidAmount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {totalUnpaidAmount > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
        </div>

        {/* Total Telah Terbayar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Pembayaran Berhasil</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
              {formatRupiah(totalPaidAmount)}
            </div>
            <span className="text-[11px] text-slate-400">
              {studentTransactions.length} kwitansi terbit
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Status Pembayaran */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Status Keuangan Siswa</span>
            <div className="text-base font-bold mt-1">
              {totalUnpaidAmount === 0 ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Seluruh Biaya Lunas
                </span>
              ) : unpaidBills.some((b) => b.status === 'MENUNGGAK') ? (
                <span className="text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Ada Tagihan Jatuh Tempo
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Menunggu Pembayaran
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              Tahun Ajaran {staffInfo.academicYear}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Tabs Navigation: Tagihan Aktif vs Riwayat Pembayaran */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-4 bg-slate-50/60">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveSubTab('TAGIHAN')}
              className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'TAGIHAN'
                  ? 'border-blue-800 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Daftar Tagihan Belum Lunas ({unpaidBills.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('HISTORY')}
              className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'HISTORY'
                  ? 'border-blue-800 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Kwitansi & Pembayaran Lengkap ({studentTransactions.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Daftar Tagihan Aktif */}
        {activeSubTab === 'TAGIHAN' && (
          <div className="p-5 sm:p-6 space-y-4">
            {unpaidBills.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Tagihan Tertunggak</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Terima kasih! Seluruh kewajiban pembayaran SPP dan uang kegiatan putra/putri Anda telah terlunasi dengan baik.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                      <th className="py-3 px-4">Pos Tagihan</th>
                      <th className="py-3 px-4">Periode</th>
                      <th className="py-3 px-4">Jatuh Tempo</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Nominal Tagihan</th>
                      <th className="py-3 px-4 text-right">Sudah Dibayar</th>
                      <th className="py-3 px-4 text-right">Sisa Kewajiban</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unpaidBills.map((bill) => {
                      const remaining = bill.amount - bill.paidAmount;
                      const isOverdue = bill.status === 'MENUNGGAK';

                      return (
                        <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{bill.billTypeName}</div>
                            {bill.extracurriculars && bill.extracurriculars.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {bill.extracurriculars.map((ekskul) => (
                                  <span key={ekskul} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                    {ekskul}
                                  </span>
                                ))}
                              </div>
                            )}
                            {bill.notes && (
                              <span className="text-[10px] text-slate-400 italic block mt-0.5">
                                Catatan: {bill.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">
                            {bill.period}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}>
                              {formatDateIndo(bill.dueDate)}
                            </span>
                            {isOverdue && (
                              <span className="block text-[10px] text-red-500 font-semibold">
                                Melewati jatuh tempo
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                <AlertCircle className="w-3 h-3 text-red-600" />
                                Menunggak
                              </span>
                            ) : bill.status === 'SEBAGIAN' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                Bayar Sebagian
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Belum Bayar
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                            {formatRupiah(bill.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                            {formatRupiah(bill.paidAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-red-600">
                            {formatRupiah(remaining)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Cara Pembayaran Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mt-4">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-2 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-blue-800" />
                Tata Cara Pembayaran Sekolah SD BOPKRI Gondolayu:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>1. Pembayaran di Loket Kasir Sekolah</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Pembayaran tunai dapat dilakukan langsung di loket kasir sekolah (Ibu <strong>{staffInfo.cashier}</strong>) pada jam dinas operasional sekolah (Senin - Jumat, 07.30 - 14.00 WIB).
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>2. Transfer Virtual Account Mandiri</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Transfer ke nomor VA: <strong className="font-mono text-blue-900">{vaNumber}</strong> melalui ATM Mandiri, aplikasi Livin' by Mandiri, atau transfer dari bank lain (pilih Bank Mandiri kode 008).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Riwayat Kwitansi & Pembayaran Lengkap */}
        {activeSubTab === 'HISTORY' && (
          <div className="p-5 sm:p-6 space-y-4">
            {studentTransactions.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">Belum Ada Riwayat Transaksi</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Riwayat pembayaran dan bukti kwitansi akan tampil otomatis di sini setelah pembayaran divalidasi oleh kasir sekolah.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                      <th className="py-3 px-4">No. Kwitansi</th>
                      <th className="py-3 px-4">Tanggal Pembayaran</th>
                      <th className="py-3 px-4">Rincian Pos Tagihan</th>
                      <th className="py-3 px-4">Metode Bayar</th>
                      <th className="py-3 px-4 text-right">Nominal Dibayar</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi / Cetak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                          {tx.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div>{formatDateIndo(tx.paidAt)}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(tx.paidAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{tx.billTypeName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">Periode: {tx.period}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {tx.paymentMethod}
                          </span>
                          {tx.referenceNumber && (
                            <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                              Ref: {tx.referenceNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                          {formatRupiah(tx.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Sah & Terverifikasi
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => openReceiptPrint(tx, 'A4')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            title="Buka dan cetak kwitansi resmi ke printer komputer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Kwitansi</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  ) : (
    <div className="bg-white rounded-2xl border-2 border-dashed border-amber-300 p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm my-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl font-bold">
        <GraduationCap className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">Akun Orang Tua Belum Terhubung dengan Data Siswa</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Akun Anda saat ini belum ditautkan dengan data putra/putri yang bersekolah di SD BOPKRI Gondolayu. Silakan cari dan pilih nama anak Anda di bawah ini:
        </p>
      </div>
      <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
        <StudentPicker
          students={students}
          selectedStudentId={linkingChild?.id}
          selectedStudentName={linkingChild?.name}
          selectedStudentNis={linkingChild?.nis}
          onSelect={(s) => setLinkingChild(s)}
          required={true}
          label="Pilih Nama Anak Anda"
          placeholder="Cari berdasarkan nama atau NIS murid..."
          helperText="Pilih nama anak agar data tagihan dan kwitansi pembayaran langsung tampil."
        />
        {linkingChild && (
          <button
            type="button"
            onClick={handleConfirmLinkStudent}
            className="mt-3 w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Hubungkan Akun Saya dengan {linkingChild.name}</span>
          </button>
        )}
      </div>
    </div>
  )}
</div>
  );
};
