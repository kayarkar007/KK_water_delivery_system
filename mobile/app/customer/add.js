import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, CONSTANTS } from '../../src/theme';
import Header from '../../src/components/Header';
import { ActionButton } from '../../src/components/SharedUI';
import { customerAPI } from '../../src/api/apiClient';

// InputField defined OUTSIDE the component to prevent re-creation on every render
const InputField = ({ label, value, onChange, placeholder, keyboardType, icon, multiline, inputRef }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputRow, multiline && { height: 80, alignItems: 'flex-start' }]}>
      <Ionicons name={icon} size={20} color={COLORS.textMuted} style={{ marginTop: multiline ? 14 : 0 }} />
      <TextInput
        ref={inputRef}
        style={[styles.input, multiline && { height: 70, textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        blurOnSubmit={!multiline}
        returnKeyType={multiline ? 'default' : 'next'}
      />
    </View>
  </View>
);

export default function AddCustomerScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [normalRate, setNormalRate] = useState(String(CONSTANTS.NORMAL_CAN_PRICE));
  const [coolRate, setCoolRate] = useState(String(CONSTANTS.COOL_CAN_PRICE));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Customer ka naam dalo'); return; }
    if (!phone.trim()) { Alert.alert('Error', 'Phone number dalo'); return; }
    if (!address.trim()) { Alert.alert('Error', 'Address dalo'); return; }

    try {
      setLoading(true);
      await customerAPI.create({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        pricePerNormalCan: parseInt(normalRate) || CONSTANTS.NORMAL_CAN_PRICE,
        pricePerCoolCan: parseInt(coolRate) || CONSTANTS.COOL_CAN_PRICE,
        notes,
      });
      Alert.alert('Success ✅', `${name} add ho gaya!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Customer add nahi ho paya');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Customer Add Karo" subtitle="Naya customer" showBack />
      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
        </View>

        <InputField label="Naam *" value={name} onChange={setName} placeholder="Customer ka naam" icon="person-outline" />
        <InputField label="Phone Number *" value={phone} onChange={setPhone} placeholder="Phone number" icon="call-outline" keyboardType="phone-pad" />
        <InputField label="Address *" value={address} onChange={setAddress} placeholder="Full address" icon="location-outline" multiline />

        <Text style={styles.sectionTitle}>💰 Can Rates</Text>
        <View style={styles.rateRow}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Normal Can (₹)</Text>
            <View style={styles.inputRow}>
              <Ionicons name="water" size={18} color={COLORS.normalCan} />
              <TextInput style={styles.input} value={normalRate} onChangeText={setNormalRate} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
            </View>
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Cool Can (₹)</Text>
            <View style={styles.inputRow}>
              <Ionicons name="snow" size={18} color={COLORS.coolCan} />
              <TextInput style={styles.input} value={coolRate} onChangeText={setCoolRate} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
            </View>
          </View>
        </View>

        <InputField label="Notes (Optional)" value={notes} onChange={setNotes} placeholder="Koi special note..." icon="create-outline" multiline />

        <View style={styles.locationNote}>
          <Ionicons name="information-circle" size={18} color={COLORS.primary} />
          <Text style={styles.locationNoteText}>
            GPS location baad me customer detail se add kar sakte ho
          </Text>
        </View>

        <ActionButton
          title="✅ Customer Save Karo"
          color={COLORS.success}
          size="large"
          fullWidth
          loading={loading}
          onPress={handleSave}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  form: { padding: SPACING.xl },
  avatarContainer: { alignItems: 'center', marginBottom: SPACING.xxl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
  field: { marginBottom: SPACING.lg },
  label: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.bodySmall, fontWeight: TYPOGRAPHY.medium, marginBottom: SPACING.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.body, paddingVertical: SPACING.md },
  sectionTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.body, fontWeight: TYPOGRAPHY.bold, marginTop: SPACING.lg, marginBottom: SPACING.md },
  rateRow: { flexDirection: 'row', gap: SPACING.md },
  locationNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '10', padding: SPACING.lg, borderRadius: RADIUS.md, gap: SPACING.sm, marginBottom: SPACING.xxl },
  locationNoteText: { color: COLORS.primary, fontSize: TYPOGRAPHY.caption, flex: 1 },
});
