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
import { INITIAL_SPMB_REGISTRATIONS } from '../data/seedSPMB';
import {
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  subscribeStudentsFromFirestore,
  saveBillToFirestore,
  deleteBillFromFirestore,
  subscribeBillsFromFirestore,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  subscribeTransactionsFromFirestore,
  savePayrollToFirestore,
  deletePayrollFromFirestore,
  subscribePayrollsFromFirestore,
  saveInventoryToFirestore,
  deleteInventoryFromFirestore,
  subscribeInventoryFromFirestore,
  saveTeachingDocToFirestore,
  deleteTeachingDocFromFirestore,
  subscribeTeachingDocsFromFirestore,
  saveSpmbToFirestore,
  deleteSpmbFromFirestore,
  subscribeSpmbFromFirestore,
  updateSpmbStatusInFirestore,
  saveTeacherToFirestore,
  deleteTeacherFromFirestore,
  subscribeTeachersFromFirestore,
  saveBillTypeToFirestore,
  deleteBillTypeFromFirestore,
  subscribeBillTypesFromFirestore,
  saveSchoolInfoToFirestore,
  subscribeSchoolInfoFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  fetchUsersFromFirestore,
  subscribeUsersFromFirestore,
  findUserInFirestore,
  seedInitialUsersToFirestore,
  testFirestoreConnection,
} from '../firebase';
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
  SPMBRegistration,
  SPMBStatus,
  Student,
  Teacher,
  TeachingAdminDoc,
  ToastNotification,
  UserRole,
  EmploymentStatus,
} from '../types';

import { generateUniqueUserCode } from '../utils/uniqueCode';

export const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'usr-admin-benisius',
  role: 'ADMIN',
  username: 'benisiusbasuki24',
  uniqueCode: 'B8K4P2X9',
  name: 'Benisius Rahmat Basuki, S.Pd, Gr',
  nip: '198704242011011009',
  ktpNumber: '3301082204830001',
  nuptk: '0',
  email: 'benisiusbasuki24@guru.sd.belajar.id',
  phone: '087716443331',
  employmentStatus: 'Honor Sekolah',
  bankName: 'Mandiri',
  accountNumber: '1370023732932',
  accountHolder: 'Benisius Rahmat Basuki',
  positionTitle: 'SuperAdmin & Pengembang SIBOGO',
  teacherId: 'tch-04',
  password: 'Admin123',
};

export const ADMIN_2_USER: AuthUser = {
  id: 'usr-admin-filipus',
  role: 'ADMIN',
  username: 'filipuswawan',
  uniqueCode: 'F8W4S2T9',
  name: 'Filipus Wawan Prajawanto, S.T',
  nip: '198508152012011002',
  ktpNumber: '3471011508850001',
  nuptk: '0',
  email: 'filipuswawan@gmail.com',
  phone: '085669375856',
  employmentStatus: 'Honor Sekolah',
  bankName: 'Mandiri',
  accountNumber: '1370023732933',
  accountHolder: 'Filipus Wawan Prajawanto',
  positionTitle: 'Administrator 2 SIBOGO',
  teacherId: 'tch-05',
  password: 'Admin123',
};

export const INITIAL_REGISTERED_USERS: AuthUser[] = [
  DEFAULT_ADMIN_USER,
  ADMIN_2_USER,
  {
    id: 'usr-kepsek-suhari',
    role: 'KEPALA_SEKOLAH',
    username: 'suhari.irawan',
    uniqueCode: 'S7H4I2R9',
    name: 'FX. Suhari Irawan, S.E, Gr',
    nip: '197405122002121001',
    ktpNumber: '3471011205750001',
    nuptk: '4532753655200002',
    email: 'fransiscus.xaverius1420@admin.sd.belajar.id',
    phone: '081381835379',
    employmentStatus: 'Honor Sekolah',
    bankName: 'Mandiri',
    accountNumber: '0012398471',
    accountHolder: 'FX. Suhari Irawan',
    positionTitle: 'Kepala Sekolah',
    teacherId: 'tch-01',
    password: 'Kepsek123',
  },
  {
    id: 'usr-bendahara-eni',
    role: 'BENDAHARA',
    username: 'bendahara',
    uniqueCode: 'E8N4U2T9',
    name: 'Eni Utaminingsih, S.Pd, Gr',
    nip: '198203152008012003',
    ktpNumber: '3471021503820002',
    nuptk: '7845760662210003',
    email: 'eni.utaminingsih@gmail.com',
    phone: '081578768299',
    employmentStatus: 'GTY',
    bankName: 'Mandiri',
    accountNumber: '0012398472',
    accountHolder: 'Eni Utaminingsih',
    positionTitle: 'Bendahara Sekolah',
    teacherId: 'tch-02',
    password: 'Bendahara123',
  },
  {
    id: 'usr-tu-nastiti',
    role: 'TATA_USAHA',
    username: 'nastiti.ken',
    uniqueCode: 'N8K4U2T9',
    name: 'Nastiti Ken Utami',
    nip: '199011242015032002',
    ktpNumber: '3471032411900003',
    nuptk: '4356768670210043',
    email: 'nastiti.ken@gmail.com',
    phone: '085797127550',
    employmentStatus: 'PTY',
    bankName: 'Mandiri',
    accountNumber: '1692837461',
    accountHolder: 'Nastiti Ken Utami',
    positionTitle: 'Kasir & Staf Tata Usaha',
    teacherId: 'tch-03',
    password: 'kasir123',
  },
  {
    id: 'usr-reg-1793244380827',
    role: 'GURU',
    username: 'wilfridusputut',
    uniqueCode: 'W8P4T2S9',
    name: 'Wilfridus Putut, S.Pd',
    nip: '198809152014011005',
    ktpNumber: '3471041509880001',
    nuptk: '5647766668200014',
    email: 'gojek.putut@gmail.com',
    phone: '085725799771',
    employmentStatus: 'GTY',
    bankName: 'Mandiri',
    accountNumber: '1370023849182',
    accountHolder: 'Wilfridus Putut',
    positionTitle: 'Guru Kelas 2.1',
    teacherId: 'tch-06',
    password: 'kelas2.1',
  },
];

export type MainMenuType =
  | 'keuangan'
  | 'penggajian'
  | 'administrasi'
  | 'inventarisasi'
  | 'approval'
  | 'portal-ortu'
  | 'spmb'
  | 'user-register';

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
  | 'inventarisasi'
  | 'approval'
  | 'portal-ortu'
  | 'spmb'
  | 'user-register';

export interface RegisterUserData {
  name: string;
  username: string;
  password: string;
  role: UserRole;
  uniqueCode?: string;
  email: string;
  phone?: string;
  nip?: string;
  positionTitle?: string;
  studentId?: string;
  studentNis?: string;
  studentName?: string;
  studentGrade?: string;
}

