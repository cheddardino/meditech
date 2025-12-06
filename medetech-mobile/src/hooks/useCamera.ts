import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { CameraView } from 'expo-camera';

export const useCamera = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        if (photo?.uri) {
          setCapturedImage(photo.uri);
          if (photo.base64) {
            setCapturedBase64(photo.base64);
          }
          return photo.uri;
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to capture image');
        return null;
      }
    }
    return null;
  };

  const retake = () => {
    setCapturedImage(null);
    setCapturedBase64(null);
    setIsAnalyzing(false);
  };

  return {
    cameraRef,
    capturedImage,
    capturedBase64,
    setCapturedImage,
    isAnalyzing,
    setIsAnalyzing,
    takePicture,
    retake,
  };
};
