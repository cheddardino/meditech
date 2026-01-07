import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import storageService from '../../services/storageService';
import { DISCLAIMER } from '../../constants';

// Clean, Sophisticated Dashboard Button
const DashButton = ({ 
  title, 
  iconName, 
  onPress, 
  size = 'square',
  iconSize = 28,
  accentColor = '#3B82F6', // Default Blue
  bgColorClass = 'bg-white dark:bg-gray-800'
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mx-2 mb-4 p-5 ${size === 'square' ? 'flex-1 aspect-square' : 'w-full h-40'} rounded-[32px] ${bgColorClass} justify-between shadow-sm`}
    style={{
      shadowColor: '#DAE1E7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 2,
    }}
  >
    {/* Icon Container - Top Left */}
    <View 
      className="w-14 h-14 rounded-full justify-center items-center"
      style={{ backgroundColor: `${accentColor}15` }}
    >
      <Ionicons name={iconName} size={iconSize} color={accentColor} />
    </View>

    {/* Title - Bottom Left */}
    <View>
      <Text className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">
        Action
      </Text>
      <Text className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

// Special Hero Button for Scan - Layout matches DashButton (Icon Top Left, Text Bottom Left)
const HeroButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="mx-2 mb-1 shadow-lg" 
    style={{
      height: 220, // Reduced height for better proximity
      shadowColor: '#10B981', 
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    }}
  >
    <LinearGradient
      colors={['#4ADE80', '#16A34A']} // Vibrant Green Gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 rounded-[40px] justify-between" 
      style={{ borderRadius: 40, padding: 24 }}
    >
       {/* Icon Container - Top Left (Matches DashButton style) */}
       <View className="w-20 h-20 bg-white/20 rounded-full justify-center items-center backdrop-blur-md">
          <Ionicons name="camera" size={40} color="#FFFFFF" /> 
       </View>

       {/* Text - Bottom Left */}
       <View>
          <Text className="text-green-50 font-bold text-sm uppercase tracking-widest mb-2 opacity-80">
            Identify
          </Text>
          <Text className="text-white font-bold text-4xl tracking-tighter shadow-sm leading-tight">
            Scan{"\n"}Medicine
          </Text>
       </View>
    </LinearGradient>
  </TouchableOpacity>
);

export default function DashboardScreen({ navigation }: any) {
  const [username, setUsername] = useState('User');

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

  const handleCameraScan = () => navigation.navigate('Camera');
  const handleTextQuery = () => navigation.navigate('TextQuery');
  const handleProfile = () => navigation.navigate('Profile');
  const handleHistory = () => navigation.navigate('History');

  return (
    <View className="flex-1 bg-[#F8FAFC] dark:bg-gray-900"> 
      {/* Even lighter gray/white background */}
      
      <SafeAreaView className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="mb-6 px-4 mt-2 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              Welcome Back
            </Text>
            <Text className="text-slate-900 dark:text-white text-3xl font-black tracking-tighter">
              {username}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleProfile}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full justify-center items-center shadow-sm border border-slate-100 dark:border-gray-700"
          >
             <Ionicons name="person" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          {/* Hero Action: SCAN */}
          <HeroButton onPress={handleCameraScan} />

          {/* Secondary Actions Grid */}
          <View className="flex-row justify-between mb-2">
            <DashButton 
              title="Profile" 
              iconName="person" 
              accentColor="#3B82F6" // Blue
              onPress={handleProfile}
              size="square"
            />
            <DashButton 
              title="Search" 
              iconName="search" 
              accentColor="#F59E0B" // Amber
              onPress={handleTextQuery}
              size="square"
            />
          </View>

          {/* History Button (Full Width) */}
          <TouchableOpacity
            onPress={handleHistory}
            className="mx-2 mt-2 bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-sm flex-row items-center justify-between"
             style={{
              shadowColor: '#DAE1E7',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View>
               <Text className="text-slate-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-1">
                 Database
              </Text>
              <Text className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">
                Saved Medicines
              </Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900 justify-center items-center">
               <Ionicons name="time" size={22} color="#6366F1" />
            </View>
          </TouchableOpacity>

          {/* Simple Footer */}
          <View className="mt-8 mx-4">
             <Text className="text-slate-300 dark:text-gray-600 text-[10px] text-center leading-4 font-medium">
              {DISCLAIMER.substring(0, 150)}...
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
