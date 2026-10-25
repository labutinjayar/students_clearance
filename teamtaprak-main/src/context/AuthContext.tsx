import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { supabase } from '../lib/supabase';
import { supabaseDb } from '../services/supabaseDb';

export interface RegisterParams {
  fullName: string;
  studentId: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  course?: string;
  yearLevel?: string;
  department?: string;
  instructorCode?: string;
  position?: string;
  section?: string;
  academicYear?: string;
  semester?: string;
  role?: Role;
  name?: string; // fallback mapping
}

interface AuthContextType {
  user: User | null;
  login: (emailOrStudentId: string, password?: string) => Promise<User>;
  register: (userData: RegisterParams | Omit<User, 'id'>) => Promise<User>;
  updateProfile: (updatedData: Partial<User>) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const details = error as { name?: string; message?: string; status?: number };
  const message = details.message?.toLowerCase() || '';
  return details.status === 0 ||
    details.name === 'AuthRetryableFetchError' ||
    message.includes('failed to fetch') ||
    message.includes('fetch failed') ||
    message.includes('networkerror') ||
    message.includes('network request failed');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and listen to Supabase Auth Sessions
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const profile = await supabaseDb.getProfileById(session.user.id);
          if (profile?.isActive === true) {
            setUser(profile);
          } else {
            await supabase.auth.signOut();
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session fetch warning:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    // Fallback timeout to ensure loading state completes even if Supabase fails
    const timeoutId = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 5000); // 5 second timeout

