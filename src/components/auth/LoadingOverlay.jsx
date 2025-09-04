import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoadingOverlay({ visible = false, message = 'Loading...' }) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(107, 99, 255, 0.95)', 'rgba(75, 60, 250, 0.95)']}
          style={styles.container}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.message}>{message}</Text>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 160,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
});
