# Phase 4: Medicine Info Display & Text Query

**Goal:** Create the medicine information display screen and implement text-based medicine search.

**Estimated Time:** 35-45 minutes

**Prerequisites:** Phase 3 completed successfully

---

## Instructions for AI

Now let's display the medicine information beautifully and add text-based search functionality.

### Step 1: Create Medicine Info Display Components

#### 1.1 Create Info Section Component

Create `src/components/medicine/InfoSection.tsx`:

```typescript
import React from 'react';
import { View, Text } from 'react-native';

interface InfoSectionProps {
  title: string;
  content: string | string[];
  icon?: string;
}

export default function InfoSection({ title, content, icon }: InfoSectionProps) {
  const renderContent = () => {
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <View key={index} className="flex-row mb-2">
          <Text className="text-gray-700 mr-2">•</Text>
          <Text className="text-gray-700 flex-1 leading-6">{item}</Text>
        </View>
      ));
    }
    return <Text className="text-gray-700 leading-6">{content}</Text>;
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        {icon && <Text className="text-2xl mr-2">{icon}</Text>}
        <Text className="text-xl font-bold text-gray-800">{title}</Text>
      </View>
      <View className="bg-gray-50 rounded-xl p-4">
        {renderContent()}
      </View>
    </View>
  );
}
```

### Step 2: Create Medicine Info Screen with Feedback Loop

Create `src/screens/identifier/MedicineInfoScreen.tsx`. Add a way for users to report issues.

```typescript
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import InfoSection from '../../components/medicine/InfoSection';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { RootStackParamList } from '../../types';
import { DISCLAIMER } from '../../constants';

type MedicineInfoScreenRouteProp = RouteProp<RootStackParamList, 'MedicineInfo'>;

interface Props {
  route: MedicineInfoScreenRouteProp;
  navigation: any;
}

export default function MedicineInfoScreen({ route, navigation }: Props) {
  const { medicineData } = route.params;
  const { speak, stop, isSpeaking } = useTextToSpeech();

  const handleReadOverview = () => {
    if (isSpeaking) {
      stop();
    } else {
      const textToRead = `${medicineData.name}. ${medicineData.overview}`;
      speak(textToRead);
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      "Report Issue",
      "Is the information incorrect?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Report", onPress: () => Alert.alert("Thank you", "Feedback recorded.") }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-blue-600 mb-2">
            {medicineData.name}
          </Text>
          {medicineData.genericName && (
            <Text className="text-lg text-gray-600">
              Generic: {medicineData.genericName}
            </Text>
          )}
        </View>

        {/* Disclaimer */}
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <Text className="text-red-800 text-sm leading-5">{DISCLAIMER}</Text>
        </View>

        {/* Overview with TTS */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">📋</Text>
              <Text className="text-xl font-bold text-gray-800">Overview</Text>
            </View>
            <TouchableOpacity
              onPress={handleReadOverview}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">
                {isSpeaking ? '⏸ Stop' : '🔊 Read'}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="text-gray-700 leading-6">
              {medicineData.overview}
            </Text>
          </View>
        </View>

        {/* Usage */}
        <InfoSection
          icon="💊"
          title="Usage & Indications"
          content={medicineData.usage}
        />

        {/* Dosage */}
        <InfoSection
          icon="📏"
          title="Dosage Information"
          content={medicineData.dosage}
        />

        {/* Side Effects */}
        {medicineData.sideEffects && medicineData.sideEffects.length > 0 && (
          <InfoSection
            icon="⚠️"
            title="Possible Side Effects"
            content={medicineData.sideEffects}
          />
        )}

        {/* Contraindications */}
        {medicineData.contraindications && medicineData.contraindications.length > 0 && (
          <InfoSection
            icon="🚫"
            title="Contraindications"
            content={medicineData.contraindications}
          />
        )}

        {/* Brand Names */}
        {medicineData.brandNames && medicineData.brandNames.length > 0 && (
          <InfoSection
            icon="🏷️"
            title="Common Brand Names (Philippines)"
            content={medicineData.brandNames}
          />
        )}

        {/* Sources (if available) */}
        {medicineData.sources && medicineData.sources.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Sources
            </Text>
            {medicineData.sources.map((source, index) => (
              <Text key={index} className="text-blue-600 text-sm mb-1">
                • {source}
              </Text>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View className="mt-4 mb-8">
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard')}
            className="bg-blue-500 px-6 py-4 rounded-lg mb-3"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Back to Dashboard
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('Camera')}
            className="bg-green-500 px-6 py-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Scan Another Medicine
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Step 3: Implement Text-to-Speech Hook

Create `src/hooks/useTextToSpeech.ts`:

```typescript
import { useState } from 'react';
import * as Speech from 'expo-speech';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.85,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking };
};
```

### Step 4: Extend Gemini Service for Text Queries

Update `src/services/geminiService.ts` to add text identification:

```typescript
// Add this method to the GeminiService class

const TEXT_IDENTIFICATION_PROMPT = `You are MEDetech Assistant, a helpful AI that provides medicine information for users in the Philippines.

CAPABILITIES:
1. Identify medicines by name (brand or generic)
2. Describe medicines by appearance (e.g., "white round pill")
3. Suggest medicines for common symptoms (e.g., "headache", "sakit ng ulo")

GUIDELINES:
- Prioritize medicines commonly available in the Philippines
- Always include safety disclaimers
- If unsure, recommend consulting a healthcare professional
- For symptom queries, suggest common over-the-counter options but emphasize medical consultation

IMPORTANT:
- Use Google Search to find up-to-date information when needed
- Cite sources when using web information
- Be cautious and responsible with medical advice

Respond with valid JSON in this format:
{
  "name": "Medicine name",
  "genericName": "Generic name if applicable",
  "overview": "What this medicine is",
  "usage": "What it treats",
  "dosage": "Typical dosage",
  "sideEffects": ["list of side effects"],
  "contraindications": ["list of contraindications"],
  "brandNames": ["Available brands in Philippines"],
  "sources": ["URLs if web search was used"],
  "disclaimer": "Consultation disclaimer"
}`;

async identifyMedicineWithText(query: string): Promise<MedicineInfo> {
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
              {
                text: `${TEXT_IDENTIFICATION_PROMPT}\n\nUser Query: ${query}`,
              },
            ],
          },
        ],
        tools: [
          {
            googleSearch: {},
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      },
      {
        timeout: 30000,
      }
    );

    const text = response.data.candidates[0]?.content?.parts[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    // Try to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const medicineData = JSON.parse(jsonMatch[0]);
      return medicineData as MedicineInfo;
    } else {
      // If no JSON, return a formatted response
      