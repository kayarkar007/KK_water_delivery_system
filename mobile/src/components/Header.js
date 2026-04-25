import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';

const Header = ({ 
  title, 
  subtitle, 
  showBack = false, 
  rightAction,
  rightIcon,
  onRightPress,
  transparent = false 
}) => {
  const router = useRouter();

  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} />
      
      <View style={styles.content}>
        {/* Left: Back button or spacer */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        {/* Center: Title */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>

        {/* Right: Action button */}
        <View style={styles.rightSection}>
          {rightIcon ? (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onRightPress}
              activeOpacity={0.7}
            >
              <Ionicons name={rightIcon} size={22} color={COLORS.primary} />
            </TouchableOpacity>
          ) : rightAction ? rightAction : (
            <View style={styles.spacer} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgPrimary,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  leftSection: {
    width: 44,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.heading4,
    fontWeight: TYPOGRAPHY.bold,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.caption,
    marginTop: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: 40,
  },
});

export default Header;
