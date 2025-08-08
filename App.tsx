import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthStack from './navigation/AuthStack';
import MainTabNavigator from './navigation/MainTabNavigator';
import { UserProvider, useUser } from './contexts/UserContext';

function AppContent() {
  const { isLoggedIn } = useUser();

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <StatusBar style="dark" />
        {isLoggedIn ? (
          <MainTabNavigator />
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </SafeAreaProvider>
  );
} 