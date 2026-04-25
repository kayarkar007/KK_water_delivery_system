import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';
import CustomerCard from '../../src/components/CustomerCard';
import { EmptyState } from '../../src/components/SharedUI';
import { customerAPI } from '../../src/api/apiClient';
import { LocalCache } from '../../src/utils/offlineManager';

const FILTERS = [
  { id: 'all', label: '🔹 All' },
  { id: 'pending', label: '💰 Pending Bill' },
  { id: 'no_location', label: '📍 No Location' },
  { id: 'high_balance', label: '📦 High Balance' },
  { id: 'recent', label: '🕐 Recent' },
];

export default function CustomersScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getAll({ active: true });
      const data = res?.data || [];
      setCustomers(data);
      // Cache for offline
      await LocalCache.cacheCustomers(data);
    } catch (error) {
      console.log('Fetch error, trying cache:', error);
      const cached = await LocalCache.getCachedCustomers();
      if (cached) setCustomers(cached);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCustomers(); }, []));

  // Apply search + filter
  const filteredCustomers = customers.filter(c => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchSearch = c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.address?.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    // Category filter
    switch (activeFilter) {
      case 'pending': return (c.pendingAmount || 0) > 0;
      case 'no_location': return !c.location?.latitude;
      case 'high_balance': return (c.normalCansBalance || 0) + (c.coolCansBalance || 0) >= 5;
      case 'recent': {
        const diff = Date.now() - new Date(c.updatedAt || c.createdAt).getTime();
        return diff < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      }
      default: return true;
    }
  });

  // Sort: pending bills first
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (activeFilter === 'pending') return (b.pendingAmount || 0) - (a.pendingAmount || 0);
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👥 Customers</Text>
        <Text style={styles.count}>{sortedCustomers.length}/{customers.length}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search naam, phone, address..." placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/customer/add')}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === item.id && styles.filterActive]}
              onPress={() => setActiveFilter(item.id)}
            >
              <Text style={[styles.filterText, activeFilter === item.id && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Customer List */}
      <FlatList
        data={sortedCustomers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CustomerCard customer={item} onPress={() => router.push(`/customer/${item._id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState icon="people-outline" title="Koi Customer Nahi" message={search || activeFilter !== 'all' ? 'Is filter me koi customer nahi mila' : 'Naya customer add karein'} actionText="+ Customer Add Karo" onAction={() => router.push('/customer/add')} />
        }
        onRefresh={fetchCustomers}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.huge, paddingBottom: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.heading2, fontWeight: TYPOGRAPHY.bold },
  count: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.bodySmall },
  searchContainer: { flexDirection: 'row', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.sm, gap: SPACING.md },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgInput, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, height: 48, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.bodySmall },
  addButton: { width: 48, height: 48, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  filterRow: { paddingBottom: SPACING.md },
  filterList: { paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.caption, fontWeight: '600' },
  filterTextActive: { color: COLORS.primary },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
});
