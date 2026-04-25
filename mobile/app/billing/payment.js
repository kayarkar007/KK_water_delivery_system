import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, CONSTANTS } from '../../src/theme';
import Header from '../../src/components/Header';
import { ActionButton } from '../../src/components/SharedUI';
import { billingAPI, customerAPI } from '../../src/api/apiClient';

export default function PaymentScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll({ active: true });
      setCustomers(res?.data || []);
    } catch (e) { console.log(e); }
  };

  const handlePay = async () => {
    if (!selectedCustomer) { Alert.alert('Error', 'Customer select karo'); return; }
    if (!amount || parseFloat(amount) <= 0) { Alert.alert('Error', 'Amount dalo'); return; }
    try {
      setLoading(true);
      await billingAPI.addPayment({
        customerId: selectedCustomer._id,
        amount: parseFloat(amount),
        mode,
        note,
      });
      Alert.alert('Success ✅', `₹${amount} payment ${selectedCustomer.name} ke liye recorded!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  const filtered = customers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  return (
    <View style={styles.container}>
      <Header title="💳 Record Payment" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Customer */}
        <Text style={styles.stepTitle}>1. Customer Select Karo</Text>
        {selectedCustomer ? (
          <TouchableOpacity style={styles.selectedCard} onPress={() => setSelectedCustomer(null)}>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>{selectedCustomer.name}</Text>
              <Text style={styles.selectedPending}>Pending: ₹{selectedCustomer.pendingAmount || 0}</Text>
            </View>
            <Ionicons name="close-circle" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={COLORS.textMuted} />
              <TextInput style={styles.searchInput} placeholder="Customer search karo..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
            </View>
            <View style={styles.customerList}>
              {filtered.slice(0, 8).map(c => (
                <TouchableOpacity key={c._id} style={styles.custItem} onPress={() => { setSelectedCustomer(c); setSearch(''); }}>
                  <Text style={styles.custName}>{c.name}</Text>
                  <Text style={styles.custPending}>₹{c.pendingAmount || 0}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Step 2: Amount */}
        <Text style={styles.stepTitle}>2. Amount Dalo (₹)</Text>
        <TextInput style={styles.amountInput} placeholder="0" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={amount} onChangeText={setAmount} />

        {/* Step 3: Payment Mode */}
        <Text style={styles.stepTitle}>3. Payment Mode</Text>
        <View style={styles.modeRow}>
          {CONSTANTS.PAYMENT_MODES.map(m => (
            <TouchableOpacity key={m.id} style={[styles.modeBtn, mode === m.id && styles.modeBtnActive]} onPress={() => setMode(m.id)}>
              <Text style={[styles.modeBtnText, mode === m.id && styles.modeBtnTextActive]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 4: Note */}
        <Text style={styles.stepTitle}>4. Note (Optional)</Text>
        <TextInput style={styles.noteInput} placeholder="Koi note..." placeholderTextColor={COLORS.textMuted} value={note} onChangeText={setNote} />

        <ActionButton title="✅ Payment Record Karo" color={COLORS.success} size="large" fullWidth loading={loading} onPress={handlePay} />
        <View style={{height:40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:COLORS.bgPrimary },
  content: { padding:SPACING.xl },
  stepTitle: { color:COLORS.textPrimary, fontSize:TYPOGRAPHY.body, fontWeight:'700', marginTop:SPACING.xl, marginBottom:SPACING.md },
  selectedCard: { flexDirection:'row', alignItems:'center', backgroundColor:COLORS.primary+'15', borderRadius:RADIUS.lg, padding:SPACING.lg, borderWidth:1, borderColor:COLORS.primary+'40' },
  selectedInfo: { flex:1 },
  selectedName: { color:COLORS.primary, fontSize:TYPOGRAPHY.body, fontWeight:'700' },
  selectedPending: { color:COLORS.danger, fontSize:TYPOGRAPHY.caption, marginTop:2 },
  searchBar: { flexDirection:'row', alignItems:'center', backgroundColor:COLORS.bgInput, borderRadius:RADIUS.md, paddingHorizontal:SPACING.lg, height:44, gap:SPACING.sm, borderWidth:1, borderColor:COLORS.border },
  searchInput: { flex:1, color:COLORS.textPrimary, fontSize:TYPOGRAPHY.bodySmall },
  customerList: { marginTop:SPACING.sm },
  custItem: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:SPACING.md, borderBottomWidth:1, borderBottomColor:COLORS.border },
  custName: { color:COLORS.textPrimary, fontSize:TYPOGRAPHY.bodySmall, fontWeight:'600' },
  custPending: { color:COLORS.danger, fontSize:TYPOGRAPHY.caption },
  amountInput: { backgroundColor:COLORS.bgInput, borderRadius:RADIUS.lg, padding:SPACING.xl, fontSize:32, fontWeight:'700', color:COLORS.textPrimary, textAlign:'center', borderWidth:1, borderColor:COLORS.border },
  modeRow: { flexDirection:'row', gap:SPACING.sm },
  modeBtn: { flex:1, paddingVertical:SPACING.md, borderRadius:RADIUS.md, alignItems:'center', backgroundColor:COLORS.bgCard, borderWidth:1, borderColor:COLORS.border },
  modeBtnActive: { backgroundColor:COLORS.primary+'20', borderColor:COLORS.primary },
  modeBtnText: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.tiny, fontWeight:'600' },
  modeBtnTextActive: { color:COLORS.primary },
  noteInput: { backgroundColor:COLORS.bgInput, borderRadius:RADIUS.lg, padding:SPACING.lg, color:COLORS.textPrimary, fontSize:TYPOGRAPHY.bodySmall, borderWidth:1, borderColor:COLORS.border, marginBottom:SPACING.xxl },
});
