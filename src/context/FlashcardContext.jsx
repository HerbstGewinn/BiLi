import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useAppLanguage } from './AppLanguageContext';

const FlashcardContext = createContext({
  flashcardProgress: [],
  loading: false,
  saveFlashcardProgress: async () => {},
  getProgressByMastery: () => [],
  getProgressForDay: () => [],
  updateFlashcardRating: async () => {},
  refreshProgress: async () => {},
});

export function FlashcardProvider({ children }) {
  const { user, isAuthenticated, userProfile } = useAuth();
  const { direction, level } = useAppLanguage();
  const [flashcardProgress, setFlashcardProgress] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user's flashcard progress from database
  const loadFlashcardProgress = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('language_direction', direction)
        .eq('learning_level', level)
        .order('last_practiced', { ascending: false });

      if (error) {
        console.error('Error loading flashcard progress:', error);
      } else {
        setFlashcardProgress(data || []);
      }
    } catch (error) {
      console.error('Error in loadFlashcardProgress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load progress when auth state or language settings change
  useEffect(() => {
    loadFlashcardProgress();
  }, [isAuthenticated, user, direction, level]);

  // Save or update flashcard progress
  const saveFlashcardProgress = async (wordData, masteryLevel) => {
    // Get user info directly without strict auth checks
    let currentUser, currentProfile;
    
    if (user && userProfile) {
      currentUser = user;
      currentProfile = userProfile;
    } else {
      // No user/profile in context, can't save flashcard progress
      console.error('No user or profile available for flashcard progress');
      return { error: 'User not authenticated' };
    }

    try {
      console.log('=== SAVING FLASHCARD PROGRESS ===');
      console.log('Current user:', currentUser?.id, currentUser?.email);
      console.log('Current profile:', currentProfile?.id, currentProfile?.email);
      console.log('Word data:', wordData);
      console.log('Mastery level:', masteryLevel);
      
      const flashcardData = {
        user_id: currentUser.id, // Use currentUser.id (auth.users.id) not currentProfile.id
        word_from: wordData.from,
        word_to: wordData.to,
        example_from: wordData.exampleFrom,
        example_to: wordData.exampleTo,
        language_direction: direction,
        learning_level: level,
        day_number: wordData.day || 1,
        mastery_level: masteryLevel,
        times_practiced: 1,
        last_practiced: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if this flashcard already exists
      const existingCard = flashcardProgress.find(
        card => 
          card.word_from === wordData.from &&
          card.word_to === wordData.to &&
          card.language_direction === direction &&
          card.learning_level === level &&
          card.day_number === (wordData.day || 1)
      );

      let result;
      if (existingCard) {
        // Update existing flashcard
        result = await supabase
          .from('flashcard_progress')
          .update({
            mastery_level: masteryLevel,
            times_practiced: existingCard.times_practiced + 1,
            last_practiced: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCard.id)
          .select()
          .single();
      } else {
        // Try to insert, if it fails due to duplicate, update instead
        try {
          result = await supabase
            .from('flashcard_progress')
            .insert(flashcardData)
            .select()
            .single();
        } catch (insertError) {
          if (insertError.code === '23505') {
            // Duplicate key error, try to update instead
            result = await supabase
              .from('flashcard_progress')
              .update({
                mastery_level: masteryLevel,
                times_practiced: 1,
                last_practiced: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', currentUser.id)
              .eq('word_from', wordData.from)
              .eq('word_to', wordData.to)
              .eq('language_direction', direction)
              .eq('learning_level', level)
              .eq('day_number', wordData.day || 1)
              .select()
              .single();
          } else {
            throw insertError;
          }
        }
      }

      if (result.error) {
        console.error('Error saving flashcard progress:', result.error);
        return { error: result.error };
      }

      // Update local state
      if (existingCard) {
        setFlashcardProgress(prev => 
          prev.map(card => 
            card.id === existingCard.id ? result.data : card
          )
        );
      } else {
        setFlashcardProgress(prev => [result.data, ...prev]);
      }

      console.log('Flashcard progress saved successfully:', result.data);
      console.log('=== SAVE FLASHCARD COMPLETE ===');
      return { data: result.data };
    } catch (error) {
      console.error('Error in saveFlashcardProgress:', error);
      console.error('Full error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      console.log('=== SAVE FLASHCARD FAILED ===');
      return { error };
    }
  };

  // Update flashcard rating
  const updateFlashcardRating = async (flashcardId, newMasteryLevel) => {
    if (!isAuthenticated || !user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('flashcard_progress')
        .update({
          mastery_level: newMasteryLevel,
          last_practiced: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', flashcardId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating flashcard rating:', error);
        return { error };
      }

      // Update local state
      setFlashcardProgress(prev => 
        prev.map(card => 
          card.id === flashcardId ? data : card
        )
      );

      return { data };
    } catch (error) {
      console.error('Error in updateFlashcardRating:', error);
      return { error };
    }
  };

  // Get progress by mastery level for gallery
  const getProgressByMastery = (masteryLevel) => {
    return flashcardProgress.filter(card => card.mastery_level === masteryLevel);
  };

  // Get progress for specific day
  const getProgressForDay = (dayNumber) => {
    return flashcardProgress.filter(card => card.day_number === dayNumber);
  };

  // Refresh progress from database
  const refreshProgress = async () => {
    await loadFlashcardProgress();
  };

  // Get statistics
  const getStatistics = () => {
    const stats = {
      total: flashcardProgress.length,
      perfect: getProgressByMastery(5).length, // 5 = perfect
      good: getProgressByMastery(4).length,    // 4 = good
      ok: getProgressByMastery(3).length,      // 3 = ok
      difficult: getProgressByMastery(2).length, // 2 = difficult
      needHelp: getProgressByMastery(1).length,   // 1 = need help
    };
    return stats;
  };

  const value = {
    flashcardProgress,
    loading,
    saveFlashcardProgress,
    getProgressByMastery,
    getProgressForDay,
    updateFlashcardRating,
    refreshProgress,
    getStatistics,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
}
