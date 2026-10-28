import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  updateDoc,
  getDocFromServer,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AuthUser,
  Bill,
  BillType,
  InventoryAsset,
  PaymentTransaction,
  PayrollRecord,
  SchoolStaffInfo,
  SPMBRegistration,
  Student,
  Teacher,
  TeachingAdminDoc,
} from './types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID from config
export const db: Firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Connection test on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_ping'));
    return true;
  } catch (error) {
    console.warn('Firestore connection check:', error);
    return false;
  }
}

// ============================================================================
// FIRESTORE COLLECTIONS CONSTANTS
// ============================================================================
export const COLLECTIONS = {
  USERS: 'registered_users',
  STUDENTS: 'students',
  BILLS: 'bills',
  TRANSACTIONS: 'transactions',
  PAYROLLS: 'payrolls',
  INVENTORY: 'inventory_assets',
  TEACHING_DOCS: 'teaching_docs',
  SPMB: 'spmb_registrations',
  TEACHERS: 'teachers',
  BILL_TYPES: 'bill_types',
  SYSTEM_CONFIG: 'system_config',
} as const;

// Generic helper to subscribe to any collection in real time
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, collectionName),
      (querySnapshot) => {
        const items: T[] = [];
        querySnapshot.forEach((docSnap) => {
          items.push(docSnap.data() as T);
        });
        onUpdate(items);
      },
      (err) => {
        console.warn(`Real-time listener for ${collectionName} warning:`, err);
      }
    );
  } catch (err) {
    console.warn(`Could not attach listener for ${collectionName}:`, err);
    return () => {};
  }
}

// Generic helper to save or merge a document in Firestore
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(
      docRef,
      {
        ...item,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error(`Failed to save to ${collectionName} [${item.id}]:`, err);
    return false;
  }
}

// Generic helper to delete a document in Firestore
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`Failed to delete from ${collectionName} [${id}]:`, err);
    return false;
  }
}

