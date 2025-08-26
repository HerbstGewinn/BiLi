import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function BackButton({ onPress }) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={onPress} style={styles.btn} activeOpacity={0.9}>
        <Feather name="arrow-left" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 48, left: 16, zIndex: 10 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
});


