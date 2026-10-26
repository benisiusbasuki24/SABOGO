import React from 'react';
import { AdminDataPurgeModal } from './components/AdminDataPurgeModal';
import { ApprovalCenterView } from './components/ApprovalCenterView';
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
import { ParentPortalView } from './components/ParentPortalView';
import { ReceiptModal } from './components/ReceiptModal';
import { SalarySlipModal } from './components/SalarySlipModal';
import { SPMBView } from './components/SPMBView';
import { StudentsView } from './components/StudentsView';
import { TeacherMySlipsView } from './components/TeacherMySlipsView';
import { TeacherPayrollView } from './components/TeacherPayrollView';
import { TeachingAdministrationView } from './components/TeachingAdministrationView';
import { UserProfileModal } from './components/UserProfileModal';
import { WhatsAppReminderView } from './components/WhatsAppReminderView';
import { AppProvider, useApp } from './context/AppContext';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    mainMenu,
    setMainMenu,
    currentUser,
    staffInfo,
    resetToDefaultData,
    isSuperAdmin,
    toasts,
    removeToast,
  } = useApp();

  // If user is not logged in, render LoginPage
  if (!currentUser) {
    return <LoginPage />;
  }

  const isOrangTua = currentUser.role === 'ORANG_TUA';
  const isKepalaSekolah = currentUser.role === 'KEPALA_SEKOLAH';
  const isBendahara = currentUser.role === 'BENDAHARA';
  const isGuruOrStaff = currentUser.role === 'GURU' || currentUser.role === 'STAFF' || currentUser.role === 'TEACHER';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ==============================================================
           1. ORANG TUA: RESTRICTED SOLELY TO STUDENT INVOICE & HISTORY
           ============================================================== */}
        {isOrangTua ? (
          <ParentPortalView />
        ) : mainMenu === 'portal-ortu' ? (
          <ParentPortalView />
        ) : mainMenu === 'approval' ? (
          /* ==============================================================
             2. APPROVAL CENTER VIEW (KEPALA SEKOLAH / BENDAHARA / ADMIN)
             ============================================================== */
          <ApprovalCenterView />
        ) : mainMenu === 'spmb' ? (
          /* ==============================================================
             3. SPMB (PENERIMAAN MURID BARU DENGAN AUTO NIS & EMAIL NOTIFIKASI)
             ============================================================== */
          <SPMBView />
        ) : mainMenu === 'keuangan' ? (
          /* ==============================================================
             4. MENU KEUANGAN SEKOLAH (ADMIN / BENDAHARA / VIEW FOR KEPSEK & GURU)
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
             5. MENU PENGGAJIAN GURU & STAF
             ============================================================== */
          <>
            {isGuruOrStaff ? (
              <TeacherMySlipsView />
            ) : isKepalaSekolah ? (
              <TeacherPayrollView />
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
             6. MENU ADMINISTRASI MENGAJAR
             ============================================================== */
          <TeachingAdministrationView />
        ) : (
          /* ==============================================================
             7. MENU INVENTARISASI SEKOLAH
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
      <AdminDataPurgeModal />

      {/* GLOBAL FLOATING TOAST NOTIFICATION STACK */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl shadow-xl border animate-in slide-in-from-top-3 fade-in duration-200 ${
                isSuccess
                  ? 'bg-slate-900 text-white border-slate-700/80 shadow-blue-950/20'
                  : isWarning
                  ? 'bg-amber-900 text-amber-50 border-amber-700 shadow-amber-950/20'
                  : isError
                  ? 'bg-rose-950 text-rose-50 border-rose-800 shadow-rose-950/20'
                  : 'bg-blue-950 text-blue-50 border-blue-800 shadow-blue-950/20'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isWarning && <AlertCircle className="w-4 h-4 text-amber-300" />}
                  {isError && <AlertTriangle className="w-4 h-4 text-rose-300" />}
                  {!isSuccess && !isWarning && !isError && (
                    <Info className="w-4 h-4 text-blue-300" />
                  )}
                </div>
                <div className="text-xs font-semibold leading-relaxed">
                  {toast.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white p-0.5 rounded transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Clean & Professional Dynamic Footer */}
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

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
            {/* Dynamic Copyright notice */}
            <p className="text-slate-600 font-medium">
              © 2024 SIBOGO - SD BOPKRI Gondolayu. All rights reserved.
            </p>
            <span aria-hidden="true">·</span>
            {/* Superadmin & Apps Developer */}
            <span className="text-blue-950 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              superadmin & apps developer: <strong>Benisius R.B</strong>
            </span>

            {/* Reset Data Contoh button: ONLY SHOWN IF LOGGED IN USER IS BENISIUS (SUPER ADMIN) */}
            {isSuperAdmin && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  onClick={resetToDefaultData}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors"
                  title="Reset seluruh data ke contoh awal SD BOPKRI Gondolayu (Khusus Super Admin)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Data Contoh</span>
                </button>
              </>
            )}
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
