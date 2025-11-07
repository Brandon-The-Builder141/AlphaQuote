/**
 * Accounting Export Service
 * Handles exporting quotes, receipts, and job data to accounting software
 * Supports QuickBooks, Housecall Pro, and generic CSV formats
 */

class AccountingExportService {
  constructor() {
    this.supportedFormats = {
      quickbooks: 'QuickBooks',
      housecallpro: 'Housecall Pro',
      csv: 'CSV (Generic)',
      xero: 'Xero'
    };
  }

  /**
   * Export quote data to accounting software
   * @param {Object} quoteData - Quote data from EstimateForm
   * @param {string} format - Export format (quickbooks, housecallpro, csv, xero)
   * @returns {Object} Export result
   */
  async exportQuote(quoteData, format = 'csv') {
    try {
      const mappedData = this.mapQuoteData(quoteData, format);
      const exportResult = await this.generateExport(mappedData, format, 'quote');

      return {
        success: true,
        format,
        data: exportResult,
        filename: this.generateFilename('quote', format),
        message: `Quote exported successfully to ${this.supportedFormats[format]} format`
      };
    } catch (error) {
      console.error('Error exporting quote:', error);
      return {
        success: false,
        error: error.message,
        format
      };
    }
  }

  /**
   * Export receipt data to accounting software
   * @param {Array} receipts - Array of receipt data
   * @param {string} format - Export format
   * @returns {Object} Export result
   */
  async exportReceipts(receipts, format = 'csv') {
    try {
      const mappedData = receipts.map(receipt => this.mapReceiptData(receipt, format));
      const exportResult = await this.generateExport(mappedData, format, 'receipts');

      return {
        success: true,
        format,
        data: exportResult,
        filename: this.generateFilename('receipts', format),
        message: `Receipts exported successfully to ${this.supportedFormats[format]} format`
      };
    } catch (error) {
      console.error('Error exporting receipts:', error);
      return {
        success: false,
        error: error.message,
        format
      };
    }
  }

  /**
   * Export job/project data to accounting software
   * @param {Array} projects - Array of project data
   * @param {string} format - Export format
   * @returns {Object} Export result
   */
  async exportProjects(projects, format = 'csv') {
    try {
      const mappedData = projects.map(project => this.mapProjectData(project, format));
      const exportResult = await this.generateExport(mappedData, format, 'projects');

      return {
        success: true,
        format,
        data: exportResult,
        filename: this.generateFilename('projects', format),
        message: `Projects exported successfully to ${this.supportedFormats[format]} format`
      };
    } catch (error) {
      console.error('Error exporting projects:', error);
      return {
        success: false,
        error: error.message,
        format
      };
    }
  }

  /**
   * Map quote data for specific accounting software
   */
  mapQuoteData(quoteData, format) {
    const baseData = {
      id: quoteData.id || `quote_${Date.now()}`,
      clientName: quoteData.clientName || 'Unknown Client',
      clientEmail: quoteData.clientEmail || '',
      clientPhone: quoteData.clientPhone || '',
      address: quoteData.address || '',
      jobType: quoteData.jobType || 'Construction',
      description: quoteData.description || '',
      createdAt: quoteData.createdAt || new Date().toISOString(),
      subtotal: quoteData.subtotal || 0,
      markup: quoteData.markup || 15,
      total: quoteData.total || 0,
      rooms: quoteData.rooms || [],
      changeOrders: quoteData.changeOrders || []
    };

    switch (format) {
      case 'quickbooks':
        return this.mapForQuickBooks(baseData, 'quote');
      case 'housecallpro':
        return this.mapForHousecallPro(baseData, 'quote');
      case 'xero':
        return this.mapForXero(baseData, 'quote');
      case 'csv':
      default:
        return this.mapForCSV(baseData, 'quote');
    }
  }

  /**
   * Map receipt data for specific accounting software
   */
  mapReceiptData(receipt, format) {
    const baseData = {
      id: receipt.id,
      vendor: receipt.vendor?.name || 'Unknown Vendor',
      vendorContact: receipt.vendor?.contact || '',
      receiptDate: receipt.receiptDate,
      total: receipt.total,
      subtotal: receipt.subtotal,
      tax: receipt.tax,
      category: receipt.category || 'Materials',
      project: receipt.project || '',
      items: receipt.items || [],
      fileName: receipt.fileName || '',
      verified: receipt.verified || false
    };

    switch (format) {
      case 'quickbooks':
        return this.mapForQuickBooks(baseData, 'receipt');
      case 'housecallpro':
        return this.mapForHousecallPro(baseData, 'receipt');
      case 'xero':
        return this.mapForXero(baseData, 'receipt');
      case 'csv':
      default:
        return this.mapForCSV(baseData, 'receipt');
    }
  }

