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
