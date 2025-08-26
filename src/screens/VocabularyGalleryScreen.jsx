import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BackButton from '../components/BackButton';

const groups = [
  { key: 'perfect', title: 'Perfect', color: '#3A7AFE' },
  { key: 'good', title: 'Good', color: '#2EC971' },
  { key: 'mid', title: 'Mid', color: '#F5C542' },
  { key: 'bad', title: 'Bad', color: '#F39B2D' },
  { key: 'none', title: 'Not at all', color: '#7C3AED' },
];

export default function VocabularyGalleryScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Gallery</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
        {groups.map((g) => (
          <View key={g.key} style={[styles.groupCard, { borderColor: g.color }]}> 
            <Text style={[styles.groupTitle, { color: g.color }]}>{g.title}</Text>
            <View style={styles.items}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <View key={idx} style={styles.item}>
                  <Text style={styles.itemFrom}>Wort {idx + 1}</Text>
                  <Text style={styles.itemTo}>Перевод {idx + 1}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 80, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  groupCard: {
    width: 280,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
  },
  groupTitle: { fontSize: 16, fontWeight: '900', marginBottom: 10 },
  items: { gap: 8 },
  item: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10 },
  itemFrom: { color: '#fff', fontSize: 14, fontWeight: '800' },
  itemTo: { color: '#E8E6FF', fontSize: 13, fontWeight: '600' },
});


