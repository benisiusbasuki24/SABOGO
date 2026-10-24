import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Banknote,
  BookOpen,
  Boxes,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Landmark,
  Layers,
  LogOut,
  MessageSquare,
  Package,
  PieChart,
  Settings,
  ShieldCheck,
  Upload,
  User,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { AppNavTab, MainMenuType } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    mainMenu,
    setMainMenu,
    currentUser,
    logout,
    setIsLoginModalOpen,
    setIsProfileModalOpen,
  } = useApp();

  const isTeacher = currentUser?.role === 'TEACHER';
  const isDeveloper =
    currentUser?.username === 'benisiusbasuki24' ||
    currentUser?.name.toLowerCase().includes('benisius');

  // Sub-navigation tabs for Menu Keuangan Sekolah
  const financialSubNav: { id: AppNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Ringkasan', icon: <PieChart className="w-3.5 h-3.5" /> },
    { id: 'kasir', label: 'Loket Kasir', icon: <Banknote className="w-3.5 h-3.5" /> },
    { id: 'tagihan', label: 'Tagihan Uang Sekolah', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { id: 'siswa', label: 'Data Siswa', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'laporan', label: 'Laporan Keuangan', icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: 'whatsapp', label: 'Pengingat WA', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'jenis-tagihan', label: 'Pos Tagihan', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  // Sub-navigation tabs for Menu Penggajian
  const payrollSubNav: { id: AppNavTab; label: string; icon: React.ReactNode }[] = isTeacher
    ? [
        { id: 'my-slips', label: 'Slip Gaji Saya', icon: <FileText className="w-3.5 h-3.5" /> },
      ]
    : [
        { id: 'penggajian', label: 'Kelola Gaji Guru & Staf', icon: <Wallet className="w-3.5 h-3.5" /> },
        { id: 'my-slips', label: 'Slip Gaji Saya', icon: <FileText className="w-3.5 h-3.5" /> },
      ];

  // Sub-navigation tabs for Menu Administrasi Mengajar
  const adminMengajarSubNav: { id: AppNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'administrasi-guru', label: 'Perangkat & Dokumen Ajar', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  // Sub-navigation tabs for Menu Inventarisasi
  const inventorySubNav: { id: AppNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'inventarisasi', label: 'Daftar & Rekap Aset Inventaris', icon: <Boxes className="w-3.5 h-3.5" /> },
  ];

  const handleSelectMainMenu = (menu: MainMenuType) => {
    setMainMenu(menu);
  };

  const getActiveSubNav = () => {
    switch (mainMenu) {
      case 'keuangan':
        return financialSubNav;
      case 'penggajian':
        return payrollSubNav;
      case 'administrasi':
        return adminMengajarSubNav;
      case 'inventarisasi':
        return inventorySubNav;
      default:
        return financialSubNav;
    }
  };

  const activeSubNav = getActiveSubNav();

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => {
            if (isTeacher) {
              setMainMenu('penggajian');
              setActiveTab('my-slips');
            } else {
              setMainMenu('keuangan');
              setActiveTab('dashboard');
            }
          }}
          className="text-left shrink-0 flex items-center gap-2.5 group"
        >
          <img
            src="/src/assets/images/logo_bopkri_gondolayu.png"
            alt="SD BOPKRI Gondolayu"
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-extrabold text-blue-950 group-hover:text-blue-700 transition-colors tracking-tight flex items-center gap-1.5">
              <span>SIBOGO</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded tracking-normal">
                BOPKRI Gondolayu
              </span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1.5">
              <span>Sistem Informasi BOPKRI Gondolayu</span>
              <span className="hidden sm:inline text-blue-700 font-bold">· Cerdas Berkarakter</span>
            </span>
          </div>
        </button>

        {/* Zone 2: THE 4 MAIN MENUS (4 MENU UTAMA SESUAI PERMINTAAN USER) */}
        <div className="hidden lg:flex items-center p-1 bg-slate-100/95 rounded-xl border border-slate-200 shadow-2xs gap-0.5">
          
          {/* Main Menu 1: Keuangan Sekolah */}
          <button
            onClick={() => handleSelectMainMenu('keuangan')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mainMenu === 'keuangan'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <span>1. Keuangan Sekolah</span>
              <span
                className={`text-[9px] font-normal mt-0.5 ${
                  mainMenu === 'keuangan' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                Kasir & Tagihan
              </span>
            </div>
            {isTeacher && (
              <span className="px-1 py-0.2 rounded text-[8px] bg-amber-500/30 text-amber-300 font-semibold">
                TU
              </span>
            )}
          </button>

          {/* Main Menu 2: Penggajian */}
          <button
            onClick={() => handleSelectMainMenu('penggajian')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mainMenu === 'penggajian'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <span>2. Penggajian</span>
              <span
                className={`text-[9px] font-normal mt-0.5 ${
                  mainMenu === 'penggajian' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                Gaji & Slip Resmi
              </span>
            </div>
          </button>

          {/* Main Menu 3: Administrasi Mengajar */}
          <button
            onClick={() => handleSelectMainMenu('administrasi')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mainMenu === 'administrasi'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <span>3. Administrasi Mengajar</span>
              <span
                className={`text-[9px] font-normal mt-0.5 ${
                  mainMenu === 'administrasi' ? 'text-teal-200' : 'text-slate-400'
                }`}
              >
                Modul & Perangkat
              </span>
            </div>
          </button>

          {/* Main Menu 4: Inventarisasi */}
          <button
            onClick={() => handleSelectMainMenu('inventarisasi')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mainMenu === 'inventarisasi'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 shrink-0" />
            <div className="flex flex-col text-left leading-none">
              <span>4. Inventarisasi</span>
              <span
                className={`text-[9px] font-normal mt-0.5 ${
                  mainMenu === 'inventarisasi' ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                Sarana & Aset
              </span>
            </div>
          </button>

        </div>

        {/* Zone 3: Actions & User Account Status */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Contextual primary button */}
          {!isTeacher && mainMenu === 'keuangan' && (
            <button
              onClick={() => setActiveTab('kasir')}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Loket Kasir</span>
            </button>
          )}

          {mainMenu === 'administrasi' && (
            <button
              onClick={() => setActiveTab('administrasi-guru')}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Berkas</span>
            </button>
          )}

          {mainMenu === 'inventarisasi' && !isTeacher && (
            <button
              onClick={() => setActiveTab('inventarisasi')}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Kelola Aset</span>
            </button>
          )}

          {/* User Account Chip */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-xl">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title="Buka Profil Saya & Ganti Kata Sandi"
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 hover:opacity-90 transition-opacity ${
                  isDeveloper
                    ? 'bg-blue-900 text-amber-300 ring-2 ring-amber-400/40'
                    : isTeacher
                    ? 'bg-indigo-700 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {currentUser.name
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')}
              </button>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title="Buka Profil Saya & Ganti Kata Sandi"
                className="hidden sm:flex flex-col text-left leading-tight max-w-[170px] hover:text-blue-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800 truncate" title={currentUser.name}>
                    {currentUser.name}
                  </span>
                  {isDeveloper && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Penanggung Jawab & Pengembang" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 truncate" title={currentUser.positionTitle}>
                  {isDeveloper
                    ? 'Penanggung Jawab & Pengembang'
                    : isTeacher
                    ? 'Guru / Karyawan'
                    : 'Administrator / Bendahara'}
                </span>
              </button>

              <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 ml-0.5">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 px-1.5 py-0.5 rounded transition-colors flex items-center gap-1"
                  title="Lihat & Edit Profil Biodata atau Ganti Password"
                >
                  <User className="w-3 h-3" />
                  <span className="hidden md:inline">Profil</span>
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline px-1.5 py-0.5 rounded transition-colors"
                  title="Ganti akun / Login profil lain"
                >
                  Ganti
                </button>
                <button
                  onClick={logout}
                  className="text-[11px] font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-1.5 py-0.5 rounded transition-colors flex items-center gap-1"
                  title="Keluar dari sistem SIBOGO (Kembali ke Halaman Login)"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile / Tablet Main Menu Switcher (Below lg screen) */}
      <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 bg-slate-100 border-t border-slate-200 p-1.5 gap-1.5">
        <button
          onClick={() => handleSelectMainMenu('keuangan')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            mainMenu === 'keuangan'
              ? 'bg-blue-800 text-white shadow-2xs'
              : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">1. Keuangan</span>
        </button>

        <button
          onClick={() => handleSelectMainMenu('penggajian')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            mainMenu === 'penggajian'
              ? 'bg-indigo-900 text-white shadow-2xs'
              : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">2. Penggajian</span>
        </button>

        <button
          onClick={() => handleSelectMainMenu('administrasi')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            mainMenu === 'administrasi'
              ? 'bg-teal-800 text-white shadow-2xs'
              : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">3. Administrasi</span>
        </button>

        <button
          onClick={() => handleSelectMainMenu('inventarisasi')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            mainMenu === 'inventarisasi'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">4. Inventaris</span>
        </button>
      </div>

      {/* Sub-Navigation Bar for the Active Main Menu */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-1.5">
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline-block">
              {mainMenu === 'keuangan' && 'Sub Keuangan:'}
              {mainMenu === 'penggajian' && 'Sub Penggajian:'}
              {mainMenu === 'administrasi' && 'Sub Administrasi:'}
              {mainMenu === 'inventarisasi' && 'Sub Inventarisasi:'}
            </span>

            {activeSubNav.map((sub) => {
              const isActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveTab(sub.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? mainMenu === 'keuangan'
                        ? 'bg-blue-800 text-white font-semibold shadow-2xs'
                        : mainMenu === 'penggajian'
                        ? 'bg-indigo-900 text-white font-semibold shadow-2xs'
                        : mainMenu === 'administrasi'
                        ? 'bg-teal-800 text-white font-semibold shadow-2xs'
                        : 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {sub.icon}
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center text-[11px] text-slate-500 font-medium shrink-0">
            {mainMenu === 'keuangan' && <span>Modul SPP, Kasir & Laporan Keuangan</span>}
            {mainMenu === 'penggajian' && <span>Modul Penggajian Resmi & Rekap Gaji Guru/Staf</span>}
            {mainMenu === 'administrasi' && <span>Modul Perangkat Ajar, ATP, Modul & Rekap Nilai</span>}
            {mainMenu === 'inventarisasi' && <span>Modul Manajemen Aset, Kondisi & Ruangan Sekolah</span>}
          </div>

        </div>
      </div>

    </header>
  );
};
