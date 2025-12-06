# Phase 3: Camera Screen & Gemini API Integration

**Goal:** Implement camera scanning functionality and integrate with Google Gemini API for image-based medicine identification.

**Estimated Time:** 40-50 minutes

**Prerequisites:** Phase 2 completed successfully

---

## Instructions for AI

Now we'll build the core feature: camera-based medicine identification using the Gemini API.

### Step 1: Set Up Gemini API Key

First, add your Gemini API key to `.env`:

```env
EXPO_PUBLIC_GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

Update `app.json` to include the environment variable:

```json
{
  "expo": {
    "extra": {
      "geminiApiKey": process.env.EXPO_PUBLIC_GEMINI_API_KEY
    }
  }
}
```

### Step 2: Create Gemini Service with Mocking & Optimization

Create `src/services/geminiService.ts`. We will add image compression and a mock mode for development.

```typescript
import Constants from 'expo-constants';
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import { MedicineInfo } from '../types';
import { API_CONFIG } from '../constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey;
const IS_MOCK_MODE = !GEMINI_API_KEY || __DEV__; // Use mock if no key or in dev mode

if (!GEMINI_API_KEY && !IS_MOCK_MODE) {
  console.warn('⚠️ GEMINI_API_KEY not found. Please add it to your .env file.');
}

const GEMINI_URL = `${API_CONFIG.GEMINI_BASE_URL}/models/${API_CONFIG.GEMINI_MODEL}:generateContent`;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// ... (Keep IMAGE_IDENTIFICATION_PROMPT here) ...

class GeminiService {
  async identifyMedicineWithImage(base64Image: string): Promise<MedicineInfo> {
    // 1. Mock Response for Development (Save API Credits)
    if (IS_MOCK_MODE) {
      console.log('⚠️ Using MOCK Gemini Response');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      return {
        name: "Biogesic (Mock)",
        genericName: "Paracetamol",
        overview: "Biogesic is a trusted brand of paracetamol...",
        usage: "Used for relief of minor aches and pains.",
        dosage: "500mg every 4-6 hours",
        sideEffects: ["Nausea", "Skin rash"],
        contraindications: ["Liver disease"],
        brandNames: ["Biogesic"],
        confidence: "high",
        disclaimer: "MOCK DATA: Consult a professional."
      };
    }

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // 2. Optimize Image (Resize/Compress) before sending
      // Note: In a real app, you'd pass the URI here, not base64, to manipulate it.
      // For this snippet, we assume the caller handles compression or we use a helper.
      
      const response = await axios.post<GeminiResponse>(
        `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
}

const IMAGE_IDENTIFICATION_PROMPT = `You are a specialized pharmaceutical assistant. Analyze this image and identify the medicine.

INSTRUCTIONS:
1. First, look for any text on the packaging, pill, or capsule (brand name, generic name, dosage, manufacturer)
2. If text is unclear, analyze visual characteristics: color, shape, size, imprints, markings
3. Provide information specific to the Philippines market when possible

IMPORTANT: 
- If you cannot identify the medicine with confidence, say so clearly
- Always include a disclaimer about consulting healthcare professionals
- Focus on commonly available medicines in the Philippines

Respond ONLY with valid JSON in this exact format:
{
  "name": "Medicine name (brand or generic)",
  "genericName": "Generic/chemical name if different",
  "overview": "Brief description of what this medicine is",
  "usage": "What it's used for (indications)",
  "dosage": "Typical dosage information",
  "sideEffects": ["side effect 1", "side effect 2"],
  "contraindications": ["contraindication 1", "contraindication 2"],
  "brandNames": ["Common brand names in Philippines"],
  "confidence": "high/medium/low",
  "disclaimer": "Always consult a healthcare professional before taking any medication."
}`;

class GeminiService {
  async identifyMedicineWithImage(base64Image: string): Promise<MedicineInfo> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const response = await axios.post<GeminiResponse>(
        `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: IMAGE_IDENTIFICATION_PROMPT },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        },
        {
          timeout: 30000, // 30 second timeout
        }
      );

      const text = response.data.candidates[0]?.content?.parts[0]?.text;
      
      if (!text) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON from response (sometimes wrapped in ```json```)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from API');
      }

      const medicineData = JSON.parse(jsonMatch[0]);
      return medicineData as MedicineInfo;
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      if (error.response) {
        throw new Error(`API Error: ${error.response.data?.error?.message || 'Unknown error'}`);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Failed to identify medicine');
      }
    }
  }

  async identifyMedicineWithText(query: string): Promise<any> {
    // Will be implemented in Phase 4
    throw new Error('Text identification not yet implemented');
  }
}

export default new GeminiService();
```

### Step 3: Create Image Utility Functions

Create `src/utils/imageUtils.ts`:

```typescript
import * as FileSystem from 'expo-file-system';

export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image');
  }
};

