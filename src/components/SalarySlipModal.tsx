import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDateIndo, formatDateTimeIndo, formatRupiah, normalizeWhatsAppNumber } from '../utils/formatters';
import { terbilang } from '../utils/terbilang';
import { BOPKRI_LOGO, OFFICIAL_STAMP, handleImageError } from '../assets/logo';
import {
  Check,
  CheckCircle2,
  Clock,
  Download,
  Mail,
  MessageSquare,
  Printer,
  Send,
  X,
} from 'lucide-react';

export const SalarySlipModal: React.FC = () => {
  const { activeSlip, setActiveSlip, staffInfo, markPayrollTransferred } = useApp();

  if (!activeSlip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const phone = normalizeWhatsAppNumber(activeSlip.teacherPhone);
    const message =
      `*SLIP GAJI SD BOPKRI GONDOLAYU*\n` +
      `No. Slip: ${activeSlip.slipNumber}\n` +
      `Periode: *${activeSlip.period}*\n\n` +
      `Yth. Bapak/Ibu *${activeSlip.teacherName}*,\n` +
      `Berikut rincian penggajian periode *${activeSlip.period}* yang telah diproses oleh Bagian Keuangan SD BOPKRI Gondolayu:\n\n` +
      `• NIP: ${activeSlip.teacherNip}\n` +
      `• Jabatan: ${activeSlip.teacherRole}\n` +
      `• Rekening: *${activeSlip.bankName} - ${activeSlip.accountNumber}*\n\n` +
      `*PENERIMAAN:*\n` +
      `+ Gaji Pokok: ${formatRupiah(activeSlip.baseSalary)}\n` +
      `+ Total Tunjangan: ${formatRupiah(activeSlip.totalAllowance)}\n` +
      `  (Jabatan: ${formatRupiah(activeSlip.positionAllowance)}, Mengajar: ${formatRupiah(activeSlip.teachingAllowance)}, Kesejahteraan: ${formatRupiah(activeSlip.welfareAllowance)}, BPJS: ${formatRupiah(activeSlip.bpjsAllowance)}${activeSlip.otherAllowance > 0 ? `, Lainnya: ${formatRupiah(activeSlip.otherAllowance)}` : ''})\n\n` +
      `*POTONGAN:*\n` +
      `- Total Potongan: ${formatRupiah(activeSlip.totalDeduction)}\n` +
      `  (Koperasi: ${formatRupiah(activeSlip.coopDeduction)}, BPJS: ${formatRupiah(activeSlip.bpjsDeduction)}, Pajak: ${formatRupiah(activeSlip.taxDeduction)}${activeSlip.loanDeduction > 0 ? `, Kasbon: ${formatRupiah(activeSlip.loanDeduction)}` : ''})\n\n` +
      `*GAJI BERSIH (TAKE HOME PAY):*\n` +
      `*${formatRupiah(activeSlip.netSalary)}*\n` +
      `_(${terbilang(activeSlip.netSalary)})_\n\n` +
      `*Status:* ${activeSlip.paymentStatus === 'SUDAH_DITRANSFER' ? '✅ SUDAH DITRANSFER' : '⏳ DALAM PROSES TRANSFER'}\n` +
      (activeSlip.transferRef ? `No. Ref Transfer: ${activeSlip.transferRef}\n` : '') +
      `\nTerima kasih atas dedikasi dan pelayanannya bagi ananda tercinta di SD BOPKRI Gondolayu. Tuhan Memberkati.\n\n` +
      `Bendahara: ${staffInfo.treasurer}\n` +
      `Kepala Sekolah: ${staffInfo.principal}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSendEmail = () => {
    const subject = `[SLIP GAJI] SD BOPKRI Gondolayu - Periode ${activeSlip.period} - ${activeSlip.teacherName}`;
    const body =
      `Yth. Bapak/Ibu ${activeSlip.teacherName},\n\n` +
      `Terlampir rincian slip penggajian Anda untuk periode ${activeSlip.period} dari SD BOPKRI Gondolayu:\n\n` +
      `No. Slip: ${activeSlip.slipNumber}\n` +
      `Jabatan: ${activeSlip.teacherRole}\n` +
      `Rekening Tujuan: ${activeSlip.bankName} - ${activeSlip.accountNumber}\n\n` +
      `RINCIAN PENGGAJIAN:\n` +
      `- Gaji Pokok: ${formatRupiah(activeSlip.baseSalary)}\n` +
      `- Total Tunjangan: ${formatRupiah(activeSlip.totalAllowance)}\n` +
      `- Total Potongan: ${formatRupiah(activeSlip.totalDeduction)}\n` +
      `----------------------------------------\n` +
      `GAJI BERSIH DITERIMA: ${formatRupiah(activeSlip.netSalary)}\n` +
      `Terbilang: ${terbilang(activeSlip.netSalary)}\n\n` +
      `Status Pembayaran: ${activeSlip.paymentStatus === 'SUDAH_DITRANSFER' ? 'SUDAH DITRANSFER' : 'DALAM PROSES'}\n` +
      (activeSlip.transferRef ? `No Referensi Bank: ${activeSlip.transferRef}\n\n` : '\n') +
      `Salam kasih,\n` +
      `Bagian Keuangan SD BOPKRI Gondolayu\n` +
      `Bendahara: ${staffInfo.treasurer}\n` +
      `Kepala Sekolah: ${staffInfo.principal}`;

    window.open(`mailto:${activeSlip.teacherEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex flex-wrap items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Slip Gaji Guru & Staf</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-500">{activeSlip.slipNumber}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeSlip.paymentStatus === 'BELUM_DITRANSFER' ? (
              <button
                type="button"
                onClick={() => {
                  const ref = prompt('Masukkan nomor referensi transfer bank (opsional):', `TRF-BOPKRI-${Date.now().toString().slice(-6)}`);
                  if (ref !== null) {
                    markPayrollTransferred(activeSlip.id, ref);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Tandai Sudah Ditransfer
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sudah Ditransfer
              </span>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
              title="Arahkan langsung ke printer fisik yang terhubung di komputer Anda (Epson, Canon, HP, Thermal, dll.)"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak ke Printer Komputer
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
              title="Kirim slip gaji langsung ke WhatsApp Guru"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Kirim ke WA Guru
            </button>

            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
              title="Kirim info slip gaji ke Email Guru"
            >
              <Mail className="w-3.5 h-3.5" />
              Kirim Email
            </button>

            <button
              onClick={() => setActiveSlip(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Gaji Document */}
        <div className="printable-area p-8 print:p-2 bg-white text-slate-900">
          <div className="border border-slate-300 p-8 rounded-lg print:border-slate-800 print:rounded-none relative">
            
            {/* KOP SURAT */}
            <div className="flex items-center gap-5 border-b-2 border-slate-800 pb-5">
              <img
                src={BOPKRI_LOGO}
                onError={handleImageError}
                alt="Logo SD BOPKRI Gondolayu"
                className="w-20 h-20 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 text-center">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                  {staffInfo.foundationName}
                </p>
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                  {staffInfo.schoolName}
                </h1>
                <p className="text-xs font-bold text-blue-900 tracking-wider uppercase mt-0.5">
                  "{staffInfo.tagline || 'Cerdas Berkarakter'}"
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {staffInfo.address}
                </p>
                <p className="text-xs text-slate-500">
                  Telp: {staffInfo.phone} · Website: {staffInfo.website || 'www.sdbopkrigondolayu.sch.id'} · Email: {staffInfo.email}
                </p>
              </div>
            </div>

            {/* Document Title & Meta */}
            <div className="flex items-center justify-between my-5">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 underline decoration-slate-400 underline-offset-4">
                  Slip Gaji Guru & Karyawan
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  No: {activeSlip.slipNumber} · Periode: <strong className="text-blue-900 font-sans">{activeSlip.period}</strong>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold rounded-md uppercase tracking-wider border ${
                    activeSlip.paymentStatus === 'SUDAH_DITRANSFER'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {activeSlip.paymentStatus === 'SUDAH_DITRANSFER' ? 'SUDAH DITRANSFER' : 'BELUM DITRANSFER'}
                </span>
                {activeSlip.paidAt && (
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Ditransfer: {formatDateTimeIndo(activeSlip.paidAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Teacher Details Strip */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-6">
              <div>
                <div className="flex py-0.5">
                  <span className="w-28 text-slate-500 font-medium">Nama Guru/Staf</span>
                  <span className="font-bold text-slate-900">: {activeSlip.teacherName}</span>
                </div>
                <div className="flex py-0.5">
                  <span className="w-28 text-slate-500 font-medium">NIP / NIK</span>
                  <span className="font-mono text-slate-800">: {activeSlip.teacherNip || '-'}</span>
                </div>
                <div className="flex py-0.5">
                  <span className="w-28 text-slate-500 font-medium">Jabatan / Tugas</span>
                  <span className="text-slate-800 font-medium">: {activeSlip.teacherRole}</span>
                </div>
              </div>
              <div>
                <div className="flex py-0.5">
                  <span className="w-28 text-slate-500 font-medium">Bank Tujuan</span>
                  <span className="font-semibold text-slate-900">: {activeSlip.bankName}</span>
                </div>
                <div className="flex py-0.5">
                  <span className="w-28 text-slate-500 font-medium">No. Rekening</span>
                  <span className="font-mono font-bold text-blue-900">: {activeSlip.accountNumber}</span>
                </div>
                <div className="flex py-0.5">
                  <span className="w-28 text-slate-500 font-medium">Kontak HP/WA</span>
                  <span className="text-slate-800">: {activeSlip.teacherPhone}</span>
                </div>
              </div>
            </div>

            {/* Two-Column Salary Breakdown Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              
              {/* Kolom A: Penerimaan / Penghasilan */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-100 p-2 text-xs font-bold text-slate-800 border-b border-slate-300">
                  A. PENERIMAAN (PENGHASILAN)
                </div>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 text-slate-600">Gaji Pokok</td>
                      <td className="p-2 text-right font-mono font-semibold tabular-nums">{formatRupiah(activeSlip.baseSalary)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Tunjangan Jabatan / Wali Kelas</td>
                      <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.positionAllowance)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Tunjangan Mengajar / Jam Pelajaran</td>
                      <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.teachingAllowance)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Tunjangan Kesejahteraan & Makan</td>
                      <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.welfareAllowance)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Tunjangan / Subsidi BPJS</td>
                      <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.bpjsAllowance)}</td>
                    </tr>
                    {activeSlip.otherAllowance > 0 && (
                      <tr>
                        <td className="p-2 text-slate-600">Tunjangan Lainnya / Ekstrakurikuler</td>
                        <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.otherAllowance)}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold border-t border-slate-300">
                      <td className="p-2 text-slate-800">Total Penghasilan Kotor</td>
                      <td className="p-2 text-right font-mono text-emerald-800 tabular-nums">
                        {formatRupiah(activeSlip.baseSalary + activeSlip.totalAllowance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Kolom B: Potongan */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-100 p-2 text-xs font-bold text-slate-800 border-b border-slate-300">
                  B. POTONGAN
                </div>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 text-slate-600">Potongan Koperasi BOPKRI</td>
                      <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.coopDeduction)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Iuran BPJS Ketenagakerjaan / Kesehatan</td>
                      <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.bpjsDeduction)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600">Pajak Penghasilan (PPh 21)</td>
                      <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.taxDeduction)}</td>
                    </tr>
                    {activeSlip.loanDeduction > 0 && (
                      <tr>
                        <td className="p-2 text-slate-600">Kasbon / Angsuran Pinjaman</td>
                        <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.loanDeduction)}</td>
                      </tr>
                    )}
                    {activeSlip.otherDeduction > 0 && (
                      <tr>
                        <td className="p-2 text-slate-600">Potongan Lainnya</td>
                        <td className="p-2 text-right font-mono tabular-nums">{formatRupiah(activeSlip.otherDeduction)}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold border-t border-slate-300">
                      <td className="p-2 text-slate-800">Total Potongan</td>
                      <td className="p-2 text-right font-mono text-red-700 tabular-nums">
                        {formatRupiah(activeSlip.totalDeduction)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Total Take Home Pay Highlight Box */}
            <div className="bg-slate-100 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between border border-slate-300 mb-3 gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-700 block">
                  Penghasilan Bersih Diterima (Take Home Pay)
                </span>
                <span className="text-xs italic text-slate-600">
                  "{terbilang(activeSlip.netSalary)}"
                </span>
              </div>
              <span className="text-2xl font-extrabold font-mono text-blue-900 tabular-nums">
                {formatRupiah(activeSlip.netSalary)}
              </span>
            </div>

            {activeSlip.notes && (
              <p className="text-xs text-slate-500 italic mb-6">
                Catatan: {activeSlip.notes}
              </p>
            )}

            {/* Signature Block */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs relative">
              <div>
                <p className="text-slate-500">Mengetahui,</p>
                <p className="font-semibold text-slate-700">Kepala Sekolah</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="font-serif italic text-slate-400 text-lg">Suhari Irawan</span>
                </div>
                <p className="font-bold underline text-slate-900">{staffInfo.principal}</p>
              </div>

              {/* Center: Official Stamp & Bendahara */}
              <div className="relative">
                <p className="text-slate-500">Diverifikasi Oleh,</p>
                <p className="font-semibold text-slate-700">Bendahara Sekolah</p>
                <div className="h-16 relative flex items-center justify-center">
                  {/* Authentic scanned official school stamp */}
                  <img
                    src={OFFICIAL_STAMP || staffInfo.officialStampUrl || './cap_resmi_bopkri.jpg'}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.triedFallback) {
                        target.dataset.triedFallback = 'true';
                        target.src = './cap_resmi_bopkri.jpg';
                      }
                    }}
                    alt="Cap Resmi SD BOPKRI Gondolayu"
                    className="absolute inset-0 m-auto w-24 h-24 object-contain mix-blend-multiply opacity-90 rotate-[-6deg] pointer-events-none select-none z-10"
                  />
                  <span className="font-serif italic text-slate-400 text-lg relative z-0">Eni Utami</span>
                </div>
                <p className="font-bold underline text-slate-900">{staffInfo.treasurer}</p>
              </div>

              <div>
                <p className="text-slate-500">Yogyakarta, {formatDateIndo(activeSlip.createdAt)}</p>
                <p className="font-semibold text-slate-700">Penerima</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="font-serif italic text-slate-400 text-lg">{activeSlip.teacherName.split(',')[0]}</span>
                </div>
                <p className="font-bold underline text-slate-900">{activeSlip.teacherName}</p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Dokumen ini diterbitkan secara resmi melalui Sistem Keuangan SD BOPKRI Gondolayu Yogyakarta sebagai bukti slip gaji yang sah.
            </div>

          </div>
        </div>

        {/* Bottom Actions Bar (Hidden on print) */}
        <div className="no-print bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Gunakan tombol di atas untuk cetak langsung atau kirim notifikasi via WhatsApp dan Email.</span>
          <button
            onClick={() => setActiveSlip(null)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
