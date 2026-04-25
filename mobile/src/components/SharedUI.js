import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY, SPACING } from '../theme';

// ─── Loading Overlay ─────────────────────────────────
export const LoadingOverlay = ({ visible, message = 'Loading...' }) => {
  if (!visible) return null;
  return (
    <View style={loadingStyles.overlay}>
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={loadingStyles.text}>{message}</Text>
      </View>
    </View>
  );
};

const loadingStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.bodySmall,
    marginTop: SPACING.lg,
  },
});

// ─── Empty State ─────────────────────────────────────
export const EmptyState = ({ icon = 'water-outline', title, message, actionText, onAction }) => (
  <View style={emptyStyles.container}>
    <View style={emptyStyles.iconBg}>
      <Ionicons name={icon} size={48} color={COLORS.primary} />
    </View>
    <Text style={emptyStyles.title}>{title}</Text>
    <Text style={emptyStyles.message}>{message}</Text>
    {actionText ? (
      <TouchableOpacity style={emptyStyles.button} onPress={onAction}>
        <Text style={emptyStyles.buttonText}>{actionText}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading3,
    fontWeight: TYPOGRAPHY.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
  },
});

// ─── Action Button ──────────────────────────────────
export const ActionButton = ({ 
  title, 
  onPress, 
  icon, 
  color = COLORS.primary, 
  variant = 'filled', // 'filled' | 'outline' | 'ghost'
  size = 'normal', // 'small' | 'normal' | 'large'
  disabled = false,
  fullWidth = false,
  loading = false,
}) => {
  const isFilled = variant === 'filled';
  const isOutline = variant === 'outline';
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <TouchableOpacity
      style={[
        btnStyles.button,
        isFilled && { backgroundColor: color },
        isOutline && { borderColor: color, borderWidth: 1.5 },
        !isFilled && !isOutline && { backgroundColor: color + '15' },
        isSmall && btnStyles.small,
        isLarge && btnStyles.large,
        fullWidth && { width: '100%' },
        disabled && btnStyles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFilled ? COLORS.white : color} />
      ) : (
        <>
          {icon ? (
            <Ionicons 
              name={icon} 
              size={isSmall ? 16 : 20} 
              color={isFilled ? COLORS.white : color} 
            />
          ) : null}
          <Text style={[
            btnStyles.text,
            { color: isFilled ? COLORS.white : color },
            isSmall && btnStyles.smallText,
            isLarge && btnStyles.largeText,
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const btnStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  small: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  large: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
  },
  smallText: {
    fontSize: TYPOGRAPHY.caption,
  },
  largeText: {
    fontSize: TYPOGRAPHY.body,
  },
});

// ─── Info Row ───────────────────────────────────────
export const InfoRow = ({ label, value, icon, color }) => (
  <View style={infoStyles.row}>
    {icon ? <Ionicons name={icon} size={16} color={color || COLORS.textMuted} /> : null}
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={[infoStyles.value, color && { color }]}>{value}</Text>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  label: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.bodySmall,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
