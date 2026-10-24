import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmploymentStatus } from '../types';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Hash,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateUserProfile,
    changePassword,
    staffInfo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [ktpNumber, setKtpNumber] = useState(currentUser?.ktpNumber || '');
  const [nuptk, setNuptk] = useState(currentUser?.nuptk || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>(
    currentUser?.employmentStatus || 'GTY'
  );
  const [bankName, setBankName] = useState(currentUser?.bankName || 'BPD DIY');
  const [accountNumber, setAccountNumber] = useState(currentUser?.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(
    currentUser?.accountHolder || currentUser?.name || ''
  );

  // Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback Messages
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isProfileModalOpen || !currentUser) return null;

  // Sync state when modal opens
  const handleOpenEdit = () => {
    setFullName(currentUser.name || '');
    setKtpNumber(currentUser.ktpNumber || '');
    setNuptk(currentUser.nuptk || '');
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '');
    setEmploymentStatus(currentUser.employmentStatus || 'GTY');
    setBankName(currentUser.bankName || 'BPD DIY');
    setAccountNumber(currentUser.accountNumber || '');
    setAccountHolder(currentUser.accountHolder || currentUser.name || '');
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Alamat email tidak valid.');
      return;
    }

    updateUserProfile({
      name: fullName.trim(),
      ktpNumber: ktpNumber.trim(),
      nuptk: nuptk.trim(),
      email: email.trim(),
      phone: phone.trim(),
      employmentStatus,
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
    });

    setIsEditing(false);
    setSuccessToast('Profil data kepegawaian Anda berhasil diperbarui!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage(
        'Kata sandi belum memenuhi seluruh kriteria keamanan (minimal 8 karakter, huruf besar, huruf kecil, dan angka).'
      );
      return;
    }

    const res = changePassword(newPassword);
    if (res.success) {
      setSuccessToast('Kata sandi berhasil diperbarui dengan aman!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessToast(null), 3000);
    } else {
      setErrorMessage(res.message);
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
      default:
        return 'GTY — Guru Tetap Yayasan';
    }
  };

  const isDeveloper =
    currentUser.username === 'benisiusbasuki24' ||
    currentUser.name.toLowerCase().includes('benisius');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header with School Branding */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base text-amber-300 shrink-0">
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
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-700/80 text-blue-100">
                    {currentUser.role === 'ADMIN' ? 'Administrator' : 'Guru / Staf'}
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                SD BOPKRI Gondolayu · Tagline: "{staffInfo.tagline}"
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
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
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Data Kepegawaian & Profil Diri</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('password');
              setErrorMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
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
                      Rincian Biodata Kepegawaian
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Tercatat pada Sistem Administrasi SD BOPKRI Gondolayu
                    </p>
                  </div>
                  <button
                    onClick={handleOpenEdit}
                    className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Edit Profil Saya</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  {/* Nama Lengkap */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Nama Lengkap
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {currentUser.name}
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
                      NUPTK
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
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-800" />
                    <span>Edit Profil & Data Kepegawaian</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Batal
                  </button>
                </div>

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
                    </select>
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
                    <span>Rekening Bank Penggajian</span>
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

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
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
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
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
                disabled={!isPasswordValid}
                className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Simpan Kata Sandi Baru</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 text-center">
          <p className="text-[10px] text-slate-400">
            Data kepegawaian dan akun SIBOGO dilindungi enkripsi sistem SD BOPKRI Gondolayu Yogyakarta.
          </p>
        </div>

      </div>
    </div>
  );
};
