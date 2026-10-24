import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bill, Student } from '../types';
import { calculateOverdueDays, formatDateIndo, formatRupiah, normalizeWhatsAppNumber } from '../utils/formatters';
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  MessageSquare,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';

export const WhatsAppReminderView: React.FC = () => {
  const { bills, students, staffInfo, setActivePayingBill } = useApp();

  const [selectedGrade, setSelectedGrade] = useState<string>('Semua Kelas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [templateType, setTemplateType] = useState<'OVERDUE' | 'UPCOMING' | 'CUSTOM'>('OVERDUE');
  const [customGreeting, setCustomGreeting] = useState<string>(
    'Semoga Bapak/Ibu sekeluarga senantiasa dalam keadaan sehat dan penuh berkat.'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Group overdue bills by student
  const overdueBills = bills.filter((b) => b.status === 'MENUNGGAK' || b.status === 'BELUM_BAYAR');

  // Filter students with pending/overdue bills
  const studentMap = new Map<string, { student: Student; unpaidBills: Bill[]; totalUnpaid: number }>();

  overdueBills.forEach((bill) => {
    const student = students.find((s) => s.id === bill.studentId);
    if (!student) return;

    if (!studentMap.has(student.id)) {
      studentMap.set(student.id, {
        student,
        unpaidBills: [],
        totalUnpaid: 0,
      });
    }

    const entry = studentMap.get(student.id)!;
    entry.unpaidBills.push(bill);
    entry.totalUnpaid += Math.max(0, bill.amount - bill.paidAmount);
  });

  const studentList = Array.from(studentMap.values()).filter((item) => {
    const matchGrade = selectedGrade === 'Semua Kelas' || item.student.grade === selectedGrade;
    const matchSearch =
      item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.nis.includes(searchTerm) ||
      item.student.parentPhone.includes(searchTerm);
    return matchGrade && matchSearch;
  });

  const generateWhatsAppMessage = (
    student: Student,
    unpaidBills: Bill[],
    totalUnpaid: number
  ) => {
    const billItemsText = unpaidBills
      .map(
        (b) =>
          `• ${b.billTypeName} (${b.period}) : *${formatRupiah(b.amount - b.paidAmount)}*` +
          (b.status === 'MENUNGGAK' ? ` _(Jatuh tempo: ${b.dueDate})_` : '')
      )
      .join('\n');

    if (templateType === 'OVERDUE') {
      return (
        `*PEMBERITAHUAN TUNGGAKAN UANG SEKOLAH*\n` +
        `*SD BOPKRI GONDOLAYU YOGYAKARTA*\n\n` +
        `Yth. Bapak/Ibu *${student.parentName}*,\n` +
        `Orang tua / wali dari ananda: *${student.name}* (Kelas: ${student.grade} · NIS: ${student.nis})\n\n` +
        `${customGreeting}\n\n` +
        `Berdasarkan catatan administrasi keuangan sekolah kami, terdapat pos tagihan yang telah melewati batas waktu pembayaran:\n\n` +
        `${billItemsText}\n\n` +
        `*Total Yang Perlu Diselesaikan: ${formatRupiah(totalUnpaid)}*\n\n` +
        `Pembayaran dapat dilakukan melalui beberapa saluran resmi:\n` +
        `1. *Tunai di Loket Kasir Sekolah*\n` +
        `   Menemui Kasir: Ibu *${staffInfo.cashier}* (Ruang Tata Usaha, pkl 07.30 - 14.00 WIB)\n` +
        `2. *QRIS SD BOPKRI Gondolayu*\n` +
        `   Dapat dipindai di loket atau meminta kode QRIS dinamis via WhatsApp ini\n` +
        `3. *Virtual Account (VA)*:\n` +
        `   • Bank BCA: *12345${student.nis}*\n` +
        `   • Bank Mandiri: *88012${student.nis}*\n` +
        `   • Bank BRI: *10293${student.nis}*\n` +
        `   _Atas Nama: SD BOPKRI - ${student.name}_\n\n` +
        `Bila Bapak/Ibu telah melakukan pembayaran, mohon abaikan pesan ini atau kirimkan foto bukti transfer untuk kami verifikasi.\n\n` +
        `Atas perhatian, kerjasama, dan dukungannya demi kelancaran kegiatan belajar mengajar, kami ucapkan terima kasih.\n\n` +
        `Salam kasih,\n` +
        `*Bendahara:* Ibu ${staffInfo.treasurer}\n` +
        `*Kepala Sekolah:* Bpk. ${staffInfo.principal}\n` +
        `_SD BOPKRI Gondolayu Yogyakarta_`
      );
    } else {
      return (
        `*PENGINGAT PEMBAYARAN TAGIHAN UANG SEKOLAH*\n` +
        `*SD BOPKRI GONDOLAYU YOGYAKARTA*\n\n` +
        `Yth. Bapak/Ibu *${student.parentName}*,\n` +
        `Orang tua / wali dari siswa: *${student.name}* (${student.grade})\n\n` +
        `Salam sejahtera. Kami menginformasikan tagihan uang sekolah ananda sbb:\n\n` +
        `${billItemsText}\n\n` +
        `*Total Tagihan: ${formatRupiah(totalUnpaid)}*\n\n` +
        `Metode Pembayaran:\n` +
        `• Loket Kasir SD BOPKRI Gondolayu (Kasir: Ibu ${staffInfo.cashier})\n` +
        `• QRIS Sekolah SD BOPKRI\n` +
        `• Virtual Account Mandiri: 88012${student.nis} / BCA: 12345${student.nis}\n\n` +
        `Terima kasih. Tuhan Memberkati.\n` +
        `Bendahara: ${staffInfo.treasurer} · Kepsek: ${staffInfo.principal}`
      );
    }
  };

  const handleOpenWhatsApp = (
    student: Student,
    unpaidBills: Bill[],
    totalUnpaid: number
  ) => {
    const rawMsg = generateWhatsAppMessage(student, unpaidBills, totalUnpaid);
    const phone = normalizeWhatsAppNumber(student.parentPhone);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(rawMsg)}`, '_blank');
  };

  const handleCopyMessage = (
    student: Student,
    unpaidBills: Bill[],
    totalUnpaid: number
  ) => {
    const rawMsg = generateWhatsAppMessage(student, unpaidBills, totalUnpaid);
    navigator.clipboard.writeText(rawMsg);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const allGrades = ['Semua Kelas', 'Kelas 1A', 'Kelas 1B', 'Kelas 2B', 'Kelas 3A', 'Kelas 4A', 'Kelas 5B', 'Kelas 6A'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Fitur Notifikasi WhatsApp</span>
              <span aria-hidden="true">·</span>
              <span>SD BOPKRI Gondolayu</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pusat Pengingat Otomatis WhatsApp ke Orang Tua Murid
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Kirim pemberitahuan tagihan SPP bulanan, uang kegiatan, dan tunggakan langsung ke nomor WhatsApp orang tua murid dengan format resmi sekolah.
            </p>
          </div>

          {/* Template Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0 text-xs font-semibold">
            <button
              onClick={() => setTemplateType('OVERDUE')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                templateType === 'OVERDUE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Format Surat Tunggakan Resmi
            </button>
            <button
              onClick={() => setTemplateType('UPCOMING')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                templateType === 'UPCOMING'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Format Pengingat Ringkas
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Kelas:
          </span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {allGrades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa, orang tua, atau no HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Student Arrears Queue List */}
      <div className="space-y-4">
        {studentList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Check className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              Tidak Ada Siswa yang Menunggak
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Seluruh kewajiban pembayaran telah lunas atau tidak ditemukan data siswa yang cocok dengan filter.
            </p>
          </div>
        ) : (
          studentList.map(({ student, unpaidBills, totalUnpaid }) => {
            const hasOverdue = unpaidBills.some((b) => b.status === 'MENUNGGAK');
            const maxDaysOverdue = Math.max(
              0,
              ...unpaidBills.map((b) => calculateOverdueDays(b.dueDate))
            );

            return (
              <div
                key={student.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Student & Parent Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {student.grade}
                      </span>
                      {hasOverdue && (
                        <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          Menunggak ({maxDaysOverdue} hari lewat tempo)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>NIS: <strong className="text-slate-700">{student.nis}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Orang Tua: <strong className="text-slate-700">{student.parentName}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>WhatsApp: <strong className="text-emerald-700">{student.parentPhone}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>VA Mandiri: <strong className="text-slate-700 font-mono">88012{student.nis}</strong></span>
                    </div>

                    {/* Unpaid Bills Tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {unpaidBills.map((b) => (
                        <div
                          key={b.id}
                          className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                            b.status === 'MENUNGGAK'
                              ? 'bg-red-50/70 border-red-200 text-red-900 font-medium'
                              : 'bg-amber-50/70 border-amber-200 text-amber-900'
                          }`}
                        >
                          <span>{b.billTypeName} ({b.period})</span>
                          <span className="font-mono font-bold">{formatRupiah(b.amount - b.paidAmount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Direct WhatsApp Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right pr-2">
                      <p className="text-[11px] text-slate-500">Total Tertunggak</p>
                      <p className="text-lg font-mono font-extrabold text-slate-900 tabular-nums">
                        {formatRupiah(totalUnpaid)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMessage(student, unpaidBills, totalUnpaid)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Salin Pesan WhatsApp"
                      >
                        {copiedId === student.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Pesan</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenWhatsApp(student, unpaidBills, totalUnpaid)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Kirim ke WA Orang Tua
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </button>

                      <button
                        onClick={() => {
                          const firstBill = unpaidBills[0];
                          if (firstBill) setActivePayingBill(firstBill);
                        }}
                        className="px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                      >
                        Bayar di Kasir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible preview of message */}
                <details className="mt-3 pt-3 border-t border-slate-100 text-xs">
                  <summary className="cursor-pointer text-slate-500 hover:text-slate-800 font-medium">
                    Lihat Isi Pesan WhatsApp yang Akan Dikirim
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-slate-700 text-[11px] font-mono whitespace-pre-wrap border border-slate-200">
                    {generateWhatsAppMessage(student, unpaidBills, totalUnpaid)}
                  </pre>
                </details>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
