import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateIndo, formatDateTimeIndo, formatRupiah, normalizeWhatsAppNumber } from '../utils/formatters';
import { terbilang } from '../utils/terbilang';
import { CheckCircle2, Copy, Download, MessageSquare, Printer, X } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const {
    activeReceipt,
    setActiveReceipt,
    staffInfo,
    printFormat,
    setPrintFormat,
  } = useApp();

  const receiptRef = useRef<HTMLDivElement>(null);

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'TUNAI':
        return 'Tunai (Kasir Loket)';
      case 'QRIS':
        return 'QRIS (Gerbang Pembayaran Nasional)';
      case 'VA_BCA':
        return 'Virtual Account BCA';
      case 'VA_MANDIRI':
        return 'Virtual Account Mandiri';
      case 'VA_BRI':
        return 'Virtual Account BRI';
      case 'VA_BNI':
        return 'Virtual Account BNI';
      default:
        return method;
    }
  };

  const handleSendWhatsApp = () => {
    const phone = normalizeWhatsAppNumber(activeReceipt.parentPhone);
    const message = `*BUKTI PEMBAYARAN RESMI SD BOPKRI GONDOLAYU*\n` +
      `No. Kwitansi: ${activeReceipt.receiptNumber}\n` +
      `Tanggal: ${formatDateTimeIndo(activeReceipt.paidAt)}\n\n` +
      `Yth. Bapak/Ibu ${activeReceipt.parentName},\n` +
      `Terima kasih, pembayaran uang sekolah telah kami terima dengan rincian sbb:\n` +
      `• Nama Siswa: *${activeReceipt.studentName}*\n` +
      `• Kelas / NIS: ${activeReceipt.studentGrade} / ${activeReceipt.studentNis}\n` +
      `• Tagihan: *${activeReceipt.billTypeName} (${activeReceipt.period})*\n` +
      `• Jumlah Bayar: *${formatRupiah(activeReceipt.amount)}*\n` +
      `• Terbilang: _${terbilang(activeReceipt.amount)}_\n` +
      `• Metode: ${getMethodLabel(activeReceipt.paymentMethod)}\n` +
      `• Status: *LUNAS*\n\n` +
      `Kasir: ${activeReceipt.cashierName}\n` +
      `Bendahara: ${activeReceipt.treasurerName}\n` +
      `Kepala Sekolah: ${activeReceipt.principalName}\n\n` +
      `_Simpan pesan ini sebagai bukti pembayaran yang sah dari SD BOPKRI Gondolayu Yogyakarta._`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyText = () => {
    const text = `BUKTI PEMBAYARAN RESMI SD BOPKRI GONDOLAYU\nNo: ${activeReceipt.receiptNumber}\nSiswa: ${activeReceipt.studentName} (${activeReceipt.studentGrade})\nTagihan: ${activeReceipt.billTypeName} ${activeReceipt.period}\nJumlah: ${formatRupiah(activeReceipt.amount)}\nMetode: ${activeReceipt.paymentMethod}\nStatus: LUNAS\nKasir: ${activeReceipt.cashierName}\nBendahara: ${activeReceipt.treasurerName}`;
    navigator.clipboard.writeText(text);
    alert('Rincian kwitansi berhasil disalin ke clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">Kwitansi & Cetak Nota</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-500">{activeReceipt.receiptNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setPrintFormat('A4')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  printFormat === 'A4'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kwitansi Formal A4
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('STRUK')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  printFormat === 'STRUK'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nota Struk Kasir (80mm)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
              title="Arahkan langsung ke printer komputer fisik Anda (Epson, Canon, HP, Thermal 80mm, dll.)"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak ke Printer Komputer
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Kirim ke WA Orang Tua
            </button>

            <button
              onClick={() => setActiveReceipt(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="printable-area p-8 print:p-2 bg-white text-slate-900">
          {printFormat === 'A4' ? (
            /* ============================================================ */
            /* KWITANSI FORMAL STANDAR A4 / SETENGAH FOLIO                  */
            /* ============================================================ */
            <div className="border border-slate-300 p-8 rounded-lg print:border-slate-800 print:rounded-none relative">
              {/* Header / KOP Surat */}
              <div className="flex items-center gap-5 border-b-2 border-slate-800 pb-5">
                <img
                  src="/src/assets/images/logo_bopkri_gondolayu.png"
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

              {/* Title & Receipt Meta */}
              <div className="flex items-center justify-between my-6">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 underline decoration-slate-400 underline-offset-4">
                    Kwitansi Pembayaran
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    No: {activeReceipt.receiptNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md uppercase tracking-wider border border-emerald-300">
                    LUNAS
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {formatDateTimeIndo(activeReceipt.paidAt)}
                  </p>
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full text-sm border-collapse mb-6">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 text-slate-500 w-44 font-medium">Telah Diterima Dari</td>
                    <td className="py-2 text-slate-900 font-semibold">: {activeReceipt.parentName}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 text-slate-500 font-medium">Untuk Pembayaran Siswa</td>
                    <td className="py-2 text-slate-900 font-semibold">
                      : {activeReceipt.studentName} <span className="font-normal text-slate-500">({activeReceipt.studentGrade} · NIS: {activeReceipt.studentNis})</span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 text-slate-500 font-medium">Rincian Pembayaran</td>
                    <td className="py-2 text-slate-900 font-semibold">
                      : {activeReceipt.billTypeName} — <span className="text-blue-900">{activeReceipt.period}</span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 text-slate-500 font-medium">Metode Pembayaran</td>
                    <td className="py-2 text-slate-900">
                      : {getMethodLabel(activeReceipt.paymentMethod)}
                      {activeReceipt.referenceNumber && (
                        <span className="ml-2 font-mono text-xs text-slate-500">(Ref: {activeReceipt.referenceNumber})</span>
                      )}
                    </td>
                  </tr>
                  {activeReceipt.paymentMethod === 'TUNAI' && activeReceipt.cashTendered !== undefined && (
                    <tr className="border-b border-slate-200 text-xs text-slate-600">
                      <td className="py-1.5 text-slate-500 font-medium">Uang Diterima / Kembali</td>
                      <td className="py-1.5">
                        : Diterima {formatRupiah(activeReceipt.cashTendered)} · Kembali {formatRupiah(activeReceipt.cashChange || 0)}
                      </td>
                    </tr>
                  )}
                  {activeReceipt.notes && (
                    <tr className="border-b border-slate-200 text-xs">
                      <td className="py-1.5 text-slate-500 font-medium">Keterangan Tambahan</td>
                      <td className="py-1.5 text-slate-700">: {activeReceipt.notes}</td>
                    </tr>
                  )}
                  <tr className="border-b border-slate-300 bg-slate-50/70">
                    <td className="py-3 text-slate-700 font-semibold">Jumlah Terbilang</td>
                    <td className="py-3 font-medium italic text-slate-800">
                      : "{terbilang(activeReceipt.amount)}"
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Box */}
              <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-between border border-slate-200 mb-8">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-600">
                  Total Nominal Dibayar
                </span>
                <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                  {formatRupiah(activeReceipt.amount)}
                </span>
              </div>

              {/* Signature Blocks with Authentic Official Stamp Scan */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-center text-xs relative">
                <div>
                  <p className="text-slate-500">Mengetahui,</p>
                  <p className="font-semibold text-slate-700">Kepala Sekolah</p>
                  <div className="h-20 flex items-center justify-center">
                    {/* Simulated subtle signature scribble */}
                    <span className="font-serif italic text-slate-400 text-lg">Suhari I.</span>
                  </div>
                  <p className="font-bold underline text-slate-900">{staffInfo.principal}</p>
                </div>

                {/* Center: Stamp Seal of SD BOPKRI */}
                <div className="relative">
                  <p className="text-slate-500">Diverifikasi Oleh,</p>
                  <p className="font-semibold text-slate-700">Bendahara Sekolah</p>
                  <div className="h-20 relative flex items-center justify-center">
                    {/* Authentic scanned official school stamp */}
                    <img
                      src={staffInfo.officialStampUrl || '/cap_resmi_bopkri.jpg'}
                      alt="Cap Resmi SD BOPKRI Gondolayu"
                      className="absolute inset-0 m-auto w-28 h-28 object-contain mix-blend-multiply opacity-90 rotate-[-6deg] pointer-events-none select-none z-10"
                    />
                    <span className="font-serif italic text-slate-400 text-lg relative z-0">Eni Utami</span>
                  </div>
                  <p className="font-bold underline text-slate-900">{staffInfo.treasurer}</p>
                </div>

                <div>
                  <p className="text-slate-500">Yogyakarta, {formatDateIndo(activeReceipt.paidAt)}</p>
                  <p className="font-semibold text-slate-700">Kasir Penerima</p>
                  <div className="h-20 flex items-center justify-center">
                    <span className="font-serif italic text-slate-400 text-lg">Nastiti K.U.</span>
                  </div>
                  <p className="font-bold underline text-slate-900">{staffInfo.cashier}</p>
                </div>
              </div>

              {/* Bottom Note */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Kwitansi ini diterbitkan secara resmi melalui SIBOGO (Sistem Informasi BOPKRI Gondolayu) dan sah tanpa cap basah tambahan.
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* FORMAT STRUK KASIR THERMAL POS (80mm)                        */
            /* ============================================================ */
            <div className="max-w-sm mx-auto font-mono text-xs border border-dashed border-slate-300 p-6 rounded-lg bg-white print:border-none print:p-0">
              <div className="text-center pb-4 border-b border-dashed border-slate-400">
                <img
                  src="/src/assets/images/logo_bopkri_gondolayu.png"
                  alt="Logo BOPKRI"
                  className="w-12 h-12 mx-auto mb-2 object-contain"
                />
                <h3 className="font-bold text-sm tracking-tight">{staffInfo.schoolName}</h3>
                <p className="text-[10px] text-slate-600">{staffInfo.address}</p>
                <p className="text-[10px] text-slate-500">Telp: {staffInfo.phone} · Web: {staffInfo.website || 'www.sdbopkrigondolayu.sch.id'}</p>
              </div>

              <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{activeReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{formatDateTimeIndo(activeReceipt.paidAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{activeReceipt.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Siswa:</span>
                  <span className="font-bold">{activeReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kelas / NIS:</span>
                  <span>{activeReceipt.studentGrade} / {activeReceipt.studentNis}</span>
                </div>
              </div>

              <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold">{activeReceipt.billTypeName}</span>
                  <span className="font-bold tabular-nums">{formatRupiah(activeReceipt.amount)}</span>
                </div>
                <div className="text-[10px] text-slate-500">Periode: {activeReceipt.period}</div>
              </div>

              <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between font-bold text-xs pt-1">
                  <span>TOTAL:</span>
                  <span className="tabular-nums">{formatRupiah(activeReceipt.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span>{activeReceipt.paymentMethod}</span>
                </div>
                {activeReceipt.paymentMethod === 'TUNAI' && activeReceipt.cashTendered !== undefined && (
                  <>
                    <div className="flex justify-between">
                      <span>Tunai Diterima:</span>
                      <span className="tabular-nums">{formatRupiah(activeReceipt.cashTendered)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kembalian:</span>
                      <span className="tabular-nums">{formatRupiah(activeReceipt.cashChange || 0)}</span>
                    </div>
                  </>
                )}
                {activeReceipt.referenceNumber && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Ref:</span>
                    <span>{activeReceipt.referenceNumber}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 text-center text-[10px] space-y-1 text-slate-600">
                <div className="font-bold text-emerald-700 uppercase tracking-widest py-1 border border-emerald-400 rounded-sm">
                  *** LUNAS ***
                </div>
                <p className="pt-1">Terima kasih atas pembayaran Anda</p>
                <p>Tuhan Memberkati</p>
                <p className="text-[8px] text-slate-400">Kepsek: {staffInfo.principal}</p>
                <p className="text-[8px] text-slate-400">Bendahara: {staffInfo.treasurer}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom helper actions (Hidden on print) */}
        <div className="no-print bg-slate-50 px-8 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Kwitansi otomatis tersimpan dan dapat dicetak kembali kapan saja di menu Laporan Transaksi.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Salin Teks
            </button>
            <button
              onClick={() => setActiveReceipt(null)}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
