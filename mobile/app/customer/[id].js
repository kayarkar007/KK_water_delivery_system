import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';
import Header from '../../src/components/Header';
import { ActionButton, InfoRow } from '../../src/components/SharedUI';
import { customerAPI } from '../../src/api/apiClient';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchCustomer();
    fetchHistory();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await customerAPI.getById(id);
      setCustomer(res?.data);
    } catch (e) { console.log(e); }
  };

  const fetchHistory = async () => {
    try {
      const res = await customerAPI.getHistory(id);
      setHistory(res?.data || []);
    } catch (e) { console.log(e); }
  };

  const handleSetLocation = () => {
    router.push({ pathname: '/customer/location', params: { customerId: id } });
  };

  const handleDelete = () => {
    Alert.alert('Delete Customer?', `Kya "${customer.name}" ko delete karna hai?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await customerAPI.delete(id);
          router.back();
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  if (!customer) return (
    <View style={styles.container}>
      <Header title="Loading..." showBack />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title={customer.name} showBack rightIcon="trash-outline" onRightPress={handleDelete} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{customer.name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.phone}>📞 {customer.phone}</Text>
          <Text style={styles.address}>📍 {customer.address}</Text>
          
          {customer.location?.latitude ? (
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={14} color={COLORS.success} />
              <Text style={styles.locationText}>GPS Location Set ✅</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.setLocationBtn} onPress={handleSetLocation}>
              <Ionicons name="navigate" size={16} color={COLORS.primary} />
              <Text style={styles.setLocationText}>📍 GPS Location Set Karo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Can Balance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🥤 Can Balance</Text>
          <View style={styles.canGrid}>
            <View style={[styles.canCard, { borderColor: COLORS.normalCan + '30' }]}>
              <Ionicons name="water" size={24} color={COLORS.normalCan} />
              <Text style={[styles.canValue, { color: COLORS.normalCan }]}>{customer.normalCansBalance}</Text>
              <Text style={styles.canLabel}>Normal</Text>
            </View>
            <View style={[styles.canCard, { borderColor: COLORS.coolCan + '30' }]}>
              <Ionicons name="snow" size={24} color={COLORS.coolCan} />
              <Text style={[styles.canValue, { color: COLORS.coolCan }]}>{customer.coolCansBalance}</Text>
              <Text style={styles.canLabel}>Cool</Text>
            </View>
          </View>
          <View style={styles.monthlyRow}>
            <Text style={styles.monthlyLabel}>This Month:</Text>
            <Text style={styles.monthlyValue}>{customer.monthlyNormalCans}N + {customer.monthlyCoolCans}C</Text>
          </View>
        </View>

        {/* Billing Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Billing</Text>
          <InfoRow label="Total Bill" value={`₹${customer.totalBillAmount}`} icon="receipt" color={COLORS.primary} />
          <InfoRow label="Total Paid" value={`₹${customer.totalPaidAmount}`} icon="checkmark-circle" color={COLORS.success} />
          <InfoRow label="Pending Amount" value={`₹${customer.pendingAmount}`} icon="alert-circle" color={customer.pendingAmount > 0 ? COLORS.danger : COLORS.success} />
          <View style={styles.rateInfo}>
            <Text style={styles.rateText}>Normal: ₹{customer.pricePerNormalCan}/can</Text>
            <Text style={styles.rateText}>Cool: ₹{customer.pricePerCoolCan}/can</Text>
          </View>
        </View>

        {/* Delivery History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Recent Deliveries</Text>
          {history.length > 0 ? (
            history.slice(0, 10).map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyDate}>{h.date}</Text>
                <Text style={styles.historyDetail}>N:{h.normalCans} C:{h.coolCans}</Text>
                <Text style={styles.historyTime}>
                  {h.deliveredAt ? new Date(h.deliveredAt).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) : '-'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noHistory}>Koi delivery history nahi hai</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <ActionButton title="📍 Set Location" icon="navigate" color={COLORS.primary} variant="outline" onPress={handleSetLocation} />
          <ActionButton title="🗑️ Delete" icon="trash" color={COLORS.danger} variant="ghost" onPress={handleDelete} />
        </View>
        <View style={{height:40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: SPACING.xl },
  profileCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  avatarText: { color: COLORS.primary, fontSize: 30, fontWeight: '700' },
  name: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.heading3, fontWeight: '700' },
  phone: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.bodySmall, marginTop: SPACING.xs },
  address: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.caption, marginTop: SPACING.xs, textAlign: 'center' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success + '15', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, marginTop: SPACING.md, gap: 4 },
  locationText: { color: COLORS.success, fontSize: TYPOGRAPHY.caption, fontWeight: '600' },
  setLocationBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, marginTop: SPACING.md, gap: 4 },
  setLocationText: { color: COLORS.primary, fontSize: TYPOGRAPHY.caption, fontWeight: '600' },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  cardTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.heading4, fontWeight: '700', marginBottom: SPACING.lg },
  canGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  canCard: { flex: 1, alignItems: 'center', padding: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1, backgroundColor: COLORS.bgPrimary, gap: SPACING.sm },
  canValue: { fontSize: TYPOGRAPHY.heading2, fontWeight: '700' },
  canLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.tiny },
  monthlyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  monthlyLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.bodySmall },
  monthlyValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.bodySmall, fontWeight: '600' },
  rateInfo: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  rateText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.caption },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyDate: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.caption, flex: 1 },
  historyDetail: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.caption, fontWeight: '600' },
  historyTime: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.caption, width: 60, textAlign: 'right' },
  noHistory: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.bodySmall, textAlign: 'center', padding: SPACING.xl },
  actionsRow: { flexDirection: 'row', gap: SPACING.md, justifyContent: 'center' },
});
