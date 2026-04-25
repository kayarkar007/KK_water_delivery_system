import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY, SPACING, SHADOWS } from '../theme';

const StatCard = ({ 
  title, 
  value, 
  subtitle,
  icon, 
  color = COLORS.primary, 
  size = 'normal',
  trend,
}) => {
  const isLarge = size === 'large';

  return (
    <View style={[
      styles.container, 
      isLarge && styles.largeContainer,
      { borderColor: color + '30' }
    ]}>
      {/* Glow effect */}
      <View style={[styles.glow, { backgroundColor: color + '10' }]} />
      
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={isLarge ? 28 : 22} color={color} />
      </View>
      
      {/* Value */}
      <Text style={[styles.value, isLarge && styles.largeValue, { color }]}>
        {value}
      </Text>
      
      {/* Title */}
      <Text style={[styles.title, isLarge && styles.largeTitle]}>
        {title}
      </Text>
      
      {/* Subtitle or Trend */}
      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
      
      {trend ? (
        <View style={[styles.trendBadge, { 
          backgroundColor: trend > 0 ? COLORS.success + '20' : COLORS.danger + '20' 
        }]}>
          <Ionicons 
            name={trend > 0 ? 'trending-up' : 'trending-down'} 
            size={12} 
            color={trend > 0 ? COLORS.success : COLORS.danger} 
          />
          <Text style={[styles.trendText, { 
            color: trend > 0 ? COLORS.success : COLORS.danger 
          }]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    minWidth: '46%',
    flex: 1,
  },
  largeContainer: {
    padding: SPACING.xl,
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  value: {
    fontSize: TYPOGRAPHY.heading2,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.xs,
  },
  largeValue: {
    fontSize: TYPOGRAPHY.heading1,
  },
  title: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.medium,
  },
  largeTitle: {
    fontSize: TYPOGRAPHY.bodySmall,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.tiny,
    marginTop: SPACING.xs,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    gap: 4,
  },
  trendText: {
    fontSize: TYPOGRAPHY.tiny,
    fontWeight: TYPOGRAPHY.semibold,
  },
});

export default StatCard;
