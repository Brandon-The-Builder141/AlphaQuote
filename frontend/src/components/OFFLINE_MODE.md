# Offline Mode Documentation

## Overview
The Offline Mode module allows users to access receipts, quotes, and tasks when offline. Changes sync automatically once internet is available.

## Features

### ✅ Core Functionality
- **Local Data Storage**: Uses IndexedDB for offline storage
- **Automatic Sync**: Changes sync when connection is restored
- **Network Detection**: Monitors online/offline status
- **Queue Management**: Tracks pending changes for sync
- **Settings Control**: Optional and modular, enabled via settings

### 🔧 Technical Implementation

#### Components
- `OfflineService` - Core offline storage and sync logic
- `OfflineWrapper` - API wrapper with offline fallback
- `OfflineMode` - UI component for settings and status
- `NetworkStatus` - Status indicator for the app

#### Data Storage
- **Receipts**: Local storage with sync queue
- **Vendors**: Local storage with sync queue  
- **Projects**: Local storage with sync queue
- **Estimates**: Local storage with sync queue
- **Settings**: Offline mode preferences

#### Sync Process
1. **Online**: API calls work normally, data cached locally
2. **Offline**: Operations stored locally, queued for sync
3. **Back Online**: Automatic sync of pending changes
4. **Manual Sync**: User can trigger sync manually

### 📱 User Interface

#### Offline Mode Page (`/offline`)
- Network status display
- Offline data overview
- Sync statistics
- Settings panel
- Manual sync controls

#### Network Status Indicator
- Shows connection status
- Displays pending sync count
- Click for detailed information
- Manual sync button

### 🔌 Integration

#### Existing Modules
- **Receipt Management**: Works offline with local storage
- **Vendor Management**: Works offline with local storage
- **Quote Calculations**: Functions normally offline
- **Task Templates**: Available offline

#### API Integration
- All existing API calls wrapped with offline support
- Automatic fallback to local storage
- Seamless sync when online
- No breaking changes to existing code

### ⚙️ Configuration

#### Enable/Disable
```javascript
// Enable offline mode
await offlineService.setSetting('offlineEnabled', true);

// Check if enabled
const enabled = await offlineService.getSetting('offlineEnabled');
```

#### Network Status
```javascript
// Get current status
const status = offlineWrapper.getNetworkStatus();
// Returns: { isOnline: boolean, syncInProgress: boolean }
```

### 🚀 Usage

#### Access Offline Mode
1. Navigate to `/offline` in the app
2. Toggle "Enable Offline Mode"
3. Configure settings as needed

#### Monitor Status
- Network status indicator in app header
- Offline mode page for detailed view
- Automatic sync notifications

### 🔒 Security & Privacy
- **Local Storage Only**: Data stored in browser
- **No External APIs**: Works completely offline
- **Sync Security**: Uses existing API authentication
- **Data Isolation**: Per-browser storage

### 📊 Performance
- **Fast Access**: Local IndexedDB queries
- **Efficient Sync**: Only changed data synced
- **Minimal Impact**: Optional feature, no overhead when disabled
- **Smart Caching**: Intelligent cache management

### 🛠️ Development

#### Adding Offline Support
```javascript
// Wrap existing API calls
import offlineWrapper from '../services/offlineWrapper';

// Instead of direct fetch
const result = await offlineWrapper.getReceipts();
```

#### Testing Offline Mode
1. Enable offline mode in settings
2. Disconnect internet
3. Test app functionality
4. Reconnect and verify sync

### 🐛 Troubleshooting

#### Common Issues
- **Sync Not Working**: Check network connection
- **Data Missing**: Verify offline mode is enabled
- **Performance Issues**: Clear offline cache if needed

#### Debug Tools
- Browser DevTools → Application → IndexedDB
- Network tab for sync monitoring
- Console logs for sync status

### 🔮 Future Enhancements
- **Conflict Resolution**: Handle simultaneous edits
- **Selective Sync**: Choose what data to sync
- **Offline Analytics**: Track offline usage
- **Background Sync**: Sync in background
- **Data Compression**: Optimize storage usage
