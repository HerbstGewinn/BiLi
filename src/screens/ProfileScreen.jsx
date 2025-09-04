import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAppLanguage } from '../context/AppLanguageContext';
import { useAuth } from '../context/AuthContext';
import { useFlashcards } from '../context/FlashcardContext';

const { width: screenWidth } = Dimensions.get('window');

// Progress Ring Component (simplified without SVG)
const ProgressRing = ({ progress, size = 80, color = '#FFD700' }) => {
  return (
    <View style={{ 
      width: size, 
      height: size, 
      borderRadius: size / 2,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 6,
      borderColor: progress > 70 ? color : progress > 40 ? '#ffa500' : '#ff6b6b'
    }}>
      <Text style={{ 
        color: '#FFFFFF', 
        fontSize: size * 0.25, 
        fontWeight: '800',
        letterSpacing: -0.5
      }}>
        {Math.round(progress)}%
      </Text>
    </View>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, gradient, delay = 0 }) => (
  <Animated.View entering={FadeInDown.delay(delay)} style={styles.statCard}>
    <LinearGradient colors={gradient} style={styles.statCardGradient}>
      <View style={styles.statCardHeader}>
        <MaterialIcons name={icon} size={24} color="#FFFFFF" />
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
      {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
    </LinearGradient>
  </Animated.View>
);

export default function ProfileScreen() {
  const { t, language, direction } = useAppLanguage();
  const { user, userProfile, signOut, updateProfile } = useAuth();
  const { getStatistics, flashcardProgress } = useFlashcards();
  const [updating, setUpdating] = useState(false);

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    const basicStats = getStatistics();
    const totalWords = basicStats.total;
    
    // Calculate learning streak (consecutive days with activity)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    let currentStreak = 0;
    
    // Get unique practice dates sorted by date (most recent first)
    const uniquePracticeDates = [...new Set(
      flashcardProgress.map(card => {
        const date = new Date(card.last_practiced);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      })
    )].sort((a, b) => b - a); // Sort descending (newest first)
    
    // Calculate current streak
    if (uniquePracticeDates.length > 0) {
      const mostRecentPractice = uniquePracticeDates[0];
      const daysSinceLastPractice = Math.floor((today.getTime() - mostRecentPractice) / msPerDay);
      
      // Only count streak if practiced today or yesterday (allowing for timezone differences)
      if (daysSinceLastPractice <= 1) {
        let checkDate = today.getTime();
        
        for (const practiceDate of uniquePracticeDates) {
          const daysDiff = Math.floor((checkDate - practiceDate) / msPerDay);
          
          // If this practice date is today or the expected previous day
          if (daysDiff <= 1) {
            currentStreak++;
            checkDate = practiceDate - msPerDay; // Move to check previous day
          } else {
            break; // Streak broken
          }
        }
      }
    }
    
    // Calculate mastery percentage
    const masteryPercentage = totalWords > 0 
      ? Math.round(((basicStats.perfect + basicStats.good) / totalWords) * 100)
      : 0;
    
    // Calculate total practice sessions
    const totalSessions = flashcardProgress.reduce((sum, card) => sum + (card.times_practiced || 0), 0);
    
    // Days since joining
    const joinDate = userProfile?.created_at ? new Date(userProfile.created_at) : new Date();
    const daysSinceJoining = Math.max(1, Math.floor((now - joinDate) / msPerDay));
    
    return {
      ...basicStats,
      currentStreak,
      masteryPercentage,
      totalSessions,
      daysSinceJoining,
      averageSessionsPerDay: Math.round((totalSessions / daysSinceJoining) * 10) / 10
    };
  }, [getStatistics, flashcardProgress, userProfile]);
  const handleLogout = () => {
    Alert.alert(
      t('confirmLogout'),
      t('confirmLogoutMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert(t('logoutError'), error.message);
            }
          },
        },
      ]
    );
  };

  const handleUpdateLanguageSettings = async () => {
    if (!userProfile) return;
    
    setUpdating(true);
    try {
      const { error } = await updateProfile({
        mother_tongue: language,
        learning_direction: direction,
      });
      
      if (error) {
        Alert.alert(t('updateError'), error.message);
      } else {
        Alert.alert(t('updateSuccess'), t('profileUpdated'));
      }
    } catch (error) {
      Alert.alert(t('updateError'), t('updateErrorGeneric'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Profile Header */}
      <Animated.View entering={FadeInUp.delay(100)}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#ff9a9e', '#fecfef']}
                style={styles.avatar}
              >
                <MaterialIcons name="person" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            {/* User Info */}
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>
                {userProfile?.username || user?.email?.split('@')[0] || 'BiLi Learner'}
              </Text>
              <Text style={styles.heroEmail}>{user?.email}</Text>
              <View style={styles.heroLanguages}>
                <View style={styles.languageTag}>
                  <Text style={styles.languageText}>
                    {userProfile?.mother_tongue === 'de' ? '🇩🇪' : '🇷🇺'} {t('motherTongue')}
                  </Text>
                </View>
                <Feather name="arrow-right" size={16} color="#FFFFFF80" />
                <View style={styles.languageTag}>
                  <Text style={styles.languageText}>
                    {direction === 'de-ru' ? '🇷🇺' : '🇩🇪'} {t('learning')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Progress Overview */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.progressSection}>
        <Text style={styles.sectionTitle}>📊 {t('learningProgress')}</Text>
        <View style={styles.progressOverview}>
          <View style={styles.progressMainCard}>
            <View style={styles.progressMainInfo}>
              <Text style={styles.progressMainLabel}>{t('masteryLevel')}</Text>
              <Text style={styles.progressMainValue}>{statistics.masteryPercentage}%</Text>
              <Text style={styles.progressMainSubtext}>
                {statistics.perfect + statistics.good} / {statistics.total} {t('words')}
              </Text>
            </View>
            <ProgressRing 
              progress={statistics.masteryPercentage} 
              size={80} 
              color="#FFD700" 
            />
          </View>
        </View>
      </Animated.View>

      {/* Statistics Grid */}
      <View style={styles.statsSection}>
        <Animated.Text entering={FadeInUp.delay(300)} style={styles.sectionTitle}>
          ⚡ {t('quickStats')}
        </Animated.Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="local-fire-department"
            title={t('currentStreak')}
            value={statistics.currentStreak}
            subtitle={t('days')}
            gradient={['#ff6b6b', '#ee5a52']}
            delay={100}
          />
          <StatCard
            icon="school"
            title={t('totalWords')}
            value={statistics.total}
            subtitle={t('learned')}
            gradient={['#4ecdc4', '#44a08d']}
            delay={200}
          />
          <StatCard
            icon="fitness-center"
            title={t('practiceSessions')}
            value={statistics.totalSessions}
            subtitle={t('completed')}
            gradient={['#a8edea', '#fed6e3']}
            delay={300}
          />
          <StatCard
            icon="trending-up"
            title={t('dailyAverage')}
            value={statistics.averageSessionsPerDay}
            subtitle={t('sessions')}
            gradient={['#ffeaa7', '#fab1a0']}
            delay={400}
          />
        </View>
      </View>

      {/* Mastery Breakdown */}
      <Animated.View entering={FadeInDown.delay(500)} style={styles.masterySection}>
        <Text style={styles.sectionTitle}>🎯 {t('masteryBreakdown')}</Text>
        <View style={styles.masteryCards}>
          {[
            { key: 'perfect', emoji: '🏆', color: '#667eea', count: statistics.perfect },
            { key: 'good', emoji: '👍', color: '#11998e', count: statistics.good },
            { key: 'ok', emoji: '😐', color: '#ffeaa7', count: statistics.ok },
            { key: 'difficult', emoji: '😅', color: '#fd79a8', count: statistics.difficult },
            { key: 'needHelp', emoji: '🆘', color: '#a29bfe', count: statistics.needHelp },
          ].map((item, index) => (
            <Animated.View 
              key={item.key} 
              entering={FadeInDown.delay(600 + index * 50)}
              style={styles.masteryCard}
            >
              <View style={styles.masteryCardContent}>
                <Text style={styles.masteryEmoji}>{item.emoji}</Text>
                <View style={styles.masteryInfo}>
                  <Text style={styles.masteryLabel}>{t(item.key)}</Text>
                  <Text style={styles.masteryCount}>{item.count} {t('words')}</Text>
                </View>
                <View style={[styles.masteryIndicator, { backgroundColor: item.color }]} />
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View entering={FadeInUp.delay(700)} style={styles.actionsSection}>
        <TouchableOpacity 
          style={[styles.primaryActionButton, updating && styles.buttonDisabled]} 
          onPress={handleUpdateLanguageSettings}
          disabled={updating}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.primaryActionGradient}
          >
            <MaterialIcons 
              name={updating ? "sync" : "sync"} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.primaryActionText}>
              {updating ? t('updating') : t('syncSettings')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryActionButton}>
          <Feather name="edit-2" size={18} color="#FFFFFF" />
          <Text style={styles.secondaryActionText}>{t('editProfile')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#ff6b6b" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </Animated.View>

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

  // Hero Section
  heroCard: {
    marginHorizontal: 20,
    marginTop: 60,
    marginBottom: 24,
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
  heroContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroEmail: {
    color: '#FFFFFF80',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  heroLanguages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Progress Section
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  progressOverview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressMainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressMainInfo: {
    flex: 1,
  },
  progressMainLabel: {
    color: '#FFFFFF80',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressMainValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  progressMainSubtext: {
    color: '#FFFFFF70',
    fontSize: 12,
    fontWeight: '500',
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 52) / 2,
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    color: '#FFFFFF80',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statCardValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  statCardSubtitle: {
    color: '#FFFFFF70',
    fontSize: 11,
    fontWeight: '500',
  },

  // Mastery Section
  masterySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  masteryCards: {
    gap: 12,
  },
  masteryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  masteryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  masteryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  masteryInfo: {
    flex: 1,
  },
  masteryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  masteryCount: {
    color: '#FFFFFF70',
    fontSize: 13,
    fontWeight: '500',
  },
  masteryIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  secondaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  logoutText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});


