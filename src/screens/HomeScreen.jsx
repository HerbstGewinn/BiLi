import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withDelay,
  withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppLanguage } from '../context/AppLanguageContext';

const { width: screenWidth } = Dimensions.get('window');

// Compelling learning topics for each day
const learningTopics = {
  1: {
    title: "Small Talk & Basics",
    icon: "💬",
    description: "Greetings, introductions & courtesy",
    highlights: ["Hello & goodbye", "Please & thank you", "Basic questions"],
    gradientColors: ['#667eea', '#764ba2']
  },
  2: {
    title: "Family & Relationships", 
    icon: "👨‍👩‍👧‍👦",
    description: "People in your life",
    highlights: ["Family members", "Relationships", "Personal connections"],
    gradientColors: ['#f093fb', '#f5576c']
  },
  3: {
    title: "Home & Living",
    icon: "🏠", 
    description: "Your personal space",
    highlights: ["Rooms & furniture", "Daily routines", "Household items"],
    gradientColors: ['#4facfe', '#00f2fe']
  },
  4: {
    title: "Food & Dining",
    icon: "🍽️",
    description: "Meals and culinary culture", 
    highlights: ["Restaurants & ordering", "Cooking terms", "Food preferences"],
    gradientColors: ['#fa709a', '#fee140']
  },
  5: {
    title: "Work & Education",
    icon: "💼",
    description: "Professional and academic life",
    highlights: ["Office vocabulary", "School terms", "Career conversations"],
    gradientColors: ['#a8edea', '#fed6e3']
  },
  6: {
    title: "Shopping & Money",
    icon: "🛒",
    description: "Commerce and transactions",
    highlights: ["Shopping phrases", "Prices & payment", "Stores & services"],
    gradientColors: ['#ff9a9e', '#fecfef']
  },
  7: {
    title: "Transportation & Travel",
    icon: "✈️",
    description: "Getting around and exploring",
    highlights: ["Public transport", "Directions", "Travel planning"],
    gradientColors: ['#a18cd1', '#fbc2eb']
  },
  8: {
    title: "Health & Body",
    icon: "🏥",
    description: "Wellness and medical topics",
    highlights: ["Body parts", "Symptoms", "Doctor visits"],
    gradientColors: ['#ffecd2', '#fcb69f']
  },
  9: {
    title: "Time & Weather",
    icon: "🌤️",
    description: "Temporal and meteorological expressions",
    highlights: ["Days & seasons", "Weather conditions", "Time expressions"],
    gradientColors: ['#89f7fe', '#66a6ff']
  },
  10: {
    title: "Hobbies & Entertainment",
    icon: "🎵",
    description: "Leisure activities and fun",
    highlights: ["Sports & games", "Music & movies", "Weekend activities"],
    gradientColors: ['#fdbb2d', '#22c1c3']
  },
  11: {
    title: "Technology & Communication",
    icon: "📱",
    description: "Digital life and connectivity",
    highlights: ["Phone & internet", "Social media", "Tech problems"],
    gradientColors: ['#ee9ca7', '#ffdde1']
  },
  12: {
    title: "Nature & Environment",
    icon: "🌱",
    description: "The natural world around us",
    highlights: ["Animals & plants", "Geography", "Environmental topics"],
    gradientColors: ['#83a4d4', '#b6fbff']
  },
  13: {
    title: "Culture & Traditions", 
    icon: "🎭",
    description: "Cultural understanding and customs",
    highlights: ["Holidays & festivals", "Traditions", "Cultural expressions"],
    gradientColors: ['#cd9cf2', '#f6f3ff']
  },
  14: {
    title: "Advanced Conversations",
    icon: "🗣️",
    description: "Complex topics and discussions", 
    highlights: ["Opinions & debates", "Abstract concepts", "Fluent expression"],
    gradientColors: ['#ffeaa7', '#fab1a0']
  }
};

// Get current day (for now, we'll use Day 1 as active)
const getCurrentDay = () => 1;

