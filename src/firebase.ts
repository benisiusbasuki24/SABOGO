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
  writeBatch,
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

// Helper to recursively remove undefined properties because Firestore rejects undefined values
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        cleaned[key] = cleanFirestoreData(val);
      } else {
        cleaned[key] = val;
      }
    }
  }
  return cleaned;
}

// Generic helper to save or merge a document in Firestore
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, item.id);
    const sanitized = cleanFirestoreData({
      ...item,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, sanitized, { merge: true });
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
    // 1. Direct delete by ID
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch {}

    // 2. Query delete if id is stored inside document field or collection has alternate document ids
    const querySnapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    let count = 0;
    for (const docSnap of querySnapshot.docs) {
      const d = docSnap.data();
      if (docSnap.id === id || d.id === id) {
        batch.delete(docSnap.ref);
        count++;
      }
    }
    if (count > 0) {
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.error(`Failed to delete from ${collectionName} [${id}]:`, err);
    return false;
  }
}

// Bulk purge helper for Cloud Firestore
export async function purgeCollectionInFirestore(
  collectionName: string,
  excludeIds?: string[]
): Promise<number> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const excludeSet = new Set(excludeIds || []);
    const docsToDelete = querySnapshot.docs.filter((d) => !excludeSet.has(d.id));

    if (docsToDelete.length === 0) return 0;

    let deleted = 0;
    // Process in batches of 400
    for (let i = 0; i < docsToDelete.length; i += 400) {
      const chunk = docsToDelete.slice(i, i + 400);
      const batch = writeBatch(db);
      for (const d of chunk) {
        batch.delete(d.ref);
        deleted++;
      }
      await batch.commit();
    }
    return deleted;
  } catch (err) {
    console.error(`Failed to purge ${collectionName} in Firestore:`, err);
    return 0;
  }
}

// ============================================================================
// CLOUD TOMBSTONES & PURGED MODULES FOR MULTI-DEVICE & INCOGNITO SYNC
// ============================================================================
export type TombstoneModule =
  | 'users'
  | 'students'
  | 'bills'
  | 'transactions'
  | 'teachers'
  | 'payrolls'
  | 'inventory_assets'
  | 'teaching_docs'
  | 'spmb'
  | 'bill_types';

// Persistent tombstone record in Firestore so deleted items NEVER re-seed or re-appear across ANY device
export async function recordCloudTombstone(
  module: string,
  ...identifiers: (string | undefined | null)[]
): Promise<void> {
  try {
    const validIds = identifiers
      .filter((x): x is string => Boolean(x && typeof x === 'string' && x.trim().length > 0))
      .map((x) => x.trim().toLowerCase());
    if (validIds.length === 0) return;

    const docRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, 'tombstones');
    const snap = await getDocFromServer(docRef).catch(() => null);
    const data = (snap && snap.exists() ? snap.data() : {}) as Record<string, any>;
    const currentList: string[] = Array.isArray(data[module]) ? data[module] : [];
    const merged = Array.from(new Set([...currentList, ...validIds]));

    await setDoc(
      docRef,
      {
        [module]: merged,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`recordCloudTombstone error [${module}]:`, err);
  }
}

// Backward-compatible alias
export const recordDeletedItemInFirestore = (
  type: 'users' | 'students',
  identifier: string,
  secondaryIdentifier?: string
) => recordCloudTombstone(type, identifier, secondaryIdentifier);

export async function fetchCloudTombstones(): Promise<Record<string, Set<string>>> {
  try {
    const snap = await getDocFromServer(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'tombstones')).catch(() => null);
    const result: Record<string, Set<string>> = {};
    if (snap && snap.exists()) {
      const data = snap.data();
      for (const [key, val] of Object.entries(data)) {
        if (Array.isArray(val)) {
          result[key] = new Set(val.map((x) => String(x).toLowerCase().trim()));
        }
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function subscribeCloudTombstones(
  cb: (tombstones: Record<string, Set<string>>) => void
): () => void {
  try {
    return onSnapshot(
      doc(db, COLLECTIONS.SYSTEM_CONFIG, 'tombstones'),
      (snap) => {
        const result: Record<string, Set<string>> = {};
        if (snap.exists()) {
          const data = snap.data() || {};
          for (const [key, val] of Object.entries(data)) {
            if (Array.isArray(val)) {
              result[key] = new Set(val.map((x) => String(x).toLowerCase().trim()));
            }
          }
        }
        cb(result);
      },
      (err) => {
        console.warn('Real-time listener for cloud tombstones warning:', err);
      }
    );
  } catch (err) {
    console.warn('Could not attach cloud tombstones listener:', err);
    return () => {};
  }
}

export async function clearCloudTombstones(): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'tombstones'), { updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('clearCloudTombstones error:', err);
  }
}

// Module purge state in Cloud Firestore (students, bills, transactions, etc.)
export async function savePurgedModuleToFirestore(
  module: string,
  isPurged: boolean = true
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, 'purged_modules');
    await setDoc(
      docRef,
      {
        [module]: isPurged,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`savePurgedModuleToFirestore error [${module}]:`, err);
  }
}

