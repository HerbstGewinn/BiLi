import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, runOnJS, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import AuthButton from '../../components/auth/AuthButton';
import { useAppLanguage } from '../../context/AppLanguageContext';

export default function OnboardingCompleteScreen({ navigation }) {
  const { language } = useAppLanguage();
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    // Trigger confetti animation
    confettiOpacity.value = withDelay(800, withTiming(1, { duration: 1000 }));
  }, []);

  const handleStartLearning = () => {
    // Simply return - AuthGuard will automatically detect completed profile
    // and navigate to main app when this screen unmounts
    console.log('Onboarding complete, AuthGuard will handle navigation to main app');
    // Don't navigate anywhere - let the AuthGuard handle the flow
  };

  const getTitle = () => {
    return language === 'ru' 
      ? 'Всё готово!'
      : 'Alles bereit!';
  };

  const getSubtitle = () => {
    return language === 'ru'
      ? 'Добро пожаловать в BiLi! Теперь ваше обучение персонализировано.'
      : 'Willkommen bei BiLi! Dein Lernerlebnis ist jetzt personalisiert.';
  };

  const getDescription = () => {
    return language === 'ru'
      ? 'Мы подготовили для вас индивидуальный опыт обучения на основе ваших предпочтений. Давайте начнём изучать язык!'
      : 'Wir haben ein individuelles Lernerlebnis basierend auf deinen Präferenzen vorbereitet. Lass uns mit dem Sprachenlernen beginnen!';
  };

  const getStartText = () => {
    return language === 'ru' ? 'Начать обучение' : 'Mit dem Lernen beginnen';
  };

  const getFeatures = () => {
    if (language === 'ru') {
      return [
        { icon: 'book-open', text: 'Персонализированные уроки' },
        { icon: 'target', text: 'Адаптивная сложность' },
        { icon: 'trending-up', text: 'Отслеживание прогресса' },
      ];
    } else {
      return [
        { icon: 'book-open', text: 'Personalisierte Lektionen' },
        { icon: 'target', text: 'Adaptive Schwierigkeit' },
        { icon: 'trending-up', text: 'Fortschrittsverfolgung' },
      ];
    }
  };

  return (
    <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Celebration Header */}
          <Animated.View 
            entering={FadeInUp.duration(800).delay(200)}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <Feather name="check-circle" size={64} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </Animated.View>

          {/* Main Content */}
          <Animated.View 
            entering={FadeIn.duration(800).delay(600)}
            style={styles.main}
          >
            <Text style={styles.description}>{getDescription()}</Text>
            
            {/* Features */}
            <View style={styles.features}>
              {getFeatures().map((feature, index) => (
                <Animated.View
                  key={feature.icon}
                  entering={FadeInUp.duration(600).delay(800 + index * 200)}
                  style={styles.feature}
                >
                  <Feather name={feature.icon} size={24} color="#FFFFFF" />
                  <Text style={styles.featureText}>{feature.text}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Action */}
          <Animated.View 
            entering={FadeInUp.duration(600).delay(1400)}
            style={styles.actions}
          >
            <AuthButton
              title={getStartText()}
              onPress={handleStartLearning}
              variant="primary"
              icon={<Feather name="arrow-right" size={20} color="#4B3CFA" />}
            />
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
    paddingTop: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  main: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    gap: 20,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 16,
  },
  actions: {
    paddingBottom: 20,
  },
});
