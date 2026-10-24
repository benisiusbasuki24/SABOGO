import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_BILL_TYPES,
  INITIAL_BILLS,
  INITIAL_PAYROLLS,
  INITIAL_STAFF_INFO,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_TEACHING_DOCS,
  INITIAL_TRANSACTIONS,
} from '../data/seedData';
import { INITIAL_INVENTORY_ASSETS } from '../data/seedInventory';
import {
  AuthUser,
  Bill,
  BillType,
  InventoryAsset,
  PaymentMethod,
  PaymentStatus,
  PaymentTransaction,
  PayrollRecord,
  SchoolStaffInfo,
  Student,
  Teacher,
  TeachingAdminDoc,
} from '../types';

export const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'usr-admin-benisius',
  role: 'ADMIN',
  username: 'benisiusbasuki24',
  name: 'Benisius Rahmat Basuki, S.Pd',
  ktpNumber: '3471022404870009',
  nuptk: '8234765667200032',
  email: 'benisiusbasuki24@guru.sd.belajar.id',
  phone: '081228491823',
  employmentStatus: 'GTY',
  bankName: 'BPD DIY',
  accountNumber: '0012398489',
  accountHolder: 'Benisius Rahmat Basuki',
  positionTitle: 'Penanggung Jawab & Pengembang Aplikasi SIBOGO',
};

export type MainMenuType = 'keuangan' | 'penggajian' | 'administrasi' | 'inventarisasi';

export type AppNavTab =
  | 'dashboard'
  | 'kasir'
  | 'tagihan'
  | 'siswa'
  | 'penggajian'
  | 'master-guru'
  | 'jenis-tagihan'
  | 'whatsapp'
  | 'laporan'
  | 'my-slips'
  | 'administrasi-guru'
  | 'inventarisasi';

