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
  name: z.string().optional(),
  dateOfBirth: z.string().optional(),
  age: z.number().optional(),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
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
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSION);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Onboarding
  async checkFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED);
      return hasLaunched === null;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return false;
    }
  }

  async setLaunched(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED, 'true');
    } catch (error) {
      console.error('Error setting launched flag:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PASSWORD);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear data');
    }
  }
}

export default new StorageService();
