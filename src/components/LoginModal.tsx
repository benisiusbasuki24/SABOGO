import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { UserRole } from '../types';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Crown,
  KeyRound,
  Lock,
  LogIn,
  User,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, registerUser, staffInfo } = useApp();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('GURU');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('08');

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan Username atau NIP Anda.');
      return;
    }

    const result = login(identifier, password);
    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setSuccessMessage(null);
        setIdentifier('');
        setPassword('');
      }, 700);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleQuickLoginBenisius = () => {
    setIdentifier('benisiusbasuki24');
    setPassword('123');
    setErrorMessage(null);
    const result = login('benisiusbasuki24', '123');
    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        setIsLoginModalOpen(false);
        setSuccessMessage(null);
      }, 700);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUsername = regUsername.trim().toLowerCase();

    // Username validation: minimum 8 characters
    if (cleanUsername.length < 8) {
      setErrorMessage('Username minimal harus 8 karakter!');
      return;
    }

    if (!regName.trim() || !regPassword.trim() || !regEmail.trim()) {
      setErrorMessage('Nama lengkap, kata sandi, dan email wajib diisi.');
      return;
    }

    const res = registerUser({
      name: regName.trim(),
      username: cleanUsername,
      password: regPassword.trim(),
      role: regRole,
      email: regEmail.trim(),
      phone: regPhone.trim(),
    });

    if (res.success) {
      setSuccessMessage(`${res.message} Silakan masuk.`);
      setIdentifier(cleanUsername);
      setPassword(regPassword.trim());
      setTimeout(() => {
        setActiveTab('LOGIN');
      }, 1400);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Lock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Portal Masuk & Pendaftaran SIBOGO</h2>
              <p className="text-[11px] text-blue-200">SD BOPKRI Gondolayu Yogyakarta</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk Akun</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('REGISTER');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'REGISTER'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Akun Baru</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username / NIP / Email Pengguna
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Contoh: benisiusbasuki24 atau mariakristianti"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                    required
                  />
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Kata Sandi / PIN
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Bawaan contoh: <strong>123</strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Masukkan kata sandi atau 123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <div className="text-right mt-1">
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
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun</span>
              </button>

              {/* SINGLE SUPER ADMIN SHORTCUT */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 text-center">
                  Akses Cepat Pengembang:
                </span>
                <button
                  type="button"
                  onClick={handleQuickLoginBenisius}
                  className="w-full p-2.5 text-left border-2 border-amber-400/90 bg-gradient-to-r from-amber-50 to-blue-50 hover:from-amber-100 hover:to-blue-100 rounded-xl transition-all shadow-2xs group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-950 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <div className="leading-tight">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-blue-950">
                          Benisius Rahmat Basuki, S.Pd
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-400 text-amber-950">
                          Super Admin
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        user: benisiusbasuki24
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-800 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap beserta gelar jika ada"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Pengguna (Role) <span className="text-red-500">*</span>
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-bold"
                >
                  <option value="KEPALA_SEKOLAH">Kepala Sekolah (Approval, Monitoring)</option>
                  <option value="BENDAHARA">Bendahara (Keuangan Penuh & Gaji)</option>
                  <option value="TATA_USAHA">Tata Usaha (Kasir, Siswa, SPMB)</option>
                  <option value="GURU">Guru (Slip Gaji & Modul Ajar)</option>
                  <option value="STAFF">Staff / Karyawan (Slip Gaji & Sarpras)</option>
                  <option value="ORANG_TUA">Orang Tua Murid (Cek Tagihan)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Username Baru <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-bold ${regUsername.trim().length >= 8 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {regUsername.trim().length}/8 (Min. 8)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Minimal 8 karakter"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regUsername.trim().length < 8}
                className={`w-full py-2.5 px-4 text-white font-bold text-xs rounded-xl shadow-xs transition-all ${
                  regUsername.trim().length < 8 ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-950 cursor-pointer'
                }`}
              >
                Daftar Akun SIBOGO
              </button>
            </form>
          )}

          <ForgotPasswordModal
            isOpen={isForgotPasswordOpen}
            onClose={() => setIsForgotPasswordOpen(false)}
            onSuccessPrefill={(uname) => {
              setIdentifier(uname);
              setPassword('123');
            }}
          />

        </div>

      </div>
    </div>
  );
};
