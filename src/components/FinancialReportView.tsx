import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, PaymentTransaction } from '../types';
import { exportToCSV, formatDateIndo, formatDateTimeIndo, formatRupiah } from '../utils/formatters';
import { BOPKRI_LOGO, handleImageError } from '../assets/logo';
import {
  Banknote,
  Calendar,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  QrCode,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react';

export const FinancialReportView: React.FC = () => {
  const {
    transactions,
    staffInfo,
    openReceiptPrint,
    bills,
    deleteTransaction,
    deleteTransactionsBulk,
    purgeModuleData,
    setIsDataPurgeModalOpen,
    currentUser,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [selectedMethod, setSelectedMethod] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPrintReport, setShowPrintReport] = useState<boolean>(false);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  const isAdmin = currentUser?.role === 'ADMIN';

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Month filter
    if (selectedMonth !== 'SEMUA') {
      const txMonth = tx.paidAt.substring(0, 7); // "2026-10"
      if (txMonth !== selectedMonth) return false;
    }

    // Method filter
    if (selectedMethod !== 'SEMUA') {
      if (selectedMethod === 'TUNAI' && tx.paymentMethod !== 'TUNAI') return false;
      if (selectedMethod === 'QRIS' && tx.paymentMethod !== 'QRIS') return false;
      if (selectedMethod === 'VA' && !tx.paymentMethod.startsWith('VA')) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.studentName.toLowerCase().includes(q);
      const matchNis = tx.studentNis.includes(q);
      const matchReceipt = tx.receiptNumber.toLowerCase().includes(q);
      const matchParent = tx.parentName.toLowerCase().includes(q);
      if (!matchName && !matchNis && !matchReceipt && !matchParent) return false;
    }

    return true;
  });

  // Calculate totals
  const totalFilteredIncome = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  const cashIncome = filteredTransactions
    .filter((t) => t.paymentMethod === 'TUNAI')
    .reduce((acc, t) => acc + t.amount, 0);

  const qrisIncome = filteredTransactions
    .filter((t) => t.paymentMethod === 'QRIS')
    .reduce((acc, t) => acc + t.amount, 0);

  const vaIncome = filteredTransactions
    .filter((t) => t.paymentMethod.startsWith('VA'))
    .reduce((acc, t) => acc + t.amount, 0);

  const sppTotal = filteredTransactions
    .filter((t) => t.billTypeName.includes('SPP'))
    .reduce((acc, t) => acc + t.amount, 0);

  const kegiatanTotal = filteredTransactions
    .filter((t) => t.billTypeName.includes('Kegiatan'))
    .reduce((acc, t) => acc + t.amount, 0);

  const ekskulTotal = filteredTransactions
    .filter((t) => t.billTypeName.includes('Ekstrakurikuler'))
    .reduce((acc, t) => acc + t.amount, 0);

  const otherTotal = totalFilteredIncome - (sppTotal + kegiatanTotal + ekskulTotal);

  // Total Outstanding Piutang across all bills
  const totalArrears = bills
    .filter((b) => b.status === 'MENUNGGAK')
    .reduce((acc, b) => acc + (b.amount - b.paidAmount), 0);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = [
      'No',
      'Tanggal Pembayaran',
      'No. Kwitansi',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Nama Orang Tua',
      'Jenis Tagihan',
      'Periode',
      'Nominal (Rp)',
      'Metode Pembayaran',
      'Nomor Referensi',
      'Kasir Penerima',
      'Bendahara',
      'Kepala Sekolah',
      'Catatan',
    ];

    const rows = filteredTransactions.map((tx, idx) => [
      idx + 1,
      formatDateTimeIndo(tx.paidAt),
      tx.receiptNumber,
      tx.studentNis,
      tx.studentName,
      tx.studentGrade,
      tx.parentName,
      tx.billTypeName,
      tx.period,
      tx.amount,
      tx.paymentMethod,
      tx.referenceNumber || '-',
      tx.cashierName,
      tx.treasurerName,
      tx.principalName,
      tx.notes || '-',
    ]);

    const periodLabel = selectedMonth === 'SEMUA' ? 'Semua_Periode' : selectedMonth;
    exportToCSV(`Laporan_Keuangan_SD_BOPKRI_Gondolayu_${periodLabel}`, headers, rows);
  };

  const handlePrintAuditReport = () => {
    setShowPrintReport(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const monthOptions = [
    { value: '2026-10', label: 'Oktober 2026 (Bulan Berjalan)' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'Agustus 2026' },
    { value: '2026-07', label: 'Juli 2026' },
    { value: 'SEMUA', label: 'Semua Periode (T.A. 2026/2027)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Audit & Pertanggungjawaban Keuangan</span>
            <span aria-hidden="true">·</span>
            <span>SD BOPKRI Gondolayu</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dasbor Laporan Keuangan Real-Time
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Rekapitulasi pemasukan SPP, uang kegiatan, dan ekstrakurikuler dengan verifikasi kasir Nastiti Ken Utami, bendahara Eni Utaminingsih, S.Pd, dan kepala sekolah FX. Suhari Irawan, S.E.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsDataPurgeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              title="Buka Pusat Pengelolaan & Penghapusan Data Sistem"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Pusat Hapus Data</span>
            </button>
          )}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Ekspor ke Excel (.CSV)
          </button>
          <button
            onClick={handlePrintAuditReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan Audit (PDF)
          </button>
        </div>
      </div>

      {/* Real-time Summary Cards Strip */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Penerimaan Periode Ini</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {formatRupiah(totalFilteredIncome)}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            {filteredTransactions.length} Kwitansi Tercatat
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Kas Tunai di Loket</span>
            <Banknote className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-900 tabular-nums">
            {formatRupiah(cashIncome)}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Kasir: {staffInfo.cashier}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>QRIS & Virtual Account</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-indigo-900 tabular-nums">
            {formatRupiah(qrisIncome + vaIncome)}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            QRIS: {formatRupiah(qrisIncome)} · VA: {formatRupiah(vaIncome)}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tunggakan Piutang Sekolah</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 tabular-nums">
            {formatRupiah(totalArrears)}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Perlu konfirmasi WhatsApp
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-600">Pilih Periode:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-600">Metode:</span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
            >
              <option value="SEMUA">Semua Metode</option>
              <option value="TUNAI">Tunai Saja</option>
              <option value="QRIS">QRIS Saja</option>
              <option value="VA">Virtual Account Saja</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kwitansi, siswa, NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Ledger Table (Interactive Screen View) */}
      <div className="no-print bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Daftar Jurnal Penerimaan Kas
            </span>
            {selectedTxIds.length > 0 && isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Yakin ingin menghapus ${selectedTxIds.length} kwitansi terpilih? Status tagihan terkait akan otomatis disesuaikan.`)) {
                    deleteTransactionsBulk(selectedTxIds, true);
                    setSelectedTxIds([]);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus {selectedTxIds.length} Kwitansi Terpilih</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-900">
              Total: {formatRupiah(totalFilteredIncome)}
            </span>
            {isAdmin && transactions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus dan kosongkan SELURUH riwayat transaksi dan kwitansi kasir?')) {
                    purgeModuleData('transactions');
                    setSelectedTxIds([]);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="Kosongkan seluruh riwayat kwitansi kasir"
              >
                <Trash2 className="w-3 h-3" />
                <span>Kosongkan Riwayat</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {isAdmin && (
                  <th className="py-3 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredTransactions.length > 0 &&
                        selectedTxIds.length === filteredTransactions.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTxIds(filteredTransactions.map((t) => t.id));
                        } else {
                          setSelectedTxIds([]);
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                  </th>
                )}
                <th className="py-3 px-4">No. Kwitansi</th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Siswa & Kelas</th>
                <th className="py-3 px-4">Pos Tagihan</th>
                <th className="py-3 px-4">Metode & Ref</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Aksi & Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-slate-500">
                    Tidak ada transaksi pada periode atau kriteria yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isSelected = selectedTxIds.includes(tx.id);

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {isAdmin && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedTxIds((prev) =>
                                prev.includes(tx.id)
                                  ? prev.filter((id) => id !== tx.id)
                                  : [...prev, tx.id]
                              );
                            }}
                            className="rounded border-slate-300"
                          />
                        </td>
                      )}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {tx.receiptNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDateTimeIndo(tx.paidAt)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{tx.studentName}</p>
                        <p className="text-[11px] text-slate-500">
                          {tx.studentGrade} · NIS: {tx.studentNis}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{tx.billTypeName}</p>
                        <p className="text-[10px] text-blue-900 font-medium">{tx.period}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{tx.paymentMethod}</span>
                        {tx.referenceNumber && (
                          <p className="text-[10px] font-mono text-slate-400">{tx.referenceNumber}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openReceiptPrint(tx, 'A4')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            title="Cetak Nota Kwitansi Resmi"
                          >
                            <Printer className="w-3 h-3" />
                            Cetak
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Hapus kwitansi ${tx.receiptNumber} (${tx.studentName}) senilai ${formatRupiah(tx.amount)}?\n\nStatus tagihan siswa akan disesuaikan kembali.`
                                  )
                                ) {
                                  deleteTransaction(tx.id, true);
                                  setSelectedTxIds((prev) => prev.filter((id) => id !== tx.id));
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                              title="Hapus / Batalkan Kwitansi Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY OFFICIAL AUDIT REPORT (PRINT & PDF VIEW)                       */}
      {/* ========================================================================= */}
      <div className="hidden print:block text-slate-900 p-4 font-sans text-xs">
        {/* KOP SURAT */}
        <div className="flex items-center gap-5 border-b-2 border-slate-900 pb-4 mb-6">
          <img
            src={BOPKRI_LOGO}
            onError={handleImageError}
            alt="Logo BOPKRI"
            className="w-20 h-20 object-contain"
          />
          <div className="flex-1 text-center">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-600">
              {staffInfo.foundationName}
            </h4>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
              {staffInfo.schoolName}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{staffInfo.address}</p>
            <p className="text-[11px] text-slate-500">
              Telp: {staffInfo.phone} · Website: {staffInfo.website || 'www.sdbopkrigondolayu.sch.id'} · Email: {staffInfo.email}
            </p>
          </div>
        </div>

        {/* Audit Document Title */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold uppercase tracking-wider underline">
            Laporan Realisasi Penerimaan Keuangan & Audit SPP
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Periode: {selectedMonth === 'SEMUA' ? 'Tahun Ajaran ' + staffInfo.academicYear : selectedMonth}
          </p>
        </div>

        {/* Audit Summary Matrix */}
        <table className="w-full border border-slate-400 mb-6 text-xs">
          <tbody>
            <tr className="bg-slate-100 border-b border-slate-400 font-bold">
              <td className="p-2 border-r border-slate-400">Pos Penerimaan</td>
              <td className="p-2 border-r border-slate-400 text-right">Nominal Realisasi</td>
              <td className="p-2 border-r border-slate-400">Saluran Penerimaan</td>
              <td className="p-2 text-right">Nominal</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 border-r border-slate-400 font-medium">1. SPP Bulanan</td>
              <td className="p-2 border-r border-slate-400 text-right font-mono tabular-nums">{formatRupiah(sppTotal)}</td>
              <td className="p-2 border-r border-slate-400 font-medium">Kas Tunai (Loket Kasir)</td>
              <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(cashIncome)}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 border-r border-slate-400 font-medium">2. Uang Kegiatan Per Tahun</td>
              <td className="p-2 border-r border-slate-400 text-right font-mono tabular-nums">{formatRupiah(kegiatanTotal)}</td>
              <td className="p-2 border-r border-slate-400 font-medium">QRIS Sekolah SD BOPKRI</td>
              <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(qrisIncome)}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 border-r border-slate-400 font-medium">3. Uang Ekstrakurikuler Semester</td>
              <td className="p-2 border-r border-slate-400 text-right font-mono tabular-nums">{formatRupiah(ekskulTotal)}</td>
              <td className="p-2 border-r border-slate-400 font-medium">Virtual Account (BCA/Mandiri/BRI)</td>
              <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(vaIncome)}</td>
            </tr>
            {otherTotal > 0 && (
              <tr className="border-b border-slate-300">
                <td className="p-2 border-r border-slate-400 font-medium">4. Tagihan Lainnya (Buku/Modul)</td>
                <td className="p-2 border-r border-slate-400 text-right font-mono tabular-nums">{formatRupiah(otherTotal)}</td>
                <td className="p-2 border-r border-slate-400 font-medium">-</td>
                <td className="p-2 text-right font-mono tabular-nums">-</td>
              </tr>
            )}
            <tr className="bg-slate-200 font-bold">
              <td className="p-2 border-r border-slate-400">TOTAL PEMASUKAN BRUTO</td>
              <td className="p-2 border-r border-slate-400 text-right font-mono tabular-nums text-sm">
                {formatRupiah(totalFilteredIncome)}
              </td>
              <td className="p-2 border-r border-slate-400">TOTAL REKONSILIASI</td>
              <td className="p-2 text-right font-mono tabular-nums text-sm">
                {formatRupiah(totalFilteredIncome)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Detailed Transactions List for Audit */}
        <h4 className="font-bold text-xs uppercase mb-2">Rincian Buku Transaksi Kas</h4>
        <table className="w-full border border-slate-400 mb-8 text-[11px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400 font-bold">
              <th className="p-1.5 border-r border-slate-400 text-center w-8">No</th>
              <th className="p-1.5 border-r border-slate-400">Tanggal</th>
              <th className="p-1.5 border-r border-slate-400">No. Kwitansi</th>
              <th className="p-1.5 border-r border-slate-400">Nama Siswa & NIS</th>
              <th className="p-1.5 border-r border-slate-400">Kelas</th>
              <th className="p-1.5 border-r border-slate-400">Jenis Tagihan</th>
              <th className="p-1.5 border-r border-slate-400">Metode</th>
              <th className="p-1.5 text-right">Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, idx) => (
              <tr key={tx.id} className="border-b border-slate-300">
                <td className="p-1.5 border-r border-slate-400 text-center">{idx + 1}</td>
                <td className="p-1.5 border-r border-slate-400">{formatDateIndo(tx.paidAt)}</td>
                <td className="p-1.5 border-r border-slate-400 font-mono">{tx.receiptNumber}</td>
                <td className="p-1.5 border-r border-slate-400 font-semibold">{tx.studentName} ({tx.studentNis})</td>
                <td className="p-1.5 border-r border-slate-400">{tx.studentGrade}</td>
                <td className="p-1.5 border-r border-slate-400">{tx.billTypeName} - {tx.period}</td>
                <td className="p-1.5 border-r border-slate-400">{tx.paymentMethod}</td>
                <td className="p-1.5 text-right font-mono tabular-nums font-semibold">
                  {formatRupiah(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Official Tripartite Signatures Block */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs pt-4">
          <div>
            <p className="text-slate-600">Mengetahui & Menyetujui,</p>
            <p className="font-bold text-slate-800">Kepala Sekolah</p>
            <div className="h-20 flex items-center justify-center">
              <span className="font-serif italic text-slate-400 text-base">Suhari Irawan</span>
            </div>
            <p className="font-bold underline text-slate-900">{staffInfo.principal}</p>
          </div>

          <div>
            <p className="text-slate-600">Diverifikasi Oleh,</p>
            <p className="font-bold text-slate-800">Bendahara Sekolah</p>
            <div className="h-20 flex items-center justify-center">
              <span className="font-serif italic text-slate-400 text-base">Eni Utami</span>
            </div>
            <p className="font-bold underline text-slate-900">{staffInfo.treasurer}</p>
          </div>

          <div>
            <p className="text-slate-600">Yogyakarta, {formatDateIndo(new Date().toISOString())}</p>
            <p className="font-bold text-slate-800">Kasir Keuangan</p>
            <div className="h-20 flex items-center justify-center">
              <span className="font-serif italic text-slate-400 text-base">Nastiti Ken</span>
            </div>
            <p className="font-bold underline text-slate-900">{staffInfo.cashier}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
