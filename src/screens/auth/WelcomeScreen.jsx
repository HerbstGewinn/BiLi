import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withDelay,
  withSequence,
  FadeInDown,
  FadeInUp,
  SlideInUp
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import AuthButton from '../../components/auth/AuthButton';
import { useAppLanguage } from '../../context/AppLanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Simple Animated Logo Component
const AnimatedLogo = () => {
  const logoScale = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withDelay(200, withSpring(1, {
      damping: 20,
      stiffness: 150
    }));
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }]
  }));

  return (
    <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.logoBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.logo}>BiLi</Text>
      </LinearGradient>
    </Animated.View>
  );
};

export default function WelcomeScreen({ navigation }) {
  const { t } = useAppLanguage();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Top Section - Logo & Branding */}
            <Animated.View 
              entering={FadeInUp.duration(600).delay(100)}
              style={styles.topSection}
            >
              <AnimatedLogo />
              <Animated.Text 
                entering={FadeInUp.duration(600).delay(300)}
                style={styles.tagline}
              >
                {t('welcomeTagline')}
              </Animated.Text>
            </Animated.View>

            {/* Hero Section - Main Content */}
            <Animated.View 
              entering={FadeInUp.duration(600).delay(500)}
              style={styles.heroSection}
            >
              <Text style={styles.heroTitle}>{t('welcomeTitle')}</Text>
              <Text style={styles.heroSubtitle}>{t('welcomeSubtitle')}</Text>
              
            </Animated.View>

            {/* Bottom Section - Actions */}
            <Animated.View 
              entering={FadeInUp.duration(600).delay(700)}
              style={styles.bottomSection}
            >
              <View style={styles.actionsContainer}>
                <AuthButton
                  title={t('createAccount')}
                  onPress={() => navigation.navigate('SignUp')}
                  variant="primary"
                />
                
                {/* Sign In Link */}
                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>{t('alreadyHaveAccount')}</Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('SignIn')}
                    style={styles.signInLink}
                  >
                    <Text style={styles.signInLinkText}>{t('signInNow')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Footer */}
              <Text style={styles.footerText}>
                {t('continueAgreement')}
              </Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 50,
  },

  // Top Section - Logo & Branding (25% of screen)
  topSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 8,
  },

  // Hero Section - Main Content (50% of screen)
  heroSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: 20,
    letterSpacing: -1,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'left',
    lineHeight: 28,
    marginBottom: 40,
    fontWeight: '500',
    letterSpacing: -0.2,
  },

  // Feature Highlights
  featureHighlight: {
    marginTop: 20,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Bottom Section - Actions (25% of screen)
  bottomSection: {
    paddingTop: 40,
  },
  actionsContainer: {
    marginBottom: 32,
  },

  // Sign In Link
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  signInText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '500',
  },
  signInLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  signInLinkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Footer
  footerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '400',
    paddingHorizontal: 20,
  },
});
