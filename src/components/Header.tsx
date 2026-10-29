import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppNavTab, MainMenuType } from '../context/AppContext';
import { BOPKRI_LOGO, handleImageError } from '../assets/logo';
import {
  Award,
  Banknote,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Landmark,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PieChart,
  Receipt,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';

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
    setIsDataPurgeModalOpen,
    isSuperAdmin,
  } = useApp();

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role determinations
  const role = currentUser?.role;
  const isOrangTua = role === 'ORANG_TUA';
  const isKepalaSekolah = role === 'KEPALA_SEKOLAH';
  const isBendahara = role === 'BENDAHARA';
  const isTataUsaha = role === 'TATA_USAHA';
  const isGuruOrStaff = role === 'GURU' || role === 'STAFF' || role === 'TEACHER';

  // Role label formatter
  const getRoleBadgeLabel = () => {
    if (isSuperAdmin) return 'Super Admin & Dev';
    if (isKepalaSekolah) return 'Kepala Sekolah';
    if (isBendahara) return 'Bendahara';
    if (isTataUsaha) return 'Tata Usaha';
    if (role === 'GURU') return 'Guru';
    if (role === 'STAFF') return 'Staf';
    if (isOrangTua) return 'Orang Tua Murid';
    return role || 'Tamu';
  };

  // Define Main Navigation Tabs based on Role
  interface MainNavItem {
    id: MainMenuType;
    label: string;
    subLabel?: string;
    icon: React.ReactNode;
    defaultTab: AppNavTab;
  }

  const getFilteredMainMenus = (): MainNavItem[] => {
    // 1. ORANG TUA: ONLY accesses financial bills / payment history + edit profile
    if (isOrangTua) {
      return [
        {
          id: 'portal-ortu',
          label: 'Keuangan & Tagihan Siswa',
          subLabel: 'Riwayat & Bukti Pembayaran',
          icon: <Receipt className="w-3.5 h-3.5" />,
          defaultTab: 'portal-ortu',
        },
      ];
    }

    // 2. KEPALA SEKOLAH: Approval, Penggajian (view), Administrasi (view/edit), Inventaris (view/edit), Keuangan (view)
    if (isKepalaSekolah) {
      return [
        {
          id: 'approval',
          label: 'Approval & Verifikasi',
          subLabel: 'Pusat Persetujuan',
          icon: <FileCheck2 className="w-3.5 h-3.5" />,
          defaultTab: 'approval',
        },
        {
          id: 'keuangan',
          label: 'Keuangan (View)',
          subLabel: 'Ringkasan & Laporan',
          icon: <Landmark className="w-3.5 h-3.5" />,
          defaultTab: 'dashboard',
        },
        {
          id: 'penggajian',
          label: 'Penggajian (View)',
          subLabel: 'Rekap Gaji Pendidik',
          icon: <Wallet className="w-3.5 h-3.5" />,
          defaultTab: 'penggajian',
        },
        {
          id: 'administrasi',
          label: 'Administrasi Guru',
          subLabel: 'Verifikasi Modul Ajar',
          icon: <BookOpen className="w-3.5 h-3.5" />,
          defaultTab: 'administrasi-guru',
        },
        {
          id: 'inventarisasi',
          label: 'Inventarisasi',
          subLabel: 'Aset & Sarpras',
          icon: <Boxes className="w-3.5 h-3.5" />,
          defaultTab: 'inventarisasi',
        },
      ];
    }

    // 3. BENDAHARA: Approval Keuangan, Penggajian (approval/full), Administrasi (sesuai user), Inventaris (view/edit), Keuangan (full)
    if (isBendahara) {
      return [
        {
          id: 'keuangan',
          label: 'Keuangan Sekolah',
          subLabel: 'Kasir & Pos Tagihan',
          icon: <Landmark className="w-3.5 h-3.5" />,
          defaultTab: 'dashboard',
        },
        {
          id: 'approval',
          label: 'Approval Keuangan',
          subLabel: 'Verifikasi Pembayaran',
          icon: <FileCheck2 className="w-3.5 h-3.5" />,
          defaultTab: 'approval',
        },
        {
          id: 'penggajian',
          label: 'Penggajian Pendidik',
          subLabel: 'Kelola & Transfer Gaji',
          icon: <Wallet className="w-3.5 h-3.5" />,
          defaultTab: 'penggajian',
        },
        {
          id: 'administrasi',
          label: 'Administrasi Guru',
          subLabel: 'Dokumen Saya',
          icon: <BookOpen className="w-3.5 h-3.5" />,
          defaultTab: 'administrasi-guru',
        },
        {
          id: 'inventarisasi',
          label: 'Inventarisasi',
          subLabel: 'Aset & Pengadaan',
          icon: <Boxes className="w-3.5 h-3.5" />,
          defaultTab: 'inventarisasi',
        },
      ];
    }

    // 4. GURU & STAFF: Penggajian (view only - slip), Administrasi Guru (sesuai username), Inventaris (view), Keuangan (view)
    if (isGuruOrStaff) {
      return [
        {
          id: 'penggajian',
          label: 'Slip Gaji Saya',
          subLabel: 'Riwayat Gaji Resmi',
          icon: <FileText className="w-3.5 h-3.5" />,
          defaultTab: 'my-slips',
        },
        {
          id: 'administrasi',
          label: 'Administrasi Ajar',
          subLabel: 'Modul & Perangkat Saya',
          icon: <BookOpen className="w-3.5 h-3.5" />,
          defaultTab: 'administrasi-guru',
        },
        {
          id: 'inventarisasi',
          label: 'Inventaris (View)',
          subLabel: 'Sarana Sekolah',
          icon: <Boxes className="w-3.5 h-3.5" />,
          defaultTab: 'inventarisasi',
        },
        {
          id: 'keuangan',
          label: 'Keuangan (View)',
          subLabel: 'Informasi SPP',
          icon: <Landmark className="w-3.5 h-3.5" />,
          defaultTab: 'dashboard',
        },
      ];
    }

    // 5. TATA USAHA: Keuangan operasional (kasir, tagihan, siswa), SPMB, Inventarisasi, Administrasi Guru
    if (isTataUsaha) {
      return [
        {
          id: 'keuangan',
          label: 'Keuangan Sekolah',
          subLabel: 'Kasir & Data Siswa',
          icon: <Landmark className="w-3.5 h-3.5" />,
          defaultTab: 'siswa',
        },
        {
          id: 'spmb',
          label: 'SPMB Murid Baru',
          subLabel: 'Pendaftaran & NIS Otomatis',
          icon: <UserPlus className="w-3.5 h-3.5" />,
          defaultTab: 'spmb',
        },
        {
          id: 'inventarisasi',
          label: 'Inventarisasi',
          subLabel: 'Sarana & Aset',
          icon: <Boxes className="w-3.5 h-3.5" />,
          defaultTab: 'inventarisasi',
        },
        {
          id: 'administrasi',
          label: 'Administrasi Guru',
          subLabel: 'Arsip Pembelajaran',
          icon: <BookOpen className="w-3.5 h-3.5" />,
          defaultTab: 'administrasi-guru',
        },
      ];
    }

    // 6. SUPER ADMIN (BENISIUS): FULL ACCESS TO ALL MENUS
    return [
      {
        id: 'keuangan',
        label: '1. Keuangan',
        subLabel: 'Kasir & SPP',
        icon: <Landmark className="w-3.5 h-3.5" />,
        defaultTab: 'dashboard',
      },
      {
        id: 'penggajian',
        label: '2. Penggajian',
        subLabel: 'Gaji & Slip',
        icon: <Wallet className="w-3.5 h-3.5" />,
        defaultTab: 'penggajian',
      },
      {
        id: 'administrasi',
        label: '3. Administrasi',
        subLabel: 'Modul Ajar',
        icon: <BookOpen className="w-3.5 h-3.5" />,
        defaultTab: 'administrasi-guru',
      },
      {
        id: 'inventarisasi',
        label: '4. Inventaris',
        subLabel: 'Aset Sarpras',
        icon: <Boxes className="w-3.5 h-3.5" />,
        defaultTab: 'inventarisasi',
      },
      {
        id: 'approval',
        label: 'Approval',
        subLabel: 'Verifikasi',
        icon: <FileCheck2 className="w-3.5 h-3.5" />,
        defaultTab: 'approval',
      },
      {
        id: 'spmb',
        label: 'SPMB',
        subLabel: 'Pendaftaran Baru',
        icon: <UserPlus className="w-3.5 h-3.5" />,
        defaultTab: 'spmb',
      },
      {
        id: 'portal-ortu',
        label: 'Portal Ortu',
        subLabel: 'Cek Tagihan',
        icon: <Receipt className="w-3.5 h-3.5" />,
        defaultTab: 'portal-ortu',
      },
      {
        id: 'user-register',
        label: 'User Register',
        subLabel: 'Pengguna Cloud',
        icon: <Users className="w-3.5 h-3.5" />,
        defaultTab: 'user-register',
      },
    ];
  };

  const mainMenus = getFilteredMainMenus();

  // Sub-navigation tabs based on Active Menu & Role
  const getSubNavItems = (): { id: AppNavTab; label: string; icon: React.ReactNode }[] => {
    if (mainMenu === 'keuangan') {
      if (isGuruOrStaff || isKepalaSekolah) {
        return [
          { id: 'dashboard', label: 'Ringkasan', icon: <PieChart className="w-3.5 h-3.5" /> },
          { id: 'tagihan', label: 'Tagihan Uang Sekolah', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
          { id: 'siswa', label: 'Data Siswa', icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'laporan', label: 'Laporan Keuangan', icon: <Landmark className="w-3.5 h-3.5" /> },
        ];
      }
      return [
        { id: 'dashboard', label: 'Ringkasan', icon: <PieChart className="w-3.5 h-3.5" /> },
        { id: 'kasir', label: 'Loket Kasir', icon: <Banknote className="w-3.5 h-3.5" /> },
        { id: 'tagihan', label: 'Tagihan Uang Sekolah', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
        { id: 'siswa', label: 'Data Siswa', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'laporan', label: 'Laporan Keuangan', icon: <Landmark className="w-3.5 h-3.5" /> },
        { id: 'whatsapp', label: 'Pengingat WA', icon: <MessageSquare className="w-3.5 h-3.5" /> },
        { id: 'jenis-tagihan', label: 'Pos Tagihan', icon: <Settings className="w-3.5 h-3.5" /> },
      ];
    }

    if (mainMenu === 'penggajian') {
      if (isGuruOrStaff) {
        return [
          { id: 'my-slips', label: 'Slip Gaji Saya', icon: <FileText className="w-3.5 h-3.5" /> },
        ];
      }
      if (isKepalaSekolah) {
        return [
          { id: 'penggajian', label: 'Rekapitulasi Gaji Guru & Staf', icon: <Wallet className="w-3.5 h-3.5" /> },
          { id: 'master-guru', label: 'Master Data Pendidik & Staf', icon: <GraduationCap className="w-3.5 h-3.5" /> },
        ];
      }
      return [
        { id: 'master-guru', label: 'Master Data Guru & Staf', icon: <GraduationCap className="w-3.5 h-3.5" /> },
        { id: 'penggajian', label: 'Kelola Penggajian', icon: <Wallet className="w-3.5 h-3.5" /> },
        { id: 'my-slips', label: 'Slip Gaji Saya', icon: <FileText className="w-3.5 h-3.5" /> },
      ];
    }

    if (mainMenu === 'administrasi') {
      return [
        { id: 'administrasi-guru', label: 'Perangkat & Dokumen Ajar', icon: <BookOpen className="w-3.5 h-3.5" /> },
      ];
    }

    if (mainMenu === 'inventarisasi') {
      return [
        { id: 'inventarisasi', label: 'Daftar Aset & Sarpras', icon: <Boxes className="w-3.5 h-3.5" /> },
      ];
    }

    if (mainMenu === 'approval') {
      return [
        { id: 'approval', label: 'Pusat Persetujuan & Verifikasi', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
      ];
    }

    if (mainMenu === 'spmb') {
      return [
        { id: 'spmb', label: 'Pendaftaran & Rekap Murid Baru', icon: <UserPlus className="w-3.5 h-3.5" /> },
      ];
    }

    if (mainMenu === 'user-register') {
      return [
        { id: 'user-register', label: 'User Register (Cloud)', icon: <Users className="w-3.5 h-3.5" /> },
      ];
    }

    return [
      { id: 'portal-ortu', label: 'Portal Tagihan Siswa', icon: <Receipt className="w-3.5 h-3.5" /> },
    ];
  };

  const subNavItems = getSubNavItems();

  const handleSelectMenu = (item: MainNavItem) => {
    setMainMenu(item.id);
    setActiveTab(item.defaultTab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs font-sans">
      
      {/* Primary Top Bar */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-6 h-14 sm:h-15 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Identity Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              if (isOrangTua) {
                setMainMenu('portal-ortu');
              } else if (isKepalaSekolah) {
                setMainMenu('approval');
              } else if (isGuruOrStaff) {
                setMainMenu('penggajian');
              } else {
                setMainMenu('keuangan');
              }
            }}
            className="flex items-center gap-2 text-left group"
          >
            <img
              src={BOPKRI_LOGO}
              onError={handleImageError}
              alt="SD BOPKRI Gondolayu"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 object-contain group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black text-blue-950 tracking-tight">
                  SIBOGO
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                  BOPKRI Gondolayu
                </span>
              </div>
              <span className="hidden md:block text-[10px] text-slate-500 font-medium">
                Cerdas Berkarakter
              </span>
            </div>
          </button>
        </div>

        {/* Center: Condensed Elegant Navigation (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {mainMenus.map((item) => {
            const isActive = mainMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectMenu(item)}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={item.subLabel}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Admin Purge Center Button (Only for Super Admin Benisius) */}
          {isSuperAdmin && (
            <button
              onClick={() => setIsDataPurgeModalOpen(true)}
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
              title="Pusat Hapus Data Tersimpan (Khusus Super Admin)"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Hapus Data</span>
            </button>
          )}

          {/* User Profile Chip */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-2">
              
              {/* Avatar Button -> Opens Profile Modal for EVERY user */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title="Buka & Edit Profil Pribadi / Ganti Password"
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-opacity hover:opacity-90 ${
                  isSuperAdmin
                    ? 'bg-blue-950 text-amber-300 ring-1 ring-amber-400'
                    : isKepalaSekolah
                    ? 'bg-indigo-900 text-white'
                    : isBendahara
                    ? 'bg-emerald-800 text-white'
                    : isOrangTua
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-white'
                }`}
              >
                {currentUser.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')}
              </button>

              {/* User text details */}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                title="Buka & Edit Profil Pribadi / Ganti Password"
                className="hidden lg:flex flex-col text-left leading-none max-w-[150px] cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-blue-700 font-semibold mt-0.5 truncate block">
                  {getRoleBadgeLabel()}
                </span>
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-1 text-slate-500 hover:text-blue-800 hover:bg-slate-200/60 rounded-md transition-colors"
                  title="Edit Profil Pribadi & Password"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Keluar dari akun SIBOGO"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Buka Menu Navigasi"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-900" />
            ) : (
              <Menu className="w-5 h-5 text-slate-900" />
            )}
          </button>

        </div>

      </div>

      {/* Sub-Navigation Bar (for current main menu) */}
      {subNavItems.length > 1 && (
        <div className="hidden sm:block bg-slate-50/90 border-t border-slate-200/70 px-4 sm:px-6 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              {subNavItems.map((sub) => {
                const isSubActive = activeTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveTab(sub.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      isSubActive
                        ? 'bg-blue-800 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {sub.icon}
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="text-[10px] text-slate-400 font-medium">
              SD BOPKRI Gondolayu Yogyakarta
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 p-4 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-150">
          
          {/* User Info on Mobile */}
          {currentUser && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block truncate max-w-[170px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 block">
                    {getRoleBadgeLabel()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                Edit Profil
              </button>
            </div>
          )}

          {/* Menu Items List */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
              Pilihan Menu ({getRoleBadgeLabel()}):
            </span>
            {mainMenus.map((item) => {
              const isActive = mainMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectMenu(item)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                    isActive
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <div>
                      <span>{item.label}</span>
                      {item.subLabel && (
                        <span className={`block text-[10px] font-normal ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                          {item.subLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              );
            })}
          </div>

          {/* Sub-Navigation on Mobile if active menu has subnav */}
          {subNavItems.length > 1 && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                Sub-Menu Aktif:
              </span>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {subNavItems.map((sub) => {
                  const isSubActive = activeTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveTab(sub.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isSubActive
                          ? 'bg-blue-100 text-blue-900 font-bold'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sub.icon}
                      <span className="truncate">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Logout button on Mobile */}
          {currentUser && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          )}

        </div>
      )}

    </header>
  );
};
