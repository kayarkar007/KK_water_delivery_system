import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';
import Header from '../../src/components/Header';
import { ActionButton } from '../../src/components/SharedUI';
import { deliveryAPI, reportAPI } from '../../src/api/apiClient';

export default function DeliverySummaryScreen() {
  const router = useRouter();
  const [delivery, setDelivery] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await deliveryAPI.getByDate(today);
      setDelivery(res?.data);
    } catch (e) { console.log(e); }
  };

  const shareWhatsApp = async () => {
    try {
      const res = await reportAPI.getWhatsAppDailyText(today);
      const text = res?.data?.text || 'No data';
      const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Share.share({ message: text });
      }
    } catch (e) { console.log(e); }
  };

  if (!delivery) return (
    <View style={styles.container}>
      <Header title="Summary" showBack />
      <View style={styles.center}>
        <Text style={styles.noData}>Loading...</Text>
      </View>
    </View>
  );

  const allDeliveries = [];
  delivery.trips?.forEach(trip => {
    trip.deliveries?.forEach(d => {
      if (d.status === 'delivered') allDeliveries.push({ ...d, tripNumber: trip.tripNumber });
    });
  });

  return (
    <View style={styles.container}>
      <Header title="📋 Delivery Summary" subtitle={today} showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
          <Text style={styles.successTitle}>Delivery Complete! 🎉</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{delivery.trips?.length || 0}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{delivery.totalCustomersServed || 0}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{(delivery.totalNormalCansDelivered||0)+(delivery.totalCoolCansDelivered||0)}</Text>
              <Text style={styles.statLabel}>Total Cans</Text>
            </View>
          </View>
          <View style={styles.canBreakdown}>
            <View style={styles.canItem}>
              <Ionicons name="water" size={16} color={COLORS.normalCan} />
              <Text style={styles.canText}>Normal: {delivery.totalNormalCansDelivered || 0}</Text>
            </View>
            <View style={styles.canItem}>
              <Ionicons name="snow" size={16} color={COLORS.coolCan} />
              <Text style={[styles.canText, {color:COLORS.coolCan}]}>Cool: {delivery.totalCoolCansDelivered || 0}</Text>
            </View>
            <View style={styles.canItem}>
              <Ionicons name="refresh" size={16} color={COLORS.warning} />
              <Text style={[styles.canText, {color:COLORS.warning}]}>Empty: {delivery.totalEmptyCansCollected || 0}</Text>
            </View>
          </View>
        </View>

        {/* Trip-wise breakdown */}
        {delivery.trips?.map((trip, i) => (
          <View key={i} style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <Text style={styles.tripTitle}>Trip {trip.tripNumber}</Text>
              <Text style={styles.tripTime}>
                {trip.startTime ? new Date(trip.startTime).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : ''} - {trip.endTime ? new Date(trip.endTime).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : ''}
              </Text>
            </View>
            <Text style={styles.tripStats}>
              Loaded: {trip.normalCansLoaded}N + {trip.coolCansLoaded}C → Delivered: {trip.normalCansDelivered}N + {trip.coolCansDelivered}C
            </Text>
            {trip.deliveries?.filter(d => d.status === 'delivered').map((d, j) => (
              <View key={j} style={styles.deliveryItem}>
                <Text style={styles.deliveryIndex}>{j+1}.</Text>
                <Text style={styles.deliveryName}>{d.customerName}</Text>
                <Text style={styles.deliveryCans}>N:{d.normalCansDelivered} C:{d.coolCansDelivered}</Text>
                <Text style={styles.deliveryTime}>
                  {d.deliveredAt ? new Date(d.deliveredAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '-'}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          <ActionButton
            title="📱 WhatsApp pe Share Karo"
            icon="logo-whatsapp"
            color="#25D366"
            size="large"
            fullWidth
            onPress={shareWhatsApp}
          />
          <ActionButton
            title="🏠 Home pe Jao"
            icon="home"
            color={COLORS.primary}
            variant="outline"
            size="large"
            fullWidth
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
        <View style={{height:40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:COLORS.bgPrimary },
  content: { padding:SPACING.xl },
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  noData: { color:COLORS.textMuted },
  successBanner: { alignItems:'center', padding:SPACING.xxl, gap:SPACING.md },
  successTitle: { color:COLORS.textPrimary, fontSize:TYPOGRAPHY.heading2, fontWeight:'700' },
  statsCard: { backgroundColor:COLORS.bgCard, borderRadius:RADIUS.xl, padding:SPACING.xl, borderWidth:1, borderColor:COLORS.border, marginBottom:SPACING.lg },
  statRow: { flexDirection:'row', alignItems:'center' },
  stat: { flex:1, alignItems:'center' },
  statValue: { color:COLORS.textPrimary, fontSize:TYPOGRAPHY.heading2, fontWeight:'700' },
  statLabel: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.tiny, marginTop:2 },
  divider: { width:1, height:40, backgroundColor:COLORS.border },
  canBreakdown: { flexDirection:'row', justifyContent:'center', gap:SPACING.xl, marginTop:SPACING.lg, paddingTop:SPACING.lg, borderTopWidth:1, borderTopColor:COLORS.border },
  canItem: { flexDirection:'row', alignItems:'center', gap:4 },
  canText: { color:COLORS.normalCan, fontSize:TYPOGRAPHY.caption, fontWeight:'600' },
  tripCard: { backgroundColor:COLORS.bgCard, borderRadius:RADIUS.lg, padding:SPACING.lg, marginBottom:SPACING.md, borderWidth:1, borderColor:COLORS.border },
  tripHeader: { flexDirection:'row', justifyContent:'space-between', marginBottom:SPACING.sm },
  tripTitle: { color:COLORS.primary, fontSize:TYPOGRAPHY.body, fontWeight:'700' },
  tripTime: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.caption },
  tripStats: { color:COLORS.textSecondary, fontSize:TYPOGRAPHY.caption, marginBottom:SPACING.md },
  deliveryItem: { flexDirection:'row', alignItems:'center', paddingVertical:SPACING.xs, gap:SPACING.sm },
  deliveryIndex: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.caption, width:20 },
  deliveryName: { color:COLORS.textPrimary, fontSize:TYPOGRAPHY.caption, flex:1 },
  deliveryCans: { color:COLORS.textSecondary, fontSize:TYPOGRAPHY.tiny },
  deliveryTime: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.tiny, width:50, textAlign:'right' },
  actions: { gap:SPACING.md, marginTop:SPACING.xl },
});
