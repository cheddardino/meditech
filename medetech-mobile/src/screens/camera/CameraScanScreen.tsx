import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useCamera } from '../../hooks/useCamera';
import geminiService from '../../services/geminiService';
import historyService from '../../services/historyService';
import { convertImageToBase64 } from '../../utils/imageUtils';

export default function CameraScanScreen({ navigation }: any) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const {
    cameraRef,
    capturedImage,
    capturedBase64,
    isAnalyzing,
    setIsAnalyzing,
    takePicture,
    retake,
  } = useCamera();

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Camera Permission Required
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          MEDetech needs access to your camera to scan medicines
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-500 px-8 py-4 rounded-lg"
        >
          <Text className="text-white font-semibold text-lg">
            Grant Permission
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleAnalyze = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    try {
      let base64 = capturedBase64;
      if (!base64) {
        console.log('Base64 missing from capture, converting from URI...');
        base64 = await convertImageToBase64(capturedImage);
      }
      
      if (!base64) {
        throw new Error('Failed to get image data');
      }

      const medicineData = await geminiService.identifyMedicineWithImage(base64);
      
      // Save to history
      await historyService.addToHistory(medicineData);

      navigation.navigate('MedicineInfo', { medicineData });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze medicine');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Show preview and analysis options after capture
  if (capturedImage) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <Image
          source={{ uri: capturedImage }}
          className="flex-1"
          resizeMode="contain"
        />
        
        {isAnalyzing && (
          <View className="absolute inset-0 bg-black/70 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-white text-lg mt-4">
              Analyzing medicine...
            </Text>
          </View>
        )}

        <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/50">
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={retake}
              disabled={isAnalyzing}
              className="bg-red-500 px-8 py-4 rounded-lg flex-1 mr-2"
            >
              <Text className="text-white font-semibold text-center text-lg">
                Retake
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-green-500 px-8 py-4 rounded-lg flex-1 ml-2"
            >
              <Text className="text-white font-semibold text-center text-lg">
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const { width } = Dimensions.get('window');
  const frameSize = width * 0.75; // Slightly smaller frame
  const overlayColor = 'rgba(0, 0, 0, 0.6)';

  // Camera view
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <CameraView 
        ref={cameraRef} 
        style={{ flex: 1 }} 
        facing={facing}
      />
      
      {/* Combined Overlay and UI - Moved outside CameraView */}
      <View style={StyleSheet.absoluteFill}>
        
        {/* Top Section */}
        <View style={{ flex: 1, backgroundColor: overlayColor }}>
          <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
            <View className="flex-row items-center justify-between px-6 pt-2">
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                className="w-10 h-10 items-center justify-center"
              >
                <Text className="text-white text-3xl font-light">←</Text>
              </TouchableOpacity>
              <Text className="text-white text-xl font-semibold tracking-wide">
                Scan Medicine
              </Text>
              <View className="w-10" />
            </View>
          </SafeAreaView>
        </View>
        
        {/* Middle Section (The Box) */}
        <View style={{ flexDirection: 'row', height: frameSize }}>
          <View style={{ flex: 1, backgroundColor: overlayColor }} />
          
          {/* Transparent Cutout */}
          <View style={{ width: frameSize, height: frameSize }}>
            {/* Corner Markers */}
            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
          </View>
          
          <View style={{ flex: 1, backgroundColor: overlayColor }} />
        </View>
        
        {/* Bottom Section */}
        <View style={{ flex: 1, backgroundColor: overlayColor, alignItems: 'center' }}>
          <Text className="text-white text-center text-base font-medium opacity-90 mt-8">
            Position the medicine within the frame
          </Text>
          
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingBottom: 20 }}>
            <View className="relative justify-center items-center w-full">
              {/* Capture Button */}
              <TouchableOpacity
                onPress={takePicture}
                className="w-20 h-20 rounded-full border-4 border-blue-500 items-center justify-center bg-transparent"
                activeOpacity={0.7}
              >
                <View className="w-16 h-16 rounded-full bg-white" />
              </TouchableOpacity>
              
              {/* Gallery/Sparkle Icon */}
              <TouchableOpacity className="absolute right-10">
                  <Text className="text-white text-2xl opacity-80">✨</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </View>
    </View>
  );
}
