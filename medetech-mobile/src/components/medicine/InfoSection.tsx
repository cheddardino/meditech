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
