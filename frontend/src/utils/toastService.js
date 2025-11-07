/**
 * Toast Notification Service
 * Centralized toast notifications using react-hot-toast
 */

import toast from 'react-hot-toast';

// Toast configuration
const toastConfig = {
  success: {
    duration: 3000,
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '12px',
      padding: '16px'
    }
  },
  error: {
    duration: 4000,
    style: {
      background: '#ef4444',
      color: '#fff',
      borderRadius: '12px',
      padding: '16px'
    }
  },
  loading: {
    style: {
      background: '#3b82f6',
      color: '#fff',
      borderRadius: '12px',
      padding: '16px'
    }
  },
  info: {
    duration: 3000,
    style: {
      background: '#6366f1',
      color: '#fff',
      borderRadius: '12px',
      padding: '16px'
    }
  }
};

// Success notifications
export const showSuccess = (message) => {
  toast.success(message, toastConfig.success);
};

// Error notifications
export const showError = (message) => {
  toast.error(message, toastConfig.error);
};

// Info notifications
export const showInfo = (message) => {
  toast(message, toastConfig.info);
};

// Loading notifications (returns toast ID for dismissal)
export const showLoading = (message) => {
  return toast.loading(message, toastConfig.loading);
};

// Dismiss a specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Promise-based toast (useful for async operations)
export const showPromise = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Processing...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong'
    },
    {
      success: toastConfig.success,
      error: toastConfig.error,
      loading: toastConfig.loading
    }
  );
};

// Common error messages
export const errorMessages = {
  network: 'Network error. Please check your connection.',
  server: 'Server error. Please try again later.',
  validation: 'Please check your input and try again.',
  notFound: 'Item not found.',
  unauthorized: 'You are not authorized to perform this action.',
  saveFailed: 'Failed to save. Please try again.',
  deleteFailed: 'Failed to delete. Please try again.',
  updateFailed: 'Failed to update. Please try again.',
  loadFailed: 'Failed to load data. Please try again.'
};

// Common success messages
export const successMessages = {
  saved: 'Successfully saved!',
  deleted: 'Successfully deleted!',
  updated: 'Successfully updated!',
  created: 'Successfully created!',
  sent: 'Successfully sent!',
  copied: 'Copied to clipboard!'
};

// Export default object with all methods
export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  loading: showLoading,
  promise: showPromise,
  dismiss: dismissToast,
  messages: {
    error: errorMessages,
    success: successMessages
  }
};

