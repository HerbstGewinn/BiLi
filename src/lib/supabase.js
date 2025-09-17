import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://wcdyuqrbkxkzbbwpxmow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZHl1cXJia3hremJid3B4bW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjA3OTIsImV4cCI6MjA3MjE5Njc5Mn0.UbiggRRLFYsbdwfHPeKH7rH0Oa0yQ0IF3CtLeX-fEoc';

// Enhanced storage adapter with redundancy and better error handling
class SupabaseStorage {
  constructor() {
    this.storageHealth = {
      secureStore: true,
      asyncStorage: true,
      lastError: null
    };
  }

  async getItem(key) {
    console.log('🔍 Storage getItem called for key:', key);
    
    try {
      // For auth tokens, try multiple storage methods with redundancy
      if (key.includes('token') || key.includes('auth')) {
        return await this.getAuthToken(key);
      }
      
      // For other data, use AsyncStorage
      const value = await AsyncStorage.getItem(key);
      console.log('📦 Retrieved from AsyncStorage:', key, value ? `${value.length} chars` : 'null');
      return value;
      
    } catch (error) {
      console.error('❌ Error getting item from storage:', error);
      this.storageHealth.lastError = error;
      return null;
    }
  }

  async getAuthToken(key) {
    console.log('🔐 Getting auth token for key:', key);
    
    // Strategy 1: Try SecureStore first (primary approach)
    try {
      const secureValue = await SecureStore.getItemAsync(key);
      if (secureValue && this.isValidToken(secureValue)) {
        console.log('✅ Retrieved from SecureStore:', key, `${secureValue.length} chars`);
        this.storageHealth.secureStore = true;
        return secureValue;
      } else if (secureValue) {
        console.warn('⚠️ Invalid token from SecureStore, trying fallback');
      } else {
        console.log('ℹ️ No token in SecureStore, trying fallback');
      }
    } catch (error) {
      console.error('❌ SecureStore failed:', error);
      this.storageHealth.secureStore = false;
    }

    // Strategy 2: Try AsyncStorage as fallback
    try {
      const asyncValue = await AsyncStorage.getItem(key);
      if (asyncValue && this.isValidToken(asyncValue)) {
        console.log('✅ Retrieved from AsyncStorage fallback:', key, `${asyncValue.length} chars`);
        this.storageHealth.asyncStorage = true;
        
        // Try to restore to SecureStore for future use
        this.restoreToSecureStore(key, asyncValue);
        return asyncValue;
      } else if (asyncValue) {
        console.warn('⚠️ Invalid token from AsyncStorage fallback');
      }
    } catch (error) {
      console.error('❌ AsyncStorage fallback failed:', error);
      this.storageHealth.asyncStorage = false;
    }

    console.log('ℹ️ No valid token found in any storage for key:', key);
    return null;
  }

  isValidToken(token) {
    // Simple validation - just check if it's a non-empty string
    // Don't over-engineer this - Supabase will handle token validation
    if (!token || typeof token !== 'string') return false;
    if (token.length < 10) return false; // Too short to be valid
    return true; // Let Supabase handle the rest
  }

  // Parse JWT token to get user info
  parseToken(token) {
    try {
      if (!token || !token.includes('.')) return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return {
        sub: payload.sub,
        email: payload.email,
        exp: payload.exp,
        iat: payload.iat,
        aud: payload.aud,
        iss: payload.iss
      };
    } catch (error) {
      console.error('❌ Failed to parse token:', error);
      return null;
    }
  }

