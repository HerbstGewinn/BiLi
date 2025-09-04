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

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const { t } = useAppLanguage();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        Alert.alert(
          t('resetPasswordError'),
          error.message || t('resetPasswordErrorGeneric')
        );
      } else {
        Alert.alert(
          t('checkEmail'),
          t('resetPasswordEmailSent'),
          [
            {
              text: t('ok'),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(t('resetPasswordError'), t('resetPasswordErrorGeneric'));
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
              <Text style={styles.title}>{t('resetPassword')}</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Feather name="mail" size={64} color="rgba(255, 255, 255, 0.8)" />
              </View>
              
              <Text style={styles.subtitle}>{t('resetPasswordSubtitle')}</Text>
              <Text style={styles.description}>{t('resetPasswordDescription')}</Text>

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

                <AuthButton
                  title={t('sendResetEmail')}
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  variant="primary"
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('rememberPassword')}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.footerLink}>{t('signIn')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <LoadingOverlay visible={loading} message={t('sendingEmail')} />
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
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
