import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import AuthButton from '../../components/auth/AuthButton';
import { useAuth } from '../../context/AuthContext';
import { useAppLanguage } from '../../context/AppLanguageContext';

const DIRECTION_OPTIONS = {
  de: [
    {
      key: 'de-ru',
      from: '🇩🇪',
      to: '🇷🇺',
      label: 'Deutsch → Russisch',
      description: 'Ich möchte Russisch lernen',
    },
  ],
  ru: [
    {
      key: 'ru-de',
      from: '🇷🇺',
      to: '🇩🇪', 
      label: 'Русский → Немецкий',
      description: 'Я хочу изучать немецкий язык',
    },
  ],
};

export default function LearningDirectionSelectionScreen({ route, navigation }) {
  const { updateProfile } = useAuth();
  const { setDirection, t, language } = useAppLanguage();
  const { motherTongue } = route.params;
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableDirections = DIRECTION_OPTIONS[motherTongue] || DIRECTION_OPTIONS.de;

  const handleContinue = async () => {
    if (!selectedDirection) {
      const message = language === 'ru' 
        ? 'Пожалуйста, выберите направление обучения'
        : 'Bitte wähle deine Lernrichtung aus';
      Alert.alert(
        language === 'ru' ? 'Пожалуйста, выберите' : 'Bitte wählen', 
        message
      );
      return;
    }

    setLoading(true);
    try {
      // Update app direction immediately
      setDirection(selectedDirection);
      
      // Save to database
      const { error } = await updateProfile({
        learning_direction: selectedDirection,
      });

      if (error) {
        console.error('Profile update error:', error);
        const message = language === 'ru'
          ? `Ошибка при сохранении направления обучения: ${error.message || error}`
          : `Fehler beim Speichern der Lernrichtung: ${error.message || error}`;
        Alert.alert(language === 'ru' ? 'Ошибка' : 'Fehler', message);
        return;
      }

      // Navigate to level selection
      try {
        navigation.navigate('LevelSelection', {
          motherTongue,
          learningDirection: selectedDirection,
        });
      } catch (navError) {
        console.error('Navigation error:', navError);
        // If navigation fails, try alternative approach
        navigation.replace('LevelSelection', {
          motherTongue,
          learningDirection: selectedDirection,
        });
      }
    } catch (error) {
      const message = language === 'ru'
        ? 'Произошла неожиданная ошибка'
        : 'Ein unerwarteter Fehler ist aufgetreten';
      Alert.alert(language === 'ru' ? 'Ошибка' : 'Fehler', message);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return language === 'ru' 
      ? 'Какое направление обучения вы выберете?'
      : 'Welche Lernrichtung wählst du?';
  };

  const getSubtitle = () => {
    return language === 'ru'
      ? 'Выберите, какой язык вы хотите изучать'
      : 'Wähle, welche Sprache du lernen möchtest';
  };

  const getContinueText = () => {
    return language === 'ru' ? 'Продолжить' : 'Weiter';
  };

  const getFooterText = () => {
    return language === 'ru'
      ? 'Вы можете изменить это позже в настройках'
      : 'Du kannst dies später in den Einstellungen ändern';
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
              <Feather name="target" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </Animated.View>

          {/* Direction Options */}
          <Animated.View 
            entering={FadeIn.duration(800).delay(400)}
            style={styles.main}
          >
            {availableDirections.map((option, index) => (
              <Animated.View
                key={option.key}
                entering={FadeInUp.duration(600).delay(600 + index * 200)}
              >
                <TouchableOpacity
                  style={[
                    styles.directionOption,
                    selectedDirection === option.key && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedDirection(option.key)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.flagContainer}>
                      <Text style={styles.flagFrom}>{option.from}</Text>
                      <Feather name="arrow-right" size={20} color="#FFFFFF" style={styles.arrow} />
                      <Text style={styles.flagTo}>{option.to}</Text>
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.directionLabel}>{option.label}</Text>
                      <Text style={styles.directionDescription}>
                        {option.description}
                      </Text>
                    </View>
                    {selectedDirection === option.key && (
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
              title={getContinueText()}
              onPress={handleContinue}
              variant="primary"
              loading={loading}
              disabled={!selectedDirection}
              icon={<Feather name="arrow-right" size={20} color="#4B3CFA" />}
            />
            <Text style={styles.footerText}>{getFooterText()}</Text>
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
  directionOption: {
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
    alignItems: 'center',
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flagFrom: {
    fontSize: 32,
  },
  arrow: {
    marginHorizontal: 16,
  },
  flagTo: {
    fontSize: 32,
  },
  optionText: {
    alignItems: 'center',
    flex: 1,
  },
  directionLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  directionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
