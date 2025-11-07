import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorker } from 'tesseract.js';
import { parseReceiptText } from '../utils/receiptParserEnhanced';
import { motion } from 'framer-motion';
import { showSuccess, showError } from '../utils/toastService';
import { API_BASE_URL } from '../config/env';
import { receiptSchema } from '../schemas';
import {
  ArrowLeft,
  Upload,
  Receipt,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function ReceiptNew() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [showParsedFields, setShowParsedFields] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [ocrWorker, setOcrWorker] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(receiptSchema),
    mode: 'onChange'
  });

  // Watch form values (unused but kept for future use)
  // const watchedValues = watch();

  // Load vendors on component mount
  useEffect(() => {
    loadVendors();
    initializeOCRWorker();

    return () => {
      // Cleanup OCR worker on unmount
      if (ocrWorker) {
        ocrWorker.terminate();
      }
    };
  }, [ocrWorker]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadVendors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors`);
      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const initializeOCRWorker = async () => {
    try {
      const worker = await createWorker('eng');
      setOcrWorker(worker);
    } catch (error) {
      console.error('Error initializing OCR worker:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const parseReceiptWithOCR = async (file) => {
    if (!ocrWorker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      const { data: { text } } = await ocrWorker.recognize(file);

      // Use enhanced parsing logic
      const parsed = parseReceiptText(text);

      return {
        vendorName: parsed.vendor,
        purchaseDate: parsed.purchaseDate || new Date().toISOString().split('T')[0],
        totalAmount: parsed.total.toString(),
        rawText: text,
        items: parsed.items,
        confidence: parsed.confidence,
        errors: parsed.errors,
        warnings: parsed.warnings
      };
    } catch (error) {
      console.error('OCR parsing error:', error);
      throw error;
    }
  };


  // Utility function for date formatting (unused but kept for future use)
  // const formatDateForInput = (dateString) => {
  //   try {
  //     const date = new Date(dateString);
  //     return date.toISOString().split('T')[0];
  //   } catch {
  //     return new Date().toISOString().split('T')[0];
  //   }
  // };

  const onSubmit = async (data) => {
    if (selectedFile && !showParsedFields) {
      // Upload and parse the file
      await handleUploadAndParse(data);
    } else {
      // Save the receipt data
      await handleSaveReceipt(data);
    }
  };

  const handleUploadAndParse = async () => {
    setUploading(true);

    try {
      const parsed = await parseReceiptWithOCR(selectedFile);

      // Update form with parsed data
      setValue('vendorName', parsed.vendorName);
      setValue('purchaseDate', parsed.purchaseDate);
      setValue('totalAmount', parsed.totalAmount);

      setParsedData(parsed);
      setShowParsedFields(true);
      showSuccess('Receipt parsed successfully!');
    } catch (error) {
      console.error('Error parsing receipt:', error);
      showError('Error parsing receipt. Please try again or enter data manually.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveReceipt = async (data) => {
    setLoading(true);

    try {
      // Prepare receipt data
      const receiptData = {
        vendor: data.vendorName,
        purchaseDate: data.purchaseDate,
        total: parseFloat(data.totalAmount),
        items: parsedData?.items || [],
        fileName: selectedFile?.name || 'manual_entry',
        rawText: parsedData?.rawText || '',
        notes: data.notes || ''
      };

      // Save to backend
      const response = await fetch(`${API_BASE_URL}/api/receipts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(receiptData)
      });

      if (!response.ok) {
        throw new Error('Failed to save receipt');
      }

      const result = await response.json();
      // console.log('Receipt saved:', result);

      showSuccess('Receipt saved successfully!');

      // Navigate to receipt list
      navigate('/receipts');
    } catch (error) {
      console.error('Error saving receipt:', error);
      showError('Failed to save receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditParsedData = () => {
    setShowParsedFields(false);
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setParsedData(null);
    setShowParsedFields(false);
    setValue('vendorName', '');
    setValue('purchaseDate', '');
    setValue('totalAmount', '');
    setValue('notes', '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-[0.02] animate-pulse"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      ></div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      <div className="relative max-w-6xl mx-auto p-8">
        {/* Premium Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate('/receipts')}
              className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors duration-300"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body">Back to Receipts</span>
            </motion.button>
            <div className="w-px h-6 bg-slate-700"></div>
            <div>
              <h1 className="text-4xl font-heading text-white flex items-center gap-3">
                <Receipt className="w-10 h-10 text-primary" />
                Upload Receipt
              </h1>
              <p className="text-slate-300 mt-2 font-body">
                Upload a receipt image or PDF for automatic parsing, or enter details manually
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* File Upload Section */}
          {!showParsedFields && (
            <motion.div
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-heading text-white mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6 text-primary" />
                Upload Receipt File
              </h2>

              <div className="mb-6">
                <label htmlFor="receiptFile" className="block text-sm font-medium text-slate-300 font-body mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Receipt File (Image or PDF)
                </label>
                <input
                  type="file"
                  id="receiptFile"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-body"
                />
                {errors.receiptFile && (
                  <p className="text-red-400 text-sm mt-1 font-body">{errors.receiptFile.message}</p>
                )}
              </div>

              {/* File Preview */}
              {filePreview && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-300 mb-3">File Preview</h3>
                  <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                    <img
                      src={filePreview}
                      alt="Receipt preview"
                      className="max-w-full h-auto max-h-64 mx-auto rounded"
                    />
                    <p className="text-sm text-gray-400 mt-2 text-center">
                      {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Receipt Information Form */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-neon-blue mb-4">
              {showParsedFields ? 'Parsed Receipt Information' : 'Receipt Information'}
            </h2>

            {showParsedFields && (
              <div className="mb-6 space-y-3">
                <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 font-medium">
                        ✅ Receipt parsed successfully! Review and edit the information below.
                      </p>
                      {parsedData?.confidence && (
                        <p className="text-sm text-gray-400 mt-1">
                          Parsing Confidence: {parsedData.confidence}%
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleEditParsedData}
                      className="text-green-400 hover:text-green-300 text-sm underline"
                    >
                      Edit Fields
                    </button>
                  </div>
                </div>

                {/* Display warnings if any */}
                {parsedData?.warnings && parsedData.warnings.length > 0 && (
                  <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
                    <p className="text-yellow-400 font-medium mb-2">⚠️ Warnings:</p>
                    <ul className="text-sm text-yellow-300 space-y-1">
                      {parsedData.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Display errors if any */}
                {parsedData?.errors && parsedData.errors.length > 0 && (
                  <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                    <p className="text-red-400 font-medium mb-2">❌ Errors:</p>
                    <ul className="text-sm text-red-300 space-y-1">
                      {parsedData.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Name */}
              <div>
                <label htmlFor="vendorName" className="block text-sm font-medium text-gray-300 mb-2">
                  Vendor Name *
                </label>
                <select
                  id="vendorName"
                  {...register('vendorName')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                >
                  <option value="">Select or enter vendor name</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.name}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                {errors.vendorName && (
                  <p className="text-red-400 text-sm mt-1">{errors.vendorName.message}</p>
                )}
              </div>

              {/* Purchase Date */}
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-300 mb-2">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  {...register('purchaseDate')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                />
                {errors.purchaseDate && (
                  <p className="text-red-400 text-sm mt-1">{errors.purchaseDate.message}</p>
                )}
              </div>

              {/* Total Amount */}
              <div>
                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-300 mb-2">
                  Total Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    id="totalAmount"
                    {...register('totalAmount')}
                    placeholder="0.00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                  />
                </div>
                {errors.totalAmount && (
                  <p className="text-red-400 text-sm mt-1">{errors.totalAmount.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  rows={3}
                  placeholder="Add any additional notes about this receipt..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent resize-none"
                />
                {errors.notes && (
                  <p className="text-red-400 text-sm mt-1">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Parsed Items Preview */}
          {showParsedFields && parsedData?.items && parsedData.items.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-neon-blue mb-4">
                Detected Items ({parsedData.items.length})
              </h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="space-y-2">
                  {parsedData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
                      <div className="flex-1">
                        <span className="text-white">{item.name}</span>
                        {item.quantity > 1 && (
                          <span className="text-gray-400 text-sm ml-2">
                            (Qty: {item.quantity})
                          </span>
                        )}
                      </div>
                      <span className="text-neon-blue font-medium">
                        ${(item.unitPrice * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-neon-blue font-bold text-lg">
                      ${parsedData.items.reduce((sum,  item) => sum + (item.unitPrice * (item.quantity || 1)),
                        0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              type="button"
              onClick={handleStartOver}
              className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-slate-600/50 hover:border-slate-500 flex items-center justify-center gap-2 font-body"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </motion.button>

            <motion.button
              type="submit"
              disabled={loading || uploading || !isValid}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 font-body"
              whileHover={{ scale: (loading || uploading) ? 1 : 1.02 }}
              whileTap={{ scale: (loading || uploading) ? 1 : 0.98 }}
            >
              {loading && (
                <motion.div
                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              )}
              {uploading && (
                <motion.div
                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              )}
              <span>
                {uploading ? 'Parsing Receipt...' :
                  loading ? 'Saving Receipt...' :
                    showParsedFields ? 'Save Receipt' :
                      selectedFile ? 'Upload & Parse' : 'Save Receipt'}
              </span>
            </motion.button>
          </div>

          {/* Help Text */}
          <motion.div
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-lg font-heading text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Tips for Best Results
            </h3>
            <ul className="text-sm text-slate-300 space-y-2 font-body">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Supported formats: JPG, PNG, PDF
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                For best OCR results, ensure the receipt is well-lit and clearly readable
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                You can edit any parsed information before saving
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Manual entry is always available if OCR parsing fails
              </li>
            </ul>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
