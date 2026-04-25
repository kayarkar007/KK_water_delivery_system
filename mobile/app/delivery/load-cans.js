import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';
import Header from '../../src/components/Header';
import CanCounter from '../../src/components/CanCounter';
import SwipeButton from '../../src/components/SwipeButton';
import { customerAPI, deliveryAPI } from '../../src/api/apiClient';
import useStore from '../../src/store/useStore';

export default function LoadCansScreen() {
  const router = useRouter();
  const { setActiveDelivery } = useStore();
  const [normalCans, setNormalCans] = useState(0);
  const [coolCans, setCoolCans] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [delivery, setDelivery] = useState(null);

  useFocusEffect(useCallback(() => {
    fetchData();
  }, []));

  const fetchData = async () => {
    try {
      const custRes = await customerAPI.getAll({ active: true });
      setCustomers(custRes?.data || []);

      // Get or create today's delivery
      let delRes = await deliveryAPI.getToday();
      if (!delRes?.data) {
        delRes = await deliveryAPI.startDay();
      }
      setDelivery(delRes?.data);
    } catch (e) { console.log(e); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map(c => c._id));
    }
  };

  const handleStartTrip = async () => {
    if (normalCans === 0 && coolCans === 0) {
      Alert.alert('Cans Load Karo', 'Kam se kam ek can toh load karo!');
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert('Customers Select Karo', 'Kam se kam ek customer select karo!');
      return;
    }

    try {
      const res = await deliveryAPI.startTrip({
        deliveryId: delivery._id,
        normalCansLoaded: normalCans,
        coolCansLoaded: coolCans,
        customerIds: selectedIds,
      });

      if (res?.data) {
        setActiveDelivery(res.data);
        router.replace('/delivery/active');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Trip start nahi ho paya');
    }
  };

  const tripNumber = (delivery?.trips?.length || 0) + 1;

  return (
    <View style={styles.container}>
      <Header title={`Trip ${tripNumber} - Cans Load`} subtitle="Kitne cans leke ja rahe ho?" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Trip Number Banner */}
        <View style={styles.tripBanner}>
          <Ionicons name="flag" size={22} color={COLORS.primary} />
          <Text style={styles.tripText}>Trip {tripNumber}</Text>
          {tripNumber > 1 && (
            <Text style={styles.tripSubtext}>Previous trip complete ✅</Text>
          )}
        </View>

        {/* Can Counters */}
        <CanCounter
          label="Normal Cans 💧"
          value={normalCans}
          onIncrement={setNormalCans}
          onDecrement={setNormalCans}
          color={COLORS.normalCan}
          icon="water"
        />

        <CanCounter
          label="Cool Cans ❄️"
          value={coolCans}
          onIncrement={setCoolCans}
          onDecrement={setCoolCans}
          color={COLORS.coolCan}
          icon="snow"
        />

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Cans Loading</Text>
          <Text style={styles.totalValue}>{normalCans + coolCans}</Text>
        </View>

        {/* Customer Selection */}
        <View style={styles.customerSection}>
          <View style={styles.customerHeader}>
            <Text style={styles.sectionTitle}>
              👥 Customers Select Karo ({selectedIds.length}/{customers.length})
            </Text>
            <TouchableOpacity onPress={selectAll}>
              <Text style={styles.selectAllText}>
                {selectedIds.length === customers.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>

          {customers.map(customer => {
            const isSelected = selectedIds.includes(customer._id);
            return (
              <TouchableOpacity
                key={customer._id}
                style={[styles.customerItem, isSelected && styles.customerSelected]}
                onPress={() => toggleSelect(customer._id)}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerAddress}>{customer.address}</Text>
                </View>
                {customer.location?.latitude && (
                  <Ionicons name="location" size={16} color={COLORS.success} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Swipe Button */}
      <View style={styles.bottomBar}>
        <SwipeButton
          title={`🚚 Start Trip ${tripNumber} - Swipe Karo →`}
          onSwipe={handleStartTrip}
          color={COLORS.success}
          icon="navigate"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: SPACING.xl },
  tripBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '15', padding: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.xl, gap: SPACING.md },
  tripText: { color: COLORS.primary, fontSize: TYPOGRAPHY.heading4, fontWeight: '700', flex: 1 },
  tripSubtext: { color: COLORS.success, fontSize: TYPOGRAPHY.caption },
  totalCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.primary + '30' },
  totalLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.bodySmall },
  totalValue: { color: COLORS.primary, fontSize: 48, fontWeight: '700' },
  customerSection: { marginTop: SPACING.md },
  customerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.body, fontWeight: '700' },
  selectAllText: { color: COLORS.primary, fontSize: TYPOGRAPHY.caption, fontWeight: '600' },
  customerItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  customerSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.textMuted, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  customerInfo: { flex: 1 },
  customerName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.bodySmall, fontWeight: '600' },
  customerAddress: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.tiny, marginTop: 2 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.xl, paddingBottom: SPACING.xxxl, backgroundColor: COLORS.bgSecondary, borderTopWidth: 1, borderTopColor: COLORS.border },
});
