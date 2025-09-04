import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import AuthButton from '../../components/auth/AuthButton';
import { useAuth } from '../../context/AuthContext';
import { useAppLanguage } from '../../context/AppLanguageContext';

const LEVEL_OPTIONS = [
  {
    key: 'A1',
    title: 'A1 - Anfänger',
    titleRu: 'A1 - Начинающий',
    description: 'Ich kenne ein paar Wörter',
    descriptionRu: 'Я знаю несколько слов',
    icon: 'smile',
  },
  {
    key: 'A2',
    title: 'A2 - Grundkenntnisse',
    titleRu: 'A2 - Базовые знания',
    description: 'Ich kann einfache Sätze verstehen',
    descriptionRu: 'Я понимаю простые предложения',
    icon: 'thumbs-up',
  },
  {
    key: 'B1',
    title: 'B1 - Mittelstufe',
    titleRu: 'B1 - Средний уровень',
    description: 'Ich kann mich über vertraute Themen unterhalten',
    descriptionRu: 'Я могу говорить на знакомые темы',
    icon: 'target',
  },
  {
    key: 'B2',
    title: 'B2 - Fortgeschritten',
    titleRu: 'B2 - Продвинутый',
    description: 'Ich kann komplexe Texte verstehen',
    descriptionRu: 'Я понимаю сложные тексты',
    icon: 'award',
  },
];

export default function OnboardingLevelSelectionScreen({ route, navigation }) {
  const { updateProfile } = useAuth();
  const { setLevel, language } = useAppLanguage();
  const { motherTongue, learningDirection } = route.params;
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!selectedLevel) {
      const message = language === 'ru' 
        ? 'Пожалуйста, выберите ваш уровень'
        : 'Bitte wähle dein Level aus';
      Alert.alert(
        language === 'ru' ? 'Пожалуйста, выберите' : 'Bitte wählen', 
        message
      );
      return;
    }

    setLoading(true);
    try {
      // Update app level immediately
      setLevel(selectedLevel);
      
      // Save to database - complete profile
      const { error } = await updateProfile({
        learning_level: selectedLevel,
        // Ensure all onboarding data is saved
        mother_tongue: motherTongue,
        learning_direction: learningDirection,
      });

      if (error) {
        console.error('Profile update error:', error);
        const message = language === 'ru'
          ? `Ошибка при сохранении уровня: ${error.message || error}`
          : `Fehler beim Speichern des Levels: ${error.message || error}`;
        Alert.alert(language === 'ru' ? 'Ошибка' : 'Fehler', message);
        return;
      }

      // Navigate to onboarding completion
      try {
        navigation.navigate('OnboardingComplete');
      } catch (navError) {
        console.error('Navigation error:', navError);
        // If navigation fails, try alternative approach
        navigation.replace('OnboardingComplete');
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
      ? 'Какой у вас уровень?'
      : 'Was ist dein aktuelles Level?';
  };

  const getSubtitle = () => {
    return language === 'ru'
      ? 'Это поможет нам подобрать подходящий контент для вас'
      : 'Das hilft uns, den passenden Inhalt für dich zu finden';
  };

  const getCompleteText = () => {
    return language === 'ru' ? 'Завершить настройку' : 'Setup abschließen';
  };

  const getFooterText = () => {
    return language === 'ru'
      ? 'Не беспокойтесь, вы всегда можете изменить это позже'
      : 'Keine Sorge, du kannst das später jederzeit ändern';
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
              <Feather name="trending-up" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </Animated.View>

          {/* Level Options */}
          <Animated.View 
            entering={FadeIn.duration(800).delay(400)}
            style={styles.main}
          >
            {LEVEL_OPTIONS.map((option, index) => (
              <Animated.View
                key={option.key}
                entering={FadeInUp.duration(600).delay(600 + index * 150)}
              >
                <TouchableOpacity
                  style={[
                    styles.levelOption,
                    selectedLevel === option.key && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedLevel(option.key)}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionContent}>
                    <Feather 
                      name={option.icon} 
                      size={24} 
                      color="#FFFFFF" 
                      style={styles.optionIcon}
                    />
                    <View style={styles.optionText}>
                      <Text style={styles.levelLabel}>
                        {language === 'ru' ? option.titleRu : option.title}
                      </Text>
                      <Text style={styles.levelDescription}>
                        {language === 'ru' ? option.descriptionRu : option.description}
                      </Text>
                    </View>
                    {selectedLevel === option.key && (
                      <Feather name="check-circle" size={24} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Actions */}
          <Animated.View 
            entering={FadeInUp.duration(600).delay(1200)}
            style={styles.actions}
          >
            <AuthButton
              title={getCompleteText()}
              onPress={handleComplete}
              variant="primary"
              loading={loading}
              disabled={!selectedLevel}
              icon={<Feather name="check" size={20} color="#4B3CFA" />}
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
    gap: 12,
  },
  levelOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
  },
  selectedOption: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelDescription: {
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