// ============================================================================
// ENTITY-SPECIFIC HELPERS (STUDENTS)
// ============================================================================
export const saveStudentToFirestore = (student: Student) => saveDocument(COLLECTIONS.STUDENTS, student);
export const deleteStudentFromFirestore = (id: string) => deleteDocument(COLLECTIONS.STUDENTS, id);
export const subscribeStudentsFromFirestore = (cb: (s: Student[]) => void) => subscribeCollection<Student>(COLLECTIONS.STUDENTS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (BILLS)
// ============================================================================
export const saveBillToFirestore = (bill: Bill) => saveDocument(COLLECTIONS.BILLS, bill);
export const deleteBillFromFirestore = (id: string) => deleteDocument(COLLECTIONS.BILLS, id);
export const subscribeBillsFromFirestore = (cb: (b: Bill[]) => void) => subscribeCollection<Bill>(COLLECTIONS.BILLS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (TRANSACTIONS)
// ============================================================================
export const saveTransactionToFirestore = (tx: PaymentTransaction) => saveDocument(COLLECTIONS.TRANSACTIONS, tx);
export const deleteTransactionFromFirestore = (id: string) => deleteDocument(COLLECTIONS.TRANSACTIONS, id);
export const subscribeTransactionsFromFirestore = (cb: (tx: PaymentTransaction[]) => void) => subscribeCollection<PaymentTransaction>(COLLECTIONS.TRANSACTIONS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (PAYROLLS)
// ============================================================================
export const savePayrollToFirestore = (payroll: PayrollRecord) => saveDocument(COLLECTIONS.PAYROLLS, payroll);
export const deletePayrollFromFirestore = (id: string) => deleteDocument(COLLECTIONS.PAYROLLS, id);
export const subscribePayrollsFromFirestore = (cb: (p: PayrollRecord[]) => void) => subscribeCollection<PayrollRecord>(COLLECTIONS.PAYROLLS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (INVENTORY)
// ============================================================================
export const saveInventoryToFirestore = (asset: InventoryAsset) => saveDocument(COLLECTIONS.INVENTORY, asset);
export const deleteInventoryFromFirestore = (id: string) => deleteDocument(COLLECTIONS.INVENTORY, id);
export const subscribeInventoryFromFirestore = (cb: (i: InventoryAsset[]) => void) => subscribeCollection<InventoryAsset>(COLLECTIONS.INVENTORY, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (TEACHING ADMINISTRATION DOCS)
// ============================================================================
export const saveTeachingDocToFirestore = (docItem: TeachingAdminDoc) => saveDocument(COLLECTIONS.TEACHING_DOCS, docItem);
export const deleteTeachingDocFromFirestore = (id: string) => deleteDocument(COLLECTIONS.TEACHING_DOCS, id);
export const subscribeTeachingDocsFromFirestore = (cb: (d: TeachingAdminDoc[]) => void) => subscribeCollection<TeachingAdminDoc>(COLLECTIONS.TEACHING_DOCS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (SPMB REGISTRATIONS)
// ============================================================================
export const saveSpmbToFirestore = (spmb: SPMBRegistration) => saveDocument(COLLECTIONS.SPMB, spmb);
export const deleteSpmbFromFirestore = (id: string) => deleteDocument(COLLECTIONS.SPMB, id);
export const subscribeSpmbFromFirestore = (cb: (items: SPMBRegistration[]) => void) => subscribeCollection<SPMBRegistration>(COLLECTIONS.SPMB, cb);

export async function updateSpmbStatusInFirestore(
  id: string,
  status: string,
  emailSent: boolean
): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.SPMB, id);
    await updateDoc(docRef, {
      status,
      emailNotificationSent: emailSent,
      emailSentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Failed to update SPMB status in Firestore:', err);
    return false;
  }
}

// ============================================================================
// ENTITY-SPECIFIC HELPERS (TEACHERS & STAFF)
// ============================================================================
export const saveTeacherToFirestore = (teacher: Teacher) => saveDocument(COLLECTIONS.TEACHERS, teacher);
export const deleteTeacherFromFirestore = (id: string) => deleteDocument(COLLECTIONS.TEACHERS, id);
export const subscribeTeachersFromFirestore = (cb: (t: Teacher[]) => void) => subscribeCollection<Teacher>(COLLECTIONS.TEACHERS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (BILL TYPES)
// ============================================================================
export const saveBillTypeToFirestore = (bt: BillType) => saveDocument(COLLECTIONS.BILL_TYPES, bt);
export const deleteBillTypeFromFirestore = (id: string) => deleteDocument(COLLECTIONS.BILL_TYPES, id);
export const subscribeBillTypesFromFirestore = (cb: (bt: BillType[]) => void) => subscribeCollection<BillType>(COLLECTIONS.BILL_TYPES, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (SCHOOL STAFF INFO)
// ============================================================================
export async function saveSchoolInfoToFirestore(info: SchoolStaffInfo): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, 'school_info');
    await setDoc(docRef, { ...info, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save school info to Firestore:', err);
    return false;
  }
}

export function subscribeSchoolInfoFromFirestore(cb: (info: SchoolStaffInfo) => void): () => void {
  try {
    return onSnapshot(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'school_info'), (snap) => {
      if (snap.exists()) {
        cb(snap.data() as SchoolStaffInfo);
      }
    });
  } catch (err) {
    console.warn('Could not attach school info listener:', err);
    return () => {};
  }
}

// ============================================================================
// ENTITY-SPECIFIC HELPERS (REGISTERED USERS & AUTH)
// ============================================================================
export const saveUserToFirestore = (user: AuthUser) => saveDocument(COLLECTIONS.USERS, user);
export const deleteUserFromFirestore = (id: string) => deleteDocument(COLLECTIONS.USERS, id);
export const subscribeUsersFromFirestore = (cb: (u: AuthUser[]) => void) => subscribeCollection<AuthUser>(COLLECTIONS.USERS, cb);

export async function fetchUsersFromFirestore(): Promise<AuthUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const users: AuthUser[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push(docSnap.data() as AuthUser);
    });
    return users;
  } catch (err) {
    console.error('Failed to fetch users from Firestore:', err);
    return [];
  }
}

export async function findUserInFirestore(identifier: string): Promise<AuthUser | null> {
  try {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return null;

    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    for (const docSnap of querySnapshot.docs) {
      const u = docSnap.data() as AuthUser;
      if (
        (u.username && u.username.toLowerCase() === clean) ||
        (u.email && u.email.toLowerCase() === clean) ||
        (u.nip && u.nip.toLowerCase() === clean)
      ) {
        return u;
      }
    }
    return null;
  } catch (err) {
    console.warn('findUserInFirestore error:', err);
    return null;
  }
}

export async function seedInitialUsersToFirestore(users: AuthUser[]): Promise<void> {
  try {
    const promises = users.map((u) => saveUserToFirestore(u));
    await Promise.all(promises);
  } catch (err) {
    console.warn('Error seeding users to Firestore:', err);
  }
}
