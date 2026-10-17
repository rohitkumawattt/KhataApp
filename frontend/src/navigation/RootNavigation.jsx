import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigation from './MainNavigation';
import AuthNavigation from './AuthNavigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainNavigation" component={MainNavigation} />
      ) : (
        <Stack.Screen name="AuthNavigation" component={AuthNavigation} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigation;
