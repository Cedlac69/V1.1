import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, sendPasswordResetEmail, signOut, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCi0VowtC9KdQN8roCuJTojgcAiT0JO11s",
  authDomain: "temptracker-cdce9.firebaseapp.com",
  projectId: "temptracker-cdce9",
  storageBucket: "temptracker-cdce9.appspot.com",
  messagingSenderId: "307040262368",
  appId: "1:307040262368:web:d77834775380c1318f9885",
  measurementId: "G-F72W5NPPQ4"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with default configuration
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configure persistence for authentication
setPersistence(auth, browserLocalPersistence)
  .catch(error => {
    console.error("Error setting auth persistence:", error);
  });

// Helper functions for user management
export const getCurrentUserEmail = (): string | null => {
  const user = auth.currentUser;
  return user ? user.email : null;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const resetUserPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

export const signOutUser = async (): Promise<void> => {
  return signOut(auth);
};

export const getServerTimestamp = () => {
  return serverTimestamp();
};