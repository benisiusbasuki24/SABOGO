import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Crown,
  Download,
  KeyRound,
  Lock,
  LogIn,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, staffInfo } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan Username atau NIP Anda.');
      return;
    }

    setIsLoading(true);
    const result = login(identifier, password);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleQuickLogin = (uname: string, pwd = '123') => {
    setIdentifier(uname);
    setPassword(pwd);
    setErrorMessage(null);
    setIsLoading(true);
    const result = login(uname, pwd);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Bar with Minimal Branding */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <img
            src="/src/assets/images/logo_bopkri_gondolayu.png"
            alt="SD BOPKRI Gondolayu"
            className="w-9 h-9 object-contain"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
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

      {/* Main Center Area: Form Login dan Nama Aplikasi */}
      <main className="max-w-md w-full mx-auto my-6 sm:my-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Hero Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-white/10 border border-white/15 rounded-2xl shadow-xl backdrop-blur-md mb-1">
            <img
              src="/src/assets/images/logo_bopkri_gondolayu.png"
              alt="Logo SD BOPKRI Gondolayu"
              className="w-14 h-14 object-contain drop-shadow"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            SIBOGO
          </h1>
          
          <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
            <span className="text-sm font-semibold text-blue-200">
              Sistem Informasi BOPKRI Gondolayu
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              "{staffInfo.tagline || 'Cerdas Berkarakter'}"
            </span>
          </div>

          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed pt-1">
            Silakan masuk untuk mengakses menu Keuangan Sekolah, Penggajian, Administrasi Mengajar, dan Inventarisasi.
          </p>
        </div>

        {/* Login Card Container */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          
          {/* Card Top Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Form Masuk Akun
              </span>
            </div>
            <span className="text-[11px] font-semibold text-blue-200">
              T.A. {staffInfo.academicYear}
            </span>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-7 space-y-5">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username / NIP / Email Pengguna
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: benisiusbasuki24 atau admin"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium transition-all"
                  />
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Memproses Masuk...' : 'Masuk ke Aplikasi SIBOGO'}</span>
              </button>
            </form>

            <ForgotPasswordModal
              isOpen={isForgotPasswordOpen}
              onClose={() => setIsForgotPasswordOpen(false)}
              onSuccessPrefill={(uname) => {
                setIdentifier(uname);
                setPassword('123');
              }}
            />

            {/* In-App Android APK Direct Download Banner */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0 leading-tight">
                  <span className="text-xs font-bold text-emerald-950 block truncate">
                    Aplikasi Android SIBOGO (APK)
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    v1.0 Resmi · 1.5 MB · Standalone
                  </span>
                </div>
              </div>
              <a
                href="./SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
                download="SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh APK</span>
              </a>
            </div>

            {/* Quick Demo Logins Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pilihan Masuk Cepat (Akun Staf):
                </span>
                <span className="text-[10px] text-slate-400">Klik untuk langsung masuk</span>
              </div>

              {/* PRIMARY PROMINENT CARD: BENISIUS RAHMAT BASUKI (Penanggung Jawab & Pengembang SIBOGO) */}
              <button
                type="button"
                onClick={() => handleQuickLogin('benisiusbasuki24', '123')}
                className="w-full p-3 text-left border-2 border-amber-400/90 bg-gradient-to-r from-amber-50 via-blue-50/50 to-indigo-50 hover:from-amber-100 hover:to-indigo-100 rounded-2xl transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs border border-amber-300/40 group-hover:scale-105 transition-transform">
                      <Crown className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="leading-tight">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-blue-950 group-hover:text-blue-700">
                          Benisius Rahmat Basuki, S.Pd
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-400 text-amber-950 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          Penanggung Jawab & Pengembang
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        user: <strong>benisiusbasuki24</strong> (Hak Akses Penuh Admin)
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-700 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </button>

              {/* Secondary Quick Logins Grid */}
              <div className="grid grid-cols-2 gap-2 text-left">
                
                {/* Bendahara */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', '123')}
                  className="p-2 border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 rounded-xl transition-all group"
                >
                  <span className="text-[11px] font-bold text-slate-800 block truncate group-hover:text-blue-900">
                    Ibu Eni Utaminingsih
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate">
                    Bendahara Sekolah (SPP/Kasir)
                  </span>
                </button>

                {/* Kepala Sekolah */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('suhari.irawan', '123')}
                  className="p-2 border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 rounded-xl transition-all group"
                >
                  <span className="text-[11px] font-bold text-slate-800 block truncate group-hover:text-blue-900">
                    Bp. FX. Suhari Irawan
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate">
                    Kepala Sekolah (Monitoring)
                  </span>
                </button>

                {/* Kasir Nastiti */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('nastiti.ken', '123')}
                  className="p-2 border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 rounded-xl transition-all group"
                >
                  <span className="text-[11px] font-bold text-slate-800 block truncate group-hover:text-blue-900">
                    Nastiti Ken Utami
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate">
                    Kasir & Staf Tata Usaha
                  </span>
                </button>

                {/* Guru Kelas (Maria Kristianti) */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('maria.kristianti', '123')}
                  className="p-2 border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 rounded-xl transition-all group"
                >
                  <span className="text-[11px] font-bold text-slate-800 block truncate group-hover:text-blue-900">
                    Ibu Maria Kristianti
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate">
                    Guru Kelas (Slip & Modul)
                  </span>
                </button>

              </div>

            </div>

          </div>

          {/* Card Footer Note */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-2.5 text-center">
            <p className="text-[10px] text-slate-400">
              SD BOPKRI Gondolayu · Menumbuhkan Iman, Ilmu, dan Karakter Kasih
            </p>
          </div>

        </div>

      </main>

      {/* Bottom Footer Information */}
      <footer className="max-w-6xl w-full mx-auto text-center py-3 text-xs text-slate-400 border-t border-white/10 space-y-1">
        <p className="text-slate-300 font-semibold">
          {staffInfo.schoolName} ({staffInfo.foundationName})
        </p>
        <p className="text-[11px] text-slate-500">
          {staffInfo.address} · Telp: {staffInfo.phone} · Web: {staffInfo.website || 'www.sdbopkrigondolayu.sch.id'}
        </p>
        <p className="text-[11px] text-amber-400/90 font-medium pt-1">
          Penanggung Jawab & Pengembang Aplikasi: <strong>{staffInfo.appDeveloper || 'Benisius Rahmat Basuki, S.Pd'}</strong>
        </p>
      </footer>

    </div>
  );
};