  async restoreToSecureStore(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log('✅ Restored token to SecureStore');
      this.storageHealth.secureStore = true;
    } catch (error) {
      console.warn('⚠️ Could not restore to SecureStore:', error);
    }
  }

  async setItem(key, value) {
    console.log('💾 Storage setItem called for key:', key, 'value length:', value?.length);
    
    try {
      // For auth tokens, use redundant storage strategy
      if (key.includes('token') || key.includes('auth')) {
        return await this.setAuthToken(key, value);
      }
      
      // For other data, use AsyncStorage
      await AsyncStorage.setItem(key, value);
      console.log('✅ Stored in AsyncStorage:', key);
      
    } catch (error) {
      console.error('❌ Error setting item in storage:', error);
      this.storageHealth.lastError = error;
    }
  }

  async setAuthToken(key, value) {
    console.log('🔐 Setting auth token for key:', key, 'length:', value?.length);
    
    if (!value) {
      console.warn('⚠️ Attempting to store null/undefined token');
      return;
    }

    // Simple validation - just check if it's a string
    if (typeof value !== 'string' || value.length < 10) {
      console.error('❌ Invalid token format, not storing');
      return;
    }

    // Strategy 1: Try SecureStore first (primary approach)
    try {
      await SecureStore.setItemAsync(key, value);
      console.log('✅ Stored in SecureStore:', key);
      this.storageHealth.secureStore = true;
      
      // Also store in AsyncStorage as backup (but don't fail if this fails)
      try {
        await AsyncStorage.setItem(key, value);
        console.log('✅ Also stored in AsyncStorage backup:', key);
        this.storageHealth.asyncStorage = true;
      } catch (backupError) {
        console.warn('⚠️ AsyncStorage backup failed (non-critical):', backupError);
        this.storageHealth.asyncStorage = false;
      }
      
      return; // Success with SecureStore
      
    } catch (error) {
      console.error('❌ SecureStore failed, trying AsyncStorage only:', error);
      this.storageHealth.secureStore = false;
      
      // Strategy 2: Fallback to AsyncStorage only
      try {
        await AsyncStorage.setItem(key, value);
        console.log('✅ Stored in AsyncStorage (fallback):', key);
        this.storageHealth.asyncStorage = true;
      } catch (fallbackError) {
        console.error('❌ AsyncStorage fallback also failed:', fallbackError);
        this.storageHealth.asyncStorage = false;
        throw new Error('Token storage failed completely');
      }
    }
  }

  async removeItem(key) {
    console.log('🗑️ Storage removeItem called for key:', key);
    
    try {
      // For auth tokens, remove from both storage methods
      if (key.includes('token') || key.includes('auth')) {
        await this.removeAuthToken(key);
      } else {
        await AsyncStorage.removeItem(key);
        console.log('✅ Removed from AsyncStorage:', key);
      }
    } catch (error) {
      console.error('❌ Error removing item from storage:', error);
      this.storageHealth.lastError = error;
    }
  }

  async removeAuthToken(key) {
    let removedSuccessfully = false;

    // Remove from SecureStore
    try {
      await SecureStore.deleteItemAsync(key);
      console.log('✅ Removed from SecureStore:', key);
      removedSuccessfully = true;
    } catch (error) {
      console.error('❌ Failed to remove from SecureStore:', error);
    }

    // Remove from AsyncStorage
    try {
      await AsyncStorage.removeItem(key);
      console.log('✅ Removed from AsyncStorage:', key);
      removedSuccessfully = true;
    } catch (error) {
      console.error('❌ Failed to remove from AsyncStorage:', error);
    }

    if (!removedSuccessfully) {
      console.warn('⚠️ Failed to remove token from any storage method');
    }
  }

  // Storage health monitoring
  getStorageHealth() {
    return {
      ...this.storageHealth,
      timestamp: new Date().toISOString()
    };
  }

  // Test storage functionality
  async testStorage() {
    const testKey = 'bili-storage-test';
    const testValue = 'test-value-' + Date.now();
    
    console.log('🧪 Testing storage functionality...');
    
    try {
      // Test setItem
      await this.setItem(testKey, testValue);
      
      // Test getItem
      const retrieved = await this.getItem(testKey);
      
      // Test removeItem
      await this.removeItem(testKey);
      
      const success = retrieved === testValue;
      console.log(success ? '✅ Storage test PASSED' : '❌ Storage test FAILED');
      
      return {
        success,
        retrieved,
        expected: testValue
      };
    } catch (error) {
      console.error('❌ Storage test error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test SecureStore specifically
  async testSecureStore() {
    const testKey = 'bili-securestore-test';
    const testValue = 'secure-test-' + Date.now();
    
    console.log('🔐 Testing SecureStore specifically...');
    
    try {
      // Test SecureStore setItem
      await SecureStore.setItemAsync(testKey, testValue);
      console.log('✅ SecureStore setItem successful');
      
      // Test SecureStore getItem
      const retrieved = await SecureStore.getItemAsync(testKey);
      console.log('✅ SecureStore getItem successful:', retrieved ? `${retrieved.length} chars` : 'null');
      
      // Test SecureStore removeItem
      await SecureStore.deleteItemAsync(testKey);
      console.log('✅ SecureStore removeItem successful');
      
      const success = retrieved === testValue;
      console.log(success ? '✅ SecureStore test PASSED' : '❌ SecureStore test FAILED');
      
      return {
        success,
        retrieved,
        expected: testValue,
        secureStoreWorking: true
      };
    } catch (error) {
      console.error('❌ SecureStore test error:', error);
      return {
        success: false,
        error: error.message,
        secureStoreWorking: false
      };
    }
  }
}

// Create storage instance with health monitoring
const storage = new SupabaseStorage();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Use standard flow type
    flowType: 'pkce',
  },
});

