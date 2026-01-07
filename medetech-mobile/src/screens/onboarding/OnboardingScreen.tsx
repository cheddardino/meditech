import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import storageService from '../../services/storageService';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Scan Your Medicine',
    description: 'Instantly identify pills, capsules, and packaging using your camera.',
    icon: '📸',
    color: 'bg-blue-100 dark:bg-blue-900',
  },
  {
    id: '2',
    title: 'AI-Powered Insights',
    description: 'Get detailed information about dosage, usage, and side effects powered by Gemini AI.',
    icon: '🤖',
    color: 'bg-purple-100 dark:bg-purple-900',
  },
  {
    id: '3',
    title: 'Track Your Health',
    description: 'Keep a history of your scans and manage your health profile securely.',
    icon: '❤️',
    color: 'bg-green-100 dark:bg-green-900',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setActiveIndex(roundIndex);
  };

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: width * (activeIndex + 1),
        animated: true,
      });
    } else {
      await storageService.setLaunched();
      navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={{ width }} className="items-center justify-center px-8">
            <View className={`w-64 h-64 rounded-full ${slide.color} items-center justify-center mb-12`}>
              <Text className="text-9xl">{slide.icon}</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-4">
              {slide.title}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center text-lg leading-7">
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View className="px-8 pb-12">
        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-8">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === activeIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">
            {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