const DayBanner = ({ navigation, t }) => {
  const [bannerState, setBannerState] = useState('collapsed'); // collapsed, expanded, navigating
  const currentDay = getCurrentDay();
  const topic = learningTopics[currentDay];
  
  // Get translated topic content
  const getTranslatedTopic = (topic) => {
    return {
      ...topic,
      title: t('topics')?.[topic.title] || topic.title,
      description: t('topicDescriptions')?.[topic.description] || topic.description,
      highlights: topic.highlights.map(highlight => 
        t('topicHighlights')?.[highlight] || highlight
      )
    };
  };
  
  const translatedTopic = getTranslatedTopic(topic);
  
  // Animation values
  const animatedHeight = useSharedValue(120);
  const topicOpacity = useSharedValue(0);
  const bannerScale = useSharedValue(1);
  const backgroundScale = useSharedValue(1);

  // Entrance animation on mount
  useEffect(() => {
    animatedHeight.value = withDelay(300, withSpring(120, {
      damping: 15,
      stiffness: 100
    }));
  }, []);

  const animatedBannerStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    transform: [{ scale: bannerScale.value }]
  }));

  const animatedTopicStyle = useAnimatedStyle(() => ({
    opacity: topicOpacity.value,
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }]
  }));

  const handleBannerPress = () => {
    if (bannerState === 'collapsed') {
      // Expand to show topic
      setBannerState('expanded');
      animatedHeight.value = withSpring(280, {
        damping: 20,
        stiffness: 120
      });
      topicOpacity.value = withDelay(150, withTiming(1, { duration: 400 }));
      backgroundScale.value = withTiming(1.02, { duration: 300 });
    } else if (bannerState === 'expanded') {
      // Navigate to vocabulary
      setBannerState('navigating');
      bannerScale.value = withSequence(
        withTiming(0.98, { duration: 100 }),
        withTiming(1.02, { duration: 200 }),
        withTiming(1, { duration: 100 })
      );
      
      setTimeout(() => {
        navigation.navigate('Vocabulary', { day: currentDay });
      }, 400);
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.95} 
      onPress={handleBannerPress}
      style={styles.bannerContainer}
    >
      <Animated.View style={[animatedBannerStyle]}>
        <Animated.View style={[animatedBackgroundStyle, { flex: 1 }]}>
          <LinearGradient
            colors={translatedTopic.gradientColors}
            style={styles.bannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Floating particles background */}
            <View style={styles.particlesContainer}>
              <Text style={[styles.particle, { top: 20, left: 20 }]}>📚</Text>
              <Text style={[styles.particle, { top: 40, right: 30 }]}>✏️</Text>
              <Text style={[styles.particle, { bottom: 30, left: 40 }]}>🎯</Text>
              <Text style={[styles.particle, { top: 60, right: 60 }]}>🌟</Text>
            </View>

            {/* Banner content */}
            <View style={styles.bannerContent}>
              {/* Header row */}
              <View style={styles.bannerHeader}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayNumber}>
                    {t('day')} {currentDay}
                  </Text>
                  {bannerState === 'collapsed' && (
                    <View style={styles.typeIndicator}>
                      <Feather name="book" size={16} color="#FFFFFF" />
                      <Text style={styles.typeText}>{t('vocabulary')}</Text>
                    </View>
                  )}
                </View>
                {bannerState === 'collapsed' && (
                  <View style={styles.tapHint}>
                    <Text style={styles.tapText}>{t('tapToReveal') || '👆 Tap to reveal'}</Text>
                  </View>
                )}
              </View>

              {/* Expanded content */}
              {bannerState !== 'collapsed' && (
                <Animated.View style={[styles.topicContent, animatedTopicStyle]}>
                  <View style={styles.topicHeader}>
                    <Text style={styles.topicIcon}>{translatedTopic.icon}</Text>
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicTitle}>{translatedTopic.title}</Text>
                      <Text style={styles.topicDescription}>{translatedTopic.description}</Text>
                    </View>
                  </View>

                  <View style={styles.highlightsContainer}>
                    {translatedTopic.highlights.map((highlight, index) => (
                      <View key={index} style={styles.highlightItem}>
                        <View style={styles.highlightDot} />
                        <Text style={styles.highlightText}>{highlight}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.startButton}>
                    <Feather name="play-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>
                      {t('startLearning') || '🚀 Start Learning'}
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Bottom hint for collapsed state */}
              {bannerState === 'collapsed' && (
                <View style={styles.bottomHint}>
                  <Text style={styles.readyText}>
                    {t('readyToLearn') || 'Ready for today\'s learning adventure?'}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function HomeScreen({ navigation }) {
  const { t, language } = useAppLanguage();
  
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome greeting */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>{t('welcome')}</Text>
        <Text style={styles.subGreeting}>
          {t('todaysAdventure') || 'Today\'s learning adventure awaits!'}
        </Text>
      </View>

      {/* Main Day Banner */}
      <DayBanner navigation={navigation} t={t} />

      {/* Progress indicator */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>
            {t('learningProgress') || 'Learning Progress'}
          </Text>
          <Text style={styles.progressValue}>1/14 {t('days') || 'days'}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(1/14) * 100}%` }]} />
          </View>
        </View>
      </View>

      {/* Coming up section */}
      <View style={styles.comingUpSection}>
        <Text style={styles.comingUpTitle}>
          {t('comingUp') || 'Coming Up Next'}
        </Text>
        <View style={styles.nextTopics}>
          {[2, 3, 4].map(day => {
            const nextTopic = learningTopics[day];
            const translatedNextTopic = {
              ...nextTopic,
              title: t('topics')?.[nextTopic.title] || nextTopic.title
            };
            
            return (
              <View key={day} style={styles.nextTopic}>
                <Text style={styles.nextTopicIcon}>{translatedNextTopic.icon}</Text>
                <View style={styles.nextTopicInfo}>
                  <Text style={styles.nextTopicDay}>
                    {t('day')} {day}
                  </Text>
                  <Text style={styles.nextTopicTitle}>
                    {translatedNextTopic.title}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  
  // Welcome Section
  welcomeSection: {
    marginBottom: 32,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subGreeting: {
    color: '#FFFFFF80',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },

  // Banner Styles
  bannerContainer: {
    marginBottom: 32,
  },
  bannerGradient: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.3,
  },
  bannerContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayInfo: {
    flex: 1,
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  tapHint: {
    alignItems: 'flex-end',
  },
  tapText: {
    color: '#FFFFFF80',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomHint: {
    alignItems: 'center',
    marginTop: 16,
  },
  readyText: {
    color: '#FFFFFF90',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Expanded Topic Content
  topicContent: {
    marginTop: 20,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  topicIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  topicDescription: {
    color: '#FFFFFF80',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  highlightsContainer: {
    marginBottom: 24,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF80',
    marginRight: 12,
  },
  highlightText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Progress Section
  progressSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressValue: {
    color: '#FFFFFF80',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },

  // Coming Up Section
  comingUpSection: {
    marginBottom: 20,
  },
  comingUpTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  nextTopics: {
    gap: 12,
  },
  nextTopic: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  nextTopicIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  nextTopicInfo: {
    flex: 1,
  },
  nextTopicDay: {
    color: '#FFFFFF80',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  nextTopicTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});


