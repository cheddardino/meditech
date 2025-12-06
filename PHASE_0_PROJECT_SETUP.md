# Phase 0: Project Initialization & Base Configuration

**Goal:** Set up the Expo project with all dependencies and basic configuration files.

**Estimated Time:** 15-20 minutes

---

## Instructions for AI

Please help me create a new Expo React Native project for MEDetech, a medicine identifier app. Follow these steps:

### Step 1: Project Initialization

Create the project structure with these commands:
```bash
npx create-expo-app medetech-mobile --template expo-template-blank-typescript
cd medetech-mobile
```

### Step 2: Install Core Dependencies

Install these packages:
```bash
# Camera & Image handling
npx expo install expo-camera expo-image-picker expo-file-system expo-image-manipulator

# Storage & Security
npx expo install @react-native-async-storage/async-storage expo-secure-store

# Validation
npm install zod

# Navigation
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Styling (NativeWind)
npm install nativewind
npm install --save-dev tailwindcss@3.3.2

# Text-to-Speech
npx expo install expo-speech

# Utilities
npx expo install expo-constants expo-status-bar
npm install axios

# Dev Tools (Linting & Formatting)
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-react
```

### Step 3: Configuration Files

#### 3.1 Create `tailwind.config.js`
```javascript
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};
```

#### 3.2 Update `babel.config.js`
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
```

#### 3.3 Create `tsconfig.json` (if not exists)
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

#### 3.4 Update `app.json`
```json
{
  "expo": {
    "name": "MEDetech Mobile",
    "slug": "medetech-mobile",
    "version": "1.0.0",
    "plugins": [
      "expo-secure-store"
    ]
// ...existing code...
```

#### 3.5 Create `.env` file
Create a `.env` file in the root directory to store sensitive keys. Never commit this file to version control.
```env
# API Keys
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

#### 3.6 Configure `.gitignore`
Ensure `.env` is ignored:
```text
node_modules/
.expo/
dist/
.env
*.jks
*.p12
*.key
*.mobileprovision
```
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.medetech.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.medetech.mobile",
      "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow MEDetech to access your camera to scan medicines."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

#### 3.5 Create `.gitignore`
```
node_modules/
.expo/
.expo-shared/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.env
.env.local
```

#### 3.6 Create `.env` file (empty for now)
```env
# Add your API keys here later
# EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

### Step 4: Create Base Folder Structure

Create these empty directories:
```
src/
├── components/
│   └── common/
├── screens/
│   ├── auth/
│   ├── camera/
│   ├── dashboard/
│   ├── identifier/
│   └── profile/
├── services/
├── hooks/
├── types/
├── constants/
└── utils/
```

### Step 5: Create Basic Type Definitions

Create `src/types/index.ts`:
```typescript
// User & Auth Types
export interface User {
  username: string;
  password: string;
}

export interface UserProfile {
  dateOfBirth?: string;
  allergies?: string[];
  conditions?: string[];
}

export interface Session {
  isLoggedIn: boolean;
  username: string;
}

// Medicine Types
export interface MedicineInfo {
  name: string;
  genericName?: string;
  overview: string;
  usage: string;
  dosage: string;
  sideEffects: string[];
  contraindications: string[];
  brandNames?: string[];
  sources?: string[];
}

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
```

### Step 6: Create Constants File

Create `src/constants/index.ts`:
```typescript
export const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  dark: '#1F2937',
  light: '#F3F4F6',
};

export const STORAGE_KEYS = {
  USER: '@medetech_user',
  PROFILE: '@medetech_profile',
  SESSION: '@medetech_session',
};

export const API_CONFIG = {
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  GEMINI_MODEL: 'gemini-2.0-flash-exp',
};

export const DISCLAIMER = `⚠️ MEDICAL DISCLAIMER: This app is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or qualified health provider.`;
```

### Step 7: Create a Basic App.tsx

Create/Update `App.tsx`:
```typescript
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-blue-600">
        MEDetech Mobile
      </Text>
      <Text className="text-gray-600 mt-2">
        Setup Complete ✓
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
```

### Step 8: Test the Setup

Run the development server:
```bash
npx expo start
```

Scan the QR code with Expo Go and verify you see "MEDetech Mobile - Setup Complete ✓"

---

## Verification Checklist

- [ ] Project created successfully
- [ ] All dependencies installed without errors
- [ ] Configuration files created
- [ ] Folder structure created
- [ ] Types and constants defined
- [ ] App runs on Expo Go
- [ ] NativeWind styling works (blue text visible)

---

## Next Phase

Once this is working, we'll move to **Phase 1: Storage & Authentication**.