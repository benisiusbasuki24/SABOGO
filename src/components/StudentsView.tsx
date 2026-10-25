import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { EXTRACURRICULAR_OPTIONS, ExtracurricularName, Student } from '../types';
import { downloadStudentTemplate, parseExcelFile } from '../utils/excelHelper';
import { formatRupiah, normalizeWhatsAppNumber } from '../utils/formatters';
import {
  AlertCircle,
  Check,
  CreditCard,
  Download,
  Edit,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

export const StudentsView: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteStudentsBulk,
    purgeModuleData,
    setIsDataPurgeModalOpen,
    currentUser,
    importStudentsFromExcel,
    bills,
  } = useApp();

  const isAdmin = currentUser?.role === 'ADMIN';

  const [search, setSearch] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('Semua Kelas');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Excel Upload States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [parsedStudents, setParsedStudents] = useState<Omit<Student, 'id' | 'createdAt'>[]>([]);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [nis, setNis] = useState<string>('');
  const [nisn, setNisn] = useState<string>('');
  const [grade, setGrade] = useState<string>('Kelas 1A');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [parentName, setParentName] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [parentEmail, setParentEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [vaNumber, setVaNumber] = useState<string>('');
  const [status, setStatus] = useState<'AKTIF' | 'NONAKTIF'>('AKTIF');

  // Extracurriculars (Max 2 choices) & Custom Fees
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularName[]>([]);
  const [extracurricularFee, setExtracurricularFee] = useState<number>(250000);
  const [customSppAmount, setCustomSppAmount] = useState<number>(350000);
  const [customActivityFee, setCustomActivityFee] = useState<number>(1200000);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setNis('');
    setNisn('');
    setGrade('Kelas 1A');
    setGender('L');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setAddress('');
    setVaNumber('');
    setStatus('AKTIF');
    setExtracurriculars([]);
    setExtracurricularFee(250000);
    setCustomSppAmount(350000);
    setCustomActivityFee(1200000);
  };

  const handleToggleEkskul = (item: ExtracurricularName) => {
    if (extracurriculars.includes(item)) {
      setExtracurriculars(extracurriculars.filter((e) => e !== item));
    } else {
      if (extracurriculars.length >= 2) {
        alert('Maksimal 2 pilihan ekskul! Silakan batalkan salah satu pilihan sebelum memilih ekskul lain.');
        return;
      }
      setExtracurriculars([...extracurriculars, item]);
    }
  };

  const handleOpenAdd = () => {
    resetForm();
    // Generate next NIS suggestion
    const nextNisNum = 260100 + students.length + 1;
    setNis(String(nextNisNum));
    setVaNumber(`88012${nextNisNum}`);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingId(s.id);
    setName(s.name);
    setNis(s.nis);
    setNisn(s.nisn);
    setGrade(s.grade);
    setGender(s.gender);
    setParentName(s.parentName);
    setParentPhone(s.parentPhone);
    setParentEmail(s.parentEmail);
    setAddress(s.address);
    setVaNumber(s.vaNumber);
    setStatus(s.status);
    setExtracurriculars(s.extracurriculars ? [...s.extracurriculars] : []);
    setExtracurricularFee(s.extracurricularFee ?? 250000);
    setCustomSppAmount(s.customSppAmount ?? 350000);
    setCustomActivityFee(s.customActivityFee ?? 1200000);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nis.trim() || !parentName.trim() || !parentPhone.trim()) {
      alert('Nama Siswa, NIS, Nama Orang Tua, dan No. HP WhatsApp wajib diisi');
      return;
    }

    const payload = {
      name,
      nis,
      nisn,
      grade,
      gender,
      parentName,
      parentPhone,
      parentEmail,
      address,
      vaNumber: vaNumber || `88012${nis}`,
      status,
      extracurriculars,
      extracurricularFee,
      customSppAmount,
      customActivityFee,
    };

    if (editingId) {
      updateStudent(editingId, payload);
    } else {
      addStudent(payload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const filteredStudents = students.filter((s) => {
    if (gradeFilter !== 'Semua Kelas' && s.grade !== gradeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchNis = s.nis.includes(q);
      const matchParent = s.parentName.toLowerCase().includes(q);
      const matchPhone = s.parentPhone.includes(q);
      if (!matchName && !matchNis && !matchParent && !matchPhone) return false;
    }
    return true;
  });

  const allGrades = [
    'Semua Kelas',
    'Kelas 1A',
    'Kelas 1B',
    'Kelas 2A',
    'Kelas 2B',
    'Kelas 3A',
    'Kelas 3B',
    'Kelas 4A',
    'Kelas 4B',
    'Kelas 5A',
    'Kelas 5B',
    'Kelas 6A',
    'Kelas 6B',
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadError(null);

    try {
      const rows = await parseExcelFile<any>(file);
      if (!rows || rows.length === 0) {
        setUploadError('File Excel kosong atau tidak memiliki baris data.');
        return;
      }

      // Map dynamic header names flexibly
      const formatted: Omit<Student, 'id' | 'createdAt'>[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const nis = String(row.NIS || row.nis || row['No Induk'] || row['Nomor Induk'] || '').trim();
        const name = String(row.Nama_Siswa || row['Nama Siswa'] || row.Nama || row.name || '').trim();
        const grade = String(row.Kelas || row.kelas || row.Grade || 'Kelas 1A').trim();
        const parentName = String(row.Nama_Orang_Tua || row['Nama Orang Tua'] || row['Orang Tua'] || row.Wali || '').trim();
        const parentPhone = String(row.No_WhatsApp_Orang_Tua || row['No WhatsApp'] || row['No HP'] || row.Telepon || row.WhatsApp || '').trim();

        if (nis && name) {
          const nisn = String(row.NISN || row.nisn || '').trim();
          const genderRaw = String(row.Jenis_Kelamin || row['Jenis Kelamin'] || row.JK || 'L').trim().toUpperCase();
          const gender: 'L' | 'P' = genderRaw.startsWith('P') ? 'P' : 'L';
          const parentEmail = String(row.Email_Orang_Tua || row['Email Orang Tua'] || row.Email || '').trim();
          const address = String(row.Alamat || row.alamat || '').trim();
          const vaNumber = String(row.Nomor_VA || row['Nomor VA'] || row.VA || `88012${nis}`).trim();

          formatted.push({
            nis,
            nisn,
            name,
            grade,
            gender,
            parentName: parentName || 'Orang Tua Murid',
            parentPhone: parentPhone || '081200000000',
            parentEmail,
            address,
            vaNumber,
            status: 'AKTIF',
          });
        }
      }

      if (formatted.length === 0) {
        setUploadError('Tidak ditemukan baris yang memiliki NIS dan Nama Siswa. Mohon pastikan judul kolom sesuai template.');
        return;
      }

      setParsedStudents(formatted);
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses file Excel.');
    }
  };

  const handleExecuteImport = () => {
    if (parsedStudents.length === 0) return;
    const count = importStudentsFromExcel(parsedStudents);
    alert(`Berhasil mengimpor ${count} data siswa dari file Excel (NIS yang sudah ada dilewati otomatis).`);
    setIsUploadModalOpen(false);
    setParsedStudents([]);
    setUploadFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Buku Induk & Kontak Orang Tua</span>
            <span aria-hidden="true">·</span>
            <span>SD BOPKRI Gondolayu</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Siswa & Kontak Orang Tua / Wali
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Input dan perbarui data profil siswa, nomor WhatsApp orang tua, email, dan nomor Virtual Account secara manual atau upload file Excel masal.
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
              {students.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`⚠️ PERINGATAN ADMIN: Apakah Anda yakin ingin MENGHAPUS SEMUA ${students.length} data siswa beserta seluruh tagihannya?\nSeluruh buku induk siswa akan dikosongkan.`)) {
                      purgeModuleData('students');
                      setSelectedStudentIds([]);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                  title="Kosongkan Semua Siswa"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Kosongkan Semua Siswa</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={() => {
              setParsedStudents([]);
              setUploadFileName('');
              setUploadError(null);
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            Upload Excel Siswa
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* Filter, Search, and Bulk Delete Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filter Kelas:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {allGrades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk delete action button */}
          {selectedStudentIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const count = selectedStudentIds.length;
                if (window.confirm(`Yakin ingin menghapus ${count} data siswa terpilih beserta seluruh tagihan terkait? Tindakan ini tidak dapat dibatalkan.`)) {
                  deleteStudentsBulk(selectedStudentIds, true);
                  setSelectedStudentIds([]);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus {selectedStudentIds.length} Siswa Terpilih
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa, NIS, atau wali..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                    onChange={() => {
                      if (selectedStudentIds.length === filteredStudents.length) {
                        setSelectedStudentIds([]);
                      } else {
                        setSelectedStudentIds(filteredStudents.map((s) => s.id));
                      }
                    }}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="py-3 px-4">Nama Siswa & NIS</th>
                <th className="py-3 px-4">Kelas / JK</th>
                <th className="py-3 px-4">Pilihan Ekskul (Maks 2) & Tarif</th>
                <th className="py-3 px-4">Orang Tua / Wali</th>
                <th className="py-3 px-4">No. WhatsApp Orang Tua</th>
                <th className="py-3 px-4">Email Orang Tua</th>
                <th className="py-3 px-4">Nomor VA Mandiri</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Tidak ada siswa yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const studentBills = bills.filter((b) => b.studentId === s.id);
                  const hasOverdue = studentBills.some((b) => b.status === 'MENUNGGAK');
                  const phone = normalizeWhatsAppNumber(s.parentPhone);
                  const isSelected = selectedStudentIds.includes(s.id);

                  return (
                    <tr key={s.id} className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedStudentIds((prev) =>
                              prev.includes(s.id) ? prev.filter((i) => i !== s.id) : [...prev, s.id]
                            );
                          }}
                          className="rounded border-slate-300"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-[11px] font-mono text-slate-500">
                          NIS: {s.nis} · NISN: {s.nisn || '-'}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{s.grade}</span>
                        <span className="text-slate-400 ml-1">({s.gender === 'L' ? 'Laki-laki' : 'Perempuan'})</span>
                      </td>

                      <td className="py-3 px-4">
                        {s.extracurriculars && s.extracurriculars.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {s.extracurriculars.map((ekskul) => (
                                <span
                                  key={ekskul}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200"
                                >
                                  {ekskul}
                                </span>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-600 font-mono">
                              Biaya Ekskul: <strong className="text-blue-900">{formatRupiah(s.extracurricularFee ?? 250000)}</strong>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              SPP Manual: <strong className="text-slate-800">{formatRupiah(s.customSppAmount ?? 350000)}</strong>
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-400 italic">Belum Memilih Ekskul</span>
                            <p className="text-[10px] text-slate-400 font-mono">Tarif: {formatRupiah(s.extracurricularFee ?? 250000)}</p>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">{s.parentName}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-xs">{s.address || '-'}</p>
                      </td>

                      <td className="py-3 px-4">
                        <a
                          href={`https://wa.me/${phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono font-medium text-emerald-700 hover:underline"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {s.parentPhone}
                        </a>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {s.parentEmail ? (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[150px]">{s.parentEmail}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-blue-900">
                        {s.vaNumber || `88012${s.nis}`}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'AKTIF'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.status}
                        </span>
                        {hasOverdue && (
                          <p className="text-[9px] text-red-600 font-bold mt-0.5">Ada Tunggakan</p>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                            title="Edit Nama dan Data Siswa"
                          >
                            <Edit className="w-3 h-3 text-blue-700" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              const billCount = bills.filter((b) => b.studentId === s.id).length;
                              const msg = billCount > 0
                                ? `Hapus data siswa "${s.name}" (NIS: ${s.nis})?\nPerhatian: Siswa ini memiliki ${billCount} data tagihan. Seluruh tagihan terkait juga akan dihapus.`
                                : `Hapus data siswa "${s.name}" (NIS: ${s.nis})?`;
                              if (window.confirm(msg)) {
                                deleteStudent(s.id, true);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                            title="Hapus Siswa"
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? 'Ubah / Edit Data & Nama Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Section: Data Siswa */}
              <div className="border-b border-slate-200 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3">
                  Informasi Siswa
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nama Lengkap Siswa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Gabriel Adhitama Prasetyo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    {editingId && (
                      <p className="text-[11px] text-blue-700 mt-1">
                        Perubahan nama siswa akan otomatis disinkronkan ke seluruh data tagihan dan kwitansi.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Nomor Induk (NIS) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 260101"
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        NISN Nasional
                      </label>
                      <input
                        type="text"
                        placeholder="10 digit NISN"
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Kelas
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        {allGrades
                          .filter((g) => g !== 'Semua Kelas')
                          .map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Jenis Kelamin
                      </label>
                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === 'L'}
                            onChange={() => setGender('L')}
                          />
                          Laki-laki
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={gender === 'P'}
                            onChange={() => setGender('P')}
                          />
                          Perempuan
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Status Keaktifan
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'AKTIF' | 'NONAKTIF')}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="AKTIF">Aktif</option>
                        <option value="NONAKTIF">Nonaktif / Pindah</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Data Orang Tua / Wali */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3">
                  Kontak Orang Tua / Wali (Pengingat WhatsApp & Kwitansi)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nama Lengkap Orang Tua / Wali <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Ayah/Ibu/Wali murid"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Nomor HP / WhatsApp Orang Tua <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 081227189012"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">Digunakan untuk kirim notifikasi WhatsApp</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Email Orang Tua (Opsional)
                      </label>
                      <input
                        type="email"
                        placeholder="orangtua@gmail.com"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Alamat Tempat Tinggal
                    </label>
                    <input
                      type="text"
                      placeholder="Alamat domisili di Yogyakarta / Sleman / Bantul"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Nomor Virtual Account Bank Khusus Siswa
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 88012260101"
                      value={vaNumber}
                      onChange={(e) => setVaNumber(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Pilihan Ekstrakurikuler (Maksimal 2 Pilihan) & Pengaturan Biaya Manual */}
              <div className="border-t border-slate-200 pt-4 pb-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Pilihan Ekstrakurikuler (Maksimal 2 Pilihan)
                    </h4>
                  </div>
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      extracurriculars.length === 2
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : extracurriculars.length === 1
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {extracurriculars.length} dari 2 Terpilih
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mb-2">
                  Pilih maksimal 2 kegiatan ekskul untuk ananda. Admin dapat mengganti besaran nominal biaya ekskul dan tarif SPP/kegiatan secara bebas untuk setiap siswa.
                </p>

                {/* 12 Pilihan Ekskul SIBOGO */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EXTRACURRICULAR_OPTIONS.map((opt) => {
                    const isSelected = extracurriculars.includes(opt);
                    const isDisabled = !isSelected && extracurriculars.length >= 2;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleToggleEkskul(opt)}
                        className={`px-2.5 py-2 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between border ${
                          isSelected
                            ? 'bg-blue-800 text-white border-blue-900 shadow-xs ring-2 ring-blue-300'
                            : isDisabled
                            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-white" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {extracurriculars.length >= 2 && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>
                      Maksimal 2 pilihan ekskul tercapai ({extracurriculars.join(', ')}). Untuk mengganti, klik salah satu pilihan yang aktif untuk membatalkannya.
                    </span>
                  </p>
                )}

                {/* Inputs for manual fee settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Biaya Ekskul Siswa (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={10000}
                      value={extracurricularFee}
                      onChange={(e) => setExtracurricularFee(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-blue-50/40 text-blue-900"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">Admin bisa ganti nominal per siswa</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      SPP Bulanan Manual (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={10000}
                      value={customSppAmount}
                      onChange={(e) => setCustomSppAmount(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50 text-slate-900"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">Tulis nominal SPP secara manual</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Uang Kegiatan Manual (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50000}
                      value={customActivityFee}
                      onChange={(e) => setCustomActivityFee(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50 text-slate-900"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">Tulis nominal kegiatan tahunan</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Siswa Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload Excel Siswa */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Upload & Impor Data Siswa dari File Excel
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Instructions and Template Download */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-emerald-950">
                  <p className="font-bold">Gunakan Format Template Excel Resmi:</p>
                  <p className="text-slate-600 mt-0.5">
                    Pastikan kolom memuat NIS, Nama Siswa, Kelas, Jenis Kelamin, Nama Orang Tua, No WhatsApp, dan Email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadStudentTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  Unduh Template Excel (.xlsx)
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
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  {uploadFileName ? uploadFileName : 'Klik atau seret file Excel (.xlsx / .csv) ke sini'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendukung file Microsoft Excel (.xlsx, .xls) dan CSV
                </p>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Pratinjau Data ({parsedStudents.length} Siswa Siap Diimpor)
                    </span>
                    <span className="text-emerald-700 font-medium">
                      ✓ Format Terverifikasi
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                          <th className="py-2 px-3">NIS</th>
                          <th className="py-2 px-3">Nama Siswa</th>
                          <th className="py-2 px-3">Kelas</th>
                          <th className="py-2 px-3">Wali Murid</th>
                          <th className="py-2 px-3">No. WhatsApp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {parsedStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-mono font-medium text-slate-800">{s.nis}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-900">{s.name}</td>
                            <td className="py-1.5 px-3 text-slate-600">{s.grade}</td>
                            <td className="py-1.5 px-3 text-slate-600">{s.parentName}</td>
                            <td className="py-1.5 px-3 font-mono text-emerald-700">{s.parentPhone}</td>
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
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={parsedStudents.length === 0}
                  onClick={handleExecuteImport}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Impor {parsedStudents.length > 0 ? `${parsedStudents.length} Siswa` : ''} Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