  /**
   * Map project data for specific accounting software
   */
  mapProjectData(project, format) {
    const baseData = {
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      clientPhone: project.clientPhone,
      address: project.address,
      jobType: project.jobType,
      description: project.description,
      timeline: project.timeline,
      budget: project.budget,
      status: project.status,
      createdAt: project.createdAt,
      tasks: project.tasks || [],
      receipts: project.receipts || []
    };

    switch (format) {
      case 'quickbooks':
        return this.mapForQuickBooks(baseData, 'project');
      case 'housecallpro':
        return this.mapForHousecallPro(baseData, 'project');
      case 'xero':
        return this.mapForXero(baseData, 'project');
      case 'csv':
      default:
        return this.mapForCSV(baseData, 'project');
    }
  }

  /**
   * Map data for QuickBooks format
   */
  mapForQuickBooks(data, type) {
    switch (type) {
      case 'quote':
        return {
          'Customer': data.clientName,
          'Email': data.clientEmail,
          'Phone': data.clientPhone,
          'Address': data.address,
          'Job Type': data.jobType,
          'Description': data.description,
          'Quote Date': this.formatDate(data.createdAt),
          'Subtotal': this.formatCurrency(data.subtotal),
          'Markup %': data.markup,
          'Total': this.formatCurrency(data.total),
          'Status': 'Quote',
          'Items': this.formatItemsForQuickBooks(data.rooms, data.changeOrders)
        };

      case 'receipt':
        return {
          'Vendor': data.vendor,
          'Vendor Contact': data.vendorContact,
          'Date': this.formatDate(data.receiptDate),
          'Amount': this.formatCurrency(data.total),
          'Subtotal': this.formatCurrency(data.subtotal),
          'Tax': this.formatCurrency(data.tax),
          'Category': data.category,
          'Project': data.project,
          'Receipt Number': data.id,
          'Items': this.formatReceiptItemsForQuickBooks(data.items)
        };

      case 'project':
        return {
          'Customer': data.clientName,
          'Project Name': data.name,
          'Address': data.address,
          'Job Type': data.jobType,
          'Description': data.description,
          'Start Date': this.formatDate(data.createdAt),
          'Budget': data.budget,
          'Status': data.status,
          'Tasks': this.formatTasksForQuickBooks(data.tasks)
        };
    }
  }

  /**
   * Map data for Housecall Pro format
   */
  mapForHousecallPro(data, type) {
    switch (type) {
      case 'quote':
        return {
          'Customer Name': data.clientName,
          'Customer Email': data.clientEmail,
          'Customer Phone': data.clientPhone,
          'Service Address': data.address,
          'Service Type': data.jobType,
          'Work Description': data.description,
          'Quote Date': this.formatDate(data.createdAt),
          'Estimated Hours': this.calculateEstimatedHours(data.rooms),
          'Labor Cost': this.calculateLaborCost(data.rooms),
          'Material Cost': this.calculateMaterialCost(data.rooms),
          'Total Quote': this.formatCurrency(data.total),
          'Items': this.formatItemsForHousecallPro(data.rooms, data.changeOrders)
        };

      case 'receipt':
        return {
          'Supplier': data.vendor,
          'Purchase Date': this.formatDate(data.receiptDate),
          'Total Amount': this.formatCurrency(data.total),
          'Tax Amount': this.formatCurrency(data.tax),
          'Category': data.category,
          'Job Reference': data.project,
          'Receipt ID': data.id,
          'Items': this.formatReceiptItemsForHousecallPro(data.items)
        };

      case 'project':
        return {
          'Customer': data.clientName,
          'Job Name': data.name,
          'Service Address': data.address,
          'Service Type': data.jobType,
          'Work Description': data.description,
          'Scheduled Date': this.formatDate(data.createdAt),
          'Estimated Budget': data.budget,
          'Job Status': data.status,
          'Tasks': this.formatTasksForHousecallPro(data.tasks)
        };
    }
  }

  /**
   * Map data for Xero format
   */
  mapForXero(data, type) {
    switch (type) {
      case 'quote':
        return {
          'Contact': data.clientName,
          'Email': data.clientEmail,
          'Phone': data.clientPhone,
          'Address': data.address,
          'Description': data.description,
          'Date': this.formatDate(data.createdAt),
          'Sub Total': this.formatCurrency(data.subtotal),
          'Tax': this.formatCurrency(this.calculateTax(data.subtotal)),
          'Total': this.formatCurrency(data.total),
          'Line Items': this.formatItemsForXero(data.rooms, data.changeOrders)
        };

      case 'receipt':
        return {
          'Supplier': data.vendor,
          'Date': this.formatDate(data.receiptDate),
          'Total': this.formatCurrency(data.total),
          'Subtotal': this.formatCurrency(data.subtotal),
          'Tax': this.formatCurrency(data.tax),
          'Description': data.category,
          'Reference': data.project,
          'Line Items': this.formatReceiptItemsForXero(data.items)
        };

      case 'project':
        return {
          'Contact': data.clientName,
          'Project': data.name,
          'Address': data.address,
          'Description': data.description,
          'Date': this.formatDate(data.createdAt),
          'Amount': this.formatCurrency(this.parseBudget(data.budget)),
          'Status': data.status,
          'Tasks': this.formatTasksForXero(data.tasks)
        };
    }
  }

