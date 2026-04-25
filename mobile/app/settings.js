import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CONSTANTS, RADIUS, SPACING, TYPOGRAPHY } from '../src/theme';
import Header from '../src/components/Header';
import { ActionButton } from '../src/components/SharedUI';
import apiClient from '../src/api/apiClient';
import useStore from '../src/store/useStore';

const normalizeApiUrl = (url) => {
  const trimmed = (url || '').trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export default function SettingsScreen() {
  const { settings, updateSettings, loadSettings } = useStore();
  const [apiUrl, setApiUrl] = useState(settings.apiUrl || CONSTANTS.API_URL);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setApiUrl(settings.apiUrl || CONSTANTS.API_URL);
  }, [settings.apiUrl]);

  const saveApiUrl = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Error', 'API URL empty nahi ho sakta');
      return null;
    }

    const normalized = normalizeApiUrl(apiUrl);
    setSaving(true);
    try {
      await updateSettings({ apiUrl: normalized });
      setApiUrl(normalized);
      return normalized;
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      const normalized = await saveApiUrl();
      if (!normalized) return;
      const res = await apiClient.get('/health');
      Alert.alert('Connected', res?.message || 'Backend connection working');
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        error.message || 'Backend se connect nahi ho pa raha. Server aur IP address check karo.'
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" subtitle="Server connection" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons name="server" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.cardTitle}>Backend API URL</Text>
              <Text style={styles.cardSubtext}>Phone aur backend ek hi network par hone chahiye.</Text>
            </View>
          </View>

          <Text style={styles.label}>API URL</Text>
          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="http://192.168.1.10:5000/api"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <View style={styles.helpBox}>
            <Text style={styles.helpText}>Android emulator: http://10.0.2.2:5000/api</Text>
            <Text style={styles.helpText}>Physical phone: http://YOUR_PC_IP:5000/api</Text>
            <Text style={styles.helpText}>Current default: {CONSTANTS.API_URL}</Text>
          </View>

          <ActionButton
            title="Save"
            icon="save"
            color={COLORS.primary}
            fullWidth
            loading={saving}
            onPress={async () => {
              const normalized = await saveApiUrl();
              if (normalized) Alert.alert('Saved', 'API URL update ho gaya.');
            }}
          />
          <View style={styles.buttonGap} />
          <ActionButton
            title="Test Connection"
            icon="pulse"
            color={COLORS.success}
            variant="outline"
            fullWidth
            loading={testing}
            onPress={testConnection}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: SPACING.xl },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl, gap: SPACING.md },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { flex: 1 },
  cardTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.heading4, fontWeight: '700' },
  cardSubtext: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.caption, marginTop: 2, lineHeight: 18 },
  label: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.bodySmall, fontWeight: '600', marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.bodySmall,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  helpBox: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  helpText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.caption, lineHeight: 18 },
  buttonGap: { height: SPACING.md },
});
