import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY, SPACING, SHADOWS } from '../theme';

const CustomerCard = ({
  customer,
  onPress,
  onDeliverPress,
  showDeliveryInfo = false,
  deliveryStatus = 'pending',
  cansToDeliver = { normal: 0, cool: 0 },
  compact = false,
}) => {
  const isPending = deliveryStatus === 'pending';
  const isDelivered = deliveryStatus === 'delivered';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDelivered && styles.deliveredContainer,
        compact && styles.compactContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left indicator */}
      <View style={[
        styles.indicator,
        { backgroundColor: isDelivered ? COLORS.success : isPending ? COLORS.warning : COLORS.textMuted }
      ]} />

      <View style={styles.content}>
        {/* Top Row: Name + Status */}
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{customer.name}</Text>
            {customer.phone ? (
              <Text style={styles.phone}>{customer.phone}</Text>
            ) : null}
          </View>
          {showDeliveryInfo && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: isDelivered ? COLORS.successGlow : COLORS.primaryGlow }
            ]}>
              <Text style={[
                styles.statusText,
                { color: isDelivered ? COLORS.success : COLORS.primary }
              ]}>
                {isDelivered ? '✅ Delivered' : '⏳ Pending'}
              </Text>
            </View>
          )}
        </View>

        {/* Address */}
        {!compact && customer.address ? (
          <Text style={styles.address} numberOfLines={1}>
            📍 {customer.address}
          </Text>
        ) : null}

        {/* Can Balance Row */}
        <View style={styles.cansRow}>
          <View style={styles.canBadge}>
            <Ionicons name="water" size={14} color={COLORS.normalCan} />
            <Text style={styles.canText}>
              {customer.normalCansBalance || 0} Normal
            </Text>
          </View>
          <View style={[styles.canBadge, { backgroundColor: COLORS.secondary + '15' }]}>
            <Ionicons name="snow" size={14} color={COLORS.coolCan} />
            <Text style={[styles.canText, { color: COLORS.coolCan }]}>
              {customer.coolCansBalance || 0} Cool
            </Text>
          </View>
          {showDeliveryInfo && (
            <View style={[styles.canBadge, { backgroundColor: COLORS.warning + '15' }]}>
              <Text style={[styles.canText, { color: COLORS.warning }]}>
                Monthly: {customer.monthlyNormalCans || 0}+{customer.monthlyCoolCans || 0}
              </Text>
            </View>
          )}
        </View>

        {/* Billing Info */}
        {!compact && customer.pendingAmount > 0 ? (
          <View style={styles.billingRow}>
            <Text style={styles.billingText}>
              💰 Pending: <Text style={styles.billingAmount}>₹{customer.pendingAmount}</Text>
            </Text>
          </View>
        ) : null}
      </View>

      {/* Deliver Button / Arrow */}
      <View style={styles.actionContainer}>
        {showDeliveryInfo && isPending && onDeliverPress ? (
          <TouchableOpacity
            style={styles.deliverButton}
            onPress={() => onDeliverPress(customer)}
          >
            <Ionicons name="cube" size={20} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deliveredContainer: {
    borderColor: COLORS.success + '40',
    backgroundColor: COLORS.success + '08',
  },
  compactContainer: {
    marginBottom: SPACING.sm,
  },
  indicator: {
    width: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading4,
    fontWeight: TYPOGRAPHY.semibold,
  },
  phone: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.caption,
    marginTop: 2,
  },
  address: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.caption,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.semibold,
  },
  cansRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  canBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  canText: {
    color: COLORS.normalCan,
    fontSize: TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.medium,
  },
  billingRow: {
    marginTop: SPACING.sm,
  },
  billingText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.caption,
  },
  billingAmount: {
    color: COLORS.danger,
    fontWeight: TYPOGRAPHY.bold,
  },
  actionContainer: {
    paddingRight: SPACING.lg,
    justifyContent: 'center',
  },
  deliverButton: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
});

export default CustomerCard;
