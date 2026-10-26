import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  SPMBEntryTrack,
  SPMBRegistration,
  SPMBStatus,
} from '../types';
import { formatDateIndo, formatDateTimeIndo } from '../utils/formatters';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  SPMBStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  MENUNGGU_VERIFIKASI: {
    label: 'Menunggu Verifikasi',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  DITERIMA: {
    label: 'Diterima Resmi',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  CADANGAN: {
    label: 'Daftar Cadangan',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  DITOLAK: {
    label: 'Tidak Diterima',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: <X className="w-3.5 h-3.5" />,
  },
};

const TRACK_CONFIG: Record<SPMBEntryTrack, { label: string; badge: string }> = {
  REGULER: { label: 'Jalur Reguler', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
  ZONASI: { label: 'Jalur Zonasi', badge: 'bg-teal-50 text-teal-800 border-teal-200' },
  PRESTASI: { label: 'Jalur Prestasi', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  AFIRMASI: { label: 'Jalur Afirmasi / KIP', badge: 'bg-amber-50 text-amber-900 border-amber-200' },
};

export const SPMBView: React.FC = () => {
  const {
    spmbRegistrations,
    addSPMBRegistration,
    updateSPMBStatus,
    deleteSPMBRegistration,
    isSuperAdmin,
    staffInfo,
    showToast,
  } = useApp();

  // Active view: list or new form
  const [activeView, setActiveView] = useState<'LIST' | 'FORM'>('LIST');

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTrack, setFilterTrack] = useState<string>('ALL');

  // Form State
  const currentYear = new Date().getFullYear();
  const nextNisSequence = spmbRegistrations.length + 1;
  const previewNis = `${currentYear}${String(nextNisSequence).padStart(3, '0')}`;

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [birthPlace, setBirthPlace] = useState('Yogyakarta');
  const [birthDate, setBirthDate] = useState('2019-05-15');
  const [previousSchool, setPreviousSchool] = useState('');
  const [targetGrade, setTargetGrade] = useState('Kelas 1A');
  const [entryTrack, setEntryTrack] = useState<SPMBEntryTrack>('REGULER');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('08');
  const [parentEmail, setParentEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Modals
  const [selectedProof, setSelectedProof] = useState<SPMBRegistration | null>(null);
  const [emailModalData, setEmailModalData] = useState<SPMBRegistration | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<SPMBRegistration | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<SPMBStatus>('DITERIMA');

  // Filtered registrations
  const filteredList = useMemo(() => {
    return spmbRegistrations.filter((reg) => {
      const matchSearch =
        reg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.nis.includes(searchQuery) ||
        reg.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.parentEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === 'ALL' || reg.status === filterStatus;
      const matchTrack = filterTrack === 'ALL' || reg.entryTrack === filterTrack;

      return matchSearch && matchStatus && matchTrack;
    });
  }, [spmbRegistrations, searchQuery, filterStatus, filterTrack]);

  // Statistics
  const totalCount = spmbRegistrations.length;
  const acceptedCount = spmbRegistrations.filter((r) => r.status === 'DITERIMA').length;
  const pendingCount = spmbRegistrations.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;
  const reserveCount = spmbRegistrations.filter((r) => r.status === 'CADANGAN').length;

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !parentName.trim() || !parentEmail.trim() || !parentPhone.trim()) {
      alert('Mohon lengkapi Nama Calon Murid, Nama Orang Tua, No. WhatsApp, dan Alamat Email!');
      return;
    }

    const created = addSPMBRegistration({
      fullName: fullName.trim(),
      gender,
      birthPlace: birthPlace.trim(),
      birthDate,
      previousSchool: previousSchool.trim() || undefined,
      targetGrade,
      entryTrack,
      status: 'MENUNGGU_VERIFIKASI',
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      address: address.trim(),
      notes: notes.trim() || undefined,
    });

    // Reset Form
    setFullName('');
    setPreviousSchool('');
    setParentName('');
    setParentPhone('08');
    setParentEmail('');
    setAddress('');
    setNotes('');

    // Open email preview modal to show the simulated email
    setEmailModalData(created);
    setActiveView('LIST');
  };

  const handleResendEmail = (reg: SPMBRegistration) => {
    updateSPMBStatus(reg.id, reg.status, true);
    setEmailModalData(reg);
  };

  const handleSaveStatusChange = () => {
    if (!statusChangeTarget) return;
    updateSPMBStatus(statusChangeTarget.id, newStatusValue, true);
    setStatusChangeTarget(null);
  };

  const exportToCSV = () => {
    const headers = [
      'No Pendaftaran',
      'NIS Otomatis',
      'Nama Calon Siswa',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Jalur Masuk',
      'Target Kelas',
      'Asal TK',
      'Nama Orang Tua',
      'No WhatsApp',
      'Email',
      'Status',
      'Tanggal Daftar',
    ];

    const rows = filteredList.map((r) => [
      r.registrationNumber,
      r.nis,
      `"${r.fullName}"`,
      r.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      `"${r.birthPlace}"`,
      r.birthDate,
      r.entryTrack,
      r.targetGrade,
      `"${r.previousSchool || '-'}"`,
      `"${r.parentName}"`,
      `"${r.parentPhone}"`,
      `"${r.parentEmail}"`,
      r.status,
      r.registrationDate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SPMB_SD_BOPKRI_Gondolayu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data pendaftaran berhasil diekspor ke file CSV', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs tracking-wider uppercase mb-1">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <span>Sistem Penerimaan Murid Baru (SPMB / PPDB)</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500 font-normal">T.A. {staffInfo.academicYear}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Pendaftaran Murid Baru SD BOPKRI Gondolayu</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Pendaftaran calon peserta didik baru dengan penerbitan Nomor Induk Siswa (NIS) otomatis, verifikasi berkas, dan sistem konfirmasi email otomatis langsung ke orang tua calon murid.
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveView('LIST')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeView === 'LIST'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Calon Murid ({totalCount})</span>
          </button>
          <button
            onClick={() => setActiveView('FORM')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeView === 'FORM'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Formulir Pendaftaran Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pendaftar</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Calon murid terdaftar</p>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Diterima Resmi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{acceptedCount}</div>
          <p className="text-[10px] text-emerald-700/80 mt-0.5">Sudah mendapat NIS & kelas</p>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu Verifikasi</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950">{pendingCount}</div>
          <p className="text-[10px] text-amber-700/80 mt-0.5">Perlu verifikasi berkas/rapor</p>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-2xs bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cadangan</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-950">{reserveCount}</div>
          <p className="text-[10px] text-blue-700/80 mt-0.5">Prioritas kedua bila kuota ada</p>
        </div>
      </div>

      {/* VIEW: FORM PENDAFTARAN BARU */}
      {activeView === 'FORM' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-150">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase bg-white/10 px-2.5 py-0.5 rounded-full text-blue-200 border border-white/10 inline-block mb-1.5">
                Formulir Pendaftaran Siswa Baru
              </span>
              <h2 className="text-xl font-black">Isi Biodata Calon Peserta Didik Baru</h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Sistem akan secara otomatis menerbitkan NIS baru dan mengirimkan email konfirmasi ke alamat email orang tua.
              </p>
            </div>
            
            {/* Auto NIS Badge Display */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-xl flex items-center gap-3 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-200 block">
                  NIS Baru Otomatis:
                </span>
                <span className="text-base font-black text-white font-mono tracking-wider">
                  {previewNis}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="p-6 sm:p-8 space-y-6">
            
            {/* Section 1: Data Calon Murid */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-700" />
                <span>1. Data Pribadi Calon Murid</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Calon Murid <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jonathan Daniel Prasetyo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Yogyakarta"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Asal TK / PAUD
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: TK BOPKRI Gondolayu"
                    value={previousSchool}
                    onChange={(e) => setPreviousSchool(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Jalur Masuk & Kelas */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-700" />
                <span>2. Jalur Pendaftaran & Target Penempatan</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jalur Pendaftaran SPMB <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={entryTrack}
                    onChange={(e) => setEntryTrack(e.target.value as SPMBEntryTrack)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="REGULER">Jalur Reguler Umum</option>
                    <option value="ZONASI">Jalur Zonasi (Radius Sekitar SD BOPKRI)</option>
                    <option value="PRESTASI">Jalur Prestasi Akademik / Non-Akademik</option>
                    <option value="AFIRMASI">Jalur Afirmasi / KIP / Beasiswa Yayasan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Kelas
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="Kelas 1A">Kelas 1A</option>
                    <option value="Kelas 1B">Kelas 1B</option>
                    <option value="Kelas 1">Kelas 1 (Paralel)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Data Orang Tua & Kontak Notifikasi Email */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>3. Data Orang Tua / Wali & Pengiriman Email Otomatis</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Orang Tua / Wali <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hendrik Prasetyo"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp Orang Tua <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081227182930"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email Pendaftar <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="orangtua@gmail.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                    ✓ Surat konfirmasi & nomor registrasi otomatis dikirim ke email ini
                  </span>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Tempat Tinggal Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jl. Terban GK V No. 12, Gondokusuman, Kota Yogyakarta"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Khusus / Prestasi / Keterangan Tambahan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mengikuti les piano, bersaudara kandung di kelas 4A"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveView('LIST')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Simpan Pendaftaran & Kirim Email Konfirmasi</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* VIEW: TABEL DAFTAR PENDAFTAR */}
      {activeView === 'LIST' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Table Header Filter Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Cari nama, NIS, no. pendaftaran, ortu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-700 font-medium"
              >
                <option value="ALL">Semua Status</option>
                <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                <option value="DITERIMA">Diterima Resmi</option>
                <option value="CADANGAN">Cadangan</option>
                <option value="DITOLAK">Ditolak</option>
              </select>

              <select
                value={filterTrack}
                onChange={(e) => setFilterTrack(e.target.value)}
                className="hidden sm:inline-block px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-700 font-medium"
              >
                <option value="ALL">Semua Jalur</option>
                <option value="REGULER">Jalur Reguler</option>
                <option value="ZONASI">Jalur Zonasi</option>
                <option value="PRESTASI">Jalur Prestasi</option>
                <option value="AFIRMASI">Jalur Afirmasi</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                title="Ekspor daftar pendaftar ke file Excel/CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => setActiveView('FORM')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Daftar Siswa Baru</span>
              </button>
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">No. Reg & NIS</th>
                  <th className="py-3 px-4">Nama Calon Murid</th>
                  <th className="py-3 px-4">Jalur & Kelas</th>
                  <th className="py-3 px-4">Orang Tua & Kontak</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Email Konfirmasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">Tidak ada pendaftar yang cocok</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Klik tombol "Formulir Pendaftaran Baru" untuk mendaftarkan calon murid baru.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    const statusCfg = STATUS_CONFIG[item.status];
                    const trackCfg = TRACK_CONFIG[item.entryTrack];

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* No. Reg & Auto NIS */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 block">
                            {item.registrationNumber}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400">NIS:</span>
                            <span className="font-mono font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded text-[11px]">
                              {item.nis}
                            </span>
                          </div>
                        </td>

                        {/* Nama Calon Murid */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block text-xs">
                            {item.fullName}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {item.gender === 'L' ? 'Laki-laki' : 'Perempuan'} · {item.birthPlace}, {formatDateIndo(item.birthDate)}
                          </span>
                          {item.previousSchool && (
                            <span className="text-[10px] text-slate-400 italic block mt-0.5">
                              Asal: {item.previousSchool}
                            </span>
                          )}
                        </td>

                        {/* Jalur & Kelas */}
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${trackCfg.badge} mb-1`}>
                            {trackCfg.label}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 block">
                            Target: {item.targetGrade}
                          </span>
                        </td>

                        {/* Orang Tua & Kontak */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block text-xs">
                            {item.parentName}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a
                                href={`https://wa.me/${item.parentPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-emerald-700 hover:underline"
                              >
                                {item.parentPhone}
                              </a>
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[160px]">{item.parentEmail}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          >
                            {statusCfg.icon}
                            <span>{statusCfg.label}</span>
                          </span>
                        </td>

                        {/* Email Notification Status */}
                        <td className="py-3 px-4 text-center">
                          {item.emailNotificationSent ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Terkirim</span>
                              </span>
                              <button
                                onClick={() => handleResendEmail(item)}
                                className="text-[9px] text-blue-700 hover:underline mt-1 inline-flex items-center gap-0.5"
                                title="Lihat pratinjau surat atau kirim ulang konfirmasi email"
                              >
                                <RefreshCw className="w-2.5 h-2.5" />
                                <span>Lihat Email</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleResendEmail(item)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded hover:bg-amber-100"
                            >
                              <Send className="w-3 h-3" />
                              <span>Kirim Email</span>
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Ubah Status */}
                            <button
                              onClick={() => {
                                setStatusChangeTarget(item);
                                setNewStatusValue(item.status);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                              title="Verifikasi atau ubah status penerimaan"
                            >
                              Status
                            </button>

                            {/* Cetak Bukti Registrasi */}
                            <button
                              onClick={() => setSelectedProof(item)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg transition-colors"
                              title="Lihat / Cetak Bukti Registrasi Calon Murid"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-700" />
                            </button>

                            {/* Hapus (HANYA SUPER ADMIN BENISIUS) */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus data pendaftaran "${item.fullName}"?`)) {
                                    deleteSPMBRegistration(item.id);
                                  }
                                }}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                                title="Hapus Data (Khusus Super Admin)"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              </button>
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

          {/* Table Footer */}
          <div className="p-4 border-t border-slate-200/80 bg-slate-50 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Menampilkan <strong>{filteredList.length}</strong> dari total <strong>{totalCount}</strong> calon murid terdaftar
            </span>
            <span className="text-slate-400">
              SD BOPKRI Gondolayu · SPMB Online Terpadu
            </span>
          </div>

        </div>
      )}

      {/* MODAL 1: PREVIEW SURAT KONFIRMASI EMAIL OTOMATIS */}
      {emailModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                  <Mail className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Notifikasi Email Otomatis Pendaftar</h3>
                  <p className="text-[11px] text-blue-200">
                    Kop Resmi SD BOPKRI Gondolayu · Terkirim ke {emailModalData.parentEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalData(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Envelope Header */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-xs text-slate-600 space-y-1">
              <div>
                <strong>Pengirim:</strong> spmb@sdbopkrigondolayu.sch.id (Sistem SPMB SIBOGO)
              </div>
              <div>
                <strong>Penerima:</strong> {emailModalData.parentEmail} ({emailModalData.parentName})
              </div>
              <div>
                <strong>Subjek:</strong> [KONFIRMASI SPMB] Bukti Pendaftaran Calon Murid Baru - {emailModalData.fullName} (NIS: {emailModalData.nis})
              </div>
            </div>

            {/* Email Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
              
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pendaftaran Berhasil Diterima & Terverifikasi di Sistem</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Terima kasih telah mendaftarkan putra/putri Bapak/Ibu di SD BOPKRI Gondolayu. Berikut adalah rincian data pendaftaran resmi:
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">No. Registrasi:</span>
                    <strong className="text-slate-900 font-mono">{emailModalData.registrationNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nomor Induk Siswa (NIS):</span>
                    <strong className="text-blue-900 font-mono text-sm">{emailModalData.nis}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nama Calon Siswa:</span>
                    <strong className="text-slate-900">{emailModalData.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Jalur Masuk:</span>
                    <strong className="text-slate-900">{emailModalData.entryTrack}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Target Kelas:</span>
                    <strong className="text-slate-900">{emailModalData.targetGrade}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Status Saat Ini:</span>
                    <span className="inline-block px-2 py-0.2 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">
                      {emailModalData.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1.5">
                <p><strong>Langkah Selanjutnya:</strong></p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Simpan nomor pendaftaran dan NIS di atas untuk keperluan verifikasi.</li>
                  <li>Unduh dan cetak formulir bukti pendaftaran melalui portal ini.</li>
                  <li>Jadwal orientasi calon siswa baru dan pengukuran seragam akan diumumkan melalui WhatsApp resmi sekolah.</li>
                </ol>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500">
                <p className="font-semibold text-slate-700">SD BOPKRI Gondolayu Yogyakarta</p>
                <p>{staffInfo.address} · Telp: {staffInfo.phone} · Web: {staffInfo.website}</p>
                <p className="text-slate-400 mt-1 italic">Email ini dikirim secara otomatis oleh Sistem SIBOGO. Mohon tidak membalas email ini secara langsung.</p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status: Email berhasil terkirim ke {emailModalData.parentEmail}</span>
              </span>
              <button
                onClick={() => setEmailModalData(null)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl"
              >
                Tutup Pratinjau
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: UBAH STATUS PENDAFTARAN */}
      {statusChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Verifikasi & Ubah Status Calon Murid</h3>
              <button
                onClick={() => setStatusChangeTarget(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block text-[10px]">Calon Murid:</span>
                <strong className="text-slate-900 text-sm">{statusChangeTarget.fullName}</strong>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  NIS: <strong>{statusChangeTarget.nis}</strong> · Ortu: {statusChangeTarget.parentName}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Status Penerimaan Baru:
                </label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value as SPMBStatus)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                >
                  <option value="DITERIMA">DITERIMA (Lolos & Masuk Kuota)</option>
                  <option value="MENUNGGU_VERIFIKASI">MENUNGGU VERIFIKASI (Berkas Tertunda)</option>
                  <option value="CADANGAN">CADANGAN (Daftar Tunggu)</option>
                  <option value="DITOLAK">DITOLAK (Tidak Memenuhi Syarat)</option>
                </select>
                <p className="text-[10px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>Notifikasi email konfirmasi pembaruan status akan otomatis dikirimkan ke pendaftar.</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusChangeTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatusChange}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-xl shadow-xs"
                >
                  Simpan & Kirim Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CETAK BUKTI PENDAFTARAN RESMI */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            
            {/* Top Toolbar */}
            <div className="no-print bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Bukti Pendaftaran Resmi Calon Peserta Didik Baru</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setSelectedProof(null)}
                  className="p-1 rounded-lg text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 print:p-0">
              
              {/* Kop Surat Sekolah */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/src/assets/images/logo_bopkri_gondolayu.png"
                    alt="Logo BOPKRI"
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <h2 className="text-xs uppercase font-extrabold text-blue-900 tracking-wider">
                      {staffInfo.foundationName}
                    </h2>
                    <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                      {staffInfo.schoolName}
                    </h1>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {staffInfo.address} · Telp: {staffInfo.phone} · Web: {staffInfo.website}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Tahun Ajaran</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{staffInfo.academicYear}</span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-950 uppercase underline tracking-wider">
                  BUKTI TANDA TERIMA PENDAFTARAN SPMB
                </h3>
                <p className="text-xs font-mono text-slate-600">
                  Nomor: {selectedProof.registrationNumber}
                </p>
              </div>

              {/* Rincian Calon Siswa */}
              <table className="w-full text-xs border border-slate-300">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50 w-44">Nomor Induk Siswa (NIS)</td>
                    <td className="p-2.5 font-mono font-black text-sm text-blue-950">{selectedProof.nis}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Nama Calon Siswa</td>
                    <td className="p-2.5 font-bold text-slate-900 uppercase">{selectedProof.fullName}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Jenis Kelamin</td>
                    <td className="p-2.5">{selectedProof.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Tempat, Tanggal Lahir</td>
                    <td className="p-2.5">{selectedProof.birthPlace}, {formatDateIndo(selectedProof.birthDate)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Jalur Penerimaan</td>
                    <td className="p-2.5 font-semibold text-slate-900">{selectedProof.entryTrack}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Target Penempatan Kelas</td>
                    <td className="p-2.5 font-bold">{selectedProof.targetGrade}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Asal Sekolah TK / PAUD</td>
                    <td className="p-2.5">{selectedProof.previousSchool || '-'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Nama Orang Tua / Wali</td>
                    <td className="p-2.5 font-semibold">{selectedProof.parentName}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Kontak WhatsApp & Email</td>
                    <td className="p-2.5">{selectedProof.parentPhone} · {selectedProof.parentEmail}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold bg-slate-50">Alamat Tempat Tinggal</td>
                    <td className="p-2.5">{selectedProof.address}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold bg-slate-50">Status Pendaftaran</td>
                    <td className="p-2.5 font-bold text-emerald-800">{selectedProof.status}</td>
                  </tr>
                </tbody>
              </table>

              {/* Tanda Tangan */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs">
                <div>
                  <p className="text-slate-500">Orang Tua / Wali Murid,</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900">{selectedProof.parentName}</p>
                </div>
                <div>
                  <p className="text-slate-500">
                    Yogyakarta, {formatDateIndo(selectedProof.registrationDate)}
                  </p>
                  <p className="text-slate-500">Panitia SPMB / Kepala Sekolah,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-blue-900 font-bold border border-blue-200 px-2 py-0.5 rounded bg-blue-50/50">
                      [TERVERIFIKASI RESMI SIBOGO]
                    </span>
                  </div>
                  <p className="font-bold underline text-slate-900">{staffInfo.principal}</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
