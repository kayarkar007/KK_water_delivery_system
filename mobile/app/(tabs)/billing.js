import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, CONSTANTS } from '../../src/theme';
import { EmptyState } from '../../src/components/SharedUI';
import { billingAPI } from '../../src/api/apiClient';

export default function BillingScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0,
    totalCustomers: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const res = await billingAPI.getSummary();
      setCustomers(res?.data || []);
      setSummary(res?.summary || {
        totalBilled: 0,
        totalPaid: 0,
        totalPending: 0,
        totalCustomers: 0,
      });
    } catch (error) {
      console.log('Billing fetch error:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchBilling(); }, []));

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = query
      ? customers.filter((customer) =>
          customer.name?.toLowerCase().includes(query) ||
          customer.phone?.includes(query)
        )
      : customers;

    return [...list].sort((a, b) => (b.pendingAmount || 0) - (a.pendingAmount || 0));
  }, [customers, search]);

  const money = (value) => `${CONSTANTS.CURRENCY}${Number(value || 0).toLocaleString('en-IN')}`;

  const renderCustomer = ({ item }) => {
    const pending = item.pendingAmount || 0;
    return (
      <View style={styles.customerCard}>
        <View style={styles.customerTop}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.customerPhone}>{item.phone || 'No phone'}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: pending > 0 ? COLORS.danger + '15' : COLORS.success + '15' },
          ]}>
            <Text style={[
              styles.statusText,
              { color: pending > 0 ? COLORS.danger : COLORS.success },
            ]}>
              {pending > 0 ? 'Due' : 'Paid'}
            </Text>
          </View>
        </View>

        <View style={styles.amountGrid}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Bill</Text>
            <Text style={styles.amountValue}>{money(item.totalBillAmount)}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Paid</Text>
            <Text style={[styles.amountValue, { color: COLORS.success }]}>{money(item.totalPaidAmount)}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Pending</Text>
            <Text style={[styles.amountValue, { color: pending > 0 ? COLORS.danger : COLORS.success }]}>
              {money(pending)}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => router.push('/billing/payment')}
          >
            <Ionicons name="cash" size={18} color={COLORS.white} />
            <Text style={styles.payButtonText}>Record Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => router.push(`/customer/${item._id}`)}
          >
            <Ionicons name="person" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Billing</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/billing/payment')}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Billed</Text>
          <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{money(summary.totalBilled)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Paid</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>{money(summary.totalPaid)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Due</Text>
          <Text style={[styles.summaryValue, { color: COLORS.danger }]}>{money(summary.totalPending)}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customer or phone..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderCustomer}
        refreshing={loading}
        onRefresh={fetchBilling}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title="No Billing Data"
            message="Deliveries ke baad customer bills yahan dikhte hain."
            actionText="Record Payment"
            onAction={() => router.push('/billing/payment')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.heading2, fontWeight: '700' },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.tiny, marginBottom: SPACING.xs },
  summaryValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.bodySmall, fontWeight: '700' },
  summaryDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  searchContainer: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.bodySmall },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  customerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  customerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  customerInfo: { flex: 1 },
  customerName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.body, fontWeight: '700' },
  customerPhone: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.caption, marginTop: 2 },
  statusBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  statusText: { fontSize: TYPOGRAPHY.caption, fontWeight: '700' },
  amountGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  amountItem: { flex: 1 },
  amountLabel: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.tiny, marginBottom: 2 },
  amountValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.caption, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: SPACING.md },
  payButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  payButtonText: { color: COLORS.white, fontSize: TYPOGRAPHY.caption, fontWeight: '700' },
  detailButton: {
    width: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
