import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, CONSTANTS } from '../../src/theme';
import Header from '../../src/components/Header';
import { ActionButton } from '../../src/components/SharedUI';
import { customerAPI } from '../../src/api/apiClient';

const { width, height } = Dimensions.get('window');

// Note: MapView requires react-native-maps which needs Google Maps API key
// This screen uses a placeholder when API key is not set
let MapView, Marker;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (e) {
  MapView = null;
  Marker = null;
}

export default function LocationPickerScreen() {
  const { customerId } = useLocalSearchParams();
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission chahiye');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);
      setSelectedLocation(coords);
    } catch (e) {
      console.log('Location error:', e);
      setLocation({ latitude: CONSTANTS.DEFAULT_LATITUDE, longitude: CONSTANTS.DEFAULT_LONGITUDE });
      setSelectedLocation({ latitude: CONSTANTS.DEFAULT_LATITUDE, longitude: CONSTANTS.DEFAULT_LONGITUDE });
    }
  };

  const handleSave = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Location select karo pehle');
      return;
    }
    try {
      setLoading(true);
      await customerAPI.updateLocation(customerId, selectedLocation);
      Alert.alert('Success ✅', 'Customer ki location save ho gayi!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (e) => {
    if (e.nativeEvent?.coordinate) {
      setSelectedLocation(e.nativeEvent.coordinate);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="📍 Location Set Karo" subtitle="Customer ke ghar ki location" showBack />
      
      <View style={styles.mapContainer}>
        {MapView && location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              ...location,
              latitudeDelta: CONSTANTS.DEFAULT_ZOOM,
              longitudeDelta: CONSTANTS.DEFAULT_ZOOM,
            }}
            onPress={handleMapPress}
          >
            {selectedLocation && Marker && (
              <Marker
                coordinate={selectedLocation}
                title="Customer Location"
                description="Yahan pin drop karo"
                draggable
                onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
              />
            )}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.placeholderIcon}>🗺️</Text>
            <Text style={styles.placeholderTitle}>Map Loading...</Text>
            <Text style={styles.placeholderText}>
              Google Maps API Key set karo app.json me {'\n'}
              tab map dikhega yahan
            </Text>
            {selectedLocation && (
              <View style={styles.coordsBox}>
                <Text style={styles.coordsText}>
                  📍 Lat: {selectedLocation.latitude?.toFixed(6)}
                </Text>
                <Text style={styles.coordsText}>
                  📍 Lng: {selectedLocation.longitude?.toFixed(6)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.bottomSheet}>
        <Text style={styles.instruction}>
          🎯 Map pe customer ke ghar ki exact location pe tap karo ya pin drag karo
        </Text>
        {selectedLocation && (
          <Text style={styles.coords}>
            📍 {selectedLocation.latitude?.toFixed(6)}, {selectedLocation.longitude?.toFixed(6)}
          </Text>
        )}
        <View style={styles.buttonRow}>
          <ActionButton title="📍 Current Location" icon="navigate" color={COLORS.primary} variant="outline" onPress={getCurrentLocation} />
          <ActionButton title="✅ Save Location" icon="checkmark" color={COLORS.success} loading={loading} onPress={handleSave} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  mapContainer: { flex: 1 },
  map: { width: '100%', height: '100%' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgSecondary, padding: SPACING.xxl },
  placeholderIcon: { fontSize: 64, marginBottom: SPACING.lg },
  placeholderTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.heading3, fontWeight: '700', marginBottom: SPACING.sm },
  placeholderText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.bodySmall, textAlign: 'center', lineHeight: 22 },
  coordsBox: { marginTop: SPACING.xl, backgroundColor: COLORS.bgCard, padding: SPACING.lg, borderRadius: RADIUS.md },
  coordsText: { color: COLORS.primary, fontSize: TYPOGRAPHY.bodySmall },
  bottomSheet: { backgroundColor: COLORS.bgSecondary, padding: SPACING.xl, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, borderTopWidth: 1, borderTopColor: COLORS.border },
  instruction: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.bodySmall, textAlign: 'center', marginBottom: SPACING.md, lineHeight: 22 },
  coords: { color: COLORS.primary, fontSize: TYPOGRAPHY.caption, textAlign: 'center', marginBottom: SPACING.lg },
  buttonRow: { flexDirection: 'row', gap: SPACING.md },
});
