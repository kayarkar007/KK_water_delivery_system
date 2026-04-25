import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../src/theme';
import { PinLockScreen, isPinEnabled } from '../src/components/PinLock';
import { OfflineQueue } from '../src/utils/offlineManager';
import apiClient from '../src/api/apiClient';

export default function RootLayout() {
  const [isLocked, setIsLocked] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkPinAndSync();
  }, []);

  const checkPinAndSync = async () => {
    const pinOn = await isPinEnabled();
    if (!pinOn) {
      setIsLocked(false);
    }
    setChecking(false);

    // Process offline queue when app starts
    try {
      const count = await OfflineQueue.getCount();
      if (count > 0) {
        console.log(`📦 ${count} offline operations pending, syncing...`);
        await OfflineQueue.processQueue(apiClient);
      }
    } catch (e) {
      console.log('Offline sync error:', e);
    }
  };

  if (checking) return null;

  if (isLocked) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" backgroundColor={COLORS.bgPrimary} />
        <PinLockScreen onUnlock={() => setIsLocked(false)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={COLORS.bgPrimary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bgPrimary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="customer/add" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="customer/[id]" />
        <Stack.Screen name="customer/location" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="delivery/load-cans" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="delivery/active" />
        <Stack.Screen name="delivery/summary" options={{ animation: 'fade' }} />
        <Stack.Screen name="billing/payment" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
