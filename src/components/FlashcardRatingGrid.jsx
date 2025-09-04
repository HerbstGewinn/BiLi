import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppLanguage } from '../context/AppLanguageContext';
import FlashcardRatingButton from './FlashcardRatingButton';

const RATING_OPTIONS = [
  { 
    level: 5, 
    key: 'perfect', 
    icon: 'check-circle', 
    color: '#3A7AFE' 
  },
  { 
    level: 4, 
    key: 'good', 
    icon: 'thumbs-up', 
    color: '#2EC971' 
  },
  { 
    level: 3, 
    key: 'ok', 
    icon: 'meh', 
    color: '#F5C542' 
  },
  { 
    level: 2, 
    key: 'difficult', 
    icon: 'frown', 
    color: '#F39B2D' 
  },
  { 
    level: 1, 
    key: 'needHelp', 
    icon: 'x-circle', 
    color: '#7C3AED' 
  },
];

export default function FlashcardRatingGrid({ 
  onRating, 
  selectedRating = null,
  showInstruction = true 
}) {
  const { t } = useAppLanguage();
  const [tempSelection, setTempSelection] = useState(selectedRating);

  const handleRating = (level) => {
    setTempSelection(level);
    if (onRating) {
      onRating(level);
    }
  };

  return (
    <View style={styles.container}>
      {showInstruction && (
        <Text style={styles.instruction}>
          {t('rateYourKnowledge')}
        </Text>
      )}
      
      <View style={styles.topRow}>
        {RATING_OPTIONS.slice(0, 2).map((option) => (
          <FlashcardRatingButton
            key={option.level}
            level={option.level}
            label={t(option.key)}
            color={option.color}
            icon={option.icon}
            onPress={handleRating}
            selected={tempSelection === option.level}
          />
        ))}
      </View>
      
      <View style={styles.bottomRow}>
        {RATING_OPTIONS.slice(2).map((option) => (
          <FlashcardRatingButton
            key={option.level}
            level={option.level}
            label={t(option.key)}
            color={option.color}
            icon={option.icon}
            onPress={handleRating}
            selected={tempSelection === option.level}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
