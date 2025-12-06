import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import ErrorBoundary from '../components/ErrorBoundary';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import BioDataScreen from '../screens/auth/BioDataScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CameraScanScreen from '../screens/camera/CameraScanScreen';
import TextQueryScreen from '../screens/identifier/TextQueryScreen';
import MedicineInfoScreen from '../screens/identifier/MedicineInfoScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

import { RootStackParamList } from '../types';
import storageService from '../services/storageService';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const firstLaunch = await storageService.checkFirstLaunch();
      setIsFirstLaunch(firstLaunch);

      if (!firstLaunch) {
        const session = await storageService.getSession();
        setIsLoggedIn(session?.isLoggedIn || false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isFirstLaunch ? 'Onboarding' : (isLoggedIn ? 'Dashboard' : 'Login')}
          screenOptions={{
            headerStyle: { backgroundColor: '#3B82F6' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          {/* Onboarding */}
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen} 
            options={{ headerShown: false }} 
          />

          {/* Auth Screens */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ title: 'Create Account' }}
          />
          <Stack.Screen
            name="BioData"
            component={BioDataScreen}
            options={{ title: 'Health Information' }}
          />

          {/* Main App Screens */}
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen 
            name="Camera" 
            component={CameraScanScreen} 
            options={{ headerShown: false }} 
          />

          <Stack.Screen name="TextQuery" component={TextQueryScreen} options={{ title: 'Text Search' }} />
          <Stack.Screen name="MedicineInfo" component={MedicineInfoScreen} options={{ title: 'Medicine Details' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
