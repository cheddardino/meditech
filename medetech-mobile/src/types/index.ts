export interface User {
  username: string;
  password?: string;
}

export interface UserProfile {
  name?: string;
  dateOfBirth?: string;
  age?: number;
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
}

export interface Session {
  isLoggedIn: boolean;
  username: string;
}

export interface MedicineInfo {
  name: string;
  genericName?: string;
  overview: string;
  usage: string;
  dosage: string;
  sideEffects: string[];
  contraindications: string[];
  brandNames: string[];
  disclaimer: string;
  analysis_notes?: string;
  confidence?: 'high' | 'medium' | 'low';
  sources?: string[];
}

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  BioData: undefined;
  Dashboard: undefined;
  MedicineInfo: { medicineData: MedicineInfo };
  CameraScan: undefined;
  TextQuery: undefined;
  Profile: undefined;
  History: undefined;
  Onboarding: undefined;
  Camera: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
