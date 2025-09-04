import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function FlashcardRatingButton({ 
  level, 
  label, 
  color, 
  icon, 
  onPress, 
  selected = false 
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    onPress(level);
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: selected ? color : `${color}20`,
          borderColor: color,
        },
        animatedStyle
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Feather 
          name={icon} 
          size={24} 
          color={selected ? '#FFFFFF' : color} 
        />
      </View>
      <Text style={[
        styles.label, 
        { color: selected ? '#FFFFFF' : color }
      ]}>
        {label}
      </Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
