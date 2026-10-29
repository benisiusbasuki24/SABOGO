import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Teacher, StaffType, EmploymentStatus, Gender } from '../types';
import { formatRupiah, normalizeWhatsAppNumber } from '../utils/formatters';
import { BOPKRI_LOGO, OFFICIAL_STAMP, handleImageError } from '../assets/logo';
import {
  downloadStaffTemplate,
  exportStaffToExcel,
  parseExcelFile,
  parseStaffExcelRows,
} from '../utils/excelHelper';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Printer,
  Search,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

export const MasterStaffView: React.FC = () => {
  const {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    deleteTeachersBulk,
    purgeModuleData,
    setIsDataPurgeModalOpen,
    importTeachersFromExcel,
    staffInfo,
    currentUser,
    isSuperAdmin,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStaffType, setFilterStaffType] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [filterActive, setFilterActive] = useState<string>('SEMUA');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<any[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  // Filtered teachers list
  const filteredTeachers = teachers.filter((t) => {
    // Search matching
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      t.name.toLowerCase().includes(query) ||
      (t.nip && t.nip.toLowerCase().includes(query)) ||
      (t.nuptk && t.nuptk.toLowerCase().includes(query)) ||
      (t.ktpNumber && t.ktpNumber.toLowerCase().includes(query)) ||
      t.role.toLowerCase().includes(query) ||
      t.phone.toLowerCase().includes(query) ||
      (t.address && t.address.toLowerCase().includes(query));

    // Staff Type Filter
    const matchType =
      filterStaffType === 'SEMUA' ||
      (filterStaffType === 'GURU' && (!t.staffType || t.staffType === 'GURU')) ||
      (filterStaffType === 'TENAGA_KEPENDIDIKAN' && t.staffType === 'TENAGA_KEPENDIDIKAN');

    // Status Filter
    const matchStatus = filterStatus === 'SEMUA' || t.status === filterStatus;

    // Active Filter
    const matchActive =
      filterActive === 'SEMUA' ||
      (filterActive === 'AKTIF' && t.isActive) ||
      (filterActive === 'NONAKTIF' && !t.isActive);

    return matchSearch && matchType && matchStatus && matchActive;
  });

  // Summary statistics
  const totalStaff = teachers.length;
  const totalGuru = teachers.filter((t) => !t.staffType || t.staffType === 'GURU').length;
  const totalTendik = teachers.filter((t) => t.staffType === 'TENAGA_KEPENDIDIKAN').length;
  const totalGTY = teachers.filter((t) => t.status === 'GTY').length;
  const totalAktif = teachers.filter((t) => t.isActive).length;

  // Toggle selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTeachers.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSingle = (teacher: Teacher) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data "${teacher.name}"?`)) {
      deleteTeacher(teacher.id, false);
      setSelectedIds((prev) => prev.filter((id) => id !== teacher.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data guru/staf terpilih?`)) {
      deleteTeachersBulk(selectedIds, false);
      setSelectedIds([]);
    }
  };

  // Handle Excel Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);
    try {
      const rawData = await parseExcelFile(file);
      if (!rawData || rawData.length === 0) {
        setUploadError('File Excel kosong atau tidak memiliki data yang valid.');
        return;
      }
      const parsedStaff = parseStaffExcelRows(rawData);
      if (parsedStaff.length === 0) {
        setUploadError('Tidak ditemukan baris data guru/staf yang sesuai kolom template.');
        return;
      }
      setPreviewRows(parsedStaff);
    } catch (err: any) {
      setUploadError(err.message || 'Gagal membaca file Excel.');
    }
  };

  const handleConfirmImport = () => {
    if (!previewRows || previewRows.length === 0) return;
    const count = importTeachersFromExcel(previewRows);
    setUploadSuccess(`Berhasil mengimpor & memperbarui ${count} data guru/staf.`);
    showToast('Data berhasil diunggah', 'success');
    setPreviewRows(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setUploadSuccess(null);
    }, 1500);
  };

  // Open Edit Modal
  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsFormModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setIsFormModalOpen(true);
  };

  // Open Biodata Detail & Print Modal
  const handleOpenDetail = (teacher: Teacher) => {
    setViewingTeacher(teacher);
    setIsDetailModalOpen(true);
  };

  const triggerDirectPrint = (teacher: Teacher) => {
    setViewingTeacher(teacher);
    setIsDetailModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs tracking-wider uppercase mb-1">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Master Data Kepegawaian</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-normal">SD BOPKRI Gondolayu</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Biodata Guru & Tenaga Kependidikan
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Pengelolaan biodata induk pendidik dan staf sesuai standar kepegawaian Dapodik & Yayasan BOPKRI. Mendukung import/export Excel, pencetakan berkas biodata langsung ke printer komputer, dan sinkronisasi penggajian.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => downloadStaffTemplate()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Unduh format template Excel untuk pengisian data massal"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Template</span>
          </button>

          <button
            onClick={() => exportStaffToExcel(teachers)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            title="Ekspor seluruh data guru dan staf ke file Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
            title="Upload data dari file Excel"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Excel</span>
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setIsDataPurgeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors"
                title="Buka Pusat Pengelolaan & Penghapusan Data Sistem"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Pusat Hapus Data</span>
              </button>
              {teachers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`⚠️ PERINGATAN ADMIN: Apakah Anda yakin ingin MENGHAPUS SEMUA ${teachers.length} data guru dan staf/pegawai?\nSeluruh master kepegawaian akan dikosongkan.`)) {
                      purgeModuleData('teachers');
                      setSelectedIds([]);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
                  title="Kosongkan Semua Data Guru & Pegawai"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Kosongkan Master Guru</span>
                </button>
              )}
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-xl shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Pegawai</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total SDM</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalStaff}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Guru & Tenaga Kependidikan</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 mb-1">
            <span className="text-[11px] font-semibold uppercase">Guru / Pendidik</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-950">{totalGuru}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Guru Kelas & Guru Mapel</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-teal-600 mb-1">
            <span className="text-[11px] font-semibold uppercase">Tenaga Kependidikan</span>
            <Briefcase className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-extrabold text-teal-950">{totalTendik}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Tata Usaha, Perpus, Sarpras</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-semibold uppercase">Guru Tetap (GTY)</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-950">{totalGTY}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Tetap Yayasan BOPKRI</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-semibold uppercase">Status Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900">{totalAktif}</div>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">100% Aktif Bertugas</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, NIP, NUPTK, NIK KTP, tugas, atau nomor WhatsApp..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter Jenis Pegawai */}
            <select
              value={filterStaffType}
              onChange={(e) => setFilterStaffType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="SEMUA">Semua Kategori Pegawai</option>
              <option value="GURU">Hanya Pendidik (Guru)</option>
              <option value="TENAGA_KEPENDIDIKAN">Hanya Tenaga Kependidikan (Staf)</option>
            </select>

            {/* Filter Status Kepegawaian */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="SEMUA">Semua Status Kepegawaian</option>
              <option value="GTY">GTY (Guru Tetap Yayasan)</option>
              <option value="PTY">PTY (Pegawai Tetap Yayasan)</option>
              <option value="GTTY">GTTY (Guru Tidak Tetap)</option>
              <option value="PTTY">PTTY (Pegawai Tidak Tetap)</option>
              <option value="HONORER">Honorer Sekolah</option>
              <option value="PNS_DPK">PNS DPK</option>
            </select>

            {/* Filter Keaktifan */}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            >
              <option value="SEMUA">Semua Status Aktif</option>
              <option value="AKTIF">Hanya Aktif</option>
              <option value="NONAKTIF">Non-Aktif / Cuti</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs">
            <span className="font-semibold text-indigo-900">
              {selectedIds.length} pegawai terpilih
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-600 hover:text-slate-900 px-2 py-1"
              >
                Batalkan Pilihan
              </button>
              {isAdmin && (
                <button
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Staff Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredTeachers.length > 0 &&
                      selectedIds.length === filteredTeachers.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Nama Lengkap & NIK</th>
                <th className="py-3 px-4">NIP / NUPTK</th>
                <th className="py-3 px-4">Tugas & Kategori</th>
                <th className="py-3 px-4">Status & Pendidikan</th>
                <th className="py-3 px-4">Kontak & Domisili</th>
                <th className="py-3 px-4">Rekening & Gaji</th>
                <th className="py-3 px-4 text-center">Keaktifan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <User className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada data guru atau staf ditemukan.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter.</p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => {
                  const isSelected = selectedIds.includes(t.id);
                  const isGuru = !t.staffType || t.staffType === 'GURU';

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(t.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Name & NIK */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            t.gender === 'P'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}>
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 hover:text-indigo-900 cursor-pointer" onClick={() => handleOpenDetail(t)}>
                              {t.name}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <span>NIK: {t.ktpNumber || '-'}</span>
                              <span>·</span>
                              <span>{t.gender === 'P' ? 'Perempuan' : 'Laki-Laki'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NIP & NUPTK */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 font-semibold">{t.nip || '-'}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {t.nuptk ? `NUPTK: ${t.nuptk}` : 'Belum NUPTK'}
                        </div>
                      </td>

                      {/* Role & Staff Type */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{t.role}</div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isGuru
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}>
                            {isGuru ? 'Guru' : 'Tenaga Kependidikan'}
                          </span>
                        </div>
                      </td>

                      {/* Status & Last Education */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'GTY' || t.status === 'PTY'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {t.lastEducation || 'S1'} {t.major ? `(${t.major})` : ''}
                        </div>
                      </td>

                      {/* Contact & Address */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span className="font-mono">{t.phone}</span>
                          <a
                            href={`https://wa.me/${normalizeWhatsAppNumber(t.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                            title="Kirim pesan WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]" title={t.address || t.email}>
                          {t.address || t.email}
                        </div>
                      </td>

                      {/* Bank & Salary */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {formatRupiah(t.baseSalary)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {t.bankName} · {t.accountNumber}
                        </div>
                      </td>

                      {/* Status Aktif */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {t.isActive ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(t)}
                            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Lihat Rincian Biodata Kepegawaian"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => triggerDirectPrint(t)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Cetak Berkas Biodata ke Printer Komputer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(t)}
                                className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Biodata Lengkap"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteSingle(t)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Data Pegawai"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
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
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Menampilkan {filteredTeachers.length} dari {teachers.length} guru dan pegawai</span>
          <span className="text-[11px] text-slate-400">SD BOPKRI Gondolayu · Data Sinkron Penggajian</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FORM TAMBAH / EDIT BIODATA GURU & STAFF                          */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <StaffFormModal
          teacher={editingTeacher}
          onClose={() => setIsFormModalOpen(false)}
          onSave={(data) => {
            if (editingTeacher) {
              updateTeacher(editingTeacher.id, data);
            } else {
              addTeacher(data as Omit<Teacher, 'id' | 'createdAt'>);
            }
            setIsFormModalOpen(false);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DETAIL BIODATA & CETAK DOKUMEN KE PRINTER KOMPUTER               */}
      {/* ========================================================================= */}
      {isDetailModalOpen && viewingTeacher && (
        <StaffBiodataDetailModal
          teacher={viewingTeacher}
          staffInfo={staffInfo}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={() => {
            setIsDetailModalOpen(false);
            handleOpenEdit(viewingTeacher);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: UPLOAD FILE EXCEL GURU & PEGAWAI                                 */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Upload Master Data Guru & Pegawai</h3>
                  <p className="text-xs text-slate-500">Impor massal data biodata menggunakan file Excel (.xlsx / .xls)</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* Steps & Guidelines */}
            <div className="space-y-3 mb-5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">Petunjuk Pengunggahan:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Gunakan format template resmi agar susunan kolom sesuai.</li>
                <li>Kolom penting: <strong>Nama_Lengkap, NIP, Jabatan_Tugas, Status_Kepegawaian, No_WhatsApp, Bank, No_Rekening, Gaji_Pokok</strong>.</li>
                <li>Jika data NIP atau NUPTK sudah ada, sistem akan otomatis memperbarui biodata yang bersangkutan.</li>
              </ol>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => downloadStaffTemplate()}
                  className="inline-flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Contoh Template Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* File Dropzone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="excel-staff-upload"
              />
              <label htmlFor="excel-staff-upload" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">
                  Klik untuk memilih file Excel dari komputer Anda
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Mendukung format .xlsx, .xls, atau .csv</p>
              </label>
            </div>

            {/* Preview Section */}
            {previewRows && (
              <div className="mt-4 border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-slate-800">
                    Pratinjau Data ({previewRows.length} baris terbaca):
                  </span>
                </div>
                <div className="space-y-1.5">
                  {previewRows.slice(0, 5).map((r, i) => (
                    <div key={i} className="text-[11px] bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{r.name}</span>
                      <span className="text-slate-500">{r.role} ({r.status})</span>
                    </div>
                  ))}
                  {previewRows.length > 5 && (
                    <p className="text-[10px] text-slate-400 text-center pt-1">
                      ...dan {previewRows.length - 5} guru/staf lainnya
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!previewRows || previewRows.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
              >
                Impor Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SUBCOMPONENT: MODAL EDIT / TAMBAH BIODATA GURU & PEGAWAI
// =============================================================================
interface StaffFormModalProps {
  teacher: Teacher | null;
  onClose: () => void;
  onSave: (data: Partial<Teacher>) => void;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({ teacher, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'identitas' | 'kepegawaian' | 'pendidikan' | 'rekening'>('identitas');

  // Form Fields State
  const [name, setName] = useState(teacher?.name || '');
  const [nip, setNip] = useState(teacher?.nip || '');
  const [nuptk, setNuptk] = useState(teacher?.nuptk || '');
  const [ktpNumber, setKtpNumber] = useState(teacher?.ktpNumber || '');
  const [staffType, setStaffType] = useState<StaffType>(teacher?.staffType || 'GURU');
  const [role, setRole] = useState(teacher?.role || '');
  const [status, setStatus] = useState<EmploymentStatus>(teacher?.status || 'GTY');
  const [gender, setGender] = useState<Gender>(teacher?.gender || 'L');
  const [birthPlace, setBirthPlace] = useState(teacher?.birthPlace || 'Yogyakarta');
  const [birthDate, setBirthDate] = useState(teacher?.birthDate || '1985-01-01');
  const [religion, setReligion] = useState(teacher?.religion || 'Kristen Protestan');
  const [maritalStatus, setMaritalStatus] = useState(teacher?.maritalStatus || 'Kawin');
  const [lastEducation, setLastEducation] = useState(teacher?.lastEducation || 'S1');
  const [major, setMajor] = useState(teacher?.major || '');
  const [tmtWorking, setTmtWorking] = useState(teacher?.tmtWorking || '2015-01-01');
  const [address, setAddress] = useState(teacher?.address || '');
  const [phone, setPhone] = useState(teacher?.phone || '');
  const [email, setEmail] = useState(teacher?.email || '');
  const [bankName, setBankName] = useState(teacher?.bankName || 'BPD DIY');
  const [accountNumber, setAccountNumber] = useState(teacher?.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(teacher?.accountHolder || teacher?.name || '');
  const [baseSalary, setBaseSalary] = useState<number>(teacher?.baseSalary || 3500000);
  const [isActive, setIsActive] = useState<boolean>(teacher?.isActive !== false);
  const [username, setUsername] = useState(teacher?.username || '');
  const [password, setPassword] = useState(teacher?.password || '123');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }
    if (!role.trim()) {
      setFormError('Jabatan/Tugas wajib diisi.');
      return;
    }

    onSave({
      name: name.trim(),
      nip: nip.trim(),
      nuptk: nuptk.trim(),
      ktpNumber: ktpNumber.trim(),
      staffType,
      role: role.trim(),
      status,
      gender,
      birthPlace: birthPlace.trim(),
      birthDate,
      religion,
      maritalStatus,
      lastEducation: lastEducation.trim(),
      major: major.trim(),
      tmtWorking,
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      bankName,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim() || name.trim(),
      baseSalary: Number(baseSalary) || 0,
      isActive,
      username: username.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '.'),
      password,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {teacher ? 'Edit Biodata Pegawai / Guru' : 'Tambah Guru & Pegawai Baru'}
              </h3>
              <p className="text-xs text-slate-500">Rincian biodata kepegawaian resmi SD BOPKRI Gondolayu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-4 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('identitas')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'identitas'
                ? 'border-indigo-900 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Identitas Pokok & Pribadi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kepegawaian')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'kepegawaian'
                ? 'border-indigo-900 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Kepegawaian & Penugasan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pendidikan')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'pendidikan'
                ? 'border-indigo-900 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Pendidikan & Domisili
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rekening')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'rekening'
                ? 'border-indigo-900 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Penggajian & Akun Login
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {activeTab === 'identitas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap (beserta Gelar Akademik) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: FX. Suhari Irawan, S.E atau Clara Shinta Dewi, S.Pd"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIK / No. KTP (16 Digit)</label>
                <input
                  type="text"
                  maxLength={16}
                  value={ktpNumber}
                  onChange={(e) => setKtpNumber(e.target.value)}
                  placeholder="347101..."
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Yogyakarta / Sleman / Bantul"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agama</label>
                <select
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Kristen Protestan">Kristen Protestan</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Islam">Islam</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Perkawinan</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Kawin">Kawin</option>
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'kepegawaian' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Pegawai</label>
                <select
                  value={staffType}
                  onChange={(e) => setStaffType(e.target.value as StaffType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="GURU">Pendidik (Guru)</option>
                  <option value="TENAGA_KEPENDIDIKAN">Tenaga Kependidikan (Staf TU / Kasir / Sarpras)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                  <option value="PTY">PTY (Pegawai Tetap Yayasan)</option>
                  <option value="GTTY">GTTY (Guru Tidak Tetap Yayasan)</option>
                  <option value="PTTY">PTTY (Pegawai Tidak Tetap Yayasan)</option>
                  <option value="HONORER">Honorer Sekolah</option>
                  <option value="PNS_DPK">PNS DPK</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Jabatan / Tugas Utama *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contoh: Guru Kelas 1A, Guru PAK, Kasir & Bendahara, Pustakawan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP / Nomor Induk Pegawai</label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="198203..."
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NUPTK (16 Digit)</label>
                <input
                  type="text"
                  value={nuptk}
                  onChange={(e) => setNuptk(e.target.value)}
                  placeholder="654776..."
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">TMT Terhitung Mulai Bekerja</label>
                <input
                  type="date"
                  value={tmtWorking}
                  onChange={(e) => setTmtWorking(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Keaktifan</label>
                <select
                  value={isActive ? 'AKTIF' : 'NONAKTIF'}
                  onChange={(e) => setIsActive(e.target.value === 'AKTIF')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="AKTIF">Aktif Bertugas</option>
                  <option value="NONAKTIF">Non-Aktif / Cuti Panjang</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'pendidikan' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
                <input
                  type="text"
                  value={lastEducation}
                  onChange={(e) => setLastEducation(e.target.value)}
                  placeholder="S1 PGSD / S1 PAK / S2 Pendidikan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program Studi / Jurusan</label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Pendidikan Guru Sekolah Dasar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081228491823"
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Resmi / Belajar.id</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@guru.sd.belajar.id"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal Lengkap</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. ..., Kelurahan ..., Kecamatan ..., Kota Yogyakarta"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'rekening' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Penyalur Gaji</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="BPD DIY">BPD DIY</option>
                  <option value="BCA">BCA</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">BRI</option>
                  <option value="BNI">BNI</option>
                  <option value="BSI">BSI</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening Bank</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="00123984..."
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Sesuai buku tabungan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gaji Pokok Default (Rp)</label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  step={50000}
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                <p className="font-semibold text-slate-800 mb-2">Akun Login Portal Mandiri Guru / Staf</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1">Username Login</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username.guru"
                      className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Password / PIN</label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-6">
            <div className="text-[11px] text-slate-400">
              * Pastikan informasi data kepegawaian telah sesuai dengan dokumen fisik
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-xl shadow-xs transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// SUBCOMPONENT: MODAL DETAIL BIODATA & CETAK DOKUMEN KE PRINTER KOMPUTER
// =============================================================================
interface StaffBiodataDetailModalProps {
  teacher: Teacher;
  staffInfo: any;
  onClose: () => void;
  onEdit: () => void;
}

const StaffBiodataDetailModal: React.FC<StaffBiodataDetailModalProps> = ({
  teacher,
  staffInfo,
  onClose,
  onEdit,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        {/* Top Controls Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Berkas Biodata Kepegawaian</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-500">{teacher.nip || teacher.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
              title="Arahkan langsung ke printer fisik yang terpasang pada komputer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak ke Printer Komputer</span>
            </button>

            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="printable-area p-8 sm:p-10 print:p-0 bg-white text-slate-900 text-xs">
          {/* KOP SURAT SEKOLAH */}
          <div className="flex items-center gap-5 border-b-2 border-slate-900 pb-4 mb-6">
            <img
              src={BOPKRI_LOGO}
              onError={handleImageError}
              alt="Logo BOPKRI"
              className="w-20 h-20 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 text-center">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-700">
                {staffInfo.foundationName || 'YAYASAN BOPKRI D.I. YOGYAKARTA'}
              </p>
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                {staffInfo.schoolName || 'SD BOPKRI GONDOLAYU'}
              </h1>
              <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mt-0.5">
                "{staffInfo.tagline || 'Cerdas Berkarakter'}"
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                {staffInfo.address || 'Jl. Jendral Sudirman No. 24, Gowongan, Jetis, Yogyakarta, 55232'}
              </p>
              <p className="text-[10px] text-slate-500">
                Telp: {staffInfo.phone || '(0274) 523134'} · Website: {staffInfo.website || 'www.sdbopkrigondolayu.sch.id'} · Email: {staffInfo.email || 'keuangan.sdgondolayu@bopkri.sch.id'}
              </p>
            </div>
          </div>

          {/* JUDUL BERKAS */}
          <div className="text-center mb-6">
            <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900 underline underline-offset-4 decoration-slate-400">
              LEMBAR RINCIAN BIODATA KEPEGAWAIAN
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Nomor Berkas: BPK-BD/{new Date().getFullYear()}/{teacher.nip || teacher.id}
            </p>
          </div>

          {/* TABLE BIODATA */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-6">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-300">
              I. IDENTITAS PRIBADI & KEPENDUDUKAN
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="w-56 py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Nama Lengkap & Gelar</td>
                  <td className="py-2 px-4 font-bold text-slate-900">: {teacher.name}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">NIK / Nomor KTP</td>
                  <td className="py-2 px-4 font-mono">: {teacher.ktpNumber || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Jenis Kelamin</td>
                  <td className="py-2 px-4">: {teacher.gender === 'P' ? 'Perempuan' : 'Laki-Laki'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Tempat, Tanggal Lahir</td>
                  <td className="py-2 px-4">: {teacher.birthPlace || 'Yogyakarta'}, {teacher.birthDate || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Agama</td>
                  <td className="py-2 px-4">: {teacher.religion || 'Kristen Protestan'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Status Pernikahan</td>
                  <td className="py-2 px-4">: {teacher.maritalStatus || 'Kawin'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Alamat Tempat Tinggal</td>
                  <td className="py-2 px-4">: {teacher.address || '-'}</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-xs uppercase tracking-wider border-t border-b border-slate-300">
              II. STATUS KEPEGAWAIAN & PENUGASAN
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="w-56 py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Nomor Induk Pegawai (NIP)</td>
                  <td className="py-2 px-4 font-mono font-bold">: {teacher.nip || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">NUPTK</td>
                  <td className="py-2 px-4 font-mono">: {teacher.nuptk || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Jenis Tenaga Kerja</td>
                  <td className="py-2 px-4">: {teacher.staffType === 'TENAGA_KEPENDIDIKAN' ? 'Tenaga Kependidikan' : 'Tenaga Pendidik (Guru)'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Jabatan / Tugas Utama</td>
                  <td className="py-2 px-4 font-bold text-slate-900">: {teacher.role}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Status Kepegawaian</td>
                  <td className="py-2 px-4 font-semibold">: {teacher.status} (Yayasan BOPKRI D.I. Yogyakarta)</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">TMT Mulai Bekerja</td>
                  <td className="py-2 px-4">: {teacher.tmtWorking || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Status Keaktifan</td>
                  <td className="py-2 px-4 font-bold text-emerald-700">: {teacher.isActive ? 'AKTIF BERTUGAS' : 'NON-AKTIF'}</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-xs uppercase tracking-wider border-t border-b border-slate-300">
              III. PENDIDIKAN, KONTAK & REKENING PENYALURAN GAJI
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="w-56 py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Pendidikan Terakhir / Jurusan</td>
                  <td className="py-2 px-4">: {teacher.lastEducation || 'S1'} {teacher.major ? `(${teacher.major})` : ''}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Nomor WhatsApp / HP</td>
                  <td className="py-2 px-4 font-mono font-semibold">: {teacher.phone}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Alamat Email</td>
                  <td className="py-2 px-4 font-mono">: {teacher.email}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Bank Penyalur & Rekening</td>
                  <td className="py-2 px-4 font-mono font-semibold">: {teacher.bankName} - {teacher.accountNumber} (a.n {teacher.accountHolder || teacher.name})</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold text-slate-600 bg-slate-50/50">Gaji Pokok Terdaftar</td>
                  <td className="py-2 px-4 font-mono font-bold text-slate-900">: {formatRupiah(teacher.baseSalary)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="grid grid-cols-2 gap-8 text-center pt-4">
            <div>
              <p className="text-slate-500 text-[11px]">Pegawai yang Bersangkutan,</p>
              <div className="h-20" />
              <p className="font-bold underline text-slate-900">{teacher.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP: {teacher.nip || '-'}</p>
            </div>

            <div className="relative">
              <p className="text-slate-500 text-[11px]">
                Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-slate-600 text-[11px] font-semibold">Kepala Sekolah SD BOPKRI Gondolayu,</p>

              {/* Stempel Resmi */}
              <div className="relative h-20 flex items-center justify-center">
                <img
                  src={OFFICIAL_STAMP || staffInfo.officialStampUrl || './cap_resmi_bopkri.jpg'}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = './cap_resmi_bopkri.jpg';
                    }
                  }}
                  alt="Cap Resmi BOPKRI"
                  className="w-20 h-20 object-contain opacity-80 select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              <p className="font-bold underline text-slate-900">{staffInfo.principal || 'FX. Suhari Irawan, S.E'}</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP: 197405122002121001</p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="no-print mt-8 p-3 bg-blue-50 border border-blue-200 rounded-xl text-center text-blue-900 text-[11px]">
            💡 <strong>Petunjuk Cetak:</strong> Klik tombol <strong>"Cetak ke Printer Komputer"</strong> di atas. Dialog printer komputer Anda akan terbuka untuk memilih printer fisik yang tersambung (Epson, Canon, HP, Brother, atau Simpan sebagai PDF).
          </div>
        </div>
      </div>
    </div>
  );
};
