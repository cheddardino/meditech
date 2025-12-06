import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import storageService from '../../services/storageService';

export default function SignupScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const existingUser = await storageService.getUser();
      if (existingUser) {
        Alert.alert('Error', 'User already exists. Please login.');
        setLoading(false);
        return;
      }

      await storageService.saveUser(username, password);
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('BioData'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Signup failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mt-8 mb-6">
          <Text className="text-3xl font-bold text-blue-600">Create Account</Text>
          <Text className="text-gray-600 mt-2">
            Join MEDetech to identify medicines safely
          </Text>
        </View>

        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="Choose a username"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 6 characters"
        />

        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Re-enter your password"
        />

        <Button
          title="Sign Up"
          onPress={handleSignup}
          loading={loading}
        />

        <View className="mt-4">
          <Button
            title="Back to Login"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
