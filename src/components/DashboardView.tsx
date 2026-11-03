import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateTimeIndo, formatRupiah } from '../utils/formatters';
import { BOPKRI_LOGO, handleImageError } from '../assets/logo';
import { SCHOOL_GRADES } from '../types';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Filter,
  MessageSquare,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
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

  const [vaSearch, setVaSearch] = useState('');
  const [vaGradeFilter, setVaGradeFilter] = useState('Semua Kelas');
  const [copiedVaKey, setCopiedVaKey] = useState<string | null>(null);
  const [vaPage, setVaPage] = useState(1);
  const pageSize = 8;

  const handleCopyVa = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedVaKey(key);
    setTimeout(() => setCopiedVaKey(null), 2000);
  };

  const filteredVaStudents = students.filter((s) => {
    if (vaGradeFilter !== 'Semua Kelas' && s.grade !== vaGradeFilter) return false;
    if (vaSearch.trim()) {
      const q = vaSearch.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchNis = s.nis.includes(q);
      const matchCustId = s.customerIdBri ? s.customerIdBri.includes(q) : false;
      const matchSpp = s.brivaSpp ? s.brivaSpp.includes(q) : false;
      const matchKeg = s.brivaKegiatan ? s.brivaKegiatan.includes(q) : false;
      const matchEks = s.brivaEkskul ? s.brivaEkskul.includes(q) : false;
      return matchName || matchNis || matchCustId || matchSpp || matchKeg || matchEks;
    }
    return true;
  });

  const totalVaPages = Math.ceil(filteredVaStudents.length / pageSize) || 1;
  const paginatedVaStudents = filteredVaStudents.slice((vaPage - 1) * pageSize, vaPage * pageSize);

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
            src={BOPKRI_LOGO}
            onError={handleImageError}
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

      {/* REKAP & DIREKTORI 3 NOMOR VIRTUAL ACCOUNT (BRIVA) SETIAP SISWA */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-800 text-white tracking-wider">
                BANK BRI · BRIVA
              </span>
              <span className="text-xs text-slate-500 font-semibold">SD BOPKRI Gondolayu Yogyakarta</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-800" />
              Direktori 3 Nomor Virtual Account Setiap Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap siswa memiliki 3 nomor Virtual Account yang berbeda: <strong>VA SPP (5733)</strong>, <strong>VA Uang Kegiatan (5747)</strong>, dan <strong>VA Ekskul (14172)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('siswa')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <span>Kelola Buku Induk Siswa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 VA Overview Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: VA SPP */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                KODE 5733 · SPP TETAP
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1.5">Virtual Account SPP</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Tarif SPP berbeda setiap anak sesuai ketetapan sekolah
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-950 bg-white px-2 py-1 rounded-lg border border-blue-200 shadow-2xs">
              {students.length} VA Terbit
            </span>
          </div>

          {/* Card 2: VA Uang Kegiatan */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                KODE 5747 · UANG KEGIATAN
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1.5">Virtual Account Kegiatan</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Tarif tahunan berbeda setiap kelas (1.1 s/d 6.2)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-950 bg-white px-2 py-1 rounded-lg border border-amber-200 shadow-2xs">
              {students.length} VA Terbit
            </span>
          </div>

          {/* Card 3: VA Ekskul */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                KODE 14172 · EKSKUL BOGOTA
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-1.5">Virtual Account Ekskul</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Tarif ekskul Rp 200.000 / semester per 1 pilihan ekskul
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-950 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs">
              {students.length} VA Terbit
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Filter Kelas:</span>
            <select
              value={vaGradeFilter}
              onChange={(e) => {
                setVaGradeFilter(e.target.value);
                setVaPage(1);
              }}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="Semua Kelas">Semua Kelas ({students.length} Siswa)</option>
              {SCHOOL_GRADES.map((g) => {
                const count = students.filter((s) => s.grade === g).length;
                return (
                  <option key={g} value={g}>
                    Kelas {g} ({count} Siswa)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa, NIS, ID Pelanggan, atau no VA..."
              value={vaSearch}
              onChange={(e) => {
                setVaSearch(e.target.value);
                setVaPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* 3 VA Interactive Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3 px-3">Siswa & ID BRI</th>
                <th className="py-3 px-3 text-center">Kelas</th>
                <th className="py-3 px-3">
                  <span className="text-blue-900 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    1. VA SPP (5733)
                  </span>
                </th>
                <th className="py-3 px-3">
                  <span className="text-amber-900 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    2. VA Kegiatan (5747)
                  </span>
                </th>
                <th className="py-3 px-3">
                  <span className="text-emerald-900 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    3. VA Ekskul (14172)
                  </span>
                </th>
                <th className="py-3 px-3 text-center">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedVaStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ada siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedVaStudents.map((s) => {
                  const sppVa = s.brivaSpp || s.vaNumber || `108102247000${s.nis.slice(-3)}`;
                  const kegVa = s.brivaKegiatan || `108102247000${(parseInt(s.nis.slice(-3) || '1', 10) + 400).toString()}`;
                  const eksVa = s.brivaEkskul || `108102247000${(parseInt(s.nis.slice(-3) || '1', 10) + 900).toString()}`;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span>NIS: {s.nis}</span>
                          <span>·</span>
                          <span>ID BRI: <strong className="text-blue-900 font-bold">{s.customerIdBri || s.nis}</strong></span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                          {s.grade}
                        </span>
                      </td>

                      {/* VA SPP */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-between gap-1.5 bg-blue-50/60 px-2 py-1.5 rounded-lg border border-blue-200">
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-blue-950 text-xs tracking-wider block truncate">
                              {sppVa}
                            </span>
                            <span className="text-[10px] text-blue-700 font-medium">
                              SPP: {formatRupiah(s.customSppAmount || 350000)}/bln
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyVa(sppVa, `${s.id}-spp`)}
                            className="p-1 hover:bg-blue-100 rounded text-blue-800 transition-colors cursor-pointer shrink-0"
                            title="Salin Nomor VA SPP"
                          >
                            {copiedVaKey === `${s.id}-spp` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* VA Kegiatan */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-between gap-1.5 bg-amber-50/60 px-2 py-1.5 rounded-lg border border-amber-200">
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-amber-950 text-xs tracking-wider block truncate">
                              {kegVa}
                            </span>
                            <span className="text-[10px] text-amber-800 font-medium">
                              Kegiatan: {formatRupiah(s.customActivityFee || 1200000)}/thn
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyVa(kegVa, `${s.id}-keg`)}
                            className="p-1 hover:bg-amber-100 rounded text-amber-800 transition-colors cursor-pointer shrink-0"
                            title="Salin Nomor VA Kegiatan"
                          >
                            {copiedVaKey === `${s.id}-keg` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* VA Ekskul */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-between gap-1.5 bg-emerald-50/60 px-2 py-1.5 rounded-lg border border-emerald-200">
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-emerald-950 text-xs tracking-wider block truncate">
                              {eksVa}
                            </span>
                            <span className="text-[10px] text-emerald-800 font-medium">
                              {s.extracurriculars && s.extracurriculars.length > 0 ? s.extracurriculars[0] : 'PADUS'}: {formatRupiah(s.extracurricularFee || 200000)}/smstr
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyVa(eksVa, `${s.id}-eks`)}
                            className="p-1 hover:bg-emerald-100 rounded text-emerald-800 transition-colors cursor-pointer shrink-0"
                            title="Salin Nomor VA Ekskul"
                          >
                            {copiedVaKey === `${s.id}-eks` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setActiveTab('kasir')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          title="Buka Kasir untuk Siswa Ini"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Kasir</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalVaPages > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Menampilkan {((vaPage - 1) * pageSize) + 1} - {Math.min(vaPage * pageSize, filteredVaStudents.length)} dari {filteredVaStudents.length} siswa
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={vaPage === 1}
                onClick={() => setVaPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-slate-700">
                Halaman {vaPage} dari {totalVaPages}
              </span>
              <button
                type="button"
                disabled={vaPage === totalVaPages}
                onClick={() => setVaPage((p) => Math.min(totalVaPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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
