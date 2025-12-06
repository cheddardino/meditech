import AsyncStorage from '@react-native-async-storage/async-storage';
import { MedicineInfo } from '../types';

const HISTORY_KEY = 'medetech_scan_history';

export interface HistoryItem extends MedicineInfo {
  id: string;
  timestamp: number;
}

class HistoryService {
  async addToHistory(medicine: MedicineInfo): Promise<void> {
    try {
      const history = await this.getHistory();
      
      // Create new item
      const newItem: HistoryItem = {
        ...medicine,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      // Add to beginning of array
      const updatedHistory = [newItem, ...history];

      // Limit history to last 50 items to save space
      const limitedHistory = updatedHistory.slice(0, 50);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  }

  async getHistory(): Promise<HistoryItem[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(HISTORY_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }
  
  async deleteItem(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  }
}

export default new HistoryService();
