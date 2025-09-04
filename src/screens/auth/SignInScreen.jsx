import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import LoadingOverlay from '../../components/auth/LoadingOverlay';
import { useAuth } from '../../context/AuthContext';
import { useAppLanguage } from '../../context/AppLanguageContext';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignInScreen({ navigation }) {
  const { signIn } = useAuth();
  const { t } = useAppLanguage();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        Alert.alert(
          t('signInError'),
          error.message || t('signInErrorGeneric')
        );
      } else {
        // Successful login - AuthGuard will handle navigation to onboarding or main app
        console.log('Sign in successful, AuthGuard will handle navigation');
      }
    } catch (error) {
      Alert.alert(t('signInError'), t('signInErrorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Feather name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.title}>{t('signIn')}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label={t('email')}
                    placeholder={t('emailPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthInput
                    label={t('password')}
                    placeholder={t('passwordPlaceholder')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={errors.password?.message}
                  />
                )}
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>
                  {t('forgotPassword')}
                </Text>
              </TouchableOpacity>

              <AuthButton
                title={t('signIn')}
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                variant="primary"
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('dontHaveAccount')}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.footerLink}>{t('signUp')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <LoadingOverlay visible={loading} message={t('signingIn')} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  form: {
    flex: 1,
    paddingTop: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footerLink: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
