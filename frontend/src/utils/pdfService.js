/**
 * PDF Generation Service
 * Uses @react-pdf/renderer for high-quality PDF generation
 */

import { pdf } from '@react-pdf/renderer';
import QuotePDF from '../components/pdf/QuotePDF';

/**
 * Generate and download PDF from quote data
 * @param {Object} quoteData - Quote data including projectInfo, items, totals
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<void>}
 */
export const generateQuotePDF = async (quoteData, onProgress) => {
  try {
    // Show progress if callback provided
    if (onProgress) onProgress('Generating PDF...');

    // Create PDF document
    const doc = <QuotePDF quoteData={quoteData} />;

    // Generate blob
    const blob = await pdf(doc).toBlob();

    // Create filename
    const clientName = quoteData.projectInfo?.clientName || 'Client';
    const projectName = quoteData.projectInfo?.projectName || 'Estimate';
    const date = new Date().toISOString().split('T')[0];
    const filename = `AlphaQuote_${projectName}_${clientName}_${date}.pdf`;

    // Download the PDF
    downloadBlob(blob, filename);

    if (onProgress) onProgress('Complete!');

    return { success: true, filename };
  } catch (error) {
    console.error('PDF generation failed:', error);
    if (onProgress) onProgress('Failed');
    throw error;
  }
};

/**
 * Generate PDF blob without downloading
 * Useful for previews or server-side generation
 * @param {Object} quoteData - Quote data
 * @returns {Promise<Blob>} PDF blob
 */
export const generateQuotePDFBlob = async (quoteData) => {
  const doc = <QuotePDF quoteData={quoteData} />;
  return await pdf(doc).toBlob();
};

/**
 * Download a blob as a file
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename for download
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Preview PDF in new tab
 * @param {Object} quoteData - Quote data
 */
export const previewQuotePDF = async (quoteData) => {
  try {
    const blob = await generateQuotePDFBlob(quoteData);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('PDF preview failed:', error);
    throw error;
  }
};

export default {
  generateQuotePDF,
  generateQuotePDFBlob,
  previewQuotePDF
};

