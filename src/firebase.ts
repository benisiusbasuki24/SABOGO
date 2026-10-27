import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AuthUser, SPMBRegistration } from './types';

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
    // If offline or permission check, log silently without breaking UI
    console.warn('Firestore connection check:', error);
    return false;
  }
}

// ============================================================================
// FIRESTORE SPMB DATABASE OPERATIONS
// ============================================================================
const SPMB_COLLECTION = 'spmb_registrations';
const USERS_COLLECTION = 'registered_users';

/**
 * Save / sync an SPMB registration to Firestore database
 */
export async function saveSpmbToFirestore(reg: SPMBRegistration): Promise<boolean> {
  try {
    const docRef = doc(db, SPMB_COLLECTION, reg.id);
    await setDoc(docRef, {
      ...reg,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save SPMB registration to Firestore:', err);
    return false;
  }
}

/**
 * Fetch all SPMB registrations from Firestore database
 */
export async function fetchSpmbFromFirestore(): Promise<SPMBRegistration[]> {
  try {
    const querySnapshot = await getDocs(collection(db, SPMB_COLLECTION));
    const items: SPMBRegistration[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push(docSnap.data() as SPMBRegistration);
    });
    return items;
  } catch (err) {
    console.error('Failed to fetch SPMB registrations from Firestore:', err);
    return [];
  }
}

/**
 * Update SPMB status in Firestore
 */
export async function updateSpmbStatusInFirestore(
  id: string,
  status: string,
  emailSent: boolean
): Promise<boolean> {
  try {
    const docRef = doc(db, SPMB_COLLECTION, id);
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
// FIRESTORE USERS DATABASE OPERATIONS
// ============================================================================
/**
 * Save user profile to Firestore
 */
export async function saveUserToFirestore(user: AuthUser): Promise<boolean> {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save user to Firestore:', err);
    return false;
  }
}

/**
 * Fetch registered users from Firestore
 */
export async function fetchUsersFromFirestore(): Promise<AuthUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
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