// Export storage instance for health monitoring
export { storage };

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

  // Get session with enhanced error handling
  async getSession() {
    try {
      console.log('🔍 Getting session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session error:', error);
        // Check storage health if session fails
        const health = storage.getStorageHealth();
        console.log('📊 Storage health:', health);
      } else if (session) {
        console.log('✅ Session found:', session.user?.email);
      } else {
        console.log('ℹ️ No active session');
      }
      
      return { session, error };
    } catch (error) {
      console.error('❌ Exception in getSession:', error);
      return { session: null, error };
    }
  },

  // Test storage functionality
  async testStorage() {
    return await storage.testStorage();
  },

  // Test SecureStore specifically
  async testSecureStore() {
    return await storage.testSecureStore();
  },

  // Get storage health
  getStorageHealth() {
    return storage.getStorageHealth();
  },

  // Simple session refresh
  async refreshSession() {
    try {
      console.log('🔄 Refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Session refresh failed:', error);
      } else {
        console.log('✅ Session refreshed successfully');
      }
      
      return { data, error };
    } catch (error) {
      console.error('❌ Exception in refreshSession:', error);
      return { data: null, error };
    }
  },

  // Recover session from stored tokens
  async recoverSessionFromStorage() {
    try {
      console.log('🔧 Attempting session recovery from storage...');
      
      // Get stored tokens from our custom storage
      const accessToken = await storage.getItem('sb-wcdyuqrbkxkzbbwpxmow-auth-token');
      const refreshToken = await storage.getItem('sb-wcdyuqrbkxkzbbwpxmow-auth-refresh-token');
      
      if (!accessToken || !refreshToken) {
        console.log('ℹ️ No tokens found in storage for recovery');
        return { data: null, error: { message: 'No tokens found for recovery' } };
      }
      
      // Simple validation - just check if tokens exist and are strings
      if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
        console.log('⚠️ Tokens are not valid strings, clearing storage');
        await storage.removeItem('sb-wcdyuqrbkxkzbbwpxmow-auth-token');
        await storage.removeItem('sb-wcdyuqrbkxkzbbwpxmow-auth-refresh-token');
        return { data: null, error: { message: 'Invalid token format' } };
      }
      
      console.log('🔑 Found valid tokens in storage, attempting to set session...');
      
      // Try to set the session using the stored tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) {
        console.error('❌ Failed to set session from stored tokens:', error);
        // If setSession fails, clear the invalid tokens
        await storage.removeItem('sb-wcdyuqrbkxkzbbwpxmow-auth-token');
        await storage.removeItem('sb-wcdyuqrbkxkzbbwpxmow-auth-refresh-token');
        return { data: null, error };
      }
      
      if (data.session) {
        console.log('✅ Session recovered successfully from storage');
        return { data, error: null };
      } else {
        console.log('ℹ️ Session recovery returned no session');
        return { data: null, error: { message: 'Session recovery returned no session' } };
      }
      
    } catch (error) {
      console.error('❌ Exception in recoverSessionFromStorage:', error);
      return { data: null, error };
    }
  },

  // Manual session recovery (for debugging)
  async manualSessionRecovery() {
    return await this.recoverSessionFromStorage();
  },
};
