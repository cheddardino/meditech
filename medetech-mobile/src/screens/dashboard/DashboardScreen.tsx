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
    navigation.navigate('Camera');
  };

  const handleTextQuery = () => {
    navigation.navigate('TextQuery');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleHistory = () => {
    navigation.navigate('History');
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
          icon="🕰️"
          title="Scan History"
          description="View your previously scanned medicines"
          onPress={handleHistory}
          color="bg-orange-500"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
