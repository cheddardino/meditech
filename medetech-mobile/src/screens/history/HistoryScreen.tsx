import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import historyService, { HistoryItem } from '../../services/historyService';

export default function HistoryScreen({ navigation }: any) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  const loadHistory = async () => {
    const data = await historyService.getHistory();
    setHistory(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await historyService.clearHistory();
            loadHistory();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MedicineInfo', { medicineData: item })}
      className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm flex-row justify-between items-center"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
        <Text className="text-gray-500 text-sm" numberOfLines={1}>
          {item.genericName || item.overview}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text className="text-blue-500 text-xl">›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Text className="text-2xl text-blue-600">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">History</Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text className="text-red-500 font-medium">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-6xl mb-4">🕰️</Text>
          <Text className="text-xl font-bold text-gray-800 mb-2">No History Yet</Text>
          <Text className="text-gray-500 text-center leading-6">
            Medicines you scan or search for will appear here for quick access.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard')}
            className="mt-8 bg-blue-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-bold">Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
