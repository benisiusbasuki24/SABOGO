import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  Send,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPrefill?: (username: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessPrefill,
}) => {
  const { forgotPasswordOrUsername, staffInfo } = useApp();
  const [identifierOrEmail, setIdentifierOrEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    details?: {
      username: string;
      email: string;
      name: string;
      role: string;
      tempPassword?: string;
    };
  } | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (!identifierOrEmail.trim()) {
      setErrorMessage('Silakan masukkan email atau username terdaftar Anda.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const res = forgotPasswordOrUsername(identifierOrEmail);
      setIsSending(false);

      if (res.success) {
        setSuccessInfo({
          message: res.message,
          details: res.details,
        });
      } else {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleReturnToLogin = () => {
    if (successInfo?.details?.username && onSuccessPrefill) {
      onSuccessPrefill(successInfo.details.username);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Lupa Username / Kata Sandi</h2>
              <p className="text-xs text-blue-200">
                SD BOPKRI Gondolayu · {staffInfo.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {!successInfo ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Masukkan <strong>alamat email</strong> atau <strong>username/NIP</strong> Anda yang terdaftar di SD BOPKRI Gondolayu. Sistem akan memverifikasi data dan mengirimkan rincian akun ke email Anda.
              </p>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Terdaftar atau Username / NIP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: benisiusbasuki24@guru.sd.belajar.id"
                    value={identifierOrEmail}
                    onChange={(e) => setIdentifierOrEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Mengirim Data...' : 'Kirim Data ke Email'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* SUCCESS CONFIRMATION BOX */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Email Pemulihan Berhasil Terkirim!</span>
                </div>
                <p className="leading-relaxed">
                  Informasi akun SIBOGO Anda telah dikirimkan ke alamat email terdaftar:
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 font-mono font-bold text-emerald-950 text-xs">
                  {successInfo.details?.email}
                </div>
              </div>

              {/* Account Recovery Summary Card */}
              {successInfo.details && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Rincian Akun Terdaftar:
                  </span>
                  <div className="space-y-1 text-slate-700">
                    <div>
                      Nama Pegawai: <strong className="text-slate-900">{successInfo.details.name}</strong>
                    </div>
                    <div>
                      Peran/Jabatan: <span className="text-slate-800">{successInfo.details.role}</span>
                    </div>
                    <div>
                      Username Login: <strong className="font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{successInfo.details.username}</strong>
                    </div>
                    <div>
                      Kata Sandi Default / Tercatat:{' '}
                      <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {successInfo.details.tempPassword}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleReturnToLogin}
                className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Kembali ke Halaman Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-2.5 text-center">
          <p className="text-[10px] text-slate-400">
            Butuh bantuan lain? Hubungi Bagian Tata Usaha SD BOPKRI Gondolayu.
          </p>
        </div>

      </div>
    </div>
  );
};
