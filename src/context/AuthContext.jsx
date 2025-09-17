import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authHelpers } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  userProfile: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Enhanced initial session recovery
    const getInitialSession = async () => {
      try {
        console.log('🚀 Starting initial session recovery...');
        
        // Test storage health first
        const storageHealth = authHelpers.getStorageHealth();
        console.log('📊 Storage health check:', storageHealth);
        
        // Test SecureStore specifically first
        const secureStoreTest = await authHelpers.testSecureStore();
        console.log('🔐 SecureStore test result:', secureStoreTest);
        
        // Test general storage functionality
        const storageTest = await authHelpers.testStorage();
        console.log('🧪 General storage test result:', storageTest);
        
        // Simple session recovery - just get the session
        const { session, error } = await authHelpers.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
        } else if (session) {
          console.log('✅ Session found:', session.user?.email);
        } else {
          console.log('ℹ️ No session found');
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          await loadUserProfile(session.user);
        }
        
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Enhanced auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGE DEBUG ===');
        console.log('Event:', event);
        console.log('Session:', session);
        console.log('User:', session?.user);
        console.log('User ID:', session?.user?.id);
        console.log('User Email:', session?.user?.email);
        console.log('================================');
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ User signed in successfully');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              await loadUserProfile(session.user);
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('👋 User signed out');
            setSession(null);
            setUser(null);
            setUserProfile(null);
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed');
            setSession(session);
            if (session?.user) {
              setUser(session.user);
            }
            break;
            
          case 'PASSWORD_RECOVERY':
            console.log('🔑 Password recovery initiated');
            break;
            
          default:
            console.log('🔄 Auth state changed:', event);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              console.log('Loading user profile for:', session.user.id);
              await loadUserProfile(session.user);
            } else {
              console.log('No user in session, clearing profile');
              setUserProfile(null);
            }
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      console.log('=== LOADING USER PROFILE ===');
      console.log('Auth user provided:', authUser?.id, authUser?.email);
      
      // Pass the authUser to getUserProfile to bypass Supabase auth issues
      const { data, error } = await authHelpers.getUserProfile(authUser);
      
      console.log('Profile load result - data:', data);
      console.log('Profile load result - error:', error);
      
      if (error) {
        console.error('Error loading user profile:', error);
        // If no profile exists, set userProfile to empty object to trigger onboarding
        if (error.message === 'No user found') {
          console.log('Setting empty profile to trigger onboarding');
          setUserProfile({});
        }
      } else {
        console.log('Setting user profile:', data);
        console.log('Profile onboarding status:', {
          mother_tongue: data?.mother_tongue,
          learning_direction: data?.learning_direction,
          learning_level: data?.learning_level,
          needsOnboarding: !data?.mother_tongue || !data?.learning_direction || !data?.learning_level
        });
        setUserProfile(data);
      }
      console.log('=== PROFILE LOAD COMPLETE ===');
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const signUp = async (email, password, username, displayName) => {
    setLoading(true);
    try {
      const { data, error } = await authHelpers.signUp(email, password, username, displayName);
      return { data, error };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await authHelpers.signIn(email, password);
      return { data, error };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await authHelpers.signOut();
      if (!error) {
        setUser(null);
        setUserProfile(null);
        setSession(null);
      }
      return { error };
    } catch (error) {
      console.error('Error in signOut:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await authHelpers.resetPassword(email);
      return { data, error };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { data: null, error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      console.log('=== UPDATE PROFILE CONTEXT ===');
      console.log('Current user in context:', user?.id, user?.email);
      console.log('Current session in context:', session?.user?.id, session?.user?.email);
      console.log('Requested updates:', updates);
      
      // Use current user context to bypass Supabase auth issues
      const currentUser = user || session?.user;
      const { data, error } = await authHelpers.updateUserProfile(updates, currentUser);
      
      console.log('Update result - data:', data);
      console.log('Update result - error:', error);
      
      if (!error && data) {
        console.log('Profile updated successfully, setting local state');
        setUserProfile(data);
      }
      
      console.log('=== UPDATE PROFILE COMPLETE ===');
      return { data, error };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!session?.user,
    isProfileComplete: !!(userProfile?.mother_tongue && userProfile?.learning_direction && userProfile?.learning_level),
  };

  return (
    <AuthContext.Provider value={value}>
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
