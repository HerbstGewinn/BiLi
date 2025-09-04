import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  ...props
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Feather
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});
