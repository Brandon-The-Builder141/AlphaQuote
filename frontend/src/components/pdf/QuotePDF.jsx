/**
 * Quote PDF Component
 * Professional PDF generation using @react-pdf/renderer
 * Replaces html2canvas for better quality and performance
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #14B8A6',
    paddingBottom: 15
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14B8A6',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 3
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 4
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3
  },
  label: {
    fontSize: 11,
    color: '#64748B'
  },
  value: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: 'bold'
  },
  table: {
    marginTop: 10,
    marginBottom: 15
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#14B8A6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottom: '1 solid #E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC'
  },
  tableCell: {
    fontSize: 10,
    color: '#1E293B'
  },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    border: '2 solid #14B8A6'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748B'
  },
  totalValue: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: 'bold'
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #14B8A6'
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B'
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14B8A6'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: '1 solid #E2E8F0',
    paddingTop: 10
  },
  footerText: {
    fontSize: 9,
    color: '#94A3B8'
  },
  notesSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderLeft: '4 solid #F59E0B',
    borderRadius: 4
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 5
  },
  notesText: {
    fontSize: 10,
    color: '#78350F',
    lineHeight: 1.4
  },
  badge: {
    backgroundColor: '#14B8A6',
    color: '#FFFFFF',
    fontSize: 8,
    padding: 3,
    borderRadius: 3,
    marginLeft: 5
  }
});

/**
 * QuotePDF Component
 * Generates a professional PDF for estimates/quotes
 */
export default function QuotePDF({ quoteData }) {
  const {
    projectInfo,
    workItems = [],
    rooms = [],
    markup = 15,
    taxEnabled = false,
    taxRate = 0,
    discount = 0,
    subtotal = '0.00',
    markupAmount = '0.00',
    taxAmount = '0.00',
    total = '0.00',
    notes = '',
    estimateType = 'Estimate'
  } = quoteData;

  // Use workItems if available, otherwise fall back to rooms
  const items = workItems.length > 0 ? workItems : rooms;
  const roomItems = items.filter(item => item.type === 'room' || !item.type);
  const taskItems = items.filter(item => item.type === 'task');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AlphaQuote Professional {estimateType}</Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.subtitle}>
            Version: {process.env.REACT_APP_VERSION || '3.0.0'}
          </Text>
        </View>

        {/* Client Information */}
        {projectInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Client Name:</Text>
              <Text style={styles.value}>{projectInfo.clientName}</Text>
            </View>
            {projectInfo.jobType && (
              <View style={styles.row}>
                <Text style={styles.label}>Job Type:</Text>
                <Text style={styles.value}>{projectInfo.jobType}</Text>
              </View>
            )}
            {projectInfo.email && (
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{projectInfo.email}</Text>
              </View>
            )}
            {projectInfo.phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{projectInfo.phone}</Text>
              </View>
            )}
            {projectInfo.address && (
              <View style={styles.row}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{projectInfo.address}</Text>
              </View>
            )}
          </View>
        )}

        {/* Room-Based Work Items */}
        {roomItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Room Details</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: '40%' }]}>Room/Area</Text>
                <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>Sqft</Text>
                <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>$/Sqft</Text>
                <Text style={[styles.tableHeaderText, { width: '20%', textAlign: 'right' }]}>Total</Text>
              </View>

              {/* Table Rows */}
              {roomItems.map((room, index) => {
                const sqft = room.sqft || 0;
                const materialCost = parseFloat(room.materialCost) || 0;
                const laborHours = parseFloat(room.laborHours) || 0;
                const total = sqft * materialCost + laborHours * 75;

                return (
                  <View
                    key={index}
                    style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                  >
                    <Text style={[styles.tableCell, { width: '40%' }]}>{room.name}</Text>
                    <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>{sqft}</Text>
                    <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>
                      ${materialCost.toFixed(2)}
                    </Text>
                    <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>
                      ${total.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Task-Based Work Items */}
        {taskItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: '50%' }]}>Task Description</Text>
                <Text style={[styles.tableHeaderText, { width: '25%', textAlign: 'right' }]}>Materials</Text>
                <Text style={[styles.tableHeaderText, { width: '25%', textAlign: 'right' }]}>Labor</Text>
              </View>

              {/* Table Rows */}
              {taskItems.map((task, index) => (
                <View
                  key={index}
                  style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                >
                  <View style={{ width: '50%' }}>
                    <Text style={styles.tableCell}>{task.name}</Text>
                    {task.description && (
                      <Text style={[styles.tableCell, { fontSize: 8, color: '#64748B', marginTop: 2 }]}>
                        {task.description}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>
                    ${(parseFloat(task.materialCost) || 0).toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>
                    ${(parseFloat(task.laborCost) || 0).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Cost Summary */}
        <View style={styles.totalSection}>
          <Text style={styles.sectionTitle}>Cost Summary</Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal (Materials + Labor):</Text>
            <Text style={styles.totalValue}>${subtotal}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Markup ({markup}%):</Text>
            <Text style={styles.totalValue}>${markupAmount}</Text>
          </View>

          {taxEnabled && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({taxRate}%):</Text>
              <Text style={styles.totalValue}>${taxAmount}</Text>
            </View>
          )}

          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={[styles.totalValue, { color: '#EF4444' }]}>-${discount}</Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL ESTIMATE:</Text>
            <Text style={styles.grandTotalValue}>${total}</Text>
          </View>
        </View>

        {/* Additional Notes */}
        {notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>📋 Additional Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by AlphaQuote V{process.env.REACT_APP_VERSION || '3.0.0'} - Professional Estimation Software
          </Text>
          <Text style={[styles.footerText, { marginTop: 3 }]}>
            This estimate is valid for 30 days from the date of generation
          </Text>
        </View>
      </Page>
    </Document>
  );
}