export function subscribePurgedModules(
  cb: (purged: Record<string, boolean>) => void
): () => void {
  try {
    return onSnapshot(
      doc(db, COLLECTIONS.SYSTEM_CONFIG, 'purged_modules'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() || {};
          const result: Record<string, boolean> = {};
          for (const [key, val] of Object.entries(data)) {
            if (typeof val === 'boolean') {
              result[key] = val;
            }
          }
          cb(result);
        } else {
          cb({});
        }
      },
      (err) => console.warn('purged_modules listener warning:', err)
    );
  } catch {
    return () => {};
  }
}

export async function isModulePurgedInFirestore(module: string): Promise<boolean> {
  try {
    const snap = await getDocFromServer(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'purged_modules')).catch(() => null);
    if (snap && snap.exists()) {
      const data = snap.data();
      return Boolean(data[module] || data['all']);
    }
    return false;
  } catch {
    return false;
  }
}

export async function clearPurgedModulesInFirestore(): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'purged_modules'), { updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('clearPurgedModulesInFirestore error:', err);
  }
}

export async function fetchDeletedItemsFromFirestore(
  type: 'users' | 'students'
): Promise<Set<string>> {
  const allTombstones = await fetchCloudTombstones();
  return allTombstones[type] || new Set();
}

// ============================================================================
// ENTITY-SPECIFIC HELPERS (STUDENTS)
// ============================================================================
export const saveStudentToFirestore = (student: Student) => saveDocument(COLLECTIONS.STUDENTS, student);

export async function deleteStudentFromFirestore(id: string, nis?: string, name?: string): Promise<boolean> {
  try {
    // 1. Delete by direct ID
    try {
      const docRef = doc(db, COLLECTIONS.STUDENTS, id);
      await deleteDoc(docRef);
    } catch {}

    // 2. Also search all docs in students collection for matching id, nis, or normalized name
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    const batch = writeBatch(db);
    let count = 0;
    const cleanNis = (nis || '').trim();
    const cleanName = (name || '').trim().toLowerCase();

    for (const docSnap of querySnapshot.docs) {
      const s = docSnap.data() as Student;
      const matchId = docSnap.id === id || s.id === id;
      const matchNis = Boolean(cleanNis && s.nis && s.nis.trim() === cleanNis);
      const matchName = Boolean(cleanName && s.name && s.name.trim().toLowerCase() === cleanName);
      if (matchId || matchNis || matchName) {
        batch.delete(docSnap.ref);
        count++;
      }
    }
    if (count > 0) {
      await batch.commit();
    }

    // 3. Record in Cloud Tombstones so NO device or incognito browser can resurrect this student
    await recordCloudTombstone('students', id, nis, name);
    return true;
  } catch (err) {
    console.error(`Failed to delete student from Firestore [${id}]:`, err);
    return false;
  }
}

