import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://wcdyuqrbkxkzbbwpxmow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZHl1cXJia3hremJid3B4bW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjA3OTIsImV4cCI6MjA3MjE5Njc5Mn0.UbiggRRLFYsbdwfHPeKH7rH0Oa0yQ0IF3CtLeX-fEoc';

// Custom storage adapter that uses expo-secure-store for tokens
class SupabaseStorage {
  async getItem(key) {
    try {
      console.log('Storage getItem called for key:', key);
      
      // Use SecureStore for sensitive auth tokens
      if (key.includes('token') || key.includes('auth')) {
        const value = await SecureStore.getItemAsync(key);
        console.log('Retrieved from SecureStore:', key, value ? `${value.length} chars` : 'null');
        
        // Handle large tokens by checking size
        if (value && value.length > 2000) {
          console.warn('Large token detected, consider implementing token refresh');
        }
        return value;
      }
      // Use AsyncStorage for other data
      const value = await AsyncStorage.getItem(key);
      console.log('Retrieved from AsyncStorage:', key, value ? `${value.length} chars` : 'null');
      return value;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      // If SecureStore fails, try AsyncStorage as fallback for auth data
      if (key.includes('token') || key.includes('auth')) {
        try {
          const fallbackValue = await AsyncStorage.getItem(key);
          console.log('Fallback retrieval from AsyncStorage:', key, fallbackValue ? `${fallbackValue.length} chars` : 'null');
          return fallbackValue;
        } catch (fallbackError) {
          console.error('Fallback storage also failed:', fallbackError);
          return null;
        }
      }
      return null;
    }
  }

