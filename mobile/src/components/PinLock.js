import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

const PIN_KEY = 'app_pin';
const PIN_ENABLED_KEY = 'pin_enabled';

export const PinLockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(null);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState('enter'); // 'enter' | 'confirm'
  const [error, setError] = useState('');

  useEffect(() => {
    loadPin();
  }, []);

  const loadPin = async () => {
    try {
      const stored = await AsyncStorage.getItem(PIN_KEY);
      const enabled = await AsyncStorage.getItem(PIN_ENABLED_KEY);
      if (stored && enabled === 'true') {
        setSavedPin(stored);
      } else {
        setIsSettingPin(true);
      }
    } catch (e) {
      setIsSettingPin(true);
    }
  };

  const handlePress = (num) => {
    if (pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);
    setError('');

    if (newPin.length === 4) {
      setTimeout(() => {
        if (isSettingPin) {
          if (step === 'enter') {
            setConfirmPin(newPin);
            setStep('confirm');
            setPin('');
          } else {
            if (newPin === confirmPin) {
              savePin(newPin);
            } else {
              setError('PIN match nahi hua! Phir se try karo');
              Vibration.vibrate(200);
              setStep('enter');
              setConfirmPin('');
              setPin('');
            }
          }
        } else {
          if (newPin === savedPin) {
            onUnlock();
          } else {
            setError('Galat PIN! Phir se try karo');
            Vibration.vibrate(200);
            setPin('');
          }
        }
      }, 200);
    }
  };

  const savePin = async (newPin) => {
    try {
      await AsyncStorage.setItem(PIN_KEY, newPin);
      await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
      onUnlock();
    } catch (e) {
      console.log('PIN save error:', e);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleSkip = () => {
    if (isSettingPin) {
      onUnlock();
    }
  };

  const dots = [0, 1, 2, 3];
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Ionicons name="water" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>🚰 KK Water Delivery</Text>
      </View>

      {/* Instructions */}
      <Text style={styles.instruction}>
        {isSettingPin
          ? step === 'enter'
            ? '🔒 Naya PIN set karo (4 digit)'
            : '🔒 PIN confirm karo'
          : '🔒 PIN enter karo'}
      </Text>

      {/* PIN Dots */}
      <View style={styles.dotsRow}>
        {dots.map((i) => (
          <View
            key={i}
            style={[styles.dot, pin.length > i && styles.dotFilled]}
          />
        ))}
      </View>

      {/* Error */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Keypad */}
      <View style={styles.keypad}>
        {keys.map((row, ri) => (
          <View key={ri} style={styles.keyRow}>
            {row.map((key, ki) => {
              if (key === '') return <View key={ki} style={styles.keyEmpty} />;
              if (key === 'del') {
                return (
                  <TouchableOpacity key={ki} style={styles.key} onPress={handleDelete}>
                    <Ionicons name="backspace-outline" size={28} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity key={ki} style={styles.key} onPress={() => handlePress(key)}>
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Skip button for first-time setup */}
      {isSettingPin && (
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip for now →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Utility to check if PIN is enabled
export const isPinEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(PIN_ENABLED_KEY);
    return enabled === 'true';
  } catch (e) {
    return false;
  }
};

// Utility to reset PIN
export const resetPin = async () => {
  try {
    await AsyncStorage.removeItem(PIN_KEY);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'false');
  } catch (e) {
    console.log('PIN reset error:', e);
  }
};

// Utility to change PIN
export const changePin = async (newPin) => {
  try {
    await AsyncStorage.setItem(PIN_KEY, newPin);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
  } catch (e) {
    console.log('PIN change error:', e);
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
  logoContainer: { alignItems: 'center', marginBottom: SPACING.xxxl },
  logo: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.heading3, fontWeight: '700' },
  instruction: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.body, marginBottom: SPACING.xxl },
  dotsRow: { flexDirection: 'row', gap: SPACING.xl, marginBottom: SPACING.lg },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.textMuted },
  dotFilled: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  error: { color: COLORS.danger, fontSize: TYPOGRAPHY.bodySmall, marginBottom: SPACING.lg },
  keypad: { width: '100%', maxWidth: 300, gap: SPACING.md },
  keyRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md },
  key: { width: 75, height: 75, borderRadius: 38, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  keyEmpty: { width: 75, height: 75 },
  keyText: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '600' },
  skipBtn: { marginTop: SPACING.xxl, padding: SPACING.lg },
  skipText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.bodySmall },
});

export default PinLockScreen;
