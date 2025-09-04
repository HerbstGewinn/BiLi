import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import AuthButton from '../../components/auth/AuthButton';
import { useAuth } from '../../context/AuthContext';

export default function OnboardingWelcomeScreen({ navigation }) {
  const { user } = useAuth();

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
              <Feather name="check-circle" size={64} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Willkommen bei BiLi!</Text>
            <Text style={styles.subtitle}>
              Hallo {user?.email?.split('@')[0] || 'there'}! 👋
            </Text>
          </Animated.View>

          {/* Main content */}
          <Animated.View 
            entering={FadeIn.duration(800).delay(400)}
            style={styles.main}
          >
            <Text style={styles.description}>
              Lass uns dein Lernerlebnis personalisieren. Wir stellen dir ein paar kurze Fragen, 
              um BiLi perfekt auf dich abzustimmen.
            </Text>
            
            <View style={styles.features}>
              <View style={styles.feature}>
                <Feather name="globe" size={24} color="#FFFFFF" />
                <Text style={styles.featureText}>Deine Muttersprache</Text>
              </View>
              <View style={styles.feature}>
                <Feather name="target" size={24} color="#FFFFFF" />
                <Text style={styles.featureText}>Deine Lernrichtung</Text>
              </View>
              <View style={styles.feature}>
                <Feather name="trending-up" size={24} color="#FFFFFF" />
                <Text style={styles.featureText}>Dein aktuelles Level</Text>
              </View>
            </View>
          </Animated.View>

          {/* Action */}
          <Animated.View 
            entering={FadeInUp.duration(600).delay(800)}
            style={styles.actions}
          >
            <AuthButton
              title="Los geht's!"
              onPress={() => navigation.navigate('MotherTongueSelection')}
              variant="primary"
              icon={<Feather name="arrow-right" size={20} color="#4B3CFA" />}
            />
            <Text style={styles.footerText}>
              Das dauert nur 2 Minuten ⏱️
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
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
    minWidth: 250,
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
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 16,
  },
});
