import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import storageService from '../../services/storageService';
import { UserProfile } from '../../types';

export default function ProfileScreen({ navigation }: any) {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const session = await storageService.getSession();
      if (session?.username) {
        setUsername(session.username);
      }

      const profile = await storageService.getProfile();
      if (profile) {
        setDateOfBirth(profile.dateOfBirth || '');
        setAllergies(profile.allergies ? profile.allergies.join(', ') : '');
        setConditions(profile.conditions ? profile.conditions.join(', ') : '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const profile: UserProfile = {
        dateOfBirth: dateOfBirth || undefined,
        allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
        conditions: conditions ? conditions.split(',').map(c => c.trim()) : [],
      };

      await storageService.saveProfile(profile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearSession();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-2xl text-blue-600">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* User Info Card */}
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6 items-center">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-xl font-bold text-gray-800">{username}</Text>
          <Text className="text-gray-500">Member</Text>
        </View>

        {/* Settings Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Settings</Text>
          <View className="bg-white rounded-xl overflow-hidden">
            <View className="p-4 flex-row justify-between items-center border-b border-gray-100">
              <Text className="text-gray-700 text-base">Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#767577', true: '#3B82F6' }}
              />
            </View>
            <TouchableOpacity 
              className="p-4 flex-row justify-between items-center"
              onPress={() => Alert.alert('About', 'MEDetech v1.0.0\nDeveloped for DIP')}
            >
              <Text className="text-gray-700 text-base">About App</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Info Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">Health Information</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text className="text-blue-600 font-medium">
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white p-4 rounded-xl">
            <Input
              label="Date of Birth"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              editable={isEditing}
            />

            <Input
              label="Allergies"
              value={allergies}
              onChangeText={setAllergies}
              placeholder="e.g., Penicillin, Aspirin"
              multiline
              editable={isEditing}
            />

            <Input
              label="Conditions"
              value={conditions}
              onChangeText={setConditions}
              placeholder="e.g., Diabetes, Hypertension"
              multiline
              editable={isEditing}
            />

            {isEditing && (
              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={loading}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 p-4 rounded-xl items-center mb-8 border border-red-100"
        >
          <Text className="text-red-600 font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
