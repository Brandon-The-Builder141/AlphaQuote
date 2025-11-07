/**
 * Offline Service - Handles local data storage and sync
 * Uses IndexedDB for offline storage with automatic sync when online
 */

class OfflineService {
  constructor() {
    this.dbName = 'AlphaQuoteOffline';
    this.dbVersion = 1;
    this.db = null;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;

    // Initialize the service
    this.init();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  /**
   * Initialize IndexedDB and set up event listeners
   */
  async init() {
    try {
      this.db = await this.openDB();
      console.log('✅ Offline service initialized');

      // Start sync if online
      if (this.isOnline) {
        await this.syncPendingChanges();
      }
    } catch (error) {
      console.error('❌ Failed to initialize offline service:', error);
    }
  }

  /**
   * Open IndexedDB database
   */
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores for different data types
        if (!db.objectStoreNames.contains('receipts')) {
          const receiptsStore = db.createObjectStore('receipts', { keyPath: 'id' });
          receiptsStore.createIndex('vendorId', 'vendorId', { unique: false });
          receiptsStore.createIndex('projectId', 'projectId', { unique: false });
          receiptsStore.createIndex('receiptDate', 'receiptDate', { unique: false });
        }

        if (!db.objectStoreNames.contains('vendors')) {
          const vendorsStore = db.createObjectStore('vendors', { keyPath: 'id' });
          vendorsStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('projects')) {
          const projectsStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectsStore.createIndex('clientName', 'clientName', { unique: false });
          projectsStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('estimates')) {
          const estimatesStore = db.createObjectStore('estimates', { keyPath: 'id' });
          estimatesStore.createIndex('projectId', 'projectId', { unique: false });
          estimatesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('operation', 'operation', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Handle coming online - start sync process
   */
  async handleOnline() {
    console.log('🌐 Back online - starting sync...');
    this.isOnline = true;
    await this.syncPendingChanges();
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    console.log('📴 Gone offline - data will be stored locally');
    this.isOnline = false;
  }

  /**
   * Save data to offline storage
   */
  async saveOffline(storeName, data) {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Add offline flag and timestamp
      const offlineData = {
        ...data,
        offlineCreated: true,
        offlineTimestamp: new Date().toISOString(),
        syncStatus: 'pending'
      };

      await store.put(offlineData);

      // Add to sync queue if online
      if (this.isOnline) {
        await this.addToSyncQueue('create', storeName, data);
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to save ${storeName} offline:`, error);
      return false;
    }
  }

  /**
   * Update data in offline storage
   */
  async updateOffline(storeName, id, updates) {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Get existing data
      const existingData = await this.getOffline(storeName, id);
      if (!existingData) return false;

      // Merge updates
      const updatedData = {
        ...existingData,
        ...updates,
        offlineUpdated: true,
        offlineTimestamp: new Date().toISOString(),
        syncStatus: 'pending'
      };

      await store.put(updatedData);

      // Add to sync queue if online
      if (this.isOnline) {
        await this.addToSyncQueue('update', storeName, updatedData);
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to update ${storeName} offline:`, error);
      return false;
    }
  }

  /**
   * Get data from offline storage
   */
  async getOffline(storeName, id) {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`❌ Failed to get ${storeName} from offline:`, error);
      return null;
    }
  }

  /**
   * Get all data from offline storage
   */
  async getAllOffline(storeName) {
    if (!this.db) return [];

    try {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`❌ Failed to get all ${storeName} from offline:`, error);
      return [];
    }
  }

  /**
   * Delete data from offline storage
   */
  async deleteOffline(storeName, id) {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      await store.delete(id);

      // Add to sync queue if online
      if (this.isOnline) {
        await this.addToSyncQueue('delete', storeName, { id });
      }

      return true;
    } catch (error) {
      console.error(`❌ Failed to delete ${storeName} from offline:`, error);
      return false;
    }
  }

  /**
   * Add operation to sync queue
   */
  async addToSyncQueue(operation, storeName, data) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');

      const syncItem = {
        operation,
        storeName,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };

      await store.add(syncItem);
    } catch (error) {
      console.error('❌ Failed to add to sync queue:', error);
    }
  }

  /**
   * Sync pending changes with server
   */
  async syncPendingChanges() {
    if (!this.isOnline || this.syncInProgress || !this.db) return;

    this.syncInProgress = true;
    console.log('🔄 Starting sync process...');

    try {
      // Get all pending sync items
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const syncItems = await this.getAllOffline('syncQueue');

      let successCount = 0;
      let errorCount = 0;

      for (const item of syncItems) {
        try {
          await this.syncItem(item);

          // Remove successful item from queue
          await store.delete(item.id);
          successCount++;
        } catch (error) {
          console.error(`❌ Sync failed for item ${item.id}:`, error);

          // Increment retry count
          item.retryCount++;
          if (item.retryCount < 3) {
            await store.put(item);
          } else {
            // Remove after 3 failed attempts
            await store.delete(item.id);
            console.warn(`⚠️ Removed sync item after 3 failed attempts: ${item.id}`);
          }
          errorCount++;
        }
      }

      console.log(`✅ Sync completed: ${successCount} successful, ${errorCount} errors`);

      // Update sync status for all data
      await this.updateSyncStatus();

    } catch (error) {
      console.error('❌ Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync individual item
   */
  async syncItem(item) {
    const { API_BASE_URL } = await import('../config/env');
    const apiUrl = `${API_BASE_URL}/api`;

    switch (item.operation) {
      case 'create':
        await fetch(`${API_BASE_URL}/${item.storeName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;

      case 'update':
        await fetch(`${API_BASE_URL}/${item.storeName}/${item.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;

      case 'delete':
        await fetch(`${API_BASE_URL}/${item.storeName}/${item.data.id}`, {
          method: 'DELETE'
        });
        break;
    }
  }

  /**
   * Update sync status for all data
   */
  async updateSyncStatus() {
    const stores = ['receipts', 'vendors', 'projects', 'estimates'];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const allData = await this.getAllOffline(storeName);

      for (const item of allData) {
        if (item.syncStatus === 'pending') {
          item.syncStatus = 'synced';
          item.lastSynced = new Date().toISOString();
          await store.put(item);
        }
      }
    }
  }

  /**
   * Get offline settings
   */
  async getSetting(key) {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`❌ Failed to get setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Set offline setting
   */
  async setSetting(key, value) {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');

      await store.put({ key, value, timestamp: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error(`❌ Failed to set setting ${key}:`, error);
      return false;
    }
  }

  /**
   * Get network status
   */
  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Clear all offline data (for testing)
   */
  async clearAllData() {
    if (!this.db) return;

    const stores = ['receipts', 'vendors', 'projects', 'estimates', 'syncQueue', 'settings'];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }

    console.log('🗑️ Cleared all offline data');
  }
}

// Create singleton instance
const offlineService = new OfflineService();

export default offlineService;
