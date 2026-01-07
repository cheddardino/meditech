import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">{label}</Text>
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={`border ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white`}
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