    // Listen for real-time authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const profile = await supabaseDb.getProfileById(session.user.id);
          if (profile?.isActive === true) {
            setUser(profile);
            localStorage.setItem('ssu_current_user', JSON.stringify(profile));
          } else {
            setUser(null);
            localStorage.removeItem('ssu_current_user');
          }
        } catch (err) {
          console.error('[AuthContext] Could not load authenticated profile:', err);
          setUser(null);
          localStorage.removeItem('ssu_current_user');
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        localStorage.removeItem('ssu_current_user');
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (emailOrStudentId: string, inputPassword?: string): Promise<User> => {
    setIsLoading(true);
    const cleanInput = emailOrStudentId.trim();
    const pwd = inputPassword;

    if (!cleanInput) {
      setIsLoading(false);
      throw new Error('Please enter your email or Student ID.');
    }

    if (!pwd) {
      setIsLoading(false);
      throw new Error('Please enter your password.');
    }

    try {
      let targetEmail = cleanInput;

      // Check if input is Student ID (does not contain '@')
      if (!cleanInput.includes('@')) {
        const result = await supabaseDb.getProfileByStudentId(cleanInput);
        if (result) {
          targetEmail = result.email;
        } else {
          throw new Error('This Student ID is not registered.');
        }
      } else {
        targetEmail = cleanInput.toLowerCase();
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
        throw new Error('Enter a valid email address or registered Student ID.');
      }

      // Try Supabase Auth sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: pwd
      });

      if (error) {
        const message = error.message.toLowerCase();
        if (error.code === 'email_not_confirmed' || message.includes('email not confirmed')) {
          throw new Error(
            'This account still requires email confirmation. In Supabase, disable Confirm email under Authentication > Providers > Email. Existing unconfirmed accounts may also need to be confirmed in Authentication > Users.'
          );
        }
        if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
          throw new Error(
            'Invalid email or password. If this account was created before email confirmation was disabled, ask an administrator to confirm it in Supabase Authentication > Users.'
          );
        }
        if (message.includes('invalid api key') || message.includes('invalidapikey')) {
          throw new Error('The sign-in server rejected its API key. Verify VITE_SUPABASE_ANON_KEY in the app configuration.');
        }
        console.error('[AuthContext] Sign-in failed:', error.message, error.status);
        throw error;
      }

      // Successful Supabase Authentication! Retrieve user profile
      const authenticatedUserId = data.user.id;
      const userProfile = await supabaseDb.getProfileById(authenticatedUserId);

      if (!userProfile) {
        await supabase.auth.signOut();
        throw new Error('Your account profile was not found. Please contact an administrator.');
      }

      if (userProfile.isActive !== true) {
        await supabase.auth.signOut();
        throw new Error('Your registration is waiting for admin approval.');
      }

      setUser(userProfile);
      localStorage.setItem('ssu_current_user', JSON.stringify(userProfile));
      return userProfile;
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        throw new Error('Cannot reach the sign-in server. Check your internet connection and configured Supabase project URL.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterParams | Omit<User, 'id'>): Promise<User> => {
    setIsLoading(true);

    try {
      const fullName = ('fullName' in userData ? userData.fullName : userData.name) || '';
      const email = userData.email?.trim().toLowerCase() || '';
      const studentId = userData.studentId?.trim() || '';
      const password = ('password' in userData ? userData.password : '') || '';
      const confirmPassword = ('confirmPassword' in userData ? userData.confirmPassword : '') || '';
      const course = userData.course || 'BS Information Technology';
      const yearLevel = userData.yearLevel || '1st Year';
      const department = userData.department || 'CIT';
      const role = userData.role || 'student';
      const instructorCode = ('instructorCode' in userData ? userData.instructorCode : '') || '';

      if (!fullName || !email || !studentId || !password) {
        throw new Error('Please complete all required fields.');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Enter a valid email address.');
      }
      if (role !== 'student' && role !== 'instructor') {
        throw new Error('Administrator accounts cannot be created through public registration.');
      }
      if (role === 'instructor') {
        if (!instructorCode.trim()) {
          throw new Error('An instructor registration code is required.');
        }
        if (!(await supabaseDb.checkInstructorRegistrationCode(instructorCode))) {
          throw new Error('Invalid or expired instructor registration code.');
        }
      }
      if (confirmPassword && password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      if (await supabaseDb.checkStudentIdExists(studentId)) {
        throw new Error('This Student ID is already registered.');
      }
      if (await supabaseDb.checkEmailExists(email)) {
        throw new Error('This email is already registered.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
            studentId,
            course,
            yearLevel,
            department,
            section: 'section' in userData ? userData.section : undefined,
            academicYear: 'academicYear' in userData ? userData.academicYear : undefined,
            semester: 'semester' in userData ? userData.semester : undefined,
            role,
            title: role === 'instructor' && 'position' in userData ? userData.position : undefined
          }
        }
      });

      if (error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('already registered') ||
          errorMessage.includes('already exists') ||
          errorMessage.includes('user_already_exists') ||
          errorMessage.includes('unique constraint') ||
          error.status === 422
        ) {
          throw new Error('This email is already registered. Please log in instead.');
        }
        throw new Error(error.message || 'Registration failed. Please try again.');
      }

      if (!data.user || data.user.identities?.length === 0) {
        throw new Error('This email is already registered. Please log in instead.');
      }

      if (!data.session) {
        throw new Error(
          'Supabase still requires email confirmation, so no sign-in session was created. This account may already exist. Disable Confirm email in Authentication > Providers > Email, then try signing in; an administrator may need to confirm this account in Authentication > Users.'
        );
      }

      const newProfile = await supabaseDb.getProfileById(data.user.id);
      if (!newProfile) {
        await supabase.auth.signOut();
        throw new Error('Registration profile was not created. Please ensure the Supabase auth-user profile trigger is installed.');
      }

      if (role === 'instructor' && !(await supabaseDb.consumeInstructorRegistrationCode(instructorCode))) {
        await supabase.auth.signOut();
        throw new Error('That instructor registration code is no longer available.');
      }

      if (role === 'instructor' && !(await supabaseDb.upsertInstructorRecord(newProfile, studentId, newProfile.title))) {
        await supabase.auth.signOut();
        throw new Error('Instructor registration could not be saved. Please try again.');
      }

      await supabase.auth.signOut();
      return newProfile;

    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!user) return false;
    const editableData = {
      ...(updatedData.name !== undefined ? { name: updatedData.name } : {}),
      ...(updatedData.department !== undefined ? { department: updatedData.department } : {}),
      ...(updatedData.course !== undefined ? { course: updatedData.course } : {}),
      ...(updatedData.yearLevel !== undefined ? { yearLevel: updatedData.yearLevel } : {}),
      ...(updatedData.section !== undefined ? { section: updatedData.section } : {}),
      ...(updatedData.title !== undefined ? { title: updatedData.title } : {}),
    };
    const saved = await supabaseDb.updateOwnProfile(user.id, editableData);
    if (!saved) return false;
    const updatedUser = { ...user, ...editableData };
    setUser(updatedUser);
    localStorage.setItem('ssu_current_user', JSON.stringify(updatedUser));
    return true;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('ssu_current_user');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      updateProfile, 
      logout, 
      isLoading, 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
