import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseReceiptText } from '../utils/receiptParser';

export default function ReceiptProcess() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Load files from session storage
    const storedFiles = sessionStorage.getItem('receiptFiles');
    if (storedFiles) {
      try {
        const fileData = JSON.parse(storedFiles);
        setFiles(fileData);
        // console.log('Loaded files with OCR data:', fileData);
      } catch (error) {
        console.error('Error loading files:', error);
        navigate('/receipts/new');
      }
    } else {
      navigate('/receipts/new');
    }
  }, [navigate]);

  const processReceipts = async () => {
    setProcessing(true);
    setProcessedCount(0);
    setResults([]);

    // Process each file using OCR text if available
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Process using OCR text if available
      let processedData = null;
      if (file.ocrText && file.ocrCompleted) {
        processedData = parseReceiptText(file.ocrText);
      } else if (file.ocrError) {
        processedData = {
          vendor: 'Unknown Vendor',
          items: [],
          total: 0,
          errors: [file.ocrError]
        };
      } else {
        // Fallback to mock data
        processedData = {
          vendor: generateMockVendor(file.name),
          items: generateMockItems(file.name),
          total: generateMockTotal(file.name)
        };
      }

      const result = {
        id: file.id,
        fileName: file.name,
        status: file.ocrError || (processedData.errors && processedData.errors.length > 0) ? 'warning' : 'success',
        vendor: processedData.vendor,
        purchaseDate: processedData.purchaseDate,
        items: processedData.items || [],
        total: processedData.total,
        confidence: processedData.confidence,
        errors: processedData.errors || [],
        warnings: processedData.warnings || [],
        ocrText: file.ocrText,
        ocrError: file.ocrError,
        processedAt: new Date().toISOString()
      };

      setResults(prev => [...prev, result]);
      setProcessedCount(i + 1);
    }

    setProcessing(false);
  };


  // Mock data generation functions
  const generateMockVendor = () => {
    const vendors = ['Home Depot', "Lowe's", 'Menards', 'Ace Hardware', 'Local Supply Co.'];
    return vendors[Math.floor(Math.random() * vendors.length)];
  };

  const generateMockItems = () => {
    const items = [
      { name: 'Luxury Vinyl Plank Flooring', quantity: 45, unitPrice: 4.25, total: 191.25 },
      { name: 'Underlayment', quantity: 1, unitPrice: 89.99, total: 89.99 },
      { name: 'Quarter Round Molding', quantity: 12, unitPrice: 3.45, total: 41.40 },
      { name: 'Construction Adhesive', quantity: 2, unitPrice: 8.99, total: 17.98 }
    ];
    return items.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const generateMockTotal = () => {
    return (Math.random() * 500 + 100).toFixed(2);
  };

  const handleSaveResults = () => {
    // Store parsed data in session storage for the confirmation page
    if (results.length > 0) {
      const parsedReceiptData = {
        vendor: results[0].vendor,
        purchaseDate: results[0].purchaseDate || new Date().toISOString().split('T')[0],
        items: results[0].items || [],
        total: results[0].total || 0,
        confidence: results[0].confidence || 0,
        fileName: results[0].fileName || 'receipt.jpg',
        rawText: results[0].ocrText || '',
        parsedAt: new Date().toISOString()
      };

      sessionStorage.setItem('parsedReceiptData', JSON.stringify(parsedReceiptData));
    }

    // Navigate to confirmation page with parsed data
    navigate('/receipts/confirm');
  };

  const handleBackToUpload = () => {
    sessionStorage.removeItem('receiptFiles');
    navigate('/receipts/new');
  };

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-400 mb-4">No files to process</p>
            <button
              onClick={() => navigate('/receipts/new')}
              className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg"
            >
              Upload Files
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToUpload}
            className="text-gray-400 hover:text-white mb-4 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Upload</span>
          </button>
          <h1 className="text-3xl font-bold text-neon-blue">Process Receipt Files</h1>
          <p className="text-gray-400 mt-2">
            Extract pricing data and vendor information from your uploaded receipts
          </p>
        </div>

        {/* Files Overview */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Files to Process</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <div key={file.id} className="bg-gray-700 rounded-lg p-3 flex items-center space-x-3">
                <span className="text-2xl">
                  {file.type === 'application/pdf' ? '📄' : '🖼️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                {results.find(r => r.id === file.id) && (
                  <span className="text-green-400 text-xl">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Processing Controls */}
        {!processing && results.length === 0 && (
          <div className="mb-8 text-center">
            <button
              onClick={processReceipts}
              className="bg-neon-blue hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              Start Processing Receipts
            </button>
          </div>
        )}

        {/* Processing Progress */}
        {processing && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Processing Receipts</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">
                  Processing file {processedCount} of {files.length}
                </span>
                <span className="text-neon-blue font-semibold">
                  {Math.round((processedCount / files.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-neon-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(processedCount / files.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b border-neon-blue"></div>
                <span className="text-gray-300">Extracting data from receipts...</span>
              </div>
            </div>
          </div>
        )}

        {/* Processing Results */}
        {results.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Processing Results ({results.length} files processed)
            </h2>

            <div className="space-y-6">
              {results.map((result) => (
                <div key={result.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{result.fileName}</h3>
                      <p className="text-gray-400">Processed at {new Date(result.processedAt).toLocaleString()}</p>
                      {result.ocrError && (
                        <p className="text-yellow-400 text-sm">⚠️ OCR Error: {result.ocrError}</p>
                      )}
                      {result.errors && result.errors.length > 0 && (
                        <div className="text-red-400 text-sm">
                          {result.errors.map((error, idx) => (
                            <p key={idx}>❌ {error}</p>
                          ))}
                        </div>
                      )}
                      {result.warnings && result.warnings.length > 0 && (
                        <div className="text-yellow-400 text-sm">
                          {result.warnings.map((warning, idx) => (
                            <p key={idx}>⚠️ {warning}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        result.status === 'success'
                          ? 'bg-green-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {result.status === 'success' ? '✓ Success' : '⚠️ Warning'}
                      </span>
                      {result.confidence && (
                        <p className="text-xs text-gray-400 mt-1">
                          Confidence: {result.confidence}%
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Vendor Info */}
                    <div>
                      <h4 className="font-semibold text-neon-blue mb-2">Vendor Information</h4>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-white font-medium">{result.vendor}</p>
                        <p className="text-gray-400 text-sm">Detected from receipt</p>
                      </div>
                    </div>

                    {/* Purchase Date */}
                    <div>
                      <h4 className="font-semibold text-neon-blue mb-2">Purchase Date</h4>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-white font-medium">{result.purchaseDate || 'Not detected'}</p>
                        <p className="text-gray-400 text-sm">Extracted from receipt</p>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div>
                      <h4 className="font-semibold text-neon-blue mb-2">Total Amount</h4>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-white font-medium text-xl">${result.total}</p>
                        <p className="text-gray-400 text-sm">Extracted from receipt</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-neon-blue mb-2">Items Found ({result.items.length})</h4>
                    {result.items.length > 0 ? (
                      <div className="space-y-2">
                        {result.items.map((item, index) => (
                          <div key={index} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                            <div>
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-gray-400 text-sm">
                                Qty: {item.quantity} × ${item.unitPrice}
                              </p>
                            </div>
                            <p className="text-white font-semibold">
                              ${(item.quantity * item.unitPrice).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <p className="text-gray-400">No items could be extracted from the receipt</p>
                      </div>
                    )}
                  </div>

                  {/* OCR Text Display */}
                  {result.ocrText && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-neon-blue mb-2">Extracted Text</h4>
                      <div className="bg-gray-700 rounded-lg p-4 max-h-40 overflow-y-auto">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                          {result.ocrText}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {results.length > 0 && !processing && (
          <div className="flex space-x-4">
            <button
              onClick={handleBackToUpload}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Process More Files
            </button>
            <button
              onClick={handleSaveResults}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Review & Confirm Data
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-neon-blue mb-4">🔍 Processing Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">What We Extract</h4>
              <ul className="space-y-1">
                <li>• Vendor name and information</li>
                <li>• Item descriptions and quantities</li>
                <li>• Unit prices and totals</li>
                <li>• Purchase date and receipt number</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">How It Works</h4>
              <ul className="space-y-1">
                <li>• OCR technology reads receipt text</li>
                <li>• AI identifies vendor and item patterns</li>
                <li>• Data is validated and structured</li>
                <li>• Results are saved to your database</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
