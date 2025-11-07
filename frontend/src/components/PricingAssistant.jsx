import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/env';

export default function PricingAssistant({ materialName, onPriceSelect, selectedRegion }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch regional pricing suggestions when material name changes
  useEffect(() => {
    if (materialName && materialName.length >= 3 && selectedRegion) {
      fetchRegionalSuggestions();
    }
  }, [materialName, selectedRegion]);

  const fetchRegionalSuggestions = async () => {
    if (!selectedRegion) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/regional-materials/suggestions?region=${selectedRegion}&materialName=${encodeURIComponent(materialName)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setSuggestions({
            regional: data,
            source: 'regional'
          });
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch regional suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = () => {
    if (!materialName || materialName.length < 3) {
      return;
    }

    if (selectedRegion) {
      fetchRegionalSuggestions();
    } else {
      // Fallback to demo data if no region selected
      setLoading(true);
      setTimeout(() => {
        // Demo pricing intelligence (existing logic)
        const demoIntelligence = getDemoIntelligence();
        const materialKey = materialName.toLowerCase().trim();

        if (demoIntelligence[materialKey]) {
          setSuggestions(demoIntelligence[materialKey]);
          setShowSuggestions(true);
        }
        setLoading(false);
      }, 500);
    }
  };

  const getDemoIntelligence = () => {
    return {
      'luxury vinyl plank': {
        average: 4.25,
        min: 3.89,
        max: 4.67,
        trend: 'stable',
        sampleSize: 5,
        vendors: ['Home Depot', "Lowe's"],
        prices: [
          { vendor: { name: 'Home Depot' }, unitPrice: 4.25, unitLabel: 'sqft', lastUpdated: '2025-09-15' },
          { vendor: { name: "Lowe's" }, unitPrice: 4.15, unitLabel: 'sqft', lastUpdated: '2025-09-14' }
        ]
      },
      'vinyl': {
        average: 4.25,
        min: 3.89,
        max: 4.67,
        trend: 'stable',
        sampleSize: 5,
        vendors: ['Home Depot', "Lowe's"],
        prices: [
          { vendor: { name: 'Home Depot' }, unitPrice: 4.25, unitLabel: 'sqft', lastUpdated: '2025-09-15' }
        ]
      },
      'paint': {
        average: 45.99,
        min: 42.99,
        max: 49.99,
        trend: 'increasing',
        sampleSize: 8,
        vendors: ["Lowe's", 'Sherwin Williams'],
        prices: [
          { vendor: { name: "Lowe's" }, unitPrice: 45.99, unitLabel: 'gallon', lastUpdated: '2025-09-14' }
        ]
      },
      'quartz': {
        average: 65.00,
        min: 55.00,
        max: 85.00,
        trend: 'increasing',
        sampleSize: 12,
        vendors: ['Home Depot', "Lowe's", 'Local Supplier'],
        prices: [
          { vendor: { name: 'Local Supplier' }, unitPrice: 65.00, unitLabel: 'sqft', lastUpdated: '2025-09-12' }
        ]
      }
    };

    // Find matching intelligence
    const materialKey = materialName.toLowerCase();
    let matchedData = null;
    const intelligence = getDemoIntelligence();

    for (const [key, data] of Object.entries(intelligence)) {
      if (materialKey.includes(key) || key.includes(materialKey)) {
        matchedData = data;
        break;
      }
    }

    setTimeout(() => {
      if (matchedData) {
        setSuggestions(matchedData);
      } else {
        setSuggestions({
          error: 'No pricing data found',
          materialName,
          noData: true
        });
      }
      setShowSuggestions(true);
      setLoading(false);
    }, 500); // Simulate loading
  };

  const handleSelectPrice = (price) => {
    onPriceSelect(price);
    setShowSuggestions(false);
  };

  if (!showSuggestions) {
    return (
      <button
        type="button"
        onClick={handleGetSuggestions}
        disabled={loading}
        className="text-xs bg-neon-blue hover:bg-blue-500 disabled:bg-gray-600 text-white px-3 py-1 rounded transition-colors duration-200 flex items-center space-x-1"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>💡</span>
            <span>Get Price Intelligence</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="mt-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-neon-blue">Price Intelligence</h4>
        <button
          onClick={() => setShowSuggestions(false)}
          className="text-gray-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>

      {suggestions ? (
        suggestions.noData ? (
          <div className="text-center py-4 text-gray-400">
            <p className="text-sm">No pricing data available for "{suggestions.materialName}"</p>
            <p className="text-xs">Upload receipts with this material to build intelligence</p>
            <button
              onClick={() => window.open('/receipts', '_blank')}
              className="mt-2 text-neon-blue hover:text-blue-400 text-xs underline"
            >
              Upload Receipts →
            </button>
          </div>
        ) : suggestions.source === 'regional' ? (
          // Regional pricing suggestions
          <div className="space-y-3">
            <div className="bg-green-600 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-100 text-xs font-medium">🌍 Regional Pricing</span>
                <span className="text-green-200 text-xs">
                  {suggestions.regional[0]?.pricePack?.name || selectedRegion}
                </span>
              </div>
              <div className="space-y-2">
                {suggestions.regional.slice(0, 3).map((material, index) => (
                  <div key={index} className="flex justify-between items-center bg-green-700 rounded px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-white">{material.materialName}</p>
                      <p className="text-xs text-green-200">{material.category} • {material.unitLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">${material.unitPrice.toFixed(2)}</p>
                      <button
                        onClick={() => handleSelectPrice(material.unitPrice.toFixed(2))}
                        className="bg-white text-green-600 hover:bg-green-100 px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Main Suggestion */}
            <div className="bg-gray-600 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">
                    Suggested: ${suggestions.average?.toFixed(2)} per {suggestions.prices?.[0]?.unitLabel || 'unit'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Based on {suggestions.sampleSize} purchases from {suggestions.vendors?.length || 0} vendors
                  </p>
                </div>
                <button
                  onClick={() => handleSelectPrice(suggestions.average?.toFixed(2))}
                  className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                  Use This Price
                </button>
              </div>
            </div>

            {/* Price Range & Trend */}
            <div className="text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Range: ${suggestions.min?.toFixed(2)} - ${suggestions.max?.toFixed(2)}</span>
                <span className={`${
                  suggestions.trend === 'increasing' ? 'text-red-400' :
                    suggestions.trend === 'decreasing' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {suggestions.trend === 'increasing' ? '📈 Rising' :
                    suggestions.trend === 'decreasing' ? '📉 Falling' : '➡️ Stable'}
                </span>
              </div>
            </div>

            {/* Recent Vendor Prices */}
            {suggestions.prices && suggestions.prices.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-300 mb-2">Recent Purchases:</p>
                <div className="space-y-1">
                  {suggestions.prices.slice(0, 3).map((price, index) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-gray-600 rounded px-2 py-1">
                      <span className="text-gray-300">
                        {price.vendor.name}: ${parseFloat(price.unitPrice).toFixed(2)}/{price.unitLabel}
                        <span className="text-gray-500 ml-1">
                          ({new Date(price.lastUpdated).toLocaleDateString()})
                        </span>
                      </span>
                      <button
                        onClick={() => handleSelectPrice(parseFloat(price.unitPrice).toFixed(2))}
                        className="text-neon-blue hover:text-blue-400 underline"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendor Summary */}
            {suggestions.vendors && suggestions.vendors.length > 0 && (
              <div className="text-xs text-gray-400">
                <span className="font-medium">Vendors:</span> {suggestions.vendors.join(', ')}
              </div>
            )}
          </div>
        )
      ) : null}
    </div>
  );
}
