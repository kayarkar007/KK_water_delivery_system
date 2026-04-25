import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_queue';

// ─── Offline Queue Manager ────────────────────────────
// Queues API operations when offline, replays when back online

const OfflineQueue = {
  // Add operation to queue
  enqueue: async (operation) => {
    try {
      const queue = await OfflineQueue.getQueue();
      queue.push({
        ...operation,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        retries: 0,
      });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      console.log('📦 Queued offline operation:', operation.type);
      return true;
    } catch (e) {
      console.error('Queue error:', e);
      return false;
    }
  },

  // Get all queued operations
  getQueue: async () => {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Get queue count
  getCount: async () => {
    const queue = await OfflineQueue.getQueue();
    return queue.length;
  },

  // Process all queued operations
  processQueue: async (apiClient) => {
    const queue = await OfflineQueue.getQueue();
    if (queue.length === 0) return { success: 0, failed: 0 };

    let success = 0;
    let failed = 0;
    const remaining = [];

    for (const op of queue) {
      try {
        switch (op.type) {
          case 'CREATE_CUSTOMER':
            await apiClient.post('/customers', op.data);
            break;
          case 'UPDATE_CUSTOMER':
            await apiClient.put(`/customers/${op.id}`, op.data);
            break;
          case 'DELIVER':
            await apiClient.put('/deliveries/deliver', op.data);
            break;
          case 'PAYMENT':
            await apiClient.post('/billing/payment', op.data);
            break;
          case 'START_TRIP':
            await apiClient.post('/deliveries/trip/start', op.data);
            break;
          case 'COMPLETE_TRIP':
            await apiClient.put('/deliveries/trip/complete', op.data);
            break;
          case 'END_DELIVERY':
            await apiClient.put('/deliveries/end', op.data);
            break;
          default:
            console.log('Unknown operation type:', op.type);
        }
        success++;
      } catch (e) {
        op.retries++;
        if (op.retries < 3) {
          remaining.push(op);
        }
        failed++;
      }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    console.log(`✅ Processed: ${success} success, ${failed} failed, ${remaining.length} remaining`);
    return { success, failed, remaining: remaining.length };
  },

  // Clear queue
  clearQueue: async () => {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },
};

// ─── Local Cache Manager ─────────────────────────────
// Caches API responses locally for offline access

const LocalCache = {
  // Save data to cache
  set: async (key, data) => {
    try {
      await AsyncStorage.setItem(
        `cache_${key}`,
        JSON.stringify({ data, cachedAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Cache set error:', e);
    }
  },

  // Get cached data
  get: async (key) => {
    try {
      const raw = await AsyncStorage.getItem(`cache_${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data;
    } catch (e) {
      return null;
    }
  },

  // Cache customers list
  cacheCustomers: async (customers) => {
    await LocalCache.set('customers', customers);
  },

  // Get cached customers
  getCachedCustomers: async () => {
    return await LocalCache.get('customers');
  },

  // Cache today's delivery
  cacheDelivery: async (delivery) => {
    await LocalCache.set('today_delivery', delivery);
  },

  // Get cached delivery
  getCachedDelivery: async () => {
    return await LocalCache.get('today_delivery');
  },
};

// ─── Network Status Helper ──────────────────────────
const NetworkHelper = {
  isOnline: async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response.ok;
    } catch (e) {
      return false;
    }
  },
};

export { OfflineQueue, LocalCache, NetworkHelper };
export default OfflineQueue;
