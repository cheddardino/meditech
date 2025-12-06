import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import geminiService from '../../services/geminiService';
import historyService from '../../services/historyService';

type TextQueryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TextQuery'>;

interface Props {
  navigation: TextQueryScreenNavigationProp;
}

export default function TextQueryScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a medicine name or symptom.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await geminiService.identifyMedicineWithText(query);
      await historyService.addToHistory(result);
      navigation.navigate('MedicineInfo', { medicineData: result });
    } catch (error: any) {
      Alert.alert('Search Failed', error.message || 'Could not identify medicine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-4">
          <View className="mb-8 mt-4">
            <Text className="text-3xl font-bold text-blue-600 mb-2">
              Ask MEDetech
            </Text>
            <Text className="text-gray-600 text-lg">
              Search by medicine name, generic name, or describe your symptoms.
            </Text>
          </View>

          <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <TextInput
              className="text-lg text-gray-800 min-h-[120px]"
              placeholder="E.g., 'Biogesic', 'white round pill with 500 imprint', or 'medicine for headache'..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={query}
              onChangeText={setQuery}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            onPress={handleSearch}
            disabled={isLoading}
            className={`py-4 rounded-xl items-center justify-center mb-4 ${
              isLoading ? 'bg-blue-300' : 'bg-blue-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Search Medicine
              </Text>
            )}
          </TouchableOpacity>

          <View className="mt-4">
            <Text className="text-gray-500 text-center text-sm mb-4">
              Or try searching for:
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2">
              {['Paracetamol', 'Headache', 'Cough', 'Vitamin C'].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setQuery(item)}
                  className="bg-gray-100 px-4 py-2 rounded-full"
                >
                  <Text className="text-blue-600 font-medium">{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
