import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAppLanguage } from '../context/AppLanguageContext';
import BackButton from '../components/BackButton';

export default function MotherTongueScreen({ navigation }) {
  const { setLanguage, t } = useAppLanguage();

  const choose = (lang) => {
    setLanguage(lang);
    navigation.replace('LanguageSelection');
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Animated.Text entering={FadeIn.duration(400)} style={styles.title}>
        {t('motherTongueTitle')}
      </Animated.Text>
      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => choose('de')} style={[styles.btn, styles.btnPrimary]}>
          <Text style={styles.btnText}>{t('german')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => choose('ru')} style={styles.btn}>
          <Text style={styles.btnText}>{t('russian')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 80 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 28 },
  buttons: { gap: 16 },
  btn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  btnPrimary: { borderColor: '#BBACFF' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});


