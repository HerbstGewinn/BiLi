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
import VocabularyScreen from './src/screens/VocabularyScreen.jsx';
import VocabularyGalleryScreen from './src/screens/VocabularyGalleryScreen.jsx';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStackNav = createStack();

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
      <Tab.Screen name="Gallery" component={VocabularyGalleryScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackNav.Screen name="Vocabulary" component={VocabularyScreen} />
    </HomeStackNav.Navigator>
  );
}

export default function App() {
  return (
    <AppLanguageProvider>
      <LinearGradient colors={['#6C63FF', '#4B3CFA']} style={styles.container}>
        <NavigationContainer theme={AppTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name="MotherTongue" component={MotherTongueScreen} />
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
            <Stack.Screen name="Main" component={Tabs} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </LinearGradient>
    </AppLanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
