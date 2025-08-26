import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAppLanguage } from '../context/AppLanguageContext';
import BackButton from '../components/BackButton';
import { vocabularyContent } from '../content/vocabulary';

export default function VocabularyScreen({ route, navigation }) {
  const { t, direction, level, language } = useAppLanguage();
  const day = route?.params?.day ?? 1;
  const [mode, setMode] = useState('list'); // 'list' | 'flashcards'
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [ratings, setRatings] = useState({}); // index -> 1..5

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
          <View style={styles.ratingRow}>
            {[
              { key: 5, color: '#3A7AFE' }, // blue perfect
              { key: 4, color: '#2EC971' }, // green good
              { key: 3, color: '#F5C542' }, // yellow mid
              { key: 2, color: '#F39B2D' }, // orange bad
              { key: 1, color: '#7C3AED' }, // purple not at all
            ].map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.ratingBar, { backgroundColor: r.color, opacity: ratings[index] === r.key ? 1 : 0.7 }]}
                onPress={() => {
                  setRatings((old) => ({ ...old, [index]: r.key }));
                  setIndex((i) => (i + 1) % items.length);
                  setShowAnswer(false);
                }}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 80, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  empty: { color: '#fff', fontSize: 18, fontWeight: '700' },
  list: { gap: 12 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: 16,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wordPrimary: { color: '#fff', fontSize: 18, fontWeight: '800' },
  wordSecondary: { color: '#E8E6FF', fontSize: 16, fontWeight: '600' },
  example: { marginTop: 8 },
  exampleLabel: { color: '#CFCBFF', fontSize: 12, fontWeight: '700', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8 },
  exampleText: { color: '#fff', fontSize: 14 },
  cta: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  flashCard: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', padding: 24, alignItems: 'center' },
  flashFront: { color: '#fff', fontSize: 22, fontWeight: '900' },
  flashBack: { color: '#E8E6FF', fontSize: 18, fontWeight: '700', marginTop: 8 },
  toggle: { marginTop: 12 },
  toggleText: { color: '#CFCBFF', fontSize: 14, fontWeight: '700' },
  flashActions: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  smallBtn: { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  smallBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  ratingRow: { marginTop: 14, flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  ratingBar: { flex: 1, height: 18, borderRadius: 10 },
});


