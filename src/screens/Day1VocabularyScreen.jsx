import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAppLanguage } from '../context/AppLanguageContext';

const words = [
  { de: 'Hallo', ru: 'Привет', exampleDe: 'Hallo, wie geht es dir?', exampleRu: 'Привет, как дела?' },
  { de: 'Danke', ru: 'Спасибо', exampleDe: 'Danke schön!', exampleRu: 'Большое спасибо!' },
  { de: 'Bitte', ru: 'Пожалуйста', exampleDe: 'Bitte sehr.', exampleRu: 'Пожалуйста.' },
  { de: 'Ja', ru: 'Да', exampleDe: 'Ja, gerne.', exampleRu: 'Да, с удовольствием.' },
  { de: 'Nein', ru: 'Нет', exampleDe: 'Nein, danke.', exampleRu: 'Нет, спасибо.' },
];

export default function Day1VocabularyScreen() {
  const { t, direction } = useAppLanguage();
  const leftLang = direction === 'de-ru' ? 'de' : 'ru';
  const rightLang = direction === 'de-ru' ? 'ru' : 'de';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.Text entering={FadeIn.duration(350)} style={styles.title}>
        {t('day1VocabTitle')}
      </Animated.Text>

      <View style={styles.list}>
        {words.map((w, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.wordPrimary}>{w[leftLang]}</Text>
              <Text style={styles.wordSecondary}>{w[rightLang]}</Text>
            </View>
            <View style={styles.example}>
              <Text style={styles.exampleLabel}>{t('example')}:</Text>
              <Text style={styles.exampleText}>
                {leftLang === 'de' ? w.exampleDe : w.exampleRu}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 80, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
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
});


