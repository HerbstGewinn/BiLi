import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import AuthButton from '../../components/auth/AuthButton';
import { useAuth } from '../../context/AuthContext';
import { useAppLanguage } from '../../context/AppLanguageContext';

const LANGUAGE_OPTIONS = [
  {
    key: 'de',
    label: 'Deutsch',
    flag: '🇩🇪',
    description: 'Ich bin deutscher Muttersprachler',
  },
  {
    key: 'ru',
    label: 'Русский',
    flag: '🇷🇺', 
    description: 'Я русскоязычный',
  },
];

export default function MotherTongueSelectionScreen({ navigation }) {
  const { updateProfile } = useAuth();
  const { setLanguage } = useAppLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedLanguage) {
      Alert.alert('Bitte wählen', 'Bitte wähle deine Muttersprache aus.');
      return;
    }

    setLoading(true);
    try {
      // Update app language immediately
      setLanguage(selectedLanguage);
      
      // Save to database
      const { error } = await updateProfile({
        mother_tongue: selectedLanguage,
      });

      if (error) {
        console.error('Profile update error:', error);
        Alert.alert('Fehler', `Fehler beim Speichern der Muttersprache: ${error.message || error}`);
        return;
      }

      // Navigate to learning direction
      try {
        navigation.navigate('LearningDirectionSelection', {
          motherTongue: selectedLanguage,
        });
      } catch (navError) {
        console.error('Navigation error:', navError);
        // If navigation fails, try alternative approach
        navigation.replace('LearningDirectionSelection', {
          motherTongue: selectedLanguage,
        });
      }
    } catch (error) {
      console.error('Unexpected error in mother tongue selection:', error);
      Alert.alert('Fehler', `Ein unerwarteter Fehler ist aufgetreten: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <Animated.View 
            entering={FadeInUp.duration(600).delay(200)}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <Feather name="globe" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Was ist deine Muttersprache?</Text>
            <Text style={styles.subtitle}>
              Damit können wir BiLi in deiner bevorzugten Sprache anzeigen
            </Text>
          </Animated.View>

          {/* Language Options */}
          <Animated.View 
            entering={FadeIn.duration(800).delay(400)}
            style={styles.main}
          >
            {LANGUAGE_OPTIONS.map((option, index) => (
              <Animated.View
                key={option.key}
                entering={FadeInUp.duration(600).delay(600 + index * 200)}
              >
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    selectedLanguage === option.key && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedLanguage(option.key)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.flag}>{option.flag}</Text>
                    <View style={styles.optionText}>
                      <Text style={styles.languageLabel}>{option.label}</Text>
                      <Text style={styles.languageDescription}>
                        {option.description}
                      </Text>
                    </View>
                    {selectedLanguage === option.key && (
                      <Feather name="check-circle" size={24} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Actions */}
          <Animated.View 
            entering={FadeInUp.duration(600).delay(1000)}
            style={styles.actions}
          >
            <AuthButton
              title="Weiter"
              onPress={handleContinue}
              variant="primary"
              loading={loading}
              disabled={!selectedLanguage}
              icon={<Feather name="arrow-right" size={20} color="#4B3CFA" />}
            />
            <Text style={styles.footerText}>
              Du kannst dies später in den Einstellungen ändern
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  main: {
    gap: 16,
  },
  languageOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
  },
  selectedOption: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  languageDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actions: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
  },
});
