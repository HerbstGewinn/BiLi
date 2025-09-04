import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAppLanguage } from '../context/AppLanguageContext';
import { useFlashcards } from '../context/FlashcardContext';
import BackButton from '../components/BackButton';

const { width: screenWidth } = Dimensions.get('window');

const MASTERY_GROUPS = [
  { 
    key: 'perfect', 
    level: 5, 
    icon: 'award', 
    gradientColors: ['#667eea', '#764ba2'],
    emoji: '🏆',
    title: 'Perfect',
    subtitle: 'Mastered words'
  },
  { 
    key: 'good', 
    level: 4, 
    icon: 'thumbs-up', 
    gradientColors: ['#11998e', '#38ef7d'],
    emoji: '👍',
    title: 'Good',
    subtitle: 'Well known'
  },
  { 
    key: 'ok', 
    level: 3, 
    icon: 'meh', 
    gradientColors: ['#ffeaa7', '#fdcb6e'],
    emoji: '😐',
    title: 'OK',
    subtitle: 'Getting there'
  },
  { 
    key: 'difficult', 
    level: 2, 
    icon: 'alert-circle', 
    gradientColors: ['#fd79a8', '#fdcb6e'],
    emoji: '😅',
    title: 'Difficult',
    subtitle: 'Needs practice'
  },
  { 
    key: 'needHelp', 
    level: 1, 
    icon: 'help-circle', 
    gradientColors: ['#a29bfe', '#6c5ce7'],
    emoji: '🆘',
    title: 'Need Help',
    subtitle: 'Keep trying'
  },
];

export default function VocabularyGalleryScreen({ navigation }) {
  const { t } = useAppLanguage();
  const { getProgressByMastery, getStatistics, loading } = useFlashcards();

  const statistics = useMemo(() => getStatistics(), [getStatistics]);

  const handlePracticeCategory = (masteryLevel) => {
    // Navigate to the practice screen for this category
    navigation.navigate('PracticeMode', { 
      masteryLevel: masteryLevel 
    });
  };
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loading}>{t('loading')}...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>✨ {t('gallery') || 'Word Gallery'}</Text>
          <Text style={styles.subtitle}>
            {t('yourProgress') || 'Your learning journey'}
          </Text>
        </View>
      </Animated.View>

      {/* Statistics Hero Card */}
      <Animated.View entering={FadeInDown.delay(200)}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.heroStatsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroStatsContent}>
            <View style={styles.heroStatsLeft}>
              <Text style={styles.heroStatsLabel}>{t('wordsLearned') || 'Words Learned'}</Text>
              <Text style={styles.heroStatsNumber}>{statistics.total}</Text>
              <Text style={styles.heroStatsSubtext}>
                {t('keepGoing') || 'Keep going!'} 🚀
              </Text>
            </View>
            <View style={styles.heroStatsIcon}>
              <Text style={styles.heroStatsEmoji}>📚</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Mastery Categories */}
      <View style={styles.categoriesSection}>
        <Animated.Text 
          entering={FadeInUp.delay(400)} 
          style={styles.categoriesTitle}
        >
          {t('masteryLevels') || 'Mastery Levels'}
        </Animated.Text>
        
        {MASTERY_GROUPS.map((group, index) => {
          const words = getProgressByMastery(group.level);
          const count = words.length;
          const percentage = statistics.total > 0 ? Math.round((count / statistics.total) * 100) : 0;

          return (
            <Animated.View 
              key={group.key} 
              entering={FadeInDown.delay(500 + index * 100)}
              style={styles.categoryCardContainer}
            >
              <LinearGradient
                colors={group.gradientColors}
                style={styles.categoryCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Card Header */}
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryHeaderLeft}>
                    <Text style={styles.categoryEmoji}>{group.emoji}</Text>
                    <View style={styles.categoryHeaderText}>
                      <Text style={styles.categoryTitle}>
                        {t(group.key) || group.title}
                      </Text>
                      <Text style={styles.categorySubtitle}>
                        {count} {t('words') || 'words'} • {percentage}%
                      </Text>
                    </View>
                  </View>
                  <Feather name={group.icon} size={24} color="#FFFFFF" opacity={0.8} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${Math.min(percentage, 100)}%` }
                      ]} 
                    />
                  </View>
                </View>

                {/* Word Preview */}
                <View style={styles.wordsPreview}>
                  {words.length === 0 ? (
                    <View style={styles.emptyWordsState}>
                      <Feather name="plus-circle" size={20} color="#FFFFFF80" />
                      <Text style={styles.emptyWordsText}>
                        {t('noWordsYet') || 'No words yet'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.wordsGrid}>
                      {words.slice(0, 4).map((word, idx) => (
                        <View key={`${word.id}-${idx}`} style={styles.wordChip}>
                          <Text style={styles.wordChipText}>{word.word_from}</Text>
                        </View>
                      ))}
                      {words.length > 4 && (
                        <View style={[styles.wordChip, styles.moreWordsChip]}>
                          <Text style={styles.moreWordsText}>+{words.length - 4}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Practice Button */}
                {count > 0 && (
                  <TouchableOpacity 
                    style={styles.practiceButton}
                    onPress={() => handlePracticeCategory(group.level)}
                    activeOpacity={0.8}
                  >
                    <Feather name="play" size={18} color="#FFFFFF" />
                    <Text style={styles.practiceButtonText}>
                      {t('practiceAgain') || 'Practice Again'}
                    </Text>
                    <Feather name="arrow-right" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </Animated.View>
          );
        })}
      </View>

      {/* Bottom Spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loading: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600' 
  },

  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    marginTop: 10,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    color: '#FFFFFF80',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Hero Stats Card
  heroStatsCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroStatsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  heroStatsLeft: {
    flex: 1,
  },
  heroStatsLabel: {
    color: '#FFFFFF80',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroStatsNumber: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -1,
  },
  heroStatsSubtext: {
    color: '#FFFFFF90',
    fontSize: 14,
    fontWeight: '600',
  },
  heroStatsIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStatsEmoji: {
    fontSize: 48,
  },

  // Categories Section
  categoriesSection: {
    paddingHorizontal: 20,
  },
  categoriesTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.3,
  },

  // Category Cards
  categoryCardContainer: {
    marginBottom: 20,
  },
  categoryCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  categoryHeaderText: {
    flex: 1,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  categorySubtitle: {
    color: '#FFFFFF80',
    fontSize: 14,
    fontWeight: '500',
  },

  // Progress Bar
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },

  // Words Preview
  wordsPreview: {
    marginBottom: 16,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  wordChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  moreWordsChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  moreWordsText: {
    color: '#FFFFFF80',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyWordsState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emptyWordsText: {
    color: '#FFFFFF80',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Practice Button
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  practiceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});


