import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, CONSTANTS } from '../../src/theme';
import { ActionButton } from '../../src/components/SharedUI';
import { deliveryAPI } from '../../src/api/apiClient';
import useStore from '../../src/store/useStore';

export default function DeliveryScreen() {
  const router = useRouter();
  const [todayDelivery, setTodayDelivery] = useState(null);
  const { setActiveDelivery } = useStore();

  const fetchTodayDelivery = async () => {
    try {
      const res = await deliveryAPI.getToday();
      setTodayDelivery(res?.data);
      if (res?.data) {
        setActiveDelivery(res.data);
      }
    } catch (error) {
      console.log('Fetch delivery error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTodayDelivery();
    }, [])
  );

  const handleStartNewDelivery = async () => {
    try {
      const res = await deliveryAPI.startDay();
      if (res?.data) {
        setActiveDelivery(res.data);
        router.push('/delivery/load-cans');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Delivery start nahi ho payi');
    }
  };

  const isActive = todayDelivery?.status === 'in_progress';
  const isCompleted = todayDelivery?.status === 'completed';
  const hasTrips = todayDelivery?.trips?.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🚚 Delivery</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </Text>
        </View>

        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={[styles.statusIndicator, { 
            backgroundColor: isActive ? COLORS.success : isCompleted ? COLORS.primary : COLORS.warning 
          }]} />
          <Text style={styles.statusText}>
            {isActive ? '🟢 Delivery Chal Rahi Hai' : 
             isCompleted ? '✅ Aaj Ki Delivery Complete' : 
             '⏳ Delivery Abhi Start Nahi Hui'}
          </Text>
        </View>

        {/* Active Delivery Card */}
        {isActive && (
          <View style={styles.activeCard}>
            <Text style={styles.cardTitle}>Current Delivery Status</Text>
            
            {/* Trip info */}
            <View style={styles.tripInfo}>
              <View style={styles.tripStat}>
                <Text style={styles.tripStatValue}>{todayDelivery.trips.length}</Text>
                <Text style={styles.tripStatLabel}>Trips</Text>
              </View>
              <View style={styles.tripDivider} />
              <View style={styles.tripStat}>
                <Text style={styles.tripStatValue}>{todayDelivery.totalNormalCansDelivered || 0}</Text>
                <Text style={styles.tripStatLabel}>Normal</Text>
              </View>
              <View style={styles.tripDivider} />
              <View style={styles.tripStat}>
                <Text style={styles.tripStatValue}>{todayDelivery.totalCoolCansDelivered || 0}</Text>
                <Text style={styles.tripStatLabel}>Cool</Text>
              </View>
              <View style={styles.tripDivider} />
              <View style={styles.tripStat}>
                <Text style={styles.tripStatValue}>{todayDelivery.totalCustomersServed || 0}</Text>
                <Text style={styles.tripStatLabel}>Served</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <ActionButton
                title="Continue Delivery"
                icon="navigate"
                color={COLORS.success}
                fullWidth
                onPress={() => router.push('/delivery/active')}
              />
            </View>
            <View style={styles.actionRow}>
              <ActionButton
                title="Load More Cans (Next Trip)"
                icon="add-circle"
                color={COLORS.primary}
                variant="outline"
                fullWidth
                onPress={() => router.push('/delivery/load-cans')}
              />
            </View>
          </View>
        )}

        {/* Completed Delivery Card */}
        {isCompleted && (
          <View style={styles.completedCard}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
            <Text style={styles.completedTitle}>Delivery Complete! 🎉</Text>
            <Text style={styles.completedStats}>
              {todayDelivery.trips.length} trips • {todayDelivery.totalCustomersServed} customers • {' '}
              {(todayDelivery.totalNormalCansDelivered || 0) + (todayDelivery.totalCoolCansDelivered || 0)} cans
            </Text>
            <ActionButton
              title="View Summary"
              icon="document-text"
              color={COLORS.primary}
              onPress={() => router.push('/delivery/summary')}
            />
          </View>
        )}

        {/* Start New Delivery */}
        {!isActive && !isCompleted && (
          <View style={styles.startCard}>
            <View style={styles.startIconContainer}>
              <Ionicons name="water" size={72} color={COLORS.primary} />
            </View>
            <Text style={styles.startTitle}>Delivery Start Karo</Text>
            <Text style={styles.startSubtitle}>
              Pehle cans load karo, phir customers ko deliver karo
            </Text>
            <ActionButton
              title="🚀 Cans Load Karo"
              icon="cube"
              color={COLORS.primary}
              size="large"
              fullWidth
              onPress={handleStartNewDelivery}
            />
          </View>
        )}

        {/* Trip History - Today's trips */}
        {hasTrips && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aaj Ki Trips</Text>
            {todayDelivery.trips.map((trip, index) => (
              <View key={index} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripTitle}>Trip {trip.tripNumber}</Text>
                  <View style={[styles.tripBadge, { 
                    backgroundColor: trip.status === 'completed' ? COLORS.success + '20' : COLORS.warning + '20' 
                  }]}>
                    <Text style={[styles.tripBadgeText, { 
                      color: trip.status === 'completed' ? COLORS.success : COLORS.warning 
                    }]}>
                      {trip.status === 'completed' ? '✅ Done' : '⏳ Active'}
                    </Text>
                  </View>
                </View>
                <View style={styles.tripDetails}>
                  <Text style={styles.tripDetailText}>
                    📦 Loaded: {trip.normalCansLoaded}N + {trip.coolCansLoaded}C
                  </Text>
                  <Text style={styles.tripDetailText}>
                    ✅ Delivered: {trip.normalCansDelivered}N + {trip.coolCansDelivered}C
                  </Text>
                  <Text style={styles.tripDetailText}>
                    👥 Customers: {trip.deliveries?.filter(d => d.status === 'delivered').length || 0} served
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

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
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading2,
    fontWeight: TYPOGRAPHY.bold,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.bodySmall,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
  },
  activeCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading4,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.lg,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tripStat: {
    flex: 1,
    alignItems: 'center',
  },
  tripStatValue: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading3,
    fontWeight: TYPOGRAPHY.bold,
  },
  tripStatLabel: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.tiny,
    marginTop: 2,
  },
  tripDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  actionRow: {
    marginBottom: SPACING.md,
  },
  completedCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
    gap: SPACING.lg,
  },
  completedTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading3,
    fontWeight: TYPOGRAPHY.bold,
  },
  completedStats: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.bodySmall,
    textAlign: 'center',
  },
  startCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  startIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  startTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading3,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.sm,
  },
  startSubtitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    lineHeight: 22,
  },
  section: {
    padding: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading4,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.lg,
  },
  tripCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tripTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.bold,
  },
  tripBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  tripBadgeText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.semibold,
  },
  tripDetails: {
    gap: SPACING.xs,
  },
  tripDetailText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.bodySmall,
  },
});