  async setItem(key, value) {
    try {
      // Use SecureStore for sensitive auth tokens
      if (key.includes('token') || key.includes('auth')) {
        // Check if token is too large for SecureStore
        if (value && value.length > 2000) {
          console.warn('Token too large for SecureStore, using AsyncStorage');
          await AsyncStorage.setItem(key, value);
        } else {
          await SecureStore.setItemAsync(key, value);
        }
      } else {
        // Use AsyncStorage for other data
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item in storage:', error);
      // If SecureStore fails, fallback to AsyncStorage
      if (key.includes('token') || key.includes('auth')) {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (fallbackError) {
          console.error('Fallback storage also failed:', fallbackError);
        }
      }
    }
  }

  async removeItem(key) {
    try {
      // Try both storage methods
      if (key.includes('token') || key.includes('auth')) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new SupabaseStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Add retry and timeout settings for better reliability
    flowType: 'pkce',
  },
  // Add global config for better error handling
  global: {
    headers: {
      'X-Client-Info': 'bili-app@1.0.0',
    },
  },
  // Enable realtime for better session sync
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper functions for auth operations
export const authHelpers = {
  // Sign up with email and username
  async signUp(email, password, username, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username,
        },
      },
    });
    return { data, error };
  },

  // Sign in with email
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'bili://reset-password',
    });
    return { data, error };
  },

  // Get current user profile - bypass Supabase auth when we have external user context
  async getUserProfile(externalUser = null) {
    try {
      console.log('=== getUserProfile DEBUG START ===');
      console.log('External user provided:', externalUser?.id, externalUser?.email);
      
      // If external user provided, use it directly (bypass Supabase auth)
      if (externalUser) {
        console.log('Using external user context, bypassing Supabase auth');
        const user = externalUser;
        console.log('Getting profile for external user:', user.id, user.email);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (error) {
          console.error('Database error in getUserProfile (external user):', error);
          
          // If no profile exists, create one
          if (error.code === 'PGRST116') {
            console.log('No profile found for external user, creating basic profile');
            const newProfile = {
              auth_user_id: user.id,
              email: user.email,
              username: user.user_metadata?.username || user.email.split('@')[0],
              display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email.split('@')[0],
              // Explicitly set onboarding fields to null to ensure onboarding is triggered
              mother_tongue: null,
              learning_direction: null,
              learning_level: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            const { data: newData, error: createError } = await supabase
              .from('users')
              .insert(newProfile)
              .select()
              .single();
              
            if (createError) {
              console.error('Error creating new profile for external user:', createError);
              return { data: null, error: createError };
            }
            
            console.log('New profile created successfully for external user');
            return { data: newData, error: null };
          }
        } else {
          console.log('Profile found for external user:', data ? 'yes' : 'no');
        }

        return { data, error };
      }
      
      // Try Supabase auth methods as fallback
      const sessionResult = await supabase.auth.getSession();
      console.log('Session result:', sessionResult);
      
      if (!sessionResult.data?.session?.user) {
        console.log('No user in session, trying auth.getUser()...');
        
        const userResult = await supabase.auth.getUser();
        console.log('User result:', userResult);
        
        if (!userResult.data?.user) {
          console.error('No user found in both session and getUser()');
          console.log('Auth errors:', {
            sessionError: sessionResult.error,
            userError: userResult.error
          });
          console.log('=== getUserProfile DEBUG END (NO USER) ===');
          return { data: null, error: 'No user found' };
        }
        
        const user = userResult.data.user;
        console.log('Getting profile for user (from auth.getUser):', user.id, user.email);
        
        // Use the user from auth.getUser
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (error) {
          console.error('Database error in getUserProfile:', error);
          
          // If no profile exists, create one
          if (error.code === 'PGRST116') {
            console.log('No profile found, creating basic profile');
            const newProfile = {
              auth_user_id: user.id,
              email: user.email,
              username: user.user_metadata?.username || user.email.split('@')[0],
              display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            const { data: newData, error: createError } = await supabase
              .from('users')
              .insert(newProfile)
              .select()
              .single();
              
            if (createError) {
              console.error('Error creating new profile:', createError);
              return { data: null, error: createError };
            }
            
            console.log('New profile created successfully');
            return { data: newData, error: null };
          }
        } else {
          console.log('Profile found:', data ? 'yes' : 'no');
        }

        return { data, error };
      }

      const user = sessionResult.data.session.user;
      console.log('Getting profile for user (from session):', user.id, user.email);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Database error in getUserProfile:', error);
        
        // If no profile exists, try to create one from the auth user data
        if (error.code === 'PGRST116') { // No rows returned
          console.log('No profile found, creating basic profile');
          const newProfile = {
            auth_user_id: user.id,
            email: user.email,
            username: user.user_metadata?.username || user.email.split('@')[0],
            display_name: user.user_metadata?.display_name || user.user_metadata?.username || user.email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { data: newData, error: createError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating new profile:', createError);
            return { data: null, error: createError };
          }
          
          console.log('New profile created successfully');
          return { data: newData, error: null };
        }
      } else {
        console.log('Profile found:', data ? 'yes' : 'no');
      }

      return { data, error };
    } catch (error) {
      console.error('Exception in getUserProfile:', error);
      return { data: null, error: error.message };
    }
  },

  // Update user profile - bypass Supabase auth when we have external user context
  async updateUserProfile(updates, externalUser = null) {
    try {
      console.log('=== updateUserProfile DEBUG START ===');
      console.log('Requested updates:', updates);
      console.log('External user provided:', externalUser?.id, externalUser?.email);
      
      let user;
      
      // If external user provided, use it directly (bypass Supabase auth)
      if (externalUser) {
        console.log('Using external user context, bypassing Supabase auth');
        user = externalUser;
        console.log('Updating profile for external user:', user.id, user.email, 'with updates:', updates);
      } else {
        // Try Supabase auth methods as fallback
        const sessionResult = await supabase.auth.getSession();
        console.log('Session result in updateUserProfile:', sessionResult);
        
        if (sessionResult.data?.session?.user) {
          user = sessionResult.data.session.user;
          console.log('Updating profile for user (from session):', user.id, user.email, 'with updates:', updates);
        } else {
          console.log('No session user, trying auth.getUser()...');
          const userResult = await supabase.auth.getUser();
          console.log('User result in updateUserProfile:', userResult);
          
          if (!userResult.data?.user) {
            console.error('No user found in updateUserProfile after trying both methods');
            console.log('Auth errors:', {
              sessionError: sessionResult.error,
              userError: userResult.error
            });
            console.log('=== updateUserProfile DEBUG END (NO USER) ===');
            return { data: null, error: 'No user found' };
          }
          user = userResult.data.user;
          console.log('Updating profile for user (from auth.getUser):', user.id, user.email, 'with updates:', updates);
        }
      }

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Database error in updateUserProfile:', error);
      } else {
        console.log('Profile updated successfully:', data);
      }

      return { data, error };
    } catch (error) {
      console.error('Exception in updateUserProfile:', error);
      return { data: null, error: error.message };
    }
  },

  // Get session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
};
