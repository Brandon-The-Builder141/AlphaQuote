/**
 * Offline Wrapper Service
 * Wraps existing API calls to work with offline mode
 * Automatically stores data locally and syncs when online
 */

import offlineService from './offlineService';
import { API_BASE_URL as ENV_API_URL } from '../config/env';

class OfflineWrapper {
  constructor() {
    this.API_BASE_URL = `${ENV_API_URL}/api`;
    this.isOfflineEnabled = false;
    this.init();
  }

  async init() {
    this.isOfflineEnabled = await offlineService.getSetting('offlineEnabled') || false;
  }

  /**
   * Generic API call wrapper that handles offline mode
   */
  async apiCall(endpoint, options = {}) {
    const url = `${this.API_BASE_URL}${endpoint}`;

    try {
      // If offline mode is disabled, make direct API call
      if (!this.isOfflineEnabled) {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      }

      // If online, try API call first
      if (offlineService.getNetworkStatus().isOnline) {
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();

          // Store successful response locally for offline access
          await this.cacheResponse(endpoint, options.method, result);

          return result;
        } catch (error) {
          console.warn(`API call failed, falling back to offline: ${error.message}`);
          // Fall through to offline handling
        }
      }

      // Handle offline or failed API calls
      return await this.handleOfflineCall(endpoint, options);

    } catch (error) {
      console.error(`API call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cache API response for offline access
   */
  async cacheResponse(endpoint, method, data) {
    if (method === 'GET' && data.success) {
      const storeName = this.getStoreNameFromEndpoint(endpoint);
      if (storeName && Array.isArray(data[storeName])) {
        // Cache all items from the response
        for (const item of data[storeName]) {
          await offlineService.saveOffline(storeName, {
            ...item,
            syncStatus: 'synced',
            lastSynced: new Date().toISOString()
          });
        }
      }
    }
  }

  /**
   * Handle API calls when offline
   */
  async handleOfflineCall(endpoint, options) {
    const method = options.method || 'GET';
    const storeName = this.getStoreNameFromEndpoint(endpoint);

    if (!storeName) {
      throw new Error('Cannot determine store name from endpoint');
    }

    switch (method) {
      case 'GET':
        return await this.handleOfflineGet(storeName, endpoint);

      case 'POST':
        return await this.handleOfflinePost(storeName, options.body, endpoint);

      case 'PUT':
        return await this.handleOfflinePut(storeName, endpoint, options.body);

      case 'DELETE':
        return await this.handleOfflineDelete(storeName, endpoint);

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  /**
   * Handle GET requests offline
   */
  async handleOfflineGet(storeName, endpoint) {
    const allData = await offlineService.getAllOffline(storeName);

    // Remove offline metadata for API response
    const cleanData = allData.map(item => {
      const { offlineCreated, offlineUpdated, offlineTimestamp, syncStatus, lastSynced, ...clean } = item;
      return clean;
    });

    return {
      success: true,
      [storeName]: cleanData
    };
  }

  /**
   * Handle POST requests offline
   */
  async handleOfflinePost(storeName, body, endpoint) {
    const data = JSON.parse(body);

    // Generate temporary ID for offline storage
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await offlineService.saveOffline(storeName, offlineData);

    return {
      success: true,
      [storeName.slice(0, -1)]: offlineData // Remove 's' from store name for single item response
    };
  }

  /**
   * Handle PUT requests offline
   */
  async handleOfflinePut(storeName, endpoint, body) {
    const data = JSON.parse(body);
    const id = this.extractIdFromEndpoint(endpoint);

    if (!id) {
      throw new Error('Cannot extract ID from endpoint');
    }

    const existingData = await offlineService.getOffline(storeName, id);
    if (!existingData) {
      throw new Error('Item not found in offline storage');
    }

    const updatedData = {
      ...existingData,
      ...data,
      id,
      updatedAt: new Date().toISOString()
    };

    await offlineService.updateOffline(storeName, id, updatedData);

    return {
      success: true,
      [storeName.slice(0, -1)]: updatedData
    };
  }

  /**
   * Handle DELETE requests offline
   */
  async handleOfflineDelete(storeName, endpoint) {
    const id = this.extractIdFromEndpoint(endpoint);

    if (!id) {
      throw new Error('Cannot extract ID from endpoint');
    }

    await offlineService.deleteOffline(storeName, id);

    return {
      success: true,
      message: 'Item deleted successfully'
    };
  }

  /**
   * Get store name from API endpoint
   */
  getStoreNameFromEndpoint(endpoint) {
    const pathParts = endpoint.split('/').filter(part => part);

    if (pathParts.length === 0) return null;

    const resource = pathParts[0];

    // Map API endpoints to store names
    const endpointMap = {
      'receipts': 'receipts',
      'vendors': 'vendors',
      'projects': 'projects',
      'estimates': 'estimates',
      'task-templates': 'taskTemplates',
      'followups': 'followUpReminders',
      'followup-templates': 'followUpTemplates',
      'regional-price-packs': 'regionalPricePacks',
      'regional-materials': 'regionalMaterials'
    };

    return endpointMap[resource] || null;
  }

  /**
   * Extract ID from endpoint
   */
  extractIdFromEndpoint(endpoint) {
    const pathParts = endpoint.split('/').filter(part => part);
    return pathParts.length > 1 ? pathParts[1] : null;
  }

  /**
   * Receipt API wrapper
   */
  async getReceipts() {
    return await this.apiCall('/receipts');
  }

  async getReceipt(id) {
    return await this.apiCall(`/receipts/${id}`);
  }

  async createReceipt(data) {
    return await this.apiCall('/receipts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateReceipt(id, data) {
    return await this.apiCall(`/receipts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteReceipt(id) {
    return await this.apiCall(`/receipts/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Vendor API wrapper
   */
  async getVendors() {
    return await this.apiCall('/vendors');
  }

  async getVendor(id) {
    return await this.apiCall(`/vendors/${id}`);
  }

  async createVendor(data) {
    return await this.apiCall('/vendors', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateVendor(id, data) {
    return await this.apiCall(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteVendor(id) {
    return await this.apiCall(`/vendors/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Project API wrapper
   */
  async getProjects() {
    return await this.apiCall('/projects');
  }

  async getProject(id) {
    return await this.apiCall(`/projects/${id}`);
  }

  async createProject(data) {
    return await this.apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProject(id, data) {
    return await this.apiCall(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProject(id) {
    return await this.apiCall(`/projects/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Task Template API wrapper
   */
  async getTaskTemplates() {
    return await this.apiCall('/task-templates');
  }

  async getTaskTemplate(id) {
    return await this.apiCall(`/task-templates/${id}`);
  }

  async createTaskTemplate(data) {
    return await this.apiCall('/task-templates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTaskTemplate(id, data) {
    return await this.apiCall(`/task-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteTaskTemplate(id) {
    return await this.apiCall(`/task-templates/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Regional Pricing API wrapper
   */
  async getRegionalPricePacks() {
    return await this.apiCall('/regional-price-packs');
  }

  async getRegionalMaterials(region, category, search) {
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const queryString = params.toString();
    const endpoint = `/regional-materials${queryString ? `?${queryString}` : ''}`;

    return await this.apiCall(endpoint);
  }

  /**
   * Analytics API wrapper
   */
  async getAnalytics(period = '30days', vendor = 'all', category = 'all') {
    const params = new URLSearchParams({ period, vendor, category });
    return await this.apiCall(`/analytics?${params.toString()}`);
  }

  /**
   * Follow-up API wrapper
   */
  async getFollowUps() {
    return await this.apiCall('/followups');
  }

  async createFollowUp(data) {
    return await this.apiCall('/followups', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateFollowUp(id, data) {
    return await this.apiCall(`/followups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteFollowUp(id) {
    return await this.apiCall(`/followups/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * User Management API wrapper (always online)
   */
  async getUsers() {
    // User management always requires online connection
    const response = await fetch(`${this.API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  async createUser(data) {
    const response = await fetch(`${this.API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Authentication API wrapper (always online)
   */
  async login(email, password) {
    const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Email quote (always online)
   */
  async emailQuote(data) {
    const response = await fetch(`${this.API_BASE_URL}/email-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Enable/disable offline mode
   */
  async setOfflineMode(enabled) {
    this.isOfflineEnabled = enabled;
    await offlineService.setSetting('offlineEnabled', enabled);
  }

  /**
   * Get offline mode status
   */
  isOfflineModeEnabled() {
    return this.isOfflineEnabled;
  }

  /**
   * Get network status
   */
  getNetworkStatus() {
    return offlineService.getNetworkStatus();
  }

  /**
   * Manual sync
   */
  async syncNow() {
    return await offlineService.syncPendingChanges();
  }
}

// Create singleton instance
const offlineWrapper = new OfflineWrapper();

export default offlineWrapper;
