import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.footerBg} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = route.name === 'Home' ? 'home' : 
                          route.name === 'Gallery' ? 'layers' : 
                          route.name === 'VoiceAI' ? 'mic' : 'user';
          const color = isFocused ? '#D9D4FF' : '#FFFFFFAA';

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.9}>
              <Feather name={iconName} size={24} color={color} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    alignItems: 'center',
  },
  footerBg: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: '#23186B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  row: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 36,
  },
  tab: { padding: 12 },
});


