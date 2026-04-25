import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY, SPACING } from '../theme';

const CanCounter = ({
  label = 'Normal Cans',
  value = 0,
  onIncrement,
  onDecrement,
  color = COLORS.normalCan,
  icon = 'water',
  min = 0,
  max = 999,
  step = 1,
}) => {
  const handleDecrement = () => {
    if (value - step >= min && onDecrement) {
      onDecrement(value - step);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max && onIncrement) {
      onIncrement(value + step);
    }
  };

  return (
    <View style={[styles.container, { borderColor: color + '30' }]}>
      {/* Label Row */}
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* Counter Row */}
      <View style={styles.counterRow}>
        {/* Minus Button */}
        <TouchableOpacity
          style={[styles.button, styles.minusButton, value <= min && styles.buttonDisabled]}
          onPress={handleDecrement}
          disabled={value <= min}
          activeOpacity={0.6}
        >
          <Ionicons name="remove" size={24} color={value <= min ? COLORS.textMuted : COLORS.white} />
        </TouchableOpacity>

        {/* Value Display */}
        <View style={[styles.valueContainer, { backgroundColor: color + '15' }]}>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.unit}>Cans</Text>
        </View>

        {/* Plus Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: color }, value >= max && styles.buttonDisabled]}
          onPress={handleIncrement}
          disabled={value >= max}
          activeOpacity={0.6}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Quick buttons */}
      <View style={styles.quickRow}>
        {[5, 10, 20].map(num => (
          <TouchableOpacity
            key={num}
            style={[styles.quickButton, { borderColor: color + '40' }]}
            onPress={() => onIncrement && onIncrement(num)}
          >
            <Text style={[styles.quickText, { color }]}>+{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.semibold,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  minusButton: {
    backgroundColor: COLORS.danger,
  },
  buttonDisabled: {
    backgroundColor: COLORS.bgInput,
    elevation: 0,
  },
  valueContainer: {
    minWidth: 100,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  value: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.bold,
  },
  unit: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.tiny,
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  quickButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  quickText: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.semibold,
  },
});

export default CanCounter;
