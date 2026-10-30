import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BOPKRI_LOGO, handleImageError } from '../assets/logo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { UserRole } from '../types';
import { generateUniqueUserCode } from '../utils/uniqueCode';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, registerUser, staffInfo, students, registeredUsers } = useApp();

  // Mode: 'LOGIN' (default) or 'REGISTER'
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('GURU');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('08');
  const [regNip, setRegNip] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [regStudentName, setRegStudentName] = useState('');
  const [regStudentNis, setRegStudentNis] = useState('');
  const [regStudentGrade, setRegStudentGrade] = useState('Kelas 1A');
  const [assignedUniqueCode] = useState(() => {
    const existing = (registeredUsers || []).map((u) => u.uniqueCode).filter(Boolean) as string[];
    return generateUniqueUserCode(existing);
  });

  // Filtered students for dropdown
  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q) ||
        (s.parentName && s.parentName.toLowerCase().includes(q))
    );
  }, [students, studentSearch]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Silakan masukkan Username, Kode Unik, atau NIP Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(loginIdentifier, loginPassword);
      if (result.success) {
        setSuccessMessage(result.message);
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage('Terjadi kendala saat menghubungi database. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUsername = regUsername.trim().toLowerCase();

    // Validation: Username must be at least 8 characters
    if (cleanUsername.length < 8) {
      setErrorMessage('Username minimal harus terdiri dari 8 karakter!');
      return;
    }

    if (!regName.trim() || !regPassword.trim() || !regEmail.trim()) {
      setErrorMessage('Nama lengkap, kata sandi, dan alamat email wajib diisi.');
      return;
    }

    // Role-specific validation: Orang Tua must choose a student from the school student list
    if (regRole === 'ORANG_TUA' && !selectedStudentId) {
      setErrorMessage('Wajib memilih siswa putra/putri Anda dari dropdown daftar seluruh siswa sekolah.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        name: regName.trim(),
        username: cleanUsername,
        password: regPassword.trim(),
        role: regRole,
        uniqueCode: assignedUniqueCode,
        email: regEmail.trim(),
        phone: regPhone.trim(),
        nip: regNip.trim() || undefined,
        studentId: regRole === 'ORANG_TUA' ? selectedStudentId : undefined,
        studentName: regRole === 'ORANG_TUA' ? regStudentName.trim() || undefined : undefined,
        studentNis: regRole === 'ORANG_TUA' ? regStudentNis.trim() || undefined : undefined,
        studentGrade: regRole === 'ORANG_TUA' ? regStudentGrade.trim() || undefined : undefined,
      });

      if (res.success) {
        const finalCode = res.user?.uniqueCode || assignedUniqueCode;
        setSuccessMessage(
          `Pendaftaran akun berhasil! Nomor Urut Registrasi / Kode Unik Anda: ${finalCode}. Anda dapat langsung masuk dengan username atau kode unik tersebut.`
        );
        // Prefill login
        setLoginIdentifier(cleanUsername);
        setLoginPassword(regPassword.trim());
        // Switch to login tab after brief pause
        setTimeout(() => {
          setActiveTab('LOGIN');
        }, 2000);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Terjadi kendala pendaftaran ke database cloud. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header Row with Minimal Branding */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <img
            src={BOPKRI_LOGO}
            onError={handleImageError}
            alt="SD BOPKRI Gondolayu"
            className="w-9 h-9 object-contain"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>SIBOGO</span>
              <span className="text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded">
                BOPKRI Gondolayu
              </span>
            </span>
            <p className="text-[10px] text-slate-400">
              Sistem Informasi BOPKRI Gondolayu
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Portal Masuk Terpadu SD BOPKRI Gondolayu</span>
        </div>
      </header>

      {/* Main Center Area */}
      <main className="max-w-md w-full mx-auto my-6 sm:my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Hero Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-white/10 border border-white/15 rounded-2xl shadow-xl backdrop-blur-md mb-1">
            <img
              src={BOPKRI_LOGO}
              onError={handleImageError}
              alt="Logo SD BOPKRI Gondolayu"
              className="w-13 h-13 object-contain drop-shadow"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            SIBOGO
          </h1>
          
          <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
            <span className="text-xs sm:text-sm font-semibold text-blue-200">
              Sistem Informasi SD BOPKRI Gondolayu
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              "{staffInfo.tagline || 'Cerdas Berkarakter'}"
            </span>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          
          {/* Default Login & Register Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'LOGIN'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('REGISTER');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'REGISTER'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-7 space-y-4">
            
            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: FORM LOGIN (DEFAULT TAMPILAN) */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-150">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username / NIP / Email Pengguna
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: benisiusbasuki24 atau filipuswawan"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium transition-all"
                    />
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Kata Sandi / PIN
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Bawaan contoh: <strong>123</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi (atau 123)"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium transition-all"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      Lupa Username atau Kata Sandi?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Memproses Masuk...' : 'Masuk ke Aplikasi SIBOGO'}</span>
                </button>

              </form>
            )}

            {/* TAB 2: FORM REGISTER (DAFTAR AKUN BARU) */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in duration-150">
                
                {/* 1. Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Hendrik Prasetyo atau Maria S.Pd"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* 2. Pilihan Jenis Pengguna (6 User Roles) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Pengguna (Role Akun) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-bold"
                  >
                    <option value="KEPALA_SEKOLAH">Kepala Sekolah (Approval, View Gaji & Keuangan)</option>
                    <option value="BENDAHARA">Bendahara (Approval Keuangan, Full Keuangan & Gaji)</option>
                    <option value="TATA_USAHA">Tata Usaha (Kasir, Data Siswa, SPMB, Sarpras)</option>
                    <option value="GURU">Guru (Slip Gaji Saya & Administrasi Modul Ajar)</option>
                    <option value="STAFF">Staff / Karyawan (Slip Gaji Saya & Sarpras)</option>
                    <option value="ORANG_TUA">Orang Tua Murid (Cek Tagihan & Riwayat Pembayaran)</option>
                  </select>
                </div>

                {/* 3. Username with STRICT MINIMUM 8 CHARACTERS Validation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Username Baru <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        regUsername.trim().length >= 8
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {regUsername.trim().length}/8 Karakter (Min. 8)
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Minimal 8 karakter (contoh: mariaguru26)"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:bg-white text-slate-900 font-mono ${
                        regUsername.length > 0 && regUsername.length < 8
                          ? 'border-amber-400 focus:ring-amber-500'
                          : regUsername.length >= 8
                          ? 'border-emerald-400 focus:ring-emerald-500'
                          : 'border-slate-300 focus:ring-blue-600'
                      }`}
                    />
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {regUsername.length > 0 && regUsername.length < 8 && (
                    <span className="text-[10px] text-amber-700 font-medium mt-1 block">
                      ⚠️ Username masih kurang {8 - regUsername.length} karakter lagi.
                    </span>
                  )}
                </div>

                {/* 4. Kata Sandi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi / PIN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Masukkan kata sandi akun"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* 5. Email & WhatsApp */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Alamat Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      No. WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08123456789"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Conditional Fields: If Orang Tua -> DROPDOWN SELURUH SISWA SEKOLAH */}
                {regRole === 'ORANG_TUA' && (
                  <div className="p-3 bg-blue-50/90 border-2 border-blue-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-700" />
                        <span>Pilih Siswa (Seluruh Siswa Sekolah)</span>
                        <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[10px] font-extrabold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                        {students.length} Siswa Terdaftar
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Silakan pilih nama putra/putri Anda dari dropdown daftar seluruh siswa sekolah agar tagihan SPP dan riwayat pembayaran otomatis terhubung:
                    </p>

                    {/* Quick Search Filter */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ketik untuk mencari nama, NIS, atau kelas siswa..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-blue-300 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    </div>

                    {/* DROPDOWN SELURUH SISWA SEKOLAH */}
                    <div>
                      <select
                        required
                        value={selectedStudentId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedStudentId(val);
                          const found = students.find((s) => s.id === val);
                          if (found) {
                            setRegStudentName(found.name);
                            setRegStudentNis(found.nis);
                            setRegStudentGrade(found.grade);
                            if (found.parentPhone && (!regPhone || regPhone === '08')) {
                              setRegPhone(found.parentPhone);
                            }
                          } else {
                            setRegStudentName('');
                            setRegStudentNis('');
                            setRegStudentGrade('Kelas 1A');
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-400 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold shadow-xs cursor-pointer"
                      >
                        <option value="">
                          -- Klik Disini untuk Memilih Siswa ({filteredStudents.length} Siswa) --
                        </option>
                        {filteredStudents.map((s) => (
                          <option key={s.id} value={s.id}>
                            [{s.grade}] {s.name} — NIS: {s.nis} {s.parentName ? `(Wali: ${s.parentName})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Rincian Siswa Terpilih */}
                    {selectedStudentId && (
                      <div className="p-2.5 bg-white border border-emerald-300 rounded-xl shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Siswa Terhubung: <strong>{regStudentName}</strong></span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                          <div>NIS: <strong className="text-slate-800 font-mono">{regStudentNis}</strong></div>
                          <div>Kelas: <strong className="text-slate-800">{regStudentGrade}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional Fields: If Guru / Staff / Kepsek / Bendahara / TU */}
                {regRole !== 'ORANG_TUA' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      NIP / NUPTK / Posisi Jabatan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 198402102010012005 atau Guru Agama"
                      value={regNip}
                      onChange={(e) => setRegNip(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                    />
                  </div>
                )}

                {/* Kode Unik Registrasi 8 Karakter (4 Huruf & 4 Angka) */}
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-amber-950 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Nomor Registrasi & Kode Unik Akun:
                    </span>
                    <p className="text-[10px] text-amber-900/90 leading-tight">
                      Kombinasi 4 angka & 4 huruf unik per username (dapat digunakan untuk login).
                    </p>
                  </div>
                  <div className="font-mono font-black text-xs sm:text-sm text-blue-950 bg-white px-2.5 py-1 rounded-xl border border-amber-400 shadow-2xs tracking-widest shrink-0">
                    {assignedUniqueCode}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || regUsername.trim().length < 8}
                  className={`w-full py-2.5 px-4 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    regUsername.trim().length < 8
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-blue-900 hover:bg-blue-950'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun SIBOGO</span>
                </button>

              </form>
            )}

            <ForgotPasswordModal
              isOpen={isForgotPasswordOpen}
              onClose={() => setIsForgotPasswordOpen(false)}
              onSuccessPrefill={(uname) => {
                setLoginIdentifier(uname);
                setLoginPassword('123');
              }}
            />

          </div>

        </div>

      </main>

      {/* Dynamic Footer Information */}
      <footer className="max-w-6xl w-full mx-auto text-center py-3 text-xs text-slate-400 border-t border-white/10 space-y-1">
        <p className="text-slate-300 font-semibold">
          {staffInfo.schoolName} ({staffInfo.foundationName})
        </p>
        <p className="text-[11px] text-slate-500">
          {staffInfo.address} · Telp: {staffInfo.phone} · Web: {staffInfo.website || 'www.sdbopkrigondolayu.sch.id'}
        </p>
        <p className="text-[11px] text-slate-400 pt-0.5">
          © 2024 SIBOGO - SD BOPKRI Gondolayu. All rights reserved.
        </p>
        <p className="text-[10px] text-amber-400/90 font-medium">
          superadmin & apps developer: Benisius R.B
        </p>
      </footer>

    </div>
  );
};
