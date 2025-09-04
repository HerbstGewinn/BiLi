import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  ...props
}) {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  if (isPrimary) {
    return (
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.disabledButton]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={isDisabled ? ['#9CA3AF', '#6B7280'] : ['#FFFFFF', '#F3F4F6']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            {loading ? (
              <ActivityIndicator size="small" color={isDisabled ? '#FFFFFF' : '#4B3CFA'} />
            ) : (
              <Text style={[styles.primaryText, isDisabled && styles.disabledText]}>
                {title}
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, styles.secondaryButton, isDisabled && styles.disabledButton]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={[styles.secondaryText, isDisabled && styles.disabledSecondaryText]}>
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B3CFA',
    textAlign: 'center',
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disabledText: {
    color: '#FFFFFF',
  },
  disabledSecondaryText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
