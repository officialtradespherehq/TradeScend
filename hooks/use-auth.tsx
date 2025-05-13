"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdToken,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User as FirestoreUser } from "@/types/index";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useMailNotification } from "./useMailNotification";

interface ExtendedUser extends FirestoreUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  register: (email: string, password: string, name: string) => Promise<{ isAdmin: boolean }>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  isAdmin: boolean;
  getRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { notifyRegistration } = useMailNotification();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, "Users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const firestoreUser = userDoc.data() as FirestoreUser;
            const extendedUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...firestoreUser,
            };
            
            setUser(extendedUser);
            setIsAdmin(firestoreUser.isAdmin);
            
            // Get the ID token and store it in cookies
            const idToken = await getIdToken(firebaseUser);
            
            // Set cookies for authentication
            Cookies.set('session', idToken, { expires: 5, secure: process.env.NODE_ENV === 'production' });
            Cookies.set('isAdmin', firestoreUser.isAdmin ? 'true' : 'false', { expires: 5, secure: process.env.NODE_ENV === 'production' });
            
            // If user is admin, set admin claim
            if (firestoreUser.isAdmin) {
              await fetch('/api/admin/claims', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: firebaseUser.uid }),
              });
            }
          } else {
            console.warn("No user document found for", firebaseUser.uid);
            setUser(null);
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get the ID token
      const idToken = await getIdToken(userCredential.user);
      
      // Fetch user data to determine role
      const userDoc = await getDoc(doc(db, "Users", userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as FirestoreUser;
        setIsAdmin(userData.isAdmin);
        
        // Store authentication data in cookies
        Cookies.set('session', idToken, { expires: 5, secure: process.env.NODE_ENV === 'production' });
        Cookies.set('isAdmin', userData.isAdmin ? 'true' : 'false', { expires: 5, secure: process.env.NODE_ENV === 'production' });
        
        // Set admin claim if user is admin
        if (userData.isAdmin) {
          await fetch('/api/admin/claims', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid: userCredential.user.uid }),
          });
        }
        
        // Return the user role for the login page to handle routing
        return { isAdmin: userData.isAdmin };
      }
      
      // Default to non-admin if no user data exists
      Cookies.set('session', idToken, { expires: 5, secure: process.env.NODE_ENV === 'production' });
      Cookies.set('isAdmin', 'false', { expires: 5, secure: process.env.NODE_ENV === 'production' });
      return { isAdmin: false };
    } catch (error) {
      setError("Invalid email or password");
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const newUser: FirestoreUser = {
        name,
        phone: "",
        kycVerified: false,
        isAdmin: false,
        balance: 0,
        wallets: {
          btc: "",
          eth: "",
          usdt: "",
          xrp: "",
          sol: ""
        },
        investments: [],
        recentTransactions: [],
        trendingStocks: []
      };

      await setDoc(doc(db, "Users", uid), newUser);
      
      // Get the ID token and store it in cookies
      const idToken = await getIdToken(userCredential.user);
      Cookies.set('session', idToken, { expires: 5, secure: process.env.NODE_ENV === 'production' });
      Cookies.set('isAdmin', 'false', { expires: 5, secure: process.env.NODE_ENV === 'production' });
      
      // Send email notification to admin about new user registration
      try {
        await notifyRegistration({
          userName: name,
          userEmail: email,
          userId: uid
        });
      } catch (notificationError) {
        console.error("Failed to send registration notification:", notificationError);
        // Continue with registration even if notification fails
      }
      
      // Return user role for the registration page to handle routing
      return { isAdmin: false };
    } catch (error) {
      setError("Failed to create account");
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError("Failed to send reset email");
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      
      // Clear the session cookies
      Cookies.remove('session');
      Cookies.remove('isAdmin');
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      setError("Failed to log out");
      throw error;
    }
  };

  // Helper function to determine the redirect path based on user role
  const getRedirectPath = () => {
    if (isAdmin) {
      return '/admin';
    }
    return '/dashboard';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        forgotPassword,
        logout,
        error,
        isAdmin,
        getRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
