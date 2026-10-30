import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AuthUser, EmploymentStatus, Student, UserRole } from '../types';
import { StudentPicker } from './StudentPicker';
import { generateUniqueUserCode } from '../utils/uniqueCode';
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

export const UserRegisterView: React.FC = () => {
  const {
    currentUser,
    isSuperAdmin,
    registeredUsers,
    adminUpdateUser,
    adminDeleteUser,
    registerUser,
    setActiveTab,
    setMainMenu,
    students,
  } = useApp();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Password visibility map: { [userId]: boolean }
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Modals state
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AuthUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Loading & Toast feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Edit Form States
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('GURU');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPositionTitle, setEditPositionTitle] = useState('');
  const [editNip, setEditNip] = useState('');
  const [editKtpNumber, setEditKtpNumber] = useState('');
  const [editNuptk, setEditNuptk] = useState('');
  const [editEmploymentStatus, setEditEmploymentStatus] = useState<EmploymentStatus>('GTY');
  const [editBankName, setEditBankName] = useState('BPD DIY');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editAccountHolder, setEditAccountHolder] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentNis, setEditStudentNis] = useState('');
  const [editStudentGrade, setEditStudentGrade] = useState('1.1');
  const [editUniqueCode, setEditUniqueCode] = useState('');

  // Add User Form States
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('ORANG_TUA');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('08');
  const [newNip, setNewNip] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNis, setNewStudentNis] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('1.1');
  const [newUniqueCode, setNewUniqueCode] = useState('');

  // Gatekeeping: If not Super Admin, show restricted access notice
  if (!isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          Akses Dibatasi — Menu Khusus Super Admin
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Menu <strong>"User Register"</strong> dan pengelolaan seluruh akun pengguna yang tersimpan di Cloud Firestore hanya dapat diakses dan diedit oleh Super Administrator (Benisius R.B).
        </p>
        <button
          onClick={() => {
            setMainMenu('keuangan');
            setActiveTab('dashboard');
          }}
          className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
        >
          Kembali ke Dashboard Utama
        </button>
      </div>
    );
  }

  // Filter users based on search query and role filter
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter((user) => {
      // Role filter
      if (selectedRole !== 'ALL' && user.role !== selectedRole) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = user.name.toLowerCase().includes(query);
        const matchUsername = user.username.toLowerCase().includes(query);
        const matchUniqueCode = (user.uniqueCode || '').toLowerCase().includes(query);
        const matchEmail = (user.email || '').toLowerCase().includes(query);
        const matchPhone = (user.phone || '').toLowerCase().includes(query);
        const matchNip = (user.nip || '').toLowerCase().includes(query);
        const matchStudent = (user.studentName || '').toLowerCase().includes(query);
        const matchNis = (user.studentNis || '').toLowerCase().includes(query);

        return (
          matchName ||
          matchUsername ||
          matchUniqueCode ||
          matchEmail ||
          matchPhone ||
          matchNip ||
          matchStudent ||
          matchNis
        );
      }

      return true;
    });
  }, [registeredUsers, searchQuery, selectedRole]);

  // Role Statistics Calculation
  const stats = useMemo(() => {
    const total = registeredUsers.length;
    const adminCount = registeredUsers.filter((u) => u.role === 'ADMIN').length;
    const kepsekCount = registeredUsers.filter((u) => u.role === 'KEPALA_SEKOLAH').length;
    const bendaharaCount = registeredUsers.filter((u) => u.role === 'BENDAHARA').length;
    const tuCount = registeredUsers.filter((u) => u.role === 'TATA_USAHA').length;
    const guruCount = registeredUsers.filter((u) => u.role === 'GURU' || u.role === 'TEACHER').length;
    const staffCount = registeredUsers.filter((u) => u.role === 'STAFF').length;
    const ortuCount = registeredUsers.filter((u) => u.role === 'ORANG_TUA').length;

    return {
      total,
      adminCount,
      kepsekCount,
      bendaharaCount,
      tuCount,
      guruCount,
      staffCount,
      ortuCount,
    };
  }, [registeredUsers]);

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleOpenEdit = (user: AuthUser) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditRole(user.role || 'GURU');
    setEditUsername(user.username || '');
    setEditPassword(user.password || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditPositionTitle(user.positionTitle || '');
    setEditNip(user.nip || '');
    setEditKtpNumber(user.ktpNumber || '');
    setEditNuptk(user.nuptk || '');
    setEditEmploymentStatus(user.employmentStatus || 'GTY');
    setEditBankName(user.bankName || 'BPD DIY');
    setEditAccountNumber(user.accountNumber || '');
    setEditAccountHolder(user.accountHolder || user.name || '');
    setEditStudentId(user.studentId || '');
    setEditStudentName(user.studentName || '');
    setEditStudentNis(user.studentNis || '');
    setEditStudentGrade(user.studentGrade || '1.1');
    setEditUniqueCode(user.uniqueCode || generateUniqueUserCode(registeredUsers.map((u) => u.uniqueCode)));
    setFeedbackMessage(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editName.trim() || !editUsername.trim() || !editEmail.trim()) {
      setFeedbackMessage({
        type: 'error',
        text: 'Nama lengkap, username, dan email wajib diisi.',
      });
      return;
    }

    if (editUsername.trim().length < 8) {
      setFeedbackMessage({
        type: 'error',
        text: 'Username minimal harus 8 karakter.',
      });
      return;
    }

    if (editRole === 'ORANG_TUA' && !editStudentName.trim()) {
      setFeedbackMessage({
        type: 'error',
        text: 'Pilihan nama siswa/anak wajib dipilih untuk akun Orang Tua Murid.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser: AuthUser = {
        ...editingUser,
        name: editName.trim(),
        role: editRole,
        username: editUsername.trim().toLowerCase(),
        uniqueCode: editUniqueCode.trim() || undefined,
        password: editPassword.trim() || editingUser.password || '123',
        email: editEmail.trim(),
        phone: editPhone.trim() || undefined,
        positionTitle: editPositionTitle.trim() || undefined,
        nip: editRole !== 'ORANG_TUA' ? editNip.trim() || undefined : undefined,
        ktpNumber: editRole !== 'ORANG_TUA' ? editKtpNumber.trim() || undefined : undefined,
        nuptk: editRole !== 'ORANG_TUA' ? editNuptk.trim() || undefined : undefined,
        employmentStatus: editRole !== 'ORANG_TUA' ? editEmploymentStatus : undefined,
        bankName: editRole !== 'ORANG_TUA' ? editBankName.trim() : undefined,
        accountNumber: editRole !== 'ORANG_TUA' ? editAccountNumber.trim() : undefined,
        accountHolder: editRole !== 'ORANG_TUA' ? editAccountHolder.trim() : undefined,
        studentId: editRole === 'ORANG_TUA' ? editStudentId || undefined : undefined,
        studentName: editRole === 'ORANG_TUA' ? editStudentName.trim() || undefined : undefined,
        studentNis: editRole === 'ORANG_TUA' ? editStudentNis.trim() || undefined : undefined,
        studentGrade: editRole === 'ORANG_TUA' ? editStudentGrade.trim() || undefined : undefined,
      };

      const res = await adminUpdateUser(updatedUser);
      if (res.success) {
        setEditingUser(null);
      } else {
        setFeedbackMessage({ type: 'error', text: res.message });
      }
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Terjadi kendala saat memperbarui data di Cloud Firestore.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsSubmitting(true);
    try {
      const res = await adminDeleteUser(deletingUser.id);
      if (res.success) {
        setDeletingUser(null);
      } else {
        setFeedbackMessage({ type: 'error', text: res.message });
      }
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Terjadi kendala saat menghapus akun dari Cloud Firestore.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim() || !newEmail.trim()) {
      setFeedbackMessage({
        type: 'error',
        text: 'Nama lengkap, username, kata sandi, dan email wajib diisi.',
      });
      return;
    }

    if (newUsername.trim().length < 8) {
      setFeedbackMessage({
        type: 'error',
        text: 'Username minimal harus 8 karakter.',
      });
      return;
    }

    if (newRole === 'ORANG_TUA' && !newStudentName.trim()) {
      setFeedbackMessage({
        type: 'error',
        text: 'Pilihan nama siswa (anak) wajib dipilih untuk akun Orang Tua Murid.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: newName.trim(),
        username: newUsername.trim().toLowerCase(),
        password: newPassword.trim(),
        role: newRole,
        uniqueCode: newUniqueCode.trim() || undefined,
        email: newEmail.trim(),
        phone: newPhone.trim(),
        nip: newRole !== 'ORANG_TUA' ? newNip.trim() || undefined : undefined,
        studentId: newRole === 'ORANG_TUA' ? newStudentId || undefined : undefined,
        studentName: newRole === 'ORANG_TUA' ? newStudentName.trim() || undefined : undefined,
        studentNis: newRole === 'ORANG_TUA' ? newStudentNis.trim() || undefined : undefined,
        studentGrade: newRole === 'ORANG_TUA' ? newStudentGrade.trim() || undefined : undefined,
      });

      if (res.success) {
        setIsAddUserOpen(false);
        setNewName('');
        setNewUsername('');
        setNewPassword('');
        setNewEmail('');
        setNewPhone('08');
        setNewNip('');
        setNewStudentId('');
        setNewStudentName('');
        setNewStudentNis('');
      } else {
        setFeedbackMessage({ type: 'error', text: res.message });
      }
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Terjadi kendala saat mendaftarkan akun baru ke Cloud Firestore.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-rose-600" />
            Super Administrator
          </span>
        );
      case 'KEPALA_SEKOLAH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5 text-purple-600" />
            Kepala Sekolah
          </span>
        );
      case 'BENDAHARA':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <CreditCard className="w-2.5 h-2.5 text-amber-700" />
            Bendahara Sekolah
          </span>
        );
      case 'TATA_USAHA':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-200 flex items-center gap-1">
            <UserCheck className="w-2.5 h-2.5 text-cyan-700" />
            Kasir & Tata Usaha
          </span>
        );
      case 'GURU':
      case 'TEACHER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <GraduationCap className="w-2.5 h-2.5 text-emerald-600" />
            Guru Pendidik
          </span>
        );
      case 'STAFF':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1">
            <Users className="w-2.5 h-2.5 text-slate-600" />
            Staf / Karyawan
          </span>
        );
      case 'ORANG_TUA':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
            <User className="w-2.5 h-2.5 text-blue-700" />
            Orang Tua Murid
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner & Title Area */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 flex items-center gap-1 shadow-2xs">
              <ShieldCheck className="w-3 h-3" />
              Super Admin Exclusive Panel
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Cloud Firestore Real-time
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-300" />
            <span>User Register & Pengelolaan Akun</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 max-w-2xl leading-relaxed">
            Daftar seluruh akun pengguna yang teregistrasi di sistem SIBOGO SD BOPKRI Gondolayu. Hanya dapat dilihat, diedit, dan dikelola oleh Super Administrator.
          </p>
        </div>

        <button
          onClick={() => {
            const existing = registeredUsers.map((u) => u.uniqueCode).filter(Boolean) as string[];
            setNewUniqueCode(generateUniqueUserCode(existing));
            setIsAddUserOpen(true);
            setFeedbackMessage(null);
          }}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total User
          </span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {stats.total}
          </span>
          <span className="text-[10px] text-slate-500">Semua Peran</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
            Admin
          </span>
          <span className="text-xl font-black text-rose-900 mt-1 block">
            {stats.adminCount}
          </span>
          <span className="text-[10px] text-rose-600">Super Administrator</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">
            Kepsek
          </span>
          <span className="text-xl font-black text-purple-900 mt-1 block">
            {stats.kepsekCount}
          </span>
          <span className="text-[10px] text-purple-600">Persetujuan & Approval</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Bendahara
          </span>
          <span className="text-xl font-black text-amber-900 mt-1 block">
            {stats.bendaharaCount}
          </span>
          <span className="text-[10px] text-amber-700">Keuangan & Gaji</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-cyan-200 shadow-xs">
          <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider block">
            Tata Usaha
          </span>
          <span className="text-xl font-black text-cyan-900 mt-1 block">
            {stats.tuCount}
          </span>
          <span className="text-[10px] text-cyan-700">Kasir, Siswa & SPMB</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Guru Pendidik
          </span>
          <span className="text-xl font-black text-emerald-900 mt-1 block">
            {stats.guruCount}
          </span>
          <span className="text-[10px] text-emerald-700">Modul & Slip Gaji</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            Orang Tua
          </span>
          <span className="text-xl font-black text-blue-900 mt-1 block">
            {stats.ortuCount}
          </span>
          <span className="text-[10px] text-blue-700">Portal Tagihan Anak</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Cari nama, username, email, NIP, nama murid..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Peran:</span>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-bold text-slate-800 cursor-pointer"
          >
            <option value="ALL">Semua Peran ({registeredUsers.length})</option>
            <option value="ADMIN">Super Admin ({stats.adminCount})</option>
            <option value="KEPALA_SEKOLAH">Kepala Sekolah ({stats.kepsekCount})</option>
            <option value="BENDAHARA">Bendahara Sekolah ({stats.bendaharaCount})</option>
            <option value="TATA_USAHA">Kasir & Tata Usaha ({stats.tuCount})</option>
            <option value="GURU">Guru Pendidik ({stats.guruCount})</option>
            <option value="STAFF">Staf / Karyawan ({stats.staffCount})</option>
            <option value="ORANG_TUA">Orang Tua Murid ({stats.ortuCount})</option>
          </select>
        </div>
      </div>

      {/* User Table & List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Daftar Seluruh Pengguna Terdaftar
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
              {filteredUsers.length} Pengguna Ditemukan
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Koneksi Cloud Database: <strong className="text-emerald-700">Aktif</strong>
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <User className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada pengguna yang cocok</h3>
            <p className="text-xs text-slate-500">
              Silakan ubah kata kunci pencarian atau ganti filter peran.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama & Akun</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Username & Kata Sandi</th>
                  <th className="py-3 px-4">Kontak (Email / WA)</th>
                  <th className="py-3 px-4">Rincian Khusus Role</th>
                  <th className="py-3 px-4 text-center w-28">Aksi SuperAdmin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, idx) => {
                  const isBenisius =
                    user.username.toLowerCase() === 'benisiusbasuki24' ||
                    user.username.toLowerCase() === 'benisius';
                  const isCurrent = currentUser?.id === user.id;
                  const isPasswordVisible = Boolean(showPasswordMap[user.id]);
                  const isParent = user.role === 'ORANG_TUA';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* No */}
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Nama & Akun */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {user.name
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-xs">
                                {user.name}
                              </span>
                              {isBenisius && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-400 text-amber-950">
                                  Dev
                                </span>
                              )}
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-900">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              ID: {user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Peran */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getRoleBadge(user.role)}
                          {user.positionTitle && (
                            <span className="text-[10px] text-slate-500 block font-medium">
                              {user.positionTitle}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Username & Kata Sandi */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-blue-950 text-xs bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                              @{user.username}
                            </span>
                            {user.uniqueCode && (
                              <span
                                className="font-mono text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-2xs"
                                title="Nomor Registrasi & Kode Unik (4 Angka & 4 Huruf)"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>{user.uniqueCode}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <span className="font-mono">
                              {isPasswordVisible
                                ? user.password || '123'
                                : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="text-slate-400 hover:text-blue-700 p-0.5 rounded cursor-pointer"
                              title={isPasswordVisible ? 'Sembunyikan' : 'Lihat kata sandi'}
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1 text-slate-700 truncate max-w-[180px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{user.email || '-'}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <a
                                href={`https://wa.me/${user.phone.replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 hover:underline font-mono text-[10px]"
                              >
                                {user.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Rincian Khusus Role */}
                      <td className="py-3 px-4">
                        {isParent ? (
                          <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-200 text-[10px] space-y-0.5 max-w-[200px]">
                            <div>
                              <span className="text-slate-400">Anak: </span>
                              <strong className="text-slate-800">
                                {user.studentName || 'Belum diisi'}
                              </strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>NIS: {user.studentNis || '-'}</span>
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 font-bold">
                                {user.studentGrade || '1.1'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[10px] space-y-0.5 max-w-[220px]">
                            {user.nip && (
                              <div>
                                <span className="text-slate-400">NIP: </span>
                                <span className="font-mono text-slate-800">{user.nip}</span>
                              </div>
                            )}
                            {user.employmentStatus && (
                              <div>
                                <span className="text-slate-400">Status: </span>
                                <span className="font-semibold text-blue-900">
                                  {user.employmentStatus}
                                </span>
                              </div>
                            )}
                            {user.bankName && user.accountNumber && (
                              <div className="truncate text-slate-600">
                                {user.bankName}: {user.accountNumber}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Aksi SuperAdmin */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data User ini (Khusus SuperAdmin)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={isBenisius || isCurrent}
                            onClick={() => {
                              setDeletingUser(user);
                              setFeedbackMessage(null);
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-30 disabled:cursor-not-allowed text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title={
                              isBenisius || isCurrent
                                ? 'Akun Super Admin Utama terlindungi'
                                : 'Hapus User dari Cloud Firestore'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: EDIT USER (KHUSUS SUPER ADMIN) */}
      {/* ============================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Edit3 className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    Edit Data Pengguna (Super Admin)
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    Memperbarui akun "{editingUser.name}" (@{editingUser.username}) langsung di Cloud Firestore
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {feedbackMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedbackMessage.type === 'error'
                      ? 'bg-rose-50 border border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedbackMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-semibold"
                  />
                </div>

                {/* 2. Role Pengguna */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Peran (Role Akses) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-bold"
                  >
                    <option value="ADMIN">ADMIN — Super Administrator</option>
                    <option value="KEPALA_SEKOLAH">KEPALA_SEKOLAH — Kepala Sekolah</option>
                    <option value="BENDAHARA">BENDAHARA — Bendahara Sekolah</option>
                    <option value="TATA_USAHA">TATA_USAHA — Kasir & Tata Usaha</option>
                    <option value="GURU">GURU — Guru Pendidik</option>
                    <option value="STAFF">STAFF — Tenaga Kependidikan / Karyawan</option>
                    <option value="ORANG_TUA">ORANG_TUA — Orang Tua Murid</option>
                  </select>
                </div>

                {/* 3. Username */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Min. 8 karakter</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>

                {/* 4. Kata Sandi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi / PIN Akun
                  </label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Ketik kata sandi baru untuk mereset"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>

                {/* 5. Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                  />
                </div>

                {/* 6. No. WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>

                {/* Kode Unik Registrasi (4 Angka & 4 Huruf) */}
                <div className="sm:col-span-2 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Nomor Registrasi / Kode Unik Akun (4 Angka & 4 Huruf)
                    </label>
                    <span className="text-[10px] text-amber-800">
                      Kode identifikasi unik per username & dapat digunakan saat login
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={8}
                      value={editUniqueCode}
                      onChange={(e) => setEditUniqueCode(e.target.value.toUpperCase())}
                      className="w-28 px-2 py-1 text-xs font-mono font-bold uppercase bg-white border border-amber-400 rounded-lg text-center text-blue-950 tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const existing = registeredUsers.map((u) => u.uniqueCode).filter(Boolean) as string[];
                        setEditUniqueCode(generateUniqueUserCode(existing));
                      }}
                      className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                      title="Generate Kode Baru"
                    >
                      Acak
                    </button>
                  </div>
                </div>

              </div>

              {/* Conditional Fields based on editRole */}
              {editRole === 'ORANG_TUA' ? (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <StudentPicker
                    students={students}
                    selectedStudentId={editStudentId}
                    selectedStudentName={editStudentName}
                    selectedStudentNis={editStudentNis}
                    onSelect={(s) => {
                      setEditStudentId(s?.id || '');
                      setEditStudentName(s?.name || '');
                      setEditStudentNis(s?.nis || '');
                      setEditStudentGrade(s?.grade || '1.1');
                    }}
                    required={true}
                    label="Pilih Siswa (Anak) yang Terhubung"
                    placeholder="Ketik nama anak atau NIS siswa..."
                    helperText="Akun orang tua ini akan terhubung langsung dengan tagihan & pembayaran atas nama siswa terpilih."
                  />
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>Data Kepegawaian & Posisi Sekolah</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Jabatan & Penugasan
                      </label>
                      <input
                        type="text"
                        value={editPositionTitle}
                        onChange={(e) => setEditPositionTitle(e.target.value)}
                        placeholder="Contoh: Guru Kelas 4A"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        NIP / NIK Pegawai
                      </label>
                      <input
                        type="text"
                        value={editNip}
                        onChange={(e) => setEditNip(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Status Kepegawaian
                      </label>
                      <select
                        value={editEmploymentStatus}
                        onChange={(e) => setEditEmploymentStatus(e.target.value as EmploymentStatus)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                      >
                        <option value="GTY">GTY — Guru Tetap Yayasan</option>
                        <option value="PTY">PTY — Pegawai Tetap Yayasan</option>
                        <option value="GTTY">GTTY — Guru Tidak Tetap Yayasan</option>
                        <option value="PTTY">PTTY — Pegawai Tidak Tetap Yayasan</option>
                        <option value="Honor Sekolah">Honor Sekolah / Yayasan</option>
                        <option value="PNS_DPK">PNS DPK</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nama Bank
                      </label>
                      <input
                        type="text"
                        value={editBankName}
                        onChange={(e) => setEditBankName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nomor Rekening
                      </label>
                      <input
                        type="text"
                        value={editAccountNumber}
                        onChange={(e) => setEditAccountNumber(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Atas Nama Rekening
                      </label>
                      <input
                        type="text"
                        value={editAccountHolder}
                        onChange={(e) => setEditAccountHolder(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Menyimpan ke Cloud...' : 'Simpan Pembaruan User'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: TAMBAH USER BARU (KHUSUS SUPER ADMIN) */}
      {/* ============================================================== */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
            
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <UserPlus className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    Tambah Akun Pengguna Baru
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    Daftarkan akun langsung ke Cloud Firestore SD BOPKRI Gondolayu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {feedbackMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedbackMessage.type === 'error'
                      ? 'bg-rose-50 border border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedbackMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso, S.Pd"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Peran (Role) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-bold"
                  >
                    <option value="KEPALA_SEKOLAH">Kepala Sekolah (Approval & View)</option>
                    <option value="BENDAHARA">Bendahara (Approval Keuangan & Gaji)</option>
                    <option value="TATA_USAHA">Tata Usaha (Kasir, Siswa, SPMB, Sarpras)</option>
                    <option value="GURU">Guru Pendidik (Modul & Slip Gaji)</option>
                    <option value="STAFF">Staf / Tenaga Kependidikan</option>
                    <option value="ORANG_TUA">Orang Tua Murid (Tagihan & Pembayaran)</option>
                    <option value="ADMIN">Super Administrator</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Username Baru <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Min. 8 karakter</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: budisantoso26"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan kata sandi awal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@bopkri.sch.id"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-mono"
                  />
                </div>

                {/* Kode Unik Otomatis (4 Angka & 4 Huruf) */}
                <div className="sm:col-span-2 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Nomor Registrasi / Kode Unik Akun (4 Angka & 4 Huruf)
                    </label>
                    <span className="text-[10px] text-amber-800">
                      Otomatis dibuat untuk memastikan data per username unik dan aman
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-mono font-black uppercase bg-white border border-amber-400 rounded-lg text-blue-950 tracking-wider">
                      {newUniqueCode || 'MEMBUAT...'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const existing = registeredUsers.map((u) => u.uniqueCode).filter(Boolean) as string[];
                        setNewUniqueCode(generateUniqueUserCode(existing));
                      }}
                      className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                      title="Generate Ulang Kode"
                    >
                      Acak
                    </button>
                  </div>
                </div>

              </div>

              {/* Conditional Add Fields */}
              {newRole === 'ORANG_TUA' ? (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                  <StudentPicker
                    students={students}
                    selectedStudentId={newStudentId}
                    selectedStudentName={newStudentName}
                    selectedStudentNis={newStudentNis}
                    onSelect={(s) => {
                      setNewStudentId(s?.id || '');
                      setNewStudentName(s?.name || '');
                      setNewStudentNis(s?.nis || '');
                      setNewStudentGrade(s?.grade || '1.1');
                      if (s?.parentName && !newName.trim()) {
                        setNewName(s.parentName);
                      }
                      if (s?.parentPhone && (newPhone === '08' || !newPhone)) {
                        setNewPhone(s.parentPhone);
                      }
                    }}
                    required={true}
                    label="Pilih Siswa (Anak) yang Terhubung"
                    placeholder="Ketik nama anak atau NIS murid..."
                    helperText="Pilih nama anak agar akun orang tua langsung terhubung dengan tagihan & kwitansi pembayaran anak Anda."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    NIP / NUPTK (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 198203152008012003"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || newUsername.trim().length < 8}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Mendaftarkan...' : 'Daftarkan User Baru'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: HAPUS USER CONFIRMATION */}
      {/* ============================================================== */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Hapus Pengguna
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <strong>"{deletingUser.name}"</strong> (Username: <code>@{deletingUser.username}</code>, Peran: <code>{deletingUser.role}</code>)?
              </p>
              <p className="text-[11px] text-rose-600 font-medium">
                Tindakan ini akan menghapus dokumen dari Cloud Firestore secara permanen.
              </p>
            </div>

            {feedbackMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteUser}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isSubmitting ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
