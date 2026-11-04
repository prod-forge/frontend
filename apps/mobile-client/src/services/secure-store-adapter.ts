import type { KeyValueStorage } from '@prod-forge-todolist-frontend/core';

import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

// The auth token lives in the iOS Keychain / Android Keystore instead of plain AsyncStorage.
export const secureStoreAdapter: KeyValueStorage = {
  getItem: (key) => getItemAsync(key),
  removeItem: (key) => deleteItemAsync(key),
  setItem: (key, value) => setItemAsync(key, value),
};
