import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAppLanguage } from '../context/AppLanguageContext';
import BackButton from '../components/BackButton';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const levels = ['A1', 'A2', 'B1', 'B2'];

export default function LevelSelectionScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onSelect = (level) => {
    setSelected(level);
    scale.value = withTiming(1.03, { duration: 120 }, () => {
      scale.value = withTiming(1, { duration: 120 });
    });
    setTimeout(() => navigation.replace('Main'), 260);
  };

  const { t } = useAppLanguage();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.title}>{t('selectLevel')}</Text>
      <View style={styles.list}>
        {levels.map((level) => {
          const isSelected = selected === level;
          return (
            <Animated.View key={level} style={[styles.itemWrap, isSelected && styles.itemWrapSelected, animatedStyle]}>
              <TouchableOpacity onPress={() => onSelect(level)} style={[styles.item, isSelected && styles.itemSelected]}>
                <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{level}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  list: { gap: 16 },
  itemWrap: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  itemWrapSelected: { shadowColor: '#6C63FF', shadowOpacity: 0.8, shadowRadius: 16, elevation: 12 },
  item: { paddingVertical: 16, alignItems: 'center', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  itemSelected: { borderColor: '#BBACFF' },
  itemText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  itemTextSelected: { color: '#ffffff' },
});


