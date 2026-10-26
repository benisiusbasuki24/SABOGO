import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TeachingAdminDoc,
  TeachingDocCategory,
} from '../types';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';

const CATEGORY_LABELS: Record<TeachingDocCategory, { label: string; icon: string; color: string }> = {
  MODUL_AJAR: {
    label: 'Modul Ajar / RPP (Kurikulum Merdeka)',
    icon: '📘',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  SILABUS_ATP: {
    label: 'Alur Tujuan Pembelajaran (ATP)',
    icon: '🧭',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  PROMES_PROTA: {
    label: 'Program Tahunan & Semester (Prota/Promes)',
    icon: '🗓️',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  ASESMEN_SOAL: {
    label: 'Kisi-kisi & Butir Soal Asesmen (STS/SAS)',
    icon: '📝',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  JURNAL_MENGAJAR: {
    label: 'Jurnal Harian & Refleksi Mengajar',
    icon: '📔',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  LKPD: {
    label: 'Lembar Kerja Peserta Didik (LKPD)',
    icon: '📄',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  REKAP_NILAI: {
    label: 'Daftar & Rekapitulasi Nilai Siswa',
    icon: '📊',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  LAINNYA: {
    label: 'Dokumen Administrasi Lainnya',
    icon: '📁',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};

export const TeachingAdministrationView: React.FC = () => {
  const {
    currentUser,
    teachingDocs,
    addTeachingDoc,
    deleteTeachingDoc,
    deleteTeachingDocsBulk,
    purgeModuleData,
    setIsDataPurgeModalOpen,
    updateTeachingDocStatus,
    staffInfo,
    teachers,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('ALL');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<TeachingDocCategory>('MODUL_AJAR');
  const [docAcademicYear, setDocAcademicYear] = useState(staffInfo.academicYear || '2026/2027');
  const [docSemester, setDocSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [docGrade, setDocGrade] = useState('Kelas 4A');
  const [docSubject, setDocSubject] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState(false);

  // Admin verification modal
  const [verifyingDoc, setVerifyingDoc] = useState<TeachingAdminDoc | null>(null);
  const [adminFeedback, setAdminFeedback] = useState('');

  // Preview file modal
  const [previewDoc, setPreviewDoc] = useState<TeachingAdminDoc | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN';

  // Strict Isolation: If user is TEACHER, show only their own uploaded documents
  const userFilteredDocs = useMemo(() => {
    if (!currentUser) return [];

    if (isAdmin) {
      if (selectedTeacherFilter === 'ALL') return teachingDocs;
      return teachingDocs.filter((d) => d.teacherId === selectedTeacherFilter);
    }

    // TEACHER ONLY sees their own documents
    return teachingDocs.filter((d) => {
      if (currentUser.teacherId && d.teacherId === currentUser.teacherId) return true;
      if (currentUser.username && d.teacherNip === currentUser.username) return true;
      if (currentUser.name && d.teacherName.toLowerCase() === currentUser.name.toLowerCase()) return true;
      return false;
    });
  }, [currentUser, isAdmin, teachingDocs, selectedTeacherFilter]);

  // Apply search and category filters
  const displayedDocs = useMemo(() => {
    return userFilteredDocs.filter((doc) => {
      const matchSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.teacherName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
      const matchSem = selectedSemester === 'ALL' || doc.semester === selectedSemester;

      return matchSearch && matchCat && matchSem;
    });
  }, [userFilteredDocs, searchQuery, selectedCategory, selectedSemester]);

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!docTitle) {
        // Auto-fill title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setDocTitle(cleanName);
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      alert('Judul dokumen wajib diisi.');
      return;
    }

    const currentTeacher = teachers.find((t) => t.id === currentUser?.teacherId);

    const fileName = selectedFile
      ? selectedFile.name
      : `${docTitle.trim().replace(/\s+/g, '_')}.pdf`;

    const fileSize = selectedFile
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : '1.4 MB';

    const fileType = selectedFile ? selectedFile.type : 'application/pdf';

    addTeachingDoc({
      teacherId: currentUser?.teacherId || currentTeacher?.id || 'tch-09',
      teacherName: currentUser?.name || 'Benisius Basuki, S.Pd',
      teacherNip: currentTeacher?.nip || currentUser?.username || '198704242011011009',
      title: docTitle.trim(),
      category: docCategory,
      academicYear: docAcademicYear,
      semester: docSemester,
      grade: docGrade,
      subject: docSubject || 'Pelajaran Umum / Tematik',
      fileName,
      fileSize,
      fileType,
      notes: docNotes.trim(),
    });

    setIsUploadModalOpen(false);
    setUploadSuccessAlert(true);
    showToast('Data berhasil diunggah', 'success');
    setTimeout(() => setUploadSuccessAlert(false), 4000);

    // Reset form
    setDocTitle('');
    setDocNotes('');
    setDocSubject('');
    setSelectedFile(null);
  };

  const handleAdminVerify = (status: 'DISETUJUI' | 'PERLU_REVISI') => {
    if (!verifyingDoc) return;
    updateTeachingDocStatus(verifyingDoc.id, status, adminFeedback);
    setVerifyingDoc(null);
    setAdminFeedback('');
  };

  // Stats
  const countApproved = userFilteredDocs.filter((d) => d.status === 'DISETUJUI').length;
  const countPending = userFilteredDocs.filter((d) => d.status === 'MENUNGGU_VERIFIKASI').length;
  const countRevision = userFilteredDocs.filter((d) => d.status === 'PERLU_REVISI').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Administrasi Pembelajaran Guru
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Pengunggahan & Pengarsipan Berkas Kurikulum Merdeka · SD BOPKRI Gondolayu
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 mt-3 max-w-3xl leading-relaxed">
              {isAdmin
                ? 'Sebagai Administrator / Kepala Sekolah, Anda dapat meninjau berkas administrasi ajar seluruh dewan guru, memberikan catatan verifikasi, dan memantau kelengkapan perangkat ajar.'
                : `Selamat datang, ${currentUser?.name}. Ruang ini khusus bagi Anda untuk mengunggah Modul Ajar (RPP), ATP, Program Semester/Tahunan, Soal Asesmen, dan Rekap Nilai kelas Anda.`}
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-2.5">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setIsDataPurgeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors"
                  title="Buka Pusat Pengelolaan & Penghapusan Data Sistem"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Pusat Hapus Data</span>
                </button>
                {teachingDocs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`⚠️ PERINGATAN ADMIN: Apakah Anda yakin ingin MENGHAPUS SEMUA ${teachingDocs.length} dokumen administrasi pembelajaran?\nSemua file perangkat ajar guru akan dibersihkan.`)) {
                        purgeModuleData('teachingDocs');
                        setSelectedDocIds([]);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
                    title="Kosongkan Semua Dokumen Ajar"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Kosongkan Semua Dokumen</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Dokumen Ajar</span>
            </button>
          </div>
        </div>

        {uploadSuccessAlert && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dokumen administrasi pembelajaran berhasil diunggah dan disimpan ke arsip kurikulum!</span>
          </div>
        )}
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Dokumen Disetujui</span>
            <div className="text-2xl font-bold text-emerald-700 mt-0.5">{countApproved}</div>
            <span className="text-[11px] text-slate-400">Terverifikasi kurikulum</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Menunggu Verifikasi</span>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{countPending}</div>
            <span className="text-[11px] text-slate-400">Dalam peninjauan</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Perlu Revisi</span>
            <div className="text-2xl font-bold text-rose-600 mt-0.5">{countRevision}</div>
            <span className="text-[11px] text-slate-400">Memerlukan penyesuaian</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Document List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3 bg-slate-50/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Cari judul modul, mapel, atau nama berkas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-700 font-medium"
              >
                <option value="ALL">Semua Kategori Administrasi</option>
                <option value="MODUL_AJAR">Modul Ajar / RPP</option>
                <option value="SILABUS_ATP">ATP / Silabus</option>
                <option value="PROMES_PROTA">Prota & Promes</option>
                <option value="ASESMEN_SOAL">Kisi-kisi & Soal Asesmen</option>
                <option value="JURNAL_MENGAJAR">Jurnal Harian Mengajar</option>
                <option value="LKPD">Lembar Kerja (LKPD)</option>
                <option value="REKAP_NILAI">Rekap Nilai Siswa</option>
                <option value="LAINNYA">Lainnya</option>
              </select>

              {/* Semester Filter */}
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-700 font-medium"
              >
                <option value="ALL">Semua Semester</option>
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>

              {/* Admin-only Teacher Filter */}
              {isAdmin && (
                <select
                  value={selectedTeacherFilter}
                  onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                  className="bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-blue-900 font-medium"
                >
                  <option value="ALL">Semua Guru ({teachers.length})</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role})
                    </option>
                  ))}
                </select>
              )}

            </div>

          </div>

          {/* Bulk Selection Bar */}
          {selectedDocIds.length > 0 && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs">
              <span className="font-semibold text-red-900">
                Terpilih: {selectedDocIds.length} dari {displayedDocs.length} dokumen
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDocIds([])}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-red-100/50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Hapus ${selectedDocIds.length} berkas dokumen pembelajaran terpilih? Tindakan ini tidak dapat dibatalkan.`)) {
                      deleteTeachingDocsBulk(selectedDocIds);
                      setSelectedDocIds([]);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus {selectedDocIds.length} Dokumen Terpilih</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Documents Table */}
        {displayedDocs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada dokumen yang sesuai</p>
            <p className="text-xs text-slate-400 mt-1">
              Klik tombol "Unggah Dokumen Ajar" di atas untuk menambahkan berkas baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={displayedDocs.length > 0 && selectedDocIds.length === displayedDocs.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocIds(displayedDocs.map((d) => d.id));
                        } else {
                          setSelectedDocIds([]);
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      title="Pilih Semua Dokumen"
                    />
                  </th>
                  <th className="py-3 px-4">Nama Dokumen & Kategori</th>
                  {isAdmin && <th className="py-3 px-4">Guru Pengunggah</th>}
                  <th className="py-3 px-4">Kelas & Mapel</th>
                  <th className="py-3 px-4">Semester & T.A</th>
                  <th className="py-3 px-4">Berkas File</th>
                  <th className="py-3 px-4 text-center">Status Verifikasi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedDocs.map((doc) => {
                  const catConfig = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.LAINNYA;
                  const isChecked = selectedDocIds.includes(doc.id);

                  return (
                    <tr key={doc.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocIds((prev) => [...prev, doc.id]);
                            } else {
                              setSelectedDocIds((prev) => prev.filter((id) => id !== doc.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm mb-1">
                          {doc.title}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catConfig.color}`}
                          >
                            {catConfig.icon} {catConfig.label}
                          </span>
                          {doc.notes && (
                            <span className="text-[11px] text-slate-500 italic truncate max-w-xs">
                              · {doc.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {isAdmin && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{doc.teacherName}</div>
                          <div className="text-[10px] text-slate-400">NIP: {doc.teacherNip}</div>
                        </td>
                      )}

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{doc.subject}</div>
                        <div className="text-[11px] text-slate-500">{doc.grade}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{doc.semester}</div>
                        <div className="text-[10px] text-slate-400">T.A {doc.academicYear}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span className="truncate max-w-[140px]" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {doc.fileSize || '1.2 MB'} ·{' '}
                          {new Date(doc.uploadedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {doc.status === 'DISETUJUI' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Disetujui
                          </span>
                        )}
                        {doc.status === 'MENUNGGU_VERIFIKASI' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Verifikasi
                          </span>
                        )}
                        {doc.status === 'PERLU_REVISI' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Perlu Revisi
                          </span>
                        )}

                        {doc.adminFeedback && (
                          <div
                            className="text-[10px] text-slate-500 mt-1 max-w-[130px] truncate mx-auto"
                            title={doc.adminFeedback}
                          >
                            💬 "{doc.adminFeedback}"
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Preview / Download */}
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Buka / Tinjau Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Admin Verification Action */}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setVerifyingDoc(doc);
                                setAdminFeedback(doc.adminFeedback || '');
                              }}
                              className="px-2 py-1 text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200"
                              title="Verifikasi Dokumen Guru"
                            >
                              Verifikasi
                            </button>
                          )}

                          {/* Delete Document */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus dokumen "${doc.title}"?`)) {
                                deleteTeachingDoc(doc.id);
                                setSelectedDocIds((prev) => prev.filter((id) => id !== doc.id));
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Upload New Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Unggah Dokumen Administrasi Pembelajaran</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 overflow-y-auto">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Dokumen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Modul Ajar IPAS Bab 2 - Harmoni Dalam Ekosistem"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Administrasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as TeachingDocCategory)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                  >
                    <option value="MODUL_AJAR">Modul Ajar / RPP Kurikulum Merdeka</option>
                    <option value="SILABUS_ATP">Alur Tujuan Pembelajaran (ATP)</option>
                    <option value="PROMES_PROTA">Program Semester & Tahunan (Promes/Prota)</option>
                    <option value="ASESMEN_SOAL">Kisi-kisi & Butir Soal Asesmen (STS/SAS)</option>
                    <option value="JURNAL_MENGAJAR">Jurnal Harian Mengajar & Refleksi</option>
                    <option value="LKPD">Lembar Kerja Peserta Didik (LKPD)</option>
                    <option value="REKAP_NILAI">Rekapitulasi Nilai Siswa</option>
                    <option value="LAINNYA">Dokumen Administrasi Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Ajaran & Semester <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={docAcademicYear}
                      onChange={(e) => setDocAcademicYear(e.target.value)}
                      placeholder="2026/2027"
                      className="w-1/2 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900"
                    />
                    <select
                      value={docSemester}
                      onChange={(e) => setDocSemester(e.target.value as 'Ganjil' | 'Genap')}
                      className="w-1/2 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat Kelas
                  </label>
                  <select
                    value={docGrade}
                    onChange={(e) => setDocGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                  >
                    <option value="Kelas 1A">Kelas 1A</option>
                    <option value="Kelas 1B">Kelas 1B</option>
                    <option value="Kelas 2A">Kelas 2A</option>
                    <option value="Kelas 2B">Kelas 2B</option>
                    <option value="Kelas 3A">Kelas 3A</option>
                    <option value="Kelas 4A">Kelas 4A</option>
                    <option value="Kelas 5A">Kelas 5A</option>
                    <option value="Kelas 5B">Kelas 5B</option>
                    <option value="Kelas 6A">Kelas 6A</option>
                    <option value="Semua Kelas">Semua Kelas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: IPAS, Matematika, PAK, PJOK"
                    value={docSubject}
                    onChange={(e) => setDocSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Berkas Dokumen (PDF, Word DOCX, Excel XLSX)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center bg-slate-50/70 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600 mb-2" />
                    {selectedFile ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB · Siap diunggah
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Klik untuk memilih berkas dari komputer atau perangkat Anda
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Mendukung PDF, Word (.docx), Excel (.xlsx) hingga 25 MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan alur capaian pembelajaran, nomor modul, atau revisi..."
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Unggah & Simpan Dokumen</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Admin Verification Modal */}
      {verifyingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Verifikasi Administrasi Pembelajaran</h3>
              </div>
              <button
                onClick={() => setVerifyingDoc(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 text-sm">{verifyingDoc.title}</div>
                <div className="text-slate-600 mt-1">
                  Guru: <strong>{verifyingDoc.teacherName}</strong> (NIP: {verifyingDoc.teacherNip})
                </div>
                <div className="text-slate-500 mt-0.5">
                  Mata Pelajaran: {verifyingDoc.subject} · {verifyingDoc.grade} · {verifyingDoc.semester} T.A {verifyingDoc.academicYear}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Masukan Evaluasi untuk Guru
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan apresiasi atau bagian yang perlu disesuaikan..."
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setVerifyingDoc(null)}
                  className="px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminVerify('PERLU_REVISI')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Minta Revisi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminVerify('DISETUJUI')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui Dokumen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base truncate max-w-md">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
                <div className="p-3 bg-blue-700 text-white rounded-xl">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900 text-sm">{previewDoc.fileName}</p>
                  <p className="text-slate-600">
                    Kategori: <strong>{CATEGORY_LABELS[previewDoc.category]?.label}</strong>
                  </p>
                  <p className="text-slate-600">
                    Guru: {previewDoc.teacherName} (NIP: {previewDoc.teacherNip})
                  </p>
                  <p className="text-slate-500">
                    Ukuran: {previewDoc.fileSize || '1.2 MB'} · Diunggah pada{' '}
                    {new Date(previewDoc.uploadedAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {previewDoc.notes && (
                <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="font-semibold text-slate-700">Catatan Pengunggah:</span>
                  <p className="text-slate-600 mt-1">{previewDoc.notes}</p>
                </div>
              )}

              {previewDoc.adminFeedback && (
                <div className="text-xs bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <span className="font-semibold text-amber-900">Ulasan / Masukan Tim Kurikulum:</span>
                  <p className="text-amber-800 mt-1">{previewDoc.adminFeedback}</p>
                </div>
              )}

              {/* Simulated document reader preview */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-100 text-center text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-700">
                  Pratinjau Berkas Administrasi Kurikulum Merdeka
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Dokumen resmi tersimpan aman di server penyimpanan berkas SD BOPKRI Gondolayu. Anda dapat mengunduh berkas fisik untuk dicetak atau diedit.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(`Mengunduh berkas: ${previewDoc.fileName}`);
                  }}
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen Asli</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