export const resizeImageIfNeeded = (base64: string): string => {
  // Gemini API has a 4MB limit per image
  // For now, we'll just return the base64 as is
  // In production, you might want to add compression
  return base64;
};
```

### Step 4: Create Camera Hook

Create `src/hooks/useCamera.ts`:

```typescript
import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { CameraView } from 'expo-camera';

export const useCamera = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false, // We'll read it separately for better control
        });

        if (photo?.uri) {
          setCapturedImage(photo.uri);
          return photo.uri;
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to capture image');
        return null;
      }
    }
    return null;
  };

  const retake = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
  };

  return {
    cameraRef,
    capturedImage,
    setCapturedImage,
    isAnalyzing,
    setIsAnalyzing,
    takePicture,
    retake,
  };
};
```

### Step 5: Create Camera Screen

Create `src/screens/camera/CameraScanScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useCamera } from '../../hooks/useCamera';
import geminiService from '../../services/geminiService';
import { convertImageToBase64 } from '../../utils/imageUtils';

export default function CameraScanScreen({ navigation }: any) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const {
    cameraRef,
    capturedImage,
    isAnalyzing,
    setIsAnalyzing,
    takePicture,
    retake,
  } = useCamera();

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Camera Permission Required
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          MEDetech needs access to your camera to scan medicines
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-500 px-8 py-4 rounded-lg"
        >
          <Text className="text-white font-semibold text-lg">
            Grant Permission
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    try {
      const base64 = await convertImageToBase64(capturedImage);
      const medicineData = await geminiService.identifyMedicineWithImage(base64);

      navigation.navigate('MedicineInfo', { medicineData });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze medicine');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Show preview and analysis options after capture
  if (capturedImage) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Image
          source={{ uri: capturedImage }}
          className="flex-1"
          resizeMode="contain"
        />
        
        {isAnalyzing && (
          <View className="absolute inset-0 bg-black/70 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-white text-lg mt-4">
              Analyzing medicine...
            </Text>
          </View>
        )}

        <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/50">
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={retake}
              disabled={isAnalyzing}
              className="bg-red-500 px-8 py-4 rounded-lg flex-1 mr-2"
            >
              <Text className="text-white font-semibold text-center text-lg">
                Retake
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-green-500 px-8 py-4 rounded-lg flex-1 ml-2"
            >
              <Text className="text-white font-semibold text-center text-lg">
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Camera view
  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} className="flex-1" facing={facing}>
        {/* Header */}
        <SafeAreaView className="px-6 pt-4">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-black/50 w-12 h-12 rounded-full items-center justify-center"
            >
              <Text className="text-white text-2xl">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">
              Scan Medicine
            </Text>
            <View className="w-12" />
          </View>
        </SafeAreaView>

        {/* Scanning guide */}
        <View className="flex-1 justify-center items-center px-8">
          <View className="border-4 border-white/50 w-80 h-80 rounded-3xl" />
          <Text className="text-white text-center mt-6 text-base">
            Position the medicine within the frame
          </Text>
        </View>

        {/* Capture button */}
        <View className="items-center pb-12">
          <TouchableOpacity
            onPress={takePicture}
            className="w-20 h-20 rounded-full bg-white border-4 border-blue-500"
            activeOpacity={0.7}
          />
        </View>
      </CameraView>
    </View>
  );
}
```

### Step 6: Update Navigation

Update `src/navigation/AppNavigator.tsx` to include the Camera screen:

```typescript
// Add import
import CameraScanScreen from '../screens/camera/CameraScanScreen';

// In the Stack.Navigator, uncomment/add:
<Stack.Screen 
  name="Camera" 
  component={CameraScanScreen} 
  options={{ headerShown: false }} 
/>
```

### Step 7: Update Dashboard to Enable Camera

Update `src/screens/dashboard/DashboardScreen.tsx`:

```typescript
// Change the handleCameraScan function:
const handleCameraScan = () => {
  navigation.navigate('Camera');
};
```

---

## Testing Instructions

1. **Add your Gemini API key** to `.env` file
2. Restart Metro bundler: `npx expo start -c`
3. Test camera flow:
   - Tap "Scan Medicine" on dashboard
   - Grant camera permission if requested
   - Take a photo of any medicine packaging
   - Verify the preview shows
   - Tap "Analyze"
   - Wait for Gemini API response

---

## Verification Checklist

- [ ] Gemini API key configured in `.env`
- [ ] Camera permission request works
- [ ] Camera preview displays correctly
- [ ] Capture button works
- [ ] Image preview shows after capture
- [ ] Retake button works
- [ ] Analyze button shows loading state
- [ ] API call to Gemini succeeds
- [ ] Navigation to MedicineInfo screen works (will create in Phase 4)

---

## Troubleshooting

**If API calls fail:**
- Verify your API key is correct
- Check internet connection
- Look at console logs for error messages
- Ensure the image isn't too large (< 4MB)

---

## Next Phase

Once camera scanning and API integration work, move to **Phase 4: Medicine Info Display & Text Query**.