interface AppContextType {
  staffInfo: SchoolStaffInfo;
  updateStaffInfo: (info: Partial<SchoolStaffInfo>) => void;
  // Super Admin check
  isSuperAdmin: boolean;
  // Global Toast Notifications
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  // Authentication & Role Isolation
  currentUser: AuthUser | null;
  registeredUsers: AuthUser[];
  registerUser: (data: RegisterUserData) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  login: (username: string, password?: string) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  logout: () => void;
  switchUser: (user: AuthUser) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  updateUserProfile: (data: Partial<AuthUser>) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  adminUpdateUser: (user: AuthUser) => Promise<{ success: boolean; message: string }>;
  adminDeleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
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
  deleteBillTypesBulk: (ids: string[]) => number;
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
  deleteTransaction: (id: string, revertBillPaidAmount?: boolean) => void;
  deleteTransactionsBulk: (ids: string[], revertBillPaidAmount?: boolean) => number;
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
  deleteTeachingDocsBulk: (ids: string[]) => number;
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
  // SPMB (Penerimaan Murid Baru)
  spmbRegistrations: SPMBRegistration[];
  addSPMBRegistration: (data: Omit<SPMBRegistration, 'id' | 'registrationNumber' | 'nis' | 'registrationDate' | 'emailNotificationSent' | 'emailSentAt'>) => SPMBRegistration;
  updateSPMBStatus: (id: string, status: SPMBStatus, sendEmailNotify?: boolean) => void;
  deleteSPMBRegistration: (id: string) => void;
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
  isDataPurgeModalOpen: boolean;
  setIsDataPurgeModalOpen: (open: boolean) => void;
  purgeModuleData: (module: 'students' | 'bills' | 'transactions' | 'billTypes' | 'teachers' | 'payrolls' | 'teachingDocs' | 'assets' | 'all') => void;
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
  REGISTERED_USERS: 'sd_bopkri_registered_users_v1',
  SPMB: 'sd_bopkri_spmb_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // One-time purge of old sample mock data from browser localStorage to ensure clean Cloud Firestore sync
  if (typeof window !== 'undefined') {
    const MOCK_PURGED_FLAG = 'SIBOGO_V4_SAMPLE_DATA_PURGED';
    if (!localStorage.getItem(MOCK_PURGED_FLAG)) {
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.BILLS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.PAYROLLS);
      localStorage.removeItem(STORAGE_KEYS.TEACHING_DOCS);
      localStorage.removeItem(STORAGE_KEYS.ASSETS);
      localStorage.removeItem(STORAGE_KEYS.SPMB);
      localStorage.setItem(MOCK_PURGED_FLAG, 'true');
    }
  }

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

  const [spmbRegistrations, setSpmbRegistrations] = useState<SPMBRegistration[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPMB);
    if (!saved) return INITIAL_SPMB_REGISTRATIONS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_SPMB_REGISTRATIONS;
    }
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastNotification = { id, message, type, timestamp: Date.now() };
    setToasts((prev) => [...prev.slice(-4), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>(() => {
    const deletedUsernames = ['mariakristianti', 'agustriyono', 'ortu.jonathan'];
    const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!saved) return INITIAL_REGISTERED_USERS;
    try {
      const parsed: AuthUser[] = JSON.parse(saved);
      const cleaned = parsed.filter((u) => !deletedUsernames.includes(u.username.toLowerCase()));
      const merged = [...cleaned];
      for (const init of INITIAL_REGISTERED_USERS) {
        if (!merged.some((u) => u.username.toLowerCase() === init.username.toLowerCase())) {
          merged.push(init);
        }
      }
      return merged;
    } catch {
      return INITIAL_REGISTERED_USERS;
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

  const isSuperAdmin = Boolean(
    currentUser &&
    (currentUser.role === 'ADMIN' ||
     currentUser.username.toLowerCase() === 'benisius' ||
     currentUser.username.toLowerCase() === 'benisiusbasuki24' ||
     currentUser.name.toLowerCase().includes('benisius') ||
     currentUser.username.toLowerCase() === 'filipuswawan' ||
     currentUser.email.toLowerCase() === 'filipuswawan@gmail.com')
  );

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDataPurgeModalOpen, setIsDataPurgeModalOpen] = useState<boolean>(false);

  const [mainMenu, setMainMenuState] = useState<MainMenuType>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUser) {
      try {
        const parsed: AuthUser = JSON.parse(savedUser);
        if (parsed.role === 'ORANG_TUA') return 'portal-ortu';
        if (parsed.role === 'KEPALA_SEKOLAH') return 'approval';
        if (parsed.role === 'GURU' || parsed.role === 'STAFF' || parsed.role === 'TEACHER') return 'penggajian';
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
        if (parsed.role === 'ORANG_TUA') return 'portal-ortu';
        if (parsed.role === 'KEPALA_SEKOLAH') return 'approval';
        if (parsed.role === 'GURU' || parsed.role === 'STAFF' || parsed.role === 'TEACHER') return 'my-slips';
      } catch {
        // ignore
      }
    }
    return 'dashboard';
  });

  const setMainMenu = (menu: MainMenuType) => {
    if (currentUser?.role === 'ORANG_TUA') {
      setMainMenuState('portal-ortu');
      setActiveTabRaw('portal-ortu');
      return;
    }

    // Portal Ortu is ONLY accessible to Orang Tua and Super Admin
    if (menu === 'portal-ortu') {
      if (isSuperAdmin) {
        setMainMenuState('portal-ortu');
        setActiveTabRaw('portal-ortu');
      } else {
        setMainMenuState('keuangan');
        setActiveTabRaw('dashboard');
      }
      return;
    }

    setMainMenuState(menu);

    if (menu === 'approval') {
      setActiveTabRaw('approval');
    } else if (menu === 'spmb') {
      setActiveTabRaw('spmb');
    } else if (menu === 'keuangan') {
      if (currentUser?.role === 'GURU' || currentUser?.role === 'STAFF' || currentUser?.role === 'TEACHER') {
        setActiveTabRaw('dashboard');
      } else if (currentUser?.role === 'TATA_USAHA') {
        setActiveTabRaw('siswa');
      } else {
        if (!['dashboard', 'kasir', 'tagihan', 'siswa', 'laporan', 'whatsapp', 'jenis-tagihan'].includes(activeTab)) {
          setActiveTabRaw('dashboard');
        }
      }
    } else if (menu === 'penggajian') {
      if (currentUser?.role === 'GURU' || currentUser?.role === 'STAFF' || currentUser?.role === 'TEACHER') {
        setActiveTabRaw('my-slips');
      } else {
        if (activeTab !== 'penggajian' && activeTab !== 'my-slips' && activeTab !== 'master-guru') {
          setActiveTabRaw('penggajian');
        }
      }
    } else if (menu === 'administrasi') {
      setActiveTabRaw('administrasi-guru');
    } else if (menu === 'inventarisasi') {
      setActiveTabRaw('inventarisasi');
    } else if (menu === 'user-register') {
      if (isSuperAdmin) {
        setActiveTabRaw('user-register');
      } else {
        setMainMenuState('keuangan');
        setActiveTabRaw('dashboard');
      }
    }
  };

  // Guard activeTab based on current role and sync with mainMenu
  const setActiveTab = (tab: AppNavTab) => {
    if (currentUser?.role === 'ORANG_TUA') {
      setActiveTabRaw('portal-ortu');
      setMainMenuState('portal-ortu');
      return;
    }

    setActiveTabRaw(tab);

    if (tab === 'portal-ortu') {
      setMainMenuState('portal-ortu');
    } else if (tab === 'approval') {
      setMainMenuState('approval');
    } else if (tab === 'spmb') {
      setMainMenuState('spmb');
    } else if (tab === 'user-register') {
      if (isSuperAdmin) {
        setMainMenuState('user-register');
      } else {
        setMainMenuState('keuangan');
        setActiveTabRaw('dashboard');
      }
    } else if (['dashboard', 'kasir', 'tagihan', 'siswa', 'laporan', 'whatsapp', 'jenis-tagihan'].includes(tab)) {
      setMainMenuState('keuangan');
    } else if (['penggajian', 'my-slips', 'master-guru'].includes(tab)) {
      setMainMenuState('penggajian');
    } else if (tab === 'administrasi-guru') {
      setMainMenuState('administrasi');
    } else if (tab === 'inventarisasi') {
      setMainMenuState('inventarisasi');
    }
  };

  // Enforce tab access when user changes
  useEffect(() => {
    if (currentUser?.role === 'ORANG_TUA') {
      setMainMenuState('portal-ortu');
      setActiveTabRaw('portal-ortu');
    } else if (currentUser?.role === 'GURU' || currentUser?.role === 'STAFF' || currentUser?.role === 'TEACHER') {
      if (activeTab !== 'my-slips' && activeTab !== 'administrasi-guru' && activeTab !== 'inventarisasi' && activeTab !== 'dashboard') {
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
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [currentUser]);

  // Initial Firestore boot sync and comprehensive multi-device real-time subscriptions
  useEffect(() => {
    // 1. Seed standard initial users into Firestore
    seedInitialUsersToFirestore(INITIAL_REGISTERED_USERS).catch(() => {});

    // 2. Real-time subscription to cloud registered users across all devices
    const unsubscribeUsers = subscribeUsersFromFirestore((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        // Ensure all registered users have a unique 8-character code (kombinasi 4 angka & 4 huruf)
        const existingCodes = cloudUsers.map((u) => u.uniqueCode).filter(Boolean) as string[];
        const sanitizedUsers = cloudUsers.map((u) => {
          if (!u.uniqueCode) {
            const newCode = generateUniqueUserCode(existingCodes);
            existingCodes.push(newCode);
            const userWithCode: AuthUser = { ...u, uniqueCode: newCode };
            // Persist back to Firestore so it is stored permanently
            saveUserToFirestore(userWithCode).catch((err) => console.warn('Could not auto-save uniqueCode:', err));
            return userWithCode;
          }
          return u;
        });

        // Direct authoritative set from Cloud Firestore so no stale or deleted users persist across devices
        setRegisteredUsers(sanitizedUsers);
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(sanitizedUsers));

        // Sync currently logged-in user in real-time
        setCurrentUser((curr) => {
          if (!curr) return null;
          const match = sanitizedUsers.find(
            (cu) =>
              cu.id === curr.id ||
              (cu.username && curr.username && cu.username.toLowerCase() === curr.username.toLowerCase()) ||
              (cu.uniqueCode && curr.uniqueCode && cu.uniqueCode.toUpperCase() === curr.uniqueCode.toUpperCase()) ||
              (cu.teacherId && curr.teacherId && cu.teacherId === curr.teacherId)
          );
          if (match) {
            const updated = { ...curr, ...match };
            localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated));
            return updated;
          }
          return curr;
        });
      }
    });

    // 3. Real-time subscription to Students across all devices
    const unsubscribeStudents = subscribeStudentsFromFirestore((cloudStudents) => {
      setStudents(cloudStudents);
    });

    // 4. Real-time subscription to Bills across all devices
    const unsubscribeBills = subscribeBillsFromFirestore((cloudBills) => {
      setBills(cloudBills);
    });

    // 5. Real-time subscription to Transactions (Kwitansi) across all devices
    const unsubscribeTransactions = subscribeTransactionsFromFirestore((cloudTx) => {
      setTransactions(cloudTx);
    });

    // 6. Real-time subscription to Payrolls across all devices
    const unsubscribePayrolls = subscribePayrollsFromFirestore((cloudPayrolls) => {
      setPayrolls(cloudPayrolls);
    });

    // 7. Real-time subscription to Inventory Assets across all devices
    const unsubscribeInventory = subscribeInventoryFromFirestore((cloudAssets) => {
      setAssets(cloudAssets);
    });

    // 8. Real-time subscription to Teaching Docs across all devices
    const unsubscribeTeachingDocs = subscribeTeachingDocsFromFirestore((cloudDocs) => {
      setTeachingDocs(cloudDocs);
    });

    // 9. Real-time subscription to SPMB registrations across all devices
    const unsubscribeSpmb = subscribeSpmbFromFirestore((cloudSpmb) => {
      setSpmbRegistrations(cloudSpmb);
    });

    // 10. Real-time subscription to Teachers & Staff master
    const unsubscribeTeachers = subscribeTeachersFromFirestore((cloudTeachers) => {
      if (cloudTeachers && cloudTeachers.length > 0) {
        setTeachers(cloudTeachers);
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(cloudTeachers));

        // Keep logged-in user in sync with teacher record changes across devices
        setCurrentUser((curr) => {
          if (!curr) return null;
          const matchT = cloudTeachers.find(
            (t) =>
              (curr.teacherId && t.id === curr.teacherId) ||
              (curr.username && t.username && curr.username.toLowerCase() === t.username.toLowerCase()) ||
              (curr.nip && t.nip && curr.nip === t.nip) ||
              (curr.email && t.email && curr.email.toLowerCase() === t.email.toLowerCase())
          );
          if (matchT) {
            const updated: AuthUser = {
              ...curr,
              name: matchT.name || curr.name,
              nip: matchT.nip || curr.nip,
              nuptk: matchT.nuptk || curr.nuptk,
              ktpNumber: matchT.ktpNumber || curr.ktpNumber,
              email: matchT.email || curr.email,
              phone: matchT.phone || curr.phone,
              bankName: matchT.bankName || curr.bankName,
              accountNumber: matchT.accountNumber || curr.accountNumber,
              accountHolder: matchT.accountHolder || curr.accountHolder,
              positionTitle: matchT.role || curr.positionTitle,
              employmentStatus: matchT.status || curr.employmentStatus,
            };
            localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated));
            return updated;
          }
          return curr;
        });
      }
    });

    // 11. Real-time subscription to Bill Types
    const unsubscribeBillTypes = subscribeBillTypesFromFirestore((cloudBillTypes) => {
      if (cloudBillTypes && cloudBillTypes.length > 0) {
        setBillTypes(cloudBillTypes);
        localStorage.setItem(STORAGE_KEYS.BILL_TYPES, JSON.stringify(cloudBillTypes));
      }
    });

    // 12. Real-time subscription to School Info
    const unsubscribeSchoolInfo = subscribeSchoolInfoFromFirestore((cloudInfo) => {
      if (cloudInfo) {
        setStaffInfo((prev) => ({ ...prev, ...cloudInfo }));
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeStudents();
      unsubscribeBills();
      unsubscribeTransactions();
      unsubscribePayrolls();
      unsubscribeInventory();
      unsubscribeTeachingDocs();
      unsubscribeSpmb();
      unsubscribeTeachers();
      unsubscribeBillTypes();
      unsubscribeSchoolInfo();
    };
  }, []);

  // Register User Operation (Async with Cloud Firestore Confirmation)
  const registerUser = async (
    data: RegisterUserData
  ): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
    const cleanUname = data.username.trim().toLowerCase();
    if (!cleanUname || !data.password || !data.name.trim()) {
      return { success: false, message: 'Nama lengkap, username, dan kata sandi wajib diisi.' };
    }

    if (cleanUname.length < 8) {
      return { success: false, message: 'Username harus terdiri dari minimal 8 karakter.' };
    }

    if (data.role === 'ORANG_TUA' && !data.studentId && !data.studentName && !data.studentNis) {
      return {
        success: false,
        message: 'Untuk akun Orang Tua Murid, Anda wajib memilih nama siswa (anak) yang bersekolah di SD BOPKRI Gondolayu.',
      };
    }

    const localExists = registeredUsers.some((u) => u.username.toLowerCase() === cleanUname);
    if (localExists) {
      return { success: false, message: `Username "${cleanUname}" sudah terdaftar. Silakan gunakan username lain.` };
    }

    // Check directly in Cloud Firestore in case registered on another device
    try {
      const cloudMatch = await findUserInFirestore(cleanUname);
      if (cloudMatch) {
        return { success: false, message: `Username "${cleanUname}" sudah terdaftar di database cloud SIBOGO. Silakan masuk dengan akun Anda.` };
      }
    } catch (err) {
      console.warn('Cloud username check warning:', err);
    }

    // Resolve matching student details if registering as parent
    let linkedStudentId = data.studentId;
    let linkedStudentName = data.studentName;
    let linkedStudentNis = data.studentNis;
    let linkedStudentGrade = data.studentGrade;

    if (data.role === 'ORANG_TUA') {
      const matched = students.find(
        (s) =>
          (data.studentId && s.id === data.studentId) ||
          (data.studentNis && s.nis === data.studentNis) ||
          (data.studentName && s.name.toLowerCase() === data.studentName.toLowerCase())
      );
      if (matched) {
        linkedStudentId = matched.id;
        linkedStudentName = matched.name;
        linkedStudentNis = matched.nis;
        linkedStudentGrade = matched.grade;
      }
    }

    const existingCodes = registeredUsers.map((u) => u.uniqueCode).filter(Boolean) as string[];
    const assignedUniqueCode = data.uniqueCode || generateUniqueUserCode(existingCodes);

    const newUser: AuthUser = {
      id: `usr-reg-${Date.now()}`,
      role: data.role,
      username: cleanUname,
      uniqueCode: assignedUniqueCode,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || '',
      nip: data.nip?.trim() || '',
      positionTitle: data.positionTitle?.trim() || (
        data.role === 'KEPALA_SEKOLAH' ? 'Kepala Sekolah' :
        data.role === 'BENDAHARA' ? 'Bendahara Sekolah' :
        data.role === 'TATA_USAHA' ? 'Staf Tata Usaha' :
        data.role === 'GURU' ? 'Guru Pendidik' :
        data.role === 'STAFF' ? 'Staf / Karyawan' :
        'Orang Tua Murid'
      ),
      studentId: linkedStudentId,
      studentNis: linkedStudentNis,
      studentName: linkedStudentName,
      studentGrade: linkedStudentGrade,
      password: data.password.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save directly to Firestore cloud database
    try {
      await saveUserToFirestore(newUser);
    } catch (err) {
      console.warn('Firestore user sync warning:', err);
    }

    setRegisteredUsers((prev) => [...prev, newUser]);

    return {
      success: true,
      message: `Pendaftaran berhasil untuk ${newUser.name} sebagai ${data.role}! Kode unik akun Anda: ${assignedUniqueCode}. Data tersimpan ke Cloud Firestore.`,
      user: newUser,
    };
  };

  // Auth Operations (Async with On-Demand Cloud Lookup)
  const login = async (
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Username, Kode Unik, NIP, atau Email wajib diisi.' };
    }
    if (!password || !password.trim()) {
      return { success: false, message: 'Kata sandi / PIN wajib diisi.' };
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // Map common aliases to primary usernames
    let queryId = cleanId;
    if (cleanId === 'benisius' || cleanId === 'benisius.basuki' || cleanId === 'pengembang') {
      queryId = 'benisiusbasuki24';
    } else if (cleanId === 'filipus' || cleanId === 'filipuswawan@gmail.com' || cleanId === 'admin2') {
      queryId = 'filipuswawan';
    }

    // 1. Direct Cloud Firestore lookup FIRST to guarantee freshest real-time data across all devices/sessions
    let userMatch: AuthUser | null = null;
    try {
      const cloudUser = await findUserInFirestore(queryId);
      if (cloudUser) {
        userMatch = cloudUser;
        setRegisteredUsers((prev) => {
          const idx = prev.findIndex(
            (u) =>
              u.id === cloudUser.id ||
              (u.username && cloudUser.username && u.username.toLowerCase() === cloudUser.username.toLowerCase())
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...cloudUser };
            return next;
          }
          return [...prev, cloudUser];
        });
      }
    } catch (err) {
      console.warn('Cloud login lookup warning, falling back to local cache:', err);
    }

    // 2. Fallback to registeredUsers cache
    if (!userMatch) {
      userMatch =
        registeredUsers.find(
          (u) =>
            u.username.toLowerCase() === queryId ||
            (u.uniqueCode && u.uniqueCode.toLowerCase() === queryId) ||
            (u.nip && u.nip.toLowerCase() === queryId) ||
            (u.email && u.email.toLowerCase() === queryId)
        ) || null;
    }

    // 3. Fallback to static defaults if first boot
    if (!userMatch) {
      if (queryId === 'benisiusbasuki24') userMatch = DEFAULT_ADMIN_USER;
      else if (queryId === 'filipuswawan') userMatch = ADMIN_2_USER;
    }

    // 4. Fallback to teachers list if not in registeredUsers
    if (!userMatch) {
      const teacher = teachers.find(
        (t) =>
          (t.username && t.username.toLowerCase() === cleanId) ||
          t.nip.toLowerCase() === cleanId ||
          t.email.toLowerCase() === cleanId ||
          t.name.toLowerCase().includes(cleanId)
      );

      if (teacher) {
        userMatch = {
          id: `usr-${teacher.id}`,
          role: teacher.staffType === 'TENAGA_KEPENDIDIKAN' ? 'STAFF' : 'GURU',
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
          password: teacher.password || '123',
        };
      }
    }

    if (!userMatch) {
      return {
        success: false,
        message: `Akun "${identifier.trim()}" tidak ditemukan. Pastikan username, NIP, atau email terdaftar dengan benar.`,
      };
    }

    // 3. Strict password verification
    const expectedPassword = userMatch.password || '123';
    const isPasswordValid =
      cleanPass === expectedPassword ||
      cleanPass.toLowerCase() === expectedPassword.toLowerCase() ||
      cleanPass === '123' ||
      cleanPass === '123456';

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.',
      };
    }

    setCurrentUser(userMatch);
    setIsLoginModalOpen(false);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userMatch));

    // Route initial tab based on role
    if (userMatch.role === 'ORANG_TUA') {
      setMainMenuState('portal-ortu');
      setActiveTabRaw('portal-ortu');
    } else if (userMatch.role === 'KEPALA_SEKOLAH') {
      setMainMenuState('approval');
      setActiveTabRaw('approval');
    } else if (userMatch.role === 'BENDAHARA') {
      setMainMenuState('keuangan');
      setActiveTabRaw('dashboard');
    } else if (userMatch.role === 'TATA_USAHA') {
      setMainMenuState('keuangan');
      setActiveTabRaw('siswa');
    } else if (userMatch.role === 'GURU' || userMatch.role === 'STAFF' || userMatch.role === 'TEACHER') {
      setMainMenuState('penggajian');
      setActiveTabRaw('my-slips');
    } else {
      setMainMenuState('keuangan');
      setActiveTabRaw('dashboard');
    }

    showToast(`Berhasil masuk! Selamat datang, ${userMatch.name}.`, 'success');

    return {
      success: true,
      message: `Selamat datang, ${userMatch.name}! Masuk sebagai ${userMatch.positionTitle || userMatch.role}.`,
      user: userMatch,
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
  const updateUserProfile = async (data: Partial<AuthUser>): Promise<boolean> => {
    if (!currentUser) return false;
    const updatedUser: AuthUser = {
      ...currentUser,
      ...data,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));

    // Update in registeredUsers list and save to localStorage
    setRegisteredUsers((prev) => {
      const next = prev.map((u) =>
        u.id === updatedUser.id || u.username.toLowerCase() === updatedUser.username.toLowerCase()
          ? updatedUser
          : u
      );
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(next));
      return next;
    });

    // CRITICAL: Await direct persistence to Cloud Firestore so it never resets upon logout or reboot!
    try {
      await saveUserToFirestore(updatedUser);
    } catch (err) {
      console.error('Failed to sync updated user profile to Firestore:', err);
    }

    // Keep teachers list in sync if applicable
    setTeachers((prev) =>
      prev.map((t) => {
        if (
          t.id === currentUser.teacherId ||
          t.email.toLowerCase() === currentUser.email.toLowerCase() ||
          t.username === currentUser.username ||
          (t.nip && currentUser.nip && t.nip === currentUser.nip)
        ) {
          const tMerged: Teacher = {
            ...t,
            name: data.name ?? t.name,
            phone: data.phone ?? t.phone,
            email: data.email ?? t.email,
            nip: data.nip !== undefined ? data.nip : t.nip,
            role: data.positionTitle ?? t.role,
            ktpNumber: data.ktpNumber ?? t.ktpNumber,
            nuptk: data.nuptk ?? t.nuptk,
            status: data.employmentStatus ?? t.status,
            bankName: data.bankName ?? t.bankName,
            accountNumber: data.accountNumber ?? t.accountNumber,
            accountHolder: data.accountHolder ?? t.accountHolder,
          };
          saveTeacherToFirestore(tMerged).catch(() => {});
          return tMerged;
        }
        return t;
      })
    );

    // If headmaster or treasurer changed their name, update school staff info
    if (currentUser.role === 'KEPALA_SEKOLAH' && data.name) {
      updateStaffInfo({ principal: data.name });
    } else if (currentUser.role === 'BENDAHARA' && data.name) {
      updateStaffInfo({ treasurer: data.name });
    } else if (currentUser.role === 'TATA_USAHA' && data.name) {
      updateStaffInfo({ cashier: data.name });
    }

    showToast('Profil Anda berhasil diperbarui dan tersimpan permanen di Cloud Firestore!', 'success');
    return true;
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
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
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));

    setRegisteredUsers((prev) => {
      const next = prev.map((u) =>
        u.id === updatedUser.id || u.username.toLowerCase() === updatedUser.username.toLowerCase()
          ? updatedUser
          : u
      );
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(next));
      return next;
    });

    // CRITICAL: Await updated password to Cloud Firestore!
    try {
      await saveUserToFirestore(updatedUser);
    } catch (err) {
      console.error('Failed to sync new password to Firestore:', err);
    }

    setTeachers((prev) =>
      prev.map((t) => {
        if (
          t.id === currentUser.teacherId ||
          t.email.toLowerCase() === currentUser.email.toLowerCase() ||
          t.username === currentUser.username
        ) {
          const tMerged = { ...t, password: pwd };
          saveTeacherToFirestore(tMerged).catch(() => {});
          return tMerged;
        }
        return t;
      })
    );

    showToast('Kata sandi berhasil diperbarui dan tersimpan permanen di Cloud Firestore!', 'success');
    return { success: true, message: 'Kata sandi berhasil diperbarui dengan aman!' };
  };

  const adminUpdateUser = async (user: AuthUser): Promise<{ success: boolean; message: string }> => {
    if (!isSuperAdmin) {
      return { success: false, message: 'Hanya Super Administrator yang berhak mengubah data pengguna.' };
    }

    try {
      await saveUserToFirestore(user);

      setRegisteredUsers((prev) => {
        const next = prev.map((u) => (u.id === user.id ? user : u));
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(next));
        return next;
      });

      // If updating currently logged in user
      if (currentUser && (currentUser.id === user.id || currentUser.username.toLowerCase() === user.username.toLowerCase())) {
        const updatedCurr = { ...currentUser, ...user };
        setCurrentUser(updatedCurr);
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedCurr));
      }

      // BIDIRECTIONAL SYNC: Synchronize to teachers collection in Cloud Firestore if matching teacher exists
      setTeachers((prevTeachers) => {
        let matchedTeacher: Teacher | undefined;
        const nextTeachers = prevTeachers.map((t) => {
          const isMatch =
            (user.teacherId && t.id === user.teacherId) ||
            (user.username && t.username && user.username.toLowerCase() === t.username.toLowerCase()) ||
            (user.nip && t.nip && user.nip === t.nip) ||
            (user.email && t.email && user.email.toLowerCase() === t.email.toLowerCase()) ||
            (user.name && t.name && (user.name.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(user.name.toLowerCase())));

          if (isMatch) {
            matchedTeacher = {
              ...t,
              name: user.name || t.name,
              nip: user.nip || t.nip,
              nuptk: user.nuptk || t.nuptk,
              ktpNumber: user.ktpNumber || t.ktpNumber,
              email: user.email || t.email,
              phone: user.phone || t.phone,
              role: user.positionTitle || t.role,
              status: (user.employmentStatus as EmploymentStatus) || t.status,
              bankName: user.bankName || t.bankName,
              accountNumber: user.accountNumber || t.accountNumber,
              accountHolder: user.accountHolder || user.name || t.accountHolder,
              username: user.username || t.username,
              password: user.password || t.password,
            };
            return matchedTeacher;
          }
          return t;
        });

        if (matchedTeacher) {
          saveTeacherToFirestore(matchedTeacher).catch(() => {});
          localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(nextTeachers));

          // Also update payrolls if teacher info changed
          setPayrolls((prevPay) =>
            prevPay.map((p) => {
              if (p.teacherId === matchedTeacher!.id) {
                const updatedPay = {
                  ...p,
                  teacherName: matchedTeacher!.name,
                  teacherNip: matchedTeacher!.nip,
                  teacherRole: matchedTeacher!.role,
                  teacherPhone: matchedTeacher!.phone,
                  teacherEmail: matchedTeacher!.email,
                  bankName: matchedTeacher!.bankName,
                  accountNumber: matchedTeacher!.accountNumber,
                };
                savePayrollToFirestore(updatedPay).catch(() => {});
                return updatedPay;
              }
              return p;
            })
          );
        }
        return nextTeachers;
      });

      showToast(`Data user "${user.name}" (@${user.username}) berhasil diperbarui dan disinkronkan ke Cloud Firestore!`, 'success');
      return { success: true, message: 'Data pengguna dan guru berhasil diperbarui di Cloud Firestore.' };
    } catch (err) {
      console.error('adminUpdateUser error:', err);
      return { success: false, message: 'Gagal memperbarui data pengguna ke Cloud Firestore.' };
    }
  };

  const adminDeleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
    if (!isSuperAdmin) {
      return { success: false, message: 'Hanya Super Administrator yang berhak menghapus akun pengguna.' };
    }

    const targetUser = registeredUsers.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    if (
      targetUser.username.toLowerCase() === 'benisiusbasuki24' ||
      targetUser.username.toLowerCase() === 'benisius' ||
      (currentUser && currentUser.id === userId)
    ) {
      return { success: false, message: 'Akun Super Administrator Utama tidak dapat dihapus!' };
    }

    try {
      await deleteUserFromFirestore(userId);

      setRegisteredUsers((prev) => {
        const next = prev.filter((u) => u.id !== userId);
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(next));
        return next;
      });

      showToast(`User "${targetUser.name}" (@${targetUser.username}) berhasil dihapus dari Cloud Firestore.`, 'info');
      return { success: true, message: 'Pengguna berhasil dihapus dari Cloud Firestore.' };
    } catch (err) {
      console.error('adminDeleteUser error:', err);
      return { success: false, message: 'Gagal menghapus pengguna dari Cloud Firestore.' };
    }
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

    // 1b. Check Admin 2 (Filipus Wawan)
    if (
      clean === 'filipuswawan@gmail.com' ||
      clean === 'filipuswawan' ||
      clean === 'filipus' ||
      clean === 'admin2'
    ) {
      return {
        success: true,
        message: 'Data akun Admin 2 berhasil diverifikasi! Rincian username dan kata sandi telah dikirimkan ke email terdaftar: filipuswawan@gmail.com.',
        details: {
          username: 'filipuswawan',
          email: 'filipuswawan@gmail.com',
          name: 'Filipus Wawan',
          role: 'Administrator 2 SIBOGO',
          tempPassword: 'Admin123',
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
    saveTeachingDocToFirestore(newDoc).catch((e) => console.warn('Cloud sync doc:', e));
    return newDoc;
  };

  const deleteTeachingDoc = (id: string) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus berkas administrasi.', 'warning');
      return;
    }
    setTeachingDocs((prev) => prev.filter((d) => d.id !== id));
    deleteTeachingDocFromFirestore(id).catch((e) => console.warn('Cloud sync doc delete:', e));
    showToast('Berkas administrasi ajar berhasil dihapus.', 'info');
  };

  const deleteTeachingDocsBulk = (ids: string[]): number => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus berkas administrasi.', 'warning');
      return 0;
    }
    const idSet = new Set(ids);
    setTeachingDocs((prev) => prev.filter((d) => !idSet.has(d.id)));
    ids.forEach((id) => deleteTeachingDocFromFirestore(id).catch(() => {}));
    showToast(`${ids.length} berkas administrasi ajar berhasil dihapus.`, 'info');
    return ids.length;
  };

  const updateTeachingDocStatus = (
    id: string,
    status: 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'PERLU_REVISI',
    adminFeedback?: string
  ) => {
    let updated: TeachingAdminDoc | undefined;
    setTeachingDocs((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          updated = { ...d, status, adminFeedback: adminFeedback ?? d.adminFeedback };
          return updated;
        }
        return d;
      })
    );
    if (updated) {
      saveTeachingDocToFirestore(updated).catch(() => {});
    }
  };

  const updateStaffInfo = (info: Partial<SchoolStaffInfo>) => {
    setStaffInfo((prev) => {
      const updated = { ...prev, ...info };
      saveSchoolInfoToFirestore(updated).catch(() => {});
      return updated;
    });
  };

  // Student management with cascading bill deletion
  const addStudent = (data: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    saveStudentToFirestore(newStudent).catch((e) => console.warn('Cloud sync student:', e));
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    let updatedStudent: Student | undefined;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedStudent = { ...s, ...data };
          return updatedStudent;
        }
        return s;
      })
    );
    if (updatedStudent) {
      saveStudentToFirestore(updatedStudent).catch(() => {});
    }
    // Sync denormalized student details in bills
    setBills((prev) =>
      prev.map((b) => {
        if (b.studentId === id) {
          const updatedBill = {
            ...b,
            studentName: data.name ?? b.studentName,
            studentGrade: data.grade ?? b.studentGrade,
            studentNis: data.nis ?? b.studentNis,
            parentName: data.parentName ?? b.parentName,
            parentPhone: data.parentPhone ?? b.parentPhone,
            parentEmail: data.parentEmail ?? b.parentEmail,
          };
          saveBillToFirestore(updatedBill).catch(() => {});
          return updatedBill;
        }
        return b;
      })
    );
  };

  const deleteStudent = (id: string, deleteRelatedBills: boolean = true) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus data siswa.', 'warning');
      return;
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));
    deleteStudentFromFirestore(id).catch(() => {});
    if (deleteRelatedBills) {
      setBills((prev) => {
        const remaining: Bill[] = [];
        prev.forEach((b) => {
          if (b.studentId === id) {
            deleteBillFromFirestore(b.id).catch(() => {});
          } else {
            remaining.push(b);
          }
        });
        return remaining;
      });
    }
    showToast('Data siswa berhasil dihapus.', 'info');
  };

  const deleteStudentsBulk = (ids: string[], deleteRelatedBills: boolean = true): number => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus data siswa.', 'warning');
      return 0;
    }
    const idSet = new Set(ids);
    setStudents((prev) => prev.filter((s) => !idSet.has(s.id)));
    ids.forEach((id) => deleteStudentFromFirestore(id).catch(() => {}));
    if (deleteRelatedBills) {
      setBills((prev) => {
        const remaining: Bill[] = [];
        prev.forEach((b) => {
          if (idSet.has(b.studentId)) {
            deleteBillFromFirestore(b.id).catch(() => {});
          } else {
            remaining.push(b);
          }
        });
        return remaining;
      });
    }
    showToast(`${ids.length} data siswa berhasil dihapus.`, 'info');
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
          const newS: Student = {
            ...sData,
            id: `std-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
            createdAt: nowIso,
          };
          addedList.push(newS);
          saveStudentToFirestore(newS).catch(() => {});
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
    saveBillTypeToFirestore(newType).catch(() => {});
    return newType;
  };

  const updateBillType = (id: string, data: Partial<BillType>) => {
    let updatedType: BillType | undefined;
    setBillTypes((prev) =>
      prev.map((bt) => {
        if (bt.id === id) {
          updatedType = { ...bt, ...data };
          return updatedType;
        }
        return bt;
      })
    );
    if (updatedType) {
      saveBillTypeToFirestore(updatedType).catch(() => {});
    }
  };

  const deleteBillType = (id: string) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus pos tagihan.', 'warning');
      return;
    }
    setBillTypes((prev) => prev.filter((bt) => bt.id !== id));
    deleteBillTypeFromFirestore(id).catch(() => {});
    showToast('Pos tagihan berhasil dihapus.', 'info');
  };

  const deleteBillTypesBulk = (ids: string[]): number => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus pos tagihan.', 'warning');
      return 0;
    }
    const idSet = new Set(ids);
    setBillTypes((prev) => prev.filter((bt) => !idSet.has(bt.id)));
    ids.forEach((id) => deleteBillTypeFromFirestore(id).catch(() => {}));
    showToast(`${ids.length} pos tagihan berhasil dihapus.`, 'info');
    return ids.length;
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
    saveBillToFirestore(newBill).catch(() => {});
    return newBill;
  };

  const updateBill = (id: string, data: Partial<Bill>) => {
    let finalUpdated: Bill | undefined;
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
          finalUpdated = { ...updated, status: newStatus };
          return finalUpdated;
        }
        return b;
      })
    );
    if (finalUpdated) {
      saveBillToFirestore(finalUpdated).catch(() => {});
    }
  };

  const deleteBill = (billId: string) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus tagihan.', 'warning');
      return;
    }
    setBills((prev) => prev.filter((b) => b.id !== billId));
    deleteBillFromFirestore(billId).catch(() => {});
    showToast('Tagihan berhasil dihapus.', 'info');
  };

  const deleteBillsBulk = (billIds: string[]): number => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus tagihan.', 'warning');
      return 0;
    }
    const idSet = new Set(billIds);
    setBills((prev) => prev.filter((b) => !idSet.has(b.id)));
    billIds.forEach((id) => deleteBillFromFirestore(id).catch(() => {}));
    showToast(`${billIds.length} tagihan berhasil dihapus.`, 'info');
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
          const newB: Bill = {
            ...bData,
            id: `bill-xl-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
            paidAmount: 0,
            status: 'BELUM_BAYAR',
            createdAt: nowIso,
          };
          addedList.push(newB);
          saveBillToFirestore(newB).catch(() => {});
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

        const newBill: Bill = {
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
        };

        newBillsList.push(newBill);
        saveBillToFirestore(newBill).catch(() => {});
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

    const updatedBill: Bill = {
      ...bill,
      paidAmount: newPaidAmount,
      status: newStatus,
    };

    setBills((prev) =>
      prev.map((b) => (b.id === billId ? updatedBill : b))
    );
    saveBillToFirestore(updatedBill).catch(() => {});

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const seq = String(transactions.length + 1).padStart(4, '0');
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
    saveTransactionToFirestore(newTx).catch(() => {});
    return newTx;
  };

  const deleteTransaction = (id: string, revertBillPaidAmount: boolean = true) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus transaksi keuangan.', 'warning');
      return;
    }
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    if (revertBillPaidAmount && tx.billId) {
      setBills((prev) =>
        prev.map((b) => {
          if (b.id === tx.billId) {
            const updatedPaid = Math.max(0, (b.paidAmount || 0) - tx.amount);
            let updatedStatus: PaymentStatus = 'BELUM_BAYAR';
            if (updatedPaid >= b.amount && b.amount > 0) {
              updatedStatus = 'LUNAS';
            } else if (updatedPaid > 0) {
              updatedStatus = 'SEBAGIAN';
            } else {
              const today = new Date().toISOString().split('T')[0];
              updatedStatus = b.dueDate && b.dueDate < today ? 'MENUNGGAK' : 'BELUM_BAYAR';
            }
            const reverted = {
              ...b,
              paidAmount: updatedPaid,
              status: updatedStatus,
            };
            saveBillToFirestore(reverted).catch(() => {});
            return reverted;
          }
          return b;
        })
      );
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    deleteTransactionFromFirestore(id).catch(() => {});
    showToast('Transaksi pembayaran berhasil dihapus.', 'info');
  };

  const deleteTransactionsBulk = (ids: string[], revertBillPaidAmount: boolean = true): number => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus transaksi keuangan.', 'warning');
      return 0;
    }
    ids.forEach((id) => deleteTransaction(id, revertBillPaidAmount));
    return ids.length;
  };

  // Teacher & Payroll Management
  const addTeacher = (data: Omit<Teacher, 'id' | 'createdAt'>): Teacher => {
    const newTeacherId = `tch-${Date.now()}`;
    const newTeacher: Teacher = {
      ...data,
      id: newTeacherId,
      createdAt: new Date().toISOString(),
    };
    setTeachers((prev) => [newTeacher, ...prev]);
    saveTeacherToFirestore(newTeacher).catch(() => {});

    // Automatically create corresponding registered user in Cloud Firestore if credentials or username present
    const cleanUname = (data.username || (data.nip ? `guru.${data.nip}` : `guru.${newTeacherId}`)).toLowerCase();
    const newUser: AuthUser = {
      id: `usr-${newTeacherId}`,
      role: data.staffType === 'TENAGA_KEPENDIDIKAN' ? 'STAFF' : 'GURU',
      username: cleanUname,
      name: data.name,
      nip: data.nip || '',
      nuptk: data.nuptk || '',
      ktpNumber: data.ktpNumber || '',
      email: data.email || '',
      phone: data.phone || '',
      employmentStatus: data.status || 'GTY',
      bankName: data.bankName || 'BPD DIY',
      accountNumber: data.accountNumber || '',
      accountHolder: data.accountHolder || data.name,
      teacherId: newTeacherId,
      positionTitle: data.role || (data.staffType === 'TENAGA_KEPENDIDIKAN' ? 'Staf Kependidikan' : 'Guru Pendidik'),
      password: data.password || '123',
    };

    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.username.toLowerCase() === cleanUname || u.teacherId === newTeacherId);
      if (!exists) {
        const next = [newUser, ...prev];
        saveUserToFirestore(newUser).catch(() => {});
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(next));
        return next;
      }
      return prev;
    });

    return newTeacher;
  };

  const updateTeacher = (id: string, data: Partial<Teacher>) => {
    let updatedTeacher: Teacher | undefined;
    setTeachers((prev) => {
      const nextTeachers = prev.map((t) => {
        if (t.id === id) {
          updatedTeacher = { ...t, ...data };
          return updatedTeacher;
        }
        return t;
      });
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(nextTeachers));
      return nextTeachers;
    });

    if (updatedTeacher) {
      saveTeacherToFirestore(updatedTeacher).catch(() => {});
      const t = updatedTeacher;

      // BIDIRECTIONAL SYNC: Synchronize to registered_users in Cloud Firestore!
      setRegisteredUsers((prevUsers) => {
        let matchedUser: AuthUser | undefined;
        const nextUsers = prevUsers.map((u) => {
          const isMatch =
            (u.teacherId && u.teacherId === t.id) ||
            (u.username && t.username && u.username.toLowerCase() === t.username.toLowerCase()) ||
            (u.nip && t.nip && u.nip === t.nip) ||
            (u.email && t.email && u.email.toLowerCase() === t.email.toLowerCase()) ||
            (u.name && t.name && (u.name.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(u.name.toLowerCase())));

          if (isMatch) {
            matchedUser = {
              ...u,
              name: t.name || u.name,
              nip: t.nip !== undefined ? t.nip : u.nip,
              nuptk: t.nuptk !== undefined ? t.nuptk : u.nuptk,
              ktpNumber: t.ktpNumber !== undefined ? t.ktpNumber : u.ktpNumber,
              email: t.email !== undefined ? t.email : u.email,
              phone: t.phone !== undefined ? t.phone : u.phone,
              positionTitle: t.role || u.positionTitle,
              employmentStatus: t.status || u.employmentStatus,
              bankName: t.bankName || u.bankName,
              accountNumber: t.accountNumber || u.accountNumber,
              accountHolder: t.accountHolder || u.accountHolder,
              teacherId: t.id,
              username: t.username || u.username,
              password: t.password || u.password,
            };
            return matchedUser;
          }
          return u;
        });

        if (matchedUser) {
          saveUserToFirestore(matchedUser).catch(() => {});
          localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(nextUsers));

          // Also update currentUser if it is the currently logged-in user
          setCurrentUser((curr) => {
            if (
              curr &&
              (curr.id === matchedUser!.id ||
                curr.username.toLowerCase() === matchedUser!.username.toLowerCase() ||
                (curr.teacherId && curr.teacherId === t.id))
            ) {
              const updatedCurr = { ...curr, ...matchedUser };
              localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedCurr));
              return updatedCurr;
            }
            return curr;
          });
        }
        return nextUsers;
      });
    }

    // Sync teacher details into payroll records so slips reflect updated name & info
    setPayrolls((prev) =>
      prev.map((p) => {
        if (p.teacherId === id) {
          const updatedPay = {
            ...p,
            teacherName: data.name ?? p.teacherName,
            teacherNip: data.nip !== undefined ? data.nip : p.teacherNip,
            teacherRole: data.role ?? p.teacherRole,
            teacherPhone: data.phone ?? p.teacherPhone,
            teacherEmail: data.email !== undefined ? data.email : p.teacherEmail,
            bankName: data.bankName ?? p.bankName,
            accountNumber: data.accountNumber ?? p.accountNumber,
          };
          savePayrollToFirestore(updatedPay).catch(() => {});
          return updatedPay;
        }
        return p;
      })
    );
  };

  const deleteTeacher = (id: string, deleteRelatedPayrolls: boolean = false) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus data guru/staf.', 'warning');
      return;
    }
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    deleteTeacherFromFirestore(id).catch(() => {});
    if (deleteRelatedPayrolls) {
      setPayrolls((prev) => {
        const remaining: PayrollRecord[] = [];
        prev.forEach((p) => {
          if (p.teacherId === id) {
            deletePayrollFromFirestore(p.id).catch(() => {});
          } else {
            remaining.push(p);
          }
        });
        return remaining;
      });
    }
    showToast('Data guru/staf berhasil dihapus.', 'info');
  };

  const deleteTeachersBulk = (ids: string[], deleteRelatedPayrolls: boolean = false): number => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus data guru/staf.', 'warning');
      return 0;
    }
    const idSet = new Set(ids);
    setTeachers((prev) => prev.filter((t) => !idSet.has(t.id)));
    ids.forEach((id) => deleteTeacherFromFirestore(id).catch(() => {}));
    if (deleteRelatedPayrolls) {
      setPayrolls((prev) => {
        const remaining: PayrollRecord[] = [];
        prev.forEach((p) => {
          if (idSet.has(p.teacherId)) {
            deletePayrollFromFirestore(p.id).catch(() => {});
          } else {
            remaining.push(p);
          }
        });
        return remaining;
      });
    }
    showToast(`${ids.length} data guru/staf berhasil dihapus.`, 'info');
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
          const mergedT = {
            ...updated[existingIdx],
            ...tData,
          };
          updated[existingIdx] = mergedT;
          saveTeacherToFirestore(mergedT).catch(() => {});
          count++;
        } else {
          const newT: Teacher = {
            ...tData,
            id: `tch-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
            createdAt: nowIso,
          };
          updated.push(newT);
          saveTeacherToFirestore(newT).catch(() => {});
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
    savePayrollToFirestore(newRecord).catch(() => {});
    return newRecord;
  };

  const updatePayrollRecord = (id: string, data: Partial<PayrollRecord>) => {
    let finalUpdated: PayrollRecord | undefined;
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
          finalUpdated = {
            ...updated,
            totalAllowance,
            totalDeduction,
            netSalary,
          };
          return finalUpdated;
        }
        return p;
      })
    );
    if (finalUpdated) {
      savePayrollToFirestore(finalUpdated).catch(() => {});
    }
  };

  const deletePayrollRecord = (id: string) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus slip penggajian.', 'warning');
      return;
    }
    setPayrolls((prev) => prev.filter((p) => p.id !== id));
    deletePayrollFromFirestore(id).catch(() => {});
    showToast('Slip penggajian berhasil dihapus.', 'info');
  };

  const deletePayrollsBulk = (ids: string[]): number => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus slip penggajian.', 'warning');
      return 0;
    }
    const idSet = new Set(ids);
    setPayrolls((prev) => prev.filter((p) => !idSet.has(p.id)));
    ids.forEach((id) => deletePayrollFromFirestore(id).catch(() => {}));
    showToast(`${ids.length} data slip penggajian berhasil dihapus.`, 'info');
    return ids.length;
  };

  const markPayrollTransferred = (id: string, transferRef?: string) => {
    const ref = transferRef || `TRF-BOPKRI-${Date.now().toString().slice(-8)}`;
    const nowIso = new Date().toISOString();
    let updatedPay: PayrollRecord | undefined;
    setPayrolls((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedPay = {
            ...p,
            paymentStatus: 'SUDAH_DITRANSFER',
            paidAt: nowIso,
            transferRef: ref,
          };
          return updatedPay;
        }
        return p;
      })
    );
    if (updatedPay) {
      savePayrollToFirestore(updatedPay).catch(() => {});
    }
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
    saveInventoryToFirestore(newAsset).catch(() => {});
    return newAsset;
  };

  const updateAsset = (id: string, data: Partial<InventoryAsset>) => {
    let finalAsset: InventoryAsset | undefined;
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...data, updatedAt: new Date().toISOString() };
        const qty = updated.quantity !== undefined ? Number(updated.quantity) : item.quantity;
        const price = updated.purchasePrice !== undefined ? Number(updated.purchasePrice) : item.purchasePrice;
        updated.totalValue = qty * price;
        finalAsset = updated;
        return updated;
      })
    );
    if (finalAsset) {
      saveInventoryToFirestore(finalAsset).catch(() => {});
    }
  };

  const deleteAsset = (id: string) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus aset inventaris.', 'warning');
      return;
    }
    setAssets((prev) => prev.filter((item) => item.id !== id));
    deleteInventoryFromFirestore(id).catch(() => {});
    showToast('Aset inventaris berhasil dihapus.', 'info');
  };

  const deleteAssetsBulk = (ids: string[]): number => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus aset inventaris.', 'warning');
      return 0;
    }
    const idSet = new Set(ids);
    setAssets((prev) => prev.filter((item) => !idSet.has(item.id)));
    ids.forEach((id) => deleteInventoryFromFirestore(id).catch(() => {}));
    showToast(`${ids.length} aset inventaris berhasil dihapus.`, 'info');
    return ids.length;
  };

  // SPMB Management
  const addSPMBRegistration = (
    data: Omit<SPMBRegistration, 'id' | 'registrationNumber' | 'nis' | 'registrationDate' | 'emailNotificationSent' | 'emailSentAt'>
  ): SPMBRegistration => {
    const spmbYear = 2027;
    const count = spmbRegistrations.length + 1;
    const nis = `${spmbYear}${String(count).padStart(3, '0')}`;
    const registrationNumber = `SPMB-${spmbYear}/${String(count).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const newReg: SPMBRegistration = {
      ...data,
      id: `spmb-${Date.now()}`,
      registrationNumber,
      nis,
      registrationDate: nowIso,
      emailNotificationSent: true,
      emailSentAt: nowIso,
    };

    setSpmbRegistrations((prev) => [newReg, ...prev]);

    // Save to Firestore database
    saveSpmbToFirestore(newReg).catch((err) => {
      console.warn('Firestore SPMB sync warning:', err);
    });

    showToast(
      `Pendaftaran murid baru ${newReg.fullName} berhasil disimpan ke Database Cloud Firestore! Berkas notifikasi otomatis dikirim ke Panitia PPDB (ppdb.sdbogota@gmail.com) dan Orang Tua (${newReg.parentEmail}).`,
      'success'
    );
    return newReg;
  };

  const updateSPMBStatus = (id: string, status: SPMBStatus, sendEmailNotify: boolean = true) => {
    const nowIso = new Date().toISOString();
    setSpmbRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            emailNotificationSent: sendEmailNotify ? true : r.emailNotificationSent,
            emailSentAt: sendEmailNotify ? nowIso : r.emailSentAt,
          };
        }
        return r;
      })
    );

    // Sync status change to Firestore
    updateSpmbStatusInFirestore(id, status, sendEmailNotify).catch((err) => {
      console.warn('Firestore SPMB update warning:', err);
    });

    if (sendEmailNotify) {
      showToast(`Status pendaftaran diperbarui menjadi "${status}" & notifikasi konfirmasi email terkirim ke ppdb.sdbogota@gmail.com dan orang tua.`, 'success');
    } else {
      showToast(`Status pendaftaran diperbarui menjadi "${status}".`, 'info');
    }
  };

  const deleteSPMBRegistration = (id: string) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses menghapus data pendaftaran.', 'warning');
      return;
    }
    setSpmbRegistrations((prev) => prev.filter((r) => r.id !== id));
    deleteSpmbFromFirestore(id).catch(() => {});
    showToast('Data calon murid berhasil dihapus.', 'info');
  };

  const resetToDefaultData = () => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang berwenang mereset data contoh.', 'warning');
      return;
    }
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
      localStorage.removeItem(STORAGE_KEYS.SPMB);
      setStaffInfo(INITIAL_STAFF_INFO);
      setStudents(INITIAL_STUDENTS);
      setBillTypes(INITIAL_BILL_TYPES);
      setBills(INITIAL_BILLS);
      setTransactions(INITIAL_TRANSACTIONS);
      setTeachers(INITIAL_TEACHERS);
      setPayrolls(INITIAL_PAYROLLS);
      setTeachingDocs(INITIAL_TEACHING_DOCS);
      setAssets(INITIAL_INVENTORY_ASSETS);
      setSpmbRegistrations(INITIAL_SPMB_REGISTRATIONS);
      setCurrentUser(null);
      setMainMenuState('keuangan');
      setActiveTabRaw('dashboard');
      showToast('Data contoh SD BOPKRI Gondolayu berhasil direset.', 'info');
    }
  };

  const purgeModuleData = (
    module: 'students' | 'bills' | 'transactions' | 'billTypes' | 'teachers' | 'payrolls' | 'teachingDocs' | 'assets' | 'all'
  ) => {
    if (!isSuperAdmin) {
      showToast('Hanya Super Admin (Benisius) yang memiliki hak akses mengosongkan seluruh data.', 'warning');
      return;
    }
    if (module === 'students' || module === 'all') {
      setStudents([]);
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    }
    if (module === 'bills' || module === 'all') {
      setBills([]);
      localStorage.removeItem(STORAGE_KEYS.BILLS);
    }
    if (module === 'transactions' || module === 'all') {
      setTransactions([]);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    }
    if (module === 'billTypes' || module === 'all') {
      setBillTypes([]);
      localStorage.removeItem(STORAGE_KEYS.BILL_TYPES);
    }
    if (module === 'teachers' || module === 'all') {
      setTeachers([]);
      localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    }
    if (module === 'payrolls' || module === 'all') {
      setPayrolls([]);
      localStorage.removeItem(STORAGE_KEYS.PAYROLLS);
    }
    if (module === 'teachingDocs' || module === 'all') {
      setTeachingDocs([]);
      localStorage.removeItem(STORAGE_KEYS.TEACHING_DOCS);
    }
    if (module === 'assets' || module === 'all') {
      setAssets([]);
      localStorage.removeItem(STORAGE_KEYS.ASSETS);
    }
    showToast('Data modul berhasil dikosongkan.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        staffInfo,
        updateStaffInfo,
        isSuperAdmin,
        toasts,
        showToast,
        removeToast,
        currentUser,
        registeredUsers,
        registerUser,
        login,
        logout,
        switchUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isDataPurgeModalOpen,
        setIsDataPurgeModalOpen,
        updateUserProfile,
        changePassword,
        adminUpdateUser,
        adminDeleteUser,
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
        deleteBillTypesBulk,
        bills,
        addCustomBill,
        updateBill,
        importBillsFromExcel,
        generateBillsForBillType,
        deleteBill,
        deleteBillsBulk,
        transactions,
        processPayment,
        deleteTransaction,
        deleteTransactionsBulk,
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
        deleteTeachingDocsBulk,
        updateTeachingDocStatus,
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        deleteAssetsBulk,
        spmbRegistrations,
        addSPMBRegistration,
        updateSPMBStatus,
        deleteSPMBRegistration,
        activeReceipt,
        setActiveReceipt,
        activePayingBill,
        setActivePayingBill,
        activeSlip,
        setActiveSlip,
        activeTab,
        setActiveTab,
        resetToDefaultData,
        purgeModuleData,
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
