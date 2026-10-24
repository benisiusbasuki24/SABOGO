import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import {
  CheckCircle2,
  Code2,
  Crown,
  GraduationCap,
  KeyRound,
  Lock,
  LogIn,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, teachers, staffInfo } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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

  const handleQuickLogin = (uname: string, pwd = '123') => {
    setIdentifier(uname);
    setPassword(pwd);
    setErrorMessage(null);
    const result = login(uname, pwd);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <Lock className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Portal SIBOGO Guru & Admin</h2>
              <p className="text-xs text-blue-200">Sistem Informasi SD BOPKRI Gondolayu</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Rule Banner */}
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 text-xs text-blue-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Hak Akses:</strong> Admin mengelola seluruh 4 menu utama. Akun Guru terisolasi pada slip gaji & administrasi ajar.
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="font-semibold">Perhatian:</span> {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username / NIP / Email Pengguna
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: benisiusbasuki24 atau admin"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                  required
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi / PIN <span className="font-normal text-slate-400">(Bawaan contoh: 123)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Masukkan kata sandi atau 123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
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
              className="w-full py-2.5 px-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun</span>
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

          {/* QUICK LOGIN PRESETS */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pilihan Masuk Cepat (Akun Pengembang & Staf):
            </p>

            {/* PRIORITY CARD: BENISIUS RAHMAT BASUKI (Penanggung Jawab & Pengembang Aplikasi) */}
            <button
              type="button"
              onClick={() => handleQuickLogin('benisiusbasuki24', '123')}
              className="w-full p-3.5 text-left border-2 border-amber-400/80 bg-gradient-to-r from-amber-50 via-blue-50/40 to-indigo-50 hover:from-amber-100/90 hover:to-indigo-100 rounded-xl transition-all shadow-xs group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-black text-sm shrink-0 shadow-xs border border-amber-300/40 group-hover:scale-105 transition-transform">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-blue-950 group-hover:text-blue-800">
                        Benisius Rahmat Basuki, S.Pd
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-900" />
                        Penanggung Jawab & Pengembang
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                      Hak Akses Penuh: Keuangan, Penggajian, Administrasi Mengajar & Inventarisasi
                    </p>
                    <p className="text-[10px] font-mono text-blue-800 mt-0.5">
                      user: <strong>benisiusbasuki24</strong> · {`benisiusbasuki24@guru.sd.belajar.id`}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-blue-800 bg-white border border-blue-200 px-2 py-1 rounded-lg shrink-0 group-hover:bg-blue-800 group-hover:text-white transition-colors">
                  Masuk Admin
                </span>
              </div>
            </button>

            {/* Other Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              
              {/* Admin / Bendahara (Eni Utaminingsih) */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', '123')}
                className="p-2.5 text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                    EU
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:underline">
                    Ibu Eni Utaminingsih
                  </span>
                </div>
                <p className="text-[10px] text-slate-600">Bendahara (Keuangan & SPP)</p>
                <p className="text-[10px] font-mono text-slate-500">user: admin</p>
              </button>

              {/* Kepala Sekolah (FX. Suhari Irawan) */}
              <button
                type="button"
                onClick={() => handleQuickLogin('suhari.irawan', '123')}
                className="p-2.5 text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-bold">
                    SI
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:underline">
                    Bp. FX. Suhari Irawan
                  </span>
                </div>
                <p className="text-[10px] text-slate-600">Kepala Sekolah (Akses Pengawasan)</p>
                <p className="text-[10px] font-mono text-slate-500">user: suhari.irawan</p>
              </button>

              {/* Maria Kristianti (Guru) */}
              <button
                type="button"
                onClick={() => handleQuickLogin('maria.kristianti', '123')}
                className="p-2.5 text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-700 text-white flex items-center justify-center text-xs font-bold">
                    MK
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:underline">
                    Ibu Maria Kristianti
                  </span>
                </div>
                <p className="text-[10px] text-slate-600">Guru Kelas 3A (Slip & Dokumen)</p>
                <p className="text-[10px] font-mono text-slate-500">user: maria.kristianti</p>
              </button>

              {/* Yohanes Paulus (Guru Agama) */}
              <button
                type="button"
                onClick={() => handleQuickLogin('yohanes.setiawan', '123')}
                className="p-2.5 text-left border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                    YP
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:underline">
                    Bp. Yohanes Paulus
                  </span>
                </div>
                <p className="text-[10px] text-slate-600">Guru Agama Kristen (Slip & Modul)</p>
                <p className="text-[10px] font-mono text-slate-500">user: yohanes.setiawan</p>
              </button>

            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-2.5 text-center">
          <p className="text-[11px] text-slate-500">
            Aplikasi SIBOGO dikembangkan & dikelola oleh <strong>Benisius Rahmat Basuki, S.Pd</strong> untuk SD BOPKRI Gondolayu Yogyakarta.
          </p>
        </div>

      </div>
    </div>
  );
};
