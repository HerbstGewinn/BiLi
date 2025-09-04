import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFlashcards } from '../context/FlashcardContext';
import { useAppLanguage } from '../context/AppLanguageContext';
import FlashcardRatingGrid from '../components/FlashcardRatingGrid';

const { width } = Dimensions.get('window');

export default function PracticeModeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { masteryLevel } = route.params || {};
  
  const { getProgressByMastery, saveFlashcardProgress, loading } = useFlashcards();
  const { t } = useAppLanguage();
  
  const [practiceCards, setPracticeCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [practiceLoading, setPracticeLoading] = useState(false);

  // Get mastery level name for display
  const getMasteryLevelName = (level) => {
    const levelNames = {
      5: t('perfect') || 'Perfect',
      4: t('good') || 'Good', 
      3: t('ok') || 'OK',
      2: t('difficult') || 'Difficult',
      1: t('needHelp') || 'Need Help'
    };
    return levelNames[level] || 'Unknown';
  };

  // Load practice cards for this mastery level
  useEffect(() => {
    if (masteryLevel) {
      const cards = getProgressByMastery(masteryLevel);
      setPracticeCards(cards);
      setCurrentCardIndex(0);
      setShowTranslation(false);
      setIsFlipped(false);
    }
  }, [masteryLevel, getProgressByMastery]);

  const currentCard = practiceCards[currentCardIndex];

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    setShowTranslation(!showTranslation);
  };

  const handleRating = async (newMasteryLevel) => {
    if (!currentCard) return;

    setPracticeLoading(true);
    try {
      // Create word data object from the current card
      const wordData = {
        from: currentCard.word_from,
        to: currentCard.word_to,
        exampleFrom: currentCard.example_from,
        exampleTo: currentCard.example_to,
        day: currentCard.day_number
      };

      const { data, error } = await saveFlashcardProgress(wordData, newMasteryLevel);
      
      if (error) {
        console.error('Error updating flashcard:', error);
        Alert.alert(
          t('error') || 'Error',
          t('saveError') || 'Failed to save progress'
        );
        return;
      }

      // Remove current card from practice list since it's been re-sorted
      const newPracticeCards = practiceCards.filter((_, index) => index !== currentCardIndex);
      setPracticeCards(newPracticeCards);

      // Move to next card or go back if no more cards
      if (newPracticeCards.length === 0) {
        // No more cards in this mastery level
        Alert.alert(
          t('practiceComplete') || 'Practice Complete!',
          t('allWordsReviewed') || 'You have reviewed all words in this category.',
          [
            {
              text: t('ok') || 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        // Adjust index if we're at the end
        if (currentCardIndex >= newPracticeCards.length) {
          setCurrentCardIndex(0);
        }
        setShowTranslation(false);
        setIsFlipped(false);
      }

      // Show success message
      const masteryNames = {
        5: t('perfect') || 'Perfect',
        4: t('good') || 'Good',
        3: t('ok') || 'OK', 
        2: t('difficult') || 'Difficult',
        1: t('needHelp') || 'Need Help'
      };

      Alert.alert(
        t('wordMoved') || 'Word Moved!',
        `"${currentCard.word_from}" ${t('movedTo') || 'moved to'} ${masteryNames[newMasteryLevel]}`
      );

    } catch (error) {
      console.error('Error in handleRating:', error);
      Alert.alert(
        t('error') || 'Error',
        t('saveError') || 'Failed to save progress'
      );
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < practiceCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowTranslation(false);
      setIsFlipped(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowTranslation(false);
      setIsFlipped(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>
              {t('loading') || 'Loading...'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!practiceCards.length) {
    return (
      <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {t('practiceMode') || 'Practice Mode'}
            </Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
            <Text style={styles.emptyTitle}>
              {t('noWordsToReview') || 'No Words to Review'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t('allWordsCompleted') || 'All words in this category have been completed!'}
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backToGalleryButton}>
              <Text style={styles.backToGalleryText}>
                {t('backToGallery') || 'Back to Gallery'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {t('practiceMode') || 'Practice Mode'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {getMasteryLevelName(masteryLevel)} • {currentCardIndex + 1}/{practiceCards.length}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentCardIndex + 1) / practiceCards.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Flashcard */}
        <View style={styles.cardContainer}>
          <TouchableOpacity 
            onPress={handleFlipCard} 
            style={[styles.flashcard, isFlipped && styles.flashcardFlipped]}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              {!showTranslation ? (
                // Front of card - source language
                <View style={styles.cardSide}>
                  <Text style={styles.cardLanguage}>
                    {currentCard?.language_direction?.split('-')[0]?.toUpperCase()}
                  </Text>
                  <Text style={styles.cardWord}>{currentCard?.word_from}</Text>
                  <Text style={styles.cardExample}>{currentCard?.example_from}</Text>
                </View>
              ) : (
                // Back of card - target language
                <View style={styles.cardSide}>
                  <Text style={styles.cardLanguage}>
                    {currentCard?.language_direction?.split('-')[1]?.toUpperCase()}
                  </Text>
                  <Text style={styles.cardWord}>{currentCard?.word_to}</Text>
                  <Text style={styles.cardExample}>{currentCard?.example_to}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.flipIndicator}>
              <Ionicons name="refresh" size={20} color="#FFFFFF80" />
              <Text style={styles.flipText}>
                {t('tapToFlip') || 'Tap to flip'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigationControls}>
          <TouchableOpacity 
            onPress={handlePreviousCard}
            style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
            disabled={currentCardIndex === 0}
          >
            <Ionicons name="chevron-back" size={24} color={currentCardIndex === 0 ? "#FFFFFF40" : "#FFFFFF"} />
          </TouchableOpacity>

          <Text style={styles.cardCounter}>
            {currentCardIndex + 1} / {practiceCards.length}
          </Text>

          <TouchableOpacity 
            onPress={handleNextCard}
            style={[styles.navButton, currentCardIndex === practiceCards.length - 1 && styles.navButtonDisabled]}
            disabled={currentCardIndex === practiceCards.length - 1}
          >
            <Ionicons name="chevron-forward" size={24} color={currentCardIndex === practiceCards.length - 1 ? "#FFFFFF40" : "#FFFFFF"} />
          </TouchableOpacity>
        </View>

        {/* Rating Grid - Only show if card is flipped */}
        {showTranslation && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>
              {t('howWellKnow') || 'How well do you know this word?'}
            </Text>
            <FlashcardRatingGrid
              onRating={handleRating}
              disabled={practiceLoading}
            />
          </View>
        )}

        {/* Loading Overlay */}
        {practiceLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>
              {t('updating') || 'Updating...'}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF80',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#FFFFFF20',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  flashcard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    minHeight: 280,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  flashcardFlipped: {
    backgroundColor: '#F8F9FF',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardSide: {
    alignItems: 'center',
  },
  cardLanguage: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C63FF',
    letterSpacing: 1,
    marginBottom: 16,
  },
  cardWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  cardExample: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  flipIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  flipText: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 4,
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  navButton: {
    padding: 12,
    backgroundColor: '#FFFFFF20',
    borderRadius: 12,
  },
  navButtonDisabled: {
    backgroundColor: '#FFFFFF10',
  },
  cardCounter: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ratingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#FFFFFF80',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backToGalleryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToGalleryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
});