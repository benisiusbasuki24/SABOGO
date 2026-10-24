import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bill, Student } from '../types';
import { formatDateTimeIndo, formatRupiah } from '../utils/formatters';
import {
  Banknote,
  CheckCircle2,
  Clock,
  Printer,
  QrCode,
  Receipt,
  Search,
  User,
} from 'lucide-react';

export const CashierView: React.FC = () => {
  const { students, bills, transactions, setActivePayingBill, openReceiptPrint, staffInfo } = useApp();

  const [studentSearch, setStudentSearch] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Today's cashier shift totals
  const todayIso = new Date().toISOString().substring(0, 10);
  const todaysTx = transactions.filter((t) => t.paidAt.startsWith(todayIso));
  const todayTotalCash = todaysTx
    .filter((t) => t.paymentMethod === 'TUNAI')
    .reduce((acc, t) => acc + t.amount, 0);
  const todayTotalAll = todaysTx.reduce((acc, t) => acc + t.amount, 0);

  // Search filtered students
  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return false;
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.nis.includes(q) || s.parentName.toLowerCase().includes(q);
  });

  // Bills for selected student
  const studentBills = selectedStudent
    ? bills.filter((b) => b.studentId === selectedStudent.id)
    : [];

  const unpaidBills = studentBills.filter((b) => b.status !== 'LUNAS');
  const paidBills = studentBills.filter((b) => b.status === 'LUNAS');

  const handleSelectStudent = (s: Student) => {
    setSelectedStudent(s);
    setStudentSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Top Cashier Shift Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>Loket Pelayanan Kasir Sekolah</span>
              <span aria-hidden="true">·</span>
              <span>SD BOPKRI Gondolayu</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Loket Pembayaran Kasir: {staffInfo.cashier}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Penerimaan pembayaran SPP bulanan, uang kegiatan tahunan, dan ekstrakurikuler dengan cetak nota otomatis.
            </p>
          </div>
        </div>

        {/* Shift Cash Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-6 self-start md:self-center">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Penerimaan Kasir Hari Ini
            </span>
            <span className="text-base font-extrabold font-mono text-emerald-800 tabular-nums">
              {formatRupiah(todayTotalAll)}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Uang Tunai di Laci Kasir
            </span>
            <span className="text-base font-extrabold font-mono text-blue-900 tabular-nums">
              {formatRupiah(todayTotalCash)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Cashier Search & Register Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Student Search & Selection */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700" />
            Cari Siswa untuk Pembayaran
          </h3>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Ketik Nama Siswa atau NIS..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Search Dropdown Results */}
          {studentSearch.trim() && (
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto bg-slate-50">
              {filteredStudents.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  Siswa tidak ditemukan
                </div>
              ) : (
                filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s)}
                    className="w-full text-left p-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.grade} · NIS: {s.nis}</p>
                    </div>
                    <span className="text-blue-700 font-semibold text-[11px]">Pilih →</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Quick List of All Students */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Daftar Seluruh Siswa:</p>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
              {students.map((s) => {
                const sBills = bills.filter((b) => b.studentId === s.id);
                const hasPending = sBills.some((b) => b.status === 'MENUNGGAK' || b.status === 'BELUM_BAYAR');
                const isSelected = selectedStudent?.id === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className={`w-full text-left p-3 flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-l-blue-800'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {s.grade} · NIS: {s.nis} · Wali: {s.parentName}
                      </p>
                    </div>
                    {hasPending && (
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        Tagihan Aktif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Student Billing Ledger & Instant Checkout */}
        <div className="lg:col-span-2 space-y-4">
          {selectedStudent ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              {/* Selected Student Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
                    Siswa Terpilih
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedStudent.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Kelas: <strong className="text-slate-800">{selectedStudent.grade}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>NIS: <strong className="text-slate-800">{selectedStudent.nis}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Wali: <strong className="text-slate-800">{selectedStudent.parentName}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>No. WA: <strong className="text-emerald-700">{selectedStudent.parentPhone}</strong></span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs">
                  <p className="text-slate-500">Virtual Account Mandiri:</p>
                  <p className="font-mono font-bold text-blue-900 text-sm">
                    {selectedStudent.vaNumber || `88012${selectedStudent.nis}`}
                  </p>
                </div>
              </div>

              {/* Unpaid / Overdue Bills List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Tagihan Yang Perlu Dibayar ({unpaidBills.length})
                  </h4>
                  {unpaidBills.length > 0 && (
                    <span className="text-xs font-mono font-bold text-amber-700">
                      Total: {formatRupiah(unpaidBills.reduce((acc, b) => acc + (b.amount - b.paidAmount), 0))}
                    </span>
                  )}
                </div>

                {unpaidBills.length === 0 ? (
                  <div className="p-6 text-center bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <strong>Semua tagihan untuk siswa ini telah lunas!</strong>
                    <p className="text-slate-600 mt-1">Tidak ada tunggakan SPP, uang kegiatan, maupun ekstrakurikuler.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {unpaidBills.map((b) => {
                      const remaining = b.amount - b.paidAmount;

                      return (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{b.billTypeName}</span>
                              <span className="text-xs text-blue-800 font-semibold">({b.period})</span>
                              {b.status === 'MENUNGGAK' && (
                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                  Menunggak
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Jatuh Tempo: {b.dueDate} {b.notes ? `· ${b.notes}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs font-mono font-extrabold text-slate-900 tabular-nums block">
                                {formatRupiah(remaining)}
                              </span>
                              {b.paidAmount > 0 && (
                                <span className="text-[10px] text-slate-400">
                                  Sudah dibayar {formatRupiah(b.paidAmount)}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => setActivePayingBill(b)}
                              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors"
                            >
                              <Banknote className="w-3.5 h-3.5" />
                              Bayar Sekarang
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Settled Payment History for this Student */}
              {paidBills.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Riwayat Pembayaran Lunas Siswa Ini
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {paidBills.map((b) => {
                      const relatedTx = transactions.find((t) => t.billId === b.id);

                      return (
                        <div
                          key={b.id}
                          className="p-3 bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{b.billTypeName}</span>
                            <span className="text-slate-500 ml-1">({b.period})</span>
                            <p className="text-[10px] text-emerald-700 font-medium">Status: LUNAS</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              {formatRupiah(b.amount)}
                            </span>
                            {relatedTx && (
                              <button
                                onClick={() => openReceiptPrint(relatedTx, 'A4')}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md"
                              >
                                <Printer className="w-3 h-3" />
                                Cetak Nota
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                Pilih Siswa untuk Memulai Pembayaran di Loket
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Cari nama siswa atau nomor induk siswa (NIS) pada panel sebelah kiri untuk menampilkan tagihan SPP, uang kegiatan, dan iuran ekstrakurikuler yang harus diselesaikan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
