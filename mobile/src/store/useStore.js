import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONSTANTS } from '../theme';

// ─── Main App Store ───────────────────────────────────
const useStore = create((set, get) => ({
  // ─── Customer State ─────────────────────────────
  customers: [],
  selectedCustomers: [],
  setCustomers: (customers) => set({ customers }),
  setSelectedCustomers: (selected) => set({ selectedCustomers: selected }),
  toggleCustomerSelection: (customerId) => {
    const current = get().selectedCustomers;
    if (current.includes(customerId)) {
      set({ selectedCustomers: current.filter(id => id !== customerId) });
    } else {
      set({ selectedCustomers: [...current, customerId] });
    }
  },
  clearSelectedCustomers: () => set({ selectedCustomers: [] }),

  // ─── Active Delivery State ─────────────────────
  activeDelivery: null,
  currentTrip: null,
  currentTripNumber: 0,
  deliveryStatus: 'idle', // 'idle' | 'loading' | 'in_progress' | 'completed'
  
  setActiveDelivery: (delivery) => set({ activeDelivery: delivery }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setCurrentTripNumber: (num) => set({ currentTripNumber: num }),
  setDeliveryStatus: (status) => set({ deliveryStatus: status }),

  // ─── Can Count State ───────────────────────────
  normalCansLoaded: 0,
  coolCansLoaded: 0,
  normalCansRemaining: 0,
  coolCansRemaining: 0,
  
  setNormalCansLoaded: (count) => set({ normalCansLoaded: count, normalCansRemaining: count }),
  setCoolCansLoaded: (count) => set({ coolCansLoaded: count, coolCansRemaining: count }),
  updateRemainingCans: (normalUsed, coolUsed) => {
    const state = get();
    set({
      normalCansRemaining: state.normalCansRemaining - normalUsed,
      coolCansRemaining: state.coolCansRemaining - coolUsed,
    });
  },
  resetCans: () => set({
    normalCansLoaded: 0,
    coolCansLoaded: 0,
    normalCansRemaining: 0,
    coolCansRemaining: 0,
  }),

  // ─── Trip Deliveries State ─────────────────────
  tripDeliveries: [], // Customers in current trip
  setTripDeliveries: (deliveries) => set({ tripDeliveries: deliveries }),
  markDelivered: (customerId) => {
    const deliveries = get().tripDeliveries.map(d => 
      d.customerId === customerId 
        ? { ...d, status: 'delivered', deliveredAt: new Date().toISOString() }
        : d
    );
    set({ tripDeliveries: deliveries });
  },

  // ─── Location State ────────────────────────────
  currentLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),

  // ─── UI State ──────────────────────────────────
  isLoading: false,
  error: null,
  successMessage: null,
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSuccessMessage: (msg) => set({ successMessage: msg }),
  clearMessages: () => set({ error: null, successMessage: null }),

  // ─── Settings ──────────────────────────────────
  settings: {
    apiUrl: CONSTANTS.API_URL,
    normalCanPrice: 20,
    coolCanPrice: 30,
    businessName: 'KK Events & Water Plant',
  },
  updateSettings: async (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    await AsyncStorage.setItem('app_settings', JSON.stringify(updated));
  },
  loadSettings: async () => {
    try {
      const saved = await AsyncStorage.getItem('app_settings');
      if (saved) {
        set({ settings: JSON.parse(saved) });
      }
    } catch (e) {
      console.log('Settings load error:', e);
    }
  },

  // ─── Reset All ─────────────────────────────────
  resetDeliveryState: () => set({
    activeDelivery: null,
    currentTrip: null,
    currentTripNumber: 0,
    deliveryStatus: 'idle',
    normalCansLoaded: 0,
    coolCansLoaded: 0,
    normalCansRemaining: 0,
    coolCansRemaining: 0,
    tripDeliveries: [],
    selectedCustomers: [],
  }),
}));

export default useStore;