export const subscribeStudentsFromFirestore = (cb: (s: Student[]) => void) => subscribeCollection<Student>(COLLECTIONS.STUDENTS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (BILLS)
// ============================================================================
// ============================================================================
// ENTITY-SPECIFIC HELPERS (BILLS)
// ============================================================================
export const saveBillToFirestore = (bill: Bill) => saveDocument(COLLECTIONS.BILLS, bill);

export async function deleteBillFromFirestore(id: string): Promise<boolean> {
  const success = await deleteDocument(COLLECTIONS.BILLS, id);
  await recordCloudTombstone('bills', id);
  return success;
}

export const subscribeBillsFromFirestore = (cb: (b: Bill[]) => void) => subscribeCollection<Bill>(COLLECTIONS.BILLS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (TRANSACTIONS)
// ============================================================================
export const saveTransactionToFirestore = (tx: PaymentTransaction) => saveDocument(COLLECTIONS.TRANSACTIONS, tx);

export async function deleteTransactionFromFirestore(id: string): Promise<boolean> {
  const success = await deleteDocument(COLLECTIONS.TRANSACTIONS, id);
  await recordCloudTombstone('transactions', id);
  return success;
}

export const subscribeTransactionsFromFirestore = (cb: (tx: PaymentTransaction[]) => void) => subscribeCollection<PaymentTransaction>(COLLECTIONS.TRANSACTIONS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (PAYROLLS)
// ============================================================================
export const savePayrollToFirestore = (payroll: PayrollRecord) => saveDocument(COLLECTIONS.PAYROLLS, payroll);

export async function deletePayrollFromFirestore(id: string): Promise<boolean> {
  const success = await deleteDocument(COLLECTIONS.PAYROLLS, id);
  await recordCloudTombstone('payrolls', id);
  return success;
}

export const subscribePayrollsFromFirestore = (cb: (p: PayrollRecord[]) => void) => subscribeCollection<PayrollRecord>(COLLECTIONS.PAYROLLS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (INVENTORY)
// ============================================================================
export const saveInventoryToFirestore = (asset: InventoryAsset) => saveDocument(COLLECTIONS.INVENTORY, asset);

export async function deleteInventoryFromFirestore(id: string): Promise<boolean> {
  const success = await deleteDocument(COLLECTIONS.INVENTORY, id);
  await recordCloudTombstone('inventory_assets', id);
  return success;
}

export const subscribeInventoryFromFirestore = (cb: (i: InventoryAsset[]) => void) => subscribeCollection<InventoryAsset>(COLLECTIONS.INVENTORY, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (TEACHING ADMINISTRATION DOCS)
// ============================================================================
export const saveTeachingDocToFirestore = (docItem: TeachingAdminDoc) => saveDocument(COLLECTIONS.TEACHING_DOCS, docItem);

export async function deleteTeachingDocFromFirestore(id: string): Promise<boolean> {
  const success = await deleteDocument(COLLECTIONS.TEACHING_DOCS, id);
  await recordCloudTombstone('teaching_docs', id);
  return success;
}

export const subscribeTeachingDocsFromFirestore = (cb: (d: TeachingAdminDoc[]) => void) => subscribeCollection<TeachingAdminDoc>(COLLECTIONS.TEACHING_DOCS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (SPMB REGISTRATIONS)
// ============================================================================
export const saveSpmbToFirestore = (spmb: SPMBRegistration) => saveDocument(COLLECTIONS.SPMB, spmb);

export async function deleteSpmbFromFirestore(id: string): Promise<boolean> {
  const success = await deleteDocument(COLLECTIONS.SPMB, id);
  await recordCloudTombstone('spmb', id);
  return success;
}

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

export async function deleteTeacherFromFirestore(id: string, nip?: string, username?: string): Promise<boolean> {
  try {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TEACHERS, id));
    } catch {}

    const querySnapshot = await getDocs(collection(db, COLLECTIONS.TEACHERS));
    const batch = writeBatch(db);
    let count = 0;
    const cleanNip = (nip || '').trim();
    const cleanUname = (username || '').toLowerCase().trim();

    for (const docSnap of querySnapshot.docs) {
      const t = docSnap.data() as Teacher;
      const matchId = docSnap.id === id || t.id === id;
      const matchNip = cleanNip && t.nip && t.nip.trim() === cleanNip;
      const matchUname = cleanUname && t.username && t.username.toLowerCase().trim() === cleanUname;
      if (matchId || matchNip || matchUname) {
        batch.delete(docSnap.ref);
        count++;
      }
    }
    if (count > 0) {
      await batch.commit();
    }

    await recordCloudTombstone('teachers', id, nip, username);
    return true;
  } catch (err) {
    console.error(`Failed to delete teacher from Firestore [${id}]:`, err);
    return false;
  }
}

export const subscribeTeachersFromFirestore = (cb: (t: Teacher[]) => void) => subscribeCollection<Teacher>(COLLECTIONS.TEACHERS, cb);

// ============================================================================
// ENTITY-SPECIFIC HELPERS (BILL TYPES)
// ============================================================================
export const saveBillTypeToFirestore = (bt: BillType) => saveDocument(COLLECTIONS.BILL_TYPES, bt);

export async function deleteBillTypeFromFirestore(id: string): Promise<boolean> {
  const success = await deleteDocument(COLLECTIONS.BILL_TYPES, id);
  await recordCloudTombstone('bill_types', id);
  return success;
}

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

export async function deleteUserFromFirestore(
  id: string,
  username?: string,
  email?: string,
  name?: string
): Promise<boolean> {
  try {
    // 1. Delete document directly
    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      await deleteDoc(docRef);
    } catch {}

    // 2. Also search all docs in users collection for matching id, username, or email
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const batch = writeBatch(db);
    let count = 0;
    const cleanUname = (username || '').toLowerCase().trim();
    const cleanEmail = (email || '').toLowerCase().trim();

    for (const docSnap of querySnapshot.docs) {
      const u = docSnap.data() as AuthUser;
      const matchId = docSnap.id === id || u.id === id;
      const matchUname = Boolean(cleanUname && u.username && u.username.toLowerCase().trim() === cleanUname);
      const matchEmail = Boolean(cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail);
      if (matchId || matchUname || matchEmail) {
        batch.delete(docSnap.ref);
        count++;
      }
    }
    if (count > 0) {
      await batch.commit();
    }

    // 3. Record in Cloud Tombstones so it is NEVER resurrected on any device
    await recordCloudTombstone('users', id, username, email, name);
    return true;
  } catch (err) {
    console.error(`Failed to delete user from Firestore [${id}]:`, err);
    return false;
  }
}

export function subscribeUsersFromFirestore(cb: (u: AuthUser[]) => void): () => void {
  return subscribeCollection<AuthUser>(COLLECTIONS.USERS, cb);
}

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
        (u.uniqueCode && u.uniqueCode.toLowerCase() === clean) ||
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
    // If module was purged by Super Admin, do not re-seed!
    if (await isModulePurgedInFirestore('users')) {
      return;
    }

    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    // If users collection already has records, it is already seeded!
    if (querySnapshot.docs.length > 0) {
      return;
    }

    const tombstones = await fetchCloudTombstones();
    const deletedSet = tombstones.users || new Set<string>();

    for (const u of users) {
      const uLower = u.username.toLowerCase();
      const emailLower = (u.email || '').toLowerCase();
      // NEVER re-seed if this user has been deleted by Super Admin!
      if (
        deletedSet.has(u.id.toLowerCase()) ||
        deletedSet.has(uLower) ||
        (emailLower && deletedSet.has(emailLower))
      ) {
        continue;
      }
      await saveUserToFirestore(u);
    }
  } catch (err) {
    console.warn('Error seeding users to Firestore:', err);
  }
}

