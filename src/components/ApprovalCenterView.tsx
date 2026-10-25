import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateIndo, formatRupiah } from '../utils/formatters';
import {
  AlertCircle,
  Banknote,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  MessageSquare,
  Printer,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { TeachingAdminDoc } from '../types';

export const ApprovalCenterView: React.FC = () => {
  const {
    currentUser,
    teachingDocs,
    payrolls,
    transactions,
    bills,
    staffInfo,
    updateTeachingDocStatus,
    markPayrollTransferred,
    openReceiptPrint,
  } = useApp();

  const isKepalaSekolah = currentUser?.role === 'KEPALA_SEKOLAH' || currentUser?.role === 'ADMIN';
  const isBendahara = currentUser?.role === 'BENDAHARA' || currentUser?.role === 'ADMIN';

  // Active sub-tab in approval center
  const [activeApprovalTab, setActiveApprovalTab] = useState<'KEUANGAN' | 'PENGGAJIAN' | 'ADMINISTRASI_AJAR'>('KEUANGAN');

  // Verification modal for teaching doc
  const [verifyingDoc, setVerifyingDoc] = useState<TeachingAdminDoc | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [filterDocCategory, setFilterDocCategory] = useState<string>('ALL');

  // Payroll approval selection
  const [selectedPeriod, setSelectedPeriod] = useState('Oktober 2026');

  // Metrics
  const pendingDocs = teachingDocs.filter((d) => d.status === 'MENUNGGU_VERIFIKASI');
  const approvedDocs = teachingDocs.filter((d) => d.status === 'DISETUJUI');

  const pendingPayrolls = payrolls.filter((p) => p.paymentStatus === 'BELUM_DITRANSFER');
  const approvedPayrolls = payrolls.filter((p) => p.paymentStatus === 'SUDAH_DITRANSFER');

  const totalPayrollAmount = payrolls.reduce((acc, p) => acc + p.netSalary, 0);
  const totalIncomeVerified = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  const handleApproveDoc = (docId: string, status: 'DISETUJUI' | 'PERLU_REVISI') => {
    updateTeachingDocStatus(docId, status, feedbackText || undefined);
    setVerifyingDoc(null);
    setFeedbackText('');
  };

  const handleApproveAllPendingPayrolls = () => {
    if (pendingPayrolls.length === 0) return;
    if (window.confirm(`Setujui transfer seluruh ${pendingPayrolls.length} slip gaji untuk periode ${selectedPeriod}?`)) {
      pendingPayrolls.forEach((p) => {
        markPayrollTransferred(p.id, `TRF-BOPKRI-${Date.now().toString().slice(-6)}`);
      });
      alert('Seluruh slip gaji berhasil disetujui & ditandai sudah ditransfer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-7 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Pusat Approval & Verifikasi Resmi
              </span>
              <span className="text-xs text-slate-300">
                SD BOPKRI Gondolayu Yogyakarta
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pusat Persetujuan & Validasi Manajerial
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Ruang otoritas khusus bagi <strong>Kepala Sekolah ({staffInfo.principal})</strong> dan <strong>Bendahara ({staffInfo.treasurer})</strong> untuk memverifikasi penerimaan keuangan, memvalidasi slip penggajian pendidik, dan mengesahkan perangkat kurikulum dewan guru.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl border border-white/15 text-xs shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Login Otoritas:</div>
              <div className="font-bold text-white text-sm">{currentUser?.name}</div>
              <div className="text-[10px] text-amber-300 font-mono">
                Jabatan: {currentUser?.role === 'KEPALA_SEKOLAH' ? 'Kepala Sekolah' : currentUser?.role === 'BENDAHARA' ? 'Bendahara Sekolah' : 'Administrator'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Approval Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Keuangan Validasi */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Penerimaan Kasir Tervalidasi</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
              {formatRupiah(totalIncomeVerified)}
            </div>
            <span className="text-[11px] text-slate-400">{transactions.length} kwitansi terekam sah</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Penggajian Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Persetujuan Slip Gaji</span>
            <div className="text-2xl font-bold font-mono text-blue-900 mt-0.5">
              {approvedPayrolls.length} / {payrolls.length} Slip
            </div>
            <span className="text-[11px] text-slate-400">
              {pendingPayrolls.length} menunggu persetujuan transfer
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Administrasi Mengajar Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Dokumen Ajar Guru</span>
            <div className="text-2xl font-bold font-mono text-amber-600 mt-0.5">
              {pendingDocs.length} Berkas Menunggu
            </div>
            <span className="text-[11px] text-slate-400">
              {approvedDocs.length} berkas disetujui
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Approval Tab Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Strip */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-4 bg-slate-50/60">
          <div className="flex items-center gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveApprovalTab('KEUANGAN')}
              className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeApprovalTab === 'KEUANGAN'
                  ? 'border-blue-800 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>1. Validasi Keuangan & Kasir</span>
            </button>

            <button
              onClick={() => setActiveApprovalTab('PENGGAJIAN')}
              className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeApprovalTab === 'PENGGAJIAN'
                  ? 'border-blue-800 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>2. Approval Penggajian & Slip ({pendingPayrolls.length} pending)</span>
            </button>

            <button
              onClick={() => setActiveApprovalTab('ADMINISTRASI_AJAR')}
              className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeApprovalTab === 'ADMINISTRASI_AJAR'
                  ? 'border-blue-800 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>3. Verifikasi Perangkat Ajar ({pendingDocs.length} pending)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Validasi Keuangan */}
        {activeApprovalTab === 'KEUANGAN' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Laporan Pengesahan Keuangan Kasir & SPP
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ditandatangani secara sah oleh Kasir ({staffInfo.cashier}), Bendahara ({staffInfo.treasurer}), dan Kepala Sekolah ({staffInfo.principal}).
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-white border border-blue-200 rounded-lg shadow-2xs hover:bg-blue-50 transition-colors shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Pengesahan Audit</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">No. Kwitansi</th>
                    <th className="py-3 px-4">Waktu Transaksi</th>
                    <th className="py-3 px-4">Siswa & Kelas</th>
                    <th className="py-3 px-4">Jenis Tagihan</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4">Metode Bayar</th>
                    <th className="py-3 px-4 text-center">Status Verifikasi</th>
                    <th className="py-3 px-4 text-center">Tinjau Kwitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 15).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">
                        {tx.receiptNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDateIndo(tx.paidAt)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {tx.studentName} ({tx.studentGrade})
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {tx.billTypeName} ({tx.period})
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terverifikasi
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openReceiptPrint(tx)}
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Tinjau dan Cetak Kwitansi Resmi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Approval Penggajian & Slip */}
        {activeApprovalTab === 'PENGGAJIAN' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Persetujuan & Realisasi Transfer Gaji Dewan Guru
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total pengeluaran gaji periode ini: <strong>{formatRupiah(totalPayrollAmount)}</strong>
                </p>
              </div>

              {pendingPayrolls.length > 0 && (
                <button
                  type="button"
                  onClick={handleApproveAllPendingPayrolls}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Setujui Semua ({pendingPayrolls.length} Slip Pending)</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">No. Slip</th>
                    <th className="py-3 px-4">Nama Guru & NIP</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4">Rekening BPD DIY</th>
                    <th className="py-3 px-4 text-right">Gaji Pokok</th>
                    <th className="py-3 px-4 text-right">Take Home Pay</th>
                    <th className="py-3 px-4 text-center">Status Approval</th>
                    <th className="py-3 px-4 text-center">Aksi Otoritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrolls.map((p) => {
                    const isTransferred = p.paymentStatus === 'SUDAH_DITRANSFER';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-900">
                          {p.slipNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{p.teacherName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NIP: {p.teacherNip}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{p.teacherRole}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {p.bankName} - {p.accountNumber}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          {formatRupiah(p.baseSalary)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-950 text-sm">
                          {formatRupiah(p.netSalary)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isTransferred ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Disetujui & Ditransfer
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Menunggu Approval
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {!isTransferred ? (
                            <button
                              type="button"
                              onClick={() => {
                                markPayrollTransferred(p.id, `TRF-BOPKRI-${Date.now().toString().slice(-6)}`);
                              }}
                              className="px-2.5 py-1 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors"
                            >
                              Setujui Slip
                            </button>
                          ) : (
                            <span className="text-emerald-700 text-[11px] font-semibold">Tervalidasi</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Verifikasi Perangkat Ajar Guru */}
        {activeApprovalTab === 'ADMINISTRASI_AJAR' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Supervisi Perangkat Ajar Kurikulum Merdeka
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tinjau modul ajar, alur tujuan pembelajaran (ATP), kisi-kisi asesmen, dan jurnal mengajar yang diunggah oleh seluruh dewan guru.
                </p>
              </div>

              <div className="text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300">
                {pendingDocs.length} dokumen butuh verifikasi
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Nama Dokumen & File</th>
                    <th className="py-3 px-4">Guru Pengunggah</th>
                    <th className="py-3 px-4">Mata Pelajaran & Kelas</th>
                    <th className="py-3 px-4">Tanggal Unggah</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachingDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-blue-700 font-mono mt-0.5 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{doc.fileName}</span>
                        </div>
                        {doc.adminFeedback && (
                          <div className="text-[10px] text-slate-500 italic mt-1">
                            Catatan: "{doc.adminFeedback}"
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{doc.teacherName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIP: {doc.teacherNip}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">{doc.subject}</div>
                        <div className="text-[10px] text-slate-500">{doc.grade} · {doc.semester}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDateIndo(doc.uploadedAt)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {doc.status === 'DISETUJUI' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Disetujui
                          </span>
                        )}
                        {doc.status === 'MENUNGGU_VERIFIKASI' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Verifikasi
                          </span>
                        )}
                        {doc.status === 'PERLU_REVISI' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Perlu Revisi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyingDoc(doc);
                            setFeedbackText(doc.adminFeedback || '');
                          }}
                          className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors"
                        >
                          Verifikasi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Verification Modal for Teaching Doc */}
      {verifyingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Verifikasi Perangkat Ajar
              </h3>
              <button
                type="button"
                onClick={() => setVerifyingDoc(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p>Judul: <strong className="text-slate-900">{verifyingDoc.title}</strong></p>
              <p>Guru: <strong className="text-slate-900">{verifyingDoc.teacherName}</strong></p>
              <p>Mapel & Kelas: <strong>{verifyingDoc.subject} ({verifyingDoc.grade})</strong></p>
              <p>File: <span className="font-mono text-blue-800">{verifyingDoc.fileName}</span></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Umpan Balik / Catatan Supervisi:
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Contoh: Modul ajar sangat lengkap dan sesuai rubrik Kurikulum Merdeka. Terus dipertahankan..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleApproveDoc(verifyingDoc.id, 'PERLU_REVISI')}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
              >
                Minta Revisi
              </button>
              <button
                type="button"
                onClick={() => handleApproveDoc(verifyingDoc.id, 'DISETUJUI')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Setujui Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
