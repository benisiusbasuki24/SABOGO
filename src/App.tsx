import React from 'react';
import { BillTypesView } from './components/BillTypesView';
import { BillsManagementView } from './components/BillsManagementView';
import { CashierPaymentModal } from './components/CashierPaymentModal';
import { CashierView } from './components/CashierView';
import { DashboardView } from './components/DashboardView';
import { FinancialReportView } from './components/FinancialReportView';
import { Header } from './components/Header';
import { InventoryView } from './components/InventoryView';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { MasterStaffView } from './components/MasterStaffView';
import { ReceiptModal } from './components/ReceiptModal';
import { SalarySlipModal } from './components/SalarySlipModal';
import { StudentsView } from './components/StudentsView';
import { TeacherMySlipsView } from './components/TeacherMySlipsView';
import { TeacherPayrollView } from './components/TeacherPayrollView';
import { TeachingAdministrationView } from './components/TeachingAdministrationView';
import { UserProfileModal } from './components/UserProfileModal';
import { WhatsAppReminderView } from './components/WhatsAppReminderView';
import { AppProvider, useApp } from './context/AppContext';
import { Download, Lock, RotateCcw, ShieldAlert, Smartphone, Sparkles, UserCheck } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    mainMenu,
    setMainMenu,
    currentUser,
    staffInfo,
    resetToDefaultData,
    setIsLoginModalOpen,
  } = useApp();

  // If user is not logged in, only show the LoginPage (form login dan nama aplikasi saja)
  if (!currentUser) {
    return <LoginPage />;
  }

  const isTeacher = currentUser?.role === 'TEACHER';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* If Teacher tries to access Menu Keuangan Sekolah */}
        {isTeacher && mainMenu === 'keuangan' ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center max-w-xl mx-auto my-10 shadow-xs animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Akses Terbatas: Menu Keuangan Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Menu Keuangan Sekolah (Loket Kasir, SPP Siswa, Data Siswa, Tagihan, dan Laporan Keuangan) dikhususkan untuk <strong>Bendahara & Administrator</strong> SD BOPKRI Gondolayu.
              <br className="hidden sm:inline" /> Anda sedang masuk sebagai Akun Guru (<strong>{currentUser?.name}</strong>).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setMainMenu('penggajian')}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Buka Slip Gaji Saya
              </button>
              <button
                onClick={() => setMainMenu('administrasi')}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Buka Administrasi Mengajar
              </button>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Masuk sebagai Admin</span>
              </button>
            </div>
          </div>
        ) : mainMenu === 'keuangan' ? (
          /* ==============================================================
             1. MENU KEUANGAN SEKOLAH (ADMIN / BENDAHARA / KASIR)
             ============================================================== */
          <>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'kasir' && <CashierView />}
            {activeTab === 'tagihan' && <BillsManagementView />}
            {activeTab === 'siswa' && <StudentsView />}
            {activeTab === 'laporan' && <FinancialReportView />}
            {activeTab === 'whatsapp' && <WhatsAppReminderView />}
            {activeTab === 'jenis-tagihan' && <BillTypesView />}
          </>
        ) : mainMenu === 'penggajian' ? (
          /* ==============================================================
             2. MENU PENGGAJIAN GURU & STAF
             ============================================================== */
          <>
            {isTeacher ? (
              <TeacherMySlipsView />
            ) : (
              <>
                {activeTab === 'master-guru' && <MasterStaffView />}
                {activeTab === 'penggajian' && <TeacherPayrollView />}
                {activeTab === 'my-slips' && <TeacherMySlipsView />}
              </>
            )}
          </>
        ) : mainMenu === 'administrasi' ? (
          /* ==============================================================
             3. MENU ADMINISTRASI MENGAJAR (MODUL AJAR, ATP, PROTA/PROMES)
             ============================================================== */
          <TeachingAdministrationView />
        ) : (
          /* ==============================================================
             4. MENU INVENTARISASI (ASET & SARANA PRASARANA SEKOLAH)
             ============================================================== */
          <InventoryView />
        )}

      </main>

      {/* Global Modals */}
      <LoginModal />
      <UserProfileModal />
      <CashierPaymentModal />
      <ReceiptModal />
      <SalarySlipModal />

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <img
                src="/src/assets/images/logo_bopkri_gondolayu.png"
                alt="Logo BOPKRI"
                className="w-5 h-5 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-extrabold text-blue-950">SIBOGO</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-700">{staffInfo.schoolName}</span>
              <span className="hidden lg:inline text-blue-800 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                "{staffInfo.tagline || 'Cerdas Berkarakter'}"
              </span>
            </div>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-slate-500">
              {staffInfo.address} · Telp: {staffInfo.phone} · Web: {staffInfo.website || 'www.sdbopkrigondolayu.sch.id'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-slate-400">
            <a
              href="./SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
              download="SIBOGO_BOPKRI_Gondolayu_v1.0.apk"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-md transition-colors"
              title="Unduh file aplikasi Android (APK) SIBOGO untuk dipasang di smartphone Android"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh APK Android</span>
              <Download className="w-3 h-3 text-emerald-600" />
            </a>
            <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Penanggung Jawab & Pengembang: <strong>{staffInfo.appDeveloper || 'Benisius Rahmat Basuki, S.Pd'}</strong>
            </span>
            <button
              onClick={resetToDefaultData}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors ml-1"
              title="Reset data ke contoh awal SD BOPKRI Gondolayu"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Data Contoh
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
