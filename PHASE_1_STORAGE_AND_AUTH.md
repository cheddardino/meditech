# Phase 1: Storage Service & Authentication Screens

**Goal:** Implement AsyncStorage service and create all authentication screens (Login, Signup, BioData).

**Estimated Time:** 30-40 minutes

**Prerequisites:** Phase 0 completed successfully

---

## Instructions for AI

Now that our project is set up, let's build the storage layer and authentication flow.

### Step 1: Create Storage Service with Security & Validation

Create `src/services/storageService.ts`. We will use `SecureStore` for sensitive data (passwords, tokens) and `AsyncStorage` for non-sensitive data (profiles). We will also use `zod` for validation.

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { User, UserProfile, Session } from '../types';
import { STORAGE_KEYS } from '../constants';

// Validation Schemas
const UserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

const ProfileSchema = z.object({
  name: z.string().min(1),
  age: z.number().positive(),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
});

class StorageService {
  // User Management - SECURE
  async saveUser(username: string, password: string): Promise<void> {
    try {
      // Validate input
      UserSchema.parse({ username, password });
      
      // Store password securely
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_PASSWORD, password);
      // Store username normally
      await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, username);
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Failed to save user securely');
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const username = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
      const password = await SecureStore.getItemAsync(STORAGE_KEYS.USER_PASSWORD);
      
      if (username && password) {
        return { username, password };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async validateCredentials(username: string, password: string): Promise<boolean> {
    try {
      const storedUsername = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
      const storedPassword = await SecureStore.getItemAsync(STORAGE_KEYS.USER_PASSWORD);
      return storedUsername === username && storedPassword === password;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return false;
    }
  }

  // Profile Management - STANDARD
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      ProfileSchema.parse(profile);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
      throw new Error('Failed to save profile: Validation failed');
    }
  }

  async getProfile(): Promise<UserProfile | null> {
    try {
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  // Session Management - SECURE
  async saveSession(session: Session): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
      throw new Error('Failed to save session');
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const sessionData = await SecureStore.getItemAsync(STORAGE_KEYS.SESSION);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION);
    } catch (error) {
      console.error('Error clearing session:', error);
      throw new Error('Failed to clear session');
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear data');
    }
  }
}

export default new StorageService();
```

### Step 2: Create Reusable Components

#### 2.1 Button Component

Create `src/components/common/Button.tsx`:

```typescript
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500';
      case 'secondary':
        return 'bg-green-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${getVariantStyles()} px-6 py-4 rounded-lg ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white text-center font-semibold text-lg">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

#### 2.2 Input Component

Create `src/components/common/Input.tsx`:

```typescript
import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
      <TextInput
        className={`border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-lg px-4 py-3 text-base`}
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
```

### Step 3: Create Login Screen

Create `src/screens/auth/LoginScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import storageService from '../../services/storageService';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const isValid = await storageService.validateCredentials(username, password);
      
      if (isValid) {
        await storageService.saveSession({ isLoggedIn: true, username });
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mt-12 mb-8">
          <Text className="text-4xl font-bold text-blue-600">MEDetech</Text>
          <Text className="text-lg text-gray-600 mt-2">
            AI-Powered Medicine Identifier
          </Text>
        </View>

        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="Enter your username"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
        />

        <Button
          title="Login"
          onPress={handleLogin}
          loading={loading}
        />

        <View className="mt-4">
          <Button
            title="Create New Account"
            onPress={() => navigation.navigate('Signup')}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Step 4: Create Signup Screen

Create `src/screens/auth/SignupScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import storageService from '../../services/storageService';

export default function SignupScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const existingUser = await storageService.getUser();
      if (existingUser) {
        Alert.alert('Error', 'User already exists. Please login.');
        setLoading(false);
        return;
      }

      await storageService.saveUser(username, password);
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('BioData'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Signup failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mt-8 mb-6">
          <Text className="text-3xl font-bold text-blue-600">Create Account</Text>
          <Text className="text-gray-600 mt-2">
            Join MEDetech to identify medicines safely
          </Text>
        </View>

        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="Choose a username"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 6 characters"
        />

        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Re-enter your password"
        />

        <Button
          title="Sign Up"
          onPress={handleSignup}
          loading={loading}
        />

        <View className="mt-4">
          <Button
            title="Back to Login"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Step 5: Create BioData Screen

Create `src/screens/auth/BioDataScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import storageService from '../../services/storageService';

export default function BioDataScreen({ navigation }: any) {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const profile = {
        dateOfBirth: dateOfBirth || undefined,
        allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
        conditions: conditions ? conditions.split(',').map(c => c.trim()) : [],
      };

      await storageService.saveProfile(profile);
      
      const user = await storageService.getUser();
      if (user) {
        await storageService.saveSession({ isLoggedIn: true, username: user.username });
        navigation.replace('Dashboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    const user = await storageService.getUser();
    if (user) {
      await storageService.saveSession({ isLoggedIn: true, username: user.username });
      navigation.replace('Dashboard');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mt-8 mb-6">
          <Text className="text-3xl font-bold text-blue-600">
            Health Information
          </Text>
          <Text className="text-gray-600 mt-2">
            Optional: Help us provide personalized information
          </Text>
        </View>

        <Input
          label="Date of Birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
        />

        <Input
          label="Allergies"
          value={allergies}
          onChangeText={setAllergies}
          placeholder="e.g., Penicillin, Aspirin (comma separated)"
          multiline
        />

        <Input
          label="Pre-existing Conditions"
          value={conditions}
          onChangeText={setConditions}
          placeholder="e.g., Diabetes, Hypertension (comma separated)"
          multiline
        />

        <Button
          title="Save & Continue"
          onPress={handleSave}
          loading={loading}
        />

        <TouchableOpacity
          onPress={handleSkip}
          className="mt-4 py-3"
        >
          <Text className="text-center text-gray-600 text-base">
            Skip for Now
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## Testing Instructions

1. Create a basic navigation in `App.tsx` temporarily to test these screens
2. Test the signup flow: Create account → Fill bio data → Complete
3. Test the login flow: Login with created credentials
4. Verify data persists after app restart

---

## Verification Checklist

- [ ] StorageService created and working
- [ ] Button and Input components rendering correctly
- [ ] Login screen functional
- [ ] Signup screen functional
- [ ] BioData screen functional
- [ ] Data persists in AsyncStorage
- [ ] Navigation between auth screens works

---

## Next Phase

Once authentication is working, move to **Phase 2: Navigation & Dashboard**.