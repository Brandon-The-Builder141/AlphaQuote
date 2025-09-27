import React, { useState } from 'react';
import { parseReceiptText } from '../utils/receiptParser';

export default function ReceiptParserTest() {
  const [testText, setTestText] = useState(`Lowe's
2x4 Studs 3 @ $4.99
Deck Screws 1 @ $9.00
Subtotal: $23.97`);

  const [parsedResult, setParsedResult] = useState(null);

  const handleParse = () => {
    const result = parseReceiptText(testText);
    setParsedResult(result);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-neon-blue mb-8">Receipt Parser Test</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-neon-blue mb-4">Input Text</h2>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full h-64 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm"
              placeholder="Enter receipt text here..."
            />
            <button
              onClick={handleParse}
              className="mt-4 bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Parse Receipt
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-neon-blue mb-4">Parsed Result</h2>
            {parsedResult ? (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Vendor</h3>
                  <p className="text-neon-blue">{parsedResult.vendor}</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Purchase Date</h3>
                  <p className="text-neon-blue">{parsedResult.purchaseDate}</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Total Amount</h3>
                  <p className="text-neon-blue text-xl">${parsedResult.total}</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Items ({parsedResult.items.length})</h3>
                  {parsedResult.items.length > 0 ? (
                    <div className="space-y-2">
                      {parsedResult.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-600 rounded p-2">
                          <div>
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-gray-300 text-sm">
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
                    <p className="text-gray-400">No items found</p>
                  )}
                </div>

                {parsedResult.confidence && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">Confidence</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-neon-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${parsedResult.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-neon-blue font-semibold">{parsedResult.confidence}%</span>
                    </div>
                  </div>
                )}

                {parsedResult.errors && parsedResult.errors.length > 0 && (
                  <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                    <h3 className="font-semibold text-red-400 mb-2">Errors</h3>
                    {parsedResult.errors.map((error, index) => (
                      <p key={index} className="text-red-300 text-sm">• {error}</p>
                    ))}
                  </div>
                )}

                {parsedResult.warnings && parsedResult.warnings.length > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-400 mb-2">Warnings</h3>
                    {parsedResult.warnings.map((warning, index) => (
                      <p key={index} className="text-yellow-300 text-sm">• {warning}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                Click "Parse Receipt" to see results
              </div>
            )}
          </div>
        </div>

        {/* Example Receipts */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-neon-blue mb-4">Example Receipts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Home Depot Example</h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {`Home Depot
Luxury Vinyl Plank 45 @ $4.25
Underlayment 1 @ $89.99
Transition Strip 2 @ $12.99
Subtotal: $291.22
Tax: $23.30
Total: $314.52`}
              </pre>
              <button
                onClick={() => setTestText(`Home Depot
Luxury Vinyl Plank 45 @ $4.25
Underlayment 1 @ $89.99
Transition Strip 2 @ $12.99
Subtotal: $291.22
Tax: $23.30
Total: $314.52`)}
                className="mt-2 text-neon-blue hover:text-blue-300 text-sm"
              >
                Use this example
              </button>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Lowe's Example</h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {`Lowe's
2x4 Studs 3 @ $4.99
Deck Screws 1 @ $9.00
Wood Glue 2 @ $3.50
Subtotal: $23.97
Tax: $1.92
Total: $25.89`}
              </pre>
              <button
                onClick={() => setTestText(`Lowe's
2x4 Studs 3 @ $4.99
Deck Screws 1 @ $9.00
Wood Glue 2 @ $3.50
Subtotal: $23.97
Tax: $1.92
Total: $25.89`)}
                className="mt-2 text-neon-blue hover:text-blue-300 text-sm"
              >
                Use this example
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


