# Phase 2: Navigation Setup & Dashboard Screen

**Goal:** Implement React Navigation and create the main dashboard screen.

**Estimated Time:** 25-30 minutes

**Prerequisites:** Phase 1 completed successfully

---

## Instructions for AI

Now let's set up proper navigation and create the main dashboard where users can choose what to do.

### Step 1: Create Error Boundary & Network Status

Before setting up navigation, let's ensure the app is resilient.

#### 1.1 Create `src/components/ErrorBoundary.tsx`
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center bg-white p-6">
          <Text className="text-xl font-bold text-red-600 mb-2">Oops! Something went wrong.</Text>
          <Text className="text-gray-600 text-center mb-6">We encountered an unexpected error.</Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-xl"
            onPress={() => this.setState({ hasError: false })}
          >
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Step 2: Create Navigation Structure

Create `src/navigation/AppNavigator.tsx`. Wrap the content in the `ErrorBoundary`.

```typescript
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
// These will be created in later phases
// import CameraScanScreen from '../screens/camera/CameraScanScreen';
// import TextQueryScreen from '../screens/identifier/TextQueryScreen';
// import MedicineInfoScreen from '../screens/identifier/MedicineInfoScreen';
// import ProfileScreen from '../screens/profile/ProfileScreen';

import { RootStackParamList } from '../types';
import storageService from '../services/storageService';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await storageService.getSession();
      setIsLoggedIn(session?.isLoggedIn || false);
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
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Dashboard' : 'Login'}
        screenOptions={{
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
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
        
        {/* Will be added in later phases */}
        {/* <Stack.Screen name="Camera" component={CameraScanScreen} options={{ title: 'Scan Medicine' }} /> */}
        {/* <Stack.Screen name="TextQuery" component={TextQueryScreen} options={{ title: 'Text Search' }} /> */}
        {/* <Stack.Screen name="MedicineInfo" component={MedicineInfoScreen} options={{ title: 'Medicine Details' }} /> */}
        {/* <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Step 2: Update App.tsx

Update `App.tsx` to use the navigator:

```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
```

### Step 3: Create Dashboard Screen Components

#### 3.1 Create Feature Card Component

Create `src/components/common/FeatureCard.tsx`:

```typescript
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  color?: string;
}

export default function FeatureCard({
  title,
  description,
  icon,
  onPress,
  color = 'bg-blue-500',
}: FeatureCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-gray-100"
      activeOpacity={0.7}
    >
      <View className={`${color} w-16 h-16 rounded-full items-center justify-center mb-4`}>
        <Text className="text-3xl">{icon}</Text>
      </View>
      <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
      <Text className="text-gray-600 leading-5">{description}</Text>
    </TouchableOpacity>
  );
}
```

#### 3.2 Create Dashboard Screen

Create `src/screens/dashboard/DashboardScreen.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatureCard from '../../components/common/FeatureCard';
import storageService from '../../services/storageService';
import { DISCLAIMER } from '../../constants';

export default function DashboardScreen({ navigation }: any) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const session = await storageService.getSession();
      if (session?.username) {
        setUsername(session.username);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleCameraScan = () => {
    // Will be implemented in Phase 3
    Alert.alert('Coming Soon', 'Camera scan feature will be available soon!');
    // navigation.navigate('Camera');
  };

  const handleTextQuery = () => {
    // Will be implemented in Phase 4
    Alert.alert('Coming Soon', 'Text query feature will be available soon!');
    // navigation.navigate('TextQuery');
  };

  const handleProfile = () => {
    // Will be implemented in Phase 5
    Alert.alert('Coming Soon', 'Profile feature will be available soon!');
    // navigation.navigate('Profile');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearSession();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 py-8 rounded-b-3xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-3xl font-bold">MEDetech</Text>
            <Text className="text-blue-100 text-lg mt-1">
              Welcome, {username}!
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleProfile}
            className="bg-blue-500 w-12 h-12 rounded-full items-center justify-center"
          >
            <Text className="text-white text-2xl">👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Disclaimer */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <Text className="text-yellow-800 text-sm leading-5">
            {DISCLAIMER}
          </Text>
        </View>

        {/* Feature Cards */}
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          How can I help you?
        </Text>

        <FeatureCard
          icon="📸"
          title="Scan Medicine"
          description="Use your camera to identify pills, capsules, or packaging"
          onPress={handleCameraScan}
          color="bg-blue-500"
        />

        <FeatureCard
          icon="🔍"
          title="Text Search"
          description="Search by medicine name or describe your symptoms"
          onPress={handleTextQuery}
          color="bg-green-500"
        />

        <FeatureCard
          icon="👤"
          title="My Profile"
          description="View and update your health information"
          onPress={handleProfile}
          color="bg-purple-500"
        />

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white border border-red-200 rounded-xl p-4 mb-8 mt-2"
        >
          <Text className="text-red-600 text-center font-semibold text-lg">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Step 4: Update Type Definitions

Update `src/types/index.ts` to include navigation types properly:

```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ... existing types ...

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  BioData: undefined;
  Dashboard: undefined;
  Camera: undefined;
  TextQuery: undefined;
  MedicineInfo: { medicineData: MedicineInfo };
  Profile: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
```

---

## Testing Instructions

1. Run `npx expo start` and open in Expo Go
2. Test the complete flow:
   - Create an account
   - Fill bio data (or skip)
   - See the dashboard
   - Close app completely
   - Reopen - should go directly to dashboard
3. Test logout functionality
4. Verify all three feature cards show "Coming Soon" alerts when tapped

---

## Verification Checklist

- [ ] Navigation properly set up
- [ ] Session persistence works (app remembers login)
- [ ] Dashboard displays correctly
- [ ] Feature cards are clickable
- [ ] Header shows username
- [ ] Profile icon in header exists
- [ ] Logout functionality works
- [ ] Disclaimer is visible
- [ ] Smooth transitions between screens

---

## Next Phase

Once navigation and dashboard work perfectly, move to **Phase 3: Camera & Gemini API**.