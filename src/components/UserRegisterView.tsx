import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AuthUser, EmploymentStatus, Student, UserRole, UserApprovalStatus, requiresSuperAdminModeration } from '../types';
import { StudentPicker } from './StudentPicker';
import { generateUniqueUserCode } from '../utils/uniqueCode';
import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
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
  XCircle,
} from 'lucide-react';

export const UserRegisterView: React.FC = () => {
  const {
    currentUser,
    isSuperAdmin,
    registeredUsers,
    adminUpdateUser,
    adminDeleteUser,
    registerUser,
    moderateUserRegistration,
    moderateBulkUserRegistrations,
    setActiveTab,
    setMainMenu,
    students,
    setIsDataPurgeModalOpen,
  } = useApp();

  // Active Workspace Tab: 'MODERASI' (Antrean Moderasi Super Admin) vs 'DIREKTORI' (Tabel Seluruh Pengguna)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'MODERASI' | 'DIREKTORI'>(() => {
    const hasPending = registeredUsers.some((u) => u.status === 'PENDING');
    return hasPending ? 'MODERASI' : 'DIREKTORI';
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Password visibility map: { [userId]: boolean }
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Modals state
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AuthUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [rejectingUser, setRejectingUser] = useState<AuthUser | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

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
  const [editStatus, setEditStatus] = useState<UserApprovalStatus>('APPROVED');
  const [editRejectionReason, setEditRejectionReason] = useState('');

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

  // Filter users based on search query, role filter, and status filter
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter((user) => {
      // Role filter
      if (selectedRole !== 'ALL' && user.role !== selectedRole) {
        return false;
      }

      // Status filter
      const userStatus = user.status || 'APPROVED';
      if (selectedStatus !== 'ALL' && userStatus !== selectedStatus) {
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
  }, [registeredUsers, searchQuery, selectedRole, selectedStatus]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = registeredUsers.length;
    const adminCount = registeredUsers.filter((u) => u.role === 'ADMIN').length;
    const kepsekCount = registeredUsers.filter((u) => u.role === 'KEPALA_SEKOLAH').length;
    const bendaharaCount = registeredUsers.filter((u) => u.role === 'BENDAHARA').length;
    const tuCount = registeredUsers.filter((u) => u.role === 'TATA_USAHA').length;
    const guruCount = registeredUsers.filter((u) => u.role === 'GURU' || u.role === 'TEACHER').length;
    const staffCount = registeredUsers.filter((u) => u.role === 'STAFF').length;
    const ortuCount = registeredUsers.filter((u) => u.role === 'ORANG_TUA').length;

    // Status counts
    const pendingUsers = registeredUsers.filter((u) => u.status === 'PENDING');
    const pendingCount = pendingUsers.length;
    const approvedCount = registeredUsers.filter((u) => !u.status || u.status === 'APPROVED').length;
    const rejectedUsers = registeredUsers.filter((u) => u.status === 'REJECTED');
    const rejectedCount = rejectedUsers.length;

    return {
      total,
      adminCount,
      kepsekCount,
      bendaharaCount,
      tuCount,
      guruCount,
      staffCount,
      ortuCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      pendingUsers,
      rejectedUsers,
    };
  }, [registeredUsers]);

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleModerateSingle = async (
    targetUser: AuthUser,
    status: UserApprovalStatus,
    reason?: string
  ) => {
    if (!isSuperAdmin) {
      setFeedbackMessage({
        type: 'error',
        text: 'Hanya Super Administrator (Benisius) yang memiliki hak akses memoderasi pendaftaran pengguna.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await moderateUserRegistration(targetUser.id, status, reason);
      if (res.success) {
        setFeedbackMessage({
          type: 'success',
          text: res.message,
        });
        setRejectingUser(null);
        setRejectionReasonText('');
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res.message,
        });
      }
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Terjadi kendala saat memoderasi akun pengguna.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkApprovePending = async () => {
    if (!isSuperAdmin) {
      setFeedbackMessage({
        type: 'error',
        text: 'Hanya Super Administrator (Benisius) yang memiliki hak akses memoderasi pendaftaran pengguna.',
      });
      return;
    }

    const pending = stats.pendingUsers;
    if (pending.length === 0) return;

    if (
      window.confirm(
        `Setujui dan aktifkan seluruh ${pending.length} akun yang sedang menunggu moderasi Super Administrator?`
      )
    ) {
      setIsSubmitting(true);
      try {
        const res = await moderateBulkUserRegistrations(
          pending.map((u) => u.id),
          'APPROVED'
        );
        if (res.success) {
          setFeedbackMessage({
            type: 'success',
            text: `Berhasil menyetujui ${res.count} akun pendaftaran. Seluruh akun kini berstatus aktif.`,
          });
        }
      } catch {
        setFeedbackMessage({
          type: 'error',
          text: 'Terjadi kendala saat menyetujui akun secara massal.',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
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
    setEditStatus(user.status || 'APPROVED');
    setEditRejectionReason(user.rejectionReason || '');
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
        status: editStatus,
        rejectionReason: editStatus === 'REJECTED' ? editRejectionReason.trim() || undefined : undefined,
        moderatedBy: currentUser?.name || 'Benisius Rahmat Basuki (SuperAdmin)',
        moderatedAt: editStatus !== (editingUser.status || 'APPROVED') ? new Date().toISOString() : editingUser.moderatedAt,
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

  const getStatusBadge = (status?: UserApprovalStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            Menunggu Moderasi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            Ditolak
          </span>
        );
      case 'APPROVED':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Disetujui / Aktif
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
            Daftar seluruh akun pengguna yang teregistrasi di sistem SIBOGO SD BOPKRI Gondolayu. Registrasi role <strong>Kepala Sekolah, Guru, Bendahara, Tata Usaha, dan Staf</strong> memerlukan moderasi Super Administrator sebelum aktif.
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

      {/* Workspace Switcher: Moderasi vs Direktori (Khusus Super Administrator) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveWorkspaceTab('MODERASI');
              setSelectedStatus('PENDING');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeWorkspaceTab === 'MODERASI'
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-950" />
            <span>🛡️ Moderasi Pendaftaran Akun</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeWorkspaceTab === 'MODERASI'
                  ? 'bg-amber-950 text-amber-200'
                  : stats.pendingCount > 0
                  ? 'bg-amber-400 text-amber-950 animate-pulse'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {stats.pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveWorkspaceTab('DIREKTORI');
              setSelectedStatus('ALL');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeWorkspaceTab === 'DIREKTORI'
                ? 'bg-blue-900 text-white shadow-md ring-2 ring-blue-600/30'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-blue-300" />
            <span>👥 Direktori Semua Pengguna</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeWorkspaceTab === 'DIREKTORI'
                  ? 'bg-blue-950 text-blue-200'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {stats.total}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold px-2">
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setIsDataPurgeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
              title="Buka Pusat Penghapusan & Pembersihan Data Sistem"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Pusat Hapus Data</span>
            </button>
          )}
          <span className="flex items-center gap-1.5 text-blue-900 font-bold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            Super Administrator: Benisius Rahmat Basuki, S.Pd, Gr
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. DEDICATED SUPER ADMIN MODERATION WORKSPACE */}
      {/* ============================================================== */}
      {activeWorkspaceTab === 'MODERASI' && (
        <div className="space-y-6">
          {/* Super Admin Authority Notice */}
          <div className="p-5 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center shrink-0 font-black shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-white">
                    Pusat Moderasi & Persetujuan Registrasi Akun
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-blue-950 shadow-2xs">
                    Otoritas Tunggal Super Admin
                  </span>
                </div>
                <p className="text-xs text-blue-200 leading-relaxed max-w-2xl">
                  Registrasi dengan peran <strong>Kepala Sekolah, Guru Pendidik, Bendahara, Tata Usaha, dan Staf</strong> memerlukan moderasi dan persetujuan langsung dari Anda (<strong>Benisius Rahmat Basuki, S.Pd, Gr</strong>) sebelum akun dapat digunakan untuk login ke portal SIBOGO.
                </p>
              </div>
            </div>

            {stats.pendingCount > 0 && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBulkApprovePending}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui Semua ({stats.pendingCount}) Akun</span>
              </button>
            )}
          </div>

          {/* Pending Applications Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Antrean Pendaftaran Menunggu Verifikasi ({stats.pendingCount})
                </h3>
              </div>
              {stats.pendingCount > 0 && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  {stats.pendingCount} permohonan butuh tindakan Anda
                </span>
              )}
            </div>

            {stats.pendingCount === 0 ? (
              <div className="p-10 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto">
                  <BadgeCheck className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  Semua Pendaftaran Selesai Dimoderasi!
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Tidak ada permohonan pendaftaran yang sedang menunggu moderasi saat ini. Ketika ada calon guru, staf, atau pimpinan yang mendaftar, mereka akan otomatis tampil di sini secara real-time.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceTab('DIREKTORI');
                    setSelectedStatus('ALL');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Buka Direktori Semua Pengguna
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.pendingUsers.map((user) => {
                  const cleanPhone = (user.phone || '').replace(/[^0-9]/g, '');
                  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                  const waMessage = encodeURIComponent(
                    `Halo ${user.name}, ini adalah Super Administrator SIBOGO SD BOPKRI Gondolayu (Benisius Rahmat Basuki, S.Pd). Terkait permohonan pendaftaran akun Anda sebagai ${user.role} dengan username @${user.username} dan kode verifikasi #${user.uniqueCode || 'SIBOGO'}.`
                  );

                  return (
                    <div
                      key={user.id}
                      className="bg-white rounded-3xl border-2 border-amber-300 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Menunggu Otorisasi</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center text-sm font-black shrink-0 shadow-xs">
                            {user.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                          </div>
                          <div className="pr-16">
                            <h4 className="text-sm font-bold text-slate-900 leading-tight">
                              {user.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {getRoleBadge(user.role)}
                              {user.uniqueCode && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  #{user.uniqueCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">Username Login:</span>
                            <span className="font-mono font-bold text-blue-950">@{user.username}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-medium truncate max-w-[180px]">{user.email || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">WhatsApp / Telp:</span>
                            <span className="font-mono font-semibold">{user.phone || '-'}</span>
                          </div>
                          {user.nip && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-slate-500">NIP / NIK:</span>
                              <span className="font-mono font-medium">{user.nip}</span>
                            </div>
                          )}
                          {user.positionTitle && (
                            <div className="flex items-center justify-between text-slate-700">
                              <span className="text-slate-500">Jabatan:</span>
                              <span className="font-medium text-slate-800">{user.positionTitle}</span>
                            </div>
                          )}
                          {user.createdAt && (
                            <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                              <span>Waktu Daftar:</span>
                              <span>{new Date(user.createdAt).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleModerateSingle(user, 'APPROVED')}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Setujui & Aktifkan</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => {
                              setRejectingUser(user);
                              setRejectionReasonText('');
                            }}
                            className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Tolak</span>
                          </button>
                        </div>

                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${waNumber}?text=${waMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hubungi Pemohon via WhatsApp</span>
                            <ExternalLink className="w-3 h-3 text-emerald-500" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rejected Registrations Section (if any) */}
          {stats.rejectedCount > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-800">
                <XCircle className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Riwayat Registrasi Ditolak ({stats.rejectedCount})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.rejectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{user.name}</span>
                        {getRoleBadge(user.role)}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">@{user.username} • {user.email}</span>
                      {user.rejectionReason && (
                        <p className="text-[11px] text-rose-800 mt-1 italic">
                          Alasan: "{user.rejectionReason}"
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleModerateSingle(user, 'APPROVED')}
                      className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      Pulihkan & Aktifkan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DIREKTORI SEMUA PENGGUNA (TABEL LENGKAP & PENCARIAN) */}
      {/* ============================================================== */}
      {activeWorkspaceTab === 'DIREKTORI' && (
        <div className="space-y-6">
          {/* Moderation Pending Notice Banner (if any) */}
          {stats.pendingCount > 0 && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-amber-950">
                      {stats.pendingCount} Pendaftaran Akun Memerlukan Moderasi Super Admin
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 shadow-2xs">
                      Perlu Verifikasi
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    Pendaftaran untuk role kepegawaian resmi (Kepala Sekolah, Guru, Bendahara, Tata Usaha, Staf) memerlukan persetujuan dari Anda (Benisius R.B).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceTab('MODERASI');
                    setSelectedStatus('PENDING');
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-white border border-amber-300 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-800" />
                  <span>Buka Tab Moderasi ({stats.pendingCount})</span>
                </button>
              </div>
            </div>
          )}

          {/* Moderation Status KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedStatus('ALL')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'ALL'
              ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-600/30'
              : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-xs'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedStatus === 'ALL' ? 'text-blue-200' : 'text-slate-400'}`}>
            Total Akun
          </span>
          <span className="text-2xl font-black mt-1 block">
            {stats.total}
          </span>
          <span className={`text-[10px] ${selectedStatus === 'ALL' ? 'text-blue-200' : 'text-slate-500'}`}>
            Semua pengguna terdaftar
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('PENDING')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            selectedStatus === 'PENDING'
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400/40'
              : 'bg-white border-amber-200 text-slate-900 hover:border-amber-300 shadow-xs'
          }`}
        >
          {stats.pendingCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedStatus === 'PENDING' ? 'text-amber-950' : 'text-amber-600'}`}>
            Menunggu Moderasi
          </span>
          <span className="text-2xl font-black mt-1 block">
            {stats.pendingCount}
          </span>
          <span className={`text-[10px] ${selectedStatus === 'PENDING' ? 'text-amber-950 font-bold' : 'text-amber-700'}`}>
            Memerlukan persetujuan
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('APPROVED')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'APPROVED'
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white border-emerald-200 text-slate-900 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedStatus === 'APPROVED' ? 'text-emerald-100' : 'text-emerald-600'}`}>
            Disetujui / Aktif
          </span>
          <span className="text-2xl font-black mt-1 block">
            {stats.approvedCount}
          </span>
          <span className={`text-[10px] ${selectedStatus === 'APPROVED' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Dapat masuk ke aplikasi
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('REJECTED')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedStatus === 'REJECTED'
              ? 'bg-rose-700 text-white border-rose-800 shadow-md ring-2 ring-rose-500/30'
              : 'bg-white border-rose-200 text-slate-900 hover:border-rose-300 shadow-xs'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedStatus === 'REJECTED' ? 'text-rose-100' : 'text-rose-500'}`}>
            Ditolak
          </span>
          <span className="text-2xl font-black mt-1 block">
            {stats.rejectedCount}
          </span>
          <span className={`text-[10px] ${selectedStatus === 'REJECTED' ? 'text-rose-100' : 'text-rose-600'}`}>
            Pendaftaran tidak disetujui
          </span>
        </button>
      </div>

      {/* Global Stat Cards by Role */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
            Admin
          </span>
          <span className="text-lg font-black text-rose-900 mt-0.5 block">
            {stats.adminCount}
          </span>
          <span className="text-[9px] text-rose-600">Super Administrator</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">
            Kepsek
          </span>
          <span className="text-lg font-black text-purple-900 mt-0.5 block">
            {stats.kepsekCount}
          </span>
          <span className="text-[9px] text-purple-600">Otoritas Validasi</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
            Bendahara
          </span>
          <span className="text-lg font-black text-amber-900 mt-0.5 block">
            {stats.bendaharaCount}
          </span>
          <span className="text-[9px] text-amber-700">Keuangan & Gaji</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-cyan-200 shadow-xs">
          <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider block">
            Tata Usaha
          </span>
          <span className="text-lg font-black text-cyan-900 mt-0.5 block">
            {stats.tuCount}
          </span>
          <span className="text-[9px] text-cyan-700">Kasir, Siswa & SPMB</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            Guru Pendidik
          </span>
          <span className="text-lg font-black text-emerald-900 mt-0.5 block">
            {stats.guruCount}
          </span>
          <span className="text-[9px] text-emerald-700">Modul & Slip Gaji</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            Orang Tua
          </span>
          <span className="text-lg font-black text-blue-900 mt-0.5 block">
            {stats.ortuCount}
          </span>
          <span className="text-[9px] text-blue-700">Portal Tagihan Siswa</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
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

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-slate-800 cursor-pointer"
            >
              <option value="ALL">Semua Status ({registeredUsers.length})</option>
              <option value="PENDING">Menunggu Moderasi ({stats.pendingCount})</option>
              <option value="APPROVED">Disetujui / Aktif ({stats.approvedCount})</option>
              <option value="REJECTED">Ditolak ({stats.rejectedCount})</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Peran:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-slate-800 cursor-pointer"
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
                  <th className="py-3 px-4">Status Moderasi</th>
                  <th className="py-3 px-4">Username & Kata Sandi</th>
                  <th className="py-3 px-4">Kontak (Email / WA)</th>
                  <th className="py-3 px-4">Rincian Khusus Role</th>
                  <th className="py-3 px-4 text-center w-36">Aksi SuperAdmin</th>
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
                  const isPending = user.status === 'PENDING';
                  const isRejected = user.status === 'REJECTED';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPending ? 'bg-amber-50/40' : isRejected ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* No */}
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Nama & Akun */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                            isPending ? 'bg-amber-600' : isRejected ? 'bg-rose-700' : 'bg-blue-900'
                          }`}>
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
                            <span className="text-[10px] text-slate-400 block font-mono">
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

                      {/* Status Moderasi */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(user.status)}
                          {user.moderatedBy && (
                            <span className="text-[9px] text-slate-400 block">
                              Oleh: {user.moderatedBy}
                            </span>
                          )}
                          {user.rejectionReason && isRejected && (
                            <span
                              className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded block max-w-[150px] truncate"
                              title={user.rejectionReason}
                            >
                              Alasan: {user.rejectionReason}
                            </span>
                          )}
                          {user.createdAt && (
                            <span className="text-[9px] text-slate-400 block">
                              Daftar: {new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
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
                          {/* Quick Moderation: Approve pending */}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleModerateSingle(user, 'APPROVED')}
                                className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors cursor-pointer"
                                title="Setujui & Aktifkan Akun ini"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                  setRejectingUser(user);
                                  setRejectionReasonText('');
                                }}
                                className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg transition-colors cursor-pointer"
                                title="Tolak Registrasi Akun ini"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Quick Moderation: Re-approve rejected */}
                          {isRejected && (
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleModerateSingle(user, 'APPROVED')}
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors cursor-pointer"
                              title="Pulihkan & Aktifkan Kembali Akun ini"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

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
    </div>
  )}

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

              {/* Status Moderasi Akun (Super Admin Authority) */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Status Moderasi & Persetujuan Akun</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Otoritas Super Admin
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                    editStatus === 'APPROVED'
                      ? 'bg-emerald-100/80 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="editStatus"
                      value="APPROVED"
                      checked={editStatus === 'APPROVED'}
                      onChange={() => setEditStatus('APPROVED')}
                      className="text-emerald-600"
                    />
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Disetujui / Aktif</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                    editStatus === 'PENDING'
                      ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="editStatus"
                      value="PENDING"
                      checked={editStatus === 'PENDING'}
                      onChange={() => setEditStatus('PENDING')}
                      className="text-amber-600"
                    />
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Menunggu Moderasi</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                    editStatus === 'REJECTED'
                      ? 'bg-rose-100 border-rose-400 text-rose-950 ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="editStatus"
                      value="REJECTED"
                      checked={editStatus === 'REJECTED'}
                      onChange={() => setEditStatus('REJECTED')}
                      className="text-rose-600"
                    />
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Ditolak</span>
                  </label>
                </div>

                {editStatus === 'REJECTED' && (
                  <div>
                    <label className="block text-[11px] font-bold text-rose-800 mb-1">
                      Alasan Penolakan Registrasi
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: NIP tidak sesuai data kepegawaian atau nama belum terdaftar di SK"
                      value={editRejectionReason}
                      onChange={(e) => setEditRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-900"
                    />
                  </div>
                )}
              </div>

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

      {/* ============================================================== */}
      {/* MODAL 4: TOLAK REGISTRASI AKUN (KHUSUS SUPER ADMIN) */}
      {/* ============================================================== */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-700">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tolak Pendaftaran Akun
                  </h3>
                  <p className="text-xs text-slate-500">
                    Otoritas Moderasi Super Administrator (Benisius R.B)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Calon Pengguna:
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  {rejectingUser.name}
                </span>
                <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  @{rejectingUser.username}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                <span>Peran: <strong>{rejectingUser.role}</strong></span>
                {rejectingUser.nip && <span>• NIP: {rejectingUser.nip}</span>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alasan Penolakan Registrasi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Tuliskan alasan mengapa pendaftaran ini ditolak..."
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white text-slate-900 resize-none font-medium"
              />

              <div className="mt-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block">Pilihan Alasan Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Data NIP/NIK tidak sesuai arsip kepegawaian sekolah',
                    'Bukan pegawai atau guru aktif SD BOPKRI Gondolayu',
                    'Harap konfirmasi terlebih dahulu ke Bagian Tata Usaha',
                    'Duplikasi permohonan akun pendaftaran',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReasonText(preset)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium rounded-lg transition-colors cursor-pointer text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setRejectingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  handleModerateSingle(
                    rejectingUser,
                    'REJECTED',
                    rejectionReasonText.trim() || 'Data registrasi tidak sesuai atau belum terverifikasi.'
                  )
                }
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>Konfirmasi Tolak Registrasi</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
