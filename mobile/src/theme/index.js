// ─── KK Water Delivery App Theme ─────────────────────
// Premium dark theme with vibrant blue/cyan accents

import ExpoConstants from 'expo-constants';
import { Platform } from 'react-native';

const normalizeApiUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const getExpoHostApiUrl = () => {
  const hostUri =
    ExpoConstants.expoConfig?.hostUri ||
    ExpoConstants.manifest2?.extra?.expoClient?.hostUri ||
    ExpoConstants.manifest?.debuggerHost;

  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  return host ? `http://${host}:5000/api` : null;
};

const getDefaultApiUrl = () => {
  const envUrl = normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL);
  if (envUrl) return envUrl;

  const configuredUrl = normalizeApiUrl(ExpoConstants.expoConfig?.extra?.apiUrl);
  if (configuredUrl) return configuredUrl;

  const expoHostUrl = getExpoHostApiUrl();
  if (expoHostUrl) return expoHostUrl;

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api';
};

export const COLORS = {
  // Primary palette
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  primaryLight: '#38BDF8',
  primaryGlow: 'rgba(14, 165, 233, 0.15)',

  // Secondary (Cool cans - purple)
  secondary: '#8B5CF6',
  secondaryDark: '#7C3AED',
  secondaryLight: '#A78BFA',

  // Success / Delivered
  success: '#10B981',
  successDark: '#059669',
  successLight: '#34D399',
  successGlow: 'rgba(16, 185, 129, 0.15)',

  // Warning
  warning: '#F59E0B',
  warningDark: '#D97706',
  warningLight: '#FBBF24',

  // Danger / Error
  danger: '#EF4444',
  dangerDark: '#DC2626',
  dangerLight: '#F87171',

  // Background
  bgPrimary: '#0A1628',
  bgSecondary: '#111D32',
  bgCard: '#162236',
  bgCardHover: '#1C2D45',
  bgInput: '#1A2942',
  bgModal: 'rgba(10, 22, 40, 0.95)',

  // Surface
  surface: '#162236',
  surfaceElevated: '#1C2D45',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Borders
  border: '#1E3A5F',
  borderLight: '#2A4A6F',
  borderFocus: '#0EA5E9',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',

  // Gradient stops
  gradientStart: '#0EA5E9',
  gradientEnd: '#8B5CF6',

  // Status colors
  statusPending: '#F59E0B',
  statusDelivered: '#10B981',
  statusSkipped: '#6B7280',
  statusLoading: '#3B82F6',

  // Billing status
  billCleared: '#10B981',
  billPartial: '#F59E0B',
  billPending: '#EF4444',

  // Can colors
  normalCan: '#0EA5E9',
  coolCan: '#8B5CF6',

  // White/Black
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const TYPOGRAPHY = {
  // Font sizes
  heading1: 28,
  heading2: 24,
  heading3: 20,
  heading4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,

  // Font weights
  bold: '700',
  semibold: '600',
  medium: '500',
  regular: '400',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 100,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: (color = COLORS.primary) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
};

export const CONSTANTS = {
  // Business
  BUSINESS_NAME: 'KK Events & Water Plant',
  NORMAL_CAN_PRICE: 20,
  COOL_CAN_PRICE: 30,
  CURRENCY: '₹',

  // API
  API_URL: getDefaultApiUrl(),

  // Map
  DEFAULT_LATITUDE: 17.3850,  // Default: Hyderabad area
  DEFAULT_LONGITUDE: 78.4867,
  DEFAULT_ZOOM: 0.05,

  // Animation
  SWIPE_THRESHOLD: 200,
  ANIMATION_DURATION: 300,

  // Can types
  CAN_TYPES: {
    NORMAL: 'normal',
    COOL: 'cool',
  },

  // Payment modes
  PAYMENT_MODES: [
    { id: 'cash', label: 'Cash 💵', icon: 'cash' },
    { id: 'upi', label: 'UPI 📱', icon: 'cellphone' },
    { id: 'bank', label: 'Bank 🏦', icon: 'bank' },
    { id: 'other', label: 'Other 📝', icon: 'note-text' },
  ],

  // Delivery statuses
  DELIVERY_STATUS: {
    LOADING: 'loading',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
  },

  // Month names (Hindi/English mix)
  MONTH_NAMES: [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
};
