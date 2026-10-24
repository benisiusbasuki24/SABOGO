import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmploymentStatus, PayrollRecord, Teacher } from '../types';
import { formatDateIndo, formatDateTimeIndo, formatRupiah, normalizeWhatsAppNumber } from '../utils/formatters';
import { terbilang } from '../utils/terbilang';
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Filter,
  Mail,
  MessageSquare,
  Plus,
  Printer,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';

export const TeacherPayrollView: React.FC = () => {
  const {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    deleteTeachersBulk,
    payrolls,
    addPayrollRecord,
    deletePayrollRecord,
    deletePayrollsBulk,
    markPayrollTransferred,
    setActiveSlip,
    staffInfo,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'SLIPS' | 'TEACHERS'>('SLIPS');
  const [periodFilter, setPeriodFilter] = useState<string>('Oktober 2026');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUDAH_DITRANSFER' | 'BELUM_DITRANSFER'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected payroll checkboxes for bulk deletion
  const [selectedSlipIds, setSelectedSlipIds] = useState<string[]>([]);

  // Selected teacher checkboxes for bulk deletion
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  // Teacher modal state
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [tNip, setTNip] = useState<string>('');
  const [tName, setTName] = useState<string>('');
  const [tRole, setTRole] = useState<string>('Guru Kelas');
  const [tStatus, setTStatus] = useState<EmploymentStatus>('GTY');
  const [tPhone, setTPhone] = useState<string>('');
  const [tEmail, setTEmail] = useState<string>('');
  const [tBankName, setTBankName] = useState<string>('BPD DIY');
  const [tAccountNumber, setTAccountNumber] = useState<string>('');
  const [tAccountHolder, setTAccountHolder] = useState<string>('');
  const [tBaseSalary, setTBaseSalary] = useState<number>(3500000);
  const [tUsername, setTUsername] = useState<string>('');
  const [tPassword, setTPassword] = useState<string>('123');

  // New Payroll Modal state
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState<boolean>(false);
  const [pTeacherId, setPTeacherId] = useState<string>('');
  const [pPeriod, setPPeriod] = useState<string>('Oktober 2026');
  const [pBaseSalary, setPBaseSalary] = useState<number>(3500000);
  const [pPositionAllowance, setPPositionAllowance] = useState<number>(500000);
  const [pTeachingAllowance, setPTeachingAllowance] = useState<number>(400000);
  const [pWelfareAllowance, setPWelfareAllowance] = useState<number>(350000);
  const [pBpjsAllowance, setPBpjsAllowance] = useState<number>(180000);
  const [pOtherAllowance, setPOtherAllowance] = useState<number>(0);
  const [pCoopDeduction, setPCoopDeduction] = useState<number>(100000);
  const [pBpjsDeduction, setPBpjsDeduction] = useState<number>(150000);
  const [pTaxDeduction, setPTaxDeduction] = useState<number>(60000);
  const [pLoanDeduction, setPLoanDeduction] = useState<number>(0);
  const [pOtherDeduction, setPOtherDeduction] = useState<number>(0);
  const [pNotes, setPNotes] = useState<string>('');

  // Calculations for current form
  const curAllowance =
    Number(pPositionAllowance || 0) +
    Number(pTeachingAllowance || 0) +
    Number(pWelfareAllowance || 0) +
    Number(pBpjsAllowance || 0) +
    Number(pOtherAllowance || 0);

  const curDeduction =
    Number(pCoopDeduction || 0) +
    Number(pBpjsDeduction || 0) +
    Number(pTaxDeduction || 0) +
    Number(pLoanDeduction || 0) +
    Number(pOtherDeduction || 0);

  const curNet = Number(pBaseSalary || 0) + curAllowance - curDeduction;

  // Filtered Payrolls
  const filteredPayrolls = payrolls.filter((p) => {
    if (periodFilter !== 'SEMUA' && p.period !== periodFilter) return false;
    if (statusFilter !== 'ALL' && p.paymentStatus !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = p.teacherName.toLowerCase().includes(q);
      const matchNip = p.teacherNip.includes(q);
      const matchRole = p.teacherRole.toLowerCase().includes(q);
      const matchSlip = p.slipNumber.toLowerCase().includes(q);
      if (!matchName && !matchNip && !matchRole && !matchSlip) return false;
    }
    return true;
  });

  // Filtered Teachers
  const filteredTeachers = teachers.filter((t) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.nip.includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        (t.username && t.username.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Payroll Metrics
  const totalNetAll = filteredPayrolls.reduce((acc, p) => acc + p.netSalary, 0);
  const totalTransferred = filteredPayrolls
    .filter((p) => p.paymentStatus === 'SUDAH_DITRANSFER')
    .reduce((acc, p) => acc + p.netSalary, 0);
  const totalPending = totalNetAll - totalTransferred;

  const handleOpenAddTeacher = () => {
    setEditingTeacherId(null);
    setTNip('');
    setTName('');
    setTRole('Guru Kelas');
    setTStatus('GTY');
    setTPhone('0812');
    setTEmail('');
    setTBankName('BPD DIY');
    setTAccountNumber('');
    setTAccountHolder('');
    setTBaseSalary(3500000);
    setTUsername('');
    setTPassword('123');
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (t: Teacher) => {
    setEditingTeacherId(t.id);
    setTNip(t.nip);
    setTName(t.name);
    setTRole(t.role);
    setTStatus(t.status);
    setTPhone(t.phone);
    setTEmail(t.email);
    setTBankName(t.bankName);
    setTAccountNumber(t.accountNumber);
    setTAccountHolder(t.accountHolder);
    setTBaseSalary(t.baseSalary);
    setTUsername(t.username || '');
    setTPassword(t.password || '123');
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim() || !tPhone.trim()) {
      alert('Nama guru dan nomor WhatsApp wajib diisi');
      return;
    }

    const payload = {
      nip: tNip,
      name: tName,
      role: tRole,
      status: tStatus,
      phone: tPhone,
      email: tEmail,
      bankName: tBankName,
      accountNumber: tAccountNumber,
      accountHolder: tAccountHolder || tName,
      baseSalary: Number(tBaseSalary) || 3000000,
      username: tUsername.trim() || undefined,
      password: tPassword.trim() || '123',
      isActive: true,
    };

    if (editingTeacherId) {
      updateTeacher(editingTeacherId, payload);
    } else {
      addTeacher(payload);
    }

    setIsTeacherModalOpen(false);
  };

  const handleOpenAddPayroll = (presetTeacherId?: string) => {
    const targetTeacherId = presetTeacherId || (teachers.length > 0 ? teachers[0].id : '');
    setPTeacherId(targetTeacherId);

    const targetT = teachers.find((t) => t.id === targetTeacherId);
    if (targetT) {
      setPBaseSalary(targetT.baseSalary);
    } else {
      setPBaseSalary(3500000);
    }

    setPPeriod(periodFilter !== 'SEMUA' ? periodFilter : 'Oktober 2026');
    setPPositionAllowance(500000);
    setPTeachingAllowance(400000);
    setPWelfareAllowance(350000);
    setPBpjsAllowance(180000);
    setPOtherAllowance(0);
    setPCoopDeduction(100000);
    setPBpjsDeduction(150000);
    setPTaxDeduction(60000);
    setPLoanDeduction(0);
    setPOtherDeduction(0);
    setPNotes('');
    setIsPayrollModalOpen(true);
  };

  const handleTeacherChangeInPayrollModal = (id: string) => {
    setPTeacherId(id);
    const targetT = teachers.find((t) => t.id === id);
    if (targetT) {
      setPBaseSalary(targetT.baseSalary);
    }
  };

  const handleSavePayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTeacherId) {
      alert('Pilih guru yang akan digaji');
      return;
    }

    try {
      const record = addPayrollRecord({
        teacherId: pTeacherId,
        period: pPeriod,
        baseSalary: Number(pBaseSalary),
        positionAllowance: Number(pPositionAllowance),
        teachingAllowance: Number(pTeachingAllowance),
        welfareAllowance: Number(pWelfareAllowance),
        bpjsAllowance: Number(pBpjsAllowance),
        otherAllowance: Number(pOtherAllowance),
        coopDeduction: Number(pCoopDeduction),
        bpjsDeduction: Number(pBpjsDeduction),
        taxDeduction: Number(pTaxDeduction),
        loanDeduction: Number(pLoanDeduction),
        otherDeduction: Number(pOtherDeduction),
        notes: pNotes,
      });

      setIsPayrollModalOpen(false);
      setActiveSlip(record);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan penggajian');
    }
  };

  const handleQuickSendWA = (p: PayrollRecord) => {
    const phone = normalizeWhatsAppNumber(p.teacherPhone);
    const msg =
      `*SLIP GAJI SD BOPKRI GONDOLAYU*\n` +
      `No. Slip: ${p.slipNumber}\n` +
      `Periode: *${p.period}*\n\n` +
      `Yth. Bapak/Ibu *${p.teacherName}*,\n` +
      `Gaji bulan *${p.period}* sebesar *${formatRupiah(p.netSalary)}* telah diproses.\n` +
      `Rekening: *${p.bankName} - ${p.accountNumber}*\n` +
      `Status: *${p.paymentStatus === 'SUDAH_DITRANSFER' ? 'SUDAH DITRANSFER' : 'DALAM PROSES'}*\n\n` +
      `Terima kasih atas dedikasi dan pengabdiannya di SD BOPKRI Gondolayu. Tuhan Memberkati.\n` +
      `Bendahara: ${staffInfo.treasurer} · Kepala Sekolah: ${staffInfo.principal}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleQuickSendEmail = (p: PayrollRecord) => {
    const subject = `[SLIP GAJI] SD BOPKRI Gondolayu - Periode ${p.period} - ${p.teacherName}`;
    const body =
      `Yth. Bapak/Ibu ${p.teacherName},\n\n` +
      `Pemberitahuan penggajian SD BOPKRI Gondolayu periode ${p.period}:\n` +
      `- No. Slip: ${p.slipNumber}\n` +
      `- Rekening: ${p.bankName} - ${p.accountNumber}\n` +
      `- Gaji Pokok: ${formatRupiah(p.baseSalary)}\n` +
      `- Total Tunjangan: ${formatRupiah(p.totalAllowance)}\n` +
      `- Total Potongan: ${formatRupiah(p.totalDeduction)}\n` +
      `- Gaji Bersih Diterima: ${formatRupiah(p.netSalary)}\n` +
      `- Status: ${p.paymentStatus === 'SUDAH_DITRANSFER' ? 'SUDAH DITRANSFER' : 'DALAM PROSES'}\n\n` +
      `Terima kasih.\n` +
      `Bendahara: ${staffInfo.treasurer} · Kepala Sekolah: ${staffInfo.principal}`;

    window.open(`mailto:${p.teacherEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleToggleSelectSlip = (id: string) => {
    setSelectedSlipIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllSlips = () => {
    if (selectedSlipIds.length === filteredPayrolls.length) {
      setSelectedSlipIds([]);
    } else {
      setSelectedSlipIds(filteredPayrolls.map((p) => p.id));
    }
  };

  const handleDeleteSelectedSlips = () => {
    if (selectedSlipIds.length === 0) return;
    if (window.confirm(`Yakin ingin menghapus ${selectedSlipIds.length} data slip gaji terpilih?`)) {
      deletePayrollsBulk(selectedSlipIds);
      setSelectedSlipIds([]);
    }
  };

  const handleToggleSelectTeacher = (id: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllTeachers = () => {
    if (selectedTeacherIds.length === filteredTeachers.length && filteredTeachers.length > 0) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(filteredTeachers.map((t) => t.id));
    }
  };

  const handleDeleteSelectedTeachers = () => {
    if (selectedTeacherIds.length === 0) return;
    const count = selectedTeacherIds.length;
    if (window.confirm(`Yakin ingin menghapus ${count} data guru yang dipilih? Data guru akan dihapus permanen.`)) {
      deleteTeachersBulk(selectedTeacherIds);
      setSelectedTeacherIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Manajemen Penggajian Pendidik & Tenaga Kependidikan</span>
            <span aria-hidden="true">·</span>
            <span>SD BOPKRI Gondolayu</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pencatatan Gaji Guru & Penerbitan Slip Gaji Resmi
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Kelola data guru, hitung gaji pokok beserta tunjangan dan potongan, cetak slip gaji formal, serta kirim info pembayaran otomatis ke WhatsApp dan Email guru.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleOpenAddTeacher}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <UserPlus className="w-4 h-4 text-slate-600" />
            Input Data Guru Baru
          </button>
          <button
            onClick={() => handleOpenAddPayroll()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Buat Penggajian & Slip Baru
          </button>
        </div>
      </div>

      {/* Sub Tabs: Rekap Slip Gaji vs Master Data Guru */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-xl">
        <div className="flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('SLIPS')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'SLIPS'
                ? 'border-blue-800 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Daftar Penggajian & Slip Gaji ({payrolls.length})
          </button>
          <button
            onClick={() => setActiveSubTab('TEACHERS')}
            className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'TEACHERS'
                ? 'border-blue-800 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Master Data Guru & Karyawan ({teachers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64 py-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder={activeSubTab === 'SLIPS' ? 'Cari nama guru, NIP, slip...' : 'Cari nama guru, NIP, mapel...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* VIEW 1: REKAPITULASI PENGGAJIAN & SLIP */}
      {activeSubTab === 'SLIPS' && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="text-xs text-slate-500 block mb-1">Total Beban Gaji ({periodFilter})</span>
              <p className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {formatRupiah(totalNetAll)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {filteredPayrolls.length} guru & staf tercatat
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="text-xs text-slate-500 block mb-1">Sudah Ditransfer ke Rekening</span>
              <p className="text-2xl font-extrabold font-mono text-emerald-800 tabular-nums">
                {formatRupiah(totalTransferred)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {filteredPayrolls.filter((p) => p.paymentStatus === 'SUDAH_DITRANSFER').length} guru telah menerima transfer
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="text-xs text-slate-500 block mb-1">Menunggu Proses Transfer</span>
              <p className="text-2xl font-extrabold font-mono text-amber-700 tabular-nums">
                {formatRupiah(totalPending)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {filteredPayrolls.filter((p) => p.paymentStatus === 'BELUM_DITRANSFER').length} antrean transfer
              </p>
            </div>
          </div>

          {/* Filters & Bulk Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Periode:</span>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="border border-slate-300 rounded-md px-2.5 py-1 bg-white font-medium text-slate-800"
                >
                  <option value="Oktober 2026">Oktober 2026</option>
                  <option value="September 2026">September 2026</option>
                  <option value="Agustus 2026">Agustus 2026</option>
                  <option value="SEMUA">Semua Periode</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status Transfer:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-slate-300 rounded-md px-2.5 py-1 bg-white font-medium text-slate-800"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="SUDAH_DITRANSFER">Sudah Ditransfer</option>
                  <option value="BELUM_DITRANSFER">Belum Ditransfer</option>
                </select>
              </div>
            </div>

            {/* Bulk delete action */}
            {selectedSlipIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">
                  {selectedSlipIds.length} slip dipilih
                </span>
                <button
                  type="button"
                  onClick={handleDeleteSelectedSlips}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Slip Terpilih
                </button>
              </div>
            )}
          </div>

          {/* Payrolls Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="py-3 px-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={filteredPayrolls.length > 0 && selectedSlipIds.length === filteredPayrolls.length}
                        onChange={handleSelectAllSlips}
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="py-3 px-4">No. Slip & Periode</th>
                    <th className="py-3 px-4">Nama Guru & NIP</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4">Rekening Bank</th>
                    <th className="py-3 px-4 text-right">Gaji Bersih</th>
                    <th className="py-3 px-4 text-center">Status Transfer</th>
                    <th className="py-3 px-4 text-center">Aksi & Notifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayrolls.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Tidak ada catatan slip gaji untuk kriteria filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredPayrolls.map((p) => {
                      const isSelected = selectedSlipIds.includes(p.id);

                      return (
                        <tr key={p.id} className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectSlip(p.id)}
                              className="rounded border-slate-300"
                            />
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-slate-900 block">{p.slipNumber}</span>
                            <span className="text-[10px] text-blue-900 font-semibold">{p.period}</span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900">{p.teacherName}</p>
                              <button
                                onClick={() => {
                                  const tch = teachers.find((t) => t.id === p.teacherId);
                                  if (tch) handleOpenEditTeacher(tch);
                                }}
                                className="p-1 text-slate-400 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="Ubah Nama & Data Guru Ini"
                              >
                                <Edit className="w-3 h-3 text-blue-600" />
                              </button>
                            </div>
                            <p className="text-[10px] font-mono text-slate-500">NIP: {p.teacherNip || '-'}</p>
                          </td>

                          <td className="py-3 px-4 text-slate-700">
                            {p.teacherRole}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">{p.bankName}</span>
                            <p className="font-mono text-[11px] text-slate-500">{p.accountNumber}</p>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <span className="font-mono font-extrabold text-blue-900 tabular-nums text-sm block">
                              {formatRupiah(p.netSalary)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (Kotor {formatRupiah(p.baseSalary + p.totalAllowance)})
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            {p.paymentStatus === 'SUDAH_DITRANSFER' ? (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Sudah Ditransfer
                                </span>
                                {p.transferRef && (
                                  <p className="text-[9px] font-mono text-slate-400 mt-0.5 truncate max-w-[120px] mx-auto">
                                    {p.transferRef}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  const ref = prompt('Masukkan nomor referensi transfer bank (opsional):', `TRF-BOPKRI-${Date.now().toString().slice(-6)}`);
                                  if (ref !== null) {
                                    markPayrollTransferred(p.id, ref);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded transition-colors"
                                title="Klik untuk tandai sudah ditransfer"
                              >
                                <Clock className="w-3 h-3 text-amber-600" />
                                Tandai Transfer
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Open Slip for print */}
                              <button
                                onClick={() => setActiveSlip(p)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                title="Lihat dan Cetak Slip Gaji"
                              >
                                <Printer className="w-3 h-3" />
                                Slip
                              </button>

                              {/* WhatsApp Direct Send */}
                              <button
                                onClick={() => handleQuickSendWA(p)}
                                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Kirim Info Gaji ke WhatsApp Guru"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              {/* Email Direct Send */}
                              <button
                                onClick={() => handleQuickSendEmail(p)}
                                className="p-1 text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Kirim Info Gaji ke Email Guru"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Slip */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus slip gaji untuk ${p.teacherName} periode ${p.period}?`)) {
                                    deletePayrollRecord(p.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                title="Hapus Slip Gaji Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        </div>
      )}

      {/* VIEW 2: MASTER DATA GURU & KARYAWAN */}
      {activeSubTab === 'TEACHERS' && (
        <div className="space-y-4">
          {/* Teacher Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Daftar Guru & Karyawan ({teachers.length} Orang)
              </span>
              {selectedTeacherIds.length > 0 && (
                <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {selectedTeacherIds.length} dipilih
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedTeacherIds.length > 0 && (
                <button
                  onClick={handleDeleteSelectedTeachers}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  Hapus Guru Terpilih ({selectedTeacherIds.length})
                </button>
              )}
              <button
                onClick={handleOpenAddTeacher}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Tambah Guru Baru
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        aria-label="Pilih semua guru"
                        checked={filteredTeachers.length > 0 && selectedTeacherIds.length === filteredTeachers.length}
                        onChange={handleSelectAllTeachers}
                        className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Nama Guru & NIP</th>
                    <th className="py-3 px-4">Jabatan / Tugas</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Rekening Pembayaran</th>
                    <th className="py-3 px-4 text-right">Gaji Pokok Standar</th>
                    <th className="py-3 px-4">Kontak (WhatsApp & Email)</th>
                    <th className="py-3 px-4 text-center">Aksi Manajemen Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Tidak ada data guru yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t) => {
                      const isSelected = selectedTeacherIds.includes(t.id);
                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              aria-label={`Pilih guru ${t.name}`}
                              checked={isSelected}
                              onChange={() => handleToggleSelectTeacher(t.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-600 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{t.name}</p>
                            <p className="text-[10px] font-mono text-slate-500">NIP: {t.nip || '-'}</p>
                          </td>

                          <td className="py-3 px-4 font-medium text-slate-800">
                            {t.role}
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {t.status === 'GTY' ? 'Guru Tetap (GTY)' : t.status === 'PTY' ? 'Pegawai Tetap (PTY)' : t.status === 'GTTY' ? 'Guru Tidak Tetap (GTTY)' : 'Pegawai Tidak Tetap (PTTY)'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-800">{t.bankName}</p>
                            <p className="font-mono text-[11px] text-blue-900">{t.accountNumber}</p>
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                            {formatRupiah(t.baseSalary)}
                          </td>

                          <td className="py-3 px-4 space-y-0.5">
                            <div className="flex items-center gap-1 font-mono text-emerald-700">
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>{t.phone}</span>
                            </div>
                            {t.email && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[140px]">{t.email}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenAddPayroll(t.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-md shadow-2xs"
                                title="Buat Penggajian untuk Guru Ini"
                              >
                                <Banknote className="w-3 h-3" />
                                Gaji
                              </button>

                              <button
                                onClick={() => handleOpenEditTeacher(t)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                                title="Ubah Nama dan Data Guru"
                              >
                                <Edit className="w-3 h-3 text-blue-700" />
                                Edit
                              </button>

                              <button
                                onClick={() => {
                                  const relatedSlipsCount = payrolls.filter((p) => p.teacherId === t.id).length;
                                  const confirmMsg = relatedSlipsCount > 0
                                    ? `Hapus guru "${t.name}"?\nGuru ini memiliki ${relatedSlipsCount} data slip gaji. Lanjutkan menghapus guru?`
                                    : `Hapus data guru "${t.name}"?`;
                                  if (window.confirm(confirmMsg)) {
                                    deleteTeacher(t.id);
                                    setSelectedTeacherIds((prev) => prev.filter((id) => id !== t.id));
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                                title="Hapus Data Guru"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                                Hapus
                              </button>
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
        </div>
      )}

      {/* MODAL 1: INPUT / EDIT DATA GURU */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTeacherId ? 'Ubah / Edit Data & Nama Guru' : 'Tambah Guru / Tenaga Pendidik Baru'}
              </h3>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap Guru Beserta Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Yohanes Paulus Setiawan, S.Pd"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                {editingTeacherId && (
                  <p className="text-[11px] text-blue-700 mt-1">
                    Perubahan nama guru akan otomatis disinkronkan ke seluruh data slip gaji dan arsip payroll.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NIP / NIK Guru</label>
                  <input
                    type="text"
                    placeholder="Contoh: 198509122010011005"
                    value={tNip}
                    onChange={(e) => setTNip(e.target.value)}
                    className="w-full font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status Kepegawaian</label>
                  <select
                    value={tStatus}
                    onChange={(e) => setTStatus(e.target.value as EmploymentStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="GTY">GTY - Guru Tetap Yayasan</option>
                    <option value="PTY">PTY - Pegawai Tetap Yayasan</option>
                    <option value="GTTY">GTTY - Guru Tidak Tetap Yayasan</option>
                    <option value="PTTY">PTTY - Pegawai Tidak Tetap Yayasan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Jabatan / Tugas Mengajar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Guru Kelas 1A / Guru Pendidikan Agama Kristen"
                  value={tRole}
                  onChange={(e) => setTRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    No. WhatsApp Guru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08123456789"
                    value={tPhone}
                    onChange={(e) => setTPhone(e.target.value)}
                    className="w-full font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">Untuk kirim notifikasi slip gaji otomatis</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Guru</label>
                  <input
                    type="email"
                    placeholder="guru@bopkri.sch.id"
                    value={tEmail}
                    onChange={(e) => setTEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bank Rekening</label>
                  <select
                    value={tBankName}
                    onChange={(e) => setTBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="BPD DIY">BPD DIY</option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BRI">BRI</option>
                    <option value="BNI">BNI</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    placeholder="Nomor rekening transfer"
                    value={tAccountNumber}
                    onChange={(e) => setTAccountNumber(e.target.value)}
                    className="w-full font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div>
                  <label className="font-semibold text-blue-900 block mb-1">
                    Username Login Portal
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: benisiusbasuki24"
                    value={tUsername}
                    onChange={(e) => setTUsername(e.target.value)}
                    className="w-full font-mono text-xs px-3 py-2 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-[10px] text-blue-700">Untuk login portal slip & upload ajar</span>
                </div>
                <div>
                  <label className="font-semibold text-blue-900 block mb-1">
                    Kata Sandi / PIN
                  </label>
                  <input
                    type="text"
                    placeholder="Default: 123"
                    value={tPassword}
                    onChange={(e) => setTPassword(e.target.value)}
                    className="w-full font-mono text-xs px-3 py-2 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-[10px] text-blue-700">Bisa diubah sewaktu-waktu</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Gaji Pokok Standar (Rp)
                </label>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  value={tBaseSalary}
                  onChange={(e) => setTBaseSalary(Number(e.target.value))}
                  className="w-full font-mono font-bold text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs"
                >
                  {editingTeacherId ? 'Simpan Perubahan' : 'Simpan Data Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BUAT PENGGAJIAN & SLIP BARU */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Prosedur Penggajian & Penerbitan Slip Gaji
              </h3>
              <button
                onClick={() => setIsPayrollModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayroll} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      Pilih Guru / Karyawan <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPayrollModalOpen(false);
                        handleOpenAddTeacher();
                      }}
                      className="text-[11px] font-semibold text-blue-700 hover:underline"
                    >
                      + Tambah Guru Baru
                    </button>
                  </div>
                  <select
                    value={pTeacherId}
                    onChange={(e) => handleTeacherChangeInPayrollModal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role})
                      </option>
                    ))}
                  </select>
                  {pTeacherId && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Rek: {teachers.find((t) => t.id === pTeacherId)?.bankName} - {teachers.find((t) => t.id === pTeacherId)?.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const curTeacher = teachers.find((t) => t.id === pTeacherId);
                          if (curTeacher) {
                            setIsPayrollModalOpen(false);
                            handleOpenEditTeacher(curTeacher);
                          }
                        }}
                        className="text-blue-700 hover:underline font-semibold"
                      >
                        Edit Nama / Profil Guru
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bulan & Periode Penggajian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Oktober 2026"
                    value={pPeriod}
                    onChange={(e) => setPPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Gaji Pokok (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={pBaseSalary}
                  onChange={(e) => setPBaseSalary(Number(e.target.value))}
                  className="w-full font-mono font-bold text-sm px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Rincian Tunjangan */}
              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                <span className="font-bold text-blue-900 uppercase text-[11px] block">
                  Komponen Tunjangan (Penghasilan Tambahan)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-0.5">Tunj. Jabatan / Wali Kelas</label>
                    <input
                      type="number"
                      value={pPositionAllowance}
                      onChange={(e) => setPPositionAllowance(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Tunj. Jam Mengajar</label>
                    <input
                      type="number"
                      value={pTeachingAllowance}
                      onChange={(e) => setPTeachingAllowance(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Tunj. Kesejahteraan & Makan</label>
                    <input
                      type="number"
                      value={pWelfareAllowance}
                      onChange={(e) => setPWelfareAllowance(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Subsidi BPJS</label>
                    <input
                      type="number"
                      value={pBpjsAllowance}
                      onChange={(e) => setPBpjsAllowance(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Tunj. Ekstrakurikuler/Lain</label>
                    <input
                      type="number"
                      value={pOtherAllowance}
                      onChange={(e) => setPOtherAllowance(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Rincian Potongan */}
              <div className="p-3.5 bg-red-50/50 border border-red-200 rounded-xl space-y-3">
                <span className="font-bold text-red-900 uppercase text-[11px] block">
                  Komponen Potongan
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-0.5">Koperasi BOPKRI</label>
                    <input
                      type="number"
                      value={pCoopDeduction}
                      onChange={(e) => setPCoopDeduction(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Iuran BPJS</label>
                    <input
                      type="number"
                      value={pBpjsDeduction}
                      onChange={(e) => setPBpjsDeduction(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">PPh 21 (Pajak)</label>
                    <input
                      type="number"
                      value={pTaxDeduction}
                      onChange={(e) => setPTaxDeduction(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Pinjaman / Kasbon</label>
                    <input
                      type="number"
                      value={pLoanDeduction}
                      onChange={(e) => setPLoanDeduction(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Potongan Lain</label>
                    <input
                      type="number"
                      value={pOtherDeduction}
                      onChange={(e) => setPOtherDeduction(Number(e.target.value))}
                      className="w-full font-mono px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Catatan honor lembur, rincian ekskul, atau jam tambahan..."
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Total Take Home Pay Preview Box */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 uppercase block">Gaji Bersih Diterima (Take Home Pay)</span>
                  <span className="text-[11px] text-slate-500 italic">{terbilang(curNet)}</span>
                </div>
                <span className="text-xl font-mono font-extrabold text-blue-900 tabular-nums">
                  {formatRupiah(curNet)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPayrollModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  Simpan & Terbitkan Slip Gaji
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
