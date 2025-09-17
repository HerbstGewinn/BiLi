import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAppLanguage } from '../context/AppLanguageContext';
import { useFlashcards } from '../context/FlashcardContext';
import BackButton from '../components/BackButton';
import FlashcardRatingGrid from '../components/FlashcardRatingGrid';
import { vocabularyContent } from '../content/vocabulary';

export default function VocabularyScreen({ route, navigation }) {
  const { t, direction, level, language } = useAppLanguage();
  const { saveFlashcardProgress } = useFlashcards();
  const day = route?.params?.day ?? 1;
  const [mode, setMode] = useState('list'); // 'list' | 'flashcards'
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentRating, setCurrentRating] = useState(null);

  const items = useMemo(() => {
    const lvl = vocabularyContent[level] ?? vocabularyContent['A1'];
    const dir = lvl?.[direction] ?? lvl?.['de-ru'];
    return dir?.[day] ?? [];
  }, [day, direction, level]);

  if (!items.length) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={styles.empty}>{t('comingSoon')}</Text>
      </View>
    );
  }

  const current = items[index] ?? items[0];

  const handleRating = async (rating) => {
    setCurrentRating(rating);
    
    try {
      const wordData = {
        ...current,
        day: day,
      };
      
      const { error } = await saveFlashcardProgress(wordData, rating);
      
      if (error) {
        Alert.alert(t('error'), t('errorSavingProgress'));
        return;
      }

      // Move to next flashcard after a short delay
      setTimeout(() => {
        const nextIndex = (index + 1) % items.length;
        setIndex(nextIndex);
        setShowAnswer(false);
        setCurrentRating(null);
        
        // If we've completed all cards, show completion message
        if (nextIndex === 0 && index === items.length - 1) {
          Alert.alert(
            t('congratulations'),
            t('completedAllCards'),
            [
              { text: t('continue'), onPress: () => navigation.goBack() }
            ]
          );
        }
      }, 1000);
    } catch (error) {
      console.error('Error saving flashcard progress:', error);
      Alert.alert(t('error'), t('errorSavingProgress'));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <BackButton onPress={() => navigation.goBack()} />
      <Animated.Text entering={FadeIn.duration(350)} style={styles.title}>
        {t('wordsTitle')}
      </Animated.Text>

      {mode === 'list' && (
        <View style={styles.list}>
          {items.map((w, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.wordPrimary}>{w.from}</Text>
                <Text style={styles.wordSecondary}>{w.to}</Text>
              </View>
              <View style={styles.example}>
                <Text style={styles.exampleLabel}>{t('example')}:</Text>
                <Text style={styles.exampleText}>{w.exampleFrom}</Text>
                <Text style={[styles.exampleText, { opacity: 0.8 }]}>{w.exampleTo}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {mode === 'list' ? (
        <TouchableOpacity style={styles.cta} onPress={() => setMode('flashcards')}>
          <Text style={styles.ctaText}>{t('startPractice')}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Animated.Text entering={FadeIn.duration(350)} style={[styles.title, { marginTop: 12 }]}>
            {t('flashcardsTitle')}
          </Animated.Text>
          <View style={styles.flashCard}>
            <Text style={styles.flashFront}>{current.from}</Text>
            {showAnswer && <Text style={styles.flashBack}>{current.to}</Text>}
            <TouchableOpacity style={styles.toggle} onPress={() => setShowAnswer((s) => !s)}>
              <Text style={styles.toggleText}>{showAnswer ? t('hideAnswer') : t('showAnswer')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.flashActions}>
            <TouchableOpacity
              style={[styles.smallBtn, { opacity: index > 0 ? 1 : 0.5 }]}
              disabled={index === 0}
              onPress={() => { setIndex((i) => Math.max(0, i - 1)); setShowAnswer(false); }}
            >
              <Text style={styles.smallBtnText}>{t('previous')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => { setIndex((i) => (i + 1) % items.length); setShowAnswer(false); }}
            >
              <Text style={styles.smallBtnText}>{t('next')}</Text>
            </TouchableOpacity>
          </View>
          {showAnswer && (
            <FlashcardRatingGrid
              onRating={handleRating}
              selectedRating={currentRating}
              showInstruction={true}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 80, paddingBottom: 120 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 16, flexWrap: 'wrap', flexShrink: 1 },
  empty: { color: '#fff', fontSize: 18, fontWeight: '700', flexWrap: 'wrap', flexShrink: 1, textAlign: 'center' },
  list: { gap: 12 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: 16,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  wordPrimary: { color: '#fff', fontSize: 18, fontWeight: '800', flexWrap: 'wrap', flexShrink: 1, flex: 1 },
  wordSecondary: { color: '#E8E6FF', fontSize: 16, fontWeight: '600', flexWrap: 'wrap', flexShrink: 1, flex: 1, textAlign: 'right' },
  example: { marginTop: 8 },
  exampleLabel: { color: '#CFCBFF', fontSize: 12, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8, flexWrap: 'wrap', flexShrink: 1 },
  exampleText: { color: '#fff', fontSize: 14, flexWrap: 'wrap', flexShrink: 1 },
  cta: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800', flexWrap: 'wrap', flexShrink: 1, textAlign: 'center' },
  flashCard: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', padding: 24, alignItems: 'center' },
  flashFront: { color: '#fff', fontSize: 22, fontWeight: '900', flexWrap: 'wrap', flexShrink: 1, textAlign: 'center' },
  flashBack: { color: '#E8E6FF', fontSize: 18, fontWeight: '700', marginTop: 8, flexWrap: 'wrap', flexShrink: 1, textAlign: 'center' },
  toggle: { marginTop: 12 },
  toggleText: { color: '#CFCBFF', fontSize: 14, fontWeight: '700', flexWrap: 'wrap', flexShrink: 1, textAlign: 'center' },
  flashActions: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  smallBtn: { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  smallBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', flexWrap: 'wrap', flexShrink: 1, textAlign: 'center' },

});