  /**
   * Map data for CSV format
   */
  mapForCSV(data, type) {
    // CSV format is more generic and includes all available fields
    return {
      ...data,
      createdAt: this.formatDate(data.createdAt),
      subtotal: this.formatCurrency(data.subtotal),
      total: this.formatCurrency(data.total),
      tax: this.formatCurrency(data.tax)
    };
  }

  /**
   * Generate export file
   */
  async generateExport(data, format, type) {
    switch (format) {
      case 'csv':
        return this.generateCSV(data, type);
      case 'quickbooks':
      case 'housecallpro':
      case 'xero':
        return this.generateCSV(data, type); // For now, all formats generate CSV
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate CSV content
   */
  generateCSV(data, type) {
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header] || '';
          // Escape CSV values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  /**
   * Download export file
   */
  downloadExport(content, filename, format) {
    const mimeTypes = {
      csv: 'text/csv',
      json: 'application/json',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    const blob = new Blob([content], { type: mimeTypes[format] || 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  /**
   * Helper methods for data formatting
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  }

  formatCurrency(amount) {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  }

  calculateTax(subtotal, rate = 0.08) {
    return parseFloat(subtotal) * rate;
  }

  calculateEstimatedHours(rooms) {
    return rooms.reduce((total, room) => total + (room.laborHours || 0), 0);
  }

  calculateLaborCost(rooms) {
    return rooms.reduce((total, room) => {
      const laborHours = room.laborHours || 0;
      const laborRate = 50; // Default labor rate
      return total + (laborHours * laborRate);
    }, 0);
  }

  calculateMaterialCost(rooms) {
    return rooms.reduce((total, room) => {
      return total + (room.materialCost || 0);
    }, 0);
  }

  parseBudget(budgetString) {
    if (!budgetString) return 0;
    const match = budgetString.match(/\$?([\d,]+)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  }

  formatItemsForQuickBooks(rooms, changeOrders = []) {
    const items = [];

    rooms.forEach(room => {
      items.push(`${room.name}: ${room.material} (${room.sqft} sq ft)`);
    });

    changeOrders.forEach(change => {
      items.push(`Change Order: ${change.name} - ${change.description}`);
    });

    return items.join('; ');
  }

  formatReceiptItemsForQuickBooks(items) {
    return items.map(item =>
      `${item.description} (${item.quantity} ${item.unit}) - ${this.formatCurrency(item.totalPrice)}`
    ).join('; ');
  }

  formatTasksForQuickBooks(tasks) {
    return tasks.map(task =>
      `${task.name}: ${task.status} - ${this.formatCurrency(task.estimatedCost)}`
    ).join('; ');
  }

  formatItemsForHousecallPro(rooms, changeOrders = []) {
    const items = [];

    rooms.forEach(room => {
      items.push(`${room.name}: ${room.material} - ${room.sqft} sq ft`);
    });

    changeOrders.forEach(change => {
      items.push(`${change.name}: ${change.description}`);
    });

    return items.join(', ');
  }

  formatReceiptItemsForHousecallPro(items) {
    return items.map(item =>
      `${item.description} - ${item.quantity} ${item.unit}`
    ).join(', ');
  }

  formatTasksForHousecallPro(tasks) {
    return tasks.map(task =>
      `${task.name} (${task.status})`
    ).join(', ');
  }

  formatItemsForXero(rooms, changeOrders = []) {
    const items = [];

    rooms.forEach(room => {
      items.push(`${room.name}: ${room.material}`);
    });

    changeOrders.forEach(change => {
      items.push(`${change.name}`);
    });

    return items.join('; ');
  }

  formatReceiptItemsForXero(items) {
    return items.map(item =>
      `${item.description} - ${this.formatCurrency(item.unitPrice)}`
    ).join('; ');
  }

  formatTasksForXero(tasks) {
    return tasks.map(task =>
      `${task.name}: ${this.formatCurrency(task.estimatedCost)}`
    ).join('; ');
  }

  generateFilename(type, format) {
    const timestamp = new Date().toISOString().split('T')[0];
    return `alphaquote_${type}_${timestamp}.${format === 'csv' ? 'csv' : 'csv'}`;
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats() {
    return this.supportedFormats;
  }

  /**
   * Validate export data
   */
  validateExportData(data, type) {
    if (!data) {
      throw new Error('No data provided for export');
    }

    if (Array.isArray(data) && data.length === 0) {
      throw new Error('No data items to export');
    }

    return true;
  }
}

// Create singleton instance
const accountingExportService = new AccountingExportService();

export default accountingExportService;
