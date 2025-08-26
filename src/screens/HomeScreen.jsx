import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppLanguage } from '../context/AppLanguageContext';

const days = Array.from({ length: 14 }).map((_, idx) => ({
  day: idx + 1,
  type: idx % 2 === 0 ? 'vocabulary' : 'speaking',
  icon: idx % 2 === 0 ? 'book' : 'mic',
  durationMin: idx % 2 === 0 ? null : 30,
}));

const Card = ({ item, isToday, onPress, t, language }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.cardShadow}>
    <View style={styles.card}>
      <View style={styles.progress}>
        <View style={[styles.dot, isToday && styles.dotActive]} />
      </View>
      <View style={styles.cardBody}>
        <Feather name={item.icon} size={20} color="#fff" />
        <Text style={styles.cardText}>
          {t('day')} {item.day} – {t(item.type)}
          {item.durationMin ? ` (${item.durationMin} ${t('minutes')})` : ''}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const { t, language } = useAppLanguage();
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      
      <Text style={styles.greeting}>{t('welcome')}</Text>
      <View style={styles.verticalList}>
        {days.map((item) => (
          <Card
            key={item.day}
            item={item}
            isToday={item.day === 1}
            t={t}
            language={language}
            onPress={() => {
              if (item.type === 'vocabulary' && item.day <= 5) {
                navigation.navigate('Vocabulary', { day: item.day });
              }
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingTop: 60, paddingBottom: 40, paddingHorizontal: 16 },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '700', paddingHorizontal: 16, marginBottom: 16 },
  verticalList: { gap: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)'
  },
  cardShadow: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  progress: { width: 8, backgroundColor: 'rgba(255,255,255,0.20)', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'transparent', marginTop: 12 },
  dotActive: { backgroundColor: '#BBACFF', width: 8, height: 8, borderRadius: 4 },
  cardBody: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});