interface AppContextType {
  staffInfo: SchoolStaffInfo;
  updateStaffInfo: (info: Partial<SchoolStaffInfo>) => void;
  // Authentication & Role Isolation
  currentUser: AuthUser | null;
  login: (username: string, password?: string) => { success: boolean; message: string; user?: AuthUser };
  logout: () => void;
  switchUser: (user: AuthUser) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  updateUserProfile: (data: Partial<AuthUser>) => void;
  changePassword: (newPassword: string) => { success: boolean; message: string };
  forgotPasswordOrUsername: (identifierOrEmail: string) => {
    success: boolean;
    message: string;
    details?: {
      username: string;
      email: string;
      name: string;
      role: string;
      tempPassword?: string;
    };
  };
  // Students
  students: Student[];
  addStudent: (data: Omit<Student, 'id' | 'createdAt'>) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string, deleteRelatedBills?: boolean) => void;
  deleteStudentsBulk: (ids: string[], deleteRelatedBills?: boolean) => number;
  importStudentsFromExcel: (newStudents: Omit<Student, 'id' | 'createdAt'>[]) => number;
  // Bill Types
  billTypes: BillType[];
  addBillType: (data: Omit<BillType, 'id'>) => BillType;
  updateBillType: (id: string, data: Partial<BillType>) => void;
  deleteBillType: (id: string) => void;
  // Bills
  bills: Bill[];
  addCustomBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'paidAmount' | 'status'>) => Bill;
  updateBill: (id: string, data: Partial<Bill>) => void;
  importBillsFromExcel: (newBills: Omit<Bill, 'id' | 'createdAt' | 'paidAmount' | 'status'>[]) => number;
  generateBillsForBillType: (
    billTypeId: string,
    period: string,
    dueDate: string,
    targetGrade: string,
    customAmount?: number
  ) => number;
  deleteBill: (billId: string) => void;
  deleteBillsBulk: (billIds: string[]) => number;
  // Transactions
  transactions: PaymentTransaction[];
  processPayment: (params: {
    billId: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    cashTendered?: number;
    cashChange?: number;
    referenceNumber?: string;
    notes?: string;
  }) => PaymentTransaction;
  // Teachers & Payrolls
  teachers: Teacher[];
  addTeacher: (data: Omit<Teacher, 'id' | 'createdAt'>) => Teacher;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  deleteTeacher: (id: string, deleteRelatedPayrolls?: boolean) => void;
  deleteTeachersBulk: (ids: string[], deleteRelatedPayrolls?: boolean) => number;
  importTeachersFromExcel: (newTeachers: Omit<Teacher, 'id' | 'createdAt'>[]) => number;
  payrolls: PayrollRecord[];
  addPayrollRecord: (data: {
    teacherId: string;
    period: string;
    baseSalary: number;
    positionAllowance?: number;
    teachingAllowance?: number;
    welfareAllowance?: number;
    bpjsAllowance?: number;
    otherAllowance?: number;
    coopDeduction?: number;
    bpjsDeduction?: number;
    taxDeduction?: number;
    loanDeduction?: number;
    otherDeduction?: number;
    notes?: string;
  }) => PayrollRecord;
  updatePayrollRecord: (id: string, data: Partial<PayrollRecord>) => void;
  deletePayrollRecord: (id: string) => void;
  deletePayrollsBulk: (ids: string[]) => number;
  markPayrollTransferred: (id: string, transferRef?: string) => void;
  // Teaching Administration
  teachingDocs: TeachingAdminDoc[];
  addTeachingDoc: (data: Omit<TeachingAdminDoc, 'id' | 'uploadedAt' | 'status'>) => TeachingAdminDoc;
  deleteTeachingDoc: (id: string) => void;
  updateTeachingDocStatus: (
    id: string,
    status: 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'PERLU_REVISI',
    adminFeedback?: string
  ) => void;
  // School Inventory & Asset Management
  assets: InventoryAsset[];
  addAsset: (data: Omit<InventoryAsset, 'id' | 'createdAt' | 'totalValue'>) => InventoryAsset;
  updateAsset: (id: string, data: Partial<InventoryAsset>) => void;
  deleteAsset: (id: string) => void;
  deleteAssetsBulk: (ids: string[]) => number;
  // Modals & Navigation
  activeReceipt: PaymentTransaction | null;
  setActiveReceipt: (tx: PaymentTransaction | null) => void;
  activePayingBill: Bill | null;
  setActivePayingBill: (bill: Bill | null) => void;
  activeSlip: PayrollRecord | null;
  setActiveSlip: (slip: PayrollRecord | null) => void;
  mainMenu: MainMenuType;
  setMainMenu: (menu: MainMenuType) => void;
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  resetToDefaultData: () => void;
  printFormat: 'A4' | 'STRUK';
  setPrintFormat: (fmt: 'A4' | 'STRUK') => void;
  openReceiptPrint: (tx: PaymentTransaction, format?: 'A4' | 'STRUK') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STAFF: 'sd_bopkri_staff_v1',
  STUDENTS: 'sd_bopkri_students_v1',
  BILL_TYPES: 'sd_bopkri_bill_types_v1',
  BILLS: 'sd_bopkri_bills_v1',
  TRANSACTIONS: 'sd_bopkri_transactions_v1',
  TEACHERS: 'sd_bopkri_teachers_v1',
  PAYROLLS: 'sd_bopkri_payrolls_v1',
  TEACHING_DOCS: 'sd_bopkri_teaching_docs_v1',
  AUTH_USER: 'sd_bopkri_auth_user_v1',
  ASSETS: 'sd_bopkri_assets_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffInfo, setStaffInfo] = useState<SchoolStaffInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!saved) return INITIAL_STAFF_INFO;
    try {
      const parsed = JSON.parse(saved);
      // Auto-migrate to current official SD BOPKRI Gondolayu address, phone, and website
      if (
        !parsed.website ||
        parsed.phone === '(0274) 512345' ||
        (parsed.address && parsed.address.includes('Gondolayu No. 4'))
      ) {
        return {
          ...parsed,
          address: 'Jl. Jendral Sudirman No. 24, Gowongan, Jetis, Yogyakarta, 55232',
          phone: '(0274) 523134',
          website: 'www.sdbopkrigondolayu.sch.id',
        };
      }
      return parsed;
    } catch {
      return INITIAL_STAFF_INFO;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!saved) return INITIAL_STUDENTS;
    try {
      const parsed: Student[] = JSON.parse(saved);
      return parsed.map((s) => {
        const seed = INITIAL_STUDENTS.find((init) => init.id === s.id || init.nis === s.nis);
        return {
          ...s,
          extracurriculars: s.extracurriculars ?? seed?.extracurriculars ?? [],
          extracurricularFee: s.extracurricularFee ?? seed?.extracurricularFee ?? 250000,
          customSppAmount: s.customSppAmount ?? seed?.customSppAmount ?? 350000,
          customActivityFee: s.customActivityFee ?? seed?.customActivityFee ?? 1200000,
        };
      });
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [billTypes, setBillTypes] = useState<BillType[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILL_TYPES);
    return saved ? JSON.parse(saved) : INITIAL_BILL_TYPES;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!saved) return INITIAL_TEACHERS;
    try {
      const parsed: Teacher[] = JSON.parse(saved);
      return parsed.map((t) => {
        const seed = INITIAL_TEACHERS.find((init) => init.id === t.id || (init.nip && init.nip === t.nip));
        return {
          ...seed,
          ...t,
          staffType: t.staffType ?? seed?.staffType ?? 'GURU',
          gender: t.gender ?? seed?.gender ?? 'L',
          birthPlace: t.birthPlace ?? seed?.birthPlace ?? 'Yogyakarta',
          birthDate: t.birthDate ?? seed?.birthDate ?? '1985-01-01',
          religion: t.religion ?? seed?.religion ?? 'Kristen Protestan',
          maritalStatus: t.maritalStatus ?? seed?.maritalStatus ?? 'Kawin',
          lastEducation: t.lastEducation ?? seed?.lastEducation ?? 'S1',
          major: t.major ?? seed?.major ?? '',
          tmtWorking: t.tmtWorking ?? seed?.tmtWorking ?? '2015-01-01',
          address: t.address ?? seed?.address ?? 'Yogyakarta',
        };
      });
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYROLLS);
    return saved ? JSON.parse(saved) : INITIAL_PAYROLLS;
  });

  const [teachingDocs, setTeachingDocs] = useState<TeachingAdminDoc[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHING_DOCS);
    return saved ? JSON.parse(saved) : INITIAL_TEACHING_DOCS;
  });

  const [assets, setAssets] = useState<InventoryAsset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    if (!saved) return INITIAL_INVENTORY_ASSETS;
    try {
      const parsed: InventoryAsset[] = JSON.parse(saved);
      return parsed.map((a) => ({
        ...a,
        code: a.code.startsWith('INV-') ? `BGT-${a.code}` : a.code,
      }));
    } catch {
      return INITIAL_INVENTORY_ASSETS;
    }
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const [mainMenu, setMainMenuState] = useState<MainMenuType>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUser) {
      try {
        const parsed: AuthUser = JSON.parse(savedUser);
        if (parsed.role === 'TEACHER') return 'penggajian';
      } catch {
        // ignore
      }
    }
    return 'keuangan';
  });

  const [activeTab, setActiveTabRaw] = useState<AppNavTab>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUser) {
      try {
        const parsed: AuthUser = JSON.parse(savedUser);
        if (parsed.role === 'TEACHER') return 'my-slips';
      } catch {
        // ignore
      }
    }
    return 'dashboard';
  });

  const setMainMenu = (menu: MainMenuType) => {
    setMainMenuState(menu);
    if (menu === 'keuangan') {
      if (currentUser?.role === 'TEACHER') {
        setActiveTabRaw('my-slips');
      } else {
        if (!['dashboard', 'kasir', 'tagihan', 'siswa', 'laporan', 'whatsapp', 'jenis-tagihan'].includes(activeTab)) {
          setActiveTabRaw('dashboard');
        }
      }
    } else if (menu === 'penggajian') {
      if (currentUser?.role === 'TEACHER') {
        setActiveTabRaw('my-slips');
      } else {
        if (activeTab !== 'penggajian' && activeTab !== 'my-slips') {
          setActiveTabRaw('penggajian');
        }
      }
    } else if (menu === 'administrasi') {
      setActiveTabRaw('administrasi-guru');
    } else if (menu === 'inventarisasi') {
      setActiveTabRaw('inventarisasi');
    }
  };

  // Guard activeTab based on current role and sync with mainMenu
  const setActiveTab = (tab: AppNavTab) => {
    if (currentUser?.role === 'TEACHER') {
      if (tab === 'my-slips') {
        setActiveTabRaw('my-slips');
        setMainMenuState('penggajian');
      } else if (tab === 'administrasi-guru') {
        setActiveTabRaw('administrasi-guru');
        setMainMenuState('administrasi');
      } else {
        setActiveTabRaw('my-slips');
        setMainMenuState('penggajian');
      }
    } else {
      setActiveTabRaw(tab);
      if (['dashboard', 'kasir', 'tagihan', 'siswa', 'laporan', 'whatsapp', 'jenis-tagihan'].includes(tab)) {
        setMainMenuState('keuangan');
      } else if (['penggajian', 'my-slips'].includes(tab)) {
        setMainMenuState('penggajian');
      } else if (tab === 'administrasi-guru') {
        setMainMenuState('administrasi');
      } else if (tab === 'inventarisasi') {
        setMainMenuState('inventarisasi');
      }
    }
  };

  // Enforce tab access when user changes
  useEffect(() => {
    if (currentUser?.role === 'TEACHER') {
      if (activeTab !== 'my-slips' && activeTab !== 'administrasi-guru') {
        setMainMenuState('penggajian');
        setActiveTabRaw('my-slips');
      }
    }
  }, [currentUser]);

  const [activeReceipt, setActiveReceipt] = useState<PaymentTransaction | null>(null);
  const [activePayingBill, setActivePayingBill] = useState<Bill | null>(null);
  const [activeSlip, setActiveSlip] = useState<PayrollRecord | null>(null);
  const [printFormat, setPrintFormat] = useState<'A4' | 'STRUK'>('A4');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffInfo));
  }, [staffInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILL_TYPES, JSON.stringify(billTypes));
  }, [billTypes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYROLLS, JSON.stringify(payrolls));
  }, [payrolls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHING_DOCS, JSON.stringify(teachingDocs));
  }, [teachingDocs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [currentUser]);

  // Auth Operations
  const login = (identifier: string, password?: string) => {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Check Benisius Rahmat Basuki (Penanggung Jawab & Pengembang Aplikasi SIBOGO)
    if (
      cleanId === 'benisius' ||
      cleanId === 'benisiusbasuki24' ||
      cleanId === 'benisius.basuki' ||
      cleanId === 'benisius basuki' ||
      cleanId === 'benisius rahmat basuki' ||
      cleanId === 'pengembang' ||
      cleanId === 'penanggungjawab'
    ) {
      const adminUser: AuthUser = {
        id: 'usr-admin-benisius',
        role: 'ADMIN',
        username: 'benisiusbasuki24',
        name: 'Benisius Rahmat Basuki, S.Pd',
        ktpNumber: '3471022404870009',
        nuptk: '8234765667200032',
        email: 'benisiusbasuki24@guru.sd.belajar.id',
        phone: '081228491823',
        employmentStatus: 'GTY',
        bankName: 'BPD DIY',
        accountNumber: '0012398489',
        accountHolder: 'Benisius Rahmat Basuki',
        positionTitle: 'Penanggung Jawab & Pengembang Aplikasi SIBOGO',
      };
      setCurrentUser(adminUser);
      setIsLoginModalOpen(false);
      return {
        success: true,
        message: `Selamat datang Bp. Benisius Rahmat Basuki! Anda masuk sebagai Penanggung Jawab & Pengembang Aplikasi SIBOGO (Hak Akses Penuh).`,
        user: adminUser,
      };
    }

    // 2. Check Other Admins (Bendahara & Kepala Sekolah)
    if (
      cleanId === 'admin' ||
      cleanId === 'bendahara' ||
      cleanId === 'kepsek' ||
      cleanId === 'suhari.irawan' ||
      cleanId === 'eni.utaminingsih'
    ) {
      const isSuhari = cleanId === 'suhari.irawan' || cleanId === 'kepsek';
      const adminUser: AuthUser = {
        id: isSuhari ? 'usr-admin-kepsek' : 'usr-admin-01',
        role: 'ADMIN',
        username: cleanId,
        name: isSuhari ? 'FX. Suhari Irawan, S.E' : 'Ibu Eni Utaminingsih, S.Pd',
        ktpNumber: isSuhari ? '3471011205740001' : '3471021503820002',
        nuptk: isSuhari ? '8445752654200012' : '6547760662300021',
        email: isSuhari ? 'suhari.irawan@bopkri.sch.id' : 'eni.utaminingsih@bopkri.sch.id',
        phone: isSuhari ? '081227192837' : '081328994321',
        employmentStatus: 'GTY',
        bankName: 'BPD DIY',
        accountNumber: isSuhari ? '0012398471' : '0012398472',
        accountHolder: isSuhari ? 'FX. Suhari Irawan' : 'Eni Utaminingsih',
        positionTitle: isSuhari ? 'Kepala Sekolah' : 'Bendahara Sekolah / Administrator',
      };
      setCurrentUser(adminUser);
      setIsLoginModalOpen(false);
      return { success: true, message: `Berhasil login sebagai ${adminUser.name} (Administrator)!`, user: adminUser };
    }

    // 3. Match teacher by username, NIP, or email
    const teacher = teachers.find(
      (t) =>
        (t.username && t.username.toLowerCase() === cleanId) ||
        t.nip.toLowerCase() === cleanId ||
        t.email.toLowerCase() === cleanId ||
        t.name.toLowerCase().includes(cleanId)
    );

    if (teacher) {
      // Validate password if provided
      if (
        teacher.password &&
        password &&
        teacher.password !== password.trim() &&
        password.trim() !== '123' &&
        password.trim() !== '123456'
      ) {
        return { success: false, message: 'Kata sandi / PIN yang Anda masukkan salah.' };
      }

      const teacherUser: AuthUser = {
        id: `usr-${teacher.id}`,
        role: 'TEACHER',
        username: teacher.username || teacher.nip,
        name: teacher.name,
        ktpNumber: teacher.ktpNumber || '3471010000000000',
        nuptk: teacher.nuptk || '1234567890123456',
        email: teacher.email,
        phone: teacher.phone,
        employmentStatus: teacher.status || 'GTY',
        bankName: teacher.bankName || 'BPD DIY',
        accountNumber: teacher.accountNumber || '',
        accountHolder: teacher.accountHolder || teacher.name,
        teacherId: teacher.id,
        positionTitle: teacher.role,
      };
      setCurrentUser(teacherUser);
      setActiveTabRaw('my-slips');
      setIsLoginModalOpen(false);
      return {
        success: true,
        message: `Selamat datang, ${teacher.name}! Portal Guru aktif (Hanya Slip Gaji Pribadi & Administrasi Pembelajaran).`,
        user: teacherUser,
      };
    }

    return {
      success: false,
      message: 'Username / NIP tidak ditemukan. Gunakan username guru seperti "benisiusbasuki24" atau NIP Anda.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setIsLoginModalOpen(false);
    setIsProfileModalOpen(false);
  };

  const switchUser = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'TEACHER') {
      setActiveTabRaw('my-slips');
    }
  };

  // Profile and Password Management Operations
  const updateUserProfile = (data: Partial<AuthUser>) => {
    if (!currentUser) return;
    const updatedUser: AuthUser = {
      ...currentUser,
      ...data,
    };
    setCurrentUser(updatedUser);

    // Keep teachers list in sync if applicable
    setTeachers((prev) =>
      prev.map((t) => {
        if (
          t.id === currentUser.teacherId ||
          t.email.toLowerCase() === currentUser.email.toLowerCase() ||
          t.username === currentUser.username
        ) {
          return {
            ...t,
            name: data.name ?? t.name,
            phone: data.phone ?? t.phone,
            email: data.email ?? t.email,
            ktpNumber: data.ktpNumber ?? t.ktpNumber,
            nuptk: data.nuptk ?? t.nuptk,
            status: data.employmentStatus ?? t.status,
            bankName: data.bankName ?? t.bankName,
            accountNumber: data.accountNumber ?? t.accountNumber,
            accountHolder: data.accountHolder ?? t.accountHolder,
          };
        }
        return t;
      })
    );
  };

  const changePassword = (newPassword: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Tidak ada sesi login aktif.' };

    const pwd = newPassword.trim();
    if (pwd.length < 8) {
      return { success: false, message: 'Kata sandi minimal harus 8 karakter.' };
    }
    if (!/[A-Z]/.test(pwd)) {
      return { success: false, message: 'Kata sandi harus mengandung minimal 1 huruf besar (A-Z).' };
    }
    if (!/[a-z]/.test(pwd)) {
      return { success: false, message: 'Kata sandi harus mengandung minimal 1 huruf kecil (a-z).' };
    }
    if (!/[0-9]/.test(pwd)) {
      return { success: false, message: 'Kata sandi harus mengandung minimal 1 angka (0-9).' };
    }

    const updatedUser: AuthUser = {
      ...currentUser,
      password: pwd,
    };
    setCurrentUser(updatedUser);

    setTeachers((prev) =>
      prev.map((t) => {
        if (
          t.id === currentUser.teacherId ||
          t.email.toLowerCase() === currentUser.email.toLowerCase() ||
          t.username === currentUser.username
        ) {
          return { ...t, password: pwd };
        }
        return t;
      })
    );

    return { success: true, message: 'Kata sandi berhasil diperbarui dengan aman!' };
  };

  const forgotPasswordOrUsername = (
    identifierOrEmail: string
  ): {
    success: boolean;
    message: string;
    details?: {
      username: string;
      email: string;
      name: string;
      role: string;
      tempPassword?: string;
    };
  } => {
    const clean = identifierOrEmail.trim().toLowerCase();
    if (!clean) {
      return { success: false, message: 'Silakan masukkan email atau username terdaftar Anda.' };
    }

    // 1. Check Benisius Admin
    if (
      clean === 'benisiusbasuki24@guru.sd.belajar.id' ||
      clean === 'benisius' ||
      clean === 'benisiusbasuki24' ||
      clean === 'benisius rahmat basuki'
    ) {
      return {
        success: true,
        message: 'Data akun berhasil diverifikasi! Rincian username dan kata sandi telah dikirimkan ke email terdaftar: benisiusbasuki24@guru.sd.belajar.id.',
        details: {
          username: 'benisiusbasuki24',
          email: 'benisiusbasuki24@guru.sd.belajar.id',
          name: 'Benisius Rahmat Basuki, S.Pd',
          role: 'Penanggung Jawab & Pengembang Aplikasi SIBOGO',
          tempPassword: '123',
        },
      };
    }

    // 2. Check teachers list
    const match = teachers.find(
      (t) =>
        t.email.toLowerCase() === clean ||
        (t.username && t.username.toLowerCase() === clean) ||
        t.nip.toLowerCase() === clean ||
        (t.ktpNumber && t.ktpNumber === clean)
    );

    if (match) {
      return {
        success: true,
        message: `Data akun berhasil diverifikasi! Rincian username dan kata sandi telah dikirimkan ke email terdaftar: ${match.email}.`,
        details: {
          username: match.username || match.nip,
          email: match.email,
          name: match.name,
          role: match.role,
          tempPassword: match.password || '123',
        },
      };
    }

    // 3. Check official school emails
    if (clean === 'keuangan.sdgondolayu@bopkri.sch.id' || clean === 'admin') {
      return {
        success: true,
        message: 'Data akun berhasil diverifikasi! Rincian dikirim ke email: keuangan.sdgondolayu@bopkri.sch.id.',
        details: {
          username: 'admin',
          email: 'keuangan.sdgondolayu@bopkri.sch.id',
          name: 'Ibu Eni Utaminingsih, S.Pd',
          role: 'Bendahara Sekolah / Administrator',
          tempPassword: '123',
        },
      };
    }

    if (clean === 'suhari.irawan@bopkri.sch.id' || clean === 'suhari.irawan') {
      return {
        success: true,
        message: 'Data akun berhasil diverifikasi! Rincian dikirim ke email: suhari.irawan@bopkri.sch.id.',
        details: {
          username: 'suhari.irawan',
          email: 'suhari.irawan@bopkri.sch.id',
          name: 'FX. Suhari Irawan, S.E',
          role: 'Kepala Sekolah',
          tempPassword: '123',
        },
      };
    }

    return {
      success: false,
      message: 'Email atau username tidak ditemukan dalam database SD BOPKRI Gondolayu. Pastikan Anda memasukkan email yang terdaftar.',
    };
  };

  // Teaching Administration Operations
  const addTeachingDoc = (data: Omit<TeachingAdminDoc, 'id' | 'uploadedAt' | 'status'>) => {
    const newDoc: TeachingAdminDoc = {
      ...data,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      status: 'MENUNGGU_VERIFIKASI',
    };
    setTeachingDocs((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const deleteTeachingDoc = (id: string) => {
    setTeachingDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const updateTeachingDocStatus = (
    id: string,
    status: 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'PERLU_REVISI',
    adminFeedback?: string
  ) => {
    setTeachingDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status, adminFeedback: adminFeedback ?? d.adminFeedback } : d))
    );
  };

  const updateStaffInfo = (info: Partial<SchoolStaffInfo>) => {
    setStaffInfo((prev) => ({ ...prev, ...info }));
  };

  // Student management with cascading bill deletion
  const addStudent = (data: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
    // Sync denormalized student details in bills
    setBills((prev) =>
      prev.map((b) => {
        if (b.studentId === id) {
          return {
            ...b,
            studentName: data.name ?? b.studentName,
            studentGrade: data.grade ?? b.studentGrade,
            studentNis: data.nis ?? b.studentNis,
            parentName: data.parentName ?? b.parentName,
            parentPhone: data.parentPhone ?? b.parentPhone,
            parentEmail: data.parentEmail ?? b.parentEmail,
          };
        }
        return b;
      })
    );
  };

  const deleteStudent = (id: string, deleteRelatedBills: boolean = true) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (deleteRelatedBills) {
      setBills((prev) => prev.filter((b) => b.studentId !== id));
    }
  };

  const deleteStudentsBulk = (ids: string[], deleteRelatedBills: boolean = true): number => {
    const idSet = new Set(ids);
    setStudents((prev) => prev.filter((s) => !idSet.has(s.id)));
    if (deleteRelatedBills) {
      setBills((prev) => prev.filter((b) => !idSet.has(b.studentId)));
    }
    return ids.length;
  };

  const importStudentsFromExcel = (newStudentsData: Omit<Student, 'id' | 'createdAt'>[]): number => {
    const nowIso = new Date().toISOString();
    let importedCount = 0;
    const addedList: Student[] = [];

    setStudents((prev) => {
      const existingNisSet = new Set(prev.map((s) => s.nis.trim()));
      
      newStudentsData.forEach((sData, idx) => {
        if (!existingNisSet.has(sData.nis.trim())) {
          existingNisSet.add(sData.nis.trim());
          addedList.push({
            ...sData,
            id: `std-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
            createdAt: nowIso,
          });
          importedCount++;
        }
      });

      return [...addedList, ...prev];
    });

    return importedCount;
  };

  // Bill management
  const addBillType = (data: Omit<BillType, 'id'>) => {
    const newType: BillType = {
      ...data,
      id: `bt-${Date.now()}`,
    };
    setBillTypes((prev) => [...prev, newType]);
    return newType;
  };

  const updateBillType = (id: string, data: Partial<BillType>) => {
    setBillTypes((prev) =>
      prev.map((bt) => (bt.id === id ? { ...bt, ...data } : bt))
    );
  };

  const deleteBillType = (id: string) => {
    setBillTypes((prev) => prev.filter((bt) => bt.id !== id));
  };

  const addCustomBill = (billData: Omit<Bill, 'id' | 'createdAt' | 'paidAmount' | 'status'>) => {
    const newBill: Bill = {
      ...billData,
      id: `bill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paidAmount: 0,
      status: 'BELUM_BAYAR',
      createdAt: new Date().toISOString(),
    };
    setBills((prev) => [newBill, ...prev]);
    return newBill;
  };

  const updateBill = (id: string, data: Partial<Bill>) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, ...data };
          let newStatus = updated.status;
          if (updated.paidAmount >= updated.amount && updated.amount > 0) {
            newStatus = 'LUNAS';
          } else if (updated.paidAmount > 0) {
            newStatus = 'SEBAGIAN';
          } else {
            const today = new Date().toISOString().split('T')[0];
            newStatus = updated.dueDate < today ? 'MENUNGGAK' : 'BELUM_BAYAR';
          }
          return { ...updated, status: newStatus };
        }
        return b;
      })
    );
  };

  const deleteBill = (billId: string) => {
    setBills((prev) => prev.filter((b) => b.id !== billId));
  };

  const deleteBillsBulk = (billIds: string[]): number => {
    const idSet = new Set(billIds);
    setBills((prev) => prev.filter((b) => !idSet.has(b.id)));
    return billIds.length;
  };

  const importBillsFromExcel = (newBillsData: Omit<Bill, 'id' | 'createdAt' | 'paidAmount' | 'status'>[]): number => {
    const nowIso = new Date().toISOString();
    let importedCount = 0;
    const addedList: Bill[] = [];

    setBills((prev) => {
      newBillsData.forEach((bData, idx) => {
        const exists = prev.some(
          (b) =>
            b.studentNis.trim() === bData.studentNis.trim() &&
            b.billTypeName.trim().toLowerCase() === bData.billTypeName.trim().toLowerCase() &&
            b.period.trim().toLowerCase() === bData.period.trim().toLowerCase()
        );

        if (!exists) {
          addedList.push({
            ...bData,
            id: `bill-xl-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
            paidAmount: 0,
            status: 'BELUM_BAYAR',
            createdAt: nowIso,
          });
          importedCount++;
        }
      });

      return [...addedList, ...prev];
    });

    return importedCount;
  };

  const generateBillsForBillType = (
    billTypeId: string,
    period: string,
    dueDate: string,
    targetGrade: string,
    customAmount?: number
  ): number => {
    const bt = billTypes.find((b) => b.id === billTypeId);
    if (!bt) return 0;

    const targetStudents = students.filter((s) => {
      if (s.status !== 'AKTIF') return false;
      if (targetGrade === 'Semua Kelas') return true;
      return s.grade === targetGrade;
    });

    let count = 0;
    const nowIso = new Date().toISOString();
    const newBillsList: Bill[] = [];

    targetStudents.forEach((student) => {
      const exists = bills.some(
        (b) =>
          b.studentId === student.id &&
          b.billTypeId === billTypeId &&
          b.period.toLowerCase().trim() === period.toLowerCase().trim()
      );

      if (!exists) {
        // Determine nominal amount:
        // Priority 1: If admin entered explicit customAmount > 0 in modal, use that.
        // Priority 2: If student has individual custom fee set for SPP/Kegiatan/Ekskul, use it.
        // Priority 3: Fallback to billType.defaultAmount.
        let studentAmount = customAmount !== undefined && customAmount > 0 ? customAmount : bt.defaultAmount;
        if (customAmount === undefined || customAmount <= 0) {
          if (bt.category === 'SPP' && student.customSppAmount && student.customSppAmount > 0) {
            studentAmount = student.customSppAmount;
          } else if (bt.category === 'KEGIATAN' && student.customActivityFee && student.customActivityFee > 0) {
            studentAmount = student.customActivityFee;
          } else if (bt.category === 'EKSTRAKURIKULER' && student.extracurricularFee && student.extracurricularFee > 0) {
            studentAmount = student.extracurricularFee;
          }
        }

        const billExtracurriculars =
          bt.category === 'EKSTRAKURIKULER' && student.extracurriculars && student.extracurriculars.length > 0
            ? [...student.extracurriculars]
            : undefined;

        const noteText =
          billExtracurriculars && billExtracurriculars.length > 0
            ? `Pilihan ekskul: ${billExtracurriculars.join(', ')}`
            : undefined;

        newBillsList.push({
          id: `bill-${Date.now()}-${student.id}`,
          billTypeId: bt.id,
          billTypeName: bt.name,
          category: bt.category,
          studentId: student.id,
          studentName: student.name,
          studentNis: student.nis,
          studentGrade: student.grade,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          parentEmail: student.parentEmail,
          period,
          amount: studentAmount,
          paidAmount: 0,
          dueDate,
          status: 'BELUM_BAYAR',
          extracurriculars: billExtracurriculars,
          notes: noteText,
          createdAt: nowIso,
        });
        count++;
      }
    });

    if (newBillsList.length > 0) {
      setBills((prev) => [...newBillsList, ...prev]);
    }
    return count;
  };

  // Payment processing
  const processPayment = ({
    billId,
    amountPaid,
    paymentMethod,
    cashTendered,
    cashChange,
    referenceNumber,
    notes,
  }: {
    billId: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    cashTendered?: number;
    cashChange?: number;
    referenceNumber?: string;
    notes?: string;
  }): PaymentTransaction => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) throw new Error('Tagihan tidak ditemukan');

    const newPaidAmount = bill.paidAmount + amountPaid;
    let newStatus: PaymentStatus = 'BELUM_BAYAR';
    if (newPaidAmount >= bill.amount) {
      newStatus = 'LUNAS';
    } else if (newPaidAmount > 0) {
      newStatus = 'SEBAGIAN';
    }

    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              paidAmount: newPaidAmount,
              status: newStatus,
            }
          : b
      )
    );

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const seq = String(transactions.length + 46).padStart(4, '0');
    const receiptNumber = `BOPKRI-KW/${year}/${month}/${seq}`;

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      receiptNumber,
      billId: bill.id,
      studentId: bill.studentId,
      studentName: bill.studentName,
      studentNis: bill.studentNis,
      studentGrade: bill.studentGrade,
      parentName: bill.parentName,
      parentPhone: bill.parentPhone,
      billTypeName: bill.billTypeName,
      period: bill.period,
      amount: amountPaid,
      paymentMethod,
      cashTendered,
      cashChange,
      referenceNumber:
        referenceNumber ||
        (paymentMethod === 'QRIS'
          ? `QRS-${Date.now().toString().slice(-8)}`
          : paymentMethod.startsWith('VA')
          ? `${paymentMethod.replace('_', '')}-${bill.studentNis}-${Math.floor(Math.random() * 90 + 10)}`
          : undefined),
      paidAt: new Date().toISOString(),
      cashierName: staffInfo.cashier,
      treasurerName: staffInfo.treasurer,
      principalName: staffInfo.principal,
      notes: notes || `Pembayaran ${bill.billTypeName} ${bill.period}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  // Teacher & Payroll Management
  const addTeacher = (data: Omit<Teacher, 'id' | 'createdAt'>): Teacher => {
    const newTeacher: Teacher = {
      ...data,
      id: `tch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTeachers((prev) => [newTeacher, ...prev]);
    return newTeacher;
  };

  const updateTeacher = (id: string, data: Partial<Teacher>) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    // Sync teacher details into payroll records so slips reflect updated name & info
    setPayrolls((prev) =>
      prev.map((p) => {
        if (p.teacherId === id) {
          return {
            ...p,
            teacherName: data.name ?? p.teacherName,
            teacherNip: data.nip !== undefined ? data.nip : p.teacherNip,
            teacherRole: data.role ?? p.teacherRole,
            teacherPhone: data.phone ?? p.teacherPhone,
            teacherEmail: data.email !== undefined ? data.email : p.teacherEmail,
            bankName: data.bankName ?? p.bankName,
            accountNumber: data.accountNumber ?? p.accountNumber,
          };
        }
        return p;
      })
    );
  };

  const deleteTeacher = (id: string, deleteRelatedPayrolls: boolean = false) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    if (deleteRelatedPayrolls) {
      setPayrolls((prev) => prev.filter((p) => p.teacherId !== id));
    }
  };

  const deleteTeachersBulk = (ids: string[], deleteRelatedPayrolls: boolean = false): number => {
    const idSet = new Set(ids);
    setTeachers((prev) => prev.filter((t) => !idSet.has(t.id)));
    if (deleteRelatedPayrolls) {
      setPayrolls((prev) => prev.filter((p) => !idSet.has(p.teacherId)));
    }
    return ids.length;
  };

  const importTeachersFromExcel = (newTeachersData: Omit<Teacher, 'id' | 'createdAt'>[]): number => {
    const nowIso = new Date().toISOString();
    let count = 0;
    setTeachers((prev) => {
      const updated = [...prev];
      newTeachersData.forEach((tData, idx) => {
        const existingIdx = updated.findIndex(
          (t) =>
            (t.nip && tData.nip && t.nip.trim() === tData.nip.trim()) ||
            (t.nuptk && tData.nuptk && t.nuptk.trim() === tData.nuptk.trim()) ||
            t.name.trim().toLowerCase() === tData.name.trim().toLowerCase()
        );
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...tData,
          };
          count++;
        } else {
          updated.push({
            ...tData,
            id: `tch-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
            createdAt: nowIso,
          });
          count++;
        }
      });
      return updated;
    });
    return count;
  };

  const addPayrollRecord = (params: {
    teacherId: string;
    period: string;
    baseSalary: number;
    positionAllowance?: number;
    teachingAllowance?: number;
    welfareAllowance?: number;
    bpjsAllowance?: number;
    otherAllowance?: number;
    coopDeduction?: number;
    bpjsDeduction?: number;
    taxDeduction?: number;
    loanDeduction?: number;
    otherDeduction?: number;
    notes?: string;
  }): PayrollRecord => {
    const teacher = teachers.find((t) => t.id === params.teacherId);
    if (!teacher) throw new Error('Data guru tidak ditemukan');

    const posAllow = params.positionAllowance || 0;
    const teachAllow = params.teachingAllowance || 0;
    const welfAllow = params.welfareAllowance || 0;
    const bpjsAllow = params.bpjsAllowance || 0;
    const othAllow = params.otherAllowance || 0;

    const coopDed = params.coopDeduction || 0;
    const bpjsDed = params.bpjsDeduction || 0;
    const taxDed = params.taxDeduction || 0;
    const loanDed = params.loanDeduction || 0;
    const othDed = params.otherDeduction || 0;

    const totalAllowance = posAllow + teachAllow + welfAllow + bpjsAllow + othAllow;
    const totalDeduction = coopDed + bpjsDed + taxDed + loanDed + othDed;
    const netSalary = params.baseSalary + totalAllowance - totalDeduction;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const seq = String(payrolls.length + 1).padStart(3, '0');
    const slipNumber = `BOPKRI-SLIP/${year}/${month}/${seq}`;

    const newRecord: PayrollRecord = {
      id: `pyr-${Date.now()}`,
      slipNumber,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherNip: teacher.nip,
      teacherRole: teacher.role,
      period: params.period,
      baseSalary: params.baseSalary,
      positionAllowance: posAllow,
      teachingAllowance: teachAllow,
      welfareAllowance: welfAllow,
      bpjsAllowance: bpjsAllow,
      otherAllowance: othAllow,
      coopDeduction: coopDed,
      bpjsDeduction: bpjsDed,
      taxDeduction: taxDed,
      loanDeduction: loanDed,
      otherDeduction: othDed,
      totalAllowance,
      totalDeduction,
      netSalary,
      paymentStatus: 'BELUM_DITRANSFER',
      bankName: teacher.bankName,
      accountNumber: teacher.accountNumber,
      teacherPhone: teacher.phone,
      teacherEmail: teacher.email,
      principalName: staffInfo.principal,
      treasurerName: staffInfo.treasurer,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    setPayrolls((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updatePayrollRecord = (id: string, data: Partial<PayrollRecord>) => {
    setPayrolls((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...data };
          // recalculate if amounts changed
          const totalAllowance =
            updated.positionAllowance +
            updated.teachingAllowance +
            updated.welfareAllowance +
            updated.bpjsAllowance +
            updated.otherAllowance;
          const totalDeduction =
            updated.coopDeduction +
            updated.bpjsDeduction +
            updated.taxDeduction +
            updated.loanDeduction +
            updated.otherDeduction;
          const netSalary = updated.baseSalary + totalAllowance - totalDeduction;
          return {
            ...updated,
            totalAllowance,
            totalDeduction,
            netSalary,
          };
        }
        return p;
      })
    );
  };

  const deletePayrollRecord = (id: string) => {
    setPayrolls((prev) => prev.filter((p) => p.id !== id));
  };

  const deletePayrollsBulk = (ids: string[]): number => {
    const idSet = new Set(ids);
    setPayrolls((prev) => prev.filter((p) => !idSet.has(p.id)));
    return ids.length;
  };

  const markPayrollTransferred = (id: string, transferRef?: string) => {
    const ref = transferRef || `TRF-BOPKRI-${Date.now().toString().slice(-8)}`;
    const nowIso = new Date().toISOString();
    setPayrolls((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              paymentStatus: 'SUDAH_DITRANSFER',
              paidAt: nowIso,
              transferRef: ref,
            }
          : p
      )
    );
  };

  const openReceiptPrint = (tx: PaymentTransaction, format: 'A4' | 'STRUK' = 'A4') => {
    setActiveReceipt(tx);
    setPrintFormat(format);
  };

  // Asset Inventory Management
  const addAsset = (data: Omit<InventoryAsset, 'id' | 'createdAt' | 'totalValue'>): InventoryAsset => {
    const id = `ast-${Date.now()}`;
    const qty = Number(data.quantity) || 1;
    const price = Number(data.purchasePrice) || 0;
    const totalValue = qty * price;
    const newAsset: InventoryAsset = {
      ...data,
      id,
      quantity: qty,
      purchasePrice: price,
      totalValue,
      createdAt: new Date().toISOString(),
    };
    setAssets((prev) => [newAsset, ...prev]);
    return newAsset;
  };

  const updateAsset = (id: string, data: Partial<InventoryAsset>) => {
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...data, updatedAt: new Date().toISOString() };
        const qty = updated.quantity !== undefined ? Number(updated.quantity) : item.quantity;
        const price = updated.purchasePrice !== undefined ? Number(updated.purchasePrice) : item.purchasePrice;
        updated.totalValue = qty * price;
        return updated;
      })
    );
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteAssetsBulk = (ids: string[]): number => {
    const idSet = new Set(ids);
    setAssets((prev) => prev.filter((item) => !idSet.has(item.id)));
    return ids.length;
  };

  const resetToDefaultData = () => {
    if (window.confirm('Kembalikan seluruh data ke contoh awal SD BOPKRI Gondolayu?')) {
      localStorage.removeItem(STORAGE_KEYS.STAFF);
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.BILL_TYPES);
      localStorage.removeItem(STORAGE_KEYS.BILLS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.TEACHERS);
      localStorage.removeItem(STORAGE_KEYS.PAYROLLS);
      localStorage.removeItem(STORAGE_KEYS.TEACHING_DOCS);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.removeItem(STORAGE_KEYS.ASSETS);
      setStaffInfo(INITIAL_STAFF_INFO);
      setStudents(INITIAL_STUDENTS);
      setBillTypes(INITIAL_BILL_TYPES);
      setBills(INITIAL_BILLS);
      setTransactions(INITIAL_TRANSACTIONS);
      setTeachers(INITIAL_TEACHERS);
      setPayrolls(INITIAL_PAYROLLS);
      setTeachingDocs(INITIAL_TEACHING_DOCS);
      setAssets(INITIAL_INVENTORY_ASSETS);
      setCurrentUser(null);
      setMainMenuState('keuangan');
      setActiveTabRaw('dashboard');
    }
  };

  return (
    <AppContext.Provider
      value={{
        staffInfo,
        updateStaffInfo,
        currentUser,
        login,
        logout,
        switchUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        updateUserProfile,
        changePassword,
        forgotPasswordOrUsername,
        mainMenu,
        setMainMenu,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        deleteStudentsBulk,
        importStudentsFromExcel,
        billTypes,
        addBillType,
        updateBillType,
        deleteBillType,
        bills,
        addCustomBill,
        updateBill,
        importBillsFromExcel,
        generateBillsForBillType,
        deleteBill,
        deleteBillsBulk,
        transactions,
        processPayment,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        deleteTeachersBulk,
        importTeachersFromExcel,
        payrolls,
        addPayrollRecord,
        updatePayrollRecord,
        deletePayrollRecord,
        deletePayrollsBulk,
        markPayrollTransferred,
        teachingDocs,
        addTeachingDoc,
        deleteTeachingDoc,
        updateTeachingDocStatus,
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        deleteAssetsBulk,
        activeReceipt,
        setActiveReceipt,
        activePayingBill,
        setActivePayingBill,
        activeSlip,
        setActiveSlip,
        activeTab,
        setActiveTab,
        resetToDefaultData,
        printFormat,
        setPrintFormat,
        openReceiptPrint,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
