import React from 'react';
import { View, Text } from 'react-native';

interface ConfidenceMeterProps {
  score: number; // Expects 0 to 1 (e.g. 0.95)
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ score }) => {
  // Convert 0.95 to 95
  const percentage = Math.min(Math.max(Math.round(score * 100), 0), 100);

  // Determine styling based on confidence
  let colorClass = 'bg-red-500';
  let label = 'Low Confidence';
  let description = 'Verify carefully with packaging.';
  let textColor = 'text-red-500';

  if (percentage >= 80) {
    colorClass = 'bg-emerald-500';
    textColor = 'text-emerald-500';
    label = 'High Match';
    description = 'AI is confident in this result.';
  } else if (percentage >= 50) {
    colorClass = 'bg-yellow-500';
    textColor = 'text-yellow-500';
    label = 'Possible Match';
    description = 'Double-check the details.';
  }

  return (
    <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 my-2 w-full">
      <View className="flex-row justify-between items-end mb-2">
        <View>
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">
            AI Analysis
          </Text>
          <Text className="text-gray-900 font-bold text-lg">
            {label}
          </Text>
        </View>
        <Text className={`font-bold text-xl ${textColor}`}>
          {percentage}%
        </Text>
      </View>

      {/* The Graph Bar */}
      <View className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <View 
          className={`h-full ${colorClass} rounded-full`} 
          style={{ width: `${percentage}%` }} 
        />
      </View>

      <Text className="text-gray-400 text-xs mt-2 italic">
        {description}
      </Text>
    </View>
  );
};

export default ConfidenceMeter;
