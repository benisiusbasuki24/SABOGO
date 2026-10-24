import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDateTimeIndo, formatRupiah } from '../utils/formatters';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageSquare,
  Printer,
  QrCode,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    staffInfo,
    bills,
    transactions,
    students,
    setActivePayingBill,
    openReceiptPrint,
    setActiveTab,
  } = useApp();

  // Calculations
  const totalIncome = transactions.reduce((acc, t) => acc + t.amount, 0);

  const totalOutstanding = bills.reduce((acc, b) => {
    return acc + Math.max(0, b.amount - b.paidAmount);
  }, 0);

  const overdueBills = bills.filter((b) => b.status === 'MENUNGGAK');
  const totalOverdueAmount = overdueBills.reduce(
    (acc, b) => acc + Math.max(0, b.amount - b.paidAmount),
    0
  );

  const overdueStudentIds = new Set(overdueBills.map((b) => b.studentId));

  const totalBilled = bills.reduce((acc, b) => acc + b.amount, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalIncome / totalBilled) * 100) : 0;

  // Method breakdown
  const incomeCash = transactions
    .filter((t) => t.paymentMethod === 'TUNAI')
    .reduce((acc, t) => acc + t.amount, 0);

  const incomeQris = transactions
    .filter((t) => t.paymentMethod === 'QRIS')
    .reduce((acc, t) => acc + t.amount, 0);

  const incomeVa = transactions
    .filter((t) => t.paymentMethod.startsWith('VA'))
    .reduce((acc, t) => acc + t.amount, 0);

  // Category breakdown
  const incomeSpp = transactions
    .filter((t) => t.billTypeName.includes('SPP'))
    .reduce((acc, t) => acc + t.amount, 0);

  const incomeKegiatan = transactions
    .filter((t) => t.billTypeName.includes('Kegiatan'))
    .reduce((acc, t) => acc + t.amount, 0);

  const incomeEkskul = transactions
    .filter((t) => t.billTypeName.includes('Ekstrakurikuler'))
    .reduce((acc, t) => acc + t.amount, 0);

  const incomeLainnya = totalIncome - (incomeSpp + incomeKegiatan + incomeEkskul);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with School Administration Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/src/assets/images/logo_bopkri_gondolayu.png"
            alt="Logo SD BOPKRI"
            className="w-16 h-16 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{staffInfo.foundationName}</span>
              <span aria-hidden="true">·</span>
              <span>T.A. {staffInfo.academicYear}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-blue-900 font-extrabold">SIBOGO</span>
              <span className="text-slate-400 font-normal">|</span>
              <span>Sistem Informasi BOPKRI Gondolayu</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Kepala Sekolah: <strong>{staffInfo.principal}</strong> · Bendahara: <strong>{staffInfo.treasurer}</strong> · Kasir: <strong>{staffInfo.cashier}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setActiveTab('kasir')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors"
          >
            Buka Loket Kasir
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            Pengingat WA
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Pemasukan Real-Time</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {formatRupiah(totalIncome)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span>{transactions.length} transaksi lunas</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Bulan Berjalan</span>
          </div>
        </div>

        {/* Total Arrears / Piutang */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Tunggakan (Piutang)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700 tabular-nums">
            {formatRupiah(totalOverdueAmount)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span>{overdueBills.length} pos tagihan lewat tempo</span>
          </div>
        </div>

        {/* Overdue Students */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Siswa Belum / Menunggak</span>
            <Users className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
            {overdueStudentIds.size} <span className="text-sm font-sans font-normal text-slate-500">dari {students.length} Siswa</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
            >
              Kirim Notifikasi WA <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Persentase Pembayaran</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-900 tabular-nums">
            {collectionRate}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div
              className="bg-blue-700 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, collectionRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Arrears Attention Card */}
      {overdueBills.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Peringatan: Ada {overdueBills.length} Tagihan Menunggak ({formatRupiah(totalOverdueAmount)})
              </h4>
              <p className="text-xs text-amber-800">
                Orang tua murid terkait belum menyelesaikan pembayaran SPP atau Uang Kegiatan yang telah melewati tanggal jatuh tempo.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg transition-colors shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Kirim Pengingat WhatsApp
          </button>
        </div>
      )}

      {/* Charts & Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Realisasi Pemasukan per Saluran Pembayaran
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-blue-700" />
                  Tunai (Loket Kasir)
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatRupiah(incomeCash)} ({totalIncome > 0 ? Math.round((incomeCash / totalIncome) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${totalIncome > 0 ? (incomeCash / totalIncome) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-red-600" />
                  QRIS SD BOPKRI
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatRupiah(incomeQris)} ({totalIncome > 0 ? Math.round((incomeQris / totalIncome) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${totalIncome > 0 ? (incomeQris / totalIncome) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-700" />
                  Virtual Account (BCA / Mandiri / BRI / BNI)
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {formatRupiah(incomeVa)} ({totalIncome > 0 ? Math.round((incomeVa / totalIncome) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${totalIncome > 0 ? (incomeVa / totalIncome) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Semua transaksi diverifikasi oleh Kasir Nastiti Ken Utami</span>
            <span className="font-semibold text-slate-800">Total: {formatRupiah(totalIncome)}</span>
          </div>
        </div>

        {/* Bill Categories Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            Distribusi Penerimaan per Jenis Tagihan
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                SPP Bulanan
              </span>
              <p className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(incomeSpp)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Rp 350.000 / siswa</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Uang Kegiatan Tahunan
              </span>
              <p className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(incomeKegiatan)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Rp 1.200.000 / tahun</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Ekstrakurikuler
              </span>
              <p className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(incomeEkskul)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Rp 250.000 / semester</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Buku / Lainnya
              </span>
              <p className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(incomeLainnya)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Modul & Seragam</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dikelola oleh Bendahara Eni Utaminingsih, S.Pd</span>
            <button
              onClick={() => setActiveTab('jenis-tagihan')}
              className="text-blue-700 hover:text-blue-900 font-semibold"
            >
              Kelola Jenis Tagihan →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Transaksi Pembayaran Terkini
            </h3>
            <p className="text-xs text-slate-500">
              Daftar kwitansi online yang baru saja diterbitkan kasir
            </p>
          </div>
          <button
            onClick={() => setActiveTab('laporan')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900"
          >
            Lihat Semua Transaksi →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3 px-4">No. Kwitansi</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">Tagihan & Periode</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {tx.receiptNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDateTimeIndo(tx.paidAt)}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{tx.studentName}</p>
                    <p className="text-[10px] text-slate-500">{tx.studentGrade} · NIS: {tx.studentNis}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-800 font-medium">{tx.billTypeName}</p>
                    <p className="text-[10px] text-blue-800">{tx.period}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700">{tx.paymentMethod}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatRupiah(tx.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => openReceiptPrint(tx, 'A4')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      title="Lihat / Cetak Kwitansi"
                    >
                      <Printer className="w-3 h-3" />
                      Cetak Nota
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
