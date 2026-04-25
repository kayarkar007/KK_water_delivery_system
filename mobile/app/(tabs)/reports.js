import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, CONSTANTS } from '../../src/theme';
import { reportAPI } from '../../src/api/apiClient';
import * as Linking from 'expo-linking';

export default function ReportsScreen() {
  const [tab, setTab] = useState('daily');
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    try {
      setLoading(true);
      if (tab === 'daily') {
        const res = await reportAPI.getDailyReport(today);
        setDailyReport(res?.data || null);
        const recent = await reportAPI.getRecentReports(7);
        setRecentReports(recent?.data || []);
      } else {
        const res = await reportAPI.getMonthlyReport(currentYear, currentMonth);
        setMonthlyData(res?.data || null);
      }
    } catch (e) { console.log('Report error:', e); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [tab]));

  const shareOnWhatsApp = async () => {
    try {
      let res;
      if (tab === 'daily') {
        res = await reportAPI.getWhatsAppDailyText(today);
      } else {
        res = await reportAPI.getWhatsAppMonthlyText(currentYear, currentMonth);
      }
      const text = res?.data?.text || 'No report data';
      const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Share.share({ message: text });
      }
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Reports</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={shareOnWhatsApp}>
          <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {['daily', 'monthly'].map(t => (
          <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'daily' ? '📅 Daily' : '📆 Monthly'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {tab === 'daily' ? (
          dailyReport ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Aaj Ki Report - {today}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}><Text style={s.sv}>{dailyReport.totalTrips}</Text><Text style={s.sl}>Trips</Text></View>
                  <View style={styles.stat}><Text style={s.sv}>{dailyReport.totalCustomersServed}</Text><Text style={s.sl}>Customers</Text></View>
                  <View style={styles.stat}><Text style={s.sv}>{dailyReport.totalCansDelivered}</Text><Text style={s.sl}>Total Cans</Text></View>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="water" size={16} color={COLORS.normalCan} />
                  <Text style={styles.detailText}>Normal Cans: {dailyReport.totalNormalCansDelivered}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="snow" size={16} color={COLORS.coolCan} />
                  <Text style={styles.detailText}>Cool Cans: {dailyReport.totalCoolCansDelivered}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="refresh" size={16} color={COLORS.warning} />
                  <Text style={styles.detailText}>Empty Collected: {dailyReport.totalEmptyCansCollected}</Text>
                </View>
              </View>

              {dailyReport.deliveryDetails?.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Customer-wise Details</Text>
                  {dailyReport.deliveryDetails.map((d, i) => (
                    <View key={i} style={styles.custRow}>
                      <Text style={styles.custIndex}>{i + 1}.</Text>
                      <View style={{flex:1}}>
                        <Text style={styles.custName}>{d.customerName}</Text>
                        <Text style={styles.custDetail}>
                          N:{d.normalCans} C:{d.coolCans} | Trip {d.tripNumber} | {d.deliveredAt ? new Date(d.deliveredAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '-'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Aaj ki koi report nahi hai</Text>
              <Text style={styles.emptySubtext}>Delivery complete hone par report auto-generate hogi</Text>
            </View>
          )
        ) : (
          monthlyData ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {CONSTANTS.MONTH_NAMES[currentMonth]} {currentYear}
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}><Text style={s.sv}>{monthlyData.totals?.totalDeliveryDays || 0}</Text><Text style={s.sl}>Days</Text></View>
                  <View style={styles.stat}><Text style={s.sv}>{monthlyData.totals?.totalTrips || 0}</Text><Text style={s.sl}>Trips</Text></View>
                  <View style={styles.stat}><Text style={s.sv}>{monthlyData.totals?.totalCansDelivered || 0}</Text><Text style={s.sl}>Cans</Text></View>
                </View>
                <View style={styles.financeRow}>
                  <View style={[styles.finCard, {borderColor: COLORS.primary+'30'}]}>
                    <Text style={styles.finLabel}>Billed</Text>
                    <Text style={[styles.finValue, {color:COLORS.primary}]}>₹{monthlyData.totals?.totalBilled || 0}</Text>
                  </View>
                  <View style={[styles.finCard, {borderColor: COLORS.success+'30'}]}>
                    <Text style={styles.finLabel}>Paid</Text>
                    <Text style={[styles.finValue, {color:COLORS.success}]}>₹{monthlyData.totals?.totalPaid || 0}</Text>
                  </View>
                  <View style={[styles.finCard, {borderColor: COLORS.danger+'30'}]}>
                    <Text style={styles.finLabel}>Due</Text>
                    <Text style={[styles.finValue, {color:COLORS.danger}]}>₹{monthlyData.totals?.totalPending || 0}</Text>
                  </View>
                </View>
              </View>

              {monthlyData.billingData?.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Customer Bills</Text>
                  {monthlyData.billingData.map((b, i) => (
                    <View key={i} style={styles.custRow}>
                      <Text style={styles.custIndex}>{i+1}.</Text>
                      <View style={{flex:1}}>
                        <Text style={styles.custName}>{b.customerName}</Text>
                        <Text style={styles.custDetail}>
                          Bill: ₹{b.totalAmount} | Paid: ₹{b.paidAmount} | Due: ₹{b.pendingAmount}
                        </Text>
                      </View>
                      <Text style={{color: b.status==='cleared'?COLORS.success:COLORS.danger, fontSize:12}}>
                        {b.status==='cleared'?'✅':'❌'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Monthly data nahi hai</Text>
            </View>
          )
        )}
        <View style={{height:100}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  sv: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.heading3, fontWeight: '700' },
  sl: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.tiny, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: COLORS.bgPrimary },
  header: { paddingHorizontal:SPACING.xl, paddingTop:SPACING.huge, paddingBottom:SPACING.md, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  title: { color:COLORS.textPrimary, fontSize:TYPOGRAPHY.heading2, fontWeight:'700' },
  shareBtn: { flexDirection:'row', alignItems:'center', backgroundColor:'#25D366'+'20', paddingHorizontal:SPACING.lg, paddingVertical:SPACING.sm, borderRadius:RADIUS.full, gap:SPACING.sm },
  shareBtnText: { color:'#25D366', fontSize:TYPOGRAPHY.caption, fontWeight:'600' },
  tabRow: { flexDirection:'row', marginHorizontal:SPACING.xl, marginBottom:SPACING.lg, backgroundColor:COLORS.bgCard, borderRadius:RADIUS.full, padding:3 },
  tabBtn: { flex:1, paddingVertical:SPACING.md, borderRadius:RADIUS.full, alignItems:'center' },
  tabActive: { backgroundColor:COLORS.primary },
  tabText: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.bodySmall, fontWeight:'600' },
  tabTextActive: { color:COLORS.white },
  content: { paddingHorizontal:SPACING.xl },
  card: { backgroundColor:COLORS.bgCard, borderRadius:RADIUS.lg, padding:SPACING.xl, marginBottom:SPACING.lg, borderWidth:1, borderColor:COLORS.border },
  cardTitle: { color:COLORS.textPrimary, fontSize:TYPOGRAPHY.heading4, fontWeight:'700', marginBottom:SPACING.lg },
  statsRow: { flexDirection:'row', justifyContent:'space-around', marginBottom:SPACING.lg, backgroundColor:COLORS.bgPrimary, borderRadius:RADIUS.md, padding:SPACING.lg },
  stat: { alignItems:'center' },
  detailRow: { flexDirection:'row', alignItems:'center', gap:SPACING.sm, paddingVertical:SPACING.xs },
  detailText: { color:COLORS.textSecondary, fontSize:TYPOGRAPHY.bodySmall },
  custRow: { flexDirection:'row', alignItems:'center', paddingVertical:SPACING.md, borderBottomWidth:1, borderBottomColor:COLORS.border, gap:SPACING.sm },
  custIndex: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.bodySmall, width:24 },
  custName: { color:COLORS.textPrimary, fontSize:TYPOGRAPHY.bodySmall, fontWeight:'600' },
  custDetail: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.tiny, marginTop:2 },
  financeRow: { flexDirection:'row', gap:SPACING.sm },
  finCard: { flex:1, backgroundColor:COLORS.bgPrimary, borderRadius:RADIUS.md, padding:SPACING.md, alignItems:'center', borderWidth:1 },
  finLabel: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.tiny },
  finValue: { fontSize:TYPOGRAPHY.bodySmall, fontWeight:'700', marginTop:4 },
  emptyCard: { alignItems:'center', padding:SPACING.huge, gap:SPACING.lg },
  emptyText: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.body },
  emptySubtext: { color:COLORS.textMuted, fontSize:TYPOGRAPHY.caption, textAlign:'center' },
});
