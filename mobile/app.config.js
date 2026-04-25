// Dynamic Expo config - reads API keys from environment variables
// Keys are set in eas.json build profiles, NOT in source code

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY || 'GOOGLE_MAPS_KEY_HERE';
const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

module.exports = {
  expo: {
    name: 'KK Water Delivery',
    slug: 'kk-water-delivery',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'kkwater',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      backgroundColor: '#0A1628',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.kkevents.waterdelivery',
      config: {
        googleMapsApiKey: GOOGLE_MAPS_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'Delivery route tracking ke liye location chahiye',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'Background me delivery tracking ke liye location chahiye',
        NSLocationAlwaysUsageDescription: 'Background me delivery tracking ke liye location chahiye',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#0A1628',
      },
      package: 'com.kkevents.waterdelivery',
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_KEY,
        },
      },
    },
    plugins: [
      'expo-router',
      'expo-location',
      ['expo-task-manager', {}],
      'expo-asset',
      'expo-font',
    ],
    extra: {
      apiUrl: API_URL,
      router: {},
      eas: {
        projectId: '61c1ac2b-d240-4415-8a9d-98dd664531fb',
      },
    },
  },
};
