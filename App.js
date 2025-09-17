import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator as createStack } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import CustomTabBar from './src/components/CustomTabBar.jsx';
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';
import LevelSelectionScreen from './src/screens/LevelSelectionScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MotherTongueScreen from './src/screens/MotherTongueScreen';
import { AppLanguageProvider } from './src/context/AppLanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { FlashcardProvider } from './src/context/FlashcardContext';
import AuthGuard from './src/components/AuthGuard';
import VocabularyScreen from './src/screens/VocabularyScreen.jsx';
import VocabularyGalleryScreen from './src/screens/VocabularyGalleryScreen.jsx';
import PracticeModeScreen from './src/screens/PracticeModeScreen.jsx';
import VoiceAIScreen from './src/screens/VoiceAIScreen.jsx';
// Auth screens
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import SignInScreen from './src/screens/auth/SignInScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
// Onboarding screens
import OnboardingWelcomeScreen from './src/screens/onboarding/OnboardingWelcomeScreen';
import MotherTongueSelectionScreen from './src/screens/onboarding/MotherTongueSelectionScreen';
import LearningDirectionSelectionScreen from './src/screens/onboarding/LearningDirectionSelectionScreen';
import OnboardingLevelSelectionScreen from './src/screens/onboarding/OnboardingLevelSelectionScreen';
import OnboardingCompleteScreen from './src/screens/onboarding/OnboardingCompleteScreen';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const OnboardingStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStackNav = createStack();
const GalleryStackNav = createStack();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
      })}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Gallery" component={GalleryStack} options={{ headerShown: false }} />
      <Tab.Screen name="VoiceAI" component={VoiceAIScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackNav.Screen name="Vocabulary" component={VocabularyScreen} />
      <HomeStackNav.Screen name="PracticeMode" component={PracticeModeScreen} />
    </HomeStackNav.Navigator>
  );
}

function GalleryStack() {
  return (
    <GalleryStackNav.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <GalleryStackNav.Screen name="GalleryMain" component={VocabularyGalleryScreen} />
      <GalleryStackNav.Screen name="PracticeMode" component={PracticeModeScreen} />
    </GalleryStackNav.Navigator>
  );
}

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingFlow() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <OnboardingStack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
      <OnboardingStack.Screen name="MotherTongueSelection" component={MotherTongueSelectionScreen} />
      <OnboardingStack.Screen name="LearningDirectionSelection" component={LearningDirectionSelectionScreen} />
      <OnboardingStack.Screen name="LevelSelection" component={OnboardingLevelSelectionScreen} />
      <OnboardingStack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </OnboardingStack.Navigator>
  );
}

function MainApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="Main" component={Tabs} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppLanguageProvider>
      <AuthProvider>
        <FlashcardProvider>
          <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
            <NavigationContainer theme={AppTheme}>
                          <AuthGuard 
              authScreens={<AuthFlow />} 
              onboardingScreens={<OnboardingFlow />}
            >
              <MainApp />
            </AuthGuard>
            </NavigationContainer>
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
          </LinearGradient>
        </FlashcardProvider>
      </AuthProvider>
    </AppLanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
