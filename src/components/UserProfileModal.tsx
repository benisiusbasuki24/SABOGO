import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmploymentStatus } from '../types';
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  School,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';

import { StudentPicker } from './StudentPicker';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateUserProfile,
    changePassword,
    staffInfo,
    students,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Common Profile State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Staff / Guru / Admin Specific State
  const [positionTitle, setPositionTitle] = useState('');
  const [nip, setNip] = useState('');
  const [ktpNumber, setKtpNumber] = useState('');
  const [nuptk, setNuptk] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('GTY');
  const [bankName, setBankName] = useState('BPD DIY');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Orang Tua Specific State
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentNis, setStudentNis] = useState('');
  const [studentGrade, setStudentGrade] = useState('1.1');

  // Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback Messages
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Populate state whenever currentUser or modal opens
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');

      setPositionTitle(
        currentUser.positionTitle ||
          (currentUser.role === 'KEPALA_SEKOLAH'
            ? 'Kepala Sekolah'
            : currentUser.role === 'BENDAHARA'
            ? 'Bendahara Sekolah'
            : currentUser.role === 'TATA_USAHA'
            ? 'Staf Tata Usaha'
            : currentUser.role === 'GURU'
            ? 'Guru Pendidik'
            : currentUser.role === 'STAFF'
            ? 'Staf / Karyawan'
            : currentUser.role === 'ADMIN'
            ? 'Administrator'
            : 'Orang Tua Murid')
      );
      setNip(currentUser.nip || '');
      setKtpNumber(currentUser.ktpNumber || '');
      setNuptk(currentUser.nuptk || '');
      setEmploymentStatus(currentUser.employmentStatus || 'GTY');
      setBankName(currentUser.bankName || 'BPD DIY');
      setAccountNumber(currentUser.accountNumber || '');
      setAccountHolder(currentUser.accountHolder || currentUser.name || '');

      setStudentId(currentUser.studentId || '');
      setStudentName(currentUser.studentName || '');
      setStudentNis(currentUser.studentNis || '');
      setStudentGrade(currentUser.studentGrade || '1.1');
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  const isParent = currentUser.role === 'ORANG_TUA';
  const isDeveloper =
    currentUser.username === 'benisiusbasuki24' ||
    currentUser.name.toLowerCase().includes('benisius');

  const handleOpenEdit = () => {
    setIsEditing(true);
    setErrorMessage(null);
  };

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && isMatch;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage(
        isParent
          ? 'Nama lengkap orang tua wajib diisi.'
          : 'Nama lengkap dan gelar wajib diisi.'
      );
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Alamat email tidak valid.');
      return;
    }

    setIsSaving(true);
    try {
      if (isParent) {
        await updateUserProfile({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          studentId: studentId.trim() || undefined,
          studentName: studentName.trim() || undefined,
          studentNis: studentNis.trim() || undefined,
          studentGrade: studentGrade.trim() || undefined,
        });
      } else {
        await updateUserProfile({
          name: fullName.trim(),
          positionTitle: positionTitle.trim() || undefined,
          nip: nip.trim() || undefined,
          ktpNumber: ktpNumber.trim() || undefined,
          nuptk: nuptk.trim() || undefined,
          email: email.trim(),
          phone: phone.trim() || undefined,
          employmentStatus,
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim() || fullName.trim(),
        });
      }

      setIsEditing(false);
      setSuccessToast('Profil Anda berhasil diperbarui dan tersimpan permanen di Cloud Firestore!');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch {
      setErrorMessage('Terjadi kendala saat menyimpan profil ke Cloud Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage(
        'Kata sandi belum memenuhi seluruh kriteria keamanan (minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka).'
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await changePassword(newPassword);
      if (res.success) {
        setSuccessToast(res.message);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Terjadi kendala saat memperbarui kata sandi di Cloud Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusLabel = (st?: EmploymentStatus) => {
    switch (st) {
      case 'GTY':
        return 'GTY — Guru Tetap Yayasan';
      case 'PTY':
        return 'PTY — Pegawai Tetap Yayasan';
      case 'GTTY':
        return 'GTTY — Guru Tidak Tetap Yayasan';
      case 'PTTY':
        return 'PTTY — Pegawai Tidak Tetap Yayasan';
      case 'Honor Sekolah':
      case 'HONOR_SEKOLAH':
      case 'HONORER':
        return 'Honor Sekolah / Yayasan';
      case 'PNS_DPK':
        return 'PNS DPK';
      default:
        return st || 'GTY — Guru Tetap Yayasan';
    }
  };

  const getRoleBadgeLabel = () => {
    switch (currentUser.role) {
      case 'ADMIN':
        return 'Super Administrator';
      case 'KEPALA_SEKOLAH':
        return 'Kepala Sekolah';
      case 'BENDAHARA':
        return 'Bendahara Sekolah';
      case 'TATA_USAHA':
        return 'Kasir & Tata Usaha';
      case 'GURU':
      case 'TEACHER':
        return 'Guru Pendidik';
      case 'STAFF':
        return 'Tenaga Kependidikan / Staf';
      case 'ORANG_TUA':
        return 'Orang Tua Murid';
      default:
        return currentUser.role;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header with School Branding */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base text-amber-300 shrink-0">
              {currentUser.name
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold">{currentUser.name}</h2>
                {isDeveloper ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400 text-amber-950 flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5" />
                    Penanggung Jawab & Pengembang
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-700/80 text-blue-100 flex items-center gap-1">
                    <BadgeCheck className="w-2.5 h-2.5" />
                    {getRoleBadgeLabel()}
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                SD BOPKRI Gondolayu · Tagline: "{staffInfo.tagline || 'Cerdas Berkarakter'}"
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-6 flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              setActiveTab('profile');
              setErrorMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isParent ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
            <span>
              {isParent ? 'Data Profil Orang Tua & Siswa' : 'Data Kepegawaian & Profil Diri'}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('password');
              setErrorMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'password'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Keamanan & Ganti Kata Sandi</span>
          </button>
        </div>

        {/* Toast / Alerts */}
        <div className="px-6 pt-4">
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Tab 1: Profile View & Edit */}
        {activeTab === 'profile' && (
          <div className="p-6 max-h-[68vh] overflow-y-auto">
            {!isEditing ? (
              /* VIEW MODE */
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isParent ? 'Rincian Biodata Orang Tua & Siswa' : 'Rincian Biodata Kepegawaian'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Tercatat pada Sistem Administrasi SD BOPKRI Gondolayu (Tersimpan di Cloud Firestore)
                    </p>
                  </div>
                  <button
                    onClick={handleOpenEdit}
                    className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Edit Profil Saya</span>
                  </button>
                </div>

                {isParent ? (
                  /* ================= VIEW MODE FOR ORANG TUA ================= */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      
                      {/* Nama Orang Tua */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Nama Orang Tua / Wali
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {currentUser.name}
                        </span>
                      </div>

                      {/* Username Akun */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Username Akun
                        </span>
                        <span className="font-mono font-bold text-blue-950 text-xs">
                          @{currentUser.username}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Alamat Email
                        </span>
                        <span className="font-medium text-slate-800 flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{currentUser.email}</span>
                        </span>
                      </div>

                      {/* No. WhatsApp */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          No. WhatsApp / HP
                        </span>
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{currentUser.phone || 'Belum diisi'}</span>
                        </span>
                      </div>

                    </div>

                    {/* Data Siswa Putra/Putri Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 p-4 rounded-2xl border border-blue-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                        <GraduationCap className="w-4 h-4 text-blue-700" />
                        <span>Data Siswa Putra / Putri Terdaftar</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Nama Murid</span>
                          <strong className="text-slate-900 text-sm">
                            {currentUser.studentName || 'Belum didaftarkan'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Nomor Induk Siswa (NIS)</span>
                          <strong className="font-mono text-slate-800">
                            {currentUser.studentNis || 'Belum ada NIS'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Kelas / Rombel</span>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 mt-0.5">
                            {currentUser.studentGrade || '1.1'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ================= VIEW MODE FOR STAFF / GURU / KEPSEK / BENDAHARA / TU / ADMIN ================= */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      
                      {/* Nama Lengkap */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Nama Lengkap & Gelar
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {currentUser.name}
                        </span>
                      </div>

                      {/* Jabatan / Posisi */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Jabatan & Penugasan
                        </span>
                        <span className="font-bold text-blue-900 text-xs">
                          {currentUser.positionTitle || getRoleBadgeLabel()}
                        </span>
                      </div>

                      {/* Status Kepegawaian */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Status Kepegawaian
                        </span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                          {getStatusLabel(currentUser.employmentStatus)}
                        </span>
                      </div>

                      {/* NIP / NIK Guru */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          NIP / Nomor Induk Pegawai
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {currentUser.nip || 'Belum diisi'}
                        </span>
                      </div>

                      {/* No. KTP */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Nomor KTP (NIK)
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {currentUser.ktpNumber || 'Belum diisi'}
                        </span>
                      </div>

                      {/* NUPTK */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          NUPTK (16 Digit)
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {currentUser.nuptk || 'Belum diisi'}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Alamat Email
                        </span>
                        <span className="font-medium text-slate-800 flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{currentUser.email}</span>
                        </span>
                      </div>

                      {/* No. HP */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          No. WhatsApp / HP
                        </span>
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{currentUser.phone || 'Belum diisi'}</span>
                        </span>
                      </div>

                    </div>

                    {/* Bank Account Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 rounded-2xl border border-blue-200 space-y-2">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                        <CreditCard className="w-4 h-4 text-blue-700" />
                        <span>Rekening Bank Penggajian & Pembayaran</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Bank</span>
                          <strong className="text-slate-800">{currentUser.bankName || 'BPD DIY'}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Nomor Rekening</span>
                          <strong className="font-mono text-slate-900">
                            {currentUser.accountNumber || 'Belum terdaftar'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Atas Nama</span>
                          <strong className="text-slate-800">
                            {currentUser.accountHolder || currentUser.name}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {isParent ? <Users className="w-4 h-4 text-blue-800" /> : <User className="w-4 h-4 text-blue-800" />}
                    <span>
                      {isParent ? 'Edit Profil Orang Tua & Murid' : 'Edit Profil & Data Kepegawaian'}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                {isParent ? (
                  /* ================= EDIT MODE FOR ORANG TUA ================= */
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      
                      {/* Nama Orang Tua */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Lengkap Orang Tua / Wali <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-semibold"
                        />
                      </div>

                      {/* Alamat Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Alamat Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                        />
                      </div>

                      {/* No. WhatsApp */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nomor WhatsApp / HP
                        </label>
                        <input
                          type="tel"
                          placeholder="08123456789"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                        />
                      </div>

                    </div>

                    {/* Data Murid (Anak) Box */}
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3">
                      <StudentPicker
                        students={students}
                        selectedStudentId={studentId}
                        selectedStudentName={studentName}
                        selectedStudentNis={studentNis}
                        onSelect={(s) => {
                          setStudentId(s?.id || '');
                          setStudentName(s?.name || '');
                          setStudentNis(s?.nis || '');
                          setStudentGrade(s?.grade || '1.1');
                        }}
                        required={true}
                        label="Pilih Siswa (Anak Kandung / Asuh)"
                        placeholder="Ketik nama anak atau NIS siswa..."
                        helperText="Pilih nama anak agar akun orang tua terhubung langsung dengan tagihan & kwitansi pembayaran anak Anda."
                      />
                    </div>
                  </div>
                ) : (
                  /* ================= EDIT MODE FOR STAFF / GURU / KEPSEK / BENDAHARA / TU / ADMIN ================= */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      
                      {/* Nama Lengkap */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Lengkap & Gelar <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-semibold"
                        />
                      </div>

                      {/* Jabatan / Posisi */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Jabatan & Penugasan
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Guru Kelas 4A, Bendahara Sekolah"
                          value={positionTitle}
                          onChange={(e) => setPositionTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-semibold"
                        />
                      </div>

                      {/* Status Kepegawaian */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Status Kepegawaian <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={employmentStatus}
                          onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-semibold"
                        >
                          <option value="GTY">GTY — Guru Tetap Yayasan</option>
                          <option value="PTY">PTY — Pegawai Tetap Yayasan</option>
                          <option value="GTTY">GTTY — Guru Tidak Tetap Yayasan</option>
                          <option value="PTTY">PTTY — Pegawai Tidak Tetap Yayasan</option>
                          <option value="Honor Sekolah">Honor Sekolah / Yayasan</option>
                          <option value="PNS_DPK">PNS DPK</option>
                        </select>
                      </div>

                      {/* NIP */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          NIP / Nomor Induk Pegawai
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: 198203152008012003"
                          value={nip}
                          onChange={(e) => setNip(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                        />
                      </div>

                      {/* No. KTP */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nomor KTP (NIK 16 Digit)
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="Contoh: 3471012404870001"
                          value={ktpNumber}
                          onChange={(e) => setKtpNumber(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                        />
                      </div>

                      {/* NUPTK */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          NUPTK (16 Digit)
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="Contoh: 8234765667200032"
                          value={nuptk}
                          onChange={(e) => setNuptk(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Alamat Email Terdaftar <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                        />
                      </div>

                      {/* No. HP */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nomor WhatsApp / HP
                        </label>
                        <input
                          type="tel"
                          placeholder="Contoh: 081228491823"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                        />
                      </div>

                    </div>

                    {/* Bank Account Details */}
                    <div className="pt-2 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                        <span>Rekening Bank Penggajian & Pembayaran</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nama Bank
                          </label>
                          <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                          >
                            <option value="BPD DIY">BPD DIY</option>
                            <option value="BCA">BCA</option>
                            <option value="Mandiri">Mandiri</option>
                            <option value="BRI">BRI</option>
                            <option value="BNI">BNI</option>
                            <option value="BSI">BSI</option>
                            <option value="CIMB Niaga">CIMB Niaga</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nomor Rekening
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: 0012398489"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Atas Nama Pemilik
                          </label>
                          <input
                            type="text"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-blue-800 hover:bg-blue-900 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSaving ? 'Menyimpan ke Cloud...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Pembaruan Kata Sandi Akun
              </h3>
              <p className="text-[11px] text-slate-500">
                Ketentuan: Kata sandi minimal 8 karakter, wajib kombinasi huruf besar (A-Z), huruf kecil (a-z), dan angka (0-9).
              </p>
            </div>

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Kata Sandi Baru
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Ketik kata sandi baru Anda"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Real-time Validation Checklist */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Syarat Keamanan Kata Sandi:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasMinLength ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {hasMinLength ? <Check className="w-3 h-3" /> : '·'}
                  </div>
                  <span>Minimal 8 karakter ({newPassword.length}/8)</span>
                </div>

                <div className={`flex items-center gap-2 ${hasUppercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasUppercase ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {hasUppercase ? <Check className="w-3 h-3" /> : '·'}
                  </div>
                  <span>Huruf besar (A-Z)</span>
                </div>

                <div className={`flex items-center gap-2 ${hasLowercase ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasLowercase ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {hasLowercase ? <Check className="w-3 h-3" /> : '·'}
                  </div>
                  <span>Huruf kecil (a-z)</span>
                </div>

                <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasNumber ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {hasNumber ? <Check className="w-3 h-3" /> : '·'}
                  </div>
                  <span>Angka (0-9)</span>
                </div>

                <div className={`flex items-center gap-2 col-span-1 sm:col-span-2 ${isMatch ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {isMatch ? <Check className="w-3 h-3" /> : '·'}
                  </div>
                  <span>Konfirmasi kata sandi cocok</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="submit"
                disabled={!isPasswordValid || isSaving}
                className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Menyimpan Kata Sandi ke Cloud...' : 'Simpan Kata Sandi Baru'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 text-center">
          <p className="text-[10px] text-slate-400">
            Data pengguna dan akun SIBOGO dilindungi enkripsi dan tersinkronisasi otomatis dengan Cloud Firestore SD BOPKRI Gondolayu.
          </p>
        </div>

      </div>
    </div>
  );
};
