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
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-3xl font-bold text-blue-600 mb-2">
                {medicineData.name}
              </Text>
              {medicineData.genericName && (
                <Text className="text-lg text-gray-600">
                  Generic: {medicineData.genericName}
                </Text>
              )}
            </View>
            {medicineData.confidence && (
              <View className={`px-3 py-1 rounded-full ${
                medicineData.confidence === 'high' ? 'bg-green-100' :
                medicineData.confidence === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Text className={`text-xs font-bold ${
                  medicineData.confidence === 'high' ? 'text-green-800' :
                  medicineData.confidence === 'medium' ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {medicineData.confidence.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
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

        {/* Analysis Notes (Debug/Transparency) */}
        {medicineData.analysis_notes && (
          <View className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <Text className="text-xs font-bold text-gray-500 mb-1 uppercase">AI Analysis Notes</Text>
            <Text className="text-sm text-gray-600 italic">
              {medicineData.analysis_notes}
            </Text>
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