export async function seedInitialStudentsToFirestore(students: Student[]): Promise<number> {
  try {
    // If students were purged by Super Admin in Cloud Firestore, DO NOT auto re-seed!
    if (await isModulePurgedInFirestore('students')) {
      return 0;
    }

    const querySnapshot = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    // If students collection already has records, it is already seeded!
    if (querySnapshot.docs.length > 0) {
      return 0;
    }

    const tombstones = await fetchCloudTombstones();
    const deletedSet = tombstones.students || new Set<string>();

    let seeded = 0;
    for (const student of students) {
      const nisClean = (student.nis || '').trim().toLowerCase();
      const nameClean = (student.name || '').trim().toLowerCase();
      // NEVER seed if deleted!
      if (
        deletedSet.has(student.id.toLowerCase()) ||
        (nisClean && deletedSet.has(nisClean)) ||
        (nameClean && deletedSet.has(nameClean))
      ) {
        continue;
      }

      await saveDocument(COLLECTIONS.STUDENTS, student);
      seeded++;
    }
    return seeded;
  } catch (err) {
    console.error('Failed to seed initial students to Firestore:', err);
    return 0;
  }
}

export async function seedInitialTeachersToFirestore(teachers: Teacher[]): Promise<number> {
  try {
    if (await isModulePurgedInFirestore('teachers')) return 0;
    const snap = await getDocs(collection(db, COLLECTIONS.TEACHERS));
    if (snap.docs.length > 0) return 0;

    const tombstones = await fetchCloudTombstones();
    const deletedSet = tombstones.teachers || new Set<string>();

    let count = 0;
    for (const t of teachers) {
      const nipClean = (t.nip || '').trim().toLowerCase();
      if (deletedSet.has(t.id.toLowerCase()) || (nipClean && deletedSet.has(nipClean))) {
        continue;
      }
      await saveDocument(COLLECTIONS.TEACHERS, t);
      count++;
    }
    return count;
  } catch {
    return 0;
  }
}

export async function seedInitialBillTypesToFirestore(billTypes: BillType[]): Promise<number> {
  try {
    if (await isModulePurgedInFirestore('bill_types')) return 0;
    const snap = await getDocs(collection(db, COLLECTIONS.BILL_TYPES));
    if (snap.docs.length > 0) return 0;

    const tombstones = await fetchCloudTombstones();
    const deletedSet = tombstones.bill_types || new Set<string>();

    let count = 0;
    for (const bt of billTypes) {
      if (deletedSet.has(bt.id.toLowerCase())) continue;
      await saveDocument(COLLECTIONS.BILL_TYPES, bt);
      count++;
    }
    return count;
  } catch {
    return 0;
  }
}

export async function syncAllStudentsToFirestore(students: Student[]): Promise<number> {
  try {
    let saved = 0;
    for (const student of students) {
      await saveDocument(COLLECTIONS.STUDENTS, student);
      saved++;
    }
    return saved;
  } catch (err) {
    console.error('Failed to sync all students to Firestore:', err);
    return 0;
  }
}

