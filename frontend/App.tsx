// @ts-nocheck
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import RootNavigation from './src/navigation/RootNavigation';
import './global.css';
import { LogBox, StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

LogBox.ignoreLogs(['ImageBackground is deprecated']);

function AppContent() {
  const { theme, isDark } = useTheme();


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
        animated={true}
      />
      <NavigationContainer>
        <RootNavigation />
      </NavigationContainer>
    </SafeAreaView>
  );
}

function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default App;