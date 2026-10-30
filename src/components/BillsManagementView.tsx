import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bill, BillCategory, EXTRACURRICULAR_OPTIONS, ExtracurricularName, PaymentStatus, normalizeGrade, SCHOOL_GRADES } from '../types';
import { downloadBillTemplate, parseExcelFile } from '../utils/excelHelper';
import { calculateOverdueDays, formatDateIndo, formatRupiah, normalizeWhatsAppNumber } from '../utils/formatters';
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  FileSpreadsheet,
  Filter,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

export const BillsManagementView: React.FC = () => {
  const {
    bills,
    students,
    billTypes,
    setActivePayingBill,
    deleteBill,
    deleteBillsBulk,
    purgeModuleData,
    setIsDataPurgeModalOpen,
    currentUser,
    addCustomBill,
    updateBill,
    importBillsFromExcel,
    staffInfo,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MENUNGGAK' | 'BELUM_BAYAR' | 'LUNAS'>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('Semua Kelas');
  const [typeFilter, setTypeFilter] = useState<string>('Semua');
  const [search, setSearch] = useState<string>('');

  // Multi-selection for bulk actions
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);

  // Individual Bill Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedBillTypeId, setSelectedBillTypeId] = useState<string>('');
  const [period, setPeriod] = useState<string>('Oktober 2026');
  const [amount, setAmount] = useState<number>(350000);
  const [dueDate, setDueDate] = useState<string>('2026-10-10');
  const [notes, setNotes] = useState<string>('');
  const [selectedEkskuls, setSelectedEkskuls] = useState<ExtracurricularName[]>([]);

  // Edit Existing Bill Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editPeriod, setEditPeriod] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editEkskuls, setEditEkskuls] = useState<ExtracurricularName[]>([]);

  // Excel Bills Upload States
  const [isUploadBillsModalOpen, setIsUploadBillsModalOpen] = useState<boolean>(false);
  const [parsedBills, setParsedBills] = useState<Omit<Bill, 'id' | 'createdAt' | 'paidAmount' | 'status'>[]>([]);
  const [uploadBillsFileName, setUploadBillsFileName] = useState<string>('');
  const [uploadBillsError, setUploadBillsError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter bills
  const filteredBills = bills.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (gradeFilter !== 'Semua Kelas' && b.studentGrade !== gradeFilter) return false;
    if (typeFilter !== 'Semua' && b.billTypeName !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = b.studentName.toLowerCase().includes(q);
      const matchNis = b.studentNis.includes(q);
      const matchParent = b.parentName.toLowerCase().includes(q);
      if (!matchName && !matchNis && !matchParent) return false;
    }
    return true;
  });

  const totalFilteredAmount = filteredBills.reduce((acc, b) => acc + b.amount, 0);
  const totalFilteredPaid = filteredBills.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalFilteredRemaining = totalFilteredAmount - totalFilteredPaid;

  const handleOpenAddModal = () => {
    const defaultStudent = students[0];
    const defaultBillType = billTypes[0];

    if (defaultStudent) {
      setSelectedStudentId(defaultStudent.id);
    }

    if (defaultBillType) {
      setSelectedBillTypeId(defaultBillType.id);
      if (defaultBillType.category === 'EKSTRAKURIKULER') {
        setSelectedEkskuls(defaultStudent?.extracurriculars ? [...defaultStudent.extracurriculars] : []);
        setAmount(defaultStudent?.extracurricularFee ?? defaultBillType.defaultAmount);
      } else if (defaultBillType.category === 'SPP') {
        setSelectedEkskuls([]);
        setAmount(defaultStudent?.customSppAmount ?? defaultBillType.defaultAmount);
      } else if (defaultBillType.category === 'KEGIATAN') {
        setSelectedEkskuls([]);
        setAmount(defaultStudent?.customActivityFee ?? defaultBillType.defaultAmount);
      } else {
        setSelectedEkskuls([]);
        setAmount(defaultBillType.defaultAmount);
      }
    }
    setIsAddModalOpen(true);
  };

  const handleStudentSelectChange = (stdId: string) => {
    setSelectedStudentId(stdId);
    const student = students.find((s) => s.id === stdId);
    const bt = billTypes.find((b) => b.id === selectedBillTypeId);
    if (!student || !bt) return;

    if (bt.category === 'EKSTRAKURIKULER') {
      setSelectedEkskuls(student.extracurriculars ? [...student.extracurriculars] : []);
      setAmount(student.extracurricularFee ?? bt.defaultAmount);
    } else if (bt.category === 'SPP') {
      setAmount(student.customSppAmount ?? bt.defaultAmount);
    } else if (bt.category === 'KEGIATAN') {
      setAmount(student.customActivityFee ?? bt.defaultAmount);
    }
  };

  const handleBillTypeSelectChange = (btId: string) => {
    setSelectedBillTypeId(btId);
    const bt = billTypes.find((b) => b.id === btId);
    const student = students.find((s) => s.id === selectedStudentId);
    if (!bt) return;

    if (bt.category === 'EKSTRAKURIKULER') {
      setSelectedEkskuls(student?.extracurriculars ? [...student.extracurriculars] : []);
      setAmount(student?.extracurricularFee ?? bt.defaultAmount);
    } else if (bt.category === 'SPP') {
      setSelectedEkskuls([]);
      setAmount(student?.customSppAmount ?? bt.defaultAmount);
    } else if (bt.category === 'KEGIATAN') {
      setSelectedEkskuls([]);
      setAmount(student?.customActivityFee ?? bt.defaultAmount);
    } else {
      setSelectedEkskuls([]);
      setAmount(bt.defaultAmount);
    }
  };

  const handleToggleAddEkskul = (opt: ExtracurricularName) => {
    if (selectedEkskuls.includes(opt)) {
      setSelectedEkskuls(selectedEkskuls.filter((e) => e !== opt));
    } else {
      if (selectedEkskuls.length >= 2) {
        alert('Maksimal 2 pilihan ekskul! Batalkan salah satu pilihan terlebih dahulu.');
        return;
      }
      setSelectedEkskuls([...selectedEkskuls, opt]);
    }
  };

  const handleToggleEditEkskul = (opt: ExtracurricularName) => {
    if (editEkskuls.includes(opt)) {
      setEditEkskuls(editEkskuls.filter((e) => e !== opt));
    } else {
      if (editEkskuls.length >= 2) {
        alert('Maksimal 2 pilihan ekskul! Batalkan salah satu pilihan terlebih dahulu.');
        return;
      }
      setEditEkskuls([...editEkskuls, opt]);
    }
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === selectedStudentId);
    const bt = billTypes.find((b) => b.id === selectedBillTypeId);
    if (!student || !bt) return;

    const noteText =
      bt.category === 'EKSTRAKURIKULER' && selectedEkskuls.length > 0
        ? `Pilihan ekskul: ${selectedEkskuls.join(', ')}${notes ? ` · ${notes}` : ''}`
        : notes;

    addCustomBill({
      billTypeId: bt.id,
      billTypeName: bt.name,
      category: bt.category,
      studentId: student.id,
      studentName: student.name,
      studentNis: student.nis,
      studentGrade: student.grade,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      period,
      amount,
      dueDate,
      extracurriculars: bt.category === 'EKSTRAKURIKULER' ? selectedEkskuls : undefined,
      notes: noteText,
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (b: Bill) => {
    setEditingBill(b);
    setEditAmount(b.amount);
    setEditPeriod(b.period);
    setEditDueDate(b.dueDate);
    setEditNotes(b.notes || '');
    setEditEkskuls(
      b.extracurriculars && b.extracurriculars.length > 0
        ? (b.extracurriculars as ExtracurricularName[])
        : []
    );
    setIsEditModalOpen(true);
  };

  const handleSaveEditBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;

    updateBill(editingBill.id, {
      amount: editAmount,
      period: editPeriod,
      dueDate: editDueDate,
      notes: editNotes,
      extracurriculars:
        editingBill.category === 'EKSTRAKURIKULER' ? editEkskuls : editingBill.extracurriculars,
    });

    setIsEditModalOpen(false);
    setEditingBill(null);
  };

  const handleSendReminderWA = (b: Bill) => {
    const phone = normalizeWhatsAppNumber(b.parentPhone);
    const daysOverdue = calculateOverdueDays(b.dueDate);
    const msg =
      `*PEMBERITAHUAN TAGIHAN SD BOPKRI GONDOLAYU*\n\n` +
      `Yth. Bapak/Ibu *${b.parentName}*,\n` +
      `Orang tua dari ananda *${b.studentName}* (${b.studentGrade} - NIS: ${b.studentNis}),\n\n` +
      `Kami menginformasikan tagihan *${b.billTypeName}* periode *${b.period}* sebesar *${formatRupiah(b.amount - b.paidAmount)}*` +
      (b.status === 'MENUNGGAK' ? ` telah melewati jatuh tempo (${b.dueDate}, terlambat ${daysOverdue} hari).` : ` jatuh tempo pada ${b.dueDate}.`) +
      `\n\nPembayaran dapat dilakukan di Loket Kasir SD BOPKRI (Ibu ${staffInfo.cashier}) atau via Virtual Account Mandiri: *88012${b.studentNis}*.\n\n` +
      `Terima kasih. Tuhan Yesus Memberkati.\n` +
      `_Bendahara: ${staffInfo.treasurer} · Kepala Sekolah: ${staffInfo.principal}_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleToggleSelectAll = () => {
    if (selectedBillIds.length === filteredBills.length && filteredBills.length > 0) {
      setSelectedBillIds([]);
    } else {
      setSelectedBillIds(filteredBills.map((b) => b.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedBillIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedBillIds.length === 0) return;
    const count = selectedBillIds.length;
    if (window.confirm(`Yakin ingin menghapus ${count} data tagihan yang dipilih secara permanen?`)) {
      deleteBillsBulk(selectedBillIds);
      setSelectedBillIds([]);
    }
  };

  const allGrades = ['Semua Kelas', ...SCHOOL_GRADES];

  const handleBillsFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadBillsFileName(file.name);
    setUploadBillsError(null);

    try {
      const rows = await parseExcelFile<any>(file);
      if (!rows || rows.length === 0) {
        setUploadBillsError('File Excel kosong atau tidak memiliki baris data.');
        return;
      }

      const formatted: Omit<Bill, 'id' | 'createdAt' | 'paidAmount' | 'status'>[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const nis = String(row.NIS || row.nis || row['No Induk'] || '').trim();
        const billTypeName = String(row.Jenis_Tagihan || row['Jenis Tagihan'] || row.Tagihan || row.Nama_Tagihan || 'SPP Bulanan').trim();
        const period = String(row.Periode || row.periode || row.Bulan || 'November 2026').trim();
        const rawAmount = String(row.Nominal || row.nominal || row.Jumlah || row.Tarif || '350000').replace(/[^0-9]/g, '');
        const amount = Number(rawAmount) || 350000;
        const dueDate = String(row.Jatuh_Tempo || row['Jatuh Tempo'] || row.Tempo || '2026-11-10').trim();
        const notes = String(row.Keterangan || row.keterangan || row.Catatan || '').trim();

        if (nis) {
          // Find matching student
          const matchedStudent = students.find((s) => s.nis.trim() === nis);

          const studentName = matchedStudent
            ? matchedStudent.name
            : String(row.Nama_Siswa || row['Nama Siswa'] || `Siswa NIS ${nis}`).trim();
          const studentGrade = matchedStudent ? matchedStudent.grade : '1.1';
          const parentName = matchedStudent ? matchedStudent.parentName : 'Orang Tua Murid';
          const parentPhone = matchedStudent ? matchedStudent.parentPhone : '081200000000';
          const parentEmail = matchedStudent ? matchedStudent.parentEmail : '';

          // Determine category
          let category: BillCategory = 'LAINNYA';
          const lowerType = billTypeName.toLowerCase();
          if (lowerType.includes('spp')) category = 'SPP';
          else if (lowerType.includes('kegiatan')) category = 'KEGIATAN';
          else if (lowerType.includes('ekskul') || lowerType.includes('ekstrakurikuler')) category = 'EKSTRAKURIKULER';

          // Match billTypeId
          const matchedBt = billTypes.find((bt) => bt.name.toLowerCase() === lowerType);
          const billTypeId = matchedBt ? matchedBt.id : `bt-custom-${Date.now()}`;

          formatted.push({
            billTypeId,
            billTypeName,
            category,
            studentId: matchedStudent ? matchedStudent.id : `std-auto-${nis}`,
            studentName,
            studentNis: nis,
            studentGrade,
            parentName,
            parentPhone,
            parentEmail,
            period,
            amount,
            dueDate,
            notes,
          });
        }
      }

      if (formatted.length === 0) {
        setUploadBillsError('Tidak ditemukan baris yang memiliki kolom NIS. Mohon gunakan template.');
        return;
      }

      setParsedBills(formatted);
    } catch (err: any) {
      setUploadBillsError(err.message || 'Gagal memproses file Excel tagihan.');
    }
  };

  const handleExecuteBillsImport = () => {
    if (parsedBills.length === 0) return;
    const count = importBillsFromExcel(parsedBills);
    alert(`Berhasil mengimpor ${count} tagihan dari file Excel (tagihan yang sama sudah ada dilewati otomatis).`);
    setIsUploadBillsModalOpen(false);
    setParsedBills([]);
    setUploadBillsFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Pembukuan & Penagihan</span>
            <span aria-hidden="true">·</span>
            <span>SD BOPKRI Gondolayu</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tagihan & Status Tunggakan Siswa
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Pantau status SPP bulanan, uang kegiatan, dan iuran ekstrakurikuler dengan input manual maupun upload file Excel tagihan masal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setIsDataPurgeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                title="Buka Pusat Pengelolaan & Penghapusan Data Sistem"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Pusat Hapus Data</span>
              </button>
              {bills.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`⚠️ PERINGATAN ADMIN: Apakah Anda yakin ingin MENGHAPUS SEMUA ${bills.length} data tagihan siswa?\nSeluruh riwayat penagihan akan dikosongkan.`)) {
                      purgeModuleData('bills');
                      setSelectedBillIds([]);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                  title="Kosongkan Semua Tagihan"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Kosongkan Semua Tagihan</span>
                </button>
              )}
            </>
          )}

          {selectedBillIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              Hapus Terpilih ({selectedBillIds.length})
            </button>
          )}

          <button
            onClick={() => {
              setParsedBills([]);
              setUploadBillsFileName('');
              setUploadBillsError(null);
              setIsUploadBillsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            Upload Excel Tagihan
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Buat Tagihan Khusus Siswa
          </button>
        </div>
      </div>

      {/* Filter and Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({bills.length})
            </button>
            <button
              onClick={() => setStatusFilter('MENUNGGAK')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'MENUNGGAK'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-600 hover:text-red-700'
              }`}
            >
              Menunggak ({bills.filter((b) => b.status === 'MENUNGGAK').length})
            </button>
            <button
              onClick={() => setStatusFilter('BELUM_BAYAR')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'BELUM_BAYAR'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Belum Bayar ({bills.filter((b) => b.status === 'BELUM_BAYAR').length})
            </button>
            <button
              onClick={() => setStatusFilter('LUNAS')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'LUNAS'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Lunas ({bills.filter((b) => b.status === 'LUNAS').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari siswa, NIS, atau wali..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Secondary filters & numeric summary */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Kelas:</span>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-800"
              >
                {allGrades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Jenis:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-slate-300 rounded-md px-2 py-1 bg-white text-slate-800"
              >
                <option value="Semua">Semua Tagihan</option>
                {billTypes.map((bt) => (
                  <option key={bt.id} value={bt.name}>
                    {bt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>
              Total Nilai: <strong className="font-mono text-slate-900">{formatRupiah(totalFilteredAmount)}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Terbayar: <strong className="font-mono text-emerald-700">{formatRupiah(totalFilteredPaid)}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Sisa Piutang: <strong className="font-mono text-amber-700">{formatRupiah(totalFilteredRemaining)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua tagihan"
                    checked={filteredBills.length > 0 && selectedBillIds.length === filteredBills.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Siswa / NIS</th>
                <th className="py-3 px-4">Tagihan & Periode</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                <th className="py-3 px-4 text-center">Aksi Loket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada tagihan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => {
                  const remaining = b.amount - b.paidAmount;
                  const overdueDays = calculateOverdueDays(b.dueDate);
                  const isSelected = selectedBillIds.includes(b.id);

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Pilih tagihan ${b.billTypeName} ${b.studentName}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(b.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-600 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{b.studentName}</p>
                        <p className="text-[11px] text-slate-500">
                          {b.studentGrade} · NIS: <span className="font-mono">{b.studentNis}</span>
                        </p>
                        <p className="text-[10px] text-slate-400">Wali: {b.parentName}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{b.billTypeName}</p>
                        <p className="text-[11px] text-blue-800 font-medium">{b.period}</p>
                        {b.extracurriculars && b.extracurriculars.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {b.extracurriculars.map((e) => (
                              <span
                                key={e}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-200"
                              >
                                {e}
                              </span>
                            ))}
                          </div>
                        )}
                        {b.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">{b.notes}</p>}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {formatDateIndo(b.dueDate)}
                        {b.status === 'MENUNGGAK' && (
                          <p className="text-[10px] text-red-600 font-medium mt-0.5">
                            Telat {overdueDays} hari
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {b.status === 'LUNAS' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Lunas
                          </span>
                        )}
                        {b.status === 'MENUNGGAK' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            Menunggak
                          </span>
                        )}
                        {b.status === 'BELUM_BAYAR' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Belum Bayar
                          </span>
                        )}
                        {b.status === 'SEBAGIAN' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            Sebagian
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                        {formatRupiah(b.amount)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {remaining === 0 ? (
                          <span className="text-emerald-700">Rp 0 (Lunas)</span>
                        ) : (
                          <span className={b.status === 'MENUNGGAK' ? 'text-red-700' : 'text-slate-900'}>
                            {formatRupiah(remaining)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {remaining > 0 ? (
                            <button
                              onClick={() => setActivePayingBill(b)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-md transition-colors shadow-2xs"
                              title="Bayar di Loket Kasir"
                            >
                              <Banknote className="w-3 h-3" />
                              Bayar
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-medium">Selesai</span>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(b)}
                            className="p-1 text-slate-500 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit / Ubah Nominal Manual & Info Tagihan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {remaining > 0 && (
                            <button
                              onClick={() => handleSendReminderWA(b)}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Kirim Notifikasi WA"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              const confirmMsg =
                                b.paidAmount > 0
                                  ? `Tagihan ${b.billTypeName} (${b.studentName}) sudah terbayar ${formatRupiah(b.paidAmount)}. Yakin ingin menghapus tagihan ini secara permanen?`
                                  : `Hapus tagihan ${b.billTypeName} (${b.period}) untuk siswa ${b.studentName}?`;
                              if (window.confirm(confirmMsg)) {
                                deleteBill(b.id);
                                setSelectedBillIds((prev) => prev.filter((id) => id !== b.id));
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                            title="Hapus Tagihan"
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

      {/* Add Custom Bill Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Buat Tagihan Khusus Siswa
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Pilih Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelectChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade} · NIS: {s.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Pilih Jenis Tagihan <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBillTypeId}
                  onChange={(e) => handleBillTypeSelectChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {billTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.name} — Standar {formatRupiah(bt.defaultAmount)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Extracurricular Selector if category is EKSTRAKURIKULER */}
              {billTypes.find((bt) => bt.id === selectedBillTypeId)?.category === 'EKSTRAKURIKULER' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Pilih Kegiatan Ekstrakurikuler (Maksimal 2 Pilihan)
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {selectedEkskuls.length} / 2 Terpilih
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                    {EXTRACURRICULAR_OPTIONS.map((opt) => {
                      const isSelected = selectedEkskuls.includes(opt);
                      const isDisabled = !isSelected && selectedEkskuls.length >= 2;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleToggleAddEkskul(opt)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between border ${
                            isSelected
                              ? 'bg-blue-800 text-white border-blue-900 shadow-2xs'
                              : isDisabled
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                          }`}
                        >
                          <span className="truncate">{opt}</span>
                          {isSelected && <Check className="w-3 h-3 ml-1 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {selectedEkskuls.length >= 2 && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                      Maksimal 2 pilihan ekskul tercapai ({selectedEkskuls.join(', ')}).
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Periode Tagihan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Oktober 2026 / Semester Ganjil"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Nominal Tagihan (Rp) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-blue-700 font-semibold">Tulis Manual Bebas</span>
                  </div>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={10000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50 text-slate-900"
                  />
                </div>
              </div>

              {/* Quick preset helper buttons for SPP & Kegiatan */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                <span className="text-[10px] font-semibold text-slate-400">Preset Nominal:</span>
                <button
                  type="button"
                  onClick={() => setAmount(250000)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  250rb
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(300000)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  300rb
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(350000)}
                  className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold font-mono"
                >
                  350rb (SPP)
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(400000)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  400rb
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(1200000)}
                  className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold font-mono"
                >
                  1.2jt (Kegiatan)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Batas Waktu Jatuh Tempo <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Keringanan SPP / Beasiswa / Catatan orang tua..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs"
                >
                  Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {isEditModalOpen && editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ubah / Edit Tagihan Siswa (Input Nominal Bebas)
                </h3>
                <p className="text-xs text-slate-500">
                  {editingBill.studentName} ({editingBill.studentGrade} · NIS: {editingBill.studentNis})
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingBill(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBill} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Jenis Tagihan:</span>
                  <p className="font-bold text-slate-900">{editingBill.billTypeName}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Terbayar Saat Ini:</span>
                  <p className="font-bold text-emerald-700 font-mono">{formatRupiah(editingBill.paidAmount)}</p>
                </div>
              </div>

              {/* If Extracurricular, allow editing max 2 options */}
              {editingBill.category === 'EKSTRAKURIKULER' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Pilihan Ekstrakurikuler (Maksimal 2 Pilihan)
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {editEkskuls.length} / 2 Terpilih
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                    {EXTRACURRICULAR_OPTIONS.map((opt) => {
                      const isSelected = editEkskuls.includes(opt);
                      const isDisabled = !isSelected && editEkskuls.length >= 2;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleToggleEditEkskul(opt)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between border ${
                            isSelected
                              ? 'bg-blue-800 text-white border-blue-900 shadow-2xs'
                              : isDisabled
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                          }`}
                        >
                          <span className="truncate">{opt}</span>
                          {isSelected && <Check className="w-3 h-3 ml-1 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Periode Tagihan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPeriod}
                    onChange={(e) => setEditPeriod(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Nominal Tagihan (Rp) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-blue-700 font-semibold">Tulis Angka Bebas</span>
                  </div>
                  <input
                    type="number"
                    required
                    min={editingBill.paidAmount > 0 ? editingBill.paidAmount : 1000}
                    step={10000}
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-blue-50/40 text-blue-900"
                  />
                  {editingBill.paidAmount > 0 && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Minimal {formatRupiah(editingBill.paidAmount)} (sudah terbayar sebagian)
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Batas Waktu Jatuh Tempo <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan / Keterangan Tagihan
                </label>
                <input
                  type="text"
                  placeholder="Keringanan / Alasan perubahan nominal..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingBill(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload Excel Tagihan */}
      {isUploadBillsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Upload & Impor Tagihan Siswa dari File Excel
                </h3>
              </div>
              <button
                onClick={() => setIsUploadBillsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Instructions and Template Download */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-emerald-950">
                  <p className="font-bold">Gunakan Format Template Tagihan Resmi:</p>
                  <p className="text-slate-600 mt-0.5">
                    Kolom minimal: NIS, Jenis Tagihan, Periode, Nominal, dan Jatuh Tempo (YYYY-MM-DD). Data siswa akan dicocokkan otomatis via NIS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadBillTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  Unduh Template Tagihan (.xlsx)
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl p-8 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleBillsFileChange}
                  className="hidden"
                />
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  {uploadBillsFileName ? uploadBillsFileName : 'Klik atau seret file Excel Tagihan (.xlsx / .csv) ke sini'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendukung file Microsoft Excel (.xlsx, .xls) dan CSV
                </p>
              </div>

              {uploadBillsError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{uploadBillsError}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedBills.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Pratinjau Tagihan ({parsedBills.length} Tagihan · Total {formatRupiah(parsedBills.reduce((acc, b) => acc + b.amount, 0))})
                    </span>
                    <span className="text-emerald-700 font-medium">
                      ✓ Siap Ditagihkan
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                          <th className="py-2 px-3">NIS</th>
                          <th className="py-2 px-3">Nama Siswa</th>
                          <th className="py-2 px-3">Jenis Tagihan</th>
                          <th className="py-2 px-3">Periode</th>
                          <th className="py-2 px-3 text-right">Nominal</th>
                          <th className="py-2 px-3">Jatuh Tempo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {parsedBills.map((b, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-mono font-medium text-slate-800">{b.studentNis}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-900">{b.studentName}</td>
                            <td className="py-1.5 px-3 text-blue-900">{b.billTypeName}</td>
                            <td className="py-1.5 px-3 text-slate-600">{b.period}</td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                              {formatRupiah(b.amount)}
                            </td>
                            <td className="py-1.5 px-3 text-slate-500">{b.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadBillsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={parsedBills.length === 0}
                  onClick={handleExecuteBillsImport}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Impor {parsedBills.length > 0 ? `${parsedBills.length} Tagihan` : ''} Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
