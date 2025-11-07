/**
 * RegionalPricePack Component
 *
 * Provides regional material price suggestions based on selected region.
 * Users can select from predefined regional price packs and get material
 * price suggestions that can be overridden manually.
 *
 * Features:
 * - Regional price pack selection
 * - Material price suggestions by category
 * - Manual price override capability
 * - Integration with existing vendor management
 * - Non-disruptive to receipt parsing
 *
 * @component
 * @example
 * <RegionalPricePack
 *   selectedRegion={selectedRegion}
 *   onRegionChange={handleRegionChange}
 *   onMaterialSelect={handleMaterialSelect}
 *   showSuggestions={showSuggestions}
 * />
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/env';
import {
  MapPin,
  Package,
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  ArrowRight,
  Info,
  TrendingUp,
  Globe
} from 'lucide-react';

const RegionalPricePack = ({
  selectedRegion,
  onRegionChange,
  onMaterialSelect,
  showSuggestions = false,
  currentMaterial = '',
  currentCategory = 'General'
}) => {
  const [pricePacks, setPricePacks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [customPrice, setCustomPrice] = useState('');
  const [showCustomPriceInput, setShowCustomPriceInput] = useState(false);

  // Fetch regional price packs
  useEffect(() => {
    const fetchPricePacks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/regional-price-packs`);
        if (response.ok) {
          const data = await response.json();
          setPricePacks(data);
          if (data.length > 0 && !selectedRegion) {
            // Default to first region if none selected
            onRegionChange(data[0].region);
          }
        }
      } catch (error) {
        console.error('Failed to fetch regional price packs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricePacks();
  }, [selectedRegion, onRegionChange]);

  // Fetch materials for selected region
  useEffect(() => {
    if (selectedRegion) {
      const fetchMaterials = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/regional-materials?region=${selectedRegion}`);
          if (response.ok) {
            const data = await response.json();
            setMaterials(data);
          }
        } catch (error) {
          console.error('Failed to fetch regional materials:', error);
        }
      };

      fetchMaterials();
    }
  }, [selectedRegion]);

  // Filter materials based on search and category
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(materials.map(m => m.category))];

  // Handle material selection
  const handleMaterialClick = (material) => {
    setSelectedMaterial(material);
    setCustomPrice(material.unitPrice.toString());
    setShowCustomPriceInput(true);
  };

  // Handle price override
  const handlePriceOverride = () => {
    if (selectedMaterial && customPrice) {
      const materialWithCustomPrice = {
        ...selectedMaterial,
        unitPrice: parseFloat(customPrice),
        isCustomPrice: true
      };
      onMaterialSelect(materialWithCustomPrice);
      setShowCustomPriceInput(false);
      setSelectedMaterial(null);
    }
  };

  // Handle suggested price selection
  const handleSuggestedPriceSelect = (material) => {
    onMaterialSelect(material);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get selected price pack info
  const selectedPricePack = pricePacks.find(pack => pack.region === selectedRegion);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-600">Loading regional pricing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Regional Material Pricing</h3>
            <p className="text-sm text-slate-600">Get region-specific material price suggestions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">Region:</span>
          <select
            value={selectedRegion || ''}
            onChange={(e) => onRegionChange(e.target.value)}
            className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {pricePacks.map(pack => (
              <option key={pack.id} value={pack.region}>
                {pack.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Region Info */}
      {selectedPricePack && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">{selectedPricePack.name}</h4>
              <p className="text-sm text-blue-700">{selectedPricePack.description}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-blue-600">
                <span className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{materials.length} materials available</span>
                </span>
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Regional pricing active</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((material) => (
          <motion.div
            key={material.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleMaterialClick(material)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {material.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(material.unitPrice)}
                </div>
                <div className="text-xs text-slate-500">
                  {material.unitLabel}
                </div>
              </div>
            </div>

            <h4 className="font-medium text-slate-900 mb-2 line-clamp-2">
              {material.materialName}
            </h4>

            {material.description && (
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {material.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {material.unit} • {material.region}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <span>Select</span>
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No materials found</p>
          <p className="text-sm text-slate-500">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Custom Price Input Modal */}
      <AnimatePresence>
        {showCustomPriceInput && selectedMaterial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Customize Price
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Material
                  </label>
                  <p className="text-slate-900 font-medium">{selectedMaterial.materialName}</p>
                  <p className="text-sm text-slate-600">{selectedMaterial.category}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Suggested Price: {formatCurrency(selectedMaterial.unitPrice)}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter custom price"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Override the suggested regional price
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCustomPriceInput(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePriceOverride}
                  disabled={!customPrice || parseFloat(customPrice) <= 0}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Custom Price
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Suggestions */}
      {showSuggestions && currentMaterial && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <h4 className="font-medium text-green-900 mb-3 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Quick Suggestions for "{currentMaterial}"</span>
          </h4>
          <div className="space-y-2">
            {materials
              .filter(m =>
                m.materialName.toLowerCase().includes(currentMaterial.toLowerCase()) ||
                m.category.toLowerCase().includes(currentCategory.toLowerCase())
              )
              .slice(0, 3)
              .map(material => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors"
                  onClick={() => handleSuggestedPriceSelect(material)}
                >
                  <div>
                    <p className="font-medium text-slate-900">{material.materialName}</p>
                    <p className="text-sm text-slate-600">{material.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(material.unitPrice)}</p>
                    <p className="text-xs text-slate-500">{material.unitLabel}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionalPricePack;
