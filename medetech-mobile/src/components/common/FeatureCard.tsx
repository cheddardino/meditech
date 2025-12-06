import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  color?: string;
}

export default function FeatureCard({
  title,
  description,
  icon,
  onPress,
  color = 'bg-blue-500',
}: FeatureCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-6 mb-4 shadow-lg border border-gray-100"
      activeOpacity={0.7}
    >
      <View className={`${color} w-16 h-16 rounded-full items-center justify-center mb-4`}>
        <Text className="text-3xl">{icon}</Text>
      </View>
      <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
      <Text className="text-gray-600 leading-5">{description}</Text>
    </TouchableOpacity>
  );
}
