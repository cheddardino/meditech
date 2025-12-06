import * as FileSystem from 'expo-file-system';

export const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    console.log('Converting image at URI:', uri);
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error: any) {
    console.error('Error converting image to base64:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

export const resizeImageIfNeeded = (base64: string): string => {
  // Gemini API has a 4MB limit per image
  // For now, we'll just return the base64 as is
  // In production, you might want to add compression
  return base64;
};
