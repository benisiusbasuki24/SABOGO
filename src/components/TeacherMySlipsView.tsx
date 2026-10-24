import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  Mail,
  MessageCircle,
  Printer,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export const TeacherMySlipsView: React.FC = () => {
  const { currentUser, payrolls, setActiveSlip, setIsLoginModalOpen, teachers } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('SEMUA');

  // Find corresponding teacher profile
  const teacherProfile = useMemo(() => {
    if (!currentUser) return null;
    if (currentUser.teacherId) {
      return teachers.find((t) => t.id === currentUser.teacherId) || null;
    }
    return (
      teachers.find(
        (t) =>
          t.username?.toLowerCase() === currentUser.username.toLowerCase() ||
          t.nip === currentUser.username ||
          t.email.toLowerCase() === currentUser.email.toLowerCase()
      ) || null
    );
  }, [currentUser, teachers]);

  // STRICT PRIVACY FILTER:
  // Only slips belonging to this logged-in teacher are retrieved.
  const mySlips = useMemo(() => {
    if (!currentUser) return [];

    return payrolls.filter((p) => {
      if (currentUser.teacherId && p.teacherId === currentUser.teacherId) {
        return true;
      }
      if (currentUser.username && p.teacherNip === currentUser.username) {
        return true;
      }
      if (currentUser.email && p.teacherEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        return true;
      }
      if (teacherProfile && p.teacherId === teacherProfile.id) {
        return true;
      }
      return false;
    });
  }, [currentUser, payrolls, teacherProfile]);

  // Unique periods
  const availablePeriods = useMemo(() => {
    const set = new Set(mySlips.map((s) => s.period));
    return Array.from(set);
  }, [mySlips]);

  // Filtered slips
  const filteredSlips = useMemo(() => {
    if (selectedPeriod === 'SEMUA') return mySlips;
    return mySlips.filter((s) => s.period === selectedPeriod);
  }, [mySlips, selectedPeriod]);

  // Stats
  const latestSlip = mySlips.length > 0 ? mySlips[0] : null;
  const totalReceivedThisYear = mySlips
    .filter((s) => s.paymentStatus === 'SUDAH_DITRANSFER')
    .reduce((acc, curr) => acc + curr.netSalary, 0);

  // If user is not logged in or is not a teacher
  if (!currentUser) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Portal Slip Gaji Guru & Karyawan</h2>
        <p className="text-sm text-slate-600 mb-6">
          Silakan masuk menggunakan akun username atau NIP Anda untuk melihat rincian slip gaji pribadi.
        </p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-6 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          <span>Masuk ke Akun Guru</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Privacy & Isolation Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0 font-bold text-xl">
              {currentUser.name
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {currentUser.role === 'ADMIN' ? 'Akses Admin / Pengawas' : 'Portal Guru Terisolasi'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                {currentUser.positionTitle || 'Guru SD BOPKRI Gondolayu'} · NIP:{' '}
                {teacherProfile?.nip || currentUser.username} · Email: {currentUser.email}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-blue-200/90 bg-blue-900/60 border border-blue-700/60 px-3 py-1.5 rounded-lg max-w-fit">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Proteksi Privasi Aktif: Halaman ini hanya menampilkan dokumen slip gaji per username Anda sendiri.
                </span>
              </div>
            </div>
          </div>

          <div className="text-right border-t md:border-t-0 md:border-l border-white/15 pt-3 md:pt-0 md:pl-6 shrink-0 flex flex-col justify-center">
            <span className="text-xs text-blue-200">Rekening Payroll Terdaftar</span>
            <span className="text-base font-bold text-white tracking-wide mt-0.5">
              {teacherProfile?.bankName || 'BPD DIY'} · {teacherProfile?.accountNumber || '0012398489'}
            </span>
            <span className="text-[11px] text-blue-300">
              a.n {teacherProfile?.accountHolder || currentUser.name}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Latest Net Salary */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Gaji Bersih Terakhir ({latestSlip?.period || 'Terbaru'})</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {latestSlip ? formatRupiah(latestSlip.netSalary) : 'Rp 0'}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
            {latestSlip?.paymentStatus === 'SUDAH_DITRANSFER' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Ditransfer Bank
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                <Clock className="w-3.5 h-3.5" /> Menunggu Pencairan
              </span>
            )}
          </div>
        </div>

        {/* Total Received */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Gaji Diterima (Tahun 2026)</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-900">
            {formatRupiah(totalReceivedThisYear)}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Dari {mySlips.filter((s) => s.paymentStatus === 'SUDAH_DITRANSFER').length} periode slip gaji yang telah dicairkan
          </p>
        </div>

        {/* Base & Allowance Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Komponen Gaji Pokok</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-800">
            {latestSlip ? formatRupiah(latestSlip.baseSalary) : formatRupiah(teacherProfile?.baseSalary || 0)}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            + Tunjangan Wali Kelas & Jam Mengajar: {latestSlip ? formatRupiah(latestSlip.totalAllowance) : '-'}
          </p>
        </div>

        {/* Document Count */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Arsip Slip Resmi</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{mySlips.length} Berkas</div>
          <p className="mt-2 text-xs text-slate-500">
            Format resmi Yayasan BOPKRI dengan nomor slip & verifikasi bendahara
          </p>
        </div>

      </div>

      {/* Slips List Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Header Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daftar Slip Gaji Pribadi</h3>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredSlips.length} catatan slip gaji resmi atas nama <strong>{currentUser.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Filter Periode:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-800 font-medium"
            >
              <option value="SEMUA">Semua Periode ({mySlips.length})</option>
              {availablePeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {filteredSlips.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Belum ada slip gaji untuk periode ini</p>
            <p className="text-xs text-slate-400 mt-1">
              Slip gaji yang telah diverifikasi oleh Bendahara (Ibu Eni Utaminingsih) akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4">No. Slip</th>
                  <th className="py-3 px-4 text-right">Gaji Pokok</th>
                  <th className="py-3 px-4 text-right">Total Tunjangan</th>
                  <th className="py-3 px-4 text-right">Potongan</th>
                  <th className="py-3 px-4 text-right font-bold text-slate-900">Gaji Bersih (THP)</th>
                  <th className="py-3 px-4 text-center">Status Pencairan</th>
                  <th className="py-3 px-4 text-center">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSlips.map((slip) => {
                  const isTransferred = slip.paymentStatus === 'SUDAH_DITRANSFER';

                  return (
                    <tr key={slip.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-700" />
                          <span>{slip.period}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {slip.slipNumber}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {formatRupiah(slip.baseSalary)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-emerald-700 font-medium whitespace-nowrap">
                        +{formatRupiah(slip.totalAllowance)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-red-600 font-medium whitespace-nowrap">
                        -{formatRupiah(slip.totalDeduction)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-blue-900 text-sm whitespace-nowrap">
                        {formatRupiah(slip.netSalary)}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isTransferred ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Sudah Ditransfer
                            </span>
                            {slip.paidAt && (
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(slip.paidAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Dalam Proses
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setActiveSlip(slip)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors"
                          title="Buka dan cetak slip gaji resmi BOPKRI"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Lihat & Cetak Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer notification */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Apabila terdapat ketidaksesuaian jam tatap muka atau iuran potongan, silakan konfirmasi ke Bendahara Sekolah.
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
            <span>Notifikasi WhatsApp & Email otomatis dikirim saat gaji ditransfer oleh bendahara.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
