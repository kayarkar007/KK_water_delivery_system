import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, CONSTANTS } from '../../src/theme';
import SwipeButton from '../../src/components/SwipeButton';
import { deliveryAPI } from '../../src/api/apiClient';
import useStore from '../../src/store/useStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.35;

let MapView, Marker, Polyline;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch (e) { MapView = null; }

export default function ActiveDeliveryScreen() {
  const router = useRouter();
  const { activeDelivery, setActiveDelivery } = useStore();
  const [delivery, setDelivery] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [normalCount, setNormalCount] = useState('1');
  const [coolCount, setCoolCount] = useState('0');
  const [emptyNormal, setEmptyNormal] = useState('0');
  const [emptyCool, setEmptyCool] = useState('0');

  const fetchDelivery = async () => {
    try {
      const res = await deliveryAPI.getToday();
      if (res?.data) {
        setDelivery(res.data);
        setActiveDelivery(res.data);
        const activeTrip = res.data.trips?.find(t => t.status === 'in_progress');
        setCurrentTrip(activeTrip || res.data.trips?.[res.data.trips.length - 1]);
      }
    } catch (e) { console.log(e); }
  };

  useFocusEffect(useCallback(() => { fetchDelivery(); }, []));

  const handleDeliverPress = (customerDel) => {
    setSelectedCustomer(customerDel);
    setNormalCount('1');
    setCoolCount('0');
    setEmptyNormal('0');
    setEmptyCool('0');
    setShowDeliverModal(true);
  };

  const confirmDelivery = async () => {
    if (!selectedCustomer || !delivery || !currentTrip) return;
    const nCans = parseInt(normalCount) || 0;
    const cCans = parseInt(coolCount) || 0;
    if (nCans === 0 && cCans === 0) {
      Alert.alert('Error', 'Kam se kam 1 can deliver karo');
      return;
    }

    // ⚠️ DATA VALIDATION: Prevent delivering more than loaded
    const remainN = currentTrip.normalCansRemaining || 0;
    const remainC = currentTrip.coolCansRemaining || 0;
    if (nCans > remainN) {
      Alert.alert('⚠️ Limit Exceeded!', `Sirf ${remainN} Normal cans bache hain. ${nCans} deliver nahi ho sakte!`);
      return;
    }
    if (cCans > remainC) {
      Alert.alert('⚠️ Limit Exceeded!', `Sirf ${remainC} Cool cans bache hain. ${cCans} deliver nahi ho sakte!`);
      return;
    }

    try {
      const res = await deliveryAPI.deliverToCustomer({
        deliveryId: delivery._id,
        tripNumber: currentTrip.tripNumber,
        customerId: selectedCustomer.customerId,
        normalCansDelivered: nCans,
        coolCansDelivered: cCans,
        emptyNormalCansCollected: parseInt(emptyNormal) || 0,
        emptyCoolCansCollected: parseInt(emptyCool) || 0,
      });
      setShowDeliverModal(false);
      if (res?.data) {
        setDelivery(res.data);
        setActiveDelivery(res.data);
        const trip = res.data.trips?.find(t => t.tripNumber === currentTrip.tripNumber);
        setCurrentTrip(trip);
      }
      Alert.alert('Delivered ✅', `${nCans}N + ${cCans}C delivered to ${selectedCustomer.customerName}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleTripComplete = async () => {
    if (!delivery || !currentTrip) return;
    try {
      const res = await deliveryAPI.completeTrip({
        deliveryId: delivery._id,
        tripNumber: currentTrip.tripNumber,
      });
      Alert.alert(
        `Trip ${currentTrip.tripNumber} Complete ✅`,
        'Aur cans load karne hain ya delivery end karna hai?',
        [
          { text: 'Next Trip Load', onPress: () => router.replace('/delivery/load-cans') },
          { text: 'End Delivery', onPress: () => handleEndDelivery() },
        ]
      );
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleEndDelivery = async () => {
    try {
      const res = await deliveryAPI.endDelivery({ deliveryId: delivery._id });
      setActiveDelivery(null);
      router.replace('/delivery/summary');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  if (!currentTrip) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyCenter}>
          <Ionicons name="water-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Koi active trip nahi hai</Text>
          <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
            <Text style={styles.goBackText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const deliveries = currentTrip.deliveries || [];
  const delivered = deliveries.filter(d => d.status === 'delivered').length;
  const pending = deliveries.filter(d => d.status === 'pending').length;
  const customerLocations = deliveries.filter(d => d.status === 'pending');

  return (
    <View style={styles.container}>
      {/* ═══ TOP: MAP SECTION ═══ */}
      <View style={styles.mapSection}>
        {MapView ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: CONSTANTS.DEFAULT_LATITUDE,
              longitude: CONSTANTS.DEFAULT_LONGITUDE,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* Customer markers would be shown here with their locations */}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color={COLORS.primary} />
            <Text style={styles.mapPlaceholderText}>
              🗺️ Map - Google Maps API Key set karo
            </Text>
            <Text style={styles.mapSubText}>
              Route optimization tab dikhega jab API key add hoga
            </Text>
          </View>
        )}
        
        {/* Overlay Stats */}
        <View style={styles.mapOverlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayLabel}>Trip {currentTrip.tripNumber}</Text>
          </View>
          <View style={styles.overlayCard}>
            <Ionicons name="water" size={14} color={COLORS.normalCan} />
            <Text style={styles.overlayValue}>{currentTrip.normalCansRemaining}N</Text>
          </View>
          <View style={styles.overlayCard}>
            <Ionicons name="snow" size={14} color={COLORS.coolCan} />
            <Text style={styles.overlayValue}>{currentTrip.coolCansRemaining}C</Text>
          </View>
          <View style={[styles.overlayCard, { backgroundColor: COLORS.success + '30' }]}>
            <Text style={[styles.overlayValue, { color: COLORS.success }]}>
              {delivered}/{deliveries.length}
            </Text>
          </View>
        </View>
      </View>

      {/* ═══ BOTTOM: CUSTOMER LIST ═══ */}
      <View style={styles.listSection}>
        {/* Remaining Cans Header */}
        <View style={styles.cansHeader}>
          <View style={styles.cansBadge}>
            <Ionicons name="water" size={16} color={COLORS.normalCan} />
            <Text style={styles.cansText}>Normal: {currentTrip.normalCansRemaining} bache</Text>
          </View>
          <View style={styles.cansBadge}>
            <Ionicons name="snow" size={16} color={COLORS.coolCan} />
            <Text style={[styles.cansText, {color:COLORS.coolCan}]}>Cool: {currentTrip.coolCansRemaining} bache</Text>
          </View>
        </View>

        {/* Customer List */}
        <FlatList
          data={deliveries}
          keyExtractor={(item, i) => item.customerId + i}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item, index }) => {
            const isDone = item.status === 'delivered';
            return (
              <View style={[styles.customerItem, isDone && styles.customerDone]}>
                <View style={[styles.statusDot, { backgroundColor: isDone ? COLORS.success : COLORS.warning }]} />
                <View style={styles.customerInfo}>
                  <View style={styles.customerTop}>
                    <Text style={[styles.customerName, isDone && styles.customerNameDone]}>
                      {index + 1}. {item.customerName}
                    </Text>
                    {isDone ? (
                      <View style={styles.doneBadge}>
                        <Text style={styles.doneText}>✅ Done</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.deliverBtn}
                        onPress={() => handleDeliverPress(item)}
                      >
                        <Ionicons name="cube" size={18} color={COLORS.white} />
                        <Text style={styles.deliverBtnText}>Deliver</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {isDone && (
                    <Text style={styles.deliveredInfo}>
                      N:{item.normalCansDelivered} C:{item.coolCansDelivered} | {item.deliveredAt ? new Date(item.deliveredAt).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) : ''}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
        />
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {pending > 0 ? (
          <SwipeButton
            title={`Trip ${currentTrip.tripNumber} Complete ← Swipe`}
            onSwipe={handleTripComplete}
            color={COLORS.warning}
            icon="flag"
          />
        ) : (
          <SwipeButton
            title="🏁 End Delivery ← Swipe"
            onSwipe={handleEndDelivery}
            color={COLORS.success}
            icon="checkmark-done"
          />
        )}
      </View>

      {/* ═══ DELIVER MODAL ═══ */}
      <Modal visible={showDeliverModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📦 Deliver to {selectedCustomer?.customerName}</Text>
              <TouchableOpacity onPress={() => setShowDeliverModal(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.remaining}>
              Bache: {currentTrip.normalCansRemaining}N + {currentTrip.coolCansRemaining}C
            </Text>

            <View style={styles.inputGrid}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, {color:COLORS.normalCan}]}>💧 Normal Cans</Text>
                <TextInput style={styles.modalInput} value={normalCount} onChangeText={setNormalCount} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, {color:COLORS.coolCan}]}>❄️ Cool Cans</Text>
                <TextInput style={styles.modalInput} value={coolCount} onChangeText={setCoolCount} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>

            <Text style={styles.sectionLabel}>🔄 Empty Cans Collected</Text>
            <View style={styles.inputGrid}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Empty Normal</Text>
                <TextInput style={styles.modalInput} value={emptyNormal} onChangeText={setEmptyNormal} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Empty Cool</Text>
                <TextInput style={styles.modalInput} value={emptyCool} onChangeText={setEmptyCool} keyboardType="numeric" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelivery}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.confirmBtnText}>✅ Deliver Karo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  
  // Map Section
  mapSection: { height: MAP_HEIGHT, position: 'relative' },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  mapPlaceholderText: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.body, fontWeight: '600' },
  mapSubText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.caption },
  mapOverlay: { position: 'absolute', bottom: SPACING.md, left: SPACING.md, right: SPACING.md, flexDirection: 'row', gap: SPACING.sm },
  overlayCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgPrimary + 'DD', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, gap: 4 },
  overlayLabel: { color: COLORS.primary, fontSize: TYPOGRAPHY.caption, fontWeight: '700' },
  overlayValue: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.caption, fontWeight: '600' },

  // List Section
  listSection: { flex: 1, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, backgroundColor: COLORS.bgPrimary, marginTop: -SPACING.lg, paddingTop: SPACING.lg },
  cansHeader: { flexDirection: 'row', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md, gap: SPACING.md },
  cansBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, gap: 4, flex: 1 },
  cansText: { color: COLORS.normalCan, fontSize: TYPOGRAPHY.caption, fontWeight: '600' },

  // Customer Item
  customerItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.xl, marginBottom: SPACING.sm, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  customerDone: { borderColor: COLORS.success + '30', backgroundColor: COLORS.success + '08', opacity: 0.8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.md },
  customerInfo: { flex: 1 },
  customerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerName: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.bodySmall, fontWeight: '600', flex: 1 },
  customerNameDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  doneBadge: { backgroundColor: COLORS.success + '20', paddingHorizontal: SPACING.md, paddingVertical: 2, borderRadius: RADIUS.full },
  doneText: { color: COLORS.success, fontSize: TYPOGRAPHY.tiny, fontWeight: '600' },
  deliverBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: 4 },
  deliverBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.caption, fontWeight: '600' },
  deliveredInfo: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.tiny, marginTop: 4 },

  // Bottom Bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.xl, paddingBottom: SPACING.xxxl, backgroundColor: COLORS.bgSecondary, borderTopWidth: 1, borderTopColor: COLORS.border },

  // Empty State
  emptyCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.lg },
  emptyText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.body },
  goBackBtn: { padding: SPACING.md },
  goBackText: { color: COLORS.primary, fontSize: TYPOGRAPHY.bodySmall },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.bgSecondary, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.heading4, fontWeight: '700', flex: 1 },
  remaining: { color: COLORS.warning, fontSize: TYPOGRAPHY.bodySmall, marginBottom: SPACING.lg, textAlign: 'center' },
  inputGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  inputGroup: { flex: 1 },
  inputLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.caption, fontWeight: '600', marginBottom: SPACING.sm },
  sectionLabel: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.bodySmall, fontWeight: '600', marginBottom: SPACING.md },
  modalInput: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: TYPOGRAPHY.heading4, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', borderWidth: 1, borderColor: COLORS.border },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.success, padding: SPACING.lg, borderRadius: RADIUS.lg, gap: SPACING.sm, marginTop: SPACING.md },
  confirmBtnText: { color: COLORS.white, fontSize: TYPOGRAPHY.body, fontWeight: '700' },
});
