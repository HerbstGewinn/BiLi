import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useAppLanguage } from '../context/AppLanguageContext';

export default function AuthGuard({ children, authScreens, onboardingScreens }) {
  const { isAuthenticated, loading, userProfile, updateProfile, user } = useAuth();
  const { language, direction, level, setLanguage, setDirection, setLevel } = useAppLanguage();

  console.log('=== AUTHGUARD STATE DEBUG ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('loading:', loading);
  console.log('user:', user?.id, user?.email);
  console.log('userProfile:', userProfile);
  console.log('Profile completeness:', {
    mother_tongue: userProfile?.mother_tongue,
    learning_direction: userProfile?.learning_direction,
    learning_level: userProfile?.learning_level
  });
  console.log('===============================');

  // Sync app language state with user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      // Update app language context from user profile
      if (userProfile.mother_tongue && userProfile.mother_tongue !== language) {
        setLanguage(userProfile.mother_tongue);
      }
      if (userProfile.learning_direction && userProfile.learning_direction !== direction) {
        setDirection(userProfile.learning_direction);
      }
      if (userProfile.learning_level && userProfile.learning_level !== level) {
        setLevel(userProfile.learning_level);
      }
    }
  }, [isAuthenticated, userProfile, language, direction, level, setLanguage, setDirection, setLevel]);

  // Sync user profile with app language state when app settings change
  // BUT ONLY if onboarding is already complete to avoid interference
  useEffect(() => {
    const syncProfileWithAppState = async () => {
      // Only sync if onboarding is already complete
      const isOnboardingComplete = userProfile && 
        userProfile.mother_tongue && 
        userProfile.learning_direction && 
        userProfile.learning_level;

      if (isAuthenticated && userProfile && !loading && isOnboardingComplete) {
        const needsUpdate = 
          userProfile.mother_tongue !== language ||
          userProfile.learning_direction !== direction ||
          userProfile.learning_level !== level;

        if (needsUpdate) {
          console.log('Syncing profile with app state (onboarding already complete)');
          await updateProfile({
            mother_tongue: language,
            learning_direction: direction,
            learning_level: level,
          });
        }
      }
    };

    // Debounce the sync to avoid too many updates
    const timeoutId = setTimeout(syncProfileWithAppState, 1000);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, userProfile, language, direction, level, updateProfile, loading]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </LinearGradient>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return authScreens;
  }

  // Check if user has completed onboarding - must have ALL three fields with actual values
  const hasCompletedOnboarding = userProfile && 
    userProfile.mother_tongue && 
    userProfile.mother_tongue !== null && 
    userProfile.mother_tongue !== '' &&
    userProfile.learning_direction && 
    userProfile.learning_direction !== null && 
    userProfile.learning_direction !== '' &&
    userProfile.learning_level && 
    userProfile.learning_level !== null && 
    userProfile.learning_level !== '';

  console.log('hasCompletedOnboarding:', hasCompletedOnboarding);
  console.log('Detailed check:', {
    hasProfile: !!userProfile,
    motherTongue: userProfile?.mother_tongue,
    learningDirection: userProfile?.learning_direction,
    learningLevel: userProfile?.learning_level,
    motherTongueValid: !!(userProfile?.mother_tongue && userProfile.mother_tongue !== null && userProfile.mother_tongue !== ''),
    directionValid: !!(userProfile?.learning_direction && userProfile.learning_direction !== null && userProfile.learning_direction !== ''),
    levelValid: !!(userProfile?.learning_level && userProfile.learning_level !== null && userProfile.learning_level !== '')
  });

  // If we're authenticated but don't have a userProfile yet, show loading
  if (isAuthenticated && !userProfile && !loading) {
    console.log('Authenticated but no profile, showing loading...');
    return (
      <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </LinearGradient>
    );
  }

  // Show onboarding if authenticated but profile incomplete
  if (isAuthenticated && !hasCompletedOnboarding) {
    console.log('Authenticated but onboarding incomplete, showing onboarding...');
    console.log('Forcing onboarding flow for user:', user?.email);
    return onboardingScreens;
  }

  // Show main app if authenticated and onboarding complete
  console.log('Authenticated and onboarding complete, showing main app for user:', user?.email);
  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
