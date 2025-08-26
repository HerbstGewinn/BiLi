import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import GermanyFlag from '../components/flags/GermanyFlag';
import RussiaFlag from '../components/flags/RussiaFlag';
import { useAppLanguage } from '../context/AppLanguageContext';
import BackButton from '../components/BackButton';

const Card = ({ title, onPress, left, right }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.cardShadow}>
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.card}>
      <View style={styles.flagsRow}>
        {left}
        <Text style={styles.cardText}>{title}</Text>
        {right}
      </View>
    </Animated.View>
  </TouchableOpacity>
);

export default function LanguageSelectionScreen({ navigation }) {
  const { t, setDirection } = useAppLanguage();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <BackButton onPress={() => navigation.goBack()} />
      <Animated.Text entering={FadeIn.duration(400)} style={styles.header}>
        {t('chooseDirection')}
      </Animated.Text>

      <View style={styles.cardsWrap}>
        <Card
          title={t('germanToRussian')}
          left={<GermanyFlag />}
          right={<RussiaFlag />}
          onPress={() => { setDirection('de-ru'); navigation.navigate('LevelSelection'); }}
        />
        <Card
          title={t('russianToGerman')}
          left={<RussiaFlag />}
          right={<GermanyFlag />}
          onPress={() => { setDirection('ru-de'); navigation.navigate('LevelSelection'); }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 80, paddingBottom: 40 },
  header: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardsWrap: { gap: 16 },
  cardShadow: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  flagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flag: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff' },
  cardText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
});


