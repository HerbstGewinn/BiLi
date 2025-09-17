import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useOpenAiRtc } from '../services/useOpenAiRtc';

const { width, height } = Dimensions.get('window');

export default function VoiceAIScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const { connect, startRecording, stopRecording, close, status, sendEvent, onEvent } = useOpenAiRtc();

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Set up event listener for AI responses
    onEvent((event) => {
      console.log('AI Event:', event);
      if (event.type === 'response.audio.delta') {
        // Handle audio response
      } else if (event.type === 'response.text.delta') {
        // Handle text response
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.type === 'ai' && lastMessage.isStreaming) {
            return [...prev.slice(0, -1), {
              ...lastMessage,
              text: lastMessage.text + event.delta,
            }];
          } else {
            return [...prev, {
              type: 'ai',
              text: event.delta,
              isStreaming: true,
              timestamp: new Date(),
            }];
          }
        });
      } else if (event.type === 'response.text.done') {
        // Mark streaming as complete
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.type === 'ai' && lastMessage.isStreaming) {
            return [...prev.slice(0, -1), {
              ...lastMessage,
              isStreaming: false,
            }];
          }
          return prev;
        });
      }
    });

    return () => {
      close();
    };
  }, [fadeAnim, onEvent, close]);

  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const handleStart = async () => {
    console.log('[UI] handleStart called');
    try {
      await connect();
      console.log('[UI] connect() finished');
    } catch (e) {
      console.error('[UI] handleStart error:', e);
      Alert.alert('Connection Error', 'Failed to connect to OpenAI.');
    }
  };

  const handleMicPressIn = () => {
    setIsRecording(true);
    console.log('[UI] startRecording called');
    startRecording();
    
    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      text: '🎤 Speaking...',
      timestamp: new Date(),
    }]);
  };

  const handleMicPressOut = () => {
    setIsRecording(false);
    console.log('[UI] stopRecording called');
    stopRecording();
    
    // Update user message
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.type === 'user' && lastMessage.text === '🎤 Speaking...') {
        lastMessage.text = '🎤 Message sent';
      }
      return newMessages;
    });
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting': return 'Connecting...';
      case 'connected': return isRecording ? 'Listening...' : '';
      case 'error': return 'Connection error';
      default: return 'Tap to start conversation';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connecting': return '#667eea';
      case 'connected': return isRecording ? '#4CAF50' : '#E8E6FF';
      case 'error': return '#F44336';
      default: return '#E8E6FF';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Voice AI Assistant</Text>
        <Text style={styles.headerSubtitle}>Practice Speaking! 🎤</Text>
        <Text style={styles.headerDescription}>
          {Platform.OS === 'web' 
            ? 'Voice AI is not available in web browser. Use mobile app for full voice functionality.'
            : 'Talk to your AI language coach for pronunciation and conversation practice'
          }
        </Text>
      </View>

      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}> 
        {/* Features List */}
        <View style={styles.toolsList}>
          <Text style={styles.toolsTitle}>How it helps:</Text>
          <View style={styles.toolItem}><Text style={styles.toolText}>Pronunciation practice</Text></View>
          <View style={styles.toolItem}><Text style={styles.toolText}>Conversation skills</Text></View>
          <View style={styles.toolItem}><Text style={styles.toolText}>Real-time feedback</Text></View>
        </View>

        {/* Voice Agent Container */}
        <View style={styles.agentContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
          {status === 'connecting' ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.voiceButton,
                status === 'connected' && styles.voiceButtonConnected,
                isRecording && styles.voiceButtonRecording,
              ]}
              onPress={() => { console.log('[UI] Voice button pressed'); handleStart(); }}
              onPressIn={status === 'connected' ? handleMicPressIn : undefined}
              onPressOut={status === 'connected' ? handleMicPressOut : undefined}
              disabled={status === 'connecting'}
            >
              <Text style={styles.voiceButtonIcon}>
                {isRecording ? '🔴' : status === 'connected' ? '🎤' : '🎙️'}
              </Text>
              <Text style={styles.voiceButtonText}>
                {isRecording ? 'Release' : status === 'connected' ? 'Just start talking' : 'Start'}
              </Text>
            </TouchableOpacity>
          )}
          {status === 'connected' && (
            <TouchableOpacity style={styles.endButton} onPress={close}>
              <Text style={styles.endButtonText}>End Session</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Messages */}
        {messages.length > 0 && (
          <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
            {messages.map((message, index) => (
              <View key={index} style={[
                styles.messageContainer,
                message.type === 'user' ? styles.userMessage : styles.aiMessage
              ]}>
                <Text style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {message.text}
                </Text>
                {message.isStreaming && (
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 60,
    paddingBottom: 120,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#667eea',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  headerDescription: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  toolsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  toolsTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  toolItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolText: {
    fontSize: 14,
    color: '#fff',
  },
  agentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    flex: 1,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  voiceButtonConnected: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  voiceButtonRecording: {
    backgroundColor: '#F44336',
    shadowColor: '#F44336',
  },
  voiceButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  endButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  endButtonText: {
    color: '#E8E6FF',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContainer: {
    maxHeight: 200,
    width: '100%',
    marginTop: 20,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2D2D44',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#E8E6FF',
  },
  typingIndicator: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#667eea',
  },
});