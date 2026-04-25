import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, CONSTANTS } from '../../src/theme';
import StatCard from '../../src/components/StatCard';
import { customerAPI, deliveryAPI, billingAPI } from '../../src/api/apiClient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    todayDelivered: 0,
    pendingBills: 0,
    totalCansToday: 0,
    todayTrips: 0,
    activeDelivery: null,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const fetchDashboardData = async () => {
    try {
      // Fetch customers count
      const custRes = await customerAPI.getAll({ active: true });
      const customerCount = custRes?.data?.length || 0;

      // Fetch today's delivery
      const todayRes = await deliveryAPI.getToday();
      const todayDelivery = todayRes?.data;

      // Fetch billing summary
      const billRes = await billingAPI.getSummary();
      const pendingAmount = billRes?.summary?.totalPending || 0;

      setStats({
        totalCustomers: customerCount,
        todayDelivered: todayDelivery?.totalCustomersServed || 0,
        pendingBills: pendingAmount,
        totalCansToday: (todayDelivery?.totalNormalCansDelivered || 0) + (todayDelivery?.totalCoolCansDelivered || 0),
        todayTrips: todayDelivery?.trips?.length || 0,
        activeDelivery: todayDelivery?.status === 'in_progress' ? todayDelivery : null,
      });
    } catch (error) {
      console.log('Dashboard fetch error:', error);
      // Use default values if API not available
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  const quickActions = [
    { id: 'delivery', title: 'Start Delivery', subtitle: 'Delivery shuru karo', icon: 'water', color: COLORS.primary, route: '/delivery/load-cans' },
    { id: 'customer', title: 'Add Customer', subtitle: 'Naya customer add karo', icon: 'person-add', color: COLORS.success, route: '/customer/add' },
    { id: 'payment', title: 'Record Payment', subtitle: 'Payment entry karo', icon: 'cash', color: COLORS.warning, route: '/billing/payment' },
    { id: 'report', title: 'Daily Report', subtitle: 'Aaj ki report dekho', icon: 'document-text', color: COLORS.secondary, route: '/(tabs)/reports' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>🚰 {CONSTANTS.BUSINESS_NAME}</Text>
              <Text style={styles.date}>{dateStr}</Text>
            </View>
            <TouchableOpacity 
              style={styles.settingsBtn}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Delivery Banner */}
        {stats.activeDelivery && (
          <TouchableOpacity 
            style={styles.activeBanner}
            onPress={() => router.push('/delivery/active')}
          >
            <View style={styles.activePulse} />
            <Ionicons name="navigate-circle" size={28} color={COLORS.success} />
            <View style={styles.activeBannerText}>
              <Text style={styles.activeBannerTitle}>🚚 Delivery Chal Rahi Hai!</Text>
              <Text style={styles.activeBannerSub}>
                Trip {stats.activeDelivery.currentTripNumber} • Tap to continue
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.success} />
          </TouchableOpacity>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Customers"
              value={stats.totalCustomers}
              icon="people"
              color={COLORS.primary}
            />
            <StatCard
              title="Today Delivered"
              value={stats.todayDelivered}
              icon="checkmark-circle"
              color={COLORS.success}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Today's Cans"
              value={stats.totalCansToday}
              icon="water"
              color={COLORS.primaryLight}
              subtitle={`${stats.todayTrips} trips`}
            />
            <StatCard
              title="Pending Bills"
              value={`₹${stats.pendingBills}`}
              icon="wallet"
              color={COLORS.danger}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon} size={26} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Summary Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aaj Ka Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="water" size={18} color={COLORS.normalCan} />
                <Text style={styles.summaryLabel}>Normal Cans</Text>
                <Text style={[styles.summaryValue, { color: COLORS.normalCan }]}>
                  {stats.activeDelivery?.totalNormalCansDelivered || 0}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="snow" size={18} color={COLORS.coolCan} />
                <Text style={styles.summaryLabel}>Cool Cans</Text>
                <Text style={[styles.summaryValue, { color: COLORS.coolCan }]}>
                  {stats.activeDelivery?.totalCoolCansDelivered || 0}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="flag" size={18} color={COLORS.success} />
                <Text style={styles.summaryLabel}>Trips</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                  {stats.todayTrips}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading2,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xs,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.bodySmall,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '12',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
    gap: SPACING.md,
  },
  activePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  activeBannerText: {
    flex: 1,
  },
  activeBannerTitle: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.bold,
  },
  activeBannerSub: {
    color: COLORS.success + 'AA',
    fontSize: TYPOGRAPHY.caption,
    marginTop: 2,
  },
  statsGrid: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading4,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
    marginBottom: 2,
  },
  actionSubtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.tiny,
  },
  summaryCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.tiny,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.heading3,
    fontWeight: TYPOGRAPHY.bold,
  },
});
