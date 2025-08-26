import React, { createContext, useContext, useMemo, useState } from 'react';

const translations = {
  de: {
    welcome: 'Willkommen zurück bei BiLi!',
    chooseDirection: 'Wähle deine Sprachrichtung',
    selectLevel: 'Wähle dein angestrebtes Niveau',
    profile: 'Profil',
    profileSoon: 'Profil (bald verfügbar)',
    germanToRussian: 'Deutsch → Russisch',
    russianToGerman: 'Russisch → Deutsch',
    motherTongueTitle: 'Was ist deine Muttersprache?',
    german: 'Deutsch',
    russian: 'Russisch',
    learningDirection: 'Lernrichtung',
    motherTongue: 'Muttersprache',
    changeMotherTongue: 'Muttersprache ändern',
    changeDirection: 'Richtung ändern',
    editProfile: 'Profil bearbeiten',
    logout: 'Abmelden',
    day1VocabTitle: 'Tag 1 – Vokabeln',
    wordList: 'Wortliste',
    example: 'Beispiel',
    continue: 'Weiter',
    comingSoon: 'Demnächst verfügbar',
    day: 'Tag',
    vocabulary: 'Vokabeln',
    speaking: 'Sprechen',
    minutes: 'Min',
    wordsTitle: 'Wörter & Beispiele',
    flashcardsTitle: 'Karteikarten',
    startPractice: 'Üben starten',
    showAnswer: 'Antwort anzeigen',
    hideAnswer: 'Antwort verbergen',
    next: 'Weiter',
    previous: 'Zurück',
    iKnewThis: 'Ich wusste es',
    iNeedPractice: 'Ich brauche Übung',
  },
  ru: {
    welcome: 'С возвращением в BiLi!',
    chooseDirection: 'Выберите направление языка',
    selectLevel: 'Выберите желаемый уровень',
    profile: 'Профиль',
    profileSoon: 'Профиль (скоро)',
    germanToRussian: 'Немецкий → Русский',
    russianToGerman: 'Русский → Немецкий',
    motherTongueTitle: 'Какой у вас родной язык?',
    german: 'Немецкий',
    russian: 'Русский',
    learningDirection: 'Направление обучения',
    motherTongue: 'Родной язык',
    changeMotherTongue: 'Изменить родной язык',
    changeDirection: 'Изменить направление',
    editProfile: 'Редактировать профиль',
    logout: 'Выйти',
    day1VocabTitle: 'День 1 – Словарь',
    wordList: 'Список слов',
    example: 'Пример',
    continue: 'Далее',
    comingSoon: 'Скоро',
    day: 'День',
    vocabulary: 'Словарь',
    speaking: 'Разговор',
    minutes: 'мин',
    wordsTitle: 'Слова и примеры',
    flashcardsTitle: 'Флеш-карты',
    startPractice: 'Начать практику',
    showAnswer: 'Показать ответ',
    hideAnswer: 'Скрыть ответ',
    next: 'Далее',
    previous: 'Назад',
    iKnewThis: 'Я знал это',
    iNeedPractice: 'Нужно потренироваться',
  },
};

const AppLanguageContext = createContext({
  language: 'de',
  setLanguage: () => {},
  direction: 'de-ru',
  setDirection: () => {},
  level: 'A1',
  setLevel: () => {},
  t: (key) => key,
});

export function AppLanguageProvider({ children }) {
  const [language, setLanguage] = useState('de');
  const [direction, setDirection] = useState('de-ru');
  const [level, setLevel] = useState('A1');

  const value = useMemo(() => ({
    language,
    setLanguage,
    direction,
    setDirection,
    level,
    setLevel,
    t: (key) => translations[language]?.[key] ?? key,
  }), [language, direction, level]);

  return (
    <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>
  );
}

export function useAppLanguage() {
  return useContext(AppLanguageContext);
}


