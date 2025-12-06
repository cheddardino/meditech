import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import storageService from '../../services/storageService';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const isValid = await storageService.validateCredentials(username, password);
      
      if (isValid) {
        await storageService.saveSession({ isLoggedIn: true, username });
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="mt-12 mb-8">
          <Text className="text-4xl font-bold text-blue-600">MEDetech</Text>
          <Text className="text-lg text-gray-600 mt-2">
            AI-Powered Medicine Identifier
          </Text>
        </View>

        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="Enter your username"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
        />

        <Button
          title="Login"
          onPress={handleLogin}
          loading={loading}
        />

        <View className="mt-4">
          <Button
            title="Create New Account"
            onPress={() => navigation.navigate('Signup')}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
