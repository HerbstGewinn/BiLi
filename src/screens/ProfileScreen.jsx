import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppLanguage } from '../context/AppLanguageContext';

export default function ProfileScreen() {
  const { t, language, direction } = useAppLanguage();
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{t('profile')}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>{t('motherTongue')}</Text>
        <Text style={styles.value}>{language === 'de' ? t('german') : t('russian')}</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>{t('learningDirection')}</Text>
        <Text style={styles.value}>{direction === 'de-ru' ? t('germanToRussian') : t('russianToGerman')}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary}>
          <Text style={styles.btnText}>{t('editProfile')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary}>
          <Text style={styles.btnText}>{t('changeMotherTongue')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary}>
          <Text style={styles.btnText}>{t('changeDirection')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGhost}>
          <Text style={styles.btnGhostText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingVertical: 40, paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: 16,
  },
  label: { color: '#CFCBFF', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { color: '#fff', fontSize: 16, fontWeight: '700' },
  actions: { marginTop: 20, gap: 12 },
  btnPrimary: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  btnSecondary: { backgroundColor: 'transparent', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnGhost: { alignItems: 'center', paddingVertical: 10 },
  btnGhostText: { color: '#E4DFFF', fontSize: 14, fontWeight: '700' },
});